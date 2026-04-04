import type {
  DashboardSectionState,
  DashboardChecklistStep,
  DashboardQuickAction,
} from './utils';
import type {
  PlaybookWorkspaceSnapshot,
  DashboardGuild,
  GuildBackupManifest,
  GuildConfig,
  GuildConfigMutation,
  GuildEvent,
  GuildMetricsDaily,
  GuildSyncStatus,
  TicketWorkspaceSnapshot,
} from './types';
import { formatDateTime, formatRelativeTime, getActiveModules, getHealthLabel, getMetricsSummary } from './utils';

export type InsightTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type TimelineSource = 'event' | 'mutation';

export interface MetricTrendPoint {
  label: string;
  value: number | null;
}

export interface MetricDelta {
  direction: 'up' | 'down' | 'flat';
  absolute: number;
  percentage: number | null;
  label: string;
}

export interface AnalyticsSeriesCard {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: InsightTone;
  delta: MetricDelta | null;
  points: MetricTrendPoint[];
  empty: boolean;
}

export interface TimelineItem {
  id: string;
  createdAt: string;
  source: TimelineSource;
  eventKey: string;
  title: string;
  description: string;
  severity: InsightTone;
  sourceLabel: string;
  detailLabel: string;
  statusLabel: string;
  tags: string[];
}

export interface OverviewAction {
  id: string;
  label: string;
  description: string;
  sectionId: DashboardQuickAction['sectionId'];
  tone: InsightTone;
}

export interface OverviewInsight {
  kpis: Array<{
    id: string;
    label: string;
    value: string;
    note: string;
    tone: InsightTone;
  }>;
  actionItems: Array<{
    id: string;
    title: string;
    description: string;
    tone: InsightTone;
  }>;
  operationalActions: OverviewAction[];
}

export function formatCompactNumber(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Sin dato';
  }

  return new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatMinutes(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Sin dato';
  }

  if (value < 60) {
    return `${value.toFixed(1)} min`;
  }

  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function formatPercentage(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Sin dato';
  }

  return `${value.toFixed(digits)}%`;
}

function buildDeltaLabel(direction: MetricDelta['direction'], absolute: number, percentage: number | null, suffix = ''): string {
  if (direction === 'flat' || absolute === 0) {
    return `Sin cambio${suffix}`;
  }

  const prefix = direction === 'up' ? '+' : '-';
  const percentageLabel = percentage === null ? '' : ` (${prefix}${Math.abs(percentage).toFixed(0)}%)`;
  return `${prefix}${Math.abs(absolute).toFixed(1)}${suffix}${percentageLabel}`;
}

export function getMetricDelta(current: number | null, previous: number | null, suffix = ''): MetricDelta | null {
  if (current === null || previous === null || !Number.isFinite(current) || !Number.isFinite(previous)) {
    return null;
  }

  const absolute = current - previous;
  const percentage = previous === 0 ? null : (absolute / previous) * 100;
  const direction = absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'flat';

  return {
    direction,
    absolute,
    percentage,
    label: buildDeltaLabel(direction, absolute, percentage, suffix),
  };
}

export function getLast14Metrics(metrics: GuildMetricsDaily[]): GuildMetricsDaily[] {
  return [...metrics]
    .sort((left, right) => left.metricDate.localeCompare(right.metricDate))
    .slice(-14);
}

