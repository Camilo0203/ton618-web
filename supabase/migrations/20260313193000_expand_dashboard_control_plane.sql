/*
  # Expand dashboard control plane

  1. Extend applied config/read models
    - `guild_configs` gets real product sections
    - `guild_metrics_daily` gets ticket/SLA KPIs

  2. New tables
    - `guild_config_mutations`
    - `guild_inventory_snapshots`
    - `guild_backup_manifests`
    - `guild_sync_status`

  3. Security
    - RLS policies for new dashboard tables
    - RPCs for audited config and backup requests
*/

alter table public.guild_configs
  add column if not exists server_roles_channels_settings jsonb not null default '{}'::jsonb,
  add column if not exists tickets_settings jsonb not null default '{}'::jsonb,
  add column if not exists verification_settings jsonb not null default '{}'::jsonb,
  add column if not exists welcome_settings jsonb not null default '{}'::jsonb,
  add column if not exists suggestion_settings jsonb not null default '{}'::jsonb,
  add column if not exists modlog_settings jsonb not null default '{}'::jsonb,
  add column if not exists command_settings jsonb not null default '{}'::jsonb,
  add column if not exists system_settings jsonb not null default '{}'::jsonb,
  add column if not exists config_source text not null default 'bot';

alter table public.guild_metrics_daily
  add column if not exists tickets_opened bigint not null default 0,
  add column if not exists tickets_closed bigint not null default 0,
  add column if not exists open_tickets bigint not null default 0,
  add column if not exists sla_breaches bigint not null default 0,
  add column if not exists avg_first_response_minutes numeric(8,2),
  add column if not exists modules_active jsonb not null default '[]'::jsonb;

create table if not exists public.guild_config_mutations (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  mutation_type text not null default 'config',
  section text not null,
  status text not null default 'pending',
  requested_payload jsonb not null default '{}'::jsonb,
  applied_payload jsonb,
  metadata jsonb not null default '{}'::jsonb,
  error_message text,
  requested_at timestamptz not null default now(),
  applied_at timestamptz,
  failed_at timestamptz,
  superseded_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint guild_config_mutations_status_check
    check (status in ('pending', 'applied', 'failed', 'superseded')),
  constraint guild_config_mutations_type_check
    check (mutation_type in ('config', 'backup'))
);

