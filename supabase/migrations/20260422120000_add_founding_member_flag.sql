ALTER TABLE IF EXISTS public.guild_subscriptions
  ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_guild_subscriptions_founding_member
  ON public.guild_subscriptions(is_founding_member)
  WHERE is_founding_member = true;
