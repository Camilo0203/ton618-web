-- Migration: Add pg_cron job to expire guild subscriptions automatically
--
-- Fixes NF6: removes the side-effect write (deactivateGuildSubscription) from
-- the read method getGuildPremiumStatus in _shared/database.ts.
-- Expiration is now handled entirely in the database layer, once per hour,
-- with zero application-level race conditions.
--
-- Requirements:
--   - pg_cron extension must be enabled in the Supabase project Dashboard
--     (Database → Extensions → pg_cron).  This migration enables it too, but
--     on managed Supabase the superuser permission is required — enabling it
--     from the Dashboard is the safest path.
--
-- Targets table: public.guild_subscriptions (created in 20260406200000)

-- 1. Enable pg_cron (no-op if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Grant usage to postgres role (required by pg_cron on Supabase)
GRANT USAGE ON SCHEMA cron TO postgres;

-- 3. Remove previous version of this job if it exists (idempotent re-run)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-guild-subscriptions') THEN
    PERFORM cron.unschedule('expire-guild-subscriptions');
  END IF;
END;
$$;

-- 4. Schedule the expiry job — runs at minute 0 of every hour
SELECT cron.schedule(
  'expire-guild-subscriptions',
  '0 * * * *',
  $$
    UPDATE public.guild_subscriptions
    SET
      status      = 'expired',
      premium_enabled = false,
      updated_at  = now()
    WHERE ends_at       < now()
      AND premium_enabled = true
      AND lifetime        = false
      AND status IN ('active', 'cancelled', 'past_due');
  $$
);
