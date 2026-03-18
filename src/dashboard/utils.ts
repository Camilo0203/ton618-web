import type { User } from '@supabase/supabase-js';
import { dashboardSections, dashboardTaskGroups } from './constants';
import {
  defaultDashboardPreferences,
  defaultGeneralSettings,
  defaultGuildConfig,
  defaultGuildInventory,
  defaultGuildSyncStatus,
  defaultLegacyProtectionSettings,
  defaultModlogSettings,
  defaultServerRolesChannelsSettings,
  defaultSuggestionSettings,
  defaultSystemSettings,
  defaultTicketsSettings,
  defaultVerificationSettings,
  defaultWelcomeSettings,
  guildBackupManifestSchema,
  guildConfigSchema,
  guildInventorySchema,
  guildMutationSchema,
  guildSyncStatusSchema,
  ticketConversationEventSchema,
  ticketInboxItemSchema,
  ticketMacroSchema,
} from './schemas';
import type {
  CommandRateLimitOverride,
  ConfigMutationSectionId,
  DashboardSectionId,
  DashboardGuild,
  DashboardSessionState,
  GuildBackupManifest,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildMetricsDaily,
  GuildSyncStatus,
  TicketConversationEvent,
  TicketCustomerProfile,
  TicketInboxItem,
  TicketMacro,
  TicketSlaState,
  TicketWorkflowStatus,
} from './types';

export type DashboardTaskStatus = 'not_configured' | 'basic' | 'active' | 'needs_attention';

export interface DashboardSectionState {
  sectionId: DashboardSectionId;
  label: string;
  description: string;
  groupId: string;
  status: DashboardTaskStatus;
  progress: number;
  summary: string;
  messages: string[];
}

export interface DashboardChecklistStep {
  id: string;
  label: string;
  description: string;
  sectionId: DashboardSectionId;
  status: DashboardTaskStatus;
  complete: boolean;
  summary: string;
}

export interface DashboardQuickAction {
  id: string;
  label: string;
  description: string;
  sectionId: DashboardSectionId;
  priority: number;
}

function countCompleted(checks: boolean[]): number {
  return checks.filter(Boolean).length;
}

function ratioFromChecks(checks: boolean[]): number {
  return checks.length ? countCompleted(checks) / checks.length : 0;
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function summarizeStatus(status: DashboardTaskStatus): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'basic':
      return 'Basico';
    case 'needs_attention':
      return 'Requiere revision';
    default:
      return 'No configurado';
  }
}

function getStatusFromProgress(
  progress: number,
  messages: string[],
): DashboardTaskStatus {
  const normalizedProgress = clampRatio(progress);

  if (!messages.length) {
    if (normalizedProgress >= 0.98) {
      return 'active';
    }

    if (normalizedProgress >= 0.34) {
      return 'basic';
    }

    return 'not_configured';
  }

  if (normalizedProgress >= 0.6) {
    return 'needs_attention';
  }

  if (normalizedProgress > 0) {
    return 'basic';
  }

  return 'not_configured';
}

function getTaskGroupId(sectionId: DashboardSectionId): string {
  return (
    dashboardTaskGroups.find((group) => group.sections.includes(sectionId))?.id
    ?? 'system'
  );
}

function buildSectionState(
  sectionId: DashboardSectionId,
  progress: number,
  messages: string[],
): DashboardSectionState {
  const meta = dashboardSections.find((section) => section.id === sectionId);
  const normalizedProgress = clampRatio(progress);
  const status = getStatusFromProgress(normalizedProgress, messages);

  return {
    sectionId,
    label: meta?.label ?? sectionId,
    description: meta?.description ?? '',
    groupId: getTaskGroupId(sectionId),
    status,
    progress: normalizedProgress,
    summary: messages[0] ?? summarizeStatus(status),
    messages,
  };
}

