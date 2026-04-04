import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import DashboardDegradationNotice from '../components/DashboardDegradationNotice';
import { useTranslation } from 'react-i18next';
import PanelCard from '../components/PanelCard';
import StateCard from '../components/StateCard';
import ModuleEmptyState from '../components/ModuleEmptyState';
import type { DashboardGuild, DashboardPartialFailure, GeneralSettings, GuildMetricsDaily, PlaybookWorkspaceSnapshot } from '../types';
import {
  formatCompactNumber,
  formatMinutes,
  formatPercentage,
  getAnalyticsCards,
  getLast14Metrics,
  getMetricDelta,
  type AnalyticsSeriesCard,
} from '../insights';
import { formatMetricDate, getMetricsSummary } from '../utils';

interface AnalyticsModuleProps {
  guild: DashboardGuild;
  metrics: GuildMetricsDaily[];
  playbooks: PlaybookWorkspaceSnapshot;
  config: { generalSettings: GeneralSettings };
  partialFailure: DashboardPartialFailure | null;
}

function getToneRing(tone: AnalyticsSeriesCard['tone']) {
  switch (tone) {
    case 'success':
      return 'border-emerald-900/30';
    case 'warning':
      return 'border-amber-900/30';
    case 'danger':
      return 'border-rose-900/30';
    case 'info':
      return 'border-sky-900/30';
    default:
      return 'border-white/[0.07]';
  }
}

function getBarHeight(value: number | null, max: number) {
  if (value === null || !Number.isFinite(value) || max <= 0) {
    return 12;
  }

  return Math.max(12, Math.round((value / max) * 100));
}

function buildSparkline(points: Array<{ value: number | null }>) {
  const numericValues = points
    .map((point) => point.value)
    .filter((value): value is number => value !== null && Number.isFinite(value));

  if (!numericValues.length) {
    return null;
  }

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const span = max - min || 1;

  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = point.value === null ? 100 : 100 - (((point.value - min) / span) * 80 + 10);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return path;
}

