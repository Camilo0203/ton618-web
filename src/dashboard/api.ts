import type { Session } from '@supabase/supabase-js';
import { getAuthCallbackUrl } from '../config';
import { supabase } from '../lib/supabaseClient';
import {
  dashboardGuildSchema,
  dashboardSyncResultSchema,
  guildEventSchema,
  guildMetricsSchema,
} from './schemas';
import {
  normalizeGuildBackups,
  normalizeGuildConfig,
  normalizeGuildInventory,
  normalizeGuildMutations,
  normalizeGuildSyncStatus,
  normalizeGuildTicketEvents,
  normalizeGuildTicketInbox,
  normalizeGuildTicketMacros,
} from './utils';
import type {
  ConfigMutationSectionId,
  DashboardGuild,
  DashboardSessionState,
  DashboardSyncResult,
  GuildConfigMutation,
  GuildDashboardSnapshot,
  GuildEvent,
  GuildMetricsDaily,
  TicketConversationEvent,
  TicketDashboardActionId,
  TicketInboxItem,
  TicketMacro,
} from './types';

const OAUTH_EXCHANGE_TIMEOUT_MS = 15_000;
const GUILD_SYNC_TIMEOUT_MS = 20_000;
const DASHBOARD_AUTH_INTENT_STORAGE_KEY = 'dashboard:auth-intent';

interface GuildAccessRow {
  guild_id: string;
  guild_name: string;
  guild_icon: string | null;
  permissions_raw: string | null;
  can_manage: boolean | null;
  is_owner: boolean | null;
  bot_installed: boolean | null;
  member_count: number | null;
  premium_tier: string | null;
  bot_last_seen_at: string | null;
  last_synced_at: string | null;
}

interface GuildConfigRow {
  guild_id: string;
  general_settings: unknown;
  server_roles_channels_settings: unknown;
  tickets_settings: unknown;
  verification_settings: unknown;
  welcome_settings: unknown;
  suggestion_settings: unknown;
  modlog_settings: unknown;
  command_settings: unknown;
  system_settings: unknown;
  moderation_settings: unknown;
  dashboard_preferences: unknown;
  updated_by: string | null;
  updated_at: string | null;
  config_source: string | null;
}

interface GuildInventoryRow {
  guild_id: string;
  roles: unknown;
  channels: unknown;
  categories: unknown;
  commands: unknown;
  updated_at: string | null;
}

interface GuildEventRow {
  id: string;
  guild_id: string;
  event_type: string;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface GuildMetricsRow {
  guild_id: string;
  metric_date: string;
  commands_executed: number | null;
  moderated_messages: number | null;
  active_members: number | null;
  uptime_percentage: number | null;
  tickets_opened: number | null;
  tickets_closed: number | null;
  open_tickets: number | null;
  sla_breaches: number | null;
  avg_first_response_minutes: number | null;
  modules_active: string[] | null;
}

interface GuildMutationRow {
  id: string;
  guild_id: string;
  actor_user_id: string | null;
  mutation_type: string | null;
  section: string | null;
  status: string | null;
  requested_payload: unknown;
  applied_payload: unknown;
  metadata: Record<string, unknown> | null;
  error_message: string | null;
  requested_at: string | null;
  applied_at: string | null;
  failed_at: string | null;
  superseded_at: string | null;
  updated_at: string | null;
}

interface GuildBackupRow {
  backup_id: string;
  guild_id: string;
  actor_user_id: string | null;
  source: string | null;
  schema_version: number | null;
  exported_at: string | null;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
}

interface GuildSyncStatusRow {
  guild_id: string;
  bridge_status: string | null;
  bridge_message: string | null;
  last_heartbeat_at: string | null;
  last_inventory_at: string | null;
  last_config_sync_at: string | null;
  last_mutation_processed_at: string | null;
  last_backup_at: string | null;
  pending_mutations: number | null;
  failed_mutations: number | null;
  updated_at: string | null;
}

interface GuildTicketInboxRow {
  guild_id: string;
  ticket_id: string;
  channel_id: string;
  user_id: string;
  user_label: string | null;
  workflow_status: string | null;
  queue_type: string | null;
  category_id: string | null;
  category_label: string | null;
  priority: string | null;
  subject: string | null;
  claimed_by: string | null;
  claimed_by_label: string | null;
  assignee_id: string | null;
  assignee_label: string | null;
  claimed_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_customer_message_at: string | null;
  last_staff_message_at: string | null;
  last_activity_at: string | null;
  message_count: number | null;
  staff_message_count: number | null;
  reopen_count: number | null;
  tags: string[] | null;
  sla_target_minutes: number | null;
  sla_due_at: string | null;
  sla_state: string | null;
  is_open: boolean | null;
}

interface GuildTicketEventRow {
  id: string;
  guild_id: string;
  ticket_id: string;
  channel_id: string | null;
  actor_id: string | null;
  actor_kind: string | null;
  actor_label: string | null;
  event_type: string;
  visibility: string | null;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface GuildTicketMacroRow {
  macro_id: string;
  guild_id: string;
  label: string;
  content: string;
  visibility: string | null;
  sort_order: number | null;
  is_system: boolean | null;
}

function getMissingSupabaseConfigKeys(): string[] {
  const missingKeys: string[] = [];

  if (!import.meta.env.VITE_SUPABASE_URL) {
    missingKeys.push('VITE_SUPABASE_URL');
  }

  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    missingKeys.push('VITE_SUPABASE_ANON_KEY');
  }

