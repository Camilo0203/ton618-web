import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDot,
  Clock3,
  HardDriveDownload,
  ListTodo,
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
      return 'Listo';
    case 'basic':
      return 'En progreso';
    case 'needs_attention':
      return 'Revisar';
    default:
      return 'Pendiente';
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

function getOutcomeLines(config: GuildConfig, activeModules: string[]) {
  return [
    config.verificationSettings.enabled
      ? 'Los nuevos miembros veran un acceso guiado antes de entrar al resto del servidor.'
      : 'No hay filtro de acceso obligatorio para nuevos miembros.',
    config.welcomeSettings.welcomeEnabled
      ? 'La bienvenida ya puede recibir usuarios sin tener que intervenir manualmente.'
      : 'La bienvenida todavia necesita activarse para acompañar a nuevos miembros.',
    config.ticketsSettings.maxTickets > 0
      ? `El soporte ya puede operar con un limite de ${config.ticketsSettings.maxTickets} ticket${config.ticketsSettings.maxTickets > 1 ? 's' : ''} por usuario.`
      : 'El soporte todavia no tiene un flujo operativo cerrado.',
    activeModules.length
      ? `Ya hay ${activeModules.length} automatizacion${activeModules.length > 1 ? 'es' : ''} encendida${activeModules.length > 1 ? 's' : ''} para uso diario.`
      : 'Aun no hay automatizaciones destacadas listas para operar solas.',
  ];
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
  const nextStep = checklist.find((step) => !step.complete) ?? null;
  const nextStepState = nextStep
    ? sectionStates.find((section) => section.sectionId === nextStep.sectionId) ?? null
    : null;
  const blockedStates = sectionStates.filter((section) => section.status === 'needs_attention');
  const readyStates = sectionStates.filter((section) => section.status === 'active' && !['overview', 'activity', 'analytics'].includes(section.sectionId));
  const basicStates = sectionStates.filter((section) => section.status === 'basic');
  const visibleSections = sectionStates.filter((section) => !['overview', 'activity', 'analytics', 'inbox'].includes(section.sectionId));
  const areasNeedingReview = visibleSections.filter((section) => section.status === 'needs_attention');
  const areasInProgress = visibleSections.filter((section) => section.status === 'basic');
  const areasReady = visibleSections.filter((section) => section.status === 'active');
  const blockersCount = blockedStates.length + failedMutations.length;
  const decisionStateLabel = blockersCount
    ? `Tienes ${blockersCount} frente${blockersCount > 1 ? 's' : ''} abierto${blockersCount > 1 ? 's' : ''} antes de dar esto por cerrado.`
    : nextStep
      ? 'La configuracion base va bien encaminada y ya tiene una siguiente tarea clara.'
      : 'La base principal ya esta lista para operar y solo quedan mejoras opcionales.';
  const homeSignalCards = [
    {
      label: 'Estado general',
      value: blockersCount ? 'Requiere atencion' : nextStep ? 'En cierre' : 'Operativo',
      note: blockersCount
        ? 'Primero resuelve lo que esta frenando la configuracion.'
        : nextStep
          ? 'Ya sabes exactamente que tarea sigue.'
          : 'La portada ya no muestra pendientes criticos.',
      toneClass: blockersCount ? 'dashboard-signal-card-alert' : nextStep ? 'dashboard-signal-card-progress' : 'dashboard-signal-card-ready',
    },
    {
      label: 'Progreso real',
      value: `${Math.round(progressRatio * 100)}%`,
      note: `${completedChecklist}/${checklist.length || 0} pasos clave ya estan resueltos.`,
      toneClass: 'dashboard-signal-card-progress',
    },
    {
      label: 'Bot y sincronizacion',
      value: getHealthLabel(syncStatus),
      note: guild.botInstalled ? 'El bot ya esta dentro del servidor.' : 'Todavia falta instalar el bot.',
      toneClass: syncStatus?.bridgeStatus === 'error' || !guild.botInstalled ? 'dashboard-signal-card-alert' : 'dashboard-signal-card-ready',
    },
    {
      label: 'Copia de seguridad',
      value: latestBackup ? formatRelativeTime(latestBackup.createdAt) : 'Pendiente',
      note: latestBackup ? 'Ya puedes volver atras si algo sale mal.' : 'Conviene crearla antes de cambios delicados.',
      toneClass: latestBackup ? 'dashboard-signal-card-ready' : 'dashboard-signal-card-progress',
    },
  ];
  const heroNotes = [
    {
      icon: CircleDot,
      text: nextStep ? `Sigue con ${nextStep.label.toLowerCase()} para no perder el ritmo.` : 'No quedan pasos criticos en la ruta principal.',
    },
    {
      icon: AlertTriangle,
      text: blockersCount
        ? `${blockersCount} tema${blockersCount > 1 ? 's' : ''} sigue${blockersCount > 1 ? 'n' : ''} bloqueando el cierre.`
        : 'No hay bloqueos visibles frenando la puesta en marcha.',
    },
    {
      icon: CheckCircle2,
      text: readyStates.length
        ? `${readyStates.length} area${readyStates.length > 1 ? 's' : ''} ya esta${readyStates.length > 1 ? 'n' : ''} suficientemente lista${readyStates.length > 1 ? 's' : ''}.`
        : 'Todavia no hay modulos marcados como completamente listos.',
    },
  ];
  const outcomeLines = getOutcomeLines(config, activeModules);
  const topReadyStates = readyStates.slice(0, 4);
  const prioritizedAreas = [...areasNeedingReview, ...areasInProgress, ...areasReady];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(22rem,0.98fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(24rem,0.9fr)]">
      <div className="space-y-6">
        <PanelCard
          eyebrow="Portada"
          title="Centro de control del servidor"
          description="Vuelve aqui para entender que ya esta listo, que sigue faltando y donde entrar para resolverlo sin depender de documentacion."
          variant="highlight"
          titleClassName="text-[1.75rem] lg:text-[2.15rem]"
          descriptionClassName="max-w-4xl text-[1rem] text-slate-600 dark:text-slate-300"
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]">
            <section className="dashboard-next-step-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="dashboard-panel-label">Siguiente paso recomendado</p>
                  <h3 className="mt-3 text-[1.55rem] font-semibold tracking-[-0.05em] text-slate-950 dark:text-white lg:text-[1.85rem]">
                    {nextStep?.label ?? 'La configuracion principal ya esta cerrada'}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {nextStep?.description ?? 'El servidor ya cubre la ruta principal de configuracion.'}
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {nextStep?.summary ?? 'Solo quedan ajustes opcionales o tareas de refinamiento.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="dashboard-overview-badge dashboard-overview-badge-progress">
                    {completedChecklist}/{checklist.length || 0} pasos listos
                  </span>
                  <span className={`dashboard-status-pill-compact ${getStatusClasses(nextStepState?.status ?? 'active')}`}>
                    {nextStep ? getStatusLabel(nextStep.status) : 'Todo al dia'}
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
                    Abrir tarea recomendada
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : null}
                {areasNeedingReview[0] ? (
                  <button
                    type="button"
                    onClick={() => onSectionChange(areasNeedingReview[0].sectionId)}
                    className="dashboard-secondary-button"
                  >
                    Ver lo que pide revision
                  </button>
                ) : null}
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200/70 dark:bg-surface-700/80">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(88,101,242,0.95),rgba(34,211,238,0.9))]"
                  style={{ width: `${Math.max(8, Math.round(progressRatio * 100))}%` }}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {heroNotes.map((item) => (
                  <div key={item.text} className="dashboard-overview-inline-note">
                    <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="dashboard-overview-summary-card">
                <p className="dashboard-panel-label">Lectura rapida</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                  {decisionStateLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {basicStates.length
                    ? `Tambien hay ${basicStates.length} area${basicStates.length > 1 ? 's' : ''} a medio camino que ya tienen base montada.`
                    : 'Cuando completes la siguiente tarea, la portada empezara a mostrar mas modulos como listos.'}
                </p>
              </div>

              <div className="dashboard-grid-fit-compact">
                {homeSignalCards.map((card) => (
                  <article key={card.label} className={`dashboard-kpi-card ${card.toneClass}`}>
                    <p className="dashboard-data-label">{card.label}</p>
                    <p className="mt-3 text-[1.45rem] font-bold tracking-[-0.05em] text-slate-950 dark:text-white lg:text-[1.7rem]">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{card.note}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </PanelCard>

        <PanelCard
          eyebrow="Ruta guiada"
          title="Lo siguiente para dejar esto cerrado"
          description="Primero resuelve lo que bloquea, despues completa la tarea marcada como siguiente paso y usa los accesos rapidos para entrar directo al modulo correcto."
          variant="soft"
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
            <div className="space-y-3">
              {checklist.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSectionChange(step.sectionId)}
                  className={`dashboard-checklist-item w-full text-left ${nextStep?.id === step.id ? 'dashboard-checklist-item-featured' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`dashboard-checklist-index ${step.complete ? 'dashboard-checklist-index-complete' : ''}`}>
                      {step.complete ? <CheckCircle2 className="h-5 w-5" /> : <span>{index + 1}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-950 dark:text-white">{step.label}</p>
                        <span className={`dashboard-status-pill-compact ${getStatusClasses(step.status)}`}>
                          {step.complete ? 'Listo' : getStatusLabel(step.status)}
                        </span>
                        {nextStep?.id === step.id ? (
                          <span className="dashboard-overview-badge dashboard-overview-badge-progress">Ahora</span>
                        ) : null}
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

            <div className="space-y-4">
              <section className={`dashboard-guided-stack ${blockersCount ? 'dashboard-guided-stack-alert' : 'dashboard-guided-stack-success'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="dashboard-panel-label">Bloqueos y revisiones</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                      {blockersCount ? 'Esto todavia requiere tu atencion' : 'No hay bloqueos criticos ahora mismo'}
                    </h3>
                  </div>
                  <span className="dashboard-overview-count">{blockersCount}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {failedMutations.length ? (
                    <div className="dashboard-action-alert">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Hay {failedMutations.length} cambio{failedMutations.length > 1 ? 's' : ''} que el bot no pudo aplicar.</p>
                        <p className="mt-1 text-sm text-current/80">Conviene revisar el modulo afectado antes de seguir configurando otras areas.</p>
                      </div>
                    </div>
                  ) : null}
                  {blockedStates.slice(0, 3).map((section) => (
                    <button
                      key={section.sectionId}
                      type="button"
                      onClick={() => onSectionChange(section.sectionId)}
                      className="dashboard-action-alert w-full text-left"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{section.label}</p>
                        <p className="mt-1 text-sm text-current/80">{section.messages[0] ?? section.summary}</p>
                      </div>
                    </button>
                  ))}
                  {!failedMutations.length && !blockedStates.length ? (
                    <div className="dashboard-action-success">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">La portada no detecta nada frenando el cierre.</p>
                        <p className="mt-1 text-sm text-current/80">Puedes avanzar con la siguiente tarea recomendada o pulir modulos opcionales.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="dashboard-guided-stack">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="dashboard-panel-label">Quick actions</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                      Entradas directas para resolver lo importante
                    </h3>
                  </div>
                  <Sparkles className="mt-1 h-4 w-4 text-slate-400" />
                </div>

                <div className="mt-4 space-y-3">
                  {quickActions.length ? (
                    quickActions.map((action, index) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => onSectionChange(action.sectionId)}
                        className={`dashboard-quick-action-card w-full text-left ${index === 0 ? 'dashboard-quick-action-card-primary' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-950 dark:text-white">{action.label}</p>
                              {index === 0 ? (
                                <span className="dashboard-overview-badge dashboard-overview-badge-progress">Primero</span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{action.description}</p>
                          </div>
                          <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="dashboard-empty-state">
                      No hay atajos urgentes porque la portada no encuentra tareas prioritarias fuera de la ruta principal.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </PanelCard>

        <PanelCard
          eyebrow="Mapa del producto"
          title="Areas del servidor"
          description="Cada bloque te dice si una parte del producto ya esta lista, va a medio camino o necesita revision antes de confiar en ella."
          variant="soft"
        >
          <div className="grid gap-4 xl:grid-cols-3">
            {[
              {
                title: 'Revisar ahora',
                description: 'Esto explica por que la portada todavia no esta cerrada.',
                sections: prioritizedAreas.filter((section) => section.status === 'needs_attention'),
                empty: 'No hay areas pidiendo revision inmediata.',
              },
              {
                title: 'En progreso',
                description: 'Ya tienen base montada, pero todavia falta rematarlas.',
                sections: prioritizedAreas.filter((section) => section.status === 'basic' || section.status === 'not_configured'),
                empty: 'No hay areas a medio camino en este momento.',
              },
              {
                title: 'Suficientemente listo',
                description: 'Esto ya puede operar sin depender de mas documentacion.',
                sections: prioritizedAreas.filter((section) => section.status === 'active'),
                empty: 'Todavia no hay areas completamente cerradas.',
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
              <p className="dashboard-panel-label text-brand-100">Estado del sistema del bot</p>
              <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
                {guild.botInstalled ? 'Listo para operar' : 'Instalacion pendiente'}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/72">
                {syncStatus?.bridgeMessage ?? 'Resumen tecnico traducido a señales faciles de entender.'}
              </p>
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
              ['Automatizaciones', appliedModulesLabel(activeModules.length || summary.modulesActive.length)],
            ].map(([label, value]) => (
              <div key={label} className="dashboard-live-row flex items-center justify-between gap-3 rounded-[1.1rem] px-4 py-3">
                <span className="text-sm text-white/68">{label}</span>
                <span className="text-right text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="relative z-[1] mt-5 space-y-3">
            {[
              {
                label: 'Sincronizacion',
                value: getHealthLabel(syncStatus),
                note: pendingMutations.length
                  ? `Hay ${pendingMutations.length} cambio${pendingMutations.length > 1 ? 's' : ''} esperando aplicarse.`
                  : 'No hay cambios pendientes por aplicar.',
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
                note: latestBackup ? 'Ya tienes una base para restaurar.' : 'Conviene crear uno antes de cambios delicados.',
                icon: HardDriveDownload,
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
          title="Lo que ya esta funcionando"
          description="Esta parte le da tranquilidad al usuario: muestra que ya no necesita tocar ciertas areas para tener una base util."
          variant="success"
        >
          <div className="space-y-3">
            {topReadyStates.length ? (
              topReadyStates.map((section) => (
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
              ))
            ) : (
              <div className="dashboard-empty-state">
                Todavia no hay areas completamente listas. Completa la ruta guiada y esta seccion empezara a llenarse sola.
              </div>
            )}
            {basicStates.length ? (
              <div className="dashboard-action-note">
                <ListTodo className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  Tambien hay {basicStates.length} area{basicStates.length > 1 ? 's' : ''} que ya tiene{basicStates.length > 1 ? 'n' : ''} base, aunque todavia no conviene darla{basicStates.length > 1 ? 's' : ''} por cerrada{basicStates.length > 1 ? 's' : ''}.
                </p>
              </div>
            ) : null}
          </div>
        </PanelCard>

        <PanelCard
          title="Resultado esperado"
          description="Asi deberia sentirse el servidor para un usuario normal cuando la configuracion actual ya esta bien encaminada."
          variant="soft"
        >
          <div className="space-y-3">
            {outcomeLines.map((line) => (
              <div key={line} className="dashboard-action-note">
                <ListTodo className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{line}</p>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard
          title="Actividad reciente"
          description="Sirve para validar rapido si el servidor ya esta reaccionando como esperas despues de tus cambios."
          variant="soft"
        >
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
      </div>
    </div>
  );
}

function appliedModulesLabel(count: number): string {
  return count ? `${count} activas` : 'Sin automatizaciones';
}
