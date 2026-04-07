-- ============================================
-- BILLING SYSTEM V2 - Clear Product Modeling
-- ============================================
-- Created: 2026-04-06
-- Purpose: Model 4 distinct monetization types with clear rules

-- Ensure required extensions are available even if run standalone
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS TABLE
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

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- 2. GUILD SUBSCRIPTIONS TABLE
-- Source of truth for premium status
-- ============================================
CREATE TABLE IF NOT EXISTS guild_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Guild and Owner
  guild_id TEXT NOT NULL,
  discord_user_id TEXT NOT NULL REFERENCES users(discord_user_id) ON DELETE CASCADE,
  
  -- Provider Info
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_customer_id TEXT,
  provider_subscription_id TEXT, -- NULL for one_time purchases
  provider_order_id TEXT, -- For one_time purchases
  
  -- Product Classification
  plan_key TEXT NOT NULL CHECK (plan_key IN ('pro_monthly', 'pro_yearly', 'lifetime')),
  billing_type TEXT NOT NULL CHECK (billing_type IN ('subscription', 'one_time')),
  kind TEXT NOT NULL CHECK (kind IN ('premium_subscription', 'premium_lifetime')),
  
  -- Status and Premium Control
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',           -- Subscription active or lifetime valid
    'cancelled',        -- Subscription cancelled but still in grace period
    'expired',          -- Subscription expired or lifetime revoked
    'past_due',         -- Payment failed but not expired yet
    'paused',           -- Subscription paused
    'incomplete'        -- Initial payment incomplete
  )),
  premium_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Lifecycle Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  renews_at TIMESTAMPTZ,           -- NULL for lifetime
  ends_at TIMESTAMPTZ,              -- NULL for lifetime, set when cancelled
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  
  -- Lifetime Flag
  lifetime BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_active_guild_subscription UNIQUE (guild_id, status) 
    WHERE status = 'active' AND premium_enabled = true,
  
  CONSTRAINT lifetime_no_renewal CHECK (
    (lifetime = true AND renews_at IS NULL AND ends_at IS NULL) OR
    (lifetime = false)
  ),
  
  CONSTRAINT subscription_has_provider_id CHECK (
    (billing_type = 'subscription' AND provider_subscription_id IS NOT NULL) OR
    (billing_type = 'one_time' AND provider_order_id IS NOT NULL)
  ),
  
  CONSTRAINT lifetime_is_one_time CHECK (
    (plan_key = 'lifetime' AND billing_type = 'one_time' AND kind = 'premium_lifetime' AND lifetime = true) OR
    (plan_key != 'lifetime')
  )
);

CREATE INDEX IF NOT EXISTS idx_guild_subs_guild_id ON guild_subscriptions(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_subs_user_id ON guild_subscriptions(discord_user_id);
CREATE INDEX IF NOT EXISTS idx_guild_subs_provider_sub ON guild_subscriptions(provider_subscription_id) WHERE provider_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guild_subs_provider_order ON guild_subscriptions(provider_order_id) WHERE provider_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guild_subs_status ON guild_subscriptions(status, premium_enabled);
CREATE INDEX IF NOT EXISTS idx_guild_subs_renews_at ON guild_subscriptions(renews_at) WHERE renews_at IS NOT NULL;

-- ============================================
-- 3. PURCHASES TABLE
-- Audit log of all transactions
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Provider Info
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_order_id TEXT NOT NULL,
  provider_product_id TEXT,
  provider_variant_id TEXT,
  
  -- Customer Info
  discord_user_id TEXT REFERENCES users(discord_user_id) ON DELETE SET NULL,
  guild_id TEXT, -- NULL for donations
  
  -- Product Classification
  plan_key TEXT NOT NULL CHECK (plan_key IN ('pro_monthly', 'pro_yearly', 'lifetime', 'donate')),
  billing_type TEXT NOT NULL CHECK (billing_type IN ('subscription', 'one_time')),
  kind TEXT NOT NULL CHECK (kind IN ('premium_subscription', 'premium_lifetime', 'donation')),
  
  -- Financial Info
  amount INTEGER NOT NULL CHECK (amount >= 0), -- in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
    'completed',
    'refunded',
    'partially_refunded',
    'failed'
  )),
  
  -- Metadata
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_provider_order UNIQUE (provider, provider_order_id),
  
  CONSTRAINT donation_no_guild CHECK (
    (kind = 'donation' AND guild_id IS NULL) OR
    (kind != 'donation' AND guild_id IS NOT NULL)
  ),
  
  CONSTRAINT premium_requires_guild CHECK (
    (kind IN ('premium_subscription', 'premium_lifetime') AND guild_id IS NOT NULL) OR
    (kind = 'donation')
  )
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(discord_user_id) WHERE discord_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_guild_id ON purchases(guild_id) WHERE guild_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_kind ON purchases(kind);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- ============================================
-- 4. DONATIONS TABLE
-- Separate tracking for donations
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Provider Info
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_order_id TEXT NOT NULL,
  
  -- Donor Info (nullable for anonymous)
  discord_user_id TEXT REFERENCES users(discord_user_id) ON DELETE SET NULL,
  donor_name TEXT, -- For anonymous donations
  
  -- Financial Info
  amount INTEGER NOT NULL CHECK (amount > 0), -- in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
    'completed',
    'refunded'
  )),
  
  -- Optional Message
  message TEXT,
  
  -- Metadata
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_donation_order UNIQUE (provider, provider_order_id)
);

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(discord_user_id) WHERE discord_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- ============================================
-- 5. WEBHOOK EVENTS TABLE
-- Idempotency and audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Provider Info
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  event_name TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_hash TEXT NOT NULL, -- SHA-256 of payload for idempotency
  
  -- Processing Status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Payload
  raw_payload JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_provider_event UNIQUE (provider, event_id),
  CONSTRAINT unique_event_hash UNIQUE (event_hash)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_name ON webhook_events(event_name);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function: Check if guild has active premium
