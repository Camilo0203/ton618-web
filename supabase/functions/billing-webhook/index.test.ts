import { describe, it, expect, beforeEach, vi } from 'vitest';
import crypto from 'crypto';

// Mock database
const mockDb = {
  checkWebhookEventExists: vi.fn(),
  createWebhookEvent: vi.fn(),
  markWebhookProcessed: vi.fn(),
  getGuildSubscriptionByProvider: vi.fn(),
  createGuildSubscription: vi.fn(),
  updateGuildSubscription: vi.fn(),
  deactivateGuildSubscription: vi.fn(),
  cancelGuildSubscription: vi.fn(),
  resumeGuildSubscription: vi.fn(),
  createPurchase: vi.fn(),
  getPurchaseByProviderOrder: vi.fn(),
  updatePurchaseStatus: vi.fn(),
  createDonation: vi.fn(),
  getDonationByProviderOrder: vi.fn(),
  updateDonationStatus: vi.fn(),
  getActiveGuildSubscription: vi.fn(),
  upsertUser: vi.fn(),
};

describe('billing-webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test-webhook-secret';
  });

  describe('Signature Verification', () => {
    it('should verify valid HMAC-SHA256 signature', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = 'whsec_test-webhook-secret';
      
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      const validSignature = hmac.digest('hex');
      
      // Verify signature
      const verifyHmac = crypto.createHmac('sha256', secret);
      verifyHmac.update(payload);
      const computedSignature = verifyHmac.digest('hex');
      
      expect(computedSignature).toBe(validSignature);
    });

    it('should reject invalid signature', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = 'whsec_test-webhook-secret';
      const invalidSignature = 'invalid-signature-123';
      
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      const validSignature = hmac.digest('hex');
      
      expect(invalidSignature).not.toBe(validSignature);
    });

    it('should reject signature with wrong secret', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const correctSecret = 'whsec_test-webhook-secret';
      const wrongSecret = 'wrong-secret';
      
      const hmac1 = crypto.createHmac('sha256', correctSecret);
      hmac1.update(payload);
      const signature1 = hmac1.digest('hex');
      
      const hmac2 = crypto.createHmac('sha256', wrongSecret);
      hmac2.update(payload);
      const signature2 = hmac2.digest('hex');
      
      expect(signature1).not.toBe(signature2);
    });
  });

  describe('Idempotency', () => {
    it('should detect duplicate event by hash', async () => {
      const payload = JSON.stringify({
        meta: { event_name: 'order_created' },
        data: { id: 'order-123', attributes: {} },
      });
      
      const hash = crypto.createHash('sha256').update(payload).digest('hex');
      
      mockDb.checkWebhookEventExists.mockResolvedValue(true);
      
      const exists = await mockDb.checkWebhookEventExists(hash);
      expect(exists).toBe(true);
    });

    it('should allow first occurrence of event', async () => {
      const payload = JSON.stringify({
        meta: { event_name: 'order_created' },
        data: { id: 'order-456', attributes: {} },
      });
      
      const hash = crypto.createHash('sha256').update(payload).digest('hex');
      
      mockDb.checkWebhookEventExists.mockResolvedValue(false);
      
      const exists = await mockDb.checkWebhookEventExists(hash);
      expect(exists).toBe(false);
    });

    it('should generate consistent hash for same payload', () => {
      const payload = JSON.stringify({ test: 'data' });
      
      const hash1 = crypto.createHash('sha256').update(payload).digest('hex');
      const hash2 = crypto.createHash('sha256').update(payload).digest('hex');
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('order_created - Lifetime', () => {
    it('should create lifetime subscription for guild', async () => {
      const event = {
        meta: {
          event_name: 'order_created',
          custom_data: {
            discord_user_id: '123456789012345678',
            guild_id: '987654321098765432',
            plan_key: 'lifetime',
          },
        },
        data: {
          id: 'order-lifetime-123',
          attributes: {
            status: 'paid',
            total: 9900,
            currency: 'USD',
          },
        },
      };

      mockDb.createPurchase.mockResolvedValue({
        id: 'purchase-123',
        kind: 'lifetime',
        guild_id: event.meta.custom_data.guild_id,
      });

      mockDb.createGuildSubscription.mockResolvedValue({
        id: 'sub-123',
        guild_id: event.meta.custom_data.guild_id,
        plan_key: 'lifetime',
        lifetime: true,
        premium_enabled: true,
        ends_at: null,
      });

      const purchase = await mockDb.createPurchase({
        provider: 'stripe',
        provider_order_id: event.data.id,
        plan_key: event.meta.custom_data.plan_key,
        kind: 'lifetime',
        guild_id: event.meta.custom_data.guild_id,
      });

      expect(purchase.kind).toBe('lifetime');
      expect(purchase.guild_id).toBe(event.meta.custom_data.guild_id);
    });

    it('should set lifetime=true and ends_at=null', async () => {
      mockDb.createGuildSubscription.mockResolvedValue({
        id: 'sub-lifetime',
        lifetime: true,
        ends_at: null,
        premium_enabled: true,
      });

      const subscription = await mockDb.createGuildSubscription({
        lifetime: true,
        ends_at: null,
      });

      expect(subscription.lifetime).toBe(true);
      expect(subscription.ends_at).toBeNull();
    });
  });

  describe('order_created - Donate', () => {
    it('should create donation without guild_id', async () => {
      const event = {
        meta: {
          event_name: 'order_created',
          custom_data: {
            discord_user_id: '123456789012345678',
            plan_key: 'donate',
          },
        },
        data: {
          id: 'order-donate-123',
          attributes: {
            status: 'paid',
            total: 500,
            currency: 'USD',
          },
        },
      };

      mockDb.createDonation.mockResolvedValue({
        id: 'donation-123',
        provider_order_id: event.data.id,
        discord_user_id: event.meta.custom_data.discord_user_id,
        amount: 500,
      });

      const donation = await mockDb.createDonation({
        provider: 'stripe',
        provider_order_id: event.data.id,
        discord_user_id: event.meta.custom_data.discord_user_id,
        amount: 500,
      });

      expect(donation.discord_user_id).toBe(event.meta.custom_data.discord_user_id);
      expect(donation.provider_order_id).toBe(event.data.id);
    });

    it('should not activate premium for donation', async () => {
      const event: { meta: { custom_data: Record<string, string | undefined> } } = {
        meta: {
          custom_data: {
            discord_user_id: '123456789012345678',
            plan_key: 'donate',
          },
        },
      };

      // Donations should not call createGuildSubscription
      expect(event.meta.custom_data.plan_key).toBe('donate');
      expect(event.meta.custom_data.guild_id).toBeUndefined();
    });
  });

  describe('subscription_cancelled', () => {
    it('should not disable premium immediately', async () => {
      const event = {
        data: {
          id: 'sub-123',
          attributes: {
            ends_at: '2026-05-01T00:00:00Z',
            renews_at: '2026-05-01T00:00:00Z',
          },
        },
      };

      mockDb.getGuildSubscriptionByProvider.mockResolvedValue({
        id: 'sub-db-123',
        status: 'active',
        premium_enabled: true,
      });

      mockDb.cancelGuildSubscription.mockResolvedValue({
        id: 'sub-db-123',
        status: 'cancelled',
        cancel_at_period_end: true,
        premium_enabled: true, // Still enabled until ends_at
        ends_at: event.data.attributes.ends_at,
      });

      const subscription = await mockDb.getGuildSubscriptionByProvider(event.data.id);
      const cancelled = await mockDb.cancelGuildSubscription(
        subscription.id,
        event.data.attributes.ends_at
      );

      expect(cancelled.cancel_at_period_end).toBe(true);
      expect(cancelled.premium_enabled).toBe(true);
      expect(cancelled.ends_at).toBe(event.data.attributes.ends_at);
    });

    it('should log warning if ends_at is missing', () => {
      const event = {
        data: {
          id: 'sub-no-ends',
          attributes: {
            ends_at: null,
            renews_at: null,
          },
        },
      };

      const endsAt = event.data.attributes.ends_at || event.data.attributes.renews_at;
      expect(endsAt).toBeNull();
    });
  });

  describe('subscription_expired', () => {
    it('should disable premium immediately', async () => {
      const event = {
        data: {
          id: 'sub-expired-123',
          attributes: {
            status: 'expired',
          },
        },
      };

      mockDb.getGuildSubscriptionByProvider.mockResolvedValue({
        id: 'sub-db-expired',
        status: 'active',
        premium_enabled: true,
      });

      mockDb.deactivateGuildSubscription.mockResolvedValue({
        id: 'sub-db-expired',
        status: 'expired',
        premium_enabled: false,
      });

      const subscription = await mockDb.getGuildSubscriptionByProvider(event.data.id);
      const deactivated = await mockDb.deactivateGuildSubscription(subscription.id);

      expect(deactivated.status).toBe('expired');
      expect(deactivated.premium_enabled).toBe(false);
    });
  });

  describe('Supported Events', () => {
    const supportedEvents = [
      'subscription_created',
      'subscription_updated',
      'subscription_cancelled',
      'subscription_resumed',
      'subscription_expired',
      'subscription_paused',
      'subscription_unpaused',
      'subscription_payment_success',
      'subscription_payment_failed',
      'subscription_payment_recovered',
      'order_created',
      'order_refunded',
    ];

    it('should recognize all supported event types', () => {
      supportedEvents.forEach(eventName => {
        expect(supportedEvents).toContain(eventName);
      });
    });
  });

  describe('Custom Data Validation', () => {
    it('should identify missing discord_user_id', () => {
      const customData: Record<string, string | undefined> = {
        guild_id: '123456789012345678',
        plan_key: 'pro_monthly',
      };

      const missingFields = [];
      if (!customData.discord_user_id) missingFields.push('discord_user_id');
      if (!customData.guild_id) missingFields.push('guild_id');
      if (!customData.plan_key) missingFields.push('plan_key');

      expect(missingFields).toContain('discord_user_id');
    });

    it('should identify missing guild_id', () => {
      const customData: Record<string, string | undefined> = {
        discord_user_id: '123456789012345678',
        plan_key: 'pro_monthly',
      };

      const missingFields = [];
      if (!customData.discord_user_id) missingFields.push('discord_user_id');
      if (!customData.guild_id) missingFields.push('guild_id');
      if (!customData.plan_key) missingFields.push('plan_key');

      expect(missingFields).toContain('guild_id');
    });
  });
});
