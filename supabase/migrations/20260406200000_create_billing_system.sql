-- Migration: Complete Billing System for Lemon Squeezy Integration
-- Author: TON618 Bot Team
-- Date: 2026-04-06
-- Fixed: all statements made idempotent (IF NOT EXISTS / CREATE OR REPLACE).

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: users
-- Stores Discord user information
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  discord_user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  discriminator TEXT,
  avatar TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- ============================================
-- TABLE: guild_subscriptions
-- Source of truth for guild premium status
-- ============================================
CREATE TABLE IF NOT EXISTS guild_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id TEXT NOT NULL,
  discord_user_id TEXT NOT NULL REFERENCES users(discord_user_id) ON DELETE CASCADE,
  
  -- Provider information
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy' CHECK (provider IN ('lemon_squeezy', 'stripe', 'paypal')),
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  
  -- Plan details
  plan_key TEXT NOT NULL CHECK (plan_key IN ('pro_monthly', 'pro_yearly', 'lifetime', 'donate')),
  billing_type TEXT NOT NULL CHECK (billing_type IN ('subscription', 'one_time')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'paused', 'incomplete')),
  premium_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Lifecycle
  cancel_at_period_end BOOLEAN DEFAULT false,
  renews_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  lifetime BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_active_guild_subscription UNIQUE (guild_id, status) WHERE status = 'active',
  CONSTRAINT lifetime_no_dates CHECK (
    (lifetime = true AND renews_at IS NULL AND ends_at IS NULL) OR
    (lifetime = false)
  ),
  CONSTRAINT subscription_has_provider_id CHECK (
    (billing_type = 'subscription' AND provider_subscription_id IS NOT NULL) OR
    (billing_type = 'one_time')
  )
);