export function getAnalyticsCards(metrics: GuildMetricsDaily[]): AnalyticsSeriesCard[] {
  const series = getLast14Metrics(metrics);
  const latest = series.length ? series[series.length - 1] : null;
  const previous = series.length > 1 ? series[series.length - 2] : null;
  const previousWeek = series.slice(Math.max(0, series.length - 8), Math.max(0, series.length - 1));
  const latestFirstResponse = latest?.avgFirstResponseMinutes ?? null;
  const latestUptime = latest?.uptimePercentage ?? null;
  const previousWeekAverage = (pick: (metric: GuildMetricsDaily) => number | null): number | null => {
    const values = previousWeek
      .map((metric) => pick(metric))
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    if (!values.length) {
      return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  return [
    {
      id: 'commands',
      label: 'Comandos ejecutados',
      value: latest ? latest.commandsExecuted.toLocaleString('es-CO') : 'Sin dato',
      helper: previous ? `vs ${previous.commandsExecuted.toLocaleString('es-CO')} ayer` : 'Aun no hay historico diario suficiente',
      tone: 'info',
      delta: getMetricDelta(latest?.commandsExecuted ?? null, previous?.commandsExecuted ?? null),
      points: series.map((metric) => ({ label: metric.metricDate, value: metric.commandsExecuted })),
      empty: !latest,
    },
    {
      id: 'open_tickets',
      label: 'Tickets abiertos',
      value: latest ? latest.openTickets.toLocaleString('es-CO') : 'Sin dato',
      helper: previous ? `${latest?.ticketsOpened ?? 0} abiertos / ${latest?.ticketsClosed ?? 0} cerrados hoy` : 'Aun no hay suficiente comparacion reciente',
      tone: latest && latest.slaBreaches > 0 ? 'warning' : 'success',
      delta: getMetricDelta(latest?.openTickets ?? null, previous?.openTickets ?? null),
      points: series.map((metric) => ({ label: metric.metricDate, value: metric.openTickets })),
      empty: !latest,
    },
    {
      id: 'first_response',
      label: 'Primera respuesta',
      value: formatMinutes(latestFirstResponse),
      helper: previousWeekAverage((metric) => metric.avgFirstResponseMinutes) !== null
        ? `Promedio previo ${formatMinutes(previousWeekAverage((metric) => metric.avgFirstResponseMinutes))}`
        : 'El promedio aparece cuando existan respuestas registradas',
      tone: latestFirstResponse === null
        ? 'neutral'
        : latestFirstResponse <= 30
          ? 'success'
          : latestFirstResponse <= 90
            ? 'warning'
            : 'danger',
      delta: getMetricDelta(latestFirstResponse, previousWeekAverage((metric) => metric.avgFirstResponseMinutes), ' min'),
      points: series.map((metric) => ({ label: metric.metricDate, value: metric.avgFirstResponseMinutes })),
      empty: !series.some((metric) => typeof metric.avgFirstResponseMinutes === 'number'),
    },
    {
      id: 'uptime',
      label: 'Uptime',
      value: formatPercentage(latestUptime, 2),
      helper: previousWeekAverage((metric) => metric.uptimePercentage) !== null
        ? `Promedio previo ${formatPercentage(previousWeekAverage((metric) => metric.uptimePercentage), 2)}`
        : 'Necesita snapshots diarios para calcular estabilidad',
      tone: latestUptime === null
        ? 'neutral'
        : latestUptime >= 99
          ? 'success'
          : latestUptime >= 97
            ? 'warning'
            : 'danger',
      delta: getMetricDelta(latestUptime, previousWeekAverage((metric) => metric.uptimePercentage), ' pts'),
      points: series.map((metric) => ({ label: metric.metricDate, value: metric.uptimePercentage })),
      empty: !latest,
    },
  ];
}

function inferEventSeverity(eventType: string, description: string): InsightTone {
  const normalized = `${eventType} ${description}`.toLowerCase();
  if (normalized.includes('fail') || normalized.includes('error')) {
    return 'danger';
  }
  if (normalized.includes('backup') || normalized.includes('ticket')) {
    return 'info';
  }
  if (normalized.includes('config')) {
    return 'success';
  }
  return 'neutral';
}

function humanizeSection(section: string): string {
  return section
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getMutationTimestamp(mutation: GuildConfigMutation): string {
  return mutation.failedAt ?? mutation.appliedAt ?? mutation.supersededAt ?? mutation.updatedAt ?? mutation.requestedAt;
}

function getMutationSeverity(mutation: GuildConfigMutation): InsightTone {
  switch (mutation.status) {
    case 'failed':
      return 'danger';
    case 'pending':
      return 'warning';
    case 'applied':
      return 'success';
    default:
      return 'neutral';
  }
}

export function getTimelineItems(events: GuildEvent[], mutations: GuildConfigMutation[]): TimelineItem[] {
  const eventItems = events.map<TimelineItem>((event) => ({
    id: `event-${event.id}`,
    createdAt: event.createdAt,
    source: 'event',
    eventKey: event.eventType,
    title: event.title,
    description: event.description,
    severity: inferEventSeverity(event.eventType, event.description),
    sourceLabel: 'Evento del sistema',
    detailLabel: humanizeSection(event.eventType),
    statusLabel: 'Registrado',
    tags: [event.eventType],
  }));

  const mutationItems = mutations.map<TimelineItem>((mutation) => ({
    id: `mutation-${mutation.id}`,
    createdAt: getMutationTimestamp(mutation),
    source: 'mutation',
    eventKey: mutation.section,
    title: mutation.mutationType === 'ticket_action'
      ? `Accion de ticket: ${humanizeSection(mutation.section)}`
      : `Cambio en ${humanizeSection(mutation.section)}`,
    description: mutation.errorMessage ?? `Estado ${mutation.status} para ${humanizeSection(mutation.section)}.`,
    severity: getMutationSeverity(mutation),
    sourceLabel: mutation.mutationType === 'ticket_action' ? 'Cola de tickets' : 'Cola de configuracion',
    detailLabel: humanizeSection(mutation.section),
    statusLabel: humanizeSection(mutation.status),
    tags: [mutation.mutationType, mutation.section, mutation.status],
  }));

  return [...eventItems, ...mutationItems].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function formatTimelineTimestamp(value: string): { absolute: string; relative: string } {
  return {
    absolute: formatDateTime(value),
    relative: formatRelativeTime(value),
  };
}

function buildOverviewActions(
  quickActions: DashboardQuickAction[],
  workspace: TicketWorkspaceSnapshot,
  syncStatus: GuildSyncStatus | null,
  sectionStates: DashboardSectionState[],
): OverviewAction[] {
  const actions: OverviewAction[] = quickActions.map((action, index) => ({
    id: action.id,
    label: action.label,
    description: action.description,
    sectionId: action.sectionId,
    tone: index === 0 ? 'info' : 'neutral',
  }));

  const openTickets = workspace.inbox.filter((ticket) => ticket.isOpen).length;
  const breachedTickets = workspace.inbox.filter((ticket) => ticket.slaState === 'breached').length;
  const needsAttention = sectionStates.find((section) => section.status === 'needs_attention');

  if (breachedTickets > 0) {
    actions.unshift({
      id: 'tickets-breached',
      label: 'Atender tickets con SLA vencido',
      description: `${breachedTickets} ticket${breachedTickets > 1 ? 's' : ''} ya supero el SLA.`,
      sectionId: 'tickets',
      tone: 'danger',
    });
  } else if (openTickets > 0) {
    actions.unshift({
      id: 'tickets-open',
      label: 'Entrar a la bandeja operativa',
      description: `${openTickets} ticket${openTickets > 1 ? 's' : ''} abierto${openTickets > 1 ? 's' : ''} para seguimiento.`,
      sectionId: 'tickets',
      tone: 'info',
    });
  }

  if (syncStatus?.bridgeStatus !== 'healthy') {
    actions.unshift({
      id: 'sync-review',
      label: 'Revisar salud del bridge',
      description: syncStatus?.bridgeMessage ?? 'La sincronizacion necesita confirmacion antes de seguir empujando cambios.',
      sectionId: 'system',
      tone: syncStatus?.bridgeStatus === 'error' ? 'danger' : 'warning',
    });
  } else if (needsAttention) {
    actions.unshift({
      id: `attention-${needsAttention.sectionId}`,
      label: `Resolver ${needsAttention.label.toLowerCase()}`,
      description: needsAttention.summary,
      sectionId: needsAttention.sectionId,
      tone: 'warning',
    });
  }

  return actions
    .filter((action, index, current) => current.findIndex((candidate) => candidate.id === action.id) === index)
    .slice(0, 5);
}

export function getOverviewInsight(
  guild: DashboardGuild,
  config: GuildConfig,
  metrics: GuildMetricsDaily[],
  mutations: GuildConfigMutation[],
  backups: GuildBackupManifest[],
  syncStatus: GuildSyncStatus | null,
  workspace: TicketWorkspaceSnapshot,
  sectionStates: DashboardSectionState[],
  checklist: DashboardChecklistStep[],
  quickActions: DashboardQuickAction[],
  playbooks: PlaybookWorkspaceSnapshot | null = null,
): OverviewInsight {
  const summary = getMetricsSummary(metrics);
  const activeModules = getActiveModules(config);
  const incompleteSections = sectionStates.filter(
    (section) => !['overview', 'activity', 'analytics', 'inbox'].includes(section.sectionId) && section.status !== 'active',
  );
  const latestBackup = backups[0] ?? null;
  const pendingMutations = syncStatus?.pendingMutations ?? mutations.filter((mutation) => mutation.status === 'pending').length;
  const failedMutations = syncStatus?.failedMutations ?? mutations.filter((mutation) => mutation.status === 'failed').length;
  const openTickets = workspace.inbox.filter((ticket) => ticket.isOpen).length;
  const breachedTickets = workspace.inbox.filter((ticket) => ticket.slaState === 'breached').length;
  const warningTickets = workspace.inbox.filter((ticket) => ticket.slaState === 'warning').length;
  const pendingRecommendations = playbooks?.recommendations.filter((recommendation) => recommendation.status === 'pending').length ?? 0;
  const watchCustomers = playbooks?.customerMemory.filter((memory) => memory.riskLevel === 'watch').length ?? 0;
  const completedChecklist = checklist.filter((step) => step.complete).length;
  const staleSync = syncStatus?.lastHeartbeatAt ? Date.now() - new Date(syncStatus.lastHeartbeatAt).getTime() > 1000 * 60 * 90 : true;

  const kpis = [
    {
      id: 'server-health',
      label: 'Salud operativa',
      value: getHealthLabel(syncStatus),
      note: staleSync
        ? 'El heartbeat no es reciente; conviene validar el bridge antes de aplicar mas cambios.'
        : syncStatus?.bridgeMessage ?? 'La sincronizacion no reporta bloqueos ahora mismo.',
      tone: (!guild.botInstalled || syncStatus?.bridgeStatus === 'error' || staleSync
        ? 'danger'
        : syncStatus?.bridgeStatus === 'degraded'
          ? 'warning'
          : 'success') as InsightTone,
    },
    {
      id: 'modules',
      label: 'Modulos activos',
      value: String(activeModules.length || summary.modulesActive.length),
      note: incompleteSections.length
        ? `${incompleteSections.length} modulo${incompleteSections.length > 1 ? 's' : ''} aun necesita${incompleteSections.length > 1 ? 'n' : ''} cierre o revision.`
        : 'Las secciones principales ya quedaron marcadas como operativas.',
      tone: (incompleteSections.length > 2 ? 'warning' : 'success') as InsightTone,
    },
    {
      id: 'support',
      label: 'Soporte en curso',
      value: openTickets.toLocaleString('es-CO'),
      note: breachedTickets
        ? `${breachedTickets} ticket${breachedTickets > 1 ? 's' : ''} con SLA vencido y ${warningTickets} en alerta.`
        : warningTickets
          ? `${warningTickets} ticket${warningTickets > 1 ? 's' : ''} se acerca${warningTickets > 1 ? 'n' : ''} al SLA.`
          : openTickets
            ? 'No hay tickets vencidos en este momento.'
            : 'No hay tickets abiertos ahora mismo.',
      tone: (breachedTickets ? 'danger' : warningTickets ? 'warning' : 'success') as InsightTone,
    },
    {
      id: 'playbooks',
      label: 'Playbooks vivos',
      value: pendingRecommendations.toLocaleString('es-CO'),
      note: watchCustomers
        ? `${watchCustomers} usuario(s) con memoria operativa en seguimiento.`
        : pendingRecommendations
          ? 'Las sugerencias viven en la bandeja y en la consola de playbooks.'
          : 'No hay recomendaciones pendientes ahora mismo.',
      tone: (pendingRecommendations > 2 ? 'warning' : pendingRecommendations > 0 ? 'info' : 'success') as InsightTone,
    },
    {
      id: 'changes',
      label: 'Cambios pendientes',
      value: String(pendingMutations),
      note: failedMutations
        ? `${failedMutations} fallo${failedMutations > 1 ? 's' : ''} todavia necesita${failedMutations > 1 ? 'n' : ''} tu atencion.`
        : pendingMutations
          ? 'Hay cambios esperando que el bot los procese.'
          : 'No hay cola pendiente de configuracion.',
      tone: (failedMutations ? 'danger' : pendingMutations ? 'warning' : 'success') as InsightTone,
    },
    {
      id: 'backups',
      label: 'Ultimo backup',
      value: latestBackup ? formatRelativeTime(latestBackup.createdAt) : 'Pendiente',
      note: latestBackup
        ? `Disponible desde ${formatDateTime(latestBackup.createdAt)}.`
        : 'Conviene crear una copia antes de cambios delicados.',
      tone: (latestBackup ? 'success' : 'warning') as InsightTone,
    },
    {
      id: 'checklist',
      label: 'Checklist base',
      value: `${completedChecklist}/${checklist.length}`,
      note: completedChecklist === checklist.length
        ? 'La ruta principal del servidor ya esta cubierta.'
        : 'La portada todavia tiene pasos concretos por cerrar.',
      tone: (completedChecklist === checklist.length ? 'success' : 'info') as InsightTone,
    },
  ];

  const actionItems = [
    syncStatus?.bridgeStatus === 'error'
      ? {
          id: 'bridge-error',
          title: 'El bridge esta con errores',
          description: syncStatus.bridgeMessage ?? 'Revisa el modulo de sistema antes de enviar mas cambios.',
          tone: 'danger' as const,
        }
      : null,
    failedMutations > 0
      ? {
          id: 'failed-mutations',
          title: `${failedMutations} cambios fallaron`,
          description: 'Conviene revisar la cola de cambios y el modulo afectado antes de continuar.',
          tone: 'danger' as const,
        }
      : null,
    breachedTickets > 0
      ? {
          id: 'sla-breach',
          title: `${breachedTickets} tickets con SLA vencido`,
          description: 'La bandeja necesita una pasada del staff para evitar escalaciones.',
          tone: 'warning' as const,
        }
      : null,
    pendingRecommendations > 0
      ? {
          id: 'pending-playbooks',
          title: `${pendingRecommendations} playbooks esperan respuesta`,
          description: 'Hay sugerencias operativas listas para confirmar, descartar o ejecutar desde la inbox.',
          tone: 'info' as const,
        }
      : null,
    !latestBackup
      ? {
          id: 'backup-missing',
          title: 'Todavia no hay backup base',
          description: 'Crear una copia de seguridad te deja margen para restaurar si algo sale mal.',
          tone: 'warning' as const,
        }
      : null,
    incompleteSections[0]
      ? {
          id: `section-${incompleteSections[0].sectionId}`,
          title: `${incompleteSections[0].label} aun no esta lista`,
          description: incompleteSections[0].summary,
          tone: incompleteSections[0].status === 'needs_attention' ? 'warning' : 'info' as const,
        }
      : null,
  ].filter((item): item is { id: string; title: string; description: string; tone: InsightTone } => Boolean(item));

  return {
    kpis,
    actionItems,
    operationalActions: buildOverviewActions(quickActions, workspace, syncStatus, sectionStates),
  };
}