export function getDashboardSectionStates(
  config: GuildConfig,
  guild: DashboardGuild,
  syncStatus: GuildSyncStatus | null,
  backups: GuildBackupManifest[],
  mutations: GuildConfigMutation[],
): DashboardSectionState[] {
  const channels = config.serverRolesChannelsSettings;
  const tickets = config.ticketsSettings;
  const verification = config.verificationSettings;
  const welcome = config.welcomeSettings;
  const suggestions = config.suggestionSettings;
  const modlogs = config.modlogSettings;
  const commands = config.commandSettings;
  const rolesChannelsChecks = [
    Boolean(channels.dashboardChannelId),
    Boolean(channels.ticketPanelChannelId),
    Boolean(channels.logsChannelId),
    Boolean(channels.supportRoleId),
    Boolean(channels.adminRoleId),
  ];
  const rolesChannelsMessages = [
    !channels.dashboardChannelId ? 'Falta elegir el canal principal donde el staff abrira el panel.' : null,
    !channels.ticketPanelChannelId ? 'Falta elegir el canal donde se publicara el panel de tickets.' : null,
    !channels.supportRoleId ? 'Aun no has seleccionado un rol de staff.' : null,
    !channels.adminRoleId ? 'Falta definir el rol administrador del bot.' : null,
    !channels.logsChannelId ? 'Todavia no existe un canal central para registros del bot.' : null,
    !channels.transcriptChannelId ? 'Conviene dejar listo un canal para guardar transcripciones.' : null,
  ].filter((message): message is string => Boolean(message));

  const ticketChecks = [
    Boolean(channels.ticketPanelChannelId),
    tickets.maxTickets > 0,
    tickets.slaMinutes > 0,
    !tickets.autoAssignEnabled || Boolean(channels.supportRoleId),
    !tickets.dailySlaReportEnabled || Boolean(tickets.dailySlaReportChannelId),
    !tickets.slaEscalationEnabled || Boolean(tickets.slaEscalationRoleId || tickets.slaEscalationChannelId),
  ];
  const ticketMessages = [
    !channels.ticketPanelChannelId ? 'Falta elegir el canal de tickets.' : null,
    tickets.slaMinutes <= 0 ? 'Define un SLA base para saber cuando un ticket necesita seguimiento.' : null,
    tickets.autoAssignEnabled && !channels.supportRoleId
      ? 'La autoasignacion esta activa, pero todavia no existe un rol de staff base.'
      : null,
    tickets.slaEscalationEnabled && !tickets.slaEscalationRoleId && !tickets.slaEscalationChannelId
      ? 'El escalado de SLA esta activo pero no tiene rol ni canal de aviso.'
      : null,
    tickets.dailySlaReportEnabled && !tickets.dailySlaReportChannelId
      ? 'El reporte diario esta activo pero no tiene canal asignado.'
      : null,
  ].filter((message): message is string => Boolean(message));

  const verificationChecks = [
    !verification.enabled || Boolean(verification.channelId),
    !verification.enabled || Boolean(verification.verifiedRoleId),
    !verification.enabled || verification.panelTitle.trim().length > 0,
    !verification.enabled || (verification.mode !== 'question' || Boolean(verification.questionAnswer.trim())),
  ];
  const verificationMessages = [
    verification.enabled && !verification.channelId ? 'La verificacion esta activa pero no tiene canal asignado.' : null,
    verification.enabled && !verification.verifiedRoleId ? 'La verificacion necesita un rol para miembros verificados.' : null,
    verification.enabled && verification.mode === 'question' && !verification.questionAnswer.trim()
      ? 'La verificacion por pregunta necesita una respuesta correcta.'
      : null,
  ].filter((message): message is string => Boolean(message));

  const welcomeChecks = [
    !welcome.welcomeEnabled || Boolean(welcome.welcomeChannelId),
    !welcome.welcomeEnabled || welcome.welcomeMessage.trim().length > 0,
    !welcome.goodbyeEnabled || Boolean(welcome.goodbyeChannelId),
  ];
  const welcomeMessages = [
    welcome.welcomeEnabled && !welcome.welcomeChannelId ? 'La bienvenida esta activa pero no tiene canal asignado.' : null,
    welcome.goodbyeEnabled && !welcome.goodbyeChannelId ? 'La despedida esta activa pero no tiene canal asignado.' : null,
    welcome.welcomeEnabled && !welcome.welcomeAutoroleId ? 'Puedes completar la experiencia asignando un autorrol de entrada.' : null,
    welcome.welcomeEnabled && !welcome.welcomeDm && !welcome.welcomeAutoroleId
      ? 'La bienvenida ya publica mensajes, pero todavia no acompana al miembro con DM o autorrol.'
      : null,
  ].filter((message): message is string => Boolean(message));

  const suggestionChecks = [
    !suggestions.enabled || Boolean(suggestions.channelId),
    !suggestions.enabled || Boolean(suggestions.logChannelId),
    !suggestions.enabled || Boolean(suggestions.approvedChannelId || suggestions.rejectedChannelId),
  ];
  const suggestionMessages = [
    suggestions.enabled && !suggestions.channelId ? 'Las sugerencias estan activas pero falta el canal principal.' : null,
    suggestions.enabled && !suggestions.logChannelId ? 'Conviene definir un canal interno para revisar sugerencias.' : null,
    suggestions.enabled && !suggestions.approvedChannelId && !suggestions.rejectedChannelId
      ? 'Aun no definiste donde se veran las sugerencias aprobadas o rechazadas.'
      : null,
  ].filter((message): message is string => Boolean(message));

  const modlogChecks = [
    !modlogs.enabled || Boolean(modlogs.channelId),
    !modlogs.enabled || [
      modlogs.logBans,
      modlogs.logUnbans,
      modlogs.logKicks,
      modlogs.logMessageDelete,
      modlogs.logMessageEdit,
      modlogs.logJoins,
      modlogs.logLeaves,
    ].some(Boolean),
  ];
  const modlogMessages = [
    modlogs.enabled && !modlogs.channelId ? 'El registro de moderacion esta activo pero no tiene canal.' : null,
    modlogs.enabled && ![
      modlogs.logBans,
      modlogs.logUnbans,
      modlogs.logKicks,
      modlogs.logMessageDelete,
      modlogs.logMessageEdit,
      modlogs.logJoins,
      modlogs.logLeaves,
      modlogs.logVoice,
      modlogs.logRoleAdd,
      modlogs.logRoleRemove,
      modlogs.logNickname,
    ].some(Boolean)
      ? 'El registro esta activado, pero no has marcado eventos para guardar.'
      : null,
  ].filter((message): message is string => Boolean(message));

  const commandChecks = [
    config.generalSettings.commandMode === 'mention' || config.generalSettings.prefix.trim().length > 0,
    Boolean(config.generalSettings.timezone),
    !commands.rateLimitEnabled || commands.rateLimitMaxActions > 0,
    !commands.commandRateLimitEnabled || commands.commandRateLimitMaxActions > 0,
  ];
  const commandMessages = [
    config.generalSettings.commandMode === 'prefix' && !config.generalSettings.prefix.trim()
      ? 'Elegiste comandos por prefijo, pero aun no definiste el prefijo.'
      : null,
    !config.generalSettings.timezone ? 'Falta elegir una zona horaria base para reportes y automatizaciones.' : null,
    commands.rateLimitEnabled && commands.rateLimitMaxActions <= 0
      ? 'El rate limit general esta activo, pero no tiene un limite valido.'
      : null,
    commands.commandRateLimitEnabled && commands.commandRateLimitMaxActions <= 0
      ? 'El limite por comando esta activo, pero falta definir cuantas acciones permite.'
      : null,
  ].filter((message): message is string => Boolean(message));

  const failedMutations = syncStatus?.failedMutations ?? mutations.filter((entry) => entry.status === 'failed').length;
  const pendingMutations = syncStatus?.pendingMutations ?? mutations.filter((entry) => entry.status === 'pending').length;
  const systemChecks = [
    guild.botInstalled,
    syncStatus?.bridgeStatus !== 'error',
    backups.length > 0,
    failedMutations === 0,
  ];
  const systemMessages = [
    !guild.botInstalled ? 'El bot todavia no esta instalado en este servidor.' : null,
    syncStatus?.bridgeStatus === 'error' ? 'El bot esta conectado, pero la sincronizacion reporta errores.' : null,
    syncStatus?.bridgeStatus === 'degraded' ? 'La sincronizacion funciona, pero llega con retraso.' : null,
    backups.length === 0 ? 'Todavia no existe un backup inicial.' : null,
    failedMutations > 0 ? `Hay ${failedMutations} cambios que no pudo aplicar el bot.` : null,
    pendingMutations > 0 ? `Hay ${pendingMutations} cambios pendientes por aplicar.` : null,
  ].filter((message): message is string => Boolean(message));

  return [
    buildSectionState('general', ratioFromChecks([
      Boolean(config.generalSettings.language),
      Boolean(config.generalSettings.timezone),
      config.generalSettings.commandMode === 'mention' || Boolean(config.generalSettings.prefix.trim()),
    ]), [
      !config.generalSettings.timezone ? 'Falta elegir la zona horaria principal del servidor.' : null,
      config.generalSettings.commandMode === 'prefix' && !config.generalSettings.prefix.trim()
        ? 'Elegiste comandos por prefijo, pero aun no definiste el prefijo.'
        : null,
    ].filter((message): message is string => Boolean(message))),
    buildSectionState('server_roles', ratioFromChecks(rolesChannelsChecks), rolesChannelsMessages),
    buildSectionState('tickets', ratioFromChecks(ticketChecks), ticketMessages),
    buildSectionState('verification', ratioFromChecks(verificationChecks), verificationMessages),
    buildSectionState('welcome', ratioFromChecks(welcomeChecks), welcomeMessages),
    buildSectionState('suggestions', ratioFromChecks(suggestionChecks), suggestionMessages),
    buildSectionState('modlogs', ratioFromChecks(modlogChecks), modlogMessages),
    buildSectionState('commands', ratioFromChecks(commandChecks), commandMessages),
    buildSectionState('system', ratioFromChecks(systemChecks), systemMessages),
    buildSectionState('inbox', tickets.maxTickets > 0 ? 1 : 0, ticketMessages.slice(0, 1)),
    buildSectionState('activity', modlogs.enabled || failedMutations > 0 || pendingMutations > 0 ? 1 : 0.5, []),
    buildSectionState('analytics', 1, []),
    buildSectionState('overview', 1, []),
  ];
}