  return missingKeys;
}

function getSupabaseClient() {
  if (!supabase) {
    const missingKeys = getMissingSupabaseConfigKeys();
    const missingKeysLabel = missingKeys.length ? ` Faltan: ${missingKeys.join(', ')}.` : '';
    throw new Error(`Supabase no esta configurado para la dashboard.${missingKeysLabel}`);
  }

  return supabase;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error) {
    return error;
  }

  return fallbackMessage;
}

function readStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

function persistDashboardAuthIntent(requestedGuildId?: string | null) {
  const storage = readStorage();
  if (!storage) {
    return;
  }

  const intent = {
    requestedGuildId: requestedGuildId ?? null,
    createdAt: new Date().toISOString(),
  };

  storage.setItem(DASHBOARD_AUTH_INTENT_STORAGE_KEY, JSON.stringify(intent));
}

export function consumeDashboardAuthIntent(): { requestedGuildId: string | null } {
  const storage = readStorage();
  if (!storage) {
    return { requestedGuildId: null };
  }

  const rawIntent = storage.getItem(DASHBOARD_AUTH_INTENT_STORAGE_KEY);
  if (!rawIntent) {
    return { requestedGuildId: null };
  }

  storage.removeItem(DASHBOARD_AUTH_INTENT_STORAGE_KEY);

  try {
    const parsedIntent = JSON.parse(rawIntent) as { requestedGuildId?: unknown };
    return {
      requestedGuildId:
        typeof parsedIntent.requestedGuildId === 'string' && parsedIntent.requestedGuildId
          ? parsedIntent.requestedGuildId
          : null,
    };
  } catch {
    return { requestedGuildId: null };
  }
}

export function resolveDashboardRedirectPath(preferredGuildId?: string | null): string {
  if (!preferredGuildId) {
    return '/dashboard';
  }

  return `/dashboard?guild=${encodeURIComponent(preferredGuildId)}`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timeoutHandle: number | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
    }
  }
}

function mapGuildRow(row: GuildAccessRow): DashboardGuild {
  return dashboardGuildSchema.parse({
    guildId: row.guild_id,
    guildName: row.guild_name,
    guildIcon: row.guild_icon,
    permissionsRaw: row.permissions_raw ?? '0',
    canManage: Boolean(row.can_manage),
    isOwner: Boolean(row.is_owner),
    botInstalled: Boolean(row.bot_installed),
    memberCount: row.member_count,
    premiumTier: row.premium_tier,
    botLastSeenAt: row.bot_last_seen_at,
    lastSyncedAt: row.last_synced_at,
  });
}

export async function getDashboardSession(): Promise<DashboardSessionState> {
  if (!supabase) {
    return {
      session: null,
      user: null,
    };
  }

  const client = getSupabaseClient();
  const [{ data: sessionData, error: sessionError }, { data: userData, error: userError }] =
    await Promise.all([client.auth.getSession(), client.auth.getUser()]);

  if (sessionError) {
    throw sessionError;
  }

  if (userError) {
    throw userError;
  }

  return {
    session: sessionData.session,
    user: userData.user,
  };
}

export async function signInWithDiscord(requestedGuildId?: string | null): Promise<void> {
  const client = getSupabaseClient();
  persistDashboardAuthIntent(requestedGuildId);

  console.log('[dashboard-auth] signInWithDiscord:start', {
    redirectTo: getAuthCallbackUrl(),
    requestedGuildId: requestedGuildId ?? null,
  });

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: getAuthCallbackUrl(),
      scopes: 'identify guilds email',
    },
  });

  if (error) {
    throw error;
  }

  if (data.url) {
    window.location.assign(data.url);
  }
}

