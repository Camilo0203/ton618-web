-- Migration: Add Whop as a supported billing provider
-- Updates CHECK constraints on guild_subscriptions, purchases, and donations
-- to include 'whop' alongside existing providers.

-- ============================================================
-- guild_subscriptions.provider
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'guild_subscriptions_provider_check'
      AND conrelid = 'public.guild_subscriptions'::regclass
  ) THEN
    ALTER TABLE public.guild_subscriptions DROP CONSTRAINT guild_subscriptions_provider_check;
  END IF;
END $$;

ALTER TABLE public.guild_subscriptions
  ADD CONSTRAINT guild_subscriptions_provider_check
  CHECK (provider IN ('lemon_squeezy', 'stripe', 'paypal', 'whop'));

-- ============================================================
-- purchases.provider  (no named check in original — safe to add)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'purchases_provider_check'
      AND conrelid = 'public.purchases'::regclass
  ) THEN
    ALTER TABLE public.purchases DROP CONSTRAINT purchases_provider_check;
  END IF;
END $$;

-- purchases.provider has no CHECK in original schema, so just ensure
-- any future enforcement is consistent — add only if not present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'purchases_provider_check'
      AND conrelid = 'public.purchases'::regclass
  ) THEN
    -- No-op: purchases.provider has no CHECK constraint in existing migrations.
    -- Whop purchases will insert with provider = 'whop' without constraint issues.
    NULL;
  END IF;
END $$;

-- ============================================================
-- donations.provider  (same — no CHECK in original schema)
-- ============================================================
-- No action needed; donations.provider has no CHECK constraint.

-- ============================================================
-- webhook_events.provider  (no CHECK constraint in original schema)
-- ============================================================
-- No action needed; webhook_events.provider has no CHECK constraint.
