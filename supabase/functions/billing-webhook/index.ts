// Lemon Squeezy Webhook Handler
// Handles all payment events with idempotency and proper business logic

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, jsonResponse, errorResponse, handleError, requireEnv, validateProviderId, isValidCurrency, isValidDiscordId } from '../_shared/utils.ts';
import { 
  verifyLemonSqueezySignature, 
  generateEventHash,
  parseLemonSqueezyEvent,
  extractCustomData,
  isPremiumPlan,
  isLifetimePlan,
  isDonationPlan,
  getBillingType,
  mapSubscriptionStatus,
  calculateRenewalDate,
} from '../_shared/lemon.ts';
import { createSupabaseClient, BillingDatabase } from '../_shared/database.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Get webhook secret
    const webhookSecret = requireEnv('LEMON_SQUEEZY_WEBHOOK_SECRET');
    
    // Get signature
    const signature = req.headers.get('x-signature');
    if (!signature) {
      return errorResponse('Missing webhook signature', 401);
    }

    // Read raw body
    const rawBody = await req.text();
    
    // Verify signature
    const isValid = await verifyLemonSqueezySignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return errorResponse('Invalid signature', 401);
    }

    // Parse event
    const event = parseLemonSqueezyEvent(rawBody);
    const eventName = event.meta.event_name;
    
    console.log(`Processing webhook: ${eventName}`, { event_id: event.data.id });

    // Generate event hash for idempotency
    const eventHash = await generateEventHash(rawBody);
    
    // Initialize database
    const supabase = createSupabaseClient();
    const db = new BillingDatabase(supabase);

    // Check if event already processed (idempotency)
    const exists = await db.checkWebhookEventExists(eventHash);
    if (exists) {
      console.log('Event already processed (duplicate)', { event_hash: eventHash });
      return jsonResponse({ message: 'Event already processed' }, 200);
    }

    // Create webhook event record
    const webhookEvent = await db.createWebhookEvent({
      provider: 'lemon_squeezy',
      event_name: eventName,
      event_id: event.data.id,
      event_hash: eventHash,
      processed: false,
      raw_payload: event as unknown as Record<string, unknown>,
    });

    try {
      // Route to appropriate handler
      switch (eventName) {
        case 'subscription_created':
          await handleSubscriptionCreated(db, event);
          break;
        
        case 'subscription_updated':
          await handleSubscriptionUpdated(db, event);
          break;
        
        case 'subscription_cancelled':
          await handleSubscriptionCancelled(db, event);
          break;
        
        case 'subscription_resumed':
          await handleSubscriptionResumed(db, event);
          break;
        
        case 'subscription_expired':
          await handleSubscriptionExpired(db, event);
          break;
        
        case 'subscription_paused':
          await handleSubscriptionPaused(db, event);
          break;
        
        case 'subscription_unpaused':
          await handleSubscriptionUnpaused(db, event);
          break;
        
        case 'subscription_payment_success':
          await handleSubscriptionPaymentSuccess(db, event);
          break;
        
        case 'subscription_payment_failed':
          await handleSubscriptionPaymentFailed(db, event);
          break;
        
        case 'subscription_payment_recovered':
          await handleSubscriptionPaymentRecovered(db, event);
          break;
        
        case 'order_created':
          await handleOrderCreated(db, event);
          break;
        
        case 'order_refunded':
          await handleOrderRefunded(db, event);
          break;
        
        default:
          console.log(`Unhandled event type: ${eventName}`);
      }

      // Mark as processed
      await db.markWebhookProcessed(webhookEvent.id, true);
      
      return jsonResponse({ 
        message: 'Webhook processed successfully',
        event_name: eventName,
      }, 200);

    } catch (error) {
      console.error('Error processing webhook:', error);
      console.error('Webhook event details:', {
        event_name: eventName,
        event_id: event.data.id,
        custom_data: event.meta.custom_data,
      });
      
      // Mark as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await db.markWebhookProcessed(webhookEvent.id, false, errorMessage);
      
      throw error;
    }

  } catch (error) {
    return handleError(error);
  }
});