export async function signOutDashboard(): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function exchangeDashboardCodeForSession(code: string): Promise<Session | null> {
  const startedAt = Date.now();
  console.log('[dashboard-auth] exchangeDashboardCodeForSession:start', {
    codeLength: code.length,
    callbackUrl: getAuthCallbackUrl(),
    startedAt: new Date(startedAt).toISOString(),
  });

  try {
    const client = getSupabaseClient();
    const { data, error } = await withTimeout(
      client.auth.exchangeCodeForSession(code),
      OAUTH_EXCHANGE_TIMEOUT_MS,
      `Supabase tardo demasiado en intercambiar el codigo OAuth (${OAUTH_EXCHANGE_TIMEOUT_MS / 1000}s). Revisa la configuracion de Supabase Auth, el redirect URL y la conexion de red.`,
    );

    if (error) {
      throw error;
    }

    console.log('[dashboard-auth] exchangeDashboardCodeForSession:success', {
      durationMs: Date.now() - startedAt,
      hasSession: Boolean(data.session),
      hasProviderToken: Boolean(data.session?.provider_token),
      userId: data.session?.user?.id ?? null,
    });

    return data.session;
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'No se pudo intercambiar el codigo OAuth con Supabase.');
    console.error('[dashboard-auth] exchangeDashboardCodeForSession:error', {
      durationMs: Date.now() - startedAt,
      message,
      error,
    });
    throw new Error(message);
  }
}

export async function syncDiscordGuilds(providerToken: string): Promise<DashboardSyncResult> {
  const startedAt = Date.now();
  const client = getSupabaseClient();

  if (!providerToken.trim()) {
    throw new Error('No llego un provider token valido para sincronizar los servidores.');
  }

  console.log('[dashboard-auth] syncDiscordGuilds:start', {
    startedAt: new Date(startedAt).toISOString(),
    tokenLength: providerToken.length,
  });

  try {
    const { data, error } = await withTimeout(
      client.functions.invoke('sync-discord-guilds', {
        body: {
          providerToken,
        },
      }),
      GUILD_SYNC_TIMEOUT_MS,
      `La sincronizacion inicial de servidores tardo demasiado (${GUILD_SYNC_TIMEOUT_MS / 1000}s). Revisa la funcion sync-discord-guilds, la red y el estado de Supabase.`,
    );

    if (error) {
      throw error;
    }

    const parsedResult = dashboardSyncResultSchema.parse(data);
    console.log('[dashboard-auth] syncDiscordGuilds:success', {
      durationMs: Date.now() - startedAt,
      manageableCount: parsedResult.manageableCount,
      installedCount: parsedResult.installedCount,
    });

    return parsedResult;
  } catch (error: unknown) {
    const message = getErrorMessage(
      error,
      'No se pudieron sincronizar los servidores administrables con Supabase.',
    );
    console.error('[dashboard-auth] syncDiscordGuilds:error', {
      durationMs: Date.now() - startedAt,
      message,
      error,
    });
    throw new Error(message);
  }
}

export async function fetchDashboardGuilds(): Promise<DashboardGuild[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('user_guild_access')
    .select(
      'guild_id, guild_name, guild_icon, permissions_raw, can_manage, is_owner, bot_installed, member_count, premium_tier, bot_last_seen_at, last_synced_at',
    )
    .eq('can_manage', true)
    .order('bot_installed', { ascending: false })
    .order('guild_name', { ascending: true })
    .returns<GuildAccessRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapGuildRow);
}

async function fetchGuildConfig(guildId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_configs')
    .select(
      [
        'guild_id',
        'general_settings',
        'server_roles_channels_settings',
        'tickets_settings',
        'verification_settings',
        'welcome_settings',
        'suggestion_settings',
        'modlog_settings',
        'command_settings',
        'system_settings',
        'moderation_settings',
        'dashboard_preferences',
        'updated_by',
        'updated_at',
        'config_source',
      ].join(', '),
    )
    .eq('guild_id', guildId)
    .maybeSingle<GuildConfigRow>();

  if (error) {
    throw error;
  }

  return normalizeGuildConfig(guildId, data);
}

async function fetchGuildInventory(guildId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_inventory_snapshots')
    .select('guild_id, roles, channels, categories, commands, updated_at')
    .eq('guild_id', guildId)
    .maybeSingle<GuildInventoryRow>();

  if (error) {
    throw error;
  }

  return normalizeGuildInventory(guildId, data);
}