export default function AnalyticsModule({
  guild,
  metrics,
  playbooks,
  config,
  partialFailure,
}: AnalyticsModuleProps) {
  const { t } = useTranslation();

  function renderDelta(delta: ReturnType<typeof getMetricDelta>) {
    if (!delta) {
      return <span className="text-slate-400">{t('dashboard.analytics.noComparison')}</span>;
    }

    if (delta.direction === 'flat') {
      return <span className="text-slate-400">{delta.label}</span>;
    }

    const positive = delta.direction === 'up';
    return (
      <span className={positive ? 'text-emerald-300' : 'text-rose-300'}>
        {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        {delta.label}
      </span>
    );
  }

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.analytics.onboarding.eyebrow')}
        title={t('dashboard.analytics.onboarding.title')}
        description={t('dashboard.analytics.onboarding.desc')}
        icon={BarChart3}
        tone="warning"
      />
    );
  }

  if (!metrics.length && partialFailure) {
    return (
      <StateCard
        eyebrow={t('dashboard.analytics.states.degraded.eyebrow')}
        title={t('dashboard.analytics.states.degraded.title')}
        description={partialFailure.message}
        icon={BarChart3}
        tone="warning"
      />
    );
  }

  if (!metrics.length) {
    return (
      <ModuleEmptyState
        icon={BarChart3}
        title={t('dashboard.analytics.states.empty.title')}
        description={t('dashboard.analytics.states.empty.desc')}
      />
    );
  }

  const last14 = getLast14Metrics(metrics);
  const summary = getMetricsSummary(last14);
  const cards = getAnalyticsCards(last14);
  const pendingRecommendations = playbooks.recommendations.filter((recommendation) => recommendation.status === 'pending').length;
  const appliedRecommendations = playbooks.recommendations.filter((recommendation) => recommendation.status === 'applied').length;
  const dismissedRecommendations = playbooks.recommendations.filter((recommendation) => recommendation.status === 'dismissed').length;
  const resolvedRecommendations = appliedRecommendations + dismissedRecommendations;
  const acceptanceRate = resolvedRecommendations > 0
    ? Math.round((appliedRecommendations / resolvedRecommendations) * 100)
    : 0;
  const maxCommands = Math.max(...last14.map((metric) => metric.commandsExecuted), 1);
  const maxTickets = Math.max(...last14.map((metric) => Math.max(metric.ticketsOpened, metric.ticketsClosed, metric.openTickets)), 1);

  return (
    <div className="space-y-6">
      <DashboardDegradationNotice
        failures={partialFailure ? [partialFailure] : []}
        title={t('dashboard.analytics.degraded')}
      />

      <PanelCard
        eyebrow={t('dashboard.analytics.trends.eyebrow')}
        title={t('dashboard.analytics.trends.title')}
        description={t('dashboard.analytics.trends.desc')}
        variant="highlight"
      >
        <div className="dashboard-grid-fit-standard">
          {cards.map((card) => {
            const path = buildSparkline(card.points);

            return (
              <article key={card.id} className={`dashboard-trend-card ${getToneRing(card.tone)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="dashboard-data-label">{card.label}</p>
                    <p className="mt-2 text-[1.7rem] font-bold tracking-[-0.05em] text-white">{card.value}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {renderDelta(card.delta)}
                  </div>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-300">{card.helper}</p>

                <div className="mt-4 rounded-[1.2rem] border border-white/[0.07] bg-white/[0.04] px-3 py-3">
                  {path && !card.empty ? (
                    <svg viewBox="0 0 100 100" className="h-16 w-full" aria-hidden="true" preserveAspectRatio="none">
                      <path d={path} fill="none" stroke="currentColor" strokeWidth="3" className="text-brand-500" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <div className="flex h-16 items-center justify-center text-sm text-slate-400">
                      {t('dashboard.analytics.trends.emptySeries')}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </PanelCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <PanelCard
          eyebrow={t('dashboard.analytics.activity.eyebrow')}
          title={t('dashboard.analytics.activity.title')}
          description={t('dashboard.analytics.activity.desc')}
          variant="soft"
        >
          <div className="dashboard-chart-shell">
            <div className="overflow-x-auto pb-2">
              <div className="grid h-72 min-w-[42rem] grid-cols-14 items-end gap-2" role="img" aria-label={t('dashboard.analytics.activity.ariaChart')}>
                {last14.map((metric) => (
                  <div key={metric.metricDate} className="flex h-full min-w-0 flex-col justify-end gap-2">
                    <div
                      className="dashboard-mini-bar bg-[linear-gradient(180deg,rgba(88,101,242,0.95),rgba(56,189,248,0.85))]"
                      style={{ height: `${getBarHeight(metric.commandsExecuted, maxCommands)}%` }}
                      title={t('dashboard.analytics.activity.tooltipCommands', { formattedCount: metric.commandsExecuted.toLocaleString('es-CO') })}
                    />
                    <div
                      className="dashboard-mini-bar bg-[linear-gradient(180deg,rgba(16,185,129,0.92),rgba(59,130,246,0.78))]"
                      style={{ height: `${getBarHeight(Math.max(metric.ticketsOpened, metric.ticketsClosed, metric.openTickets), maxTickets)}%` }}
                      title={t('dashboard.analytics.activity.tooltipTickets', { opened: metric.ticketsOpened, closed: metric.ticketsClosed, open: metric.openTickets })}
                    />
                    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {formatMetricDate(metric.metricDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden="true" />
                {t('dashboard.analytics.activity.legendCommands')}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {t('dashboard.analytics.activity.legendTickets')}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {t('dashboard.analytics.activity.mobileHint')}
            </p>
          </div>
        </PanelCard>

        <PanelCard
          eyebrow={t('dashboard.analytics.summary.eyebrow')}
          title={t('dashboard.analytics.summary.title')}
          description={t('dashboard.analytics.summary.desc')}
          variant="soft"
        >
          <div className="dashboard-grid-fit-compact">
            {[
              [t('dashboard.analytics.summary.labels.commands'), summary.totals.commandsExecuted.toLocaleString('es-CO')],
              [t('dashboard.analytics.summary.labels.ticketsOpened'), summary.totals.ticketsOpened.toLocaleString('es-CO')],
              [t('dashboard.analytics.summary.labels.ticketsClosed'), summary.totals.ticketsClosed.toLocaleString('es-CO')],
              [t('dashboard.analytics.summary.labels.maxMembers'), formatCompactNumber(summary.totals.activeMembers)],
              [t('dashboard.analytics.summary.labels.uptime'), formatPercentage(summary.averageUptime, 2)],
              [t('dashboard.analytics.summary.labels.frt'), formatMinutes(summary.averageFirstResponseMinutes)],
              [t('dashboard.analytics.summary.labels.slaBreaches'), summary.totals.slaBreaches.toLocaleString('es-CO')],
              [t('dashboard.analytics.summary.labels.modules'), String(summary.modulesActive.length)],
            ].map(([label, value]) => (
              <article key={label} className="dashboard-kpi-card">
                <p className="dashboard-data-label">{label}</p>
                <p className="mt-2 text-[1.45rem] font-bold tracking-[-0.05em] text-white">{value}</p>
              </article>
            ))}
          </div>
        </PanelCard>
      </div>

      <PanelCard
        eyebrow={t('dashboard.analytics.playbooks.eyebrow')}
        title={t('dashboard.analytics.playbooks.title')}
        description={t('dashboard.analytics.playbooks.desc', { plan: config.generalSettings.opsPlan })}
        variant="soft"
      >
        <div className="dashboard-grid-fit-compact">
          {[
            [t('dashboard.analytics.playbooks.pending'), String(pendingRecommendations)],
            [t('dashboard.analytics.playbooks.applied'), String(appliedRecommendations)],
            [t('dashboard.analytics.playbooks.dismissed'), String(dismissedRecommendations)],
            [t('dashboard.analytics.playbooks.acceptance'), `${acceptanceRate}%`],
          ].map(([label, value]) => (
            <article key={label} className="dashboard-kpi-card">
              <p className="dashboard-data-label">{label}</p>
              <p className="mt-2 text-[1.45rem] font-bold tracking-[-0.05em] text-white">{value}</p>
            </article>
          ))}
        </div>
      </PanelCard>

      <PanelCard
        eyebrow={t('dashboard.analytics.daily.eyebrow')}
        title={t('dashboard.analytics.daily.title')}
        description={t('dashboard.analytics.daily.desc')}
        variant="soft"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {last14.length ? (
            last14
              .slice()
              .reverse()
              .map((metric) => (
                <article key={metric.metricDate} className="dashboard-data-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-white">{formatMetricDate(metric.metricDate)}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {metric.modulesActive.length
                          ? t('dashboard.analytics.daily.modulesActive', { count: metric.modulesActive.length })
                          : t('dashboard.analytics.daily.noModules')}
                      </p>
                    </div>
                    <div className="dashboard-status-pill-compact dashboard-neutral-pill">
                      {formatPercentage(metric.uptimePercentage, 2)} {t('dashboard.analytics.daily.uptimeLabel')}
                    </div>
                  </div>
                  <div className="dashboard-grid-fit-compact mt-4">
                    <div>
                      <p className="dashboard-data-label">{t('dashboard.analytics.daily.commands')}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{metric.commandsExecuted.toLocaleString('es-CO')}</p>
                    </div>
                    <div>
                      <p className="dashboard-data-label">{t('dashboard.analytics.daily.tickets')}</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {metric.ticketsOpened} / {metric.ticketsClosed} / {metric.openTickets}
                      </p>
                    </div>
                    <div>
                      <p className="dashboard-data-label">{t('dashboard.analytics.daily.frt')}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatMinutes(metric.avgFirstResponseMinutes)}</p>
                    </div>
                    <div>
                      <p className="dashboard-data-label">{t('dashboard.analytics.daily.sla')}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{t('dashboard.analytics.daily.slaBreaches', { count: metric.slaBreaches })}</p>
                    </div>
                  </div>
                </article>
              ))
          ) : (
            <div className="dashboard-empty-state">
              {t('dashboard.analytics.daily.empty')}
            </div>
          )}
        </div>
      </PanelCard>
    </div>
  );
}
