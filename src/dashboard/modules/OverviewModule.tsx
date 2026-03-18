import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDot,
  Clock3,
  HardDriveDownload,
  ListTodo,
  Siren,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
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
  getHealthLabel,
  getMetricsSummary,
  getSetupCompletion,
  type DashboardChecklistStep,
  type DashboardQuickAction,
  type DashboardSectionState,
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
  sectionStates: DashboardSectionState[];
  checklist: DashboardChecklistStep[];
  quickActions: DashboardQuickAction[];
}

function getStatusLabel(status: DashboardSectionState['status']) {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'basic':
      return 'Basico';
    case 'needs_attention':
      return 'Requiere revision';
    default:
      return 'No configurado';
  }
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

export default function OverviewModule({
  guild,
  config,
  events,
  metrics,
  mutations,
  backups,
  syncStatus,
  onSectionChange,
  sectionStates,
  checklist,
  quickActions,
}: OverviewModuleProps) {
  const summary = getMetricsSummary(metrics);
  const setup = getSetupCompletion(config);
  const activeModules = getActiveModules(config);
  const pendingMutations = mutations.filter((mutation) => mutation.status === 'pending');
  const failedMutations = mutations.filter((mutation) => mutation.status === 'failed');
  const latestBackup = backups[0] ?? null;
  const completedChecklist = checklist.filter((step) => step.complete).length;
  const progressRatio = checklist.length ? completedChecklist / checklist.length : setup.ratio;
  const nextStep = checklist.find((step) => !step.complete) ?? checklist[checklist.length - 1] ?? null;
  const blockedStates = sectionStates.filter((section) => section.status === 'needs_attention');
  const readyStates = sectionStates.filter((section) => section.status === 'active' && !['overview', 'activity', 'analytics'].includes(section.sectionId));
  const basicStates = sectionStates.filter((section) => section.status === 'basic');
  const homeSignalCards = [
    {
      label: 'Progreso real',
      value: `${Math.round(progressRatio * 100)}%`,
      note: `${completedChecklist}/${checklist.length || 0} pasos de arranque completados`,
    },
    {
      label: 'Bot y sincronizacion',
      value: getHealthLabel(syncStatus),
      note: guild.botInstalled ? 'El bot ya esta dentro del servidor' : 'Todavia falta invitar el bot',
    },
    {
      label: 'Bloqueos visibles',
      value: `${blockedStates.length + failedMutations.length}`,
      note: blockedStates.length || failedMutations.length ? 'Requieren revision antes de cerrar la configuracion' : 'No hay tareas bloqueadas',
    },
    {
      label: 'Backup inicial',
      value: latestBackup ? formatRelativeTime(latestBackup.createdAt) : 'Pendiente',
      note: latestBackup ? 'Ya tienes una base segura para volver atras' : 'Conviene crearlo antes de tocar automatizaciones delicadas',
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.95fr)] 2xl:grid-cols-[minmax(0,1.58fr)_minmax(24rem,0.88fr)]">
      <div className="space-y-6">
        <PanelCard
          eyebrow="Inicio"
          title="Centro de control del servidor"
          description="Esta portada te dice que ya funciona, que sigue pendiente y donde entrar para cerrar la configuracion sin depender de documentacion externa."
          variant="highlight"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.95fr)]">
            <div className="space-y-4">
              <div className="dashboard-grid-fit-standard">
                {homeSignalCards.map((card) => (
                  <article key={card.label} className="dashboard-kpi-card">
                    <p className="dashboard-data-label">{card.label}</p>
                    <p className="mt-3 text-[1.8rem] font-bold tracking-[-0.04em] text-slate-950 dark:text-white lg:text-[2rem]">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{card.note}</p>
                  </article>
                ))}
              </div>

              <div className="dashboard-guided-progress">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="dashboard-panel-label">Siguiente paso recomendado</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                      {nextStep?.label ?? 'Configuracion completa'}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {nextStep?.description ?? 'El servidor ya tiene la configuracion base completada.'}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                      {nextStep?.summary ?? 'No quedan pasos criticos pendientes.'}
                    </p>
                  </div>
                  {nextStep ? (
                    <button
                      type="button"
                      onClick={() => onSectionChange(nextStep.sectionId)}
                      className="dashboard-primary-button"
                    >
                      Abrir tarea
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200/70 dark:bg-surface-700/80">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(88,101,242,0.95),rgba(34,211,238,0.9))]"
                    style={{ width: `${Math.max(8, Math.round(progressRatio * 100))}%` }}
                  />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="dashboard-action-note">
                    <CircleDot className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {pendingMutations.length
                        ? `Hay ${pendingMutations.length} cambios esperando confirmacion del bot.`
                        : 'No hay cambios pendientes por aplicar.'}
                    </p>
                  </div>
                  <div className="dashboard-action-note">
                    <Siren className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {blockedStates.length
                        ? `${blockedStates.length} areas piden revision antes de cerrar la puesta en marcha.`
                        : 'No hay bloqueos visibles en las areas principales.'}
                    </p>
                  </div>
                  <div className="dashboard-action-note">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {readyStates.length
                        ? `${readyStates.length} areas ya estan activas y listas para uso diario.`
                        : 'Todavia no hay areas marcadas como completamente activas.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <article className="dashboard-live-panel relative overflow-hidden rounded-[1.5rem] p-5 text-white lg:p-6">
              <div className="absolute -right-8 top-0 h-28 w-28 rounded-full bg-brand-500/16 blur-3xl" />
              <div className="relative z-[1] flex items-start justify-between gap-4">
                <div>
                  <p className="dashboard-panel-label text-brand-100">Estado del bot</p>
                  <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
                    {guild.botInstalled ? 'Listo para operar' : 'Instalacion pendiente'}
                  </h3>
                </div>
                <span className="dashboard-status-pill-compact dashboard-live-pill text-white/88">
                  {getHealthLabel(syncStatus)}
                </span>
              </div>

              <div className="relative z-[1] mt-5 space-y-3">
                {[
                  ['Heartbeat', formatRelativeTime(syncStatus?.lastHeartbeatAt ?? guild.botLastSeenAt ?? null)],
                  ['Inventario', formatRelativeTime(syncStatus?.lastInventoryAt ?? null)],
                  ['Config aplicada', formatRelativeTime(syncStatus?.lastConfigSyncAt ?? config.updatedAt ?? null)],
                  ['Modulos activos', appliedModulesLabel(activeModules.length || summary.modulesActive.length)],
                ].map(([label, value]) => (
                  <div key={label} className="dashboard-live-row flex items-center justify-between gap-3 rounded-[1.1rem] px-4 py-3">
                    <span className="text-sm text-white/68">{label}</span>
                    <span className="text-right text-sm font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-[1] mt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-200">
                  <Sparkles className="h-4 w-4" />
                  Acciones rapidas
                </div>
                <div className="mt-4 grid gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => onSectionChange(action.sectionId)}
                      className="dashboard-live-action inline-flex items-center justify-between rounded-[1.1rem] px-4 py-3 text-left font-semibold text-white transition"
                    >
                      <span className="pr-3">
                        <span className="block">{action.label}</span>
                        <span className="mt-1 block text-sm font-medium text-white/72">{action.description}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </PanelCard>

        <PanelCard
          eyebrow="Configuracion inicial"
          title="Checklist guiada"
          description="Sigue estos pasos para dejar el servidor operativo. El estado cambia automaticamente cuando la configuracion ya cumple lo necesario."
          variant="soft"
        >
          <div className="space-y-3">
            {checklist.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => onSectionChange(step.sectionId)}
                className="dashboard-checklist-item w-full text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`dashboard-checklist-index ${step.complete ? 'dashboard-checklist-index-complete' : ''}`}>
                    {step.complete ? <CheckCircle2 className="h-5 w-5" /> : <span>{index + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-950 dark:text-white">{step.label}</p>
                      <span className={`dashboard-status-pill-compact ${getStatusClasses(step.status)}`}>
                        {step.complete ? 'Completo' : getStatusLabel(step.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      {step.summary}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard
          title="Areas del servidor"
          description="Cada bloque resume una tarea del producto para que veas de un vistazo que ya funciona, que esta a medio camino y que necesita revision."
          variant="soft"
        >
          <div className="dashboard-grid-fit-standard">
            {sectionStates
              .filter((section) => !['overview', 'activity', 'analytics', 'inbox'].includes(section.sectionId))
              .map((section) => (
                <button
                  key={section.sectionId}
                  type="button"
                  onClick={() => onSectionChange(section.sectionId)}
                  className="dashboard-area-card text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950 dark:text-white">{section.label}</p>
                    <span className={`dashboard-status-pill-compact ${getStatusClasses(section.status)}`}>
                      {getStatusLabel(section.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {section.summary}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-surface-700">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(88,101,242,0.95),rgba(34,211,238,0.9))]"
                      style={{ width: `${Math.max(6, Math.round(section.progress * 100))}%` }}
                    />
                  </div>
                </button>
              ))}
          </div>
        </PanelCard>
      </div>

      <div className="space-y-6">
        <PanelCard title="Bloqueos y revisiones" description="Mensajes accionables para saber exactamente que falta o que necesita atencion antes de seguir." variant={blockedStates.length || failedMutations.length ? 'danger' : 'success'}>
          <div className="space-y-3">
            {failedMutations.length ? (
              <div className="dashboard-action-alert">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Hay {failedMutations.length} cambios que no pudo aplicar el bot.</p>
                  <p className="mt-1 text-sm text-current/80">Revisa la seccion afectada o vuelve a sincronizar para confirmar el estado actual.</p>
                </div>
              </div>
            ) : null}
            {blockedStates.length ? blockedStates.map((section) => (
              <button
                key={section.sectionId}
                type="button"
                onClick={() => onSectionChange(section.sectionId)}
                className="dashboard-action-alert w-full text-left"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{section.label}</p>
                  <p className="mt-1 text-sm text-current/80">{section.messages[0]}</p>
                </div>
              </button>
            )) : null}
            {!failedMutations.length && !blockedStates.length ? (
              <div className="dashboard-action-success">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">No hay bloqueos criticos detectados.</p>
                  <p className="mt-1 text-sm text-current/80">Puedes seguir completando tareas opcionales o publicar cambios pendientes con normalidad.</p>
                </div>
              </div>
            ) : null}
          </div>
        </PanelCard>

        <PanelCard title="Lo que ya esta funcionando" description="Resumen rapido de las areas que ya estan listas o encaminadas para uso real." variant="soft">
          <div className="space-y-3">
            {readyStates.slice(0, 4).map((section) => (
              <button
                key={section.sectionId}
                type="button"
                onClick={() => onSectionChange(section.sectionId)}
                className="dashboard-action-success w-full text-left"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{section.label}</p>
                  <p className="mt-1 text-sm text-current/80">{section.summary}</p>
                </div>
              </button>
            ))}
            {!readyStates.length ? (
              <div className="dashboard-empty-state">
                Todavia no hay areas completamente activas. Completa la checklist inicial para empezar a ver modulos listos.
              </div>
            ) : null}
            {basicStates.length ? (
              <div className="dashboard-action-note">
                <ListTodo className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  Tambien hay {basicStates.length} areas en progreso que ya tienen una base montada, pero todavia no estan cerradas.
                </p>
              </div>
            ) : null}
          </div>
        </PanelCard>

        <PanelCard title="Estado del sistema del bot" description="Resumen tecnico traducido a un lenguaje mas util para tomar decisiones." variant="soft">
          <div className="space-y-4">
            {[
              {
                label: 'Sincronizacion',
                value: getHealthLabel(syncStatus),
                note: syncStatus?.bridgeMessage || 'Estado reportado por el bridge del bot.',
                icon: Bot,
              },
              {
                label: 'Ultima configuracion aplicada',
                value: formatDateTime(syncStatus?.lastConfigSyncAt ?? config.updatedAt ?? null),
                note: 'Momento en el que el bot confirmo el ultimo estado.',
                icon: ShieldCheck,
              },
              {
                label: 'Ultimo backup',
                value: latestBackup ? formatDateTime(latestBackup.createdAt) : 'No existe aun',
                note: latestBackup ? 'Ya tienes una base para restaurar.' : 'Conviene crear uno desde Sistema del bot.',
                icon: HardDriveDownload,
              },
            ].map((item) => (
              <article key={item.label} className="dashboard-data-card">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50 dark:border-surface-600 dark:bg-surface-700/80">
                    <item.icon className="h-4 w-4 text-slate-600 dark:text-slate-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="dashboard-data-label">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.note}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Actividad reciente" description="Cambios, eventos y resultados recientes para validar que el servidor responde como esperas." variant="soft">
          <div className="space-y-4">
            {events.length ? (
              events.slice(0, 5).map((event) => (
                <article key={event.id} className="dashboard-data-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-slate-950 dark:text-white">{event.title}</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {event.description}
                      </p>
                    </div>
                    <Clock3 className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                    {formatDateTime(event.createdAt)}
                  </p>
                </article>
              ))
            ) : (
              <div className="dashboard-empty-state">
                Aun no hay actividad reciente registrada para este servidor.
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard title="Resultado esperado" description="Lectura rapida de lo que deberia pasar cuando la configuracion actual ya esta funcionando." variant="soft">
          <div className="space-y-3">
            {[
              `Los nuevos miembros ${config.verificationSettings.enabled ? 'veran un proceso de verificacion antes de acceder' : 'podran entrar sin verificacion obligatoria'}.`,
              `${config.welcomeSettings.welcomeEnabled ? 'La bienvenida esta preparada para publicarse automaticamente.' : 'La bienvenida todavia no esta activada.'}`,
              `${config.ticketsSettings.maxTickets > 0 ? `Cada usuario podra tener hasta ${config.ticketsSettings.maxTickets} tickets abiertos.` : 'El sistema de tickets todavia no tiene un limite definido.'}`,
              `${activeModules.length ? `Hay ${activeModules.length} automatizaciones destacadas activas.` : 'Todavia no hay automatizaciones destacadas activas.'}`,
            ].map((line) => (
              <div key={line} className="dashboard-action-note">
                <ListTodo className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{line}</p>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

function appliedModulesLabel(count: number): string {
  return count ? `${count} activos` : 'Sin automatizaciones';
}
