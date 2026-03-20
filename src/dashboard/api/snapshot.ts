import { guildEventSchema, guildMetricsSchema } from '../schemas';
import {
  normalizeGuildBackups,
  normalizeGuildConfig,
  normalizeGuildInventory,
  normalizeGuildMutations,
  normalizeGuildSyncStatus,
  normalizeGuildTicketEvents,
  normalizeGuildTicketInbox,
  normalizeGuildTicketMacros,
} from '../utils';
import type {
  DashboardPartialFailure,
  DashboardPartialFailureId,
  GuildBackupManifest,
  GuildConfigMutation,
  GuildDashboardSnapshot,
  GuildEvent,
  GuildMetricsDaily,
  TicketConversationEvent,
  TicketInboxItem,
  TicketMacro,
} from '../types';
import {
  createDashboardError,
  ensureGuildId,
  getSupabaseClient,
  GuildBackupRow,
  GuildConfigRow,
  GuildEventRow,
  GuildInventoryRow,
  GuildMetricsRow,
  GuildMutationRow,
  GuildSyncStatusRow,
  GuildTicketEventRow,
  GuildTicketInboxRow,
  GuildTicketMacroRow,
  runQueryWithTimeout,
} from './shared';

const OPTIONAL_SNAPSHOT_METADATA: Record<
  DashboardPartialFailureId,
  { label: string; contextHint: string }
> = {
  activity: {
    label: 'Actividad reciente',
    contextHint: 'Revisa la tabla guild_dashboard_events, RLS y el bridge de eventos del bot.',
  },
  metrics: {
    label: 'Analitica diaria',
    contextHint: 'Revisa guild_metrics_daily, la publicacion diaria del bot y la sincronizacion del bridge.',
  },
  ticket_events: {
    label: 'Bitacora de tickets',
    contextHint: 'Revisa guild_ticket_events y la publicacion de eventos del inbox.',
  },
  ticket_macros: {
    label: 'Macros de tickets',
    contextHint: 'Revisa guild_ticket_macros y la sincronizacion de configuracion del workspace.',
  },
  backups: {
    label: 'Copias de seguridad',
    contextHint: 'Revisa la tabla guild_backup_manifests.',
  },
  ticket_inbox: {
    label: 'Bandeja de tickets',
    contextHint: 'Revisa guild_ticket_inbox y la bandeja de tickets.',
  },
};

