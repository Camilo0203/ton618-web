// Lemon Squeezy API and webhook utilities

export interface LemonSqueezyCheckoutData {
  storeId: string;
  variantId: string;
  customData: {
    discord_user_id: string;
    guild_id?: string;
    plan_key: string;
  };
  checkoutOptions?: {
    embed?: boolean;
    media?: boolean;
    logo?: boolean;
    desc?: boolean;
    discount?: boolean;
    dark?: boolean;
  };
  checkoutData?: {
    email?: string;
    name?: string;
  };
  expiresAt?: string;
  testMode?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

export interface LemonSqueezyCheckoutResponse {
  data: {
    id: string;
    type: 'checkouts';
    attributes: {
      url: string;
      store_id: number;
      variant_id: number;
      custom_data: Record<string, unknown>;
      created_at: string;
      expires_at: string | null;
    };
  };
}

export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      discord_user_id?: string;
      guild_id?: string;
      plan_key?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}

export interface LemonSqueezySubscription {
  id: string;
  customer_id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  status: string;
  renews_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}

export interface LemonSqueezyOrder {
  id: string;
  customer_id: number;
  product_id: number;
  variant_id: number;
  total: number;
  currency: string;
  status: string;
  refunded: boolean;
  created_at: string;
}

const LEMON_API_BASE = 'https://api.lemonsqueezy.com/v1';

export class LemonSqueezyClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Create a checkout session
   */
  async createCheckout(data: LemonSqueezyCheckoutData): Promise<LemonSqueezyCheckoutResponse> {
    const response = await fetch(`${LEMON_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            store_id: data.storeId,
            variant_id: data.variantId,
            custom_data: data.customData,
            checkout_options: data.checkoutOptions,
            checkout_data: data.checkoutData,
            expires_at: data.expiresAt,
            test_mode: data.testMode,
            product_options: {
              ...(data.successUrl ? { redirect_url: data.successUrl } : {}),
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: data.storeId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: data.variantId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Lemon Squeezy checkout creation failed: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<LemonSqueezySubscription> {
    const response = await fetch(`${LEMON_API_BASE}/subscriptions/${subscriptionId}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch subscription: ${error}`);
    }

    const json = await response.json();
    return json.data.attributes;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<LemonSqueezyOrder> {
    const response = await fetch(`${LEMON_API_BASE}/orders/${orderId}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch order: ${error}`);
    }

    const json = await response.json();
    return json.data.attributes;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch(`${LEMON_API_BASE}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to cancel subscription: ${error}`);
    }
  }
}

/**
 * Verify Lemon Squeezy webhook signature
 */
export async function verifyLemonSqueezySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = hexToBytes(signature);
    const dataBytes = encoder.encode(payload);

    return await crypto.subtle.verify('HMAC', key, signatureBytes, dataBytes);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate SHA-256 hash for event deduplication
 */
export async function generateEventHash(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse Lemon Squeezy webhook event
 */
export function parseLemonSqueezyEvent(payload: string): LemonSqueezyWebhookEvent {
  try {
    return JSON.parse(payload);
  } catch (error) {
    throw new Error('Invalid webhook payload JSON');
  }
}

/**
 * Extract custom data from webhook event
 */
export function extractCustomData(event: LemonSqueezyWebhookEvent): {
  discord_user_id?: string;
  guild_id?: string;
  plan_key?: string;
} {
  return {
    discord_user_id: event.meta.custom_data?.discord_user_id,
    guild_id: event.meta.custom_data?.guild_id,
    plan_key: event.meta.custom_data?.plan_key,
  };
}

/**
 * Determine billing type from plan key
 */
export function getBillingType(planKey: string): 'subscription' | 'one_time' {
  if (planKey === 'pro_monthly' || planKey === 'pro_yearly') {
    return 'subscription';
  }
  return 'one_time';
}

/**
 * Determine if plan enables premium
 */
export function isPremiumPlan(planKey: string): boolean {
  return ['pro_monthly', 'pro_yearly', 'lifetime'].includes(planKey);
}

/**
 * Determine if plan is lifetime
 */
export function isLifetimePlan(planKey: string): boolean {
  return planKey === 'lifetime';
}

/**
 * Determine if plan is donation
 */
export function isDonationPlan(planKey: string): boolean {
  return planKey === 'donate';
}

/**
 * Calculate renewal date based on plan
 */
export function calculateRenewalDate(planKey: string, startDate: Date): Date | null {
  if (planKey === 'lifetime' || planKey === 'donate') {
    return null;
  }

  const renewalDate = new Date(startDate);
  
  if (planKey === 'pro_monthly') {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else if (planKey === 'pro_yearly') {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }

  return renewalDate;
}

/**
 * Map Lemon Squeezy subscription status to our status
 */
export function mapSubscriptionStatus(lemonStatus: string): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'cancelled': 'cancelled',
    'expired': 'expired',
    'past_due': 'past_due',
    'paused': 'paused',
    'on_trial': 'active',
    'unpaid': 'past_due',
  };

  return statusMap[lemonStatus] || 'incomplete';
}

/**
 * Convert hex string to bytes
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Validate variant ID matches plan key
 */
export function validateVariantForPlan(
  variantId: string,
  planKey: string,
  variantConfig: Record<string, string>
): boolean {
  return variantConfig[planKey] === variantId;
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(planKey: string): string {
  const names: Record<string, string> = {
    'pro_monthly': 'Pro Monthly',
    'pro_yearly': 'Pro Yearly',
    'lifetime': 'Lifetime',
    'donate': 'Donation',
  };

  return names[planKey] || planKey;
}
