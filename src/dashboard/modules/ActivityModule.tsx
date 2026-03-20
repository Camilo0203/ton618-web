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
        pill: 'border-emerald-200/70 bg-emerald-50/90 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100',
        card: 'border-emerald-200/70 dark:border-emerald-900/30',
      };
    case 'warning':
      return {
        dot: 'bg-amber-500',
        pill: 'border-amber-200/70 bg-amber-50/90 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100',
        card: 'border-amber-200/70 dark:border-amber-900/30',
      };
    case 'danger':
      return {
        dot: 'bg-rose-500',
        pill: 'border-rose-200/70 bg-rose-50/90 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-100',
        card: 'border-rose-200/70 dark:border-rose-900/30',
      };
    case 'info':
      return {
        dot: 'bg-sky-500',
        pill: 'border-sky-200/70 bg-sky-50/90 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100',
        card: 'border-sky-200/70 dark:border-sky-900/30',
      };
    default:
      return {
        dot: 'bg-slate-400',
        pill: 'border-slate-200/70 bg-slate-50/90 text-slate-700 dark:border-surface-600 dark:bg-surface-700/70 dark:text-slate-200',
        card: 'border-slate-200/70 dark:border-surface-600',
      };
  }
}

function getSeverityLabel(severity: InsightTone) {
  switch (severity) {
    case 'success':
      return 'Ok';
    case 'warning':
      return 'Atencion';
    case 'danger':
      return 'Critico';
    case 'info':
      return 'Info';
    default:
      return 'Neutral';
  }
}

function getSourceLabel(source: ActivityFilter) {
  switch (source) {
    case 'event':
      return 'Solo eventos';
    case 'mutation':
      return 'Solo mutaciones';
    default:
      return 'Todo';
  }
}

function getSeverityFilterLabel(severity: SeverityFilter) {
  switch (severity) {
    case 'success':
      return 'Ok';
    case 'warning':
      return 'Atencion';
    case 'danger':
      return 'Critico';
    case 'info':
      return 'Info';
    case 'neutral':
      return 'Neutral';
    default:
      return 'Todas';
  }
}

export default function ActivityModule({
  guild,
  events,
  mutations,
  partialFailure,
}: ActivityModuleProps) {
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
        eyebrow="Actividad degradada"
        title="La auditoria reciente no esta disponible por ahora"
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
        title="La bitacora esta limpia"
        description={guild.botInstalled
          ? 'Cuando solicites cambios, se procesen tickets o el bot publique eventos, aqui aparecera la linea de tiempo operativa.'
          : 'Invita el bot a este servidor y realiza la primera configuracion para empezar a construir la auditoria.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardDegradationNotice
        failures={partialFailure ? [partialFailure] : []}
        title="La linea de tiempo esta operando con cobertura parcial"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.32fr)_minmax(21rem,0.8fr)]">
        <PanelCard
          eyebrow="Timeline"
          title="Actividad reciente del panel y del bot"
          description="La linea de tiempo combina mutaciones de configuracion con eventos del sistema para que puedas seguir el estado del servidor de una sola pasada."
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
                Limpiar filtros
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
                              <p className="break-words text-base font-semibold text-slate-950 dark:text-white">{item.title}</p>
                              <span className={`dashboard-status-pill-compact ${styles.pill}`}>
                                {getSeverityLabel(item.severity)}
                              </span>
                              <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                                {item.sourceLabel}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.description}</p>
                          </div>

                          <div className="min-w-[8.5rem] text-left sm:text-right">
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{timestamp.relative}</p>
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
                          <div className="mt-4 rounded-[1.1rem] border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 dark:border-surface-600 dark:bg-surface-700/65 dark:text-slate-300">
                            Payload: {summarizeMutationPayload(relatedMutation.requestedPayload)}
                            {relatedMutation.errorMessage ? (
                              <p className="mt-2 text-rose-600 dark:text-rose-300">{relatedMutation.errorMessage}</p>
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
                No hay elementos para la combinacion actual de filtros. Prueba con todas las fuentes o todas las severidades.
              </div>
            )}
          </div>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard
            eyebrow="Resumen"
            title="Estado de la cola"
            description="Lectura rapida para saber si la operacion esta tranquila o si hay que entrar a revisar."
            variant={failedMutations ? 'danger' : pendingMutations ? 'soft' : 'success'}
          >
            <div className="dashboard-grid-fit-compact">
              {[
                {
                  label: 'Mutaciones pendientes',
                  value: String(pendingMutations),
                  icon: Clock3,
                },
                {
                  label: 'Mutaciones fallidas',
                  value: String(failedMutations),
                  icon: AlertTriangle,
                },
                {
                  label: 'Eventos recientes',
                  value: String(events.length),
                  icon: History,
                },
                {
                  label: 'Timeline visible',
                  value: String(filteredTimeline.length),
                  icon: CheckCircle2,
                },
              ].map((item) => (
                <article key={item.label} className="dashboard-kpi-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="dashboard-data-label">{item.label}</p>
                    <item.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-3 text-[1.7rem] font-bold tracking-[-0.05em] text-slate-950 dark:text-white">{item.value}</p>
                </article>
              ))}
            </div>
          </PanelCard>

          <PanelCard
            eyebrow="Lectura"
            title="Como interpretar esta actividad"
            description="Pequenas guias para leer la timeline con menos friccion."
            variant="soft"
          >
            <div className="space-y-3">
              <div className="dashboard-action-note">
                <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  La timeline mezcla solicitudes de la dashboard con eventos confirmados por el sistema y los ordena por la fecha mas relevante.
                </p>
              </div>
              <div className="dashboard-action-note">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  Usa severidad critica o de atencion para encontrar rapido errores, atascos o cambios que aun esperan aplicacion.
                </p>
              </div>
              <div className="dashboard-action-note">
                <Filter className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  Si quieres ver solo lo que salio del admin panel, filtra por mutaciones. Si buscas confirmaciones del bridge, filtra por eventos.
                </p>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
