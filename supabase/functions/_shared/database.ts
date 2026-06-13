/* Database utilities for billing system */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { selectValidSubscription } from './subscriptionValidity';

declare const Deno: {
  env: { get: (k: string) => string | undefined };
};

export interface User {
  discord_user_id: string;
  username: string;
  discriminator: string | null;
  avatar: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuildSubscription {
  id: string;
  guild_id: string;
  discord_user_id: string;
  provider: string;
  provider_order_id: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  plan_key: string;
  billing_type: string;
  status: string;
  premium_enabled: boolean;
  cancel_at_period_end: boolean;
  renews_at: string | null;
  ends_at: string | null;
  lifetime: boolean;
  is_founding_member: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  provider: string;
  provider_order_id: string;
  provider_product_id: string | null;
  provider_variant_id: string | null;
  discord_user_id: string | null;
  guild_id: string | null;
  plan_key: string;
  kind: string;
  amount: number;
  currency: string;
  status: string;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface Donation {
  id: string;
  provider: string;
  provider_order_id: string;
  discord_user_id: string | null;
  amount: number;
  currency: string;
  status: string;
  message: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  event_name: string;
  event_id: string;
  event_hash: string;
  processed: boolean;
  processed_at: string | null;
  error_message: string | null;
  retry_count: number;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

export function createSupabaseClient(
  url?: string,
  key?: string,
  options?: Parameters<typeof createClient>[2],
): SupabaseClient {
  const supabaseUrl = url ?? Deno.env.get('SUPABASE_URL');
  const supabaseKey = key ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey, options ?? {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export class BillingDatabase {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // ============================================
  // USERS
  // ============================================

  async upsertUser(user: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .upsert(
        {
          discord_user_id: user.discord_user_id,
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar,
          email: user.email,
        },
        { onConflict: 'discord_user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUser(discordUserId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('discord_user_id', discordUserId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // ============================================
  // GUILD SUBSCRIPTIONS
  // ============================================

  async createGuildSubscription(subscription: Partial<GuildSubscription>): Promise<GuildSubscription> {
    // Subscriptions: upsert by provider_subscription_id (requires the partial unique index
    // idx_guild_subscriptions_unique_provider_sub_dedup added in 20260407000000).
    if (subscription.billing_type === 'subscription' && subscription.provider_subscription_id) {
      const { data, error } = await this.supabase
        .from('guild_subscriptions')
        .upsert(subscription, { onConflict: 'provider_subscription_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // Lifetime: skip if an active lifetime already exists for this guild
    if (subscription.billing_type === 'one_time' && subscription.guild_id) {
      const existing = await this.getActiveGuildSubscription(subscription.guild_id);
      if (existing?.lifetime) {
        console.warn(
          `[billing] Duplicate lifetime subscription for guild ${subscription.guild_id} — skipping insert`
        );
        return existing;
      }
    }

    const { data, error } = await this.supabase
      .from('guild_subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateGuildSubscription(
    id: string,
    updates: Partial<GuildSubscription>
  ): Promise<GuildSubscription> {
    const { data, error } = await this.supabase
      .from('guild_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getGuildSubscriptionByProvider(
    providerSubscriptionId: string
  ): Promise<GuildSubscription | null> {
    const { data, error } = await this.supabase
      .from('guild_subscriptions')
      .select('*')
      .eq('provider_subscription_id', providerSubscriptionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getActiveGuildSubscription(guildId: string): Promise<GuildSubscription | null> {
    // Get all subscriptions for this guild that have premium enabled
    const { data, error } = await this.supabase
      .from('guild_subscriptions')
      .select('*')
      .eq('guild_id', guildId)
      .eq('premium_enabled', true)
      .in('status', ['active', 'cancelled', 'past_due'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) return null;

    return selectValidSubscription(data);
  }

  async deactivateGuildSubscription(id: string): Promise<GuildSubscription> {
    return this.updateGuildSubscription(id, {
      status: 'expired',
      premium_enabled: false,
    });
  }

  async cancelGuildSubscription(id: string, endsAt: string): Promise<GuildSubscription> {
    return this.updateGuildSubscription(id, {
      status: 'cancelled',
      cancel_at_period_end: true,
      ends_at: endsAt,
    });
  }

  async resumeGuildSubscription(id: string, renewsAt: string): Promise<GuildSubscription> {
    return this.updateGuildSubscription(id, {
      status: 'active',
      cancel_at_period_end: false,
      renews_at: renewsAt,
      premium_enabled: true,
    });
  }

  // ============================================
  // PURCHASES
  // ============================================

  async createPurchase(purchase: Partial<Purchase>): Promise<Purchase> {
    const { data, error } = await this.supabase
      .from('purchases')
      .insert(purchase)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPurchaseByProviderOrder(
    provider: string,
    providerOrderId: string
  ): Promise<Purchase | null> {
    const { data, error } = await this.supabase
      .from('purchases')
      .select('*')
      .eq('provider', provider)
      .eq('provider_order_id', providerOrderId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updatePurchaseStatus(id: string, status: string): Promise<Purchase> {
    const { data, error } = await this.supabase
      .from('purchases')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================
  // DONATIONS
  // ============================================

  async createDonation(donation: Partial<Donation>): Promise<Donation> {
    const { data, error } = await this.supabase
      .from('donations')
      .insert(donation)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDonationByProviderOrder(
    provider: string,
    providerOrderId: string
  ): Promise<Donation | null> {
    const { data, error } = await this.supabase
      .from('donations')
      .select('*')
      .eq('provider', provider)
      .eq('provider_order_id', providerOrderId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateDonationStatus(id: string, status: string): Promise<Donation> {
    const { data, error } = await this.supabase
      .from('donations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================
  // WEBHOOK EVENTS
  // ============================================

  async checkWebhookEventExists(eventHash: string): Promise<boolean> {
    // Solo bloqueamos si el evento fue procesado con ÉXITO (processed = true).
    // Si processed = false (falló o está en vuelo), el reintento del proveedor debe pasar.
    const { data, error } = await this.supabase
      .from('webhook_events')
      .select('id')
      .eq('event_hash', eventHash)
      .eq('processed', true)
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  }

  async createWebhookEvent(event: Partial<WebhookEvent>): Promise<WebhookEvent> {
    const { data, error } = await this.supabase
      .from('webhook_events')
      .insert(event)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Clave duplicada en event_hash. Diferenciar dos casos:
        // A) processed = false → el evento falló antes, este es un reintento válido.
        //    Devolvemos la fila existente para que el handler la use como base.
        // B) processed = true  → duplicado real (ya se processó con éxito), bloquear.
        const { data: existing } = await this.supabase
          .from('webhook_events')
          .select('*')
          .eq('event_hash', event.event_hash!)
          .eq('processed', false)
          .maybeSingle();

        if (existing) {
          return existing as WebhookEvent;
        }
        throw new Error('DUPLICATE_EVENT');
      }
      throw error;
    }

    return data;
  }

  async markWebhookProcessed(id: string, success: boolean, errorMessage?: string): Promise<void> {
    const { error } = await this.supabase
      .from('webhook_events')
      .update({
        processed: success,
        processed_at: new Date().toISOString(),
        error_message: errorMessage || null,
      })
      .eq('id', id);

    if (error) throw error;
  }

  async incrementWebhookRetry(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_webhook_retry', { webhook_id: id });

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: event } = await this.supabase
        .from('webhook_events')
        .select('retry_count')
        .eq('id', id)
        .single();

      if (event) {
        await this.supabase
          .from('webhook_events')
          .update({ retry_count: event.retry_count + 1 })
          .eq('id', id);
      }
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getGuildPremiumStatus(guildId: string): Promise<{
    has_premium: boolean;
    plan_key: string | null;
    ends_at: string | null;
    lifetime: boolean;
  }> {
    const subscription = await this.getActiveGuildSubscription(guildId);

    if (!subscription) {
      return {
        has_premium: false,
        plan_key: null,
        ends_at: null,
        lifetime: false,
      };
    }

    // Check if expired — sólo evaluar estado, NO mutar en un método de lectura (NF6).
    // Dos reads concurrentes del mismo guild lanzarían dos deactivateGuildSubscription
    // sobre el mismo id (race condition). La expiración real se delega al cron.
    if (subscription.ends_at && new Date(subscription.ends_at) < new Date()) {
      return {
        has_premium: false,
        plan_key: null,
        ends_at: null,
        lifetime: false,
      };
    }

    return {
      has_premium: subscription.premium_enabled,
      plan_key: subscription.plan_key,
      ends_at: subscription.ends_at,
      lifetime: subscription.lifetime,
    };
  }

  async getUserPurchases(discordUserId: string): Promise<Purchase[]> {
    const { data, error } = await this.supabase
      .from('purchases')
      .select('*')
      .eq('discord_user_id', discordUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserDonations(discordUserId: string): Promise<Donation[]> {
    const { data, error } = await this.supabase
      .from('donations')
      .select('*')
      .eq('discord_user_id', discordUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserGuildSubscriptions(discordUserId: string): Promise<GuildSubscription[]> {
    const { data, error } = await this.supabase
      .from('guild_subscriptions')
      .select('*')
      .eq('discord_user_id', discordUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