async function fetchGuildActivity(guildId: string): Promise<GuildEvent[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_dashboard_events')
    .select('id, guild_id, event_type, title, description, metadata, created_at')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(20)
    .returns<GuildEventRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    guildEventSchema.parse({
      id: row.id,
      guildId: row.guild_id,
      eventType: row.event_type,
      title: row.title,
      description: row.description,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
    }),
  );
}

async function fetchGuildMetrics(guildId: string): Promise<GuildMetricsDaily[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_metrics_daily')
    .select(
      [
        'guild_id',
        'metric_date',
        'commands_executed',
        'moderated_messages',
        'active_members',
        'uptime_percentage',
        'tickets_opened',
        'tickets_closed',
        'open_tickets',
        'sla_breaches',
        'avg_first_response_minutes',
        'modules_active',
      ].join(', '),
    )
    .eq('guild_id', guildId)
    .order('metric_date', { ascending: false })
    .limit(14)
    .returns<GuildMetricsRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    guildMetricsSchema.parse({
      guildId: row.guild_id,
      metricDate: row.metric_date,
      commandsExecuted: row.commands_executed ?? 0,
      moderatedMessages: row.moderated_messages ?? 0,
      activeMembers: row.active_members ?? 0,
      uptimePercentage: row.uptime_percentage ?? 0,
      ticketsOpened: row.tickets_opened ?? 0,
      ticketsClosed: row.tickets_closed ?? 0,
      openTickets: row.open_tickets ?? 0,
      slaBreaches: row.sla_breaches ?? 0,
      avgFirstResponseMinutes:
        typeof row.avg_first_response_minutes === 'number'
          ? row.avg_first_response_minutes
          : null,
      modulesActive: row.modules_active ?? [],
    }),
  );
}

async function fetchGuildMutations(guildId: string): Promise<GuildConfigMutation[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_config_mutations')
    .select(
      [
        'id',
        'guild_id',
        'actor_user_id',
        'mutation_type',
        'section',
        'status',
        'requested_payload',
        'applied_payload',
        'metadata',
        'error_message',
        'requested_at',
        'applied_at',
        'failed_at',
        'superseded_at',
        'updated_at',
      ].join(', '),
    )
    .eq('guild_id', guildId)
    .order('requested_at', { ascending: false })
    .limit(25)
    .returns<GuildMutationRow[]>();

  if (error) {
    throw error;
  }

  return normalizeGuildMutations(data);
}

async function fetchGuildBackups(guildId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_backup_manifests')
    .select('backup_id, guild_id, actor_user_id, source, schema_version, exported_at, created_at, metadata')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(20)
    .returns<GuildBackupRow[]>();

  if (error) {
    throw error;
  }

  return normalizeGuildBackups(data);
}

async function fetchGuildSyncStatus(guildId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_sync_status')
    .select(
      [
        'guild_id',
        'bridge_status',
        'bridge_message',
        'last_heartbeat_at',
        'last_inventory_at',
        'last_config_sync_at',
        'last_mutation_processed_at',
        'last_backup_at',
        'pending_mutations',
        'failed_mutations',
        'updated_at',
      ].join(', '),
    )
    .eq('guild_id', guildId)
    .maybeSingle<GuildSyncStatusRow>();

  if (error) {
    throw error;
  }

  return normalizeGuildSyncStatus(guildId, data);
}

