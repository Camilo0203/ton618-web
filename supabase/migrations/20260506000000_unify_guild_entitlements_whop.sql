-- Migration: Unify guild_effective_entitlements to include Whop/Lemon Squeezy subscriptions
-- Date: 2026-05-06
-- Problem: guild_effective_entitlements only read guild_billing_subscriptions (Stripe)
-- and guild_entitlement_overrides. Whop writes to guild_subscriptions, so dashboard
-- showed 'free' for active Whop subscribers.

-- Drop and recreate the view to include guild_subscriptions (provider = 'whop' or 'lemon_squeezy')
create or replace view public.guild_effective_entitlements
with (security_invoker = true)
as
with override_state as (
  select
    o.guild_id,
    o.plan_override,
    o.plan_override_expires_at,
    o.supporter_enabled,
    o.supporter_expires_at,
    o.updated_at
  from public.guild_entitlement_overrides o
),
whop_subscription_state as (
  select
    s.guild_id,
    s.plan_key,
    s.status,
    s.premium_enabled,
    s.ends_at,
    s.lifetime,
    s.updated_at
  from public.guild_subscriptions s
  where s.premium_enabled = true
    and (
      s.ends_at is null
      or s.ends_at > now()
    )
),
stripe_subscription_state as (
  select
    s.guild_id,
    s.status,
    s.billing_interval,
    s.current_period_end,
    s.cancel_at_period_end,
    s.updated_at
  from public.guild_billing_subscriptions s
),
guild_scope as (
  select guild_id from public.bot_guilds
  union
  select guild_id from public.guild_billing_subscriptions
  union
  select guild_id from public.guild_entitlement_overrides
  union
  select guild_id from public.guild_subscriptions
)
select
  scope.guild_id,
  case
    -- Override wins always
    when overrides.plan_override is not null
      and (
        overrides.plan_override_expires_at is null
        or overrides.plan_override_expires_at > now()
      ) then overrides.plan_override
    -- Whop/Lemon Squeezy active subscription
    when whop_subs.premium_enabled = true then coalesce(whop_subs.plan_key, 'pro')
    -- Stripe active subscription
    when subscriptions.status in ('trialing', 'active', 'past_due')
      and (
        subscriptions.current_period_end is null
        or subscriptions.current_period_end > now()
      ) then 'pro'
    else 'free'
  end as effective_plan,
  case
    when overrides.plan_override is not null
      and (
        overrides.plan_override_expires_at is null
        or overrides.plan_override_expires_at > now()
      ) then 'override'
    when whop_subs.premium_enabled = true then 'whop'
    when subscriptions.status in ('trialing', 'active', 'past_due')
      and (
        subscriptions.current_period_end is null
        or subscriptions.current_period_end > now()
      ) then 'stripe'
    else 'free'
  end as plan_source,
  coalesce(whop_subs.status, subscriptions.status) as subscription_status,
  coalesce(
    case
      when whop_subs.premium_enabled then
        case whop_subs.plan_key
          when 'pro_monthly' then 'month'
          when 'pro_yearly' then 'year'
          else null
        end
    end,
    subscriptions.billing_interval
  ) as billing_interval,
  case
    when overrides.plan_override is not null
      and (
        overrides.plan_override_expires_at is null
        or overrides.plan_override_expires_at > now()
      ) then overrides.plan_override_expires_at
    when whop_subs.premium_enabled = true then whop_subs.ends_at
    when subscriptions.status in ('trialing', 'active', 'past_due')
      and (
        subscriptions.current_period_end is null
        or subscriptions.current_period_end > now()
      ) then subscriptions.current_period_end
    else null
  end as plan_expires_at,
  subscriptions.current_period_end,
  coalesce(subscriptions.cancel_at_period_end, false) as cancel_at_period_end,
  case
    when overrides.supporter_enabled = true
      and (
        overrides.supporter_expires_at is null
        or overrides.supporter_expires_at > now()
      ) then true
    else false
  end as supporter_enabled,
  case
    when overrides.supporter_enabled = true
      and (
        overrides.supporter_expires_at is null
        or overrides.supporter_expires_at > now()
      ) then overrides.supporter_expires_at
    else null
  end as supporter_expires_at,
  greatest(
    coalesce(overrides.updated_at, '-infinity'::timestamptz),
    coalesce(whop_subs.updated_at, '-infinity'::timestamptz),
    coalesce(subscriptions.updated_at, '-infinity'::timestamptz)
  ) as updated_at
from guild_scope scope
left join override_state overrides on overrides.guild_id = scope.guild_id
left join whop_subscription_state whop_subs on whop_subs.guild_id = scope.guild_id
left join stripe_subscription_state subscriptions on subscriptions.guild_id = scope.guild_id;

-- Re-grant select to authenticated users
grant select on public.guild_effective_entitlements to authenticated;
