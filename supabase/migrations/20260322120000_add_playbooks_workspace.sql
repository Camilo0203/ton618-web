/*
  # Add live playbooks workspace

  1. New read models
    - guild_playbook_definitions
    - guild_playbook_runs
    - guild_customer_memory
    - guild_ticket_recommendations

  2. Security
    - Select RLS for manageable guilds

  3. RPC
    - Allow playbook confirmation and dismissal through request_ticket_dashboard_action
*/

create table if not exists public.guild_playbook_definitions (
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  playbook_id text not null,
  key text not null,
  label text not null,
  description text not null,
  tier text not null default 'free',
  execution_mode text not null default 'assistive',
  summary text not null,
  trigger_summary text not null,
  is_enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (guild_id, playbook_id),
  constraint guild_playbook_definitions_tier_check
    check (tier in ('free', 'pro', 'enterprise')),
  constraint guild_playbook_definitions_execution_mode_check
    check (execution_mode in ('assistive', 'manual', 'guided'))
);

create table if not exists public.guild_playbook_runs (
  run_id text primary key,
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  playbook_id text not null,
  ticket_id text not null,
  user_id text not null,
  status text not null default 'pending',
  tone text not null default 'neutral',
  title text not null,
  summary text not null,
  reason text not null,
  suggested_action text,
  suggested_priority text,
  suggested_status text,
  suggested_macro_id text,
  confidence numeric(4,3) not null default 0,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guild_playbook_runs_status_check
    check (status in ('pending', 'applied', 'dismissed')),
  constraint guild_playbook_runs_tone_check
    check (tone in ('neutral', 'info', 'success', 'warning', 'danger')),
  constraint guild_playbook_runs_priority_check
    check (suggested_priority is null or suggested_priority in ('low', 'normal', 'high', 'urgent')),
  constraint guild_playbook_runs_status_target_check
    check (suggested_status is null or suggested_status in ('new', 'triage', 'waiting_user', 'waiting_staff', 'escalated', 'resolved', 'closed')),
  constraint guild_playbook_runs_confidence_check
    check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.guild_customer_memory (
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  user_id text not null,
  display_label text not null,
  total_tickets integer not null default 0,
  open_tickets integer not null default 0,
  resolved_tickets integer not null default 0,
  breached_tickets integer not null default 0,
  recent_tags jsonb not null default '[]'::jsonb,
  last_ticket_at timestamptz,
  last_resolved_at timestamptz,
  risk_level text not null default 'new',
  summary text not null,
  updated_at timestamptz not null default now(),
  primary key (guild_id, user_id),
  constraint guild_customer_memory_risk_level_check
    check (risk_level in ('new', 'returning', 'watch'))
);

create table if not exists public.guild_ticket_recommendations (
  recommendation_id text primary key,
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  ticket_id text not null,
  user_id text not null,
  playbook_id text not null,
  status text not null default 'pending',
  tone text not null default 'neutral',
  title text not null,
  summary text not null,
  reason text not null,
  suggested_action text,
  suggested_priority text,
  suggested_status text,
  suggested_macro_id text,
  confidence numeric(4,3) not null default 0,
  customer_risk_level text not null default 'new',
  customer_summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guild_ticket_recommendations_status_check
    check (status in ('pending', 'applied', 'dismissed')),
  constraint guild_ticket_recommendations_tone_check
    check (tone in ('neutral', 'info', 'success', 'warning', 'danger')),
  constraint guild_ticket_recommendations_priority_check
    check (suggested_priority is null or suggested_priority in ('low', 'normal', 'high', 'urgent')),
  constraint guild_ticket_recommendations_status_target_check
    check (suggested_status is null or suggested_status in ('new', 'triage', 'waiting_user', 'waiting_staff', 'escalated', 'resolved', 'closed')),
  constraint guild_ticket_recommendations_risk_level_check
    check (customer_risk_level in ('new', 'returning', 'watch')),
  constraint guild_ticket_recommendations_confidence_check
    check (confidence >= 0 and confidence <= 1)
);

create index if not exists guild_playbook_definitions_guild_sort_idx
  on public.guild_playbook_definitions (guild_id, sort_order asc);

create index if not exists guild_playbook_runs_guild_status_idx
  on public.guild_playbook_runs (guild_id, status, updated_at desc);

create index if not exists guild_customer_memory_guild_risk_idx
  on public.guild_customer_memory (guild_id, risk_level, updated_at desc);

create index if not exists guild_ticket_recommendations_guild_status_idx
  on public.guild_ticket_recommendations (guild_id, status, updated_at desc);

drop trigger if exists set_guild_playbook_definitions_updated_at on public.guild_playbook_definitions;
create trigger set_guild_playbook_definitions_updated_at
before update on public.guild_playbook_definitions
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists set_guild_playbook_runs_updated_at on public.guild_playbook_runs;
create trigger set_guild_playbook_runs_updated_at
before update on public.guild_playbook_runs
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists set_guild_customer_memory_updated_at on public.guild_customer_memory;
create trigger set_guild_customer_memory_updated_at
before update on public.guild_customer_memory
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists set_guild_ticket_recommendations_updated_at on public.guild_ticket_recommendations;
create trigger set_guild_ticket_recommendations_updated_at
before update on public.guild_ticket_recommendations
for each row execute function public.set_updated_at_timestamp();

alter table public.guild_playbook_definitions enable row level security;
alter table public.guild_playbook_runs enable row level security;
alter table public.guild_customer_memory enable row level security;
alter table public.guild_ticket_recommendations enable row level security;

drop policy if exists "Users can read manageable playbook definitions" on public.guild_playbook_definitions;
create policy "Users can read manageable playbook definitions"
  on public.guild_playbook_definitions
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

drop policy if exists "Users can read manageable playbook runs" on public.guild_playbook_runs;
create policy "Users can read manageable playbook runs"
  on public.guild_playbook_runs
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

drop policy if exists "Users can read manageable customer memory" on public.guild_customer_memory;
create policy "Users can read manageable customer memory"
  on public.guild_customer_memory
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

drop policy if exists "Users can read manageable ticket recommendations" on public.guild_ticket_recommendations;
create policy "Users can read manageable ticket recommendations"
  on public.guild_ticket_recommendations
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

create or replace function public.request_ticket_dashboard_action(
  p_guild_id text,
  p_action text,
  p_payload jsonb
)
returns setof public.guild_config_mutations
language plpgsql
as $$
declare
  v_user_id uuid := auth.uid();
  v_action text := lower(trim(coalesce(p_action, '')));
  v_mutation public.guild_config_mutations%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_manageable_guild(p_guild_id) then
    raise exception 'You do not have access to this guild';
  end if;

  if not exists (
    select 1
    from public.bot_guilds
    where guild_id = p_guild_id
  ) then
    raise exception 'The bot is not installed in this guild';
  end if;

  if v_action not in (
    'claim',
    'unclaim',
    'assign_self',
    'unassign',
    'set_status',
    'close',
    'reopen',
    'add_note',
    'add_tag',
    'remove_tag',
    'reply_customer',
    'post_macro',
    'set_priority',
    'confirm_recommendation',
    'dismiss_recommendation'
  ) then
    raise exception 'Unsupported ticket action';
  end if;

  insert into public.guild_config_mutations (
    guild_id,
    actor_user_id,
    mutation_type,
    section,
    status,
    requested_payload,
    metadata
  )
  values (
    p_guild_id,
    v_user_id,
    'ticket_action',
    v_action,
    'pending',
    coalesce(p_payload, '{}'::jsonb),
    jsonb_build_object('source', 'dashboard.ticket_workspace')
  )
  returning * into v_mutation;

  insert into public.guild_dashboard_events (
    guild_id,
    actor_user_id,
    event_type,
    title,
    description,
    metadata
  )
  values (
    p_guild_id,
    v_user_id,
    'ticket_action_requested',
    'Accion de ticket solicitada',
    format('Se solicito la accion %s desde la inbox operativa.', v_action),
    jsonb_build_object(
      'action', v_action,
      'mutation_id', v_mutation.id
    )
  );

  perform public.refresh_guild_sync_counters(p_guild_id);

  return query
  select *
  from public.guild_config_mutations
  where id = v_mutation.id;
end;
$$;