// ============================================
// EVENT HANDLERS
// ============================================

async function handleSubscriptionCreated(db: BillingDatabase, event: any) {
  const customData = extractCustomData(event);
  const attrs = event.data.attributes;
  
  // Validate required custom data with specific error messages
  const missingFields: string[] = [];
  if (!customData.discord_user_id) missingFields.push('discord_user_id');
  if (!customData.guild_id) missingFields.push('guild_id');
  if (!customData.plan_key) missingFields.push('plan_key');
  
  if (missingFields.length > 0) {
    const errorMsg = `Missing required custom data in subscription_created: ${missingFields.join(', ')}`;
    console.error(errorMsg, { event_id: event.data.id, custom_data: customData });
    throw new Error(errorMsg);
  }

  // Validate Discord IDs format
  if (!isValidDiscordId(customData.discord_user_id)) {
    throw new Error(`Invalid discord_user_id format: ${customData.discord_user_id}`);
  }
  if (!isValidDiscordId(customData.guild_id)) {
    throw new Error(`Invalid guild_id format: ${customData.guild_id}`);
  }

  // Validate plan_key
  if (!isPremiumPlan(customData.plan_key)) {
    throw new Error(`Invalid plan_key for subscription: ${customData.plan_key}`);
  }

  // Validate provider IDs
  const providerCustomerId = validateProviderId(attrs.customer_id, 'customer_id');
  const providerSubscriptionId = validateProviderId(event.data.id, 'subscription_id');
  const providerOrderId = validateProviderId(attrs.order_id, 'order_id');
  const providerProductId = validateProviderId(attrs.product_id, 'product_id');
  const providerVariantId = validateProviderId(attrs.variant_id, 'variant_id');

  // Ensure user exists
  await db.upsertUser({
    discord_user_id: customData.discord_user_id,
    username: 'Unknown', // Will be updated on next login
  });

  // Create guild subscription
  const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;
  const mappedStatus = mapSubscriptionStatus(attrs.status);
  
  await db.createGuildSubscription({
    guild_id: customData.guild_id,
    discord_user_id: customData.discord_user_id,
    provider: 'lemon_squeezy',
    provider_customer_id: providerCustomerId,
    provider_subscription_id: providerSubscriptionId,
    plan_key: customData.plan_key,
    billing_type: 'subscription',
    status: mappedStatus,
    premium_enabled: mappedStatus === 'active',
    cancel_at_period_end: false,
    renews_at: renewsAt?.toISOString() || null,
    ends_at: null,
    lifetime: false,
  });

  console.log(JSON.stringify({
    level: 'info',
    event: 'subscription_created',
    guild_id: customData.guild_id,
    discord_user_id: customData.discord_user_id,
    plan_key: customData.plan_key,
    status: mappedStatus,
    subscription_id: providerSubscriptionId,
    message: '✅ Subscription activated',
  }));
}

async function handleSubscriptionUpdated(db: BillingDatabase, event: any) {
  const attrs = event.data.attributes;
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;
  const endsAt = attrs.ends_at ? new Date(attrs.ends_at) : null;
  const mappedStatus = mapSubscriptionStatus(attrs.status as string);
  // premium stays active for active/cancelled-but-in-period/past_due; off for paused/expired
  const premiumEnabled = ['active', 'cancelled', 'past_due'].includes(mappedStatus);

  await db.updateGuildSubscription(subscription.id, {
    status: mappedStatus,
    premium_enabled: premiumEnabled,
    renews_at: renewsAt?.toISOString() || null,
    ends_at: endsAt?.toISOString() || null,
    cancel_at_period_end: (attrs.cancelled as boolean) || false,
  });

  console.log(JSON.stringify({
    level: 'info',
    event: 'subscription_updated',
    subscription_id: event.data.id,
    guild_id: subscription.guild_id,
    status: mappedStatus,
    premium_enabled: premiumEnabled,
    renews_at: attrs.renews_at || null,
    cancel_at_period_end: attrs.cancelled || false,
  }));
}

