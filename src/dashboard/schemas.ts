import { z } from 'zod';
import type {
  CommandRateLimitOverride,
  CommandSettings,
  ConfigMutationSectionId,
  DashboardPreferences,
  DashboardSectionId,
  GeneralSettings,
  GuildConfig,
  GuildInventory,
  GuildSyncStatus,
  LegacyProtectionSettings,
  ModlogSettings,
  ServerRolesChannelsSettings,
  SuggestionSettings,
  SystemSettings,
  TicketsSettings,
  VerificationSettings,
  WelcomeSettings,
} from './types';

export const dashboardSectionIds = [
  'overview',
  'inbox',
  'general',
  'server_roles',
  'tickets',
  'verification',
  'welcome',
  'suggestions',
  'modlogs',
  'commands',
  'system',
  'activity',
  'analytics',
] as const satisfies readonly DashboardSectionId[];

export const configMutationSectionIds = [
  'general',
  'server_roles_channels',
  'tickets',
  'verification',
  'welcome',
  'suggestions',
  'modlogs',
  'commands',
  'system',
] as const satisfies readonly ConfigMutationSectionId[];

function emptyStringToNull(value: unknown) {
  if (typeof value === 'string' && !value.trim()) {
    return null;
  }

  return value;
}

const discordIdSchema = z.preprocess(
  emptyStringToNull,
  z.string().trim().regex(/^\d{16,22}$/).nullable(),
);

const textOrNullSchema = z.preprocess(
  emptyStringToNull,
  z.string().trim().max(1000).nullable(),
);

const urlOrNullSchema = z.preprocess(
  emptyStringToNull,
  z.string().trim().url().nullable(),
);

const stringRecordSchema = z.record(z.string(), z.number().int().nonnegative());

export const legacyProtectionSettingsSchema = z.object({
  antiSpamEnabled: z.boolean(),
  antiSpamThreshold: z.number().int().min(2).max(20),
  linkFilterEnabled: z.boolean(),
  capsFilterEnabled: z.boolean(),
  capsPercentageLimit: z.number().int().min(20).max(100),
  duplicateFilterEnabled: z.boolean(),
  duplicateWindowSeconds: z.number().int().min(10).max(300),
  raidProtectionEnabled: z.boolean(),
  raidPreset: z.enum(['off', 'balanced', 'lockdown']),
});

export const generalSettingsSchema = z
  .object({
    language: z.enum(['es', 'en']),
    commandMode: z.enum(['mention', 'prefix']),
    prefix: z.string().trim().min(1, 'El prefijo es obligatorio').max(5, 'Usa un prefijo corto'),
    timezone: z.string().trim().min(1, 'Selecciona una zona horaria').max(80),
    moderationPreset: z.enum(['relaxed', 'balanced', 'strict']),
  })
  .superRefine((value, context) => {
    if (value.commandMode === 'prefix' && !value.prefix.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ingresa un prefijo para el modo por prefijo.',
        path: ['prefix'],
      });
    }
  });

export const dashboardPreferencesSchema = z.object({
  defaultSection: z.enum(dashboardSectionIds),
  compactMode: z.boolean(),
  showAdvancedCards: z.boolean(),
});

export const serverRolesChannelsSettingsSchema = z.object({
  dashboardChannelId: discordIdSchema,
  ticketPanelChannelId: discordIdSchema,
  logsChannelId: discordIdSchema,
  transcriptChannelId: discordIdSchema,
  weeklyReportChannelId: discordIdSchema,
  liveMembersChannelId: discordIdSchema,
  liveRoleChannelId: discordIdSchema,
  liveRoleId: discordIdSchema,
  supportRoleId: discordIdSchema,
  adminRoleId: discordIdSchema,
  verifyRoleId: discordIdSchema,
});

