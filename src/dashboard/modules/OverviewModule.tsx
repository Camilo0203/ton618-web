import { ArrowRight, Clock3, HardDriveDownload, ShieldCheck, Sparkles } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import type {
  DashboardGuild,
  DashboardSectionId,
  GuildBackupManifest,
  GuildConfig,
  GuildConfigMutation,
  GuildEvent,
  GuildMetricsDaily,
  GuildSyncStatus,
} from '../types';
import {
  formatDateTime,
  formatRelativeTime,
  getActiveModules,
  getMetricsSummary,
  getSetupCompletion,
} from '../utils';

interface OverviewModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  events: GuildEvent[];
  metrics: GuildMetricsDaily[];
  mutations: GuildConfigMutation[];
  backups: GuildBackupManifest[];
  syncStatus: GuildSyncStatus | null;
  onSectionChange: (section: DashboardSectionId) => void;
}

export default function OverviewModule({
  guild,
  config,
  events,
  metrics,
  mutations,
  backups,
  syncStatus,
  onSectionChange,
}: OverviewModuleProps) {
  const summary = getMetricsSummary(metrics);
  const setup = getSetupCompletion(config);
  const activeModules = getActiveModules(config);
  const pendingMutations = mutations.filter((mutation) => mutation.status === 'pending');
  const failedMutations = mutations.filter((mutation) => mutation.status === 'failed');
  const latestBackup = backups[0] ?? null;
  const appliedModulesCount = activeModules.length || summary.modulesActive.length;
  const bridgeStatusLabel =
    syncStatus?.bridgeStatus === 'healthy'
      ? 'Estable'
      : syncStatus?.bridgeStatus === 'degraded'
        ? 'Con degradacion'
        : syncStatus?.bridgeStatus === 'error'
          ? 'Con errores'
          : 'Sin telemetria';

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.9fr)]">
      <div className="space-y-6">
        <PanelCard
          eyebrow="Overview"
          title="Estado operativo"
          description="Lectura rapida del setup, la cola pendiente y la ultima configuracion confirmada por el bot."
          variant="highlight"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.95fr)]">
            <div className="space-y-4">
              <div className="dashboard-grid-fit-standard">
                {[
                  {
                    label: 'Setup',
                    value: `${setup.completed}/${setup.total}`,
                    note: `${Math.round(setup.ratio * 100)}% de completitud`,
                  },
                  {
                    label: 'Pendientes',
                    value: pendingMutations.length.toLocaleString(),
                    note: pendingMutations.length ? 'Esperando al bot' : 'Sin cola activa',
                  },
                  {
                    label: 'Fallidas',
                    value: failedMutations.length.toLocaleString(),
                    note: failedMutations.length ? 'Requieren revision' : 'Sin errores visibles',
                  },
                  {
                    label: 'Ultimo backup',
                    value: latestBackup ? formatRelativeTime(latestBackup.createdAt) : 'Nunca',
                    note: latestBackup ? latestBackup.source : 'Aun no existe snapshot',
                  },
                ].map((card) => (
                  <article key={card.label} className="dashboard-kpi-card">
                    <p className="dashboard-data-label">{card.label}</p>
                    <p className="mt-3 text-[1.8rem] font-bold tracking-[-0.04em] text-slate-950 dark:text-white lg:text-[2rem]">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.note}</p>
                  </article>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="dashboard-surface-soft p-5 lg:p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    Estado aplicado
                  </div>
                  <dl className="dashboard-grid-fit-compact mt-5">
                    <div className="dashboard-data-card">
                      <dt className="dashboard-data-label">Idioma</dt>
                      <dd className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                        {config.generalSettings.language.toUpperCase()}
                      </dd>
                    </div>
                    <div className="dashboard-data-card">
                      <dt className="dashboard-data-label">Comandos</dt>
                      <dd className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                        {config.generalSettings.commandMode === 'prefix'
                          ? `Prefijo ${config.generalSettings.prefix}`
                          : 'Mencion'}
                      </dd>
                    </div>
                    <div className="dashboard-data-card">
                      <dt className="dashboard-data-label">Zona horaria</dt>
                      <dd className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                        {config.generalSettings.timezone}
                      </dd>
                    </div>
                    <div className="dashboard-data-card">
                      <dt className="dashboard-data-label">Modulos activos</dt>
                      <dd className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                        {appliedModulesCount ? appliedModulesCount.toString() : '0'}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                    Ultimo estado aplicado {formatRelativeTime(config.updatedAt)}.
                  </p>
                </article>

                <article className="dashboard-surface-soft p-5 lg:p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <Sparkles className="h-4 w-4" />
                    Ritmo reciente
                  </div>
                  <div className="dashboard-grid-fit-compact mt-5">
                    {[
                      ['Comandos', summary.totals.commandsExecuted.toLocaleString()],
                      ['Tickets abiertos', summary.totals.ticketsOpened.toLocaleString()],
                      ['Tickets cerrados', summary.totals.ticketsClosed.toLocaleString()],
                      ['Brechas SLA', summary.totals.slaBreaches.toLocaleString()],
                    ].map(([label, value]) => (
                      <div key={label} className="dashboard-data-card">
                        <p className="dashboard-data-label">{label}</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>

            <article className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,23,0.98),rgba(15,24,42,0.92))] p-5 text-white shadow-[0_24px_64px_rgba(15,23,42,0.24)] lg:p-6">
              <div className="absolute -right-8 top-0 h-28 w-28 rounded-full bg-brand-500/16 blur-3xl" />
              <div className="relative z-[1] flex items-start justify-between gap-4">
                <div>
                  <p className="dashboard-panel-label text-brand-100">Estado en vivo</p>
                  <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
                    Bridge {bridgeStatusLabel}
                  </h3>
                </div>
                <span className="dashboard-status-pill-compact border-white/10 bg-white/10 text-white/88">
                  {guild.botInstalled ? 'Bot online' : 'Instalacion pendiente'}
                </span>
              </div>

              <div className="relative z-[1] mt-5 space-y-3">
                {[
                  ['Heartbeat', formatRelativeTime(syncStatus?.lastHeartbeatAt ?? guild.botLastSeenAt ?? null)],
                  ['Inventario', formatRelativeTime(syncStatus?.lastInventoryAt ?? null)],
                  ['Config aplicada', formatRelativeTime(syncStatus?.lastConfigSyncAt ?? config.updatedAt ?? null)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.06] px-4 py-3">
                    <span className="text-sm text-white/62">{label}</span>
                    <span className="text-sm font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-[1] mt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-200">
                  <Sparkles className="h-4 w-4" />
                  Acciones prioritarias
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    ['server_roles', 'Completar canales y roles base'],
                    ['tickets', 'Ajustar limites, SLA y autoasignacion'],
                    ['system', 'Crear backup o revisar mantenimiento'],
                  ].map(([section, label]) => (
                    <button
                      key={section}
                      type="button"
                      onClick={() => onSectionChange(section as DashboardSectionId)}
                      className="inline-flex items-center justify-between rounded-[1.1rem] border border-white/10 bg-white/[0.08] px-4 py-3 text-left font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.12]"
                    >
                      {label}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </PanelCard>

        <PanelCard
          title="Tendencia reciente"
          description="Comparativo diario publicado por el bot para detectar actividad, carga y friccion operativa."
          variant="soft"
        >
          <div className="dashboard-grid-fit-standard">
            {[
              ['Comandos', summary.totals.commandsExecuted.toLocaleString()],
              ['Tickets abiertos', summary.totals.ticketsOpened.toLocaleString()],
              ['Tickets cerrados', summary.totals.ticketsClosed.toLocaleString()],
              ['Brechas SLA', summary.totals.slaBreaches.toLocaleString()],
            ].map(([label, value]) => (
              <article key={label} className="dashboard-kpi-card">
                <p className="dashboard-data-label">{label}</p>
                <p className="mt-3 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 dark:text-white">
                  {value}
                </p>
              </article>
            ))}
          </div>
        </PanelCard>
      </div>

      <div className="space-y-6">
        <PanelCard title="Salud del bridge" description="Ultimos puntos de sincronizacion confirmados por el sistema." variant="soft">
          <div className="space-y-4">
            {[
              ['Bridge', syncStatus?.bridgeStatus ?? 'unknown'],
              ['Heartbeat', formatDateTime(syncStatus?.lastHeartbeatAt ?? guild.botLastSeenAt ?? null)],
              ['Inventario', formatDateTime(syncStatus?.lastInventoryAt ?? null)],
              ['Config aplicada', formatDateTime(syncStatus?.lastConfigSyncAt ?? config.updatedAt ?? null)],
              ['Backups', formatDateTime(syncStatus?.lastBackupAt ?? latestBackup?.createdAt ?? null)],
            ].map(([label, value]) => (
              <div key={label} className="dashboard-data-card">
                <p className="dashboard-data-label">{label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Ultimos eventos" description="Actividad reciente del panel y del bot." variant="soft">
          <div className="space-y-4">
            {events.length ? (
              events.slice(0, 5).map((event) => (
                <article key={event.id} className="dashboard-data-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-slate-950 dark:text-white">{event.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {event.description}
                      </p>
                    </div>
                    <Clock3 className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {formatDateTime(event.createdAt)}
                  </p>
                </article>
              ))
            ) : (
              <div className="dashboard-empty-state">
                Aun no hay eventos registrados para este servidor.
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard title="Backups" description="Snapshots listos para mantenimiento o restauracion." variant="soft">
          <div className="space-y-3">
            {backups.length ? (
              backups.slice(0, 4).map((backup) => (
                <div key={backup.backupId} className="dashboard-data-card flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-950 dark:text-white">{backup.source}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {formatDateTime(backup.createdAt)}
                    </p>
                  </div>
                  <HardDriveDownload className="h-5 w-5 flex-shrink-0 text-slate-400" />
                </div>
              ))
            ) : (
              <div className="dashboard-empty-state">
                Todavia no hay backups registrados por el bot.
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