async function handleSubscriptionCancelled(db: BillingDatabase, event: any) {
  const attrs = event.data.attributes;
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  // Don't disable premium immediately - let it run until period end
  const endsAt = attrs.ends_at || attrs.renews_at;
  
  if (!endsAt) {
    console.warn(`⚠️  Subscription cancelled without ends_at/renews_at: ${event.data.id}. Using current date as fallback.`);
  }
  
  await db.cancelGuildSubscription(
    subscription.id,
    endsAt ? new Date(endsAt).toISOString() : new Date().toISOString()
  );

  console.log(`⚠️ Subscription cancelled: ${event.data.id}`, {
    ends_at: endsAt || 'immediate',
    guild_id: subscription.guild_id,
  });
}

async function handleSubscriptionResumed(db: BillingDatabase, event: any) {
  const attrs = event.data.attributes;
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;
  
  await db.resumeGuildSubscription(
    subscription.id,
    renewsAt?.toISOString() || new Date().toISOString()
  );

  console.log(`✅ Subscription resumed: ${event.data.id}`, {
    guild_id: subscription.guild_id,
    renews_at: renewsAt?.toISOString() || 'none',
  });
}

async function handleSubscriptionExpired(db: BillingDatabase, event: any) {
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  // Disable premium immediately
  await db.deactivateGuildSubscription(subscription.id);

  console.log(`❌ Subscription expired: ${event.data.id}`, {
    guild_id: subscription.guild_id,
  });
}

async function handleSubscriptionPaused(db: BillingDatabase, event: any) {
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  await db.updateGuildSubscription(subscription.id, {
    status: 'paused',
    premium_enabled: false,
  });

  console.log(`⏸️ Subscription paused: ${event.data.id}`, {
    guild_id: subscription.guild_id,
  });
}

async function handleSubscriptionUnpaused(db: BillingDatabase, event: any) {
  const attrs = event.data.attributes;
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  await db.updateGuildSubscription(subscription.id, {
    status: 'active',
    premium_enabled: true,
  });

  console.log(`▶️ Subscription unpaused: ${event.data.id}`, {
    guild_id: subscription.guild_id,
  });
}

async function handleSubscriptionPaymentSuccess(db: BillingDatabase, event: any) {
  const attrs = event.data.attributes;
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;

  await db.updateGuildSubscription(subscription.id, {
    status: 'active',
    premium_enabled: true,
    renews_at: renewsAt?.toISOString() || null,
  });

  console.log(`✅ Subscription payment success: ${event.data.id}`, {
    guild_id: subscription.guild_id,
    renews_at: renewsAt?.toISOString() || 'none',
  });
}

async function handleSubscriptionPaymentFailed(db: BillingDatabase, event: any) {
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  // Mark as past_due but keep premium enabled (grace period)
  // Premium will be disabled on subscription_expired
  await db.updateGuildSubscription(subscription.id, {
    status: 'past_due',
    premium_enabled: true,  // Explicit: keep premium during grace period
  });

  console.log(`⚠️ Subscription payment failed (grace period active): ${event.data.id}`);
}

async function handleSubscriptionPaymentRecovered(db: BillingDatabase, event: any) {
  const attrs = event.data.attributes;
  const subscription = await db.getGuildSubscriptionByProvider(event.data.id);
  
  if (!subscription) {
    console.warn(`Subscription not found: ${event.data.id}`);
    return;
  }

  const renewsAt = attrs.renews_at ? new Date(attrs.renews_at) : null;

  // Reactivate subscription after payment recovery
  await db.updateGuildSubscription(subscription.id, {
    status: 'active',
    premium_enabled: true,
    renews_at: renewsAt?.toISOString() || null,
  });

  console.log(`✅ Subscription payment recovered: ${event.data.id}`, {
    guild_id: subscription.guild_id,
    renews_at: renewsAt?.toISOString() || 'none',
  });
}

