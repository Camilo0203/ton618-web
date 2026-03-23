import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  HardDriveDownload,
  ListChecks,
  RadioTower,
  ShieldAlert,
  Sparkles,
  Ticket,
  Zap,
} from 'lucide-react';
import DashboardDegradationNotice from '../components/DashboardDegradationNotice';
import { useTranslation } from 'react-i18next';
import PanelCard from '../components/PanelCard';
import type {
  PlaybookWorkspaceSnapshot,
  DashboardPartialFailure,
  DashboardGuild,
  DashboardSectionId,
  GuildBackupManifest,
  GuildConfig,
  GuildConfigMutation,
  GuildEvent,
  GuildMetricsDaily,
  GuildSyncStatus,
  TicketWorkspaceSnapshot,
} from '../types';
import {
  formatDateTime,
  formatRelativeTime,
  getHealthLabel,
  type DashboardChecklistStep,
  type DashboardQuickAction,
  type DashboardSectionState,
} from '../utils';
import { formatCompactNumber, getOverviewInsight } from '../insights';

interface OverviewModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  events: GuildEvent[];
  metrics: GuildMetricsDaily[];
  mutations: GuildConfigMutation[];
  backups: GuildBackupManifest[];
  syncStatus: GuildSyncStatus | null;
  workspace: TicketWorkspaceSnapshot;
  playbooks: PlaybookWorkspaceSnapshot;
  onSectionChange: (section: DashboardSectionId) => void;
  sectionStates: DashboardSectionState[];
  checklist: DashboardChecklistStep[];
  quickActions: DashboardQuickAction[];
  partialFailures: DashboardPartialFailure[];
}

function getStatusClasses(status: DashboardSectionState['status']) {
  switch (status) {
    case 'active':
      return 'border-emerald-200/70 bg-emerald-50/90 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100';
    case 'basic':
      return 'border-sky-200/70 bg-sky-50/90 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100';
    case 'needs_attention':
      return 'border-amber-200/70 bg-amber-50/90 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100';
    default:
      return 'border-slate-200/70 bg-slate-50/90 text-slate-700 dark:border-surface-600 dark:bg-surface-700/70 dark:text-slate-200';
  }
}

function getAreaToneClass(status: DashboardSectionState['status']) {
  switch (status) {
    case 'active':
      return 'dashboard-area-card-ready';
    case 'basic':
      return 'dashboard-area-card-progress';
    case 'needs_attention':
      return 'dashboard-area-card-alert';
    default:
      return '';
  }
}

function getToneClasses(tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger') {
  switch (tone) {
    case 'success':
      return 'border-emerald-200/60 bg-emerald-50/90 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-100';
    case 'warning':
      return 'border-amber-200/60 bg-amber-50/90 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100';
    case 'danger':
      return 'border-rose-200/60 bg-rose-50/90 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/25 dark:text-rose-100';
    case 'info':
      return 'border-sky-200/60 bg-sky-50/90 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/25 dark:text-sky-100';
    default:
      return 'border-slate-200/70 bg-slate-50/90 text-slate-800 dark:border-surface-600 dark:bg-surface-700/70 dark:text-slate-100';
  }
}

function getToneDot(tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger') {
  switch (tone) {
    case 'success':
      return 'bg-emerald-500';
    case 'warning':
      return 'bg-amber-500';
    case 'danger':
      return 'bg-rose-500';
    case 'info':
      return 'bg-sky-500';
    default:
      return 'bg-slate-400';
  }
}

