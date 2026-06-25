import { z } from 'zod';
import { dashboardSectionIds, discordIdSchema, stringRecordSchema, textOrNullSchema, urlOrNullSchema } from './primitives';

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
    opsPlan: z.enum(['free', 'pro', 'enterprise']),
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
}).superRefine((value, context) => {
  if (value.slaEscalationEnabled) {
    if (value.slaEscalationMinutes <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Define en cuantos minutos debe escalarse el ticket.',
        path: ['slaEscalationMinutes'],
      });
    }

    if (!value.slaEscalationRoleId && !value.slaEscalationChannelId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El escalado necesita un rol o un canal para avisar al staff.',
        path: ['slaEscalationRoleId'],
      });
    }
  }

  if (value.dailySlaReportEnabled && !value.dailySlaReportChannelId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona el canal donde llegara el reporte diario.',
      path: ['dailySlaReportChannelId'],
    });
  }

  if (value.incidentModeEnabled && value.incidentPausedCategories.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Elige al menos una categoria para pausar durante incidentes.',
      path: ['incidentPausedCategories'],
    });
  }

  if (value.incidentModeEnabled && !value.incidentMessage?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Explica que vera el usuario cuando el modo incidente este activo.',
      path: ['incidentMessage'],
    });
  }
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
}).superRefine((value, context) => {
  if (!value.enabled) {
    return;
  }

  if (!value.channelId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona el canal donde se publicara el panel.',
      path: ['channelId'],
    });
  }

  if (!value.verifiedRoleId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona el rol que recibiran los usuarios verificados.',
      path: ['verifiedRoleId'],
    });
  }

  if (value.mode === 'question') {
    if (!value.question.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Escribe la pregunta de verificacion.',
        path: ['question'],
      });
    }

    if (!value.questionAnswer.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La verificacion por pregunta necesita una respuesta valida.',
        path: ['questionAnswer'],
      });
    }
  }
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
}).superRefine((value, context) => {
  if (value.welcomeEnabled && !value.welcomeChannelId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona el canal donde se enviara la bienvenida.',
      path: ['welcomeChannelId'],
    });
  }

  if (value.welcomeDm && !value.welcomeDmMessage?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Escribe el DM que recibira el miembro al entrar.',
      path: ['welcomeDmMessage'],
    });
  }

  if (value.goodbyeEnabled && !value.goodbyeChannelId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona el canal donde se enviara la despedida.',
      path: ['goodbyeChannelId'],
    });
  }
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
}).superRefine((value, context) => {
  if (!value.enabled) {
    return;
  }

  if (!value.channelId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona el canal principal de sugerencias.',
      path: ['channelId'],
    });
  }

  if (!value.logChannelId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Conviene definir un canal interno para el staff.',
      path: ['logChannelId'],
    });
  }

  if (!value.approvedChannelId && !value.rejectedChannelId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Define al menos un canal para publicar el resultado.',
      path: ['approvedChannelId'],
    });
  }
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
}).superRefine((value, context) => {
  if (!value.enabled) {
    return;
  }

  if (!value.channelId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona el canal donde se escribiran los modlogs.',
      path: ['channelId'],
    });
  }

  if (
    ![
      value.logBans,
      value.logUnbans,
      value.logKicks,
      value.logMessageDelete,
      value.logMessageEdit,
      value.logRoleAdd,
      value.logRoleRemove,
      value.logNickname,
      value.logJoins,
      value.logLeaves,
      value.logVoice,
    ].some(Boolean)
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Activa al menos un evento para que el registro tenga sentido.',
      path: ['logBans'],
    });
  }
});

export const automodSettingsSchema = z.object({
  enabled: z.boolean(),
  preset: z.enum(['off', 'balanced', 'strict']),
  blockInvites: z.boolean(),
  blockLinks: z.boolean(),
  blockSpam: z.boolean(),
  blockMassMentions: z.boolean(),
  blockCaps: z.boolean(),
  scamProtection: z.boolean(),
  regexProtection: z.boolean(),
  logChannelId: discordIdSchema,
  alertRoleId: discordIdSchema,
}).superRefine((value, context) => {
  if (value.enabled && value.preset === 'off') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecciona balanced o strict si AutoMod esta activo.',
      path: ['preset'],
    });
  }
});

export const musicSettingsSchema = z.object({
  enabled: z.boolean(),
  defaultVolume: z.number().int().min(1).max(100),
  maxFreeQueue: z.number().int().min(1).max(50),
  maxProQueue: z.number().int().min(10).max(500),
  maxFreeDurationMinutes: z.number().int().min(1).max(60),
  maxProDurationMinutes: z.number().int().min(10).max(720),
  allowSpotify: z.boolean(),
  allowPlaylists: z.boolean(),
  allowFilters: z.boolean(),
  djRoleId: discordIdSchema,
  announceNowPlaying: z.boolean(),
  disconnectOnEmpty: z.boolean(),
}).superRefine((value, context) => {
  if (value.maxProQueue <= value.maxFreeQueue) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El limite PRO debe ser mayor que el limite FREE.',
      path: ['maxProQueue'],
    });
  }

  if (value.maxProDurationMinutes <= value.maxFreeDurationMinutes) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La duracion PRO debe ser mayor que la duracion FREE.',
      path: ['maxProDurationMinutes'],
    });
  }
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
}).superRefine((value, context) => {
  const normalizedDisabled = value.disabledCommands.map((command) => command.trim()).filter(Boolean);
  const duplicates = normalizedDisabled.filter(
    (command, index) => normalizedDisabled.indexOf(command) !== index,
  );

  if (duplicates.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Hay comandos repetidos en la lista deshabilitada: ${Array.from(new Set(duplicates)).join(', ')}.`,
      path: ['disabledCommands'],
    });
  }
});

export const systemSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  maintenanceReason: textOrNullSchema,
  legacyProtectionSettings: legacyProtectionSettingsSchema,
}).superRefine((value, context) => {
  if (value.maintenanceMode && !value.maintenanceReason?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Explica por que el servidor quedara en mantenimiento.',
      path: ['maintenanceReason'],
    });
  }
});
