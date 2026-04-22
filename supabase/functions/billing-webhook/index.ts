import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, jsonResponse, errorResponse, handleError, requireEnv } from '../_shared/utils.ts';
import { createSupabaseClient, BillingDatabase } from '../_shared/database.ts';

function getStripeSignature(req: Request): string | null {
  return req.headers.get('stripe-signature');
}

async function verifyStripeSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  const elements = signature.split(',').map((part) => part.trim());
  const timestampEntry = elements.find((entry) => entry.startsWith('t='));
  const signatureEntry = elements.find((entry) => entry.startsWith('v1='));
  if (!timestampEntry || !signatureEntry) {
    return false;
  }

  const timestamp = timestampEntry.slice(2);
  const providedSignature = signatureEntry.slice(3);
  const payloadToSign = `${timestamp}.${rawBody}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadToSign));
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return expected === providedSignature;
}

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');
    const signature = getStripeSignature(req);
    if (!signature) {
      return errorResponse('Missing webhook signature', 401);
    }

    const rawBody = await req.text();
    const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return errorResponse('Invalid signature', 401);
    }

    const event = JSON.parse(rawBody) as Record<string, any>;
    const eventName = event.type as string;
    const eventId = event.id as string;
    const eventHash = await sha256(rawBody);

    const supabase = createSupabaseClient();
    const db = new BillingDatabase(supabase);

    const exists = await db.checkWebhookEventExists(eventHash);
    if (exists) {
      return jsonResponse({ message: 'Event already processed' }, 200);
    }

    const webhookEvent = await db.createWebhookEvent({
      provider: 'stripe',
      event_name: eventName,
      event_id: eventId,
      event_hash: eventHash,
      processed: false,
      raw_payload: event as unknown as Record<string, unknown>,
    });

    try {
      switch (eventName) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(db, event.data.object);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(db, event.data.object);
          break;
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(db, event.data.object);
          break;
        default:
          break;
      }

      await db.markWebhookProcessed(webhookEvent.id, true);
      return jsonResponse({ message: 'Webhook processed successfully', event_name: eventName }, 200);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await db.markWebhookProcessed(webhookEvent.id, false, errorMessage);
      throw error;
    }

  } catch (error) {
    return handleError(error);
  }
});

async function handleCheckoutSessionCompleted(db: BillingDatabase, session: Record<string, any>) {
  const metadata = (session.metadata || {}) as Record<string, string>;
  const planKey = metadata.plan_key;
  const guildId = metadata.guild_id;
  const discordUserId = metadata.discord_user_id || metadata.user_id;
  const mode = session.mode;

  if (!planKey || !discordUserId || (planKey !== 'donate' && !guildId)) {
    throw new Error('Missing metadata in checkout.session.completed');
  }

  const amount = Number(session.amount_total || 0);
  const currency = String(session.currency || 'usd').toUpperCase();
  await db.upsertUser({ discord_user_id: discordUserId, username: 'Unknown' });

  if (planKey === 'donate') {
    await db.createDonation({
      provider: 'stripe',
      provider_order_id: session.payment_intent || session.id,
      discord_user_id: discordUserId,
      amount,
      currency,
      status: 'completed',
      message: null,
      raw_payload: session,
    });
    return;
  }
  
  await db.createGuildSubscription({
    guild_id: guildId,
    discord_user_id: discordUserId,
    provider: 'stripe',
    provider_customer_id: session.customer || null,
    provider_subscription_id: mode === 'subscription' ? (session.subscription || null) : null,
    provider_order_id: session.payment_intent || session.id,
    plan_key: planKey,
    billing_type: mode === 'subscription' ? 'subscription' : 'one_time',
    status: 'active',
    premium_enabled: true,
    cancel_at_period_end: false,
    renews_at: null,
    ends_at: null,
    lifetime: planKey === 'lifetime',
    is_founding_member: metadata.founding_member_eligible === 'true',
  });

  await db.createPurchase({
    provider: 'stripe',
    provider_order_id: session.payment_intent || session.id,
    provider_product_id: null,
    provider_variant_id: session.mode,
    discord_user_id: discordUserId,
    guild_id: guildId,
    plan_key: planKey,
    kind: planKey === 'lifetime' ? 'lifetime' : 'subscription_payment',
    amount,
    currency,
    status: 'completed',
    raw_payload: session,
  });
}

async function handleSubscriptionDeleted(db: BillingDatabase, subscriptionEvent: Record<string, any>) {
  const providerSubscriptionId = String(subscriptionEvent.id || '');
  if (!providerSubscriptionId) {
    throw new Error('Missing subscription id');
  }

  const subscription = await db.getGuildSubscriptionByProvider(providerSubscriptionId);
  if (!subscription) {
    return;
  }

  await db.updateGuildSubscription(subscription.id, {
    status: 'expired',
    premium_enabled: false,
    ends_at: new Date().toISOString(),
  });
}

async function handleInvoicePaymentFailed(db: BillingDatabase, invoiceEvent: Record<string, any>) {
  const providerSubscriptionId = String(invoiceEvent.subscription || '');
  if (!providerSubscriptionId) {
    return;
  }

  const subscription = await db.getGuildSubscriptionByProvider(providerSubscriptionId);
  if (!subscription) {
    return;
  }

  await db.updateGuildSubscription(subscription.id, {
    status: 'past_due',
    premium_enabled: true,
  });
}