create table if not exists public.guild_inventory_snapshots (
  guild_id text primary key references public.bot_guilds(guild_id) on delete cascade,
  roles jsonb not null default '[]'::jsonb,
  channels jsonb not null default '[]'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  commands jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.guild_backup_manifests (
  backup_id text primary key,
  guild_id text not null references public.bot_guilds(guild_id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  source text not null default 'manual',
  schema_version integer not null default 1,
  exported_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.guild_sync_status (
  guild_id text primary key references public.bot_guilds(guild_id) on delete cascade,
  bridge_status text not null default 'unknown',
  bridge_message text,
  last_heartbeat_at timestamptz,
  last_inventory_at timestamptz,
  last_config_sync_at timestamptz,
  last_mutation_processed_at timestamptz,
  last_backup_at timestamptz,
  pending_mutations integer not null default 0,
  failed_mutations integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint guild_sync_status_bridge_status_check
    check (bridge_status in ('healthy', 'degraded', 'error', 'unknown'))
);

create index if not exists guild_config_mutations_guild_requested_idx
  on public.guild_config_mutations (guild_id, requested_at desc);

create index if not exists guild_config_mutations_status_idx
  on public.guild_config_mutations (status, requested_at asc);

create index if not exists guild_backup_manifests_guild_created_idx
  on public.guild_backup_manifests (guild_id, created_at desc);

drop trigger if exists set_guild_config_mutations_updated_at on public.guild_config_mutations;
create trigger set_guild_config_mutations_updated_at
before update on public.guild_config_mutations
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists set_guild_inventory_snapshots_updated_at on public.guild_inventory_snapshots;
create trigger set_guild_inventory_snapshots_updated_at
before update on public.guild_inventory_snapshots
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists set_guild_sync_status_updated_at on public.guild_sync_status;
create trigger set_guild_sync_status_updated_at
before update on public.guild_sync_status
for each row execute function public.set_updated_at_timestamp();

insert into public.guild_sync_status (guild_id, bridge_status, last_heartbeat_at)
select guild_id, 'healthy', last_heartbeat_at
from public.bot_guilds
on conflict (guild_id) do nothing;

update public.guild_configs
set system_settings = jsonb_build_object(
  'legacyProtectionSettings',
  coalesce(moderation_settings, '{}'::jsonb)
)
where coalesce(system_settings, '{}'::jsonb) = '{}'::jsonb
  and coalesce(moderation_settings, '{}'::jsonb) <> '{}'::jsonb;

alter table public.guild_config_mutations enable row level security;
alter table public.guild_inventory_snapshots enable row level security;
alter table public.guild_backup_manifests enable row level security;
alter table public.guild_sync_status enable row level security;

drop policy if exists "Users can read manageable mutations" on public.guild_config_mutations;
create policy "Users can read manageable mutations"
  on public.guild_config_mutations
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

drop policy if exists "Users can request manageable mutations" on public.guild_config_mutations;
create policy "Users can request manageable mutations"
  on public.guild_config_mutations
  for insert
  to authenticated
  with check (
    public.is_manageable_guild(guild_id)
    and actor_user_id = auth.uid()
    and status = 'pending'
  );

drop policy if exists "Users can read manageable inventory" on public.guild_inventory_snapshots;
create policy "Users can read manageable inventory"
  on public.guild_inventory_snapshots
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

drop policy if exists "Users can read manageable backups" on public.guild_backup_manifests;
create policy "Users can read manageable backups"
  on public.guild_backup_manifests
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

drop policy if exists "Users can read manageable sync status" on public.guild_sync_status;
create policy "Users can read manageable sync status"
  on public.guild_sync_status
  for select
  to authenticated
  using (public.is_manageable_guild(guild_id));

create or replace function public.refresh_guild_sync_counters(target_guild_id text)
returns void
language plpgsql
as $$
declare
  v_pending integer := 0;
  v_failed integer := 0;
begin
  select
    count(*) filter (where status = 'pending'),
    count(*) filter (where status = 'failed')
  into v_pending, v_failed
  from public.guild_config_mutations
  where guild_id = target_guild_id;

  insert into public.guild_sync_status (
    guild_id,
    pending_mutations,
    failed_mutations,
    bridge_status,
    updated_at
  )
  values (
    target_guild_id,
    coalesce(v_pending, 0),
    coalesce(v_failed, 0),
    'healthy',
    now()
  )
  on conflict (guild_id) do update
  set
    pending_mutations = excluded.pending_mutations,
    failed_mutations = excluded.failed_mutations,
    updated_at = now();
end;
$$;

create or replace function public.request_guild_config_change(
  p_guild_id text,
  p_section text,
  p_payload jsonb
)
returns setof public.guild_config_mutations
language plpgsql
as $$
declare
  v_user_id uuid := auth.uid();
  v_section text := lower(trim(coalesce(p_section, '')));
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

  if v_section not in (
    'general',
    'server_roles_channels',
    'tickets',
    'verification',
    'welcome',
    'suggestions',
    'modlogs',
    'commands',
    'system'
  ) then
    raise exception 'Unsupported dashboard section';
  end if;

  update public.guild_config_mutations
  set
    status = 'superseded',
    superseded_at = now(),
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('superseded_by_rpc', true)
  where guild_id = p_guild_id
    and mutation_type = 'config'
    and section = v_section
    and status = 'pending';

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
    'config',
    v_section,
    'pending',
    coalesce(p_payload, '{}'::jsonb),
    jsonb_build_object('source', 'dashboard.rpc')
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
    'config_request_created',
    'Cambio solicitado desde la dashboard',
    format('Se envio una solicitud de cambio para la seccion %s.', v_section),
    jsonb_build_object(
      'section', v_section,
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

create or replace function public.request_guild_backup_action(
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

  if v_action not in ('create_backup', 'restore_backup') then
    raise exception 'Unsupported backup action';
  end if;

  update public.guild_config_mutations
  set
    status = 'superseded',
    superseded_at = now(),
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('superseded_by_rpc', true)
  where guild_id = p_guild_id
    and mutation_type = 'backup'
    and section = v_action
    and status = 'pending';

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
    'backup',
    v_action,
    'pending',
    coalesce(p_payload, '{}'::jsonb),
    jsonb_build_object('source', 'dashboard.rpc')
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
    'backup_request_created',
    'Accion de backup solicitada',
    format('Se envio una solicitud de backup de tipo %s.', v_action),
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
