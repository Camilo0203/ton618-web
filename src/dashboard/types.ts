import type { Session, User } from '@supabase/supabase-js';

export type DashboardSectionId =
  | 'overview'
  | 'general'
  | 'server_roles'
  | 'tickets'
  | 'verification'
  | 'welcome'
  | 'suggestions'
  | 'modlogs'
  | 'commands'
  | 'system'
  | 'activity'
  | 'analytics';

export type DashboardTaskGroupId =
  | 'home'
  | 'setup'
  | 'community'
  | 'support'
  | 'moderation'
  | 'system';

export interface DashboardNavShortcut {
  id: string;
  label: string;
  description: string;
  sectionId: DashboardSectionId;
}

export type ConfigMutationSectionId =
  | 'general'
  | 'server_roles_channels'
  | 'tickets'
  | 'verification'
  | 'welcome'
  | 'suggestions'
  | 'modlogs'
  | 'commands'
  | 'system';

export interface DashboardSessionState {
  session: Session | null;
  user: User | null;
}

export interface DashboardGuild {
  guildId: string;
  guildName: string;
  guildIcon: string | null;
  permissionsRaw: string;
  canManage: boolean;
  isOwner: boolean;
  botInstalled: boolean;
  memberCount: number | null;
  premiumTier: string | null;
  botLastSeenAt: string | null;
  lastSyncedAt: string | null;
}

export type DashboardBillingInterval = 'month' | 'year';
export type DashboardEffectivePlan = 'free' | 'pro' | 'enterprise';
export type DashboardPlanSource = 'free' | 'stripe' | 'override';

export interface GuildBillingEntitlement {
  guildId: string;
  effectivePlan: DashboardEffectivePlan;
  planSource: DashboardPlanSource;
  subscriptionStatus: string | null;
  billingInterval: DashboardBillingInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  supporterEnabled: boolean;
  supporterExpiresAt: string | null;
  updatedAt: string | null;
}

export interface CheckoutSessionResult {
  url: string;
  expiresAt: string | null;
}

export interface CustomerPortalSessionResult {
  url: string;
}

export interface GeneralSettings {
  language: 'es' | 'en';
  commandMode: 'mention' | 'prefix';
  prefix: string;
  timezone: string;
  moderationPreset: 'relaxed' | 'balanced' | 'strict';
  opsPlan: 'free' | 'pro' | 'enterprise';
}

export interface LegacyProtectionSettings {
  antiSpamEnabled: boolean;
  antiSpamThreshold: number;
  linkFilterEnabled: boolean;
  capsFilterEnabled: boolean;
  capsPercentageLimit: number;
  duplicateFilterEnabled: boolean;
  duplicateWindowSeconds: number;
  raidProtectionEnabled: boolean;
  raidPreset: 'off' | 'balanced' | 'lockdown';
}

export interface DashboardPreferences {
  defaultSection: DashboardSectionId;
  compactMode: boolean;
  showAdvancedCards: boolean;
}

export interface ServerRolesChannelsSettings {
  dashboardChannelId: string | null;
  ticketPanelChannelId: string | null;
  logsChannelId: string | null;
  transcriptChannelId: string | null;
  weeklyReportChannelId: string | null;
  liveMembersChannelId: string | null;
  liveRoleChannelId: string | null;
  liveRoleId: string | null;
  supportRoleId: string | null;
  adminRoleId: string | null;
  verifyRoleId: string | null;
}

export interface TicketsSettings {
  maxTickets: number;
  globalTicketLimit: number;
  cooldownMinutes: number;
  minDays: number;
  autoCloseMinutes: number;
  slaMinutes: number;
  smartPingMinutes: number;
  slaEscalationEnabled: boolean;
  slaEscalationMinutes: number;
  slaEscalationRoleId: string | null;
  slaEscalationChannelId: string | null;
  slaOverridesPriority: Record<string, number>;
  slaOverridesCategory: Record<string, number>;
  slaEscalationOverridesPriority: Record<string, number>;
  slaEscalationOverridesCategory: Record<string, number>;
  autoAssignEnabled: boolean;
  autoAssignRequireOnline: boolean;
  autoAssignRespectAway: boolean;
  incidentModeEnabled: boolean;
  incidentPausedCategories: string[];
  incidentMessage: string | null;
  dailySlaReportEnabled: boolean;
  dailySlaReportChannelId: string | null;
  dmOnOpen: boolean;
  dmOnClose: boolean;
  dmTranscripts: boolean;
  dmAlerts: boolean;
}