export function getDashboardChecklist(
  guild: DashboardGuild,
  sectionStates: DashboardSectionState[],
  backups: GuildBackupManifest[],
  syncStatus: GuildSyncStatus | null,
): DashboardChecklistStep[] {
  const findState = (sectionId: DashboardSectionId) =>
    sectionStates.find((section) => section.sectionId === sectionId);

  const general = findState('general');
  const roles = findState('server_roles');
  const verification = findState('verification');
  const welcome = findState('welcome');
  const tickets = findState('tickets');
  const modlogs = findState('modlogs');
  const system = findState('system');

  return [
    {
      id: 'select-server',
      label: 'Confirmar servidor y bot',
      description: 'Asegurate de estar trabajando en el servidor correcto y de que el bot ya tenga acceso.',
      sectionId: 'overview',
      complete: Boolean(guild.guildId && guild.botInstalled),
      status: guild.botInstalled ? 'active' : (guild.guildId ? 'basic' : 'not_configured'),
      summary: guild.botInstalled ? 'El servidor ya esta listo para seguir configurando.' : 'El servidor ya fue elegido, pero el bot aun no esta dentro.',
    },
    {
      id: 'language-and-commands',
      label: 'Definir idioma y comandos',
      description: 'Deja lista la base del servidor: idioma, forma de invocar al bot y zona horaria.',
      sectionId: 'general',
      complete: Boolean(general && general.progress >= 1),
      status: general?.status ?? 'not_configured',
      summary: general?.summary ?? 'Todavia falta cerrar la configuracion basica.',
    },
    {
      id: 'roles-and-channels',
      label: 'Conectar canales y roles clave',
      description: 'Asigna staff, admin y los canales que el bot necesita para funcionar sin improvisacion.',
      sectionId: 'server_roles',
      complete: Boolean(roles && roles.progress >= 0.8 && roles.messages.length === 0),
      status: roles?.status ?? 'not_configured',
      summary: roles?.summary ?? 'Todavia faltan roles y canales base.',
    },
    {
      id: 'member-experience',
      label: 'Preparar la llegada de nuevos miembros',
      description: 'Define si el servidor va a recibir usuarios con bienvenida, verificacion o ambas cosas.',
      sectionId: verification?.status === 'needs_attention' ? 'verification' : (welcome?.status === 'active' ? 'welcome' : 'verification'),
      complete: welcome?.status === 'active' || verification?.status === 'active',
      status: welcome?.status === 'active' || verification?.status === 'active'
        ? 'active'
        : (
          welcome?.status === 'needs_attention' || verification?.status === 'needs_attention'
            ? 'needs_attention'
            : (welcome?.status === 'basic' || verification?.status === 'basic' ? 'basic' : 'not_configured')
        ),
      summary: welcome?.status === 'active'
        ? 'La bienvenida ya esta funcionando.'
        : verification?.status === 'active'
          ? 'La verificacion de acceso ya esta funcionando.'
          : verification?.status === 'needs_attention'
            ? verification.summary
            : 'Activa al menos una experiencia clara para nuevos miembros.',
    },
    {
      id: 'tickets',
      label: 'Cerrar el flujo de tickets',
      description: 'Define canal, limites y tiempos para que soporte pueda operar sin dudas.',
      sectionId: 'tickets',
      complete: Boolean(tickets && tickets.progress >= 0.8 && tickets.messages.length === 0),
      status: tickets?.status ?? 'not_configured',
      summary: tickets?.summary ?? 'Todavia falta dejar operativo el sistema de tickets.',
    },
    {
      id: 'moderation',
      label: 'Activar trazabilidad del staff',
      description: 'Deja claro donde quedaran registrados los eventos importantes de moderacion.',
      sectionId: 'modlogs',
      complete: Boolean(modlogs?.status === 'active'),
      status: modlogs?.status ?? 'not_configured',
      summary: modlogs?.summary ?? 'Todavia no hay un registro confiable de moderacion.',
    },
    {
      id: 'backup',
      label: 'Guardar un backup inicial',
      description: 'Crea una copia base para poder volver atras si algo sale mal despues.',
      sectionId: 'system',
      complete: backups.length > 0,
      status: backups.length > 0 ? 'active' : (system?.status === 'needs_attention' ? 'needs_attention' : 'not_configured'),
      summary: backups.length > 0 ? `Ya existe una copia segura desde ${formatRelativeTime(backups[0]?.createdAt ?? null)}.` : 'Todavia no existe una copia segura inicial.',
    },
    {
      id: 'sync',
      label: 'Confirmar que el bot responde bien',
      description: 'Verifica que el bot siga conectado y que los cambios realmente se esten aplicando.',
      sectionId: 'system',
      complete: syncStatus?.bridgeStatus === 'healthy',
      status: system?.status ?? 'not_configured',
      summary: system?.summary ?? 'Revisa si el bot esta listo para trabajar sin errores.',
    },
  ];
}

