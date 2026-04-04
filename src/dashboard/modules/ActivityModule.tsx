import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  History,
  TimerReset,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PanelCard from '../components/PanelCard';
import StateCard from '../components/StateCard';
import ModuleEmptyState from '../components/ModuleEmptyState';
import DashboardDegradationNotice from '../components/DashboardDegradationNotice';
import type {
  DashboardGuild,
  DashboardPartialFailure,
  GuildConfigMutation,
  GuildEvent,
} from '../types';
import { formatTimelineTimestamp, getTimelineItems, type InsightTone, type TimelineSource } from '../insights';
import { summarizeMutationPayload } from '../utils';

interface ActivityModuleProps {
  guild: DashboardGuild;
  events: GuildEvent[];
  mutations: GuildConfigMutation[];
  partialFailure: DashboardPartialFailure | null;
}

type ActivityFilter = 'all' | TimelineSource;
type SeverityFilter = 'all' | InsightTone;

function getSeverityStyles(severity: InsightTone) {
  switch (severity) {
    case 'success':
      return {
        dot: 'bg-emerald-500',
        pill: 'border-emerald-900/40 bg-emerald-950/20 text-emerald-100',
        card: 'border-emerald-900/30',
      };
    case 'warning':
      return {
        dot: 'bg-amber-500',
        pill: 'border-amber-900/40 bg-amber-950/20 text-amber-100',
        card: 'border-amber-900/30',
      };
    case 'danger':
      return {
        dot: 'bg-rose-500',
        pill: 'border-rose-900/40 bg-rose-950/20 text-rose-100',
        card: 'border-rose-900/30',
      };
    case 'info':
      return {
        dot: 'bg-sky-500',
        pill: 'border-sky-900/40 bg-sky-950/20 text-sky-100',
        card: 'border-sky-900/30',
      };
    default:
      return {
        dot: 'bg-slate-400',
        pill: 'border-white/[0.07] bg-white/[0.04] text-slate-200',
        card: 'border-white/[0.07]',
      };
  }
}