async function fetchGuildConfig(guildId: string) {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar la configuracion');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.config.${resolvedGuildId}`,
    client
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
      .eq('guild_id', resolvedGuildId)
      .maybeSingle<GuildConfigRow>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.config.${resolvedGuildId}`,
      error,
      'No se pudo cargar la configuracion del servidor.',
    );
  }

  return normalizeGuildConfig(resolvedGuildId, data);
}

async function fetchGuildInventory(guildId: string) {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar el inventario');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.inventory.${resolvedGuildId}`,
    client
      .from('guild_inventory_snapshots')
      .select('guild_id, roles, channels, categories, commands, updated_at')
      .eq('guild_id', resolvedGuildId)
      .maybeSingle<GuildInventoryRow>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.inventory.${resolvedGuildId}`,
      error,
      'No se pudo cargar el inventario sincronizado del servidor.',
    );
  }

  return normalizeGuildInventory(resolvedGuildId, data);
}

async function fetchGuildActivity(guildId: string): Promise<GuildEvent[]> {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar la actividad');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.activity.${resolvedGuildId}`,
    client
      .from('guild_dashboard_events')
      .select('id, guild_id, event_type, title, description, metadata, created_at')
      .eq('guild_id', resolvedGuildId)
      .order('created_at', { ascending: false })
      .limit(20)
      .returns<GuildEventRow[]>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.activity.${resolvedGuildId}`,
      error,
      'No se pudo cargar la actividad reciente del servidor.',
    );
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
  const resolvedGuildId = ensureGuildId(guildId, 'cargar las metricas');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.metrics.${resolvedGuildId}`,
    client
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
      .eq('guild_id', resolvedGuildId)
      .order('metric_date', { ascending: false })
      .limit(14)
      .returns<GuildMetricsRow[]>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.metrics.${resolvedGuildId}`,
      error,
      'No se pudo cargar la analitica del servidor.',
    );
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
  const resolvedGuildId = ensureGuildId(guildId, 'cargar los cambios pendientes');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.mutations.${resolvedGuildId}`,
    client
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
      .eq('guild_id', resolvedGuildId)
      .order('requested_at', { ascending: false })
      .limit(25)
      .returns<GuildMutationRow[]>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.mutations.${resolvedGuildId}`,
      error,
      'No se pudo cargar el historial de cambios del servidor.',
    );
  }

  return normalizeGuildMutations(data);
}

async function fetchGuildBackups(guildId: string) {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar los backups');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.backups.${resolvedGuildId}`,
    client
      .from('guild_backup_manifests')
      .select('backup_id, guild_id, actor_user_id, source, schema_version, exported_at, created_at, metadata')
      .eq('guild_id', resolvedGuildId)
      .order('created_at', { ascending: false })
      .limit(20)
      .returns<GuildBackupRow[]>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.backups.${resolvedGuildId}`,
      error,
      'No se pudieron cargar los backups del servidor.',
    );
  }

  return normalizeGuildBackups(data);
}

async function fetchGuildSyncStatus(guildId: string) {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar el estado de sincronizacion');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.sync-status.${resolvedGuildId}`,
    client
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
      .eq('guild_id', resolvedGuildId)
      .maybeSingle<GuildSyncStatusRow>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.sync-status.${resolvedGuildId}`,
      error,
      'No se pudo cargar el estado tecnico del servidor.',
    );
  }

  return normalizeGuildSyncStatus(resolvedGuildId, data);
}

async function fetchGuildTicketInbox(guildId: string): Promise<TicketInboxItem[]> {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar la bandeja de tickets');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.ticket-inbox.${resolvedGuildId}`,
    client
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
      .eq('guild_id', resolvedGuildId)
      .order('is_open', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(150)
      .returns<GuildTicketInboxRow[]>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.ticket-inbox.${resolvedGuildId}`,
      error,
      'No se pudo cargar la bandeja de tickets del servidor.',
    );
  }

  return normalizeGuildTicketInbox(resolvedGuildId, data);
}

async function fetchGuildTicketEvents(guildId: string): Promise<TicketConversationEvent[]> {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar los eventos de tickets');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.ticket-events.${resolvedGuildId}`,
    client
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
      .eq('guild_id', resolvedGuildId)
      .order('created_at', { ascending: false })
      .limit(300)
      .returns<GuildTicketEventRow[]>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.ticket-events.${resolvedGuildId}`,
      error,
      'No se pudieron cargar los eventos de tickets del servidor.',
    );
  }

  return normalizeGuildTicketEvents(resolvedGuildId, data);
}

async function fetchGuildTicketMacros(guildId: string): Promise<TicketMacro[]> {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar las macros de tickets');
  const client = getSupabaseClient();
  const { data, error } = await runQueryWithTimeout(
    `snapshot.ticket-macros.${resolvedGuildId}`,
    client
      .from('guild_ticket_macros')
      .select('macro_id, guild_id, label, content, visibility, sort_order, is_system')
      .eq('guild_id', resolvedGuildId)
      .order('sort_order', { ascending: true })
      .returns<GuildTicketMacroRow[]>(),
  );

  if (error) {
    throw createDashboardError(
      `snapshot.ticket-macros.${resolvedGuildId}`,
      error,
      'No se pudieron cargar las macros de tickets del servidor.',
    );
  }

  return normalizeGuildTicketMacros(resolvedGuildId, data);
}

function buildPartialFailure(id: DashboardPartialFailureId, error: unknown): DashboardPartialFailure {
  const metadata = OPTIONAL_SNAPSHOT_METADATA[id];
  const baseMessage = error instanceof Error && error.message
    ? error.message
    : `No se pudo cargar ${metadata.label.toLowerCase()}.`;

  return {
    id,
    label: metadata.label,
    message: `${baseMessage} ${metadata.contextHint}`,
  };
}

export async function fetchGuildDashboardSnapshot(guildId: string): Promise<GuildDashboardSnapshot> {
  const resolvedGuildId = ensureGuildId(guildId, 'cargar el snapshot del dashboard');

  const [
    configResult,
    inventoryResult,
    mutationsResult,
    syncStatusResult,
    backupsResult,
    ticketInboxResult,
    activityResult,
    metricsResult,
    ticketEventsResult,
    ticketMacrosResult,
  ] = await Promise.allSettled([
    fetchGuildConfig(resolvedGuildId),
    fetchGuildInventory(resolvedGuildId),
    fetchGuildMutations(resolvedGuildId),
    fetchGuildSyncStatus(resolvedGuildId),
    fetchGuildBackups(resolvedGuildId),
    fetchGuildTicketInbox(resolvedGuildId),
    fetchGuildActivity(resolvedGuildId),
    fetchGuildMetrics(resolvedGuildId),
    fetchGuildTicketEvents(resolvedGuildId),
    fetchGuildTicketMacros(resolvedGuildId),
  ]);

  const partialFailures: DashboardPartialFailure[] = [];

  function getCritical<T>(result: PromiseSettledResult<T>): T {
    if (result.status === 'rejected') {
      throw result.reason;
    }
    return result.value;
  }

  function getOptional<T>(
    result: PromiseSettledResult<T>,
    id: DashboardPartialFailureId,
    fallbackValue: T
  ): T {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    const failure = buildPartialFailure(id, result.reason);
    if (import.meta.env.DEV) {
      console.warn('[dashboard-snapshot] optional-dataset-failed', {
        dataset: id,
        message: failure.message,
        error: result.reason,
      });
    }
    partialFailures.push(failure);
    return fallbackValue;
  }

  const config = getCritical(configResult);
  const inventory = getCritical(inventoryResult);
  const mutations = getCritical(mutationsResult);
  const syncStatus = getCritical(syncStatusResult);

  const backups = getOptional(backupsResult, 'backups', [] as GuildBackupManifest[]);
  const ticketInbox = getOptional(ticketInboxResult, 'ticket_inbox', [] as TicketInboxItem[]);
  const activity = getOptional(activityResult, 'activity', [] as GuildEvent[]);
  const metrics = getOptional(metricsResult, 'metrics', [] as GuildMetricsDaily[]);
  const ticketEvents = getOptional(ticketEventsResult, 'ticket_events', [] as TicketConversationEvent[]);
  const ticketMacros = getOptional(ticketMacrosResult, 'ticket_macros', [] as TicketMacro[]);

  return {
    config,
    inventory,
    events: activity,
    metrics,
    mutations,
    backups,
    syncStatus,
    ticketWorkspace: {
      inbox: ticketInbox,
      events: ticketEvents,
      macros: ticketMacros,
    },
    partialFailures,
  };
}