export interface VerificationSettings {
  enabled: boolean;
  mode: 'button' | 'code' | 'question';
  channelId: string | null;
  verifiedRoleId: string | null;
  unverifiedRoleId: string | null;
  logChannelId: string | null;
  panelTitle: string;
  panelDescription: string;
  panelColor: string;
  panelImage: string | null;
  question: string;
  questionAnswer: string;
  antiraidEnabled: boolean;
  antiraidJoins: number;
  antiraidSeconds: number;
  antiraidAction: 'pause' | 'kick';
  dmOnVerify: boolean;
  kickUnverifiedHours: number;
}

export interface WelcomeSettings {
  welcomeEnabled: boolean;
  welcomeChannelId: string | null;
  welcomeMessage: string;
  welcomeColor: string;
  welcomeTitle: string;
  welcomeBanner: string | null;
  welcomeThumbnail: boolean;
  welcomeFooter: string | null;
  welcomeDm: boolean;
  welcomeDmMessage: string | null;
  welcomeAutoroleId: string | null;
  goodbyeEnabled: boolean;
  goodbyeChannelId: string | null;
  goodbyeMessage: string;
  goodbyeColor: string;
  goodbyeTitle: string;
  goodbyeThumbnail: boolean;
  goodbyeFooter: string | null;
}

export interface SuggestionSettings {
  enabled: boolean;
  channelId: string | null;
  logChannelId: string | null;
  approvedChannelId: string | null;
  rejectedChannelId: string | null;
  dmOnResult: boolean;
  requireReason: boolean;
  cooldownMinutes: number;
  anonymous: boolean;
}

export interface ModlogSettings {
  enabled: boolean;
  channelId: string | null;
  logBans: boolean;
  logUnbans: boolean;
  logKicks: boolean;
  logMessageDelete: boolean;
  logMessageEdit: boolean;
  logRoleAdd: boolean;
  logRoleRemove: boolean;
  logNickname: boolean;
  logJoins: boolean;
  logLeaves: boolean;
  logVoice: boolean;
}

export interface CommandRateLimitOverride {
  maxActions: number;
  windowSeconds: number;
  enabled: boolean;
}

export interface CommandSettings {
  disabledCommands: string[];
  simpleHelpMode: boolean;
  rateLimitEnabled: boolean;
  rateLimitWindowSeconds: number;
  rateLimitMaxActions: number;
  rateLimitBypassAdmin: boolean;
  commandRateLimitEnabled: boolean;
  commandRateLimitWindowSeconds: number;
  commandRateLimitMaxActions: number;
  commandRateLimitOverrides: Record<string, CommandRateLimitOverride>;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceReason: string | null;
  legacyProtectionSettings: LegacyProtectionSettings;
}

export interface GuildConfig {
  guildId: string;
  generalSettings: GeneralSettings;
  serverRolesChannelsSettings: ServerRolesChannelsSettings;
  ticketsSettings: TicketsSettings;
  verificationSettings: VerificationSettings;
  welcomeSettings: WelcomeSettings;
  suggestionSettings: SuggestionSettings;
  modlogSettings: ModlogSettings;
  commandSettings: CommandSettings;
  systemSettings: SystemSettings;
  dashboardPreferences: DashboardPreferences;
  updatedBy: string | null;
  updatedAt: string | null;
  configSource: string;
}

