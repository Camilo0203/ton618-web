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

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="space-y-6">
        <PanelCard
          eyebrow="Resumen"
          title={guild.guildName}
          description="Centro operativo del servidor. Aqui ves el setup, las solicitudes pendientes y la salud real del bridge entre Discord, Mongo y Supabase."
          variant="highlight"
        >
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
                <p className="mt-3 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 dark:text-white">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.note}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="dashboard-surface-soft p-6">
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
                    {activeModules.length || summary.modulesActive.length
                      ? (activeModules.length || summary.modulesActive.length).toString()
                      : '0'}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                Ultimo estado aplicado {formatRelativeTime(config.updatedAt)}.
              </p>
            </article>

            <article className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,12,23,0.98),rgba(21,31,54,0.96))] p-6 text-white shadow-[0_24px_64px_rgba(15,23,42,0.28)]">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-500/18 blur-3xl" />
              <div className="relative z-[1] flex items-center gap-2 text-sm font-semibold text-brand-200">
                <Sparkles className="h-4 w-4" />
                Acciones rapidas
              </div>
              <div className="relative z-[1] mt-6 grid gap-3">
                {[
                  ['server_roles', 'Completar canales y roles base'],
                  ['tickets', 'Ajustar limites, SLA y autoasignacion'],
                  ['system', 'Crear backup o revisar mantenimiento'],
                ].map(([section, label]) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => onSectionChange(section as DashboardSectionId)}
                    className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-left font-semibold text-white transition hover:border-white/20 hover:bg-white/12"
                  >
                    {label}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </article>
          </div>
        </PanelCard>

        <PanelCard
          title="Tendencia reciente"
          description="KPIs diarios publicados por el bot para este guild."
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
        <PanelCard title="Salud del bridge" description="Ultimos puntos de sincronizacion confirmados." variant="soft">
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

        <PanelCard title="Backups" description="Ultimos snapshots disponibles para restauracion." variant="soft">
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
