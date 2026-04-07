// DEPRECATED: This handler targets the legacy schema (tables: subscriptions, guild_premium).
// The canonical webhook handler is billing-webhook/index.ts which uses the current schema.
// This file is kept for reference only. If this function is still deployed in Supabase,
// REMOVE it from the Supabase Functions dashboard to avoid double-processing events.
// See: supabase/functions/billing-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { verifyWebhookSignature, getSupabaseClient, WebhookEvent, getPlanTier, calculateExpiresAt } from '../_shared/lemon-squeezy.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
};

serve(async (_req: Request) => {
  console.error('[lemon-squeezy-webhook] DEPRECATED handler invoked. Deploy billing-webhook instead and remove this function from Supabase.');
  return new Response(
    JSON.stringify({ error: 'This endpoint is deprecated. Use billing-webhook.' }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

  // Dead code below — preserved for schema reference only.
  try {
    const webhookSecret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('LEMON_SQUEEZY_WEBHOOK_SECRET not configured');
    }

    const signature = _req.headers.get('x-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.text();
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event: WebhookEvent = JSON.parse(rawBody);
    const supabase = getSupabaseClient(req);

    console.log(`Processing webhook event: ${event.meta.event_name}`);

    switch (event.meta.event_name) {
      case 'subscription_created':
        await handleSubscriptionCreated(supabase, event);
        break;
      
      case 'subscription_updated':
        await handleSubscriptionUpdated(supabase, event);
        break;
      
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(supabase, event);
        break;
      
      case 'subscription_resumed':
        await handleSubscriptionResumed(supabase, event);
        break;
      
      case 'subscription_expired':
        await handleSubscriptionExpired(supabase, event);
        break;
      
      case 'subscription_paused':
        await handleSubscriptionPaused(supabase, event);
        break;
      
      case 'subscription_unpaused':
        await handleSubscriptionUnpaused(supabase, event);
        break;
      
      case 'subscription_payment_success':
        await handleSubscriptionPaymentSuccess(supabase, event);
        break;
      
      case 'subscription_payment_failed':
        await handleSubscriptionPaymentFailed(supabase, event);
        break;
      
      case 'order_created':
        await handleOrderCreated(supabase, event);
        break;
      
      case 'order_refunded':
        await handleOrderRefunded(supabase, event);
        break;
      
      default:
        console.log(`Unhandled event: ${event.meta.event_name}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleSubscriptionCreated(supabase: any, event: WebhookEvent) {
  const { discord_user_id, guild_id, plan_type } = event.meta.custom_data;
  const attrs = event.data.attributes;

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      lemon_squeezy_id: event.data.id,
      discord_user_id,
      guild_id,
      plan_type,
      status: attrs.status,
      current_period_start: attrs.renews_at ? new Date(attrs.created_at) : new Date(),
      current_period_end: new Date(attrs.renews_at),
      cancel_at_period_end: false,
      metadata: attrs,
    })
    .select()
    .single();

  if (subError) throw subError;

  const tier = getPlanTier(plan_type);
  const expiresAt = calculateExpiresAt(plan_type, new Date(attrs.renews_at));

  await supabase
    .from('guild_premium')
    .upsert({
      guild_id,
      discord_user_id,
      tier,
      is_active: attrs.status === 'active',
      activated_at: new Date().toISOString(),
      expires_at: expiresAt?.toISOString(),
      subscription_id: subscription.id,
      purchase_id: null,
    });

  console.log(`Subscription created for guild ${guild_id}: ${tier}`);
}

async function handleSubscriptionUpdated(supabase: any, event: WebhookEvent) {
  const attrs = event.data.attributes;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: attrs.status,
      current_period_start: attrs.renews_at ? new Date(attrs.created_at) : new Date(),
      current_period_end: new Date(attrs.renews_at),
      cancel_at_period_end: attrs.cancelled,
      metadata: attrs,
    })
    .eq('lemon_squeezy_id', event.data.id)
    .select()
    .single();

  if (subscription) {
    await supabase
      .from('guild_premium')
      .update({
        is_active: attrs.status === 'active',
        expires_at: new Date(attrs.renews_at).toISOString(),
      })
      .eq('subscription_id', subscription.id);
  }

  console.log(`Subscription updated: ${event.data.id} - status: ${attrs.status}`);
}

async function handleSubscriptionCancelled(supabase: any, event: WebhookEvent) {
  const attrs = event.data.attributes;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancel_at_period_end: true,
      metadata: attrs,
    })
    .eq('lemon_squeezy_id', event.data.id)
    .select()
    .single();

  if (subscription) {
    await supabase
      .from('guild_premium')
      .update({
        expires_at: new Date(attrs.ends_at || attrs.renews_at).toISOString(),
      })
      .eq('subscription_id', subscription.id);
  }

  console.log(`Subscription cancelled: ${event.data.id} - ends at: ${attrs.ends_at}`);
}

async function handleSubscriptionResumed(supabase: any, event: WebhookEvent) {
  const attrs = event.data.attributes;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: new Date(attrs.renews_at),
      metadata: attrs,
    })
    .eq('lemon_squeezy_id', event.data.id)
    .select()
    .single();

  if (subscription) {
    await supabase
      .from('guild_premium')
      .update({
        is_active: true,
        expires_at: new Date(attrs.renews_at).toISOString(),
      })
      .eq('subscription_id', subscription.id);
  }

  console.log(`Subscription resumed: ${event.data.id}`);
}

async function handleSubscriptionExpired(supabase: any, event: WebhookEvent) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'expired',
      metadata: event.data.attributes,
    })
    .eq('lemon_squeezy_id', event.data.id)
    .select()
    .single();

  if (subscription) {
    await supabase
      .from('guild_premium')
      .update({
        is_active: false,
      })
      .eq('subscription_id', subscription.id);
  }

  console.log(`Subscription expired: ${event.data.id}`);
}

async function handleSubscriptionPaused(supabase: any, event: WebhookEvent) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'paused',
      metadata: event.data.attributes,
    })
    .eq('lemon_squeezy_id', event.data.id)
    .select()
    .single();

  if (subscription) {
    await supabase
      .from('guild_premium')
      .update({
        is_active: false,
      })
      .eq('subscription_id', subscription.id);
  }

  console.log(`Subscription paused: ${event.data.id}`);
}

async function handleSubscriptionUnpaused(supabase: any, event: WebhookEvent) {
  const attrs = event.data.attributes;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      metadata: attrs,
    })
    .eq('lemon_squeezy_id', event.data.id)
    .select()
    .single();

  if (subscription) {
    await supabase
      .from('guild_premium')
      .update({
        is_active: true,
      })
      .eq('subscription_id', subscription.id);
  }

  console.log(`Subscription unpaused: ${event.data.id}`);
}

async function handleSubscriptionPaymentSuccess(supabase: any, event: WebhookEvent) {
  const attrs = event.data.attributes;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(attrs.renews_at),
      metadata: attrs,
    })
    .eq('lemon_squeezy_id', event.data.id)
    .select()
    .single();

  if (subscription) {
    await supabase
      .from('guild_premium')
      .update({
        is_active: true,
        expires_at: new Date(attrs.renews_at).toISOString(),
      })
      .eq('subscription_id', subscription.id);
  }

  console.log(`Subscription payment success: ${event.data.id}`);
}

async function handleSubscriptionPaymentFailed(supabase: any, event: WebhookEvent) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      metadata: event.data.attributes,
    })
    .eq('lemon_squeezy_id', event.data.id)
    .select()
    .single();

  console.log(`Subscription payment failed: ${event.data.id}`);
}

async function handleOrderCreated(supabase: any, event: WebhookEvent) {
  const { discord_user_id, guild_id, plan_type } = event.meta.custom_data;
  const attrs = event.data.attributes;

  if (plan_type === 'lifetime') {
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        lemon_squeezy_order_id: event.data.id,
        discord_user_id,
        guild_id,
        plan_type: 'lifetime',
        status: 'completed',
        metadata: attrs,
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    await supabase
      .from('guild_premium')
      .upsert({
        guild_id,
        discord_user_id,
        tier: 'lifetime',
        is_active: true,
        activated_at: new Date().toISOString(),
        expires_at: null,
        subscription_id: null,
        purchase_id: purchase.id,
      });

    console.log(`Lifetime purchase created for guild ${guild_id}`);
  } else if (plan_type === 'donation') {
    await supabase
      .from('donations')
      .insert({
        lemon_squeezy_order_id: event.data.id,
        discord_user_id,
        amount_cents: attrs.total,
        currency: attrs.currency,
        metadata: attrs,
      });

    console.log(`Donation received from ${discord_user_id}: ${attrs.total} ${attrs.currency}`);
  }
}

async function handleOrderRefunded(supabase: any, event: WebhookEvent) {
  const { data: purchase } = await supabase
    .from('purchases')
    .update({
      status: 'refunded',
      metadata: event.data.attributes,
    })
    .eq('lemon_squeezy_order_id', event.data.id)
    .select()
    .single();

  if (purchase) {
    await supabase
      .from('guild_premium')
      .update({
        is_active: false,
      })
      .eq('purchase_id', purchase.id);
  }

  console.log(`Order refunded: ${event.data.id}`);
}