export function getDashboardQuickActions(
  sectionStates: DashboardSectionState[],
  checklist: DashboardChecklistStep[],
  syncStatus: GuildSyncStatus | null,
): DashboardQuickAction[] {
  const actions: DashboardQuickAction[] = [];
  const findState = (sectionId: DashboardSectionId) =>
    sectionStates.find((section) => section.sectionId === sectionId);

  const nextChecklistStep = checklist.find((step) => !step.complete);
  if (nextChecklistStep) {
    actions.push({
      id: `checklist-${nextChecklistStep.id}`,
      label: `Seguir con: ${nextChecklistStep.label}`,
      description: nextChecklistStep.summary,
      sectionId: nextChecklistStep.sectionId,
      priority: 110,
    });
  }

  if (findState('server_roles')?.messages.length) {
    actions.push({
      id: 'roles-channels',
      label: 'Cerrar canales y roles clave',
      description: findState('server_roles')?.messages[0] ?? 'Revisa staff, admin y canales base.',
      sectionId: 'server_roles',
      priority: 100,
    });
  }

  if (findState('tickets')?.status !== 'active') {
    actions.push({
      id: 'activate-tickets',
      label: 'Dejar listo el soporte',
      description: findState('tickets')?.summary ?? 'Configura el canal y las reglas de soporte.',
      sectionId: 'tickets',
      priority: 95,
    });
  }

  if (syncStatus?.bridgeStatus !== 'healthy') {
    actions.push({
      id: 'review-sync',
      label: 'Revisar estado del bot',
      description: getHealthLabel(syncStatus) === 'Con errores'
        ? 'El bot necesita revision antes de seguir aplicando cambios.'
        : 'Confirma que el bot siga al dia antes de continuar.',
      sectionId: 'system',
      priority: 98,
    });
  }

  const attentionStates = sectionStates
    .filter((section) => section.status === 'needs_attention')
    .sort((left, right) => right.progress - left.progress);

  for (const section of attentionStates.slice(0, 2)) {
    actions.push({
      id: `attention-${section.sectionId}`,
      label: `Resolver ${section.label.toLowerCase()}`,
      description: section.messages[0] ?? section.summary,
      sectionId: section.sectionId,
      priority: 101 - Math.round(section.progress * 10),
    });
  }

  if (!checklist.find((step) => step.id === 'backup')?.complete) {
    actions.push({
      id: 'create-backup',
      label: 'Guardar una copia segura',
      description: 'Crea un backup antes de seguir tocando configuraciones sensibles.',
      sectionId: 'system',
      priority: 92,
    });
  }

  if (findState('verification')?.status === 'not_configured' && findState('welcome')?.status === 'not_configured') {
    actions.push({
      id: 'member-experience',
      label: 'Definir llegada de miembros',
      description: 'Activa bienvenida o verificacion para que el acceso no quede improvisado.',
      sectionId: 'verification',
      priority: 88,
    });
  }

  return actions
    .sort((left, right) => right.priority - left.priority)
    .filter((action, index, current) =>
      current.findIndex((candidate) => candidate.sectionId === action.sectionId) === index)
    .slice(0, 4);
}

interface GuildConfigRow {
  guild_id?: string | null;
  general_settings?: unknown;
  server_roles_channels_settings?: unknown;
  tickets_settings?: unknown;
  verification_settings?: unknown;
  welcome_settings?: unknown;
  suggestion_settings?: unknown;
  modlog_settings?: unknown;
  command_settings?: unknown;
  system_settings?: unknown;
  moderation_settings?: unknown;
  dashboard_preferences?: unknown;
  updated_by?: string | null;
  updated_at?: string | null;
  config_source?: string | null;
}

interface GuildInventoryRow {
  guild_id?: string | null;
  roles?: unknown;
  channels?: unknown;
  categories?: unknown;
  commands?: unknown;
  updated_at?: string | null;
}

interface GuildSyncStatusRow {
  guild_id?: string | null;
  bridge_status?: string | null;
  bridge_message?: string | null;
  last_heartbeat_at?: string | null;
  last_inventory_at?: string | null;
  last_config_sync_at?: string | null;
  last_mutation_processed_at?: string | null;
  last_backup_at?: string | null;
  pending_mutations?: number | null;
  failed_mutations?: number | null;
  updated_at?: string | null;
}