CREATE INDEX IF NOT EXISTS idx_guild_subscriptions_guild ON guild_subscriptions(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_subscriptions_user ON guild_subscriptions(discord_user_id);
CREATE INDEX IF NOT EXISTS idx_guild_subscriptions_provider_sub ON guild_subscriptions(provider_subscription_id) WHERE provider_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guild_subscriptions_status ON guild_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_guild_subscriptions_premium ON guild_subscriptions(premium_enabled, ends_at) WHERE premium_enabled = true;

-- ============================================
-- TABLE: purchases
-- All purchase records (subscriptions, lifetime, donations)
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Provider information
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_order_id TEXT NOT NULL,
  provider_product_id TEXT,
  provider_variant_id TEXT,
  
  -- User and guild
  discord_user_id TEXT REFERENCES users(discord_user_id) ON DELETE SET NULL,
  guild_id TEXT,
  
  -- Purchase details
  plan_key TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('subscription', 'lifetime', 'donation')),
  
  -- Financial
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'failed', 'pending')),
  
  -- Metadata
  raw_payload JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_provider_order UNIQUE (provider, provider_order_id),
  CONSTRAINT donation_no_guild CHECK (
    (kind = 'donation' AND guild_id IS NULL) OR
    (kind != 'donation')
  )
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(discord_user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_guild ON purchases(guild_id) WHERE guild_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_provider_order ON purchases(provider, provider_order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_kind ON purchases(kind);
CREATE INDEX IF NOT EXISTS idx_purchases_created ON purchases(created_at DESC);

-- ============================================
-- TABLE: donations
-- Dedicated table for donations (denormalized for analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Provider information
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_order_id TEXT NOT NULL,
  
  -- User (nullable for anonymous donations)
  discord_user_id TEXT REFERENCES users(discord_user_id) ON DELETE SET NULL,
  
  -- Financial
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded')),
  
  -- Metadata
  message TEXT,
  raw_payload JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_donation_order UNIQUE (provider, provider_order_id)
);

CREATE INDEX IF NOT EXISTS idx_donations_user ON donations(discord_user_id) WHERE discord_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at DESC);

-- ============================================
-- TABLE: webhook_events
-- Idempotency and audit trail for webhooks
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Provider information
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  event_name TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  
  -- Processing status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Payload
  raw_payload JSONB NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_provider_event UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_name ON webhook_events(event_name);
CREATE INDEX IF NOT EXISTS idx_webhook_events_hash ON webhook_events(event_hash);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate event hash for idempotency
CREATE OR REPLACE FUNCTION generate_event_hash(payload JSONB)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(payload::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Check if guild has active premium
CREATE OR REPLACE FUNCTION guild_has_premium(p_guild_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_active BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM guild_subscriptions 
    WHERE guild_id = p_guild_id 
      AND premium_enabled = true
      AND status IN ('active', 'past_due')
      AND (ends_at IS NULL OR ends_at > NOW())
  ) INTO has_active;
  
  RETURN has_active;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Deactivate expired subscriptions
CREATE OR REPLACE FUNCTION deactivate_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE guild_subscriptions
  SET 
    status = 'expired',
    premium_enabled = false,
    updated_at = NOW()
  WHERE 
    status = 'active'
    AND premium_enabled = true
    AND ends_at IS NOT NULL
    AND ends_at < NOW();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guild_subscriptions_updated_at ON guild_subscriptions;
CREATE TRIGGER update_guild_subscriptions_updated_at
  BEFORE UPDATE ON guild_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- View: Active guild subscriptions with user info
CREATE OR REPLACE VIEW active_guild_subscriptions AS
SELECT 
  gs.*,
  u.username,
  u.avatar,
  u.email
FROM guild_subscriptions gs
JOIN users u ON gs.discord_user_id = u.discord_user_id
WHERE gs.premium_enabled = true
  AND gs.status IN ('active', 'past_due')
  AND (gs.ends_at IS NULL OR gs.ends_at > NOW());

-- View: Revenue analytics
CREATE OR REPLACE VIEW revenue_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  kind,
  currency,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM purchases
WHERE status = 'completed'
GROUP BY DATE_TRUNC('day', created_at), kind, currency
ORDER BY date DESC;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Users: Can read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (discord_user_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id'));

-- Users: Service role can manage all
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

-- Guild subscriptions: Users can read their own
DROP POLICY IF EXISTS "Users can read own subscriptions" ON guild_subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON guild_subscriptions FOR SELECT
  USING (discord_user_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id'));

-- Guild subscriptions: Service role can manage all
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON guild_subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON guild_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Purchases: Users can read their own
DROP POLICY IF EXISTS "Users can read own purchases" ON purchases;
CREATE POLICY "Users can read own purchases"
  ON purchases FOR SELECT
  USING (discord_user_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id'));

-- Purchases: Service role can manage all
DROP POLICY IF EXISTS "Service role can manage purchases" ON purchases;
CREATE POLICY "Service role can manage purchases"
  ON purchases FOR ALL
  USING (auth.role() = 'service_role');

-- Donations: Users can read their own
DROP POLICY IF EXISTS "Users can read own donations" ON donations;
CREATE POLICY "Users can read own donations"
  ON donations FOR SELECT
  USING (discord_user_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id') OR discord_user_id IS NULL);

-- Donations: Service role can manage all
DROP POLICY IF EXISTS "Service role can manage donations" ON donations;
CREATE POLICY "Service role can manage donations"
  ON donations FOR ALL
  USING (auth.role() = 'service_role');

-- Webhook events: Only service role
DROP POLICY IF EXISTS "Service role can manage webhooks" ON webhook_events;
CREATE POLICY "Service role can manage webhooks"
  ON webhook_events FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Discord users who have interacted with the billing system';
COMMENT ON TABLE guild_subscriptions IS 'Source of truth for guild premium status';
COMMENT ON TABLE purchases IS 'All purchase records including subscriptions, lifetime, and donations';
COMMENT ON TABLE donations IS 'Dedicated donation records for analytics';
COMMENT ON TABLE webhook_events IS 'Webhook event log for idempotency and audit trail';

COMMENT ON COLUMN guild_subscriptions.premium_enabled IS 'Whether premium features are currently active for this guild';
COMMENT ON COLUMN guild_subscriptions.cancel_at_period_end IS 'If true, subscription will not renew at period end';
COMMENT ON COLUMN guild_subscriptions.lifetime IS 'If true, this is a lifetime purchase with no expiration';
COMMENT ON COLUMN webhook_events.event_hash IS 'SHA-256 hash of payload for duplicate detection';

-- INITIAL DATA removed: test INSERT was non-idempotent and created duplicate rows on re-runs.