export const ticketsSettingsSchema = z.object({
  maxTickets: z.number().int().min(1).max(10),
  globalTicketLimit: z.number().int().min(0).max(500),
  cooldownMinutes: z.number().int().min(0).max(1440),
  minDays: z.number().int().min(0).max(365),
  autoCloseMinutes: z.number().int().min(0).max(10080),
  slaMinutes: z.number().int().min(0).max(1440),
  smartPingMinutes: z.number().int().min(0).max(1440),
  slaEscalationEnabled: z.boolean(),
  slaEscalationMinutes: z.number().int().min(0).max(10080),
  slaEscalationRoleId: discordIdSchema,
  slaEscalationChannelId: discordIdSchema,
  slaOverridesPriority: stringRecordSchema,
  slaOverridesCategory: stringRecordSchema,
  slaEscalationOverridesPriority: stringRecordSchema,
  slaEscalationOverridesCategory: stringRecordSchema,
  autoAssignEnabled: z.boolean(),
  autoAssignRequireOnline: z.boolean(),
  autoAssignRespectAway: z.boolean(),
  incidentModeEnabled: z.boolean(),
  incidentPausedCategories: z.array(z.string().trim().min(1)).max(25),
  incidentMessage: textOrNullSchema,
  dailySlaReportEnabled: z.boolean(),
  dailySlaReportChannelId: discordIdSchema,
  dmOnOpen: z.boolean(),
  dmOnClose: z.boolean(),
  dmTranscripts: z.boolean(),
  dmAlerts: z.boolean(),
});

export const verificationSettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(['button', 'code', 'question']),
  channelId: discordIdSchema,
  verifiedRoleId: discordIdSchema,
  unverifiedRoleId: discordIdSchema,
  logChannelId: discordIdSchema,
  panelTitle: z.string().trim().min(1).max(100),
  panelDescription: z.string().trim().min(1).max(1000),
  panelColor: z.string().trim().regex(/^[0-9A-Fa-f]{6}$/),
  panelImage: urlOrNullSchema,
  question: z.string().trim().min(1).max(200),
  questionAnswer: z.string().trim().min(1).max(100),
  antiraidEnabled: z.boolean(),
  antiraidJoins: z.number().int().min(3).max(50),
  antiraidSeconds: z.number().int().min(5).max(60),
  antiraidAction: z.enum(['pause', 'kick']),
  dmOnVerify: z.boolean(),
  kickUnverifiedHours: z.number().int().min(0).max(168),
});

export const welcomeSettingsSchema = z.object({
  welcomeEnabled: z.boolean(),
  welcomeChannelId: discordIdSchema,
  welcomeMessage: z.string().trim().min(1).max(1000),
  welcomeColor: z.string().trim().regex(/^[0-9A-Fa-f]{6}$/),
  welcomeTitle: z.string().trim().min(1).max(100),
  welcomeBanner: urlOrNullSchema,
  welcomeThumbnail: z.boolean(),
  welcomeFooter: textOrNullSchema,
  welcomeDm: z.boolean(),
  welcomeDmMessage: textOrNullSchema,
  welcomeAutoroleId: discordIdSchema,
  goodbyeEnabled: z.boolean(),
  goodbyeChannelId: discordIdSchema,
  goodbyeMessage: z.string().trim().min(1).max(1000),
  goodbyeColor: z.string().trim().regex(/^[0-9A-Fa-f]{6}$/),
  goodbyeTitle: z.string().trim().min(1).max(100),
  goodbyeThumbnail: z.boolean(),
  goodbyeFooter: textOrNullSchema,
});

export const suggestionSettingsSchema = z.object({
  enabled: z.boolean(),
  channelId: discordIdSchema,
  logChannelId: discordIdSchema,
  approvedChannelId: discordIdSchema,
  rejectedChannelId: discordIdSchema,
  dmOnResult: z.boolean(),
  requireReason: z.boolean(),
  cooldownMinutes: z.number().int().min(0).max(1440),
  anonymous: z.boolean(),
});

