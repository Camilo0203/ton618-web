-- Add Tebex as a supported billing provider and expose the real provider
-- through the effective guild entitlement view.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'guild_subscriptions_provider_check'
      AND conrelid = 'public.guild_subscriptions'::regclass
  ) THEN
    ALTER TABLE public.guild_subscriptions
      DROP CONSTRAINT guild_subscriptions_provider_check;
  END IF;
END $$;

ALTER TABLE public.guild_subscriptions
  ADD CONSTRAINT guild_subscriptions_provider_check
  CHECK (provider IN ('lemon_squeezy', 'stripe', 'paypal', 'whop', 'tebex'));

CREATE OR REPLACE VIEW public.guild_effective_entitlements
WITH (security_invoker = true)
AS
WITH override_state AS (
  SELECT
    o.guild_id,
    o.plan_override,
    o.plan_override_expires_at,
    o.supporter_enabled,
    o.supporter_expires_at,
    o.updated_at
  FROM public.guild_entitlement_overrides o
),
provider_subscription_state AS (
  SELECT DISTINCT ON (s.guild_id)
    s.guild_id,
    s.provider,
    s.plan_key,
    s.status,
    s.premium_enabled,
    s.ends_at,
    s.lifetime,
    s.updated_at
  FROM public.guild_subscriptions s
  WHERE s.premium_enabled = true
    AND s.status IN ('active', 'past_due', 'cancelled')
    AND (
      s.ends_at IS NULL
      OR s.ends_at > NOW()
    )
  ORDER BY s.guild_id, s.updated_at DESC
),
stripe_subscription_state AS (
  SELECT
    s.guild_id,
    s.status,
    s.billing_interval,
    s.current_period_end,
    s.cancel_at_period_end,
    s.updated_at
  FROM public.guild_billing_subscriptions s
),
guild_scope AS (
  SELECT guild_id FROM public.bot_guilds
  UNION
  SELECT guild_id FROM public.guild_billing_subscriptions
  UNION
  SELECT guild_id FROM public.guild_entitlement_overrides
  UNION
  SELECT guild_id FROM public.guild_subscriptions
)
SELECT
  scope.guild_id,
  CASE
    WHEN overrides.plan_override IS NOT NULL
      AND (
        overrides.plan_override_expires_at IS NULL
        OR overrides.plan_override_expires_at > NOW()
      ) THEN overrides.plan_override
    WHEN provider_subs.premium_enabled = true THEN COALESCE(provider_subs.plan_key, 'pro')
    WHEN subscriptions.status IN ('trialing', 'active', 'past_due')
      AND (
        subscriptions.current_period_end IS NULL
        OR subscriptions.current_period_end > NOW()
      ) THEN 'pro'
    ELSE 'free'
  END AS effective_plan,
  CASE
    WHEN overrides.plan_override IS NOT NULL
      AND (
        overrides.plan_override_expires_at IS NULL
        OR overrides.plan_override_expires_at > NOW()
      ) THEN 'override'
    WHEN provider_subs.premium_enabled = true THEN provider_subs.provider
    WHEN subscriptions.status IN ('trialing', 'active', 'past_due')
      AND (
        subscriptions.current_period_end IS NULL
        OR subscriptions.current_period_end > NOW()
      ) THEN 'stripe'
    ELSE 'free'
  END AS plan_source,
  COALESCE(provider_subs.status, subscriptions.status) AS subscription_status,
  COALESCE(
    CASE
      WHEN provider_subs.premium_enabled THEN
        CASE provider_subs.plan_key
          WHEN 'pro_monthly' THEN 'month'
          WHEN 'pro_yearly' THEN 'year'
          ELSE NULL
        END
    END,
    subscriptions.billing_interval
  ) AS billing_interval,
  CASE
    WHEN overrides.plan_override IS NOT NULL
      AND (
        overrides.plan_override_expires_at IS NULL
        OR overrides.plan_override_expires_at > NOW()
      ) THEN overrides.plan_override_expires_at
    WHEN provider_subs.premium_enabled = true THEN provider_subs.ends_at
    WHEN subscriptions.status IN ('trialing', 'active', 'past_due')
      AND (
        subscriptions.current_period_end IS NULL
        OR subscriptions.current_period_end > NOW()
      ) THEN subscriptions.current_period_end
    ELSE NULL
  END AS plan_expires_at,
  subscriptions.current_period_end,
  COALESCE(subscriptions.cancel_at_period_end, false) AS cancel_at_period_end,
  CASE
    WHEN overrides.supporter_enabled = true
      AND (
        overrides.supporter_expires_at IS NULL
        OR overrides.supporter_expires_at > NOW()
      ) THEN true
    ELSE false
  END AS supporter_enabled,
  CASE
    WHEN overrides.supporter_enabled = true
      AND (
        overrides.supporter_expires_at IS NULL
        OR overrides.supporter_expires_at > NOW()
      ) THEN overrides.supporter_expires_at
    ELSE NULL
  END AS supporter_expires_at,
  GREATEST(
    COALESCE(overrides.updated_at, '-infinity'::timestamptz),
    COALESCE(provider_subs.updated_at, '-infinity'::timestamptz),
    COALESCE(subscriptions.updated_at, '-infinity'::timestamptz)
  ) AS updated_at
FROM guild_scope scope
LEFT JOIN override_state overrides ON overrides.guild_id = scope.guild_id
LEFT JOIN provider_subscription_state provider_subs ON provider_subs.guild_id = scope.guild_id
LEFT JOIN stripe_subscription_state subscriptions ON subscriptions.guild_id = scope.guild_id;

GRANT SELECT ON public.guild_effective_entitlements TO authenticated;
