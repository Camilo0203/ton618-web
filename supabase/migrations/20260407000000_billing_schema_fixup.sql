-- Migration: Billing Schema Fixup
-- Addresses two classes of problems:
--
-- 1. Tables created by 20260406000000 (old schema) are missing columns
--    expected by BillingDatabase (billing-webhook, billing-create-checkout).
--    Uses ADD COLUMN IF NOT EXISTS so this is safe to re-run.
--
-- 2. Tables created by 20260406200000 are missing columns added in
--    20260406210000 (billing_system_v2) that were skipped because
--    IF NOT EXISTS suppressed table recreation.
--
-- 3. Adds increment_webhook_retry RPC used by database.ts.
-- 4. Adds cleanup function for processed webhook_events.
-- 5. Ensures uuid-ossp extension is present.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FIX: purchases table
-- Old schema (20260406000000) has lemon_squeezy_order_id but
-- BillingDatabase expects: provider, provider_order_id, kind,
-- billing_type, amount, currency, raw_payload, refunded_at, created_at
-- ============================================================
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS provider            TEXT    NOT NULL DEFAULT 'lemon_squeezy',
  ADD COLUMN IF NOT EXISTS provider_order_id   TEXT,
  ADD COLUMN IF NOT EXISTS provider_product_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_variant_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_key            TEXT,
  ADD COLUMN IF NOT EXISTS kind                TEXT,
  ADD COLUMN IF NOT EXISTS billing_type        TEXT,
  ADD COLUMN IF NOT EXISTS amount              INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency            TEXT    NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS raw_payload         JSONB,
  ADD COLUMN IF NOT EXISTS refunded_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at          TIMESTAMPTZ DEFAULT NOW();

-- Backfill from old lemon_squeezy_order_id column if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'purchases'
      AND column_name = 'lemon_squeezy_order_id'
  ) THEN
    UPDATE purchases
    SET
      provider_order_id = lemon_squeezy_order_id,
      plan_key          = COALESCE(plan_key, plan_type),
      kind              = COALESCE(kind,
                            CASE plan_type
                              WHEN 'lifetime' THEN 'premium_lifetime'
                              ELSE 'premium_subscription'
                            END),
      billing_type      = COALESCE(billing_type,
                            CASE plan_type
                              WHEN 'lifetime' THEN 'one_time'
                              ELSE 'subscription'
                            END),
      created_at        = COALESCE(created_at, purchased_at)
    WHERE provider_order_id IS NULL;
  END IF;
END $$;

-- Add composite UNIQUE constraint on (provider, provider_order_id) if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_provider_order'
      AND conrelid = 'public.purchases'::regclass
  ) AND NOT EXISTS (
    SELECT 1 FROM purchases WHERE provider_order_id IS NULL
  ) THEN
    ALTER TABLE purchases
      ADD CONSTRAINT unique_provider_order UNIQUE (provider, provider_order_id);
  END IF;
END $$;

-- ============================================================
-- FIX: donations table
-- Old schema has amount_cents; BillingDatabase expects amount,
-- provider, provider_order_id, status, raw_payload, refunded_at
-- ============================================================
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS provider          TEXT    NOT NULL DEFAULT 'lemon_squeezy',
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS amount            INTEGER,
  ADD COLUMN IF NOT EXISTS status            TEXT    NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS raw_payload       JSONB,
  ADD COLUMN IF NOT EXISTS refunded_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS donor_name        TEXT,
  ADD COLUMN IF NOT EXISTS created_at        TIMESTAMPTZ DEFAULT NOW();

-- Backfill from old columns if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'donations'
      AND column_name = 'lemon_squeezy_order_id'
  ) THEN
    UPDATE donations
    SET
      provider_order_id = lemon_squeezy_order_id,
      amount            = COALESCE(amount, amount_cents),
      created_at        = COALESCE(created_at, donated_at)
    WHERE provider_order_id IS NULL;
  END IF;
END $$;

-- Add composite UNIQUE constraint on (provider, provider_order_id) if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_donation_order'
      AND conrelid = 'public.donations'::regclass
  ) AND NOT EXISTS (
    SELECT 1 FROM donations WHERE provider_order_id IS NULL
  ) THEN
    ALTER TABLE donations
      ADD CONSTRAINT unique_donation_order UNIQUE (provider, provider_order_id);
  END IF;
END $$;

-- ============================================================
-- FIX: guild_subscriptions
-- v2 schema (20260406210000) added kind, started_at, cancelled_at,
-- provider_order_id but they were skipped when tables already existed.
-- ============================================================
ALTER TABLE guild_subscriptions
  ADD COLUMN IF NOT EXISTS kind              TEXT,
  ADD COLUMN IF NOT EXISTS started_at        TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS cancelled_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT;

-- Partial unique index on provider_subscription_id (non-null rows only).
-- This enables database.ts createGuildSubscription to upsert idempotently:
--   supabase.from('guild_subscriptions').upsert(..., { onConflict: 'provider_subscription_id' })
-- Partial index avoids the problem of NULL != NULL in UNIQUE constraints (lifetime rows have NULL).
CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_subscriptions_unique_provider_sub_dedup
  ON guild_subscriptions (provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;

-- ============================================================
-- ADD: increment_webhook_retry RPC
-- Referenced in database.ts BillingDatabase.incrementWebhookRetry()
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_webhook_retry(webhook_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE webhook_events
  SET
    retry_count   = COALESCE(retry_count, 0) + 1,
    error_message = 'Retry scheduled at ' || NOW()::text
  WHERE id = webhook_id;
END;
$$;

-- ============================================================
-- ADD: cleanup_processed_webhook_events
-- Removes processed events older than 90 days to prevent unbounded growth.
-- Call periodically via pg_cron or a scheduled Edge Function.
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_processed_webhook_events(
  retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_events
  WHERE processed = true
    AND created_at < NOW() - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================================
-- FIX: old RLS policies used auth.jwt() ->> 'role' = 'service_role'
-- which is incorrect — service role bypass is via auth.role().
-- Drop and recreate on tables that may have old policies from
-- 20260406000001.
-- ============================================================
DO $$
BEGIN
  -- subscriptions (old table from 20260406000000)
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'subscriptions' AND schemaname = 'public'
  ) THEN
    DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;
    CREATE POLICY "Service role can manage all subscriptions"
      ON subscriptions FOR ALL
      USING (auth.role() = 'service_role');
  END IF;

  -- guild_premium (old table from 20260406000000)
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'guild_premium' AND schemaname = 'public'
  ) THEN
    DROP POLICY IF EXISTS "Service role can manage guild premium" ON guild_premium;
    CREATE POLICY "Service role can manage guild premium"
      ON guild_premium FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;
