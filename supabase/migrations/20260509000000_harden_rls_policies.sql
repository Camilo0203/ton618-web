-- Migration: Harden RLS policies
-- Fixes:
--   1. bot_guilds — had RLS enabled but zero policies (effectively blocking all access)
--   2. guild_premium — SELECT policy was fully public; restrict to authenticated users
--   3. bot_stats  — already public-read; add explicit service_role write-only policy
--   4. user_guild_access — add service_role write policy (bot writes guild sync data)

-- ============================================================
-- 1. bot_guilds
--    Read: only users who have an access row in user_guild_access for that guild
--    Write: service_role only (bot backend)
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.bot_guilds') IS NOT NULL THEN

    DROP POLICY IF EXISTS "Authenticated users can view their guilds" ON public.bot_guilds;
    CREATE POLICY "Authenticated users can view their guilds"
      ON public.bot_guilds
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_guild_access uga
          WHERE uga.user_id = auth.uid()
            AND uga.guild_id = bot_guilds.guild_id
        )
      );

    DROP POLICY IF EXISTS "Service role can manage bot_guilds" ON public.bot_guilds;
    CREATE POLICY "Service role can manage bot_guilds"
      ON public.bot_guilds
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');

  END IF;
END $$;

-- ============================================================
-- 2. guild_premium — restrict public SELECT to authenticated only
--    (no need for anonymous users to know which guilds have premium)
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.guild_premium') IS NOT NULL THEN

    DROP POLICY IF EXISTS "Anyone can view guild premium status" ON public.guild_premium;

    DROP POLICY IF EXISTS "Authenticated users can view guild premium status" ON public.guild_premium;
    CREATE POLICY "Authenticated users can view guild premium status"
      ON public.guild_premium
      FOR SELECT
      TO authenticated
      USING (true);

    DROP POLICY IF EXISTS "Service role can manage guild premium" ON public.guild_premium;
    CREATE POLICY "Service role can manage guild premium"
      ON public.guild_premium
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');

  END IF;
END $$;

-- ============================================================
-- 3. bot_stats — keep public read, add service_role write policy
-- ============================================================
ALTER TABLE IF EXISTS public.bot_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regclass('public.bot_stats') IS NOT NULL THEN

    DROP POLICY IF EXISTS "Anyone can view bot stats" ON public.bot_stats;
    CREATE POLICY "Anyone can view bot stats"
      ON public.bot_stats
      FOR SELECT
      TO anon, authenticated
      USING (true);

    DROP POLICY IF EXISTS "Service role can manage bot_stats" ON public.bot_stats;
    CREATE POLICY "Service role can manage bot_stats"
      ON public.bot_stats
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');

  END IF;
END $$;

-- ============================================================
-- 4. user_guild_access — add service_role write policy
--    (bot backend writes guild sync data via service_role key)
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.user_guild_access') IS NOT NULL THEN

    DROP POLICY IF EXISTS "Service role can manage user_guild_access" ON public.user_guild_access;
    CREATE POLICY "Service role can manage user_guild_access"
      ON public.user_guild_access
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');

  END IF;
END $$;