async function handleOrderCreated(db: BillingDatabase, event: any) {
  const customData = extractCustomData(event);
  const attrs = event.data.attributes;
  
  // Validate required custom data
  if (!customData.discord_user_id || !customData.plan_key) {
    throw new Error('Missing required custom data in order_created');
  }

  // Validate Discord user ID format
  if (!isValidDiscordId(customData.discord_user_id)) {
    throw new Error(`Invalid discord_user_id format: ${customData.discord_user_id}`);
  }

  const planKey = customData.plan_key;

  // Validate plan_key is valid
  if (!isPremiumPlan(planKey) && !isDonationPlan(planKey)) {
    throw new Error(`Invalid plan_key in order_created: ${planKey}`);
  }

  // Validate provider IDs
  const providerCustomerId = validateProviderId(attrs.customer_id, 'customer_id');
  const providerOrderId = validateProviderId(event.data.id, 'order_id');
  const providerProductId = String(attrs.first_order_item?.product_id || '');
  const providerVariantId = String(attrs.first_order_item?.variant_id || '');

  // Validate currency
  const currency = attrs.currency?.toUpperCase() || 'USD';
  if (!isValidCurrency(currency)) {
    throw new Error(`Invalid currency: ${attrs.currency}`);
  }

  // Validate amount
  const amount = attrs.total;
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error(`Invalid amount in order_created: ${amount}`);
  }

  // Ensure user exists
  await db.upsertUser({
    discord_user_id: customData.discord_user_id,
    username: 'Unknown',
  });

  // Handle lifetime purchase
  if (isLifetimePlan(planKey)) {
    if (!customData.guild_id) {
      throw new Error('Missing guild_id for lifetime purchase');
    }

    // Validate guild_id format
    if (!isValidDiscordId(customData.guild_id)) {
      throw new Error(`Invalid guild_id format: ${customData.guild_id}`);
    }

    // Create guild subscription (lifetime)
    await db.createGuildSubscription({
      guild_id: customData.guild_id,
      discord_user_id: customData.discord_user_id,
      provider: 'lemon_squeezy',
      provider_customer_id: providerCustomerId,
      provider_subscription_id: null,
      plan_key: planKey,
      billing_type: 'one_time',
      status: 'active',
      premium_enabled: true,
      cancel_at_period_end: false,
      renews_at: null,
      ends_at: null,
      lifetime: true,
    });

    // Create purchase record
    await db.createPurchase({
      provider: 'lemon_squeezy',
      provider_order_id: providerOrderId,
      provider_product_id: providerProductId,
      provider_variant_id: providerVariantId,
      discord_user_id: customData.discord_user_id,
      guild_id: customData.guild_id,
      plan_key: planKey,
      kind: 'lifetime',
      amount,
      currency,
      status: 'completed',
      raw_payload: attrs,
    });

    console.log(`✅ Lifetime purchase created for guild ${customData.guild_id}:`, {
      plan_key: planKey,
      amount: `${amount / 100} ${currency}`,
      order_id: providerOrderId,
    });
  }
  // Handle donation
  else if (isDonationPlan(planKey)) {
    // Donations should NOT have guild_id
    if (customData.guild_id) {
      console.warn('⚠️ Donation received with guild_id (ignoring):', { 
        discord_user_id: customData.discord_user_id, 
        guild_id: customData.guild_id 
      });
    }

    // Create donation record
    await db.createDonation({
      provider: 'lemon_squeezy',
      provider_order_id: providerOrderId,
      discord_user_id: customData.discord_user_id,
      amount,
      currency,
      status: 'completed',
      message: null,
      raw_payload: attrs,
    });

    // Also create purchase record for analytics
    await db.createPurchase({
      provider: 'lemon_squeezy',
      provider_order_id: providerOrderId,
      provider_product_id: providerProductId,
      provider_variant_id: providerVariantId,
      discord_user_id: customData.discord_user_id,
      guild_id: null,  // Explicit: donations never have guild_id
      plan_key: planKey,
      kind: 'donation',
      amount,
      currency,
      status: 'completed',
      raw_payload: attrs,
    });

    console.log(`✅ Donation received from ${customData.discord_user_id}:`, {
      amount: `${amount / 100} ${currency}`,
      order_id: providerOrderId,
    });
  }
  // Subscription plans (pro_monthly / pro_yearly): activation is handled by
  // the subscription_created event.  Record the first payment here so billing
  // analytics have the correct amount (attrs.total is already in cents).
  else if (isPremiumPlan(planKey)) {
    if (!customData.guild_id) {
      throw new Error(`Missing guild_id for subscription order ${planKey}: ${providerOrderId}`);
    }
    if (!isValidDiscordId(customData.guild_id)) {
      throw new Error(`Invalid guild_id format for subscription order: ${customData.guild_id}`);
    }

    await db.upsertUser({
      discord_user_id: customData.discord_user_id!,
      username: 'Unknown',
    });

    await db.createPurchase({
      provider: 'lemon_squeezy',
      provider_order_id: providerOrderId,
      provider_product_id: providerProductId,
      provider_variant_id: providerVariantId,
      discord_user_id: customData.discord_user_id,
      guild_id: customData.guild_id,
      plan_key: planKey,
      kind: 'subscription_payment',
      amount, // attrs.total is already in cents
      currency,
      status: 'completed',
      raw_payload: attrs,
    });

    console.log(JSON.stringify({
      level: 'info',
      event: 'order_created_subscription',
      guild_id: customData.guild_id,
      discord_user_id: customData.discord_user_id,
      plan_key: planKey,
      order_id: providerOrderId,
      amount_cents: amount,
      currency,
      message: '📋 Subscription first payment recorded (activation via subscription_created)',
    }));
  }
  else {
    throw new Error(`Unhandled plan_key in order_created: ${planKey}`);
  }
}