export const modlogSettingsSchema = z.object({
  enabled: z.boolean(),
  channelId: discordIdSchema,
  logBans: z.boolean(),
  logUnbans: z.boolean(),
  logKicks: z.boolean(),
  logMessageDelete: z.boolean(),
  logMessageEdit: z.boolean(),
  logRoleAdd: z.boolean(),
  logRoleRemove: z.boolean(),
  logNickname: z.boolean(),
  logJoins: z.boolean(),
  logLeaves: z.boolean(),
  logVoice: z.boolean(),
});

export const commandRateLimitOverrideSchema = z.object({
  maxActions: z.number().int().min(1).max(50),
  windowSeconds: z.number().int().min(1).max(300),
  enabled: z.boolean(),
});

export const commandSettingsSchema = z.object({
  disabledCommands: z.array(z.string().trim().min(1).max(64)).max(100),
  simpleHelpMode: z.boolean(),
  rateLimitEnabled: z.boolean(),
  rateLimitWindowSeconds: z.number().int().min(3).max(120),
  rateLimitMaxActions: z.number().int().min(1).max(50),
  rateLimitBypassAdmin: z.boolean(),
  commandRateLimitEnabled: z.boolean(),
  commandRateLimitWindowSeconds: z.number().int().min(1).max(300),
  commandRateLimitMaxActions: z.number().int().min(1).max(50),
  commandRateLimitOverrides: z.record(z.string(), commandRateLimitOverrideSchema),
});

export const systemSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  maintenanceReason: textOrNullSchema,
  legacyProtectionSettings: legacyProtectionSettingsSchema,
});

export const dashboardGuildSchema = z.object({
  guildId: z.string().min(1),
  guildName: z.string().min(1),
  guildIcon: z.string().nullable(),
  permissionsRaw: z.string().default('0'),
  canManage: z.boolean(),
  isOwner: z.boolean(),
  botInstalled: z.boolean(),
  memberCount: z.number().int().nullable(),
  premiumTier: z.string().nullable(),
  botLastSeenAt: z.string().nullable(),
  lastSyncedAt: z.string().nullable(),
});

export const guildConfigSchema = z.object({
  guildId: z.string().min(1),
  generalSettings: generalSettingsSchema,
  serverRolesChannelsSettings: serverRolesChannelsSettingsSchema,
  ticketsSettings: ticketsSettingsSchema,
  verificationSettings: verificationSettingsSchema,
  welcomeSettings: welcomeSettingsSchema,
  suggestionSettings: suggestionSettingsSchema,
  modlogSettings: modlogSettingsSchema,
  commandSettings: commandSettingsSchema,
  systemSettings: systemSettingsSchema,
  dashboardPreferences: dashboardPreferencesSchema,
  updatedBy: z.string().nullable(),
  updatedAt: z.string().nullable(),
  configSource: z.string().min(1),
});

export const guildEventSchema = z.object({
  id: z.string().min(1),
  guildId: z.string().min(1),
  eventType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().min(1),
});

export const guildMetricsSchema = z.object({
  guildId: z.string().min(1),
  metricDate: z.string().min(1),
  commandsExecuted: z.number().int().nonnegative(),
  moderatedMessages: z.number().int().nonnegative(),
  activeMembers: z.number().int().nonnegative(),
  uptimePercentage: z.number().min(0).max(100),
  ticketsOpened: z.number().int().nonnegative(),
  ticketsClosed: z.number().int().nonnegative(),
  openTickets: z.number().int().nonnegative(),
  slaBreaches: z.number().int().nonnegative(),
  avgFirstResponseMinutes: z.number().nonnegative().nullable(),
  modulesActive: z.array(z.string()),
});

export const guildInventoryRoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  colorHex: z.string().nullable(),
  position: z.number().int().nonnegative(),
  managed: z.boolean(),
});

export const guildInventoryChannelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  parentId: z.string().nullable(),
  position: z.number().int().nonnegative(),
});