export default function ActivityModule({
  guild,
  events,
  mutations,
  partialFailure,
}: ActivityModuleProps) {
  const { t } = useTranslation();

  function getSeverityLabel(severity: InsightTone) {
    switch (severity) {
      case 'success': return t('dashboard.activity.filters.severity.success');
      case 'warning': return t('dashboard.activity.filters.severity.warning');
      case 'danger': return t('dashboard.activity.filters.severity.danger');
      case 'info': return t('dashboard.activity.filters.severity.info');
      default: return t('dashboard.activity.filters.severity.neutral');
    }
  }

  function getSourceLabel(source: ActivityFilter) {
    switch (source) {
      case 'event': return t('dashboard.activity.filters.source.events');
      case 'mutation': return t('dashboard.activity.filters.source.mutations');
      default: return t('dashboard.activity.filters.source.all');
    }
  }

  function getSeverityFilterLabel(severity: SeverityFilter) {
    switch (severity) {
      case 'success': return t('dashboard.activity.filters.severity.success');
      case 'warning': return t('dashboard.activity.filters.severity.warning');
      case 'danger': return t('dashboard.activity.filters.severity.danger');
      case 'info': return t('dashboard.activity.filters.severity.info');
      case 'neutral': return t('dashboard.activity.filters.severity.neutral');
      default: return t('dashboard.activity.filters.severity.all');
    }
  }

  const [sourceFilter, setSourceFilter] = useState<ActivityFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');

  const timeline = useMemo(() => getTimelineItems(events, mutations), [events, mutations]);
  const filteredTimeline = useMemo(
    () =>
      timeline.filter((item) => {
        const matchesSource = sourceFilter === 'all' ? true : item.source === sourceFilter;
        const matchesSeverity = severityFilter === 'all' ? true : item.severity === severityFilter;
        return matchesSource && matchesSeverity;
      }),
    [severityFilter, sourceFilter, timeline],
  );

  const pendingMutations = mutations.filter((mutation) => mutation.status === 'pending').length;
  const failedMutations = mutations.filter((mutation) => mutation.status === 'failed').length;

  if (!events.length && !mutations.length && partialFailure) {
    return (
      <StateCard
        eyebrow={t('dashboard.activity.states.degraded.eyebrow')}
        title={t('dashboard.activity.states.degraded.title')}
        description={partialFailure.message}
        icon={AlertTriangle}
        tone="warning"
      />
    );
  }

  if (!events.length && !mutations.length) {
    return (
      <ModuleEmptyState
        icon={Activity}
        title={t('dashboard.activity.states.empty.title')}
        description={guild.botInstalled
          ? t('dashboard.activity.states.empty.descInstalled')
          : t('dashboard.activity.states.empty.descPending')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardDegradationNotice
        failures={partialFailure ? [partialFailure] : []}
        title={t('dashboard.activity.degraded')}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.32fr)_minmax(21rem,0.8fr)]">
        <PanelCard
          eyebrow={t('dashboard.activity.timeline.eyebrow')}
          title={t('dashboard.activity.timeline.title')}
          description={t('dashboard.activity.timeline.desc')}
          variant="highlight"
          actions={(
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSourceFilter('all');
                  setSeverityFilter('all');
                }}
                className="dashboard-secondary-button"
              >
                <TimerReset className="h-4 w-4" />
                {t('dashboard.activity.timeline.clearFilters')}
              </button>
            </div>
          )}
        >
          <div className="flex flex-wrap gap-2">
            {(['all', 'event', 'mutation'] as ActivityFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSourceFilter(option)}
                aria-pressed={sourceFilter === option}
                className={`dashboard-filter-chip ${sourceFilter === option ? 'dashboard-filter-chip-active' : ''}`}
              >
                <Filter className="h-3.5 w-3.5" />
                {getSourceLabel(option)}
              </button>
            ))}
            {(['all', 'danger', 'warning', 'info', 'success', 'neutral'] as SeverityFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSeverityFilter(option)}
                aria-pressed={severityFilter === option}
                className={`dashboard-filter-chip ${severityFilter === option ? 'dashboard-filter-chip-active' : ''}`}
              >
                {getSeverityFilterLabel(option)}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {filteredTimeline.length ? (
              filteredTimeline.map((item, index) => {
                const timestamp = formatTimelineTimestamp(item.createdAt);
                const styles = getSeverityStyles(item.severity);
                const relatedMutation = item.source === 'mutation'
                  ? mutations.find((mutation) => `mutation-${mutation.id}` === item.id)
                  : null;

                return (
                  <article
                    key={item.id}
                    className={`dashboard-timeline-card ${styles.card}`}
                    aria-label={`${item.title}. ${timestamp.absolute}. ${getSeverityLabel(item.severity)}.`}
                  >
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`dashboard-timeline-dot ${styles.dot}`} aria-hidden="true" />
                        {index < filteredTimeline.length - 1 ? <span className="dashboard-timeline-line" aria-hidden="true" /> : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="break-words text-base font-semibold text-white">{item.title}</p>
                              <span className={`dashboard-status-pill-compact ${styles.pill}`}>
                                {getSeverityLabel(item.severity)}
                              </span>
                              <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                                {item.sourceLabel}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                          </div>

                          <div className="min-w-[8.5rem] text-left sm:text-right">
                            <p className="text-sm font-semibold text-white">{timestamp.relative}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{timestamp.absolute}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="dashboard-status-pill-compact dashboard-neutral-pill">{item.detailLabel}</span>
                          <span className="dashboard-status-pill-compact dashboard-neutral-pill">{item.statusLabel}</span>
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="dashboard-status-pill-compact dashboard-neutral-pill">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {relatedMutation ? (
                          <div className="mt-4 rounded-[1.1rem] border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                            {t('dashboard.activity.timeline.payload')}: {summarizeMutationPayload(relatedMutation.requestedPayload)}
                            {relatedMutation.errorMessage ? (
                              <p className="mt-2 text-rose-300">{relatedMutation.errorMessage}</p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="dashboard-empty-state">
                {t('dashboard.activity.timeline.empty')}
              </div>
            )}
          </div>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard
            eyebrow={t('dashboard.activity.summary.eyebrow')}
            title={t('dashboard.activity.summary.title')}
            description={t('dashboard.activity.summary.desc')}
            variant={failedMutations ? 'danger' : pendingMutations ? 'soft' : 'success'}
          >
            <div className="dashboard-grid-fit-compact">
              {[
                {
                  label: t('dashboard.activity.summary.pending'),
                  value: String(pendingMutations),
                  icon: Clock3,
                },
                {
                  label: t('dashboard.activity.summary.failed'),
                  value: String(failedMutations),
                  icon: AlertTriangle,
                },
                {
                  label: t('dashboard.activity.summary.events'),
                  value: String(events.length),
                  icon: History,
                },
                {
                  label: t('dashboard.activity.summary.visible'),
                  value: String(filteredTimeline.length),
                  icon: CheckCircle2,
                },
              ].map((item) => (
                <article key={item.label} className="dashboard-kpi-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="dashboard-data-label">{item.label}</p>
                    <item.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-3 text-[1.7rem] font-bold tracking-[-0.05em] text-white">{item.value}</p>
                </article>
              ))}
            </div>
          </PanelCard>

          <PanelCard
            eyebrow={t('dashboard.activity.reading.eyebrow')}
            title={t('dashboard.activity.reading.title')}
            description={t('dashboard.activity.reading.desc')}
            variant="soft"
          >
            <div className="space-y-3">
              <div className="dashboard-action-note">
                <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-300">
                  {t('dashboard.activity.reading.guide1')}
                </p>
              </div>
              <div className="dashboard-action-note">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-300">
                  {t('dashboard.activity.reading.guide2')}
                </p>
              </div>
              <div className="dashboard-action-note">
                <Filter className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-300">
                  {t('dashboard.activity.reading.guide3')}
                </p>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