export default function OverviewModule({
  guild,
  config,
  events,
  metrics,
  mutations,
  backups,
  syncStatus,
  workspace,
  playbooks,
  onSectionChange,
  sectionStates,
  checklist,
  quickActions,
  partialFailures,
}: OverviewModuleProps) {
  const { t, i18n } = useTranslation();

  function getStatusLabel(status: DashboardSectionState['status']) {
    switch (status) {
      case 'active':
        return t('dashboard.overview.status.active');
      case 'basic':
        return t('dashboard.overview.status.basic');
      case 'needs_attention':
        return t('dashboard.overview.status.needsAttention');
      default:
        return t('dashboard.overview.status.pending');
    }
  }

  const insight = getOverviewInsight(
    guild,
    config,
    metrics,
    mutations,
    backups,
    syncStatus,
    workspace,
    sectionStates,
    checklist,
    quickActions,
    playbooks,
  );
  const latestBackup = backups[0] ?? null;
  const nextStep = checklist.find((step) => !step.complete) ?? null;
  const nextStepState = nextStep
    ? sectionStates.find((section) => section.sectionId === nextStep.sectionId) ?? null
    : null;
  const completedChecklist = checklist.filter((step) => step.complete).length;
  const progressRatio = checklist.length ? completedChecklist / checklist.length : 0;
  const recentEvents = events.slice(0, 4);
  const areas = sectionStates.filter((section) => !['overview', 'activity', 'analytics', 'inbox'].includes(section.sectionId));
  const openTickets = workspace.inbox.filter((ticket) => ticket.isOpen);
  const breachedTickets = openTickets.filter((ticket) => ticket.slaState === 'breached');
  const warningTickets = openTickets.filter((ticket) => ticket.slaState === 'warning');
  const pendingRecommendations = playbooks.recommendations.filter((recommendation) => recommendation.status === 'pending').slice(0, 3);
  const watchCustomers = playbooks.customerMemory.filter((memory) => memory.riskLevel === 'watch').slice(0, 3);

  const syncFacts = [
    [t('dashboard.overview.syncFacts.bridge'), getHealthLabel(syncStatus)],
    [t('dashboard.overview.syncFacts.heartbeat'), formatRelativeTime(syncStatus?.lastHeartbeatAt ?? guild.botLastSeenAt ?? null)],
    [t('dashboard.overview.syncFacts.inventory'), formatRelativeTime(syncStatus?.lastInventoryAt ?? null)],
    [t('dashboard.overview.syncFacts.config'), formatRelativeTime(syncStatus?.lastConfigSyncAt ?? config.updatedAt ?? null)],
  ];

  const coverageFacts = [
    [t('dashboard.overview.pulseStats.facts.members'), guild.memberCount ? guild.memberCount.toLocaleString(i18n.language) : t('dashboard.overview.pulseStats.facts.noData')],
    [t('dashboard.overview.pulseStats.facts.snapshot'), metrics[0] ? formatDateTime(metrics[0].metricDate) : t('dashboard.overview.pulseStats.facts.pending')],
    [t('dashboard.overview.pulseStats.facts.events'), String(events.length)],
    [t('dashboard.overview.pulseStats.facts.tickets'), String(openTickets.length)],
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(23rem,0.95fr)] 2xl:grid-cols-[minmax(0,1.52fr)_minmax(24rem,0.88fr)]">
      <div className="space-y-6">
        <DashboardDegradationNotice
          failures={partialFailures}
          title={t('dashboard.overview.degraded')}
        />

        <PanelCard
          eyebrow={t('dashboard.overview.center.eyebrow')}
          title={t('dashboard.overview.center.title')}
          description={t('dashboard.overview.center.desc')}
          variant="highlight"
          titleClassName="text-[1.75rem] lg:text-[2.15rem]"
          descriptionClassName="max-w-4xl text-[1rem] text-slate-600 dark:text-slate-300"
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <section className="dashboard-next-step-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="dashboard-panel-label">{t('dashboard.overview.nextStep.label')}</p>
                  <h3 className="mt-3 text-[1.55rem] font-semibold tracking-[-0.05em] text-slate-950 dark:text-white lg:text-[1.85rem]">
                    {nextStep?.label ?? t('dashboard.overview.nextStep.ready')}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {nextStep?.description ?? t('dashboard.overview.nextStep.emptyDesc')}
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {nextStep?.summary ?? t('dashboard.overview.nextStep.emptySummary')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="dashboard-overview-badge dashboard-overview-badge-progress">
                    {t('dashboard.overview.nextStep.count', { completed: completedChecklist, total: checklist.length || 0 })}
                  </span>
                  <span className={`dashboard-status-pill-compact ${getStatusClasses(nextStepState?.status ?? 'active')}`}>
                    {nextStep ? getStatusLabel(nextStep.status) : t('dashboard.overview.nextStep.allDone')}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {nextStep ? (
                  <button
                    type="button"
                    onClick={() => onSectionChange(nextStep.sectionId)}
                    className="dashboard-primary-button"
                  >
                    {t('dashboard.overview.nextStep.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onSectionChange(openTickets.length ? 'inbox' : 'activity')}
                  className="dashboard-secondary-button"
                >
                  {openTickets.length ? t('dashboard.overview.nextStep.toSupport') : t('dashboard.overview.nextStep.toActivity')}
                </button>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200/70 dark:bg-surface-700/80">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(88,101,242,0.95),rgba(34,211,238,0.9))]"
                  style={{ width: `${Math.max(8, Math.round(progressRatio * 100))}%` }}
                />
              </div>

              <div className="mt-5 dashboard-overview-quick-list" role="list" aria-label="Resumen rapido">
                {[
                  {
                    icon: RadioTower,
                    label: t('dashboard.overview.quickList.bridge.label'),
                    value: getHealthLabel(syncStatus),
                    copy: syncStatus?.bridgeMessage ?? t('dashboard.overview.quickList.bridge.ok'),
                  },
                  {
                    icon: Ticket,
                    label: t('dashboard.overview.quickList.support.label'),
                    value: t('dashboard.overview.quickList.support.open', { count: openTickets.length }),
                    copy: breachedTickets.length
                      ? t('dashboard.overview.quickList.support.breached', { breached: breachedTickets.length, warning: warningTickets.length })
                      : warningTickets.length
                        ? t('dashboard.overview.quickList.support.warning', { warning: warningTickets.length })
                        : t('dashboard.overview.quickList.support.clean'),
                  },
                  {
                    icon: HardDriveDownload,
                    label: t('dashboard.overview.quickList.backups.label'),
                    value: latestBackup ? formatRelativeTime(latestBackup.createdAt) : t('dashboard.overview.quickList.backups.pending'),
                    copy: latestBackup ? t('dashboard.overview.quickList.backups.recent') : t('dashboard.overview.quickList.backups.empty'),
                  },
                ].map((item) => (
                  <article key={item.label} role="listitem" className="dashboard-overview-quick-row">
                    <div className="dashboard-overview-quick-icon" aria-hidden="true">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="text-[0.95rem] font-semibold leading-5 text-slate-950 dark:text-white">{item.value}</p>
                      </div>
                      <p className="dashboard-overview-quick-copy">{item.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="dashboard-overview-summary-card">
                <p className="dashboard-panel-label">{t('dashboard.overview.summary.label')}</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                  {insight.actionItems[0]?.title ?? t('dashboard.overview.summary.fallbackTitle')}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {insight.actionItems[0]?.description ?? t('dashboard.overview.summary.fallbackDesc')}
                </p>
              </div>

              <div className="dashboard-grid-fit-compact">
                {insight.kpis.map((card) => (
                  <article key={card.id} className={`dashboard-kpi-card ${getToneClasses(card.tone)}`}>
                    <p className="dashboard-data-label">{card.label}</p>
                    <p className="mt-3 text-[1.45rem] font-bold tracking-[-0.05em] text-slate-950 dark:text-white lg:text-[1.7rem]">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.note}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </PanelCard>

        <PanelCard
          eyebrow={t('dashboard.overview.checklist.eyebrow')}
          title={t('dashboard.overview.checklist.title')}
          description={t('dashboard.overview.checklist.desc')}
          variant="soft"
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
            <div className="space-y-3">
              {checklist.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSectionChange(step.sectionId)}
                  className={`dashboard-checklist-item w-full text-left ${nextStep?.id === step.id ? 'dashboard-checklist-item-featured' : ''}`}
                  aria-label={`${step.label}. ${step.complete ? t('dashboard.overview.checklist.ctaReady') : getStatusLabel(step.status)}.`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`dashboard-checklist-index ${step.complete ? 'dashboard-checklist-index-complete' : ''}`}>
                      {step.complete ? <CheckCircle2 className="h-5 w-5" /> : <span>{index + 1}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-950 dark:text-white">{step.label}</p>
                        <span className={`dashboard-status-pill-compact ${getStatusClasses(step.status)}`}>
                          {step.complete ? t('dashboard.overview.checklist.ctaReady') : getStatusLabel(step.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
                      <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{step.summary}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <section className="dashboard-guided-stack">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="dashboard-panel-label">{t('dashboard.overview.actions.label')}</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                      {t('dashboard.overview.actions.title')}
                    </h3>
                  </div>
                  <Sparkles className="mt-1 h-4 w-4 text-slate-400" />
                </div>

                <div className="mt-4 space-y-3">
                  {insight.operationalActions.map((action, index) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => onSectionChange(action.sectionId)}
                      className={`dashboard-quick-action-card w-full text-left ${index === 0 ? 'dashboard-quick-action-card-primary' : ''} ${getToneClasses(action.tone)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-950 dark:text-white">{action.label}</p>
                            {index === 0 ? (
                              <span className="dashboard-overview-badge dashboard-overview-badge-progress">{t('dashboard.overview.actions.now')}</span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{action.description}</p>
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="dashboard-guided-stack">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="dashboard-panel-label">{t('dashboard.overview.alerts.label')}</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                      {t('dashboard.overview.alerts.title')}
                    </h3>
                  </div>
                  <ShieldAlert className="mt-1 h-4 w-4 text-slate-400" />
                </div>

                <div className="mt-4 space-y-3">
                  {insight.actionItems.length ? (
                    insight.actionItems.map((item) => (
                      <div key={item.id} className={`dashboard-action-note ${getToneClasses(item.tone)}`}>
                        <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${getToneDot(item.tone)}`} aria-hidden="true" />
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-current/80">{item.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-action-success">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{t('dashboard.overview.alerts.emptyTitle')}</p>
                        <p className="mt-1 text-sm text-current/80">{t('dashboard.overview.alerts.emptyDesc')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </PanelCard>

        <PanelCard
          eyebrow={t('dashboard.overview.coverage.eyebrow')}
          title={t('dashboard.overview.coverage.title')}
          description={t('dashboard.overview.coverage.desc')}
          variant="soft"
        >
          <div className="grid gap-4 xl:grid-cols-3">
            {[
              {
                title: t('dashboard.overview.coverage.groups.attention.title'),
                description: t('dashboard.overview.coverage.groups.attention.desc'),
                sections: areas.filter((section) => section.status === 'needs_attention'),
                empty: t('dashboard.overview.coverage.groups.attention.empty'),
              },
              {
                title: t('dashboard.overview.coverage.groups.progress.title'),
                description: t('dashboard.overview.coverage.groups.progress.desc'),
                sections: areas.filter((section) => section.status === 'basic' || section.status === 'not_configured'),
                empty: t('dashboard.overview.coverage.groups.progress.empty'),
              },
              {
                title: t('dashboard.overview.coverage.groups.ready.title'),
                description: t('dashboard.overview.coverage.groups.ready.desc'),
                sections: areas.filter((section) => section.status === 'active'),
                empty: t('dashboard.overview.coverage.groups.ready.empty'),
              },
            ].map((group) => (
              <section key={group.title} className="dashboard-area-group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="dashboard-panel-label">{group.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{group.description}</p>
                  </div>
                  <span className="dashboard-overview-count">{group.sections.length}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {group.sections.length ? (
                    group.sections.map((section) => (
                      <button
                        key={section.sectionId}
                        type="button"
                        onClick={() => onSectionChange(section.sectionId)}
                        className={`dashboard-area-card w-full text-left ${getAreaToneClass(section.status)}`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950 dark:text-white">{section.label}</p>
                          <span className={`dashboard-status-pill-compact ${getStatusClasses(section.status)}`}>
                            {getStatusLabel(section.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.summary}</p>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-surface-700">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(88,101,242,0.95),rgba(34,211,238,0.9))]"
                            style={{ width: `${Math.max(6, Math.round(section.progress * 100))}%` }}
                          />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="dashboard-empty-state">{group.empty}</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </PanelCard>
      </div>

      <div className="space-y-6">
        <article className="dashboard-live-panel relative overflow-hidden rounded-[1.6rem] p-5 text-white lg:p-6">
          <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-brand-500/16 blur-3xl" />
          <div className="relative z-[1] flex items-start justify-between gap-4">
            <div>
              <p className="dashboard-panel-label text-brand-100">{t('dashboard.overview.pulse.bridgeTitle')}</p>
              <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
                {guild.botInstalled ? t('dashboard.overview.pulse.connected') : t('dashboard.overview.pulse.pending')}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/72">
                {syncStatus?.bridgeMessage ?? t('dashboard.overview.pulse.bridgeDesc')}
              </p>
            </div>
            <span className="dashboard-status-pill-compact dashboard-live-pill text-white/88">
              {getHealthLabel(syncStatus)}
            </span>
          </div>

          <div className="relative z-[1] mt-5 grid gap-3">
            {syncFacts.map(([label, value]) => (
              <div key={label} className="dashboard-live-row flex items-center justify-between gap-3 rounded-[1.1rem] px-4 py-3">
                <span className="text-sm text-white/68">{label}</span>
                <span className="text-right text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="relative z-[1] mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                label: t('dashboard.overview.pulse.details.changes.label'),
                value: insight.kpis.find((card) => card.id === 'changes')?.value ?? '0',
                note: insight.kpis.find((card) => card.id === 'changes')?.note ?? t('dashboard.overview.pulse.details.changes.empty'),
                icon: Zap,
              },
              {
                label: t('dashboard.overview.pulse.details.support.label'),
                value: insight.kpis.find((card) => card.id === 'support')?.value ?? '0',
                note: insight.kpis.find((card) => card.id === 'support')?.note ?? t('dashboard.overview.pulse.details.support.empty'),
                icon: Ticket,
              },
              {
                label: t('dashboard.overview.pulse.details.backup.label'),
                value: latestBackup ? formatDateTime(latestBackup.createdAt) : t('dashboard.overview.pulse.details.backup.none'),
                note: latestBackup ? t('dashboard.overview.pulse.details.backup.ready') : t('dashboard.overview.pulse.details.backup.create'),
                icon: HardDriveDownload,
              },
              {
                label: t('dashboard.overview.pulse.details.base.label'),
                value: `${completedChecklist}/${checklist.length}`,
                note: nextStep?.label ?? t('dashboard.overview.pulse.details.base.none'),
                icon: ListChecks,
              },
            ].map((item) => (
              <article key={item.label} className="dashboard-live-detail-card">
                <div className="flex items-start gap-3">
                  <div className="dashboard-live-detail-icon">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/56">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm leading-6 text-white/68">{item.note}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <PanelCard
          title={t('dashboard.overview.pulseStats.title')}
          description={t('dashboard.overview.pulseStats.desc')}
          variant="success"
        >
          <div className="dashboard-grid-fit-compact">
            {coverageFacts.map(([label, value]) => (
              <div key={label} className="dashboard-kpi-card">
                <p className="dashboard-data-label">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {metrics.length ? (
            <div className="mt-4 dashboard-action-note">
              <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                {t('dashboard.overview.pulseStats.info', {
                  commands: formatCompactNumber(metrics[0]?.commandsExecuted ?? null),
                  members: formatCompactNumber(metrics[0]?.activeMembers ?? null)
                })}
              </p>
            </div>
          ) : null}
        </PanelCard>

        <PanelCard
          title={t('dashboard.overview.activity.title')}
          description={t('dashboard.overview.activity.desc')}
          variant="soft"
        >
          <div className="space-y-4">
            {recentEvents.length ? (
              recentEvents.map((event) => (
                <article key={event.id} className="dashboard-data-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-slate-950 dark:text-white">{event.title}</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{event.description}</p>
                    </div>
                    <Clock3 className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{formatDateTime(event.createdAt)}</p>
                </article>
              ))
            ) : (
              <div className="dashboard-empty-state">
                {t('dashboard.overview.activity.empty')}
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard
          title={t('dashboard.overview.notes.title')}
          description={t('dashboard.overview.notes.desc')}
          variant="soft"
        >
          <div className="space-y-3">
            {insight.actionItems.length ? (
              insight.actionItems.map((item) => (
                <div key={item.id} className={`dashboard-action-note ${getToneClasses(item.tone)}`}>
                  {item.tone === 'danger' ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-current/80">{item.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-empty-state">
                {t('dashboard.overview.notes.empty')}
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard
          title={i18n.language.startsWith('en') ? 'Live playbooks' : 'Playbooks vivos'}
          description={i18n.language.startsWith('en')
            ? 'Operational recommendations generated from tickets, SLA and customer context.'
            : 'Recomendaciones operativas generadas desde tickets, SLA y memoria del usuario.'}
          variant="soft"
        >
          <div className="space-y-3">
            {pendingRecommendations.length ? (
              pendingRecommendations.map((recommendation) => (
                <button
                  key={recommendation.recommendationId}
                  type="button"
                  onClick={() => onSectionChange('playbooks')}
                  className="dashboard-data-card w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950 dark:text-white">{recommendation.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{recommendation.summary}</p>
                    </div>
                    <span className="dashboard-status-pill-compact dashboard-neutral-pill">#{recommendation.ticketId}</span>
                  </div>
                </button>
              ))
            ) : watchCustomers.length ? (
              watchCustomers.map((memory) => (
                <button
                  key={memory.userId}
                  type="button"
                  onClick={() => onSectionChange('playbooks')}
                  className="dashboard-data-card w-full text-left"
                >
                  <p className="font-semibold text-slate-950 dark:text-white">{memory.displayLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{memory.summary}</p>
                </button>
              ))
            ) : (
              <div className="dashboard-empty-state">
                {i18n.language.startsWith('en')
                  ? 'Playbooks are synced and waiting for the next support event.'
                  : 'Los playbooks ya estan sincronizados y esperan el siguiente evento operativo.'}
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
