import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import DashboardDegradationNotice from '../components/DashboardDegradationNotice';
import PanelCard from '../components/PanelCard';
import StateCard from '../components/StateCard';
import ModuleEmptyState from '../components/ModuleEmptyState';
import type { DashboardGuild, DashboardPartialFailure, GuildMetricsDaily } from '../types';
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
  partialFailure: DashboardPartialFailure | null;
}

function getToneRing(tone: AnalyticsSeriesCard['tone']) {
  switch (tone) {
    case 'success':
      return 'border-emerald-200/70 dark:border-emerald-900/30';
    case 'warning':
      return 'border-amber-200/70 dark:border-amber-900/30';
    case 'danger':
      return 'border-rose-200/70 dark:border-rose-900/30';
    case 'info':
      return 'border-sky-200/70 dark:border-sky-900/30';
    default:
      return 'border-slate-200/70 dark:border-surface-600';
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

function renderDelta(delta: ReturnType<typeof getMetricDelta>) {
  if (!delta) {
    return <span className="text-slate-500 dark:text-slate-400">Sin comparacion</span>;
  }

  if (delta.direction === 'flat') {
    return <span className="text-slate-500 dark:text-slate-400">{delta.label}</span>;
  }

  const positive = delta.direction === 'up';
  return (
    <span className={positive ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}>
      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {delta.label}
    </span>
  );
}

export default function AnalyticsModule({
  guild,
  metrics,
  partialFailure,
}: AnalyticsModuleProps) {
  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Instalacion"
        title="La analitica se activara cuando el bot este dentro del servidor"
        description="El bot necesita instalarse y publicar snapshots diarios en guild_metrics_daily para mostrar uso real, tickets y estabilidad."
        icon={BarChart3}
        tone="warning"
      />
    );
  }

  if (!metrics.length && partialFailure) {
    return (
      <StateCard
        eyebrow="Analitica degradada"
        title="La telemetria diaria no esta disponible por ahora"
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
        title="Aun no hay telemetria diaria"
        description="La dashboard ya esta preparada para leer tendencias. Solo falta que el bridge publique snapshots diarios para este guild."
      />
    );
  }

  const last14 = getLast14Metrics(metrics);
  const summary = getMetricsSummary(last14);
  const cards = getAnalyticsCards(last14);
  const maxCommands = Math.max(...last14.map((metric) => metric.commandsExecuted), 1);
  const maxTickets = Math.max(...last14.map((metric) => Math.max(metric.ticketsOpened, metric.ticketsClosed, metric.openTickets)), 1);

  return (
    <div className="space-y-6">
      <DashboardDegradationNotice
        failures={partialFailure ? [partialFailure] : []}
        title="La analitica se esta mostrando con cobertura parcial"
      />

      <PanelCard
        eyebrow="Analitica"
        title="Tendencias de los ultimos 14 dias"
        description="Una lectura corta para detectar crecimiento, carga de soporte y estabilidad sin salir del dashboard."
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
                    <p className="mt-2 text-[1.7rem] font-bold tracking-[-0.05em] text-slate-950 dark:text-white">{card.value}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {renderDelta(card.delta)}
                  </div>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.helper}</p>

                <div className="mt-4 rounded-[1.2rem] border border-slate-200/70 bg-white/70 px-3 py-3 dark:border-surface-600 dark:bg-surface-700/60">
                  {path && !card.empty ? (
                    <svg viewBox="0 0 100 100" className="h-16 w-full" aria-hidden="true" preserveAspectRatio="none">
                      <path d={path} fill="none" stroke="currentColor" strokeWidth="3" className="text-brand-500" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <div className="flex h-16 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                      Sin serie suficiente
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
          eyebrow="Actividad"
          title="Comandos y tickets por dia"
          description="Compara intensidad de uso y carga operativa a lo largo de la ventana visible."
          variant="soft"
        >
          <div className="dashboard-chart-shell">
            <div className="overflow-x-auto pb-2">
              <div className="grid h-72 min-w-[42rem] grid-cols-14 items-end gap-2" role="img" aria-label="Comparativa diaria de comandos y tickets de los ultimos 14 dias">
                {last14.map((metric) => (
                  <div key={metric.metricDate} className="flex h-full min-w-0 flex-col justify-end gap-2">
                    <div
                      className="dashboard-mini-bar bg-[linear-gradient(180deg,rgba(88,101,242,0.95),rgba(56,189,248,0.85))]"
                      style={{ height: `${getBarHeight(metric.commandsExecuted, maxCommands)}%` }}
                      title={`${metric.commandsExecuted.toLocaleString('es-CO')} comandos`}
                    />
                    <div
                      className="dashboard-mini-bar bg-[linear-gradient(180deg,rgba(16,185,129,0.92),rgba(59,130,246,0.78))]"
                      style={{ height: `${getBarHeight(Math.max(metric.ticketsOpened, metric.ticketsClosed, metric.openTickets), maxTickets)}%` }}
                      title={`${metric.ticketsOpened} abiertos / ${metric.ticketsClosed} cerrados / ${metric.openTickets} abiertos activos`}
                    />
                    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      {formatMetricDate(metric.metricDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden="true" />
                Comandos ejecutados
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Tickets y carga de soporte
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              En movil puedes desplazarte horizontalmente para revisar los 14 dias completos.
            </p>
          </div>
        </PanelCard>

        <PanelCard
          eyebrow="Lectura rapida"
          title="Resumen de la ventana visible"
          description="Totales y promedios para entender la foto general sin revisar cada dia."
          variant="soft"
        >
          <div className="dashboard-grid-fit-compact">
            {[
              ['Comandos acumulados', summary.totals.commandsExecuted.toLocaleString('es-CO')],
              ['Tickets abiertos', summary.totals.ticketsOpened.toLocaleString('es-CO')],
              ['Tickets cerrados', summary.totals.ticketsClosed.toLocaleString('es-CO')],
              ['Miembros activos max', formatCompactNumber(summary.totals.activeMembers)],
              ['Uptime promedio', formatPercentage(summary.averageUptime, 2)],
              ['FRT promedio', formatMinutes(summary.averageFirstResponseMinutes)],
              ['Brechas SLA', summary.totals.slaBreaches.toLocaleString('es-CO')],
              ['Modulos detectados', String(summary.modulesActive.length)],
            ].map(([label, value]) => (
              <article key={label} className="dashboard-kpi-card">
                <p className="dashboard-data-label">{label}</p>
                <p className="mt-2 text-[1.45rem] font-bold tracking-[-0.05em] text-slate-950 dark:text-white">{value}</p>
              </article>
            ))}
          </div>
        </PanelCard>
      </div>

      <PanelCard
        eyebrow="Snapshots"
        title="Detalle diario"
        description="Fallback legible para inspeccionar cada dia cuando la comparativa general no basta."
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
                      <p className="text-lg font-semibold text-slate-950 dark:text-white">{formatMetricDate(metric.metricDate)}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {metric.modulesActive.length
                          ? `${metric.modulesActive.length} modulo${metric.modulesActive.length > 1 ? 's' : ''} activo${metric.modulesActive.length > 1 ? 's' : ''}`
                          : 'Sin modulos reportados ese dia'}
                      </p>
                    </div>
                    <div className="dashboard-status-pill-compact dashboard-neutral-pill">
                      {formatPercentage(metric.uptimePercentage, 2)} uptime
                    </div>
                  </div>
                  <div className="dashboard-grid-fit-compact mt-4">
                    <div>
                      <p className="dashboard-data-label">Comandos</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{metric.commandsExecuted.toLocaleString('es-CO')}</p>
                    </div>
                    <div>
                      <p className="dashboard-data-label">Tickets</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                        {metric.ticketsOpened} / {metric.ticketsClosed} / {metric.openTickets}
                      </p>
                    </div>
                    <div>
                      <p className="dashboard-data-label">FRT</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatMinutes(metric.avgFirstResponseMinutes)}</p>
                    </div>
                    <div>
                      <p className="dashboard-data-label">SLA</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{metric.slaBreaches} brechas</p>
                    </div>
                  </div>
                </article>
              ))
          ) : (
            <div className="dashboard-empty-state">
              Todavia no hay snapshots diarios suficientes para mostrar detalle historico.
            </div>
          )}
        </div>
      </PanelCard>
    </div>
  );
}
