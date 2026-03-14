/*
  # Add ticket operations workspace

  1. Extend mutation queue
    - allow `ticket_action` requests in `guild_config_mutations`

  2. New read models
    - `guild_ticket_inbox`
    - `guild_ticket_events`
    - `guild_ticket_macros`

  3. Security
    - RLS policies for ticket workspace tables
    - RPC `request_ticket_dashboard_action`
*/

alter table public.guild_config_mutations
  drop constraint if exists guild_config_mutations_type_check;

alter table public.guild_config_mutations
  add constraint guild_config_mutations_type_check
  check (mutation_type in ('config', 'backup', 'ticket_action'));

create table if not exists public.guild_ticket_inbox (
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  ticket_id text not null,
  channel_id text not null,
  user_id text not null,
  user_label text,
  workflow_status text not null default 'new',
  queue_type text not null default 'support',
  category_id text,
  category_label text not null default 'General',
  priority text not null default 'normal',
  subject text,
  claimed_by text,
  claimed_by_label text,
  assignee_id text,
  assignee_label text,
  claimed_at timestamptz,
  first_response_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_customer_message_at timestamptz,
  last_staff_message_at timestamptz,
  last_activity_at timestamptz,
  message_count bigint not null default 0,
  staff_message_count bigint not null default 0,
  reopen_count integer not null default 0,
  tags jsonb not null default '[]'::jsonb,
  sla_target_minutes integer not null default 0,
  sla_due_at timestamptz,
  sla_state text not null default 'healthy',
  is_open boolean not null default true,
  primary key (guild_id, ticket_id),
  constraint guild_ticket_inbox_status_check
    check (workflow_status in ('new', 'triage', 'waiting_user', 'waiting_staff', 'escalated', 'resolved', 'closed')),
  constraint guild_ticket_inbox_queue_check
    check (queue_type in ('support', 'community')),
  constraint guild_ticket_inbox_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint guild_ticket_inbox_sla_state_check
    check (sla_state in ('healthy', 'warning', 'breached', 'paused', 'resolved'))
);

create table if not exists public.guild_ticket_events (
  id text primary key,
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  ticket_id text not null,
  channel_id text,
  actor_id text,
  actor_kind text not null default 'system',
  actor_label text,
  event_type text not null,
  visibility text not null default 'system',
  title text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint guild_ticket_events_actor_kind_check
    check (actor_kind in ('customer', 'staff', 'bot', 'system')),
  constraint guild_ticket_events_visibility_check
    check (visibility in ('public', 'internal', 'system'))
);

create table if not exists public.guild_ticket_macros (
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  macro_id text not null,
  label text not null,
  content text not null,
  visibility text not null default 'public',
  sort_order integer not null default 0,
  is_system boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (guild_id, macro_id),
  constraint guild_ticket_macros_visibility_check
    check (visibility in ('public', 'internal'))
);

create index if not exists guild_ticket_inbox_guild_open_idx
  on public.guild_ticket_inbox (guild_id, is_open desc, updated_at desc);

create index if not exists guild_ticket_inbox_guild_sla_idx
  on public.guild_ticket_inbox (guild_id, sla_state, priority, updated_at desc);

create index if not exists guild_ticket_events_guild_ticket_idx
  on public.guild_ticket_events (guild_id, ticket_id, created_at desc);

drop trigger if exists set_guild_ticket_inbox_updated_at on public.guild_ticket_inbox;
create trigger set_guild_ticket_inbox_updated_at
before update on public.guild_ticket_inbox
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists set_guild_ticket_macros_updated_at on public.guild_ticket_macros;
create trigger set_guild_ticket_macros_updated_at
before update on public.guild_ticket_macros
for each row execute function public.set_updated_at_timestamp();

alter table public.guild_ticket_inbox enable row level security;
alter table public.guild_ticket_events enable row level security;
alter table public.guild_ticket_macros enable row level security;

drop policy if exists "Users can read manageable ticket inbox" on public.guild_ticket_inbox;
create policy "Users can read manageable ticket inbox"
  on public.guild_ticket_inbox
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

drop policy if exists "Users can read manageable ticket events" on public.guild_ticket_events;
create policy "Users can read manageable ticket events"
  on public.guild_ticket_events
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

drop policy if exists "Users can read manageable ticket macros" on public.guild_ticket_macros;
create policy "Users can read manageable ticket macros"
  on public.guild_ticket_macros
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
    'set_priority'
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
