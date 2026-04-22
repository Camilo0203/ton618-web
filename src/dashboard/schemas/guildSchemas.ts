import { z } from 'zod';
import {
  commandSettingsSchema,
  dashboardPreferencesSchema,
  generalSettingsSchema,
  modlogSettingsSchema,
  serverRolesChannelsSettingsSchema,
  suggestionSettingsSchema,
  systemSettingsSchema,
  ticketsSettingsSchema,
  verificationSettingsSchema,
  welcomeSettingsSchema,
} from './configSchemas';

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

export const guildBillingEntitlementSchema = z.object({
  guildId: z.string().min(1),
  effectivePlan: z.enum(['free', 'pro', 'enterprise']),
  planSource: z.enum(['free', 'stripe', 'override']),
  subscriptionStatus: z.string().nullable(),
  billingInterval: z.enum(['month', 'year']).nullable(),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  supporterEnabled: z.boolean(),
  supporterExpiresAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const checkoutSessionResultSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string().nullable(),
});

export const customerPortalSessionSchema = z.object({
  url: z.string().url(),
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