async function handleOrderRefunded(db: BillingDatabase, event: any) {
  const attrs = event.data.attributes;
  const orderId = validateProviderId(event.data.id, 'order_id');
  
  // Find purchase by order ID
  const purchase = await db.getPurchaseByProviderOrder('lemon_squeezy', orderId);
  
  if (!purchase) {
    console.warn(`⚠️ Purchase not found for refunded order: ${orderId}`);
    return;
  }

  // Log refund details
  console.log(`🔄 Processing refund for order ${orderId}:`, {
    kind: purchase.kind,
    plan_key: purchase.plan_key,
    amount: `${purchase.amount / 100} ${purchase.currency}`,
    guild_id: purchase.guild_id || 'none',
  });

  // Update purchase status
  await db.updatePurchaseStatus(purchase.id, 'refunded');

  // If it was a premium purchase (lifetime or subscription), deactivate premium
  if ((purchase.kind === 'lifetime' || purchase.kind === 'subscription') && purchase.guild_id) {
    const subscription = await db.getActiveGuildSubscription(purchase.guild_id);
    if (subscription) {
      await db.deactivateGuildSubscription(subscription.id);
      console.log(`❌ Premium deactivated for guild ${purchase.guild_id} due to refund`);
    } else {
      console.warn(`⚠️ No active subscription found for refunded guild ${purchase.guild_id}`);
    }
  }

  // If it was a donation, update donation status
  if (purchase.kind === 'donation') {
    const donation = await db.getDonationByProviderOrder('lemon_squeezy', orderId);
    if (donation) {
      await db.updateDonationStatus(donation.id, 'refunded');
      console.log(`✅ Donation refund recorded for ${donation.discord_user_id}`);
    } else {
      console.warn(`⚠️ Donation record not found for refunded order ${orderId}`);
    }
  }

  console.log(`✅ Order refund processed: ${orderId} - kind: ${purchase.kind}`);
}