CREATE OR REPLACE FUNCTION guild_has_premium(p_guild_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM guild_subscriptions
    WHERE guild_id = p_guild_id
      AND premium_enabled = true
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get active subscription for guild
CREATE OR REPLACE FUNCTION get_active_guild_subscription(p_guild_id TEXT)
RETURNS TABLE (
  id UUID,
  plan_key TEXT,
  billing_type TEXT,
  kind TEXT,
  status TEXT,
  premium_enabled BOOLEAN,
  lifetime BOOLEAN,
  renews_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gs.id,
    gs.plan_key,
    gs.billing_type,
    gs.kind,
    gs.status,
    gs.premium_enabled,
    gs.lifetime,
    gs.renews_at,
    gs.ends_at,
    gs.cancel_at_period_end
  FROM guild_subscriptions gs
  WHERE gs.guild_id = p_guild_id
    AND gs.premium_enabled = true
    AND gs.status = 'active'
  ORDER BY gs.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Deactivate expired subscriptions
CREATE OR REPLACE FUNCTION deactivate_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE guild_subscriptions
  SET 
    premium_enabled = false,
    status = 'expired',
    updated_at = NOW()
  WHERE 
    premium_enabled = true
    AND status IN ('active', 'cancelled')
    AND lifetime = false
    AND ends_at IS NOT NULL
    AND ends_at < NOW();
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. VIEWS
-- ============================================

-- View: Active guild subscriptions with full details
CREATE OR REPLACE VIEW active_guild_subscriptions AS
SELECT 
  gs.id,
  gs.guild_id,
  gs.discord_user_id,
  u.username,
  gs.plan_key,
  gs.billing_type,
  gs.kind,
  gs.status,
  gs.premium_enabled,
  gs.lifetime,
  gs.renews_at,
  gs.ends_at,
  gs.cancel_at_period_end,
  gs.started_at,
  gs.created_at,
  gs.updated_at
FROM guild_subscriptions gs
LEFT JOIN users u ON gs.discord_user_id = u.discord_user_id
WHERE gs.premium_enabled = true
  AND gs.status = 'active';

-- View: Revenue summary
CREATE OR REPLACE VIEW revenue_summary AS
SELECT 
  plan_key,
  kind,
  billing_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_revenue_cents,
  SUM(amount) / 100.0 as total_revenue_usd,
  AVG(amount) / 100.0 as avg_revenue_usd,
  MIN(created_at) as first_purchase,
  MAX(created_at) as last_purchase
FROM purchases
WHERE status = 'completed'
GROUP BY plan_key, kind, billing_type
ORDER BY total_revenue_cents DESC;

-- View: Donation summary
CREATE OR REPLACE VIEW donation_summary AS
SELECT 
  COUNT(*) as total_donations,
  COUNT(DISTINCT discord_user_id) as unique_donors,
  SUM(amount) as total_amount_cents,
  SUM(amount) / 100.0 as total_amount_usd,
  AVG(amount) / 100.0 as avg_donation_usd,
  MIN(created_at) as first_donation,
  MAX(created_at) as last_donation
FROM donations
WHERE status = 'completed';

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Users: Can only see their own data
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (discord_user_id = auth.uid()::text);

-- Guild Subscriptions: Can see their own guilds
CREATE POLICY guild_subs_select_own ON guild_subscriptions
  FOR SELECT
  USING (discord_user_id = auth.uid()::text);

-- Purchases: Can see their own purchases
CREATE POLICY purchases_select_own ON purchases
  FOR SELECT
  USING (discord_user_id = auth.uid()::text);

-- Donations: Can see their own donations
CREATE POLICY donations_select_own ON donations
  FOR SELECT
  USING (discord_user_id = auth.uid()::text);

-- Service role has full access (for Edge Functions)
CREATE POLICY users_service_role ON users
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY guild_subs_service_role ON guild_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY purchases_service_role ON purchases
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY donations_service_role ON donations
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY webhook_events_service_role ON webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 9. TRIGGERS
-- ============================================

-- Trigger: Update updated_at on guild_subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guild_subscriptions_updated_at
  BEFORE UPDATE ON guild_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