interface GuildMutationRow {
  id?: string | null;
  guild_id?: string | null;
  actor_user_id?: string | null;
  mutation_type?: string | null;
  section?: string | null;
  status?: string | null;
  requested_payload?: unknown;
  applied_payload?: unknown;
  metadata?: Record<string, unknown> | null;
  error_message?: string | null;
  requested_at?: string | null;
  applied_at?: string | null;
  failed_at?: string | null;
  superseded_at?: string | null;
  updated_at?: string | null;
}

interface GuildBackupRow {
  backup_id?: string | null;
  guild_id?: string | null;
  actor_user_id?: string | null;
  source?: string | null;
  schema_version?: number | null;
  exported_at?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface GuildTicketInboxRow {
  guild_id?: string | null;
  ticket_id?: string | null;
  channel_id?: string | null;
  user_id?: string | null;
  user_label?: string | null;
  workflow_status?: string | null;
  queue_type?: string | null;
  category_id?: string | null;
  category_label?: string | null;
  priority?: string | null;
  subject?: string | null;
  claimed_by?: string | null;
  claimed_by_label?: string | null;
  assignee_id?: string | null;
  assignee_label?: string | null;
  claimed_at?: string | null;
  first_response_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_customer_message_at?: string | null;
  last_staff_message_at?: string | null;
  last_activity_at?: string | null;
  message_count?: number | null;
  staff_message_count?: number | null;
  reopen_count?: number | null;
  tags?: unknown;
  sla_target_minutes?: number | null;
  sla_due_at?: string | null;
  sla_state?: string | null;
  is_open?: boolean | null;
}

interface GuildTicketEventRow {
  id?: string | null;
  guild_id?: string | null;
  ticket_id?: string | null;
  channel_id?: string | null;
  actor_id?: string | null;
  actor_kind?: string | null;
  actor_label?: string | null;
  event_type?: string | null;
  visibility?: string | null;
  title?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
}

interface GuildTicketMacroRow {
  macro_id?: string | null;
  guild_id?: string | null;
  label?: string | null;
  content?: string | null;
  visibility?: string | null;
  sort_order?: number | null;
  is_system?: boolean | null;
}

export function createDefaultGuildConfig(guildId: string): GuildConfig {
  return {
    guildId,
    ...defaultGuildConfig,
  };
}

export function createDefaultGuildInventory(guildId: string): GuildInventory {
  return {
    guildId,
    ...defaultGuildInventory,
  };
}

export function normalizeCommandRateLimitOverrides(value: unknown): Record<string, CommandRateLimitOverride> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, CommandRateLimitOverride> = {};

  for (const [rawName, rawConfig] of Object.entries(value)) {
    const name = String(rawName || '').trim().toLowerCase();
    if (!name) {
      continue;
    }

    const override =
      rawConfig && typeof rawConfig === 'object' && !Array.isArray(rawConfig)
        ? {
            maxActions: clampNumber((rawConfig as Record<string, unknown>).max_actions ?? (rawConfig as Record<string, unknown>).maxActions, 1, 50, 4),
            windowSeconds: clampNumber((rawConfig as Record<string, unknown>).window_seconds ?? (rawConfig as Record<string, unknown>).windowSeconds, 1, 300, 20),
            enabled: (rawConfig as Record<string, unknown>).enabled !== false,
          }
        : {
            maxActions: clampNumber(rawConfig, 1, 50, 4),
            windowSeconds: 20,
            enabled: true,
          };

    result[name] = override;
  }