export interface GuildEvent {
  id: string;
  guildId: string;
  eventType: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface GuildMetricsDaily {
  guildId: string;
  metricDate: string;
  commandsExecuted: number;
  moderatedMessages: number;
  activeMembers: number;
  uptimePercentage: number;
  ticketsOpened: number;
  ticketsClosed: number;
  openTickets: number;
  slaBreaches: number;
  avgFirstResponseMinutes: number | null;
  modulesActive: string[];
}

export interface GuildInventoryRole {
  id: string;
  name: string;
  colorHex: string | null;
  position: number;
  managed: boolean;
}

export interface GuildInventoryChannel {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  position: number;
}

export interface GuildInventoryCategory {
  id: string;
  label: string;
  description: string | null;
  priority: string | null;
}

export interface GuildInventoryCommand {
  name: string;
  label: string;
  category: string | null;
}

export interface GuildInventory {
  guildId: string;
  roles: GuildInventoryRole[];
  channels: GuildInventoryChannel[];
  categories: GuildInventoryCategory[];
  commands: GuildInventoryCommand[];
  updatedAt: string | null;
}

export type GuildMutationStatus = 'pending' | 'applied' | 'failed' | 'superseded';
export type GuildMutationType = 'config' | 'backup' | 'ticket_action';

export type TicketWorkflowStatus =
  | 'new'
  | 'triage'
  | 'waiting_user'
  | 'waiting_staff'
  | 'escalated'
  | 'resolved'
  | 'closed';

export type TicketQueueType = 'support' | 'community';
export type TicketSlaState = 'healthy' | 'warning' | 'breached' | 'paused' | 'resolved';
export type TicketEventVisibility = 'public' | 'internal' | 'system';
export type TicketActorKind = 'customer' | 'staff' | 'bot' | 'system';

export interface TicketInboxItem {
  guildId: string;
  ticketId: string;
  channelId: string;
  userId: string;
  userLabel: string | null;
  workflowStatus: TicketWorkflowStatus;
  queueType: TicketQueueType;
  categoryId: string | null;
  categoryLabel: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject: string | null;
  claimedBy: string | null;
  claimedByLabel: string | null;
  assigneeId: string | null;
  assigneeLabel: string | null;
  claimedAt: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastCustomerMessageAt: string | null;
  lastStaffMessageAt: string | null;
  lastActivityAt: string | null;
  messageCount: number;
  staffMessageCount: number;
  reopenCount: number;
  tags: string[];
  slaTargetMinutes: number;
  slaDueAt: string | null;
  slaState: TicketSlaState;
  isOpen: boolean;
}

export interface TicketConversationEvent {
  id: string;
  guildId: string;
  ticketId: string;
  channelId: string | null;
  actorId: string | null;
  actorKind: TicketActorKind;
  actorLabel: string | null;
  eventType: string;
  visibility: TicketEventVisibility;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface TicketMacro {
  macroId: string;
  guildId: string;
  label: string;
  content: string;
  visibility: Extract<TicketEventVisibility, 'public' | 'internal'>;
  sortOrder: number;
  isSystem: boolean;
}

export interface TicketCustomerProfile {
  userId: string;
  displayLabel: string;
  openTickets: number;
  closedTickets: number;
  lastTicketAt: string | null;
  recentTickets: TicketInboxItem[];
}

export type TicketDashboardActionId =
  | 'claim'
  | 'unclaim'
  | 'assign_self'
  | 'unassign'
  | 'set_status'
  | 'close'
  | 'reopen'
  | 'add_note'
  | 'add_tag'
  | 'remove_tag'
  | 'reply_customer'
  | 'post_macro'
  | 'set_priority'
  | 'confirm_recommendation'
  | 'dismiss_recommendation';

export interface TicketWorkspaceSnapshot {
  inbox: TicketInboxItem[];
  events: TicketConversationEvent[];
  macros: TicketMacro[];
}

export type PlaybookTier = 'free' | 'pro' | 'enterprise';
export type PlaybookExecutionMode = 'assistive' | 'manual' | 'guided';
export type PlaybookRecommendationStatus = 'pending' | 'applied' | 'dismissed';
export type PlaybookRiskLevel = 'new' | 'returning' | 'watch';
export type PlaybookTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface PlaybookDefinition {
  guildId: string;
  playbookId: string;
  key: string;
  label: string;
  description: string;
  tier: PlaybookTier;
  executionMode: PlaybookExecutionMode;
  summary: string;
  triggerSummary: string;
  isEnabled: boolean;
  sortOrder: number;
  updatedAt: string | null;
}

export interface PlaybookRun {
  runId: string;
  guildId: string;
  playbookId: string;
  ticketId: string;
  userId: string;
  status: PlaybookRecommendationStatus;
  tone: PlaybookTone;
  title: string;
  summary: string;
  reason: string;
  suggestedAction: string | null;
  suggestedPriority: TicketInboxItem['priority'] | null;
  suggestedStatus: TicketWorkflowStatus | null;
  suggestedMacroId: string | null;
  confidence: number;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomerMemory {
  guildId: string;
  userId: string;
  displayLabel: string;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  breachedTickets: number;
  recentTags: string[];
  lastTicketAt: string | null;
  lastResolvedAt: string | null;
  riskLevel: PlaybookRiskLevel;
  summary: string;
  updatedAt: string | null;
}

export interface TicketRecommendation {
  recommendationId: string;
  guildId: string;
  ticketId: string;
  userId: string;
  playbookId: string;
  status: PlaybookRecommendationStatus;
  tone: PlaybookTone;
  title: string;
  summary: string;
  reason: string;
  suggestedAction: string | null;
  suggestedPriority: TicketInboxItem['priority'] | null;
  suggestedStatus: TicketWorkflowStatus | null;
  suggestedMacroId: string | null;
  confidence: number;
  customerRiskLevel: PlaybookRiskLevel;
  customerSummary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string | null;
}

export interface PlaybookWorkspaceSnapshot {
  definitions: PlaybookDefinition[];
  runs: PlaybookRun[];
  customerMemory: CustomerMemory[];
  recommendations: TicketRecommendation[];
}

export type DashboardPartialFailureId =
  | 'activity'
  | 'metrics'
  | 'ticket_events'
  | 'ticket_macros'
  | 'backups'
  | 'ticket_inbox'
  | 'playbook_definitions'
  | 'playbook_runs'
  | 'customer_memory'
  | 'ticket_recommendations';

export interface DashboardPartialFailure {
  id: DashboardPartialFailureId;
  label: string;
  message: string;
}

export interface GuildConfigMutation {
  id: string;
  guildId: string;
  actorUserId: string | null;
  mutationType: GuildMutationType;
  section: string;
  status: GuildMutationStatus;
  requestedPayload: unknown;
  appliedPayload: unknown | null;
  metadata: Record<string, unknown>;
  errorMessage: string | null;
  requestedAt: string;
  appliedAt: string | null;
  failedAt: string | null;
  supersededAt: string | null;
  updatedAt: string;
}

export interface GuildBackupManifest {
  backupId: string;
  guildId: string;
  actorUserId: string | null;
  source: string;
  schemaVersion: number;
  exportedAt: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface GuildSyncStatus {
  guildId: string;
  bridgeStatus: 'healthy' | 'degraded' | 'error' | 'unknown';
  bridgeMessage: string | null;
  lastHeartbeatAt: string | null;
  lastInventoryAt: string | null;
  lastConfigSyncAt: string | null;
  lastMutationProcessedAt: string | null;
  lastBackupAt: string | null;
  pendingMutations: number;
  failedMutations: number;
  updatedAt: string | null;
}

export interface GuildDashboardSnapshot {
  config: GuildConfig;
  inventory: GuildInventory;
  events: GuildEvent[];
  metrics: GuildMetricsDaily[];
  mutations: GuildConfigMutation[];
  backups: GuildBackupManifest[];
  syncStatus: GuildSyncStatus | null;
  ticketWorkspace: TicketWorkspaceSnapshot;
  playbooks: PlaybookWorkspaceSnapshot;
  partialFailures: DashboardPartialFailure[];
}

export interface DashboardSyncResult {
  guilds: DashboardGuild[];
  syncedAt: string;
  manageableCount: number;
  installedCount: number;
}
