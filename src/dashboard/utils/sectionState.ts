import i18n from '../../locales/i18n';
import { dashboardSections, dashboardTaskGroups } from '../constants';
import type {
  DashboardGuild,
  DashboardSectionId,
  GuildBackupManifest,
  GuildConfig,
  GuildConfigMutation,
  GuildSyncStatus,
  PlaybookWorkspaceSnapshot,
} from '../types';
import { formatRelativeTime } from './format';

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
      return i18n.t('dashboard.shell.sectionStatus.active');
    case 'basic':
      return i18n.t('dashboard.shell.sectionStatus.basic');
    case 'needs_attention':
      return i18n.t('dashboard.shell.sectionStatus.needsAttention');
    default:
      return i18n.t('dashboard.shell.sectionStatus.notConfigured');
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
    label: meta ? i18n.t(meta.label) : sectionId,
    description: meta ? i18n.t(meta.description) : '',
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
  _playbooks: PlaybookWorkspaceSnapshot | null = null,
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
    !channels.dashboardChannelId ? i18n.t('dashboard.checklist.roles.missingDashboard') : null,
    !channels.ticketPanelChannelId ? i18n.t('dashboard.checklist.roles.missingTicketPanel') : null,
    !channels.supportRoleId ? i18n.t('dashboard.checklist.roles.missingSupportRole') : null,
    !channels.adminRoleId ? i18n.t('dashboard.checklist.roles.missingAdminRole') : null,
    !channels.logsChannelId ? i18n.t('dashboard.checklist.roles.missingLogs') : null,
    !channels.transcriptChannelId ? i18n.t('dashboard.checklist.roles.missingTranscripts') : null,
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
    !channels.ticketPanelChannelId ? i18n.t('dashboard.checklist.tickets.missingChannel') : null,
    tickets.slaMinutes <= 0 ? i18n.t('dashboard.checklist.tickets.missingSla') : null,
    tickets.autoAssignEnabled && !channels.supportRoleId
      ? i18n.t('dashboard.checklist.tickets.missingSupportRole')
      : null,
    tickets.slaEscalationEnabled && !tickets.slaEscalationRoleId && !tickets.slaEscalationChannelId
      ? i18n.t('dashboard.checklist.tickets.missingEscalation')
      : null,
    tickets.dailySlaReportEnabled && !tickets.dailySlaReportChannelId
      ? i18n.t('dashboard.checklist.tickets.missingReportChannel')
      : null,
  ].filter((message): message is string => Boolean(message));

  const verificationChecks = [
    !verification.enabled || Boolean(verification.channelId),
    !verification.enabled || Boolean(verification.verifiedRoleId),
    !verification.enabled || verification.panelTitle.trim().length > 0,
    !verification.enabled || (verification.mode !== 'question' || Boolean(verification.questionAnswer.trim())),
  ];
  const verificationMessages = [
    verification.enabled && !verification.channelId ? i18n.t('dashboard.checklist.verification.missingChannel') : null,
    verification.enabled && !verification.verifiedRoleId ? i18n.t('dashboard.checklist.verification.missingRole') : null,
    verification.enabled && verification.mode === 'question' && !verification.questionAnswer.trim()
      ? i18n.t('dashboard.checklist.verification.missingAnswer')
      : null,
  ].filter((message): message is string => Boolean(message));

  const welcomeChecks = [
    !welcome.welcomeEnabled || Boolean(welcome.welcomeChannelId),
    !welcome.welcomeEnabled || welcome.welcomeMessage.trim().length > 0,
    !welcome.goodbyeEnabled || Boolean(welcome.goodbyeChannelId),
  ];
  const welcomeMessages = [
    welcome.welcomeEnabled && !welcome.welcomeChannelId ? i18n.t('dashboard.checklist.welcome.missingWelcomeChannel') : null,
    welcome.goodbyeEnabled && !welcome.goodbyeChannelId ? i18n.t('dashboard.checklist.welcome.missingGoodbyeChannel') : null,
    welcome.welcomeEnabled && !welcome.welcomeAutoroleId ? i18n.t('dashboard.checklist.welcome.missingAutorole') : null,
    welcome.welcomeEnabled && !welcome.welcomeDm && !welcome.welcomeAutoroleId
      ? i18n.t('dashboard.checklist.welcome.missingDmOrRole')
      : null,
  ].filter((message): message is string => Boolean(message));

  const suggestionChecks = [
    !suggestions.enabled || Boolean(suggestions.channelId),
    !suggestions.enabled || Boolean(suggestions.logChannelId),
    !suggestions.enabled || Boolean(suggestions.approvedChannelId || suggestions.rejectedChannelId),
  ];
  const suggestionMessages = [
    suggestions.enabled && !suggestions.channelId ? i18n.t('dashboard.checklist.suggestions.missingChannel') : null,
    suggestions.enabled && !suggestions.logChannelId ? i18n.t('dashboard.checklist.suggestions.missingLogChannel') : null,
    suggestions.enabled && !suggestions.approvedChannelId && !suggestions.rejectedChannelId
      ? i18n.t('dashboard.checklist.suggestions.missingOutcomeChannel')
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
    modlogs.enabled && !modlogs.channelId ? i18n.t('dashboard.checklist.modlogs.missingChannel') : null,
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
      ? i18n.t('dashboard.checklist.modlogs.missingEvents')
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
      ? i18n.t('dashboard.checklist.commands.missingPrefix')
      : null,
    !config.generalSettings.timezone ? i18n.t('dashboard.checklist.commands.missingTimezone') : null,
    commands.rateLimitEnabled && commands.rateLimitMaxActions <= 0
      ? i18n.t('dashboard.checklist.commands.invalidRateLimit')
      : null,
    commands.commandRateLimitEnabled && commands.commandRateLimitMaxActions <= 0
      ? i18n.t('dashboard.checklist.commands.invalidCommandLimit')
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
    !guild.botInstalled ? i18n.t('dashboard.checklist.system.botMissing') : null,
    syncStatus?.bridgeStatus === 'error' ? i18n.t('dashboard.checklist.system.bridgeError') : null,
    syncStatus?.bridgeStatus === 'degraded' ? i18n.t('dashboard.checklist.system.bridgeDegraded') : null,
    backups.length === 0 ? i18n.t('dashboard.checklist.system.missingBackup') : null,
    failedMutations > 0 ? i18n.t('dashboard.checklist.system.failedMutations', { count: failedMutations }) : null,
    pendingMutations > 0 ? i18n.t('dashboard.checklist.system.pendingMutations', { count: pendingMutations }) : null,
  ].filter((message): message is string => Boolean(message));

  return [
    buildSectionState('general', ratioFromChecks([
      Boolean(config.generalSettings.language),
      Boolean(config.generalSettings.timezone),
      config.generalSettings.commandMode === 'mention' || Boolean(config.generalSettings.prefix.trim()),
    ]), [
      !config.generalSettings.timezone ? i18n.t('dashboard.checklist.commands.missingTimezone') : null,
      config.generalSettings.commandMode === 'prefix' && !config.generalSettings.prefix.trim()
        ? i18n.t('dashboard.checklist.commands.missingPrefix')
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
  const memberExperienceState = [
    verification?.status === 'needs_attention' ? verification : null,
    welcome?.status === 'needs_attention' ? welcome : null,
    welcome?.status === 'active' ? welcome : null,
    verification?.status === 'active' ? verification : null,
    verification?.status === 'basic' ? verification : null,
    welcome?.status === 'basic' ? welcome : null,
  ].find((state): state is DashboardSectionState => Boolean(state));

  return [
    {
      id: 'select-server',
      label: i18n.t('dashboard.checklist.steps.selectServer.label'),
      description: i18n.t('dashboard.checklist.steps.selectServer.desc'),
      sectionId: 'overview',
      complete: Boolean(guild.guildId && guild.botInstalled),
      status: guild.botInstalled ? 'active' : (guild.guildId ? 'basic' : 'not_configured'),
      summary: guild.botInstalled ? i18n.t('dashboard.checklist.steps.selectServer.summaryReady') : i18n.t('dashboard.checklist.steps.selectServer.summaryPending'),
    },
    {
      id: 'language-and-commands',
      label: i18n.t('dashboard.checklist.steps.language.label'),
      description: i18n.t('dashboard.checklist.steps.language.desc'),
      sectionId: 'general',
      complete: Boolean(general && general.progress >= 1),
      status: general?.status ?? 'not_configured',
      summary: general?.summary ?? i18n.t('dashboard.checklist.steps.language.summary'),
    },
    {
      id: 'roles-and-channels',
      label: i18n.t('dashboard.checklist.steps.roles.label'),
      description: i18n.t('dashboard.checklist.steps.roles.desc'),
      sectionId: 'server_roles',
      complete: Boolean(roles && roles.progress >= 0.8 && roles.messages.length === 0),
      status: roles?.status ?? 'not_configured',
      summary: roles?.summary ?? i18n.t('dashboard.checklist.steps.roles.summary'),
    },
    {
      id: 'member-experience',
      label: i18n.t('dashboard.checklist.steps.memberExp.label'),
      description: i18n.t('dashboard.checklist.steps.memberExp.desc'),
      sectionId: memberExperienceState?.sectionId ?? 'verification',
      complete: welcome?.status === 'active' || verification?.status === 'active',
      status: welcome?.status === 'active' || verification?.status === 'active'
        ? 'active'
        : (
          welcome?.status === 'needs_attention' || verification?.status === 'needs_attention'
            ? 'needs_attention'
            : (welcome?.status === 'basic' || verification?.status === 'basic' ? 'basic' : 'not_configured')
        ),
      summary: memberExperienceState?.status === 'needs_attention'
        ? memberExperienceState.summary
        : welcome?.status === 'active'
          ? i18n.t('dashboard.checklist.steps.memberExp.summaryWelcome')
          : verification?.status === 'active'
            ? i18n.t('dashboard.checklist.steps.memberExp.summaryVerification')
            : memberExperienceState && memberExperienceState.status !== 'not_configured'
              ? memberExperienceState.summary
              : i18n.t('dashboard.checklist.steps.memberExp.summaryPending'),
    },
    {
      id: 'tickets',
      label: i18n.t('dashboard.checklist.steps.tickets.label'),
      description: i18n.t('dashboard.checklist.steps.tickets.desc'),
      sectionId: 'tickets',
      complete: Boolean(tickets && tickets.progress >= 0.8 && tickets.messages.length === 0),
      status: tickets?.status ?? 'not_configured',
      summary: tickets?.summary ?? i18n.t('dashboard.checklist.steps.tickets.summary'),
    },
    {
      id: 'moderation',
      label: i18n.t('dashboard.checklist.steps.moderation.label'),
      description: i18n.t('dashboard.checklist.steps.moderation.desc'),
      sectionId: 'modlogs',
      complete: Boolean(modlogs?.status === 'active'),
      status: modlogs?.status ?? 'not_configured',
      summary: modlogs?.summary ?? i18n.t('dashboard.checklist.steps.moderation.summary'),
    },
    {
      id: 'backup',
      label: i18n.t('dashboard.checklist.steps.backup.label'),
      description: i18n.t('dashboard.checklist.steps.backup.desc'),
      sectionId: 'system',
      complete: backups.length > 0,
      status: backups.length > 0 ? 'active' : (system?.status === 'needs_attention' ? 'needs_attention' : 'not_configured'),
      summary: backups.length > 0 ? i18n.t('dashboard.checklist.steps.backup.summaryReady', { time: formatRelativeTime(backups[0]?.createdAt ?? null) }) : i18n.t('dashboard.checklist.steps.backup.summaryPending'),
    },
    {
      id: 'sync',
      label: i18n.t('dashboard.checklist.steps.sync.label'),
      description: i18n.t('dashboard.checklist.steps.sync.desc'),
      sectionId: 'system',
      complete: syncStatus?.bridgeStatus === 'healthy',
      status: system?.status ?? 'not_configured',
      summary: system?.summary ?? i18n.t('dashboard.checklist.steps.sync.summary'),
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
      label: i18n.t('dashboard.checklist.actions.continue', { label: nextChecklistStep.label }),
      description: nextChecklistStep.summary,
      sectionId: nextChecklistStep.sectionId,
      priority: 110,
    });
  }

  if (findState('server_roles')?.messages.length) {
    actions.push({
      id: 'roles-channels',
      label: i18n.t('dashboard.checklist.actions.rolesChannels.label'),
      description: findState('server_roles')?.messages[0] ?? i18n.t('dashboard.checklist.actions.rolesChannels.desc'),
      sectionId: 'server_roles',
      priority: 100,
    });
  }

  if (findState('tickets')?.status !== 'active') {
    actions.push({
      id: 'activate-tickets',
      label: i18n.t('dashboard.checklist.actions.tickets.label'),
      description: findState('tickets')?.summary ?? i18n.t('dashboard.checklist.actions.tickets.desc'),
      sectionId: 'tickets',
      priority: 95,
    });
  }

  if (syncStatus?.bridgeStatus !== 'healthy') {
    actions.push({
      id: 'review-sync',
      label: i18n.t('dashboard.checklist.actions.sync.label'),
      description: syncStatus?.bridgeStatus === 'error'
        ? i18n.t('dashboard.checklist.actions.sync.descError')
        : i18n.t('dashboard.checklist.actions.sync.descOk'),
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
      label: i18n.t('dashboard.checklist.actions.attention', { section: section.label.toLowerCase() }),
      description: section.messages[0] ?? section.summary,
      sectionId: section.sectionId,
      priority: 101 - Math.round(section.progress * 10),
    });
  }

  if (!checklist.find((step) => step.id === 'backup')?.complete) {
    actions.push({
      id: 'create-backup',
      label: i18n.t('dashboard.checklist.actions.backup.label'),
      description: i18n.t('dashboard.checklist.actions.backup.desc'),
      sectionId: 'system',
      priority: 92,
    });
  }

  if (findState('verification')?.status === 'not_configured' && findState('welcome')?.status === 'not_configured') {
    actions.push({
      id: 'member-experience',
      label: i18n.t('dashboard.checklist.actions.memberExp.label'),
      description: i18n.t('dashboard.checklist.actions.memberExp.desc'),
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