  return result;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

export function normalizeGuildConfig(
  guildId: string,
  row: GuildConfigRow | null | undefined,
): GuildConfig {
  if (!row) {
    return createDefaultGuildConfig(guildId);
  }

  const parsed = guildConfigSchema.safeParse({
    guildId: row.guild_id ?? guildId,
    generalSettings: row.general_settings ?? defaultGeneralSettings,
    serverRolesChannelsSettings:
      row.server_roles_channels_settings ?? defaultServerRolesChannelsSettings,
    ticketsSettings: row.tickets_settings ?? defaultTicketsSettings,
    verificationSettings: row.verification_settings ?? defaultVerificationSettings,
    welcomeSettings: row.welcome_settings ?? defaultWelcomeSettings,
    suggestionSettings: row.suggestion_settings ?? defaultSuggestionSettings,
    modlogSettings: row.modlog_settings ?? defaultModlogSettings,
    commandSettings:
      row.command_settings && typeof row.command_settings === 'object' && !Array.isArray(row.command_settings)
        ? {
            ...(row.command_settings as Record<string, unknown>),
            commandRateLimitOverrides: normalizeCommandRateLimitOverrides(
              (row.command_settings as Record<string, unknown>).commandRateLimitOverrides ??
                (row.command_settings as Record<string, unknown>).command_rate_limit_overrides,
            ),
          }
        : defaultGuildConfig.commandSettings,
    systemSettings:
      row.system_settings && typeof row.system_settings === 'object' && !Array.isArray(row.system_settings)
        ? {
            maintenanceMode:
              (row.system_settings as Record<string, unknown>).maintenanceMode ??
                (row.system_settings as Record<string, unknown>).maintenance_mode ??
                defaultSystemSettings.maintenanceMode,
            maintenanceReason:
              (row.system_settings as Record<string, unknown>).maintenanceReason ??
                (row.system_settings as Record<string, unknown>).maintenance_reason ??
                defaultSystemSettings.maintenanceReason,
            legacyProtectionSettings:
              (row.system_settings as Record<string, unknown>).legacyProtectionSettings ??
                (row.system_settings as Record<string, unknown>).legacy_protection_settings ??
                row.moderation_settings ??
                defaultLegacyProtectionSettings,
          }
        : {
            ...defaultSystemSettings,
            legacyProtectionSettings: row.moderation_settings ?? defaultLegacyProtectionSettings,
          },
    dashboardPreferences: row.dashboard_preferences ?? defaultDashboardPreferences,
    updatedBy: row.updated_by ?? null,
    updatedAt: row.updated_at ?? null,
    configSource: row.config_source ?? 'bot',
  });

  if (parsed.success) {
    return parsed.data;
  }

  return createDefaultGuildConfig(guildId);
}

export function normalizeGuildInventory(
  guildId: string,
  row: GuildInventoryRow | null | undefined,
): GuildInventory {
  if (!row) {
    return createDefaultGuildInventory(guildId);
  }

  const parsed = guildInventorySchema.safeParse({
    guildId: row.guild_id ?? guildId,
    roles: row.roles ?? [],
    channels: row.channels ?? [],
    categories: row.categories ?? [],
    commands: row.commands ?? [],
    updatedAt: row.updated_at ?? null,
  });

  if (parsed.success) {
    return parsed.data;
  }

  return createDefaultGuildInventory(guildId);
}

export function normalizeGuildSyncStatus(
  guildId: string,
  row: GuildSyncStatusRow | null | undefined,
): GuildSyncStatus | null {
  if (!row) {
    return null;
  }

  const parsed = guildSyncStatusSchema.safeParse({
    guildId: row.guild_id ?? guildId,
    bridgeStatus: row.bridge_status ?? defaultGuildSyncStatus.bridgeStatus,
    bridgeMessage: row.bridge_message ?? null,
    lastHeartbeatAt: row.last_heartbeat_at ?? null,
    lastInventoryAt: row.last_inventory_at ?? null,
    lastConfigSyncAt: row.last_config_sync_at ?? null,
    lastMutationProcessedAt: row.last_mutation_processed_at ?? null,
    lastBackupAt: row.last_backup_at ?? null,
    pendingMutations: row.pending_mutations ?? 0,
    failedMutations: row.failed_mutations ?? 0,
    updatedAt: row.updated_at ?? null,
  });

  return parsed.success ? parsed.data : null;
}

export function normalizeGuildMutations(rows: GuildMutationRow[] | null | undefined): GuildConfigMutation[] {
  return (rows ?? [])
    .map((row) =>
      guildMutationSchema.safeParse({
        id: row.id ?? '',
        guildId: row.guild_id ?? '',
        actorUserId: row.actor_user_id ?? null,
        mutationType: row.mutation_type ?? 'config',
        section: row.section ?? '',
        status: row.status ?? 'pending',
        requestedPayload: row.requested_payload ?? {},
        appliedPayload: row.applied_payload ?? null,
        metadata: row.metadata ?? {},
        errorMessage: row.error_message ?? null,
        requestedAt: row.requested_at ?? row.updated_at ?? new Date().toISOString(),
        appliedAt: row.applied_at ?? null,
        failedAt: row.failed_at ?? null,
        supersededAt: row.superseded_at ?? null,
        updatedAt: row.updated_at ?? row.requested_at ?? new Date().toISOString(),
      }),
    )
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));
}

export function normalizeGuildBackups(rows: GuildBackupRow[] | null | undefined): GuildBackupManifest[] {
  return (rows ?? [])
    .map((row) =>
      guildBackupManifestSchema.safeParse({
        backupId: row.backup_id ?? '',
        guildId: row.guild_id ?? '',
        actorUserId: row.actor_user_id ?? null,
        source: row.source ?? 'manual',
        schemaVersion: row.schema_version ?? 1,
        exportedAt: row.exported_at ?? row.created_at ?? new Date().toISOString(),
        createdAt: row.created_at ?? row.exported_at ?? new Date().toISOString(),
        metadata: row.metadata ?? {},
      }),
    )
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function normalizeGuildTicketInbox(
  guildId: string,
  rows: GuildTicketInboxRow[] | null | undefined,
): TicketInboxItem[] {
  return (rows ?? [])
    .map((row) =>
      ticketInboxItemSchema.safeParse({
        guildId: row.guild_id ?? guildId,
        ticketId: row.ticket_id ?? '',
        channelId: row.channel_id ?? '',
        userId: row.user_id ?? '',
        userLabel: row.user_label ?? null,
        workflowStatus: row.workflow_status ?? 'new',
        queueType: row.queue_type ?? 'support',
        categoryId: row.category_id ?? null,
        categoryLabel: row.category_label ?? 'General',
        priority: row.priority ?? 'normal',
        subject: row.subject ?? null,
        claimedBy: row.claimed_by ?? null,
        claimedByLabel: row.claimed_by_label ?? null,
        assigneeId: row.assignee_id ?? null,
        assigneeLabel: row.assignee_label ?? null,
        claimedAt: row.claimed_at ?? null,
        firstResponseAt: row.first_response_at ?? null,
        resolvedAt: row.resolved_at ?? null,
        closedAt: row.closed_at ?? null,
        createdAt: row.created_at ?? new Date().toISOString(),
        updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
        lastCustomerMessageAt: row.last_customer_message_at ?? null,
        lastStaffMessageAt: row.last_staff_message_at ?? null,
        lastActivityAt: row.last_activity_at ?? row.updated_at ?? null,
        messageCount: row.message_count ?? 0,
        staffMessageCount: row.staff_message_count ?? 0,
        reopenCount: row.reopen_count ?? 0,
        tags: Array.isArray(row.tags) ? row.tags : [],
        slaTargetMinutes: row.sla_target_minutes ?? 0,
        slaDueAt: row.sla_due_at ?? null,
        slaState: row.sla_state ?? 'healthy',
        isOpen: row.is_open ?? true,
      }),
    )
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((left, right) => {
      if (left.isOpen !== right.isOpen) {
        return left.isOpen ? -1 : 1;
      }

      const leftDate = left.lastActivityAt ?? left.updatedAt;
      const rightDate = right.lastActivityAt ?? right.updatedAt;
      return rightDate.localeCompare(leftDate);
    });
}

export function normalizeGuildTicketEvents(
  guildId: string,
  rows: GuildTicketEventRow[] | null | undefined,
): TicketConversationEvent[] {
  return (rows ?? [])
    .map((row) =>
      ticketConversationEventSchema.safeParse({
        id: row.id ?? '',
        guildId: row.guild_id ?? guildId,
        ticketId: row.ticket_id ?? '',
        channelId: row.channel_id ?? null,
        actorId: row.actor_id ?? null,
        actorKind: row.actor_kind ?? 'system',
        actorLabel: row.actor_label ?? null,
        eventType: row.event_type ?? 'system',
        visibility: row.visibility ?? 'system',
        title: row.title ?? 'Evento',
        description: row.description ?? 'Sin descripcion',
        metadata: row.metadata ?? {},
        createdAt: row.created_at ?? new Date().toISOString(),
      }),
    )
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function normalizeGuildTicketMacros(
  guildId: string,
  rows: GuildTicketMacroRow[] | null | undefined,
): TicketMacro[] {
  return (rows ?? [])
    .map((row) =>
      ticketMacroSchema.safeParse({
        macroId: row.macro_id ?? '',
        guildId: row.guild_id ?? guildId,
        label: row.label ?? 'Macro',
        content: row.content ?? '',
        visibility: row.visibility ?? 'public',
        sortOrder: row.sort_order ?? 0,
        isSystem: row.is_system ?? false,
      }),
    )
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
}

export function resolveGuildIconUrl(guild: Pick<DashboardGuild, 'guildId' | 'guildIcon'>): string | null {
  if (!guild.guildIcon) {
    return null;
  }

  return `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.guildIcon}.png?size=128`;
}

export function resolveGuildInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'DS'
  );
}

