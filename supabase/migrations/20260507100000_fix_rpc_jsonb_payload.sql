/*
  # Fix RPC payload type for dashboard config mutations
  
  PostgREST sends nested JSON objects as PostgreSQL "record" type when
  the function parameter is declared as jsonb, causing a 400 Bad Request
  with "expected jsonb, received record". Changing the parameter to
  "json" allows proper deserialization, then we cast to jsonb inside
  the function body where needed.
*/

-- Fix request_guild_config_change
drop function if exists public.request_guild_config_change(text, text, jsonb);

create or replace function public.request_guild_config_change(
  p_guild_id text,
  p_section text,
  p_payload json
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
    coalesce(to_jsonb(p_payload), '{}'::jsonb),
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

-- Fix request_guild_backup_action
drop function if exists public.request_guild_backup_action(text, text, jsonb);

create or replace function public.request_guild_backup_action(
  p_guild_id text,
  p_action text,
  p_payload json
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
    coalesce(to_jsonb(p_payload), '{}'::jsonb),
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
