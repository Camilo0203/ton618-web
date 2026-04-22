import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, jsonResponse, errorResponse, handleError, requireEnv } from '../_shared/utils.ts';
import { createSupabaseClient, BillingDatabase } from '../_shared/database.ts';

async function verifyWhopSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const idx = part.indexOf('=');
      return [part.slice(0, idx).trim(), part.slice(idx + 1).trim()];
    })
  );

  const timestamp = parts['ts'];
  const providedSignature = parts['v1'];
  if (!timestamp || !providedSignature) return false;

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
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function mapWhopPlanToPlanKey(planId: string): 'pro_monthly' | 'pro_yearly' | 'lifetime' {
  const planMap: Record<string, 'pro_monthly' | 'pro_yearly' | 'lifetime'> = {
    plan_yI6fFUFSaIMf5: 'pro_monthly',
    plan_8SKj3v4lL6XEF: 'pro_yearly',
    plan_nuXvSWVBzZHWf: 'lifetime',
  };
  return planMap[planId] ?? 'pro_monthly';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const webhookSecret = requireEnv('WHOP_WEBHOOK_SECRET');

    const signatureHeader = req.headers.get('whop-signature');
    if (!signatureHeader) {
      return errorResponse('Missing whop-signature header', 401);
    }

    const rawBody = await req.text();

    const isValid = await verifyWhopSignature(rawBody, signatureHeader, webhookSecret);
    if (!isValid) {
      return errorResponse('Invalid signature', 401);
    }

    const event = JSON.parse(rawBody) as Record<string, unknown>;
    const eventType = String(event.action ?? '');
    const eventId = String((event as Record<string, Record<string, unknown>>).data?.id ?? crypto.randomUUID());
    const eventHash = await sha256(rawBody);

    const supabase = createSupabaseClient();
    const db = new BillingDatabase(supabase);

    const exists = await db.checkWebhookEventExists(eventHash);
    if (exists) {
      return jsonResponse({ message: 'Event already processed' }, 200);
    }

    const webhookEvent = await db.createWebhookEvent({
      provider: 'whop',
      event_name: eventType,
      event_id: eventId,
      event_hash: eventHash,
      processed: false,
      raw_payload: event as Record<string, unknown>,
    });

    try {
      switch (eventType) {
        case 'membership.went_active':
          await handleMembershipWentActive(db, event);
          break;
        case 'membership.went_inactive':
          await handleMembershipWentInactive(db, event);
          break;
        default:
          break;
      }

      await db.markWebhookProcessed(webhookEvent.id, true);
      return jsonResponse({ message: 'Webhook processed', event_type: eventType }, 200);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await db.markWebhookProcessed(webhookEvent.id, false, errorMessage);
      throw error;
    }

  } catch (error) {
    return handleError(error);
  }
});

async function handleMembershipWentActive(db: BillingDatabase, event: Record<string, unknown>) {
  const data = (event.data ?? {}) as Record<string, unknown>;

  const membershipId = String(data.id ?? '');
  const planId = String((data.plan_id ?? data.access_pass_id) ?? '');
  const discordUserId = String(
    ((data.metadata as Record<string, unknown> | null)?.discord_user_id) ?? ''
  );
  const guildId = String(data.pass_guild_id ?? '');

  if (!guildId) {
    throw new Error(`[whop-webhook] membership.went_active missing pass_guild_id — membershipId=${membershipId}`);
  }

  const planKey = mapWhopPlanToPlanKey(planId);
  const isLifetime = planKey === 'lifetime';
  const billingType = isLifetime ? 'one_time' : 'subscription';

  const renewsAt = isLifetime
    ? null
    : String((data.renewal_period_end ?? data.expires_at) ?? '').trim() || null;

  const effectiveDiscordUserId = discordUserId || 'whop_unknown';
  await db.upsertUser({ discord_user_id: effectiveDiscordUserId, username: 'Whop User' });

  await db.createGuildSubscription({
    guild_id: guildId,
    discord_user_id: effectiveDiscordUserId,
    provider: 'whop',
    provider_customer_id: String(data.user_id ?? '') || null,
    provider_subscription_id: billingType === 'subscription' ? membershipId : null,
    provider_order_id: membershipId,
    plan_key: planKey,
    billing_type: billingType,
    status: 'active',
    premium_enabled: true,
    cancel_at_period_end: false,
    renews_at: renewsAt,
    ends_at: null,
    lifetime: isLifetime,
    is_founding_member: false,
  });

  await db.createPurchase({
    provider: 'whop',
    provider_order_id: membershipId,
    provider_product_id: planId,
    provider_variant_id: planId,
    discord_user_id: effectiveDiscordUserId,
    guild_id: guildId,
    plan_key: planKey,
    kind: isLifetime ? 'lifetime' : 'subscription_payment',
    amount: 0,
    currency: 'USD',
    status: 'completed',
    raw_payload: event as Record<string, unknown>,
  });
}

async function handleMembershipWentInactive(db: BillingDatabase, event: Record<string, unknown>) {
  const data = (event.data ?? {}) as Record<string, unknown>;
  const membershipId = String(data.id ?? '');

  if (!membershipId) {
    throw new Error('[whop-webhook] membership.went_inactive missing membership id');
  }

  const subscription = await db.getGuildSubscriptionByProvider(membershipId);
  if (!subscription) {
    console.warn(`[whop-webhook] No subscription found for membershipId=${membershipId} — skipping`);
    return;
  }

  if (subscription.lifetime) {
    console.warn(`[whop-webhook] Ignoring went_inactive for lifetime subscription id=${subscription.id}`);
    return;
  }

  await db.updateGuildSubscription(subscription.id, {
    status: 'expired',
    premium_enabled: false,
    ends_at: new Date().toISOString(),
  });
}
