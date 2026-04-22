// Billing types for Stripe integration

export type PlanKey = 'pro_monthly' | 'pro_yearly' | 'lifetime' | 'donate';

export type SubscriptionStatus = 
  | 'active' 
  | 'cancelled' 
  | 'expired' 
  | 'past_due' 
  | 'paused' 
  | 'incomplete';

export interface GuildSummary {
  id: string;
  name: string;
  icon: string | null;
  icon_url: string | null;
  owner: boolean;
  has_premium: boolean;
  plan_key: PlanKey | null;
  ends_at: string | null;
  lifetime: boolean;
}

export interface GuildsResponse {
  guilds: GuildSummary[];
  total: number;
  premium_count: number;
}

export interface CheckoutRequest {
  guild_id?: string;
  plan_key: PlanKey;
  user_id?: string;
}

export interface CheckoutResponse {
  checkout_url: string;
}

export interface GuildPremiumStatus {
  guild_id: string;
  has_premium: boolean;
  plan_key: PlanKey | null;
  ends_at: string | null;
  lifetime: boolean;
  subscription: {
    plan_key: PlanKey;
    billing_type: 'subscription' | 'one_time';
    status: SubscriptionStatus;
    renews_at: string | null;
    ends_at: string | null;
    lifetime: boolean;
    cancel_at_period_end: boolean;
  } | null;
  checked_at: string;
}

export interface PlanDetails {
  key: PlanKey;
  name: string;
  description: string;
  price: string;
  interval?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  icon: 'zap' | 'crown' | 'sparkles' | 'heart';
}