async function fetchGuildTicketInbox(guildId: string): Promise<TicketInboxItem[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_ticket_inbox')
    .select(
      [
        'guild_id',
        'ticket_id',
        'channel_id',
        'user_id',
        'user_label',
        'workflow_status',
        'queue_type',
        'category_id',
        'category_label',
        'priority',
        'subject',
        'claimed_by',
        'claimed_by_label',
        'assignee_id',
        'assignee_label',
        'claimed_at',
        'first_response_at',
        'resolved_at',
        'closed_at',
        'created_at',
        'updated_at',
        'last_customer_message_at',
        'last_staff_message_at',
        'last_activity_at',
        'message_count',
        'staff_message_count',
        'reopen_count',
        'tags',
        'sla_target_minutes',
        'sla_due_at',
        'sla_state',
        'is_open',
      ].join(', '),
    )
    .eq('guild_id', guildId)
    .order('is_open', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(150)
    .returns<GuildTicketInboxRow[]>();

  if (error) {
    throw error;
  }

  return normalizeGuildTicketInbox(guildId, data);
}

async function fetchGuildTicketEvents(guildId: string): Promise<TicketConversationEvent[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_ticket_events')
    .select(
      [
        'id',
        'guild_id',
        'ticket_id',
        'channel_id',
        'actor_id',
        'actor_kind',
        'actor_label',
        'event_type',
        'visibility',
        'title',
        'description',
        'metadata',
        'created_at',
      ].join(', '),
    )
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(300)
    .returns<GuildTicketEventRow[]>();

  if (error) {
    throw error;
  }

  return normalizeGuildTicketEvents(guildId, data);
}

async function fetchGuildTicketMacros(guildId: string): Promise<TicketMacro[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('guild_ticket_macros')
    .select('macro_id, guild_id, label, content, visibility, sort_order, is_system')
    .eq('guild_id', guildId)
    .order('sort_order', { ascending: true })
    .returns<GuildTicketMacroRow[]>();

  if (error) {
    throw error;
  }

  return normalizeGuildTicketMacros(guildId, data);
}

export async function fetchGuildDashboardSnapshot(guildId: string): Promise<GuildDashboardSnapshot> {
  const [config, inventory, events, metrics, mutations, backups, syncStatus, ticketInbox, ticketEvents, ticketMacros] = await Promise.all([
    fetchGuildConfig(guildId),
    fetchGuildInventory(guildId),
    fetchGuildActivity(guildId),
    fetchGuildMetrics(guildId),
    fetchGuildMutations(guildId),
    fetchGuildBackups(guildId),
    fetchGuildSyncStatus(guildId),
    fetchGuildTicketInbox(guildId),
    fetchGuildTicketEvents(guildId),
    fetchGuildTicketMacros(guildId),
  ]);

  return {
    config,
    inventory,
    events,
    metrics,
    mutations,
    backups,
    syncStatus,
    ticketWorkspace: {
      inbox: ticketInbox,
      events: ticketEvents,
      macros: ticketMacros,
    },
  };
}

export async function requestGuildConfigChange(
  guildId: string,
  section: ConfigMutationSectionId,
  payload: unknown,
): Promise<GuildConfigMutation> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('request_guild_config_change', {
    p_guild_id: guildId,
    p_section: section,
    p_payload: payload,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  const mutations = normalizeGuildMutations(row ? [row as GuildMutationRow] : []);

  if (!mutations.length) {
    throw new Error('No se pudo registrar la solicitud de cambio.');
  }

  return mutations[0];
}

export async function requestGuildBackupAction(
  guildId: string,
  action: 'create_backup' | 'restore_backup',
  payload: Record<string, unknown>,
): Promise<GuildConfigMutation> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('request_guild_backup_action', {
    p_guild_id: guildId,
    p_action: action,
    p_payload: payload,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  const mutations = normalizeGuildMutations(row ? [row as GuildMutationRow] : []);

  if (!mutations.length) {
    throw new Error('No se pudo registrar la accion de backup.');
  }

  return mutations[0];
}

function resolveDiscordActorMetadata(sessionUser: Awaited<ReturnType<typeof getDashboardSession>>['user']) {
  const metadata = sessionUser?.user_metadata as Record<string, unknown> | undefined;
  const actorDiscordId =
    typeof metadata?.provider_id === 'string'
      ? metadata.provider_id
      : typeof metadata?.sub === 'string'
        ? metadata.sub
        : null;
  const actorLabel =
    typeof metadata?.full_name === 'string'
      ? metadata.full_name
      : typeof metadata?.name === 'string'
        ? metadata.name
        : typeof metadata?.user_name === 'string'
          ? metadata.user_name
          : sessionUser?.email ?? null;

  return {
    actorDiscordId,
    actorLabel,
  };
}

export async function requestTicketDashboardAction(
  guildId: string,
  action: TicketDashboardActionId,
  payload: Record<string, unknown>,
): Promise<GuildConfigMutation> {
  const client = getSupabaseClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }

  const actor = resolveDiscordActorMetadata(userData.user ?? null);

  const { data, error } = await client.rpc('request_ticket_dashboard_action', {
    p_guild_id: guildId,
    p_action: action,
    p_payload: {
      ...payload,
      actorDiscordId: actor.actorDiscordId,
      actorLabel: actor.actorLabel,
    },
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  const mutations = normalizeGuildMutations(row ? [row as GuildMutationRow] : []);

  if (!mutations.length) {
    throw new Error('No se pudo registrar la accion del ticket.');
  }

  return mutations[0];
}