export const guildInventoryCategorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().nullable(),
  priority: z.string().nullable(),
});

export const guildInventoryCommandSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  category: z.string().nullable(),
});

export const guildInventorySchema = z.object({
  guildId: z.string().min(1),
  roles: z.array(guildInventoryRoleSchema),
  channels: z.array(guildInventoryChannelSchema),
  categories: z.array(guildInventoryCategorySchema),
  commands: z.array(guildInventoryCommandSchema),
  updatedAt: z.string().nullable(),
});

export const guildMutationSchema = z.object({
  id: z.string().min(1),
  guildId: z.string().min(1),
  actorUserId: z.string().nullable(),
  mutationType: z.enum(['config', 'backup', 'ticket_action']),
  section: z.string().min(1),
  status: z.enum(['pending', 'applied', 'failed', 'superseded']),
  requestedPayload: z.unknown(),
  appliedPayload: z.unknown().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  errorMessage: z.string().nullable(),
  requestedAt: z.string().min(1),
  appliedAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  supersededAt: z.string().nullable(),
  updatedAt: z.string().min(1),
});

export const guildBackupManifestSchema = z.object({
  backupId: z.string().min(1),
  guildId: z.string().min(1),
  actorUserId: z.string().nullable(),
  source: z.string().min(1),
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string().min(1),
  createdAt: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const guildSyncStatusSchema = z.object({
  guildId: z.string().min(1),
  bridgeStatus: z.enum(['healthy', 'degraded', 'error', 'unknown']),
  bridgeMessage: z.string().nullable(),
  lastHeartbeatAt: z.string().nullable(),
  lastInventoryAt: z.string().nullable(),
  lastConfigSyncAt: z.string().nullable(),
  lastMutationProcessedAt: z.string().nullable(),
  lastBackupAt: z.string().nullable(),
  pendingMutations: z.number().int().nonnegative(),
  failedMutations: z.number().int().nonnegative(),
  updatedAt: z.string().nullable(),
});

export const dashboardSyncResultSchema = z.object({
  guilds: z.array(dashboardGuildSchema),
  syncedAt: z.string().min(1),
  manageableCount: z.number().int().nonnegative(),
  installedCount: z.number().int().nonnegative(),
});

export const ticketWorkflowStatusSchema = z.enum([
  'new',
  'triage',
  'waiting_user',
  'waiting_staff',
  'escalated',
  'resolved',
  'closed',
]);

export const ticketQueueTypeSchema = z.enum(['support', 'community']);
export const ticketSlaStateSchema = z.enum(['healthy', 'warning', 'breached', 'paused', 'resolved']);
export const ticketEventVisibilitySchema = z.enum(['public', 'internal', 'system']);
export const ticketActorKindSchema = z.enum(['customer', 'staff', 'bot', 'system']);

export const ticketInboxItemSchema = z.object({
  guildId: z.string().min(1),
  ticketId: z.string().min(1),
  channelId: z.string().min(1),
  userId: z.string().min(1),
  userLabel: z.string().nullable(),
  workflowStatus: ticketWorkflowStatusSchema,
  queueType: ticketQueueTypeSchema,
  categoryId: z.string().nullable(),
  categoryLabel: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  subject: z.string().nullable(),
  claimedBy: z.string().nullable(),
  claimedByLabel: z.string().nullable(),
  assigneeId: z.string().nullable(),
  assigneeLabel: z.string().nullable(),
  claimedAt: z.string().nullable(),
  firstResponseAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  lastCustomerMessageAt: z.string().nullable(),
  lastStaffMessageAt: z.string().nullable(),
  lastActivityAt: z.string().nullable(),
  messageCount: z.number().int().nonnegative(),
  staffMessageCount: z.number().int().nonnegative(),
  reopenCount: z.number().int().nonnegative(),
  tags: z.array(z.string().min(1)),
  slaTargetMinutes: z.number().int().nonnegative(),
  slaDueAt: z.string().nullable(),
  slaState: ticketSlaStateSchema,
  isOpen: z.boolean(),
});

export const ticketConversationEventSchema = z.object({
  id: z.string().min(1),
  guildId: z.string().min(1),
  ticketId: z.string().min(1),
  channelId: z.string().nullable(),
  actorId: z.string().nullable(),
  actorKind: ticketActorKindSchema,
  actorLabel: z.string().nullable(),
  eventType: z.string().min(1),
  visibility: ticketEventVisibilitySchema,
  title: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().min(1),
});

export const ticketMacroSchema = z.object({
  macroId: z.string().min(1),
  guildId: z.string().min(1),
  label: z.string().min(1),
  content: z.string().min(1),
  visibility: z.enum(['public', 'internal']),
  sortOrder: z.number().int().nonnegative(),
  isSystem: z.boolean(),
});

export const ticketWorkspaceSchema = z.object({
  inbox: z.array(ticketInboxItemSchema),
  events: z.array(ticketConversationEventSchema),
  macros: z.array(ticketMacroSchema),
});

const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export const defaultGeneralSettings: GeneralSettings = {
  language: 'es',
  commandMode: 'mention',
  prefix: '!',
  timezone: systemTimezone,
  moderationPreset: 'balanced',
};

export const defaultLegacyProtectionSettings: LegacyProtectionSettings = {
  antiSpamEnabled: true,
  antiSpamThreshold: 6,
  linkFilterEnabled: true,
  capsFilterEnabled: true,
  capsPercentageLimit: 70,
  duplicateFilterEnabled: true,
  duplicateWindowSeconds: 45,
  raidProtectionEnabled: true,
  raidPreset: 'balanced',
};

export const defaultDashboardPreferences: DashboardPreferences = {
  defaultSection: 'overview',
  compactMode: false,
  showAdvancedCards: true,
};

export const defaultServerRolesChannelsSettings: ServerRolesChannelsSettings = {
  dashboardChannelId: null,
  ticketPanelChannelId: null,
  logsChannelId: null,
  transcriptChannelId: null,
  weeklyReportChannelId: null,
  liveMembersChannelId: null,
  liveRoleChannelId: null,
  liveRoleId: null,
  supportRoleId: null,
  adminRoleId: null,
  verifyRoleId: null,
};

export const defaultTicketsSettings: TicketsSettings = {
  maxTickets: 3,
  globalTicketLimit: 0,
  cooldownMinutes: 0,
  minDays: 0,
  autoCloseMinutes: 0,
  slaMinutes: 0,
  smartPingMinutes: 0,
  slaEscalationEnabled: false,
  slaEscalationMinutes: 0,
  slaEscalationRoleId: null,
  slaEscalationChannelId: null,
  slaOverridesPriority: {},
  slaOverridesCategory: {},
  slaEscalationOverridesPriority: {},
  slaEscalationOverridesCategory: {},
  autoAssignEnabled: false,
  autoAssignRequireOnline: true,
  autoAssignRespectAway: true,
  incidentModeEnabled: false,
  incidentPausedCategories: [],
  incidentMessage: null,
  dailySlaReportEnabled: false,
  dailySlaReportChannelId: null,
  dmOnOpen: true,
  dmOnClose: true,
  dmTranscripts: true,
  dmAlerts: true,
};

export const defaultVerificationSettings: VerificationSettings = {
  enabled: false,
  mode: 'button',
  channelId: null,
  verifiedRoleId: null,
  unverifiedRoleId: null,
  logChannelId: null,
  panelTitle: 'Verificacion',
  panelDescription: 'Para acceder al servidor, debes verificarte.',
  panelColor: '57F287',
  panelImage: null,
  question: 'Leiste las reglas del servidor?',
  questionAnswer: 'si',
  antiraidEnabled: false,
  antiraidJoins: 10,
  antiraidSeconds: 10,
  antiraidAction: 'pause',
  dmOnVerify: true,
  kickUnverifiedHours: 0,
};

export const defaultWelcomeSettings: WelcomeSettings = {
  welcomeEnabled: false,
  welcomeChannelId: null,
  welcomeMessage: 'Bienvenido/a **{mention}** al servidor **{server}**!',
  welcomeColor: '5865F2',
  welcomeTitle: 'Bienvenido/a',
  welcomeBanner: null,
  welcomeThumbnail: true,
  welcomeFooter: 'Espero que disfrutes tu estadia.',
  welcomeDm: false,
  welcomeDmMessage: 'Hola **{user}**! Bienvenido/a a **{server}**.',
  welcomeAutoroleId: null,
  goodbyeEnabled: false,
  goodbyeChannelId: null,
  goodbyeMessage: '**{user}** ha abandonado el servidor.',
  goodbyeColor: 'ED4245',
  goodbyeTitle: 'Hasta luego',
  goodbyeThumbnail: true,
  goodbyeFooter: 'Espero verte de nuevo pronto.',
};

export const defaultSuggestionSettings: SuggestionSettings = {
  enabled: false,
  channelId: null,
  logChannelId: null,
  approvedChannelId: null,
  rejectedChannelId: null,
  dmOnResult: true,
  requireReason: false,
  cooldownMinutes: 5,
  anonymous: false,
};

export const defaultModlogSettings: ModlogSettings = {
  enabled: false,
  channelId: null,
  logBans: true,
  logUnbans: true,
  logKicks: true,
  logMessageDelete: true,
  logMessageEdit: true,
  logRoleAdd: true,
  logRoleRemove: true,
  logNickname: true,
  logJoins: false,
  logLeaves: false,
  logVoice: false,
};

export const defaultCommandRateLimitOverride: CommandRateLimitOverride = {
  maxActions: 4,
  windowSeconds: 20,
  enabled: true,
};

export const defaultCommandSettings: CommandSettings = {
  disabledCommands: [],
  simpleHelpMode: true,
  rateLimitEnabled: true,
  rateLimitWindowSeconds: 10,
  rateLimitMaxActions: 8,
  rateLimitBypassAdmin: true,
  commandRateLimitEnabled: true,
  commandRateLimitWindowSeconds: 20,
  commandRateLimitMaxActions: 4,
  commandRateLimitOverrides: {},
};

export const defaultSystemSettings: SystemSettings = {
  maintenanceMode: false,
  maintenanceReason: null,
  legacyProtectionSettings: defaultLegacyProtectionSettings,
};

export const defaultGuildConfig: Omit<GuildConfig, 'guildId'> = {
  generalSettings: defaultGeneralSettings,
  serverRolesChannelsSettings: defaultServerRolesChannelsSettings,
  ticketsSettings: defaultTicketsSettings,
  verificationSettings: defaultVerificationSettings,
  welcomeSettings: defaultWelcomeSettings,
  suggestionSettings: defaultSuggestionSettings,
  modlogSettings: defaultModlogSettings,
  commandSettings: defaultCommandSettings,
  systemSettings: defaultSystemSettings,
  dashboardPreferences: defaultDashboardPreferences,
  updatedBy: null,
  updatedAt: null,
  configSource: 'bot',
};

export const defaultGuildInventory: Omit<GuildInventory, 'guildId'> = {
  roles: [],
  channels: [],
  categories: [],
  commands: [],
  updatedAt: null,
};

export const defaultGuildSyncStatus: GuildSyncStatus = {
  guildId: '',
  bridgeStatus: 'unknown',
  bridgeMessage: null,
  lastHeartbeatAt: null,
  lastInventoryAt: null,
  lastConfigSyncAt: null,
  lastMutationProcessedAt: null,
  lastBackupAt: null,
  pendingMutations: 0,
  failedMutations: 0,
  updatedAt: null,
};
