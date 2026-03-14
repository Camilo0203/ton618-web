import { BarChart3 } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import StateCard from '../components/StateCard';
import type { DashboardGuild, GuildMetricsDaily } from '../types';
import { formatMetricDate, getMetricsSummary } from '../utils';

interface AnalyticsModuleProps {
  guild: DashboardGuild;
  metrics: GuildMetricsDaily[];
}

export default function AnalyticsModule({
  guild,
  metrics,
}: AnalyticsModuleProps) {
  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Instalacion"
        title="La analitica se activara cuando el bot este dentro del servidor"
        description="El bot debe publicar snapshots diarios en guild_metrics_daily para mostrar comandos, tickets, SLA y uptime reales."
        icon={BarChart3}
        tone="warning"
      />
    );
  }

  if (!metrics.length) {
    return (
      <StateCard
        eyebrow="Sin metricas"
        title="Todavia no hay telemetria diaria"
        description="La dashboard ya esta lista. Solo falta que el bridge publique snapshots de actividad para este guild."
        icon={BarChart3}
      />
    );
  }

  const summary = getMetricsSummary(metrics);
  const maxCommands = Math.max(...metrics.map((metric) => metric.commandsExecuted), 1);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <PanelCard
        eyebrow="Analitica"
        title={`Tendencia de los ultimos ${metrics.length} dias`}
        description="Comandos, tickets, SLA y actividad del guild publicados por el bot."
        variant="highlight"
      >
        <div className="dashboard-grid-fit-standard">
          {[
            ['Comandos', summary.totals.commandsExecuted.toLocaleString()],
            ['Tickets abiertos', summary.totals.ticketsOpened.toLocaleString()],
            ['Tickets cerrados', summary.totals.ticketsClosed.toLocaleString()],
            ['Brechas SLA', summary.totals.slaBreaches.toLocaleString()],
            ['Activos maximos', summary.totals.activeMembers.toLocaleString()],
            ['Uptime promedio', `${summary.averageUptime.toFixed(2)}%`],
            [
              'FRT promedio',
              summary.averageFirstResponseMinutes !== null
                ? `${summary.averageFirstResponseMinutes.toFixed(1)} min`
                : 'Sin dato',
            ],
            ['Tickets abiertos hoy', String(summary.latest?.openTickets ?? 0)],
          ].map(([label, value]) => (
            <article key={label} className="dashboard-kpi-card">
              <p className="dashboard-data-label">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50/90 p-6 dark:border-surface-600 dark:bg-surface-700/70">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Comandos ejecutados</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Serie diaria</p>
          </div>
          <div className="mt-8 grid h-64 grid-cols-7 items-end gap-3">
            {summary.series.slice(-7).map((metric) => (
              <div key={metric.metricDate} className="flex h-full min-w-0 flex-col justify-end">
                <div
                  className="rounded-t-3xl bg-gradient-to-t from-brand-600 via-brand-500 to-sky-400 shadow-[0_18px_40px_rgba(88,101,242,0.28)]"
                  style={{ height: `${Math.max((metric.commandsExecuted / maxCommands) * 100, 8)}%` }}
                />
                <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  {formatMetricDate(metric.metricDate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Detalle diario" description="Lectura rapida de cada snapshot publicado." variant="soft">
        <div className="space-y-4">
          {summary.series.map((metric) => (
            <article key={metric.metricDate} className="dashboard-data-card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">{formatMetricDate(metric.metricDate)}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Snapshot diario del guild</p>
                </div>
                <div className="dashboard-status-pill-compact border-slate-200/80 bg-white text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-300">
                  {metric.uptimePercentage.toFixed(2)}% uptime
                </div>
              </div>
              <div className="dashboard-grid-fit-compact mt-4">
                <div>
                  <p className="dashboard-data-label">Comandos</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{metric.commandsExecuted.toLocaleString()}</p>
                </div>
                <div>
                  <p className="dashboard-data-label">Tickets</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{metric.ticketsOpened.toLocaleString()} abiertos / {metric.ticketsClosed.toLocaleString()} cerrados</p>
                </div>
                <div>
                  <p className="dashboard-data-label">SLA</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{metric.slaBreaches.toLocaleString()} brechas</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