export function resolveUserAvatarUrl(user: User | null): string | null {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const avatarUrl = typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : null;
  const avatar = typeof metadata?.avatar === 'string' ? metadata.avatar : null;
  const providerId = typeof metadata?.provider_id === 'string' ? metadata.provider_id : null;

  if (avatarUrl) {
    return avatarUrl;
  }

  if (avatar && providerId) {
    return `https://cdn.discordapp.com/avatars/${providerId}/${avatar}.png?size=128`;
  }

  return null;
}

export function formatDateTime(value: string | null, locale = 'es-CO'): string {
  if (!value) {
    return 'Sin registro';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Sin registro';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

export function formatMetricDate(value: string, locale = 'es-CO'): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
}

export function formatRelativeTime(value: string | null, locale = 'es-CO'): string {
  if (!value) {
    return 'Sin actividad';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Fecha invalida';
  }

  const diffMs = parsed.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
}

export function getPreferredGuildId(
  guilds: DashboardGuild[],
  requestedGuildId: string | null,
  storedGuildId: string | null,
): string | null {
  const byRequested = guilds.find((guild) => guild.guildId === requestedGuildId);
  if (byRequested) {
    return byRequested.guildId;
  }

  const byStored = guilds.find((guild) => guild.guildId === storedGuildId);
  if (byStored) {
    return byStored.guildId;
  }

  return guilds.find((guild) => guild.botInstalled)?.guildId ?? guilds[0]?.guildId ?? null;
}

export function getMetricsSummary(metrics: GuildMetricsDaily[]) {
  const series = [...metrics].sort((a, b) => a.metricDate.localeCompare(b.metricDate));
  const latest = series.length ? series[series.length - 1] : null;
  const totals = series.reduce(
    (accumulator, metric) => ({
      commandsExecuted: accumulator.commandsExecuted + metric.commandsExecuted,
      moderatedMessages: accumulator.moderatedMessages + metric.moderatedMessages,
      activeMembers: Math.max(accumulator.activeMembers, metric.activeMembers),
      ticketsOpened: accumulator.ticketsOpened + metric.ticketsOpened,
      ticketsClosed: accumulator.ticketsClosed + metric.ticketsClosed,
      openTickets: metric.openTickets,
      slaBreaches: accumulator.slaBreaches + metric.slaBreaches,
    }),
    {
      commandsExecuted: 0,
      moderatedMessages: 0,
      activeMembers: 0,
      ticketsOpened: 0,
      ticketsClosed: 0,
      openTickets: 0,
      slaBreaches: 0,
    },
  );

  const averageUptime = series.length
    ? series.reduce((total, metric) => total + metric.uptimePercentage, 0) / series.length
    : 0;

  const averageFirstResponseMinutes = (() => {
    const values = series
      .map((metric) => metric.avgFirstResponseMinutes)
      .filter((value): value is number => typeof value === 'number');
    if (!values.length) {
      return null;
    }

    return values.reduce((total, value) => total + value, 0) / values.length;
  })();

  const modulesActive = Array.from(
    new Set(series.flatMap((metric) => metric.modulesActive)),
  ).sort();

  return {
    series,
    latest,
    totals,
    averageUptime,
    averageFirstResponseMinutes,
    modulesActive,
  };
}

export function getLatestMutationForSection(
  mutations: GuildConfigMutation[],
  section: ConfigMutationSectionId | string,
): GuildConfigMutation | null {
  return mutations.find(
    (mutation) => mutation.mutationType === 'config' && mutation.section === section,
  ) ?? null;
}

export function getLatestBackupMutation(mutations: GuildConfigMutation[]): GuildConfigMutation | null {
  return mutations.find((mutation) => mutation.mutationType === 'backup') ?? null;
}

export function summarizeMutationPayload(payload: unknown): string {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Solicitud enviada';
  }

  const keys = Object.keys(payload as Record<string, unknown>);
  if (!keys.length) {
    return 'Solicitud enviada';
  }

  const visible = keys.slice(0, 3).map((key) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
  const suffix = keys.length > visible.length ? ` y ${keys.length - visible.length} mas` : '';
  return `${visible.join(', ')}${suffix}`;
}

export function getSetupCompletion(config: GuildConfig): { completed: number; total: number; ratio: number } {
  const checks = [
    Boolean(config.serverRolesChannelsSettings.logsChannelId),
    Boolean(config.serverRolesChannelsSettings.transcriptChannelId),
    Boolean(config.serverRolesChannelsSettings.supportRoleId),
    Boolean(config.serverRolesChannelsSettings.adminRoleId),
    Boolean(config.serverRolesChannelsSettings.ticketPanelChannelId),
    Boolean(config.ticketsSettings.maxTickets),
    Boolean(config.verificationSettings.channelId || config.verificationSettings.enabled === false),
    Boolean(config.welcomeSettings.welcomeChannelId || config.welcomeSettings.welcomeEnabled === false),
    Boolean(config.suggestionSettings.channelId || config.suggestionSettings.enabled === false),
    Boolean(config.modlogSettings.channelId || config.modlogSettings.enabled === false),
  ];

  const completed = checks.filter(Boolean).length;
  return {
    completed,
    total: checks.length,
    ratio: checks.length ? completed / checks.length : 0,
  };
}

export function getActiveModules(config: GuildConfig): string[] {
  const modules = [
    config.verificationSettings.enabled ? 'verification' : null,
    config.welcomeSettings.welcomeEnabled ? 'welcome' : null,
    config.suggestionSettings.enabled ? 'suggestions' : null,
    config.modlogSettings.enabled ? 'modlogs' : null,
    config.ticketsSettings.dailySlaReportEnabled ? 'daily_report' : null,
    config.ticketsSettings.autoAssignEnabled ? 'auto_assign' : null,
    config.systemSettings.maintenanceMode ? 'maintenance' : null,
  ].filter((item): item is string => Boolean(item));

  return modules;
}

export function isSessionReady(authState: DashboardSessionState): boolean {
  return Boolean(authState.user);
}

export function isGuildHealthy(syncStatus: GuildSyncStatus | null, guild: DashboardGuild): boolean {
  if (!syncStatus) {
    return Boolean(guild.botInstalled);
  }

  return syncStatus.bridgeStatus !== 'error' && syncStatus.failedMutations === 0;
}

export function getRoleOptions(inventory: GuildInventory) {
  return inventory.roles
    .map((role) => ({
      value: role.id,
      label: role.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getChannelOptions(inventory: GuildInventory, allowedTypes?: string[]) {
  const allowed = allowedTypes ? new Set(allowedTypes) : null;

  return inventory.channels
    .filter((channel) => !allowed || allowed.has(channel.type))
    .map((channel) => ({
      value: channel.id,
      label: `#${channel.name}`,
      type: channel.type,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getCategoryOptions(inventory: GuildInventory) {
  return inventory.categories
    .map((category) => ({
      value: category.id,
      label: category.label,
      description: category.description,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getCommandOptions(inventory: GuildInventory) {
  return inventory.commands
    .map((command) => ({
      value: command.name,
      label: command.label,
      category: command.category,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getHealthLabel(syncStatus: GuildSyncStatus | null): string {
  if (!syncStatus) {
    return 'Sin telemetria';
  }

  switch (syncStatus.bridgeStatus) {
    case 'healthy':
      return 'Sincronizado';
    case 'degraded':
      return 'Con retraso';
    case 'error':
      return 'Con errores';
    default:
      return 'Desconocido';
  }
}

export function getTicketStatusLabel(status: TicketWorkflowStatus): string {
  switch (status) {
    case 'new':
      return 'Nuevo';
    case 'triage':
      return 'Triage';
    case 'waiting_user':
      return 'Esperando usuario';
    case 'waiting_staff':
      return 'Esperando staff';
    case 'escalated':
      return 'Escalado';
    case 'resolved':
      return 'Resuelto';
    case 'closed':
      return 'Cerrado';
    default:
      return status;
  }
}

export function getTicketQueueLabel(queueType: TicketInboxItem['queueType']): string {
  return queueType === 'community' ? 'Comunidad' : 'Soporte';
}

export function getTicketSlaLabel(slaState: TicketSlaState): string {
  switch (slaState) {
    case 'warning':
      return 'Por vencer';
    case 'breached':
      return 'Incumplido';
    case 'paused':
      return 'Pausado';
    case 'resolved':
      return 'Resuelto';
    default:
      return 'Saludable';
  }
}

export function formatMinutesLabel(minutes: number | null): string {
  if (!minutes || minutes <= 0) {
    return 'Sin SLA';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

export function getTicketWorkspaceSummary(inbox: TicketInboxItem[]) {
  const open = inbox.filter((ticket) => ticket.isOpen);
  const breached = open.filter((ticket) => ticket.slaState === 'breached');
  const warning = open.filter((ticket) => ticket.slaState === 'warning');
  const claimed = open.filter((ticket) => Boolean(ticket.claimedBy));
  const resolved = inbox.filter((ticket) => ticket.workflowStatus === 'resolved');
  const queues = open.reduce<Record<'support' | 'community', number>>(
    (accumulator, ticket) => {
      accumulator[ticket.queueType] += 1;
      return accumulator;
    },
    {
      support: 0,
      community: 0,
    },
  );

  return {
    total: inbox.length,
    open: open.length,
    breached: breached.length,
    warning: warning.length,
    claimed: claimed.length,
    unclaimed: open.length - claimed.length,
    resolved: resolved.length,
    queues,
  };
}

export function getTicketEventsForTicket(
  events: TicketConversationEvent[],
  ticketId: string | null,
): TicketConversationEvent[] {
  if (!ticketId) {
    return [];
  }

  return events.filter((event) => event.ticketId === ticketId);
}

export function getCustomerProfileForTicket(
  inbox: TicketInboxItem[],
  ticket: TicketInboxItem | null,
): TicketCustomerProfile | null {
  if (!ticket) {
    return null;
  }

  const customerTickets = inbox
    .filter((entry) => entry.userId === ticket.userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return {
    userId: ticket.userId,
    displayLabel: ticket.userLabel ?? `Usuario ${ticket.userId}`,
    openTickets: customerTickets.filter((entry) => entry.isOpen).length,
    closedTickets: customerTickets.filter((entry) => !entry.isOpen).length,
    lastTicketAt: customerTickets[0]?.createdAt ?? null,
    recentTickets: customerTickets.slice(0, 6),
  };
}
