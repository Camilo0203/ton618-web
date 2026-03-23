import { BrainCircuit, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardDegradationNotice from '../components/DashboardDegradationNotice';
import ModuleEmptyState from '../components/ModuleEmptyState';
import PanelCard from '../components/PanelCard';
import StateCard from '../components/StateCard';
import type {
  DashboardGuild,
  DashboardPartialFailure,
  DashboardSectionId,
  PlaybookWorkspaceSnapshot,
  TicketWorkspaceSnapshot,
} from '../types';

interface PlaybooksModuleProps {
  guild: DashboardGuild;
  playbooks: PlaybookWorkspaceSnapshot;
  workspace: TicketWorkspaceSnapshot;
  onSectionChange: (section: DashboardSectionId) => void;
  partialFailures: DashboardPartialFailure[];
}

function getToneClass(tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger') {
  switch (tone) {
    case 'danger':
      return 'border-rose-200/70 bg-rose-50/90 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-100';
    case 'warning':
      return 'border-amber-200/70 bg-amber-50/90 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100';
    case 'info':
      return 'border-sky-200/70 bg-sky-50/90 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100';
    case 'success':
      return 'border-emerald-200/70 bg-emerald-50/90 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100';
    default:
      return 'border-slate-200/70 bg-slate-50/90 text-slate-900 dark:border-surface-600 dark:bg-surface-700/70 dark:text-slate-100';
  }
}

export default function PlaybooksModule({
  guild,
  playbooks,
  workspace,
  onSectionChange,
  partialFailures,
}: PlaybooksModuleProps) {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language.startsWith('en');
  const activeDefinitions = playbooks.definitions.filter((definition) => definition.isEnabled);
  const pendingRecommendations = playbooks.recommendations.filter((recommendation) => recommendation.status === 'pending');
  const appliedRuns = playbooks.runs.filter((run) => run.status === 'applied');
  const watchCustomers = playbooks.customerMemory.filter((memory) => memory.riskLevel === 'watch');
  const macrosById = new Map(workspace.macros.map((macro) => [macro.macroId, macro]));
  const ticketsById = new Map(workspace.inbox.map((ticket) => [ticket.ticketId, ticket]));

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={isEnglish ? 'Installation required' : 'Instalacion requerida'}
        title={isEnglish ? 'Install the bot before opening live playbooks' : 'Instala el bot antes de abrir los playbooks vivos'}
        description={isEnglish
          ? 'The operational console needs the bridge and the ticket workspace before it can publish guided actions.'
          : 'La consola operativa necesita el bridge y la bandeja de tickets para publicar acciones guiadas.'}
        icon={BrainCircuit}
        tone="warning"
      />
    );
  }

  if (!playbooks.definitions.length && !playbooks.recommendations.length) {
    return (
      <ModuleEmptyState
        icon={BrainCircuit}
        title={isEnglish ? 'No live playbooks yet' : 'Todavia no hay playbooks vivos'}
        description={isEnglish
          ? 'As soon as the bot syncs tickets, SLA and customer history, live playbooks will appear here.'
          : 'En cuanto el bot sincronice tickets, SLA e historial del usuario, los playbooks apareceran aqui.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardDegradationNotice
        failures={partialFailures}
        title={isEnglish ? 'Playbooks are operating with partial coverage' : 'Los playbooks estan operando con cobertura parcial'}
      />

      <PanelCard
        eyebrow={isEnglish ? 'Ops console' : 'Consola operativa'}
        title={isEnglish ? 'Live playbooks and guided decisions' : 'Playbooks vivos y decisiones guiadas'}
        description={isEnglish
          ? 'Recommendations combine ticket state, SLA, incident mode and lightweight customer memory.'
          : 'Las recomendaciones combinan estado del ticket, SLA, incident mode y memoria operativa ligera.'}
        variant="highlight"
        actions={(
          <button type="button" onClick={() => onSectionChange('inbox')} className="dashboard-primary-button">
            {isEnglish ? 'Open inbox' : 'Abrir bandeja'}
          </button>
        )}
      >
        <div className="dashboard-grid-fit-standard">
          {[
            [isEnglish ? 'Active playbooks' : 'Playbooks activos', String(activeDefinitions.length), isEnglish ? 'Native operational automations ready for staff.' : 'Automatizaciones operativas listas para el staff.'],
            [isEnglish ? 'Pending recommendations' : 'Recomendaciones pendientes', String(pendingRecommendations.length), isEnglish ? 'Guided actions waiting for confirmation or dismissal.' : 'Acciones guiadas esperando confirmacion o descarte.'],
            [isEnglish ? 'Applied runs' : 'Ejecuciones aplicadas', String(appliedRuns.length), isEnglish ? 'Recommendations already confirmed or executed by staff.' : 'Recomendaciones ya ejecutadas o confirmadas por el staff.'],
            [isEnglish ? 'Customers under watch' : 'Usuarios en seguimiento', String(watchCustomers.length), isEnglish ? 'Operational memory detects repeated cases or SLA risk.' : 'La memoria operativa detecta casos repetidos o riesgo SLA.'],
          ].map(([label, value, note]) => (
            <article key={String(label)} className="dashboard-kpi-card">
              <p className="dashboard-data-label">{label}</p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-950 dark:text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{note}</p>
            </article>
          ))}
        </div>
      </PanelCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <PanelCard
          eyebrow={isEnglish ? 'Native playbooks' : 'Playbooks nativos'}
          title={isEnglish ? 'Operational rules active on this guild' : 'Reglas operativas activas en este guild'}
          description={isEnglish
            ? 'These playbooks are deterministic in v1 and still require human confirmation for sensitive actions.'
            : 'Estos playbooks son deterministas en v1 y todavia piden confirmacion humana para acciones sensibles.'}
          variant="soft"
        >
          <div className="space-y-3">
            {activeDefinitions.map((definition) => (
              <article key={definition.playbookId} className="dashboard-data-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950 dark:text-white">{definition.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{definition.description}</p>
                    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{definition.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="dashboard-status-pill-compact dashboard-neutral-pill">{definition.tier.toUpperCase()}</span>
                    <span className="dashboard-status-pill-compact dashboard-neutral-pill">{definition.executionMode}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{definition.triggerSummary}</p>
              </article>
            ))}
          </div>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard
            eyebrow={isEnglish ? 'Pending queue' : 'Cola pendiente'}
            title={isEnglish ? 'Recommendations waiting for staff' : 'Recomendaciones esperando al staff'}
            description={isEnglish
              ? 'Review them in order and move to the inbox when you need to execute the action.'
              : 'Revísalas en orden y abre la bandeja cuando necesites ejecutar la acción.'}
            variant="soft"
          >
            <div className="space-y-3">
              {pendingRecommendations.length ? (
                pendingRecommendations.slice(0, 8).map((recommendation) => {
                  const macro = recommendation.suggestedMacroId
                    ? macrosById.get(recommendation.suggestedMacroId) ?? null
                    : null;
                  const ticket = ticketsById.get(recommendation.ticketId) ?? null;

                  return (
                    <article key={recommendation.recommendationId} className={`rounded-[1.35rem] border p-4 ${getToneClass(recommendation.tone)}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{recommendation.title}</p>
                          <p className="mt-2 text-sm leading-6 text-current/85">{recommendation.summary}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-current/65">
                            #{recommendation.ticketId}
                            {ticket ? ` · ${ticket.categoryLabel}` : ''}
                            {macro ? ` · ${macro.label}` : ''}
                          </p>
                        </div>
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                          {Math.round(recommendation.confidence * 100)}%
                        </span>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="dashboard-empty-state">
                  {isEnglish ? 'No pending recommendations right now.' : 'No hay recomendaciones pendientes ahora mismo.'}
                </div>
              )}
            </div>
          </PanelCard>

          <PanelCard
            eyebrow={isEnglish ? 'Customer memory' : 'Memoria del usuario'}
            title={isEnglish ? 'Watch list and repeat cases' : 'Watch list y casos recurrentes'}
            description={isEnglish
              ? 'Lightweight memory helps staff answer with context instead of guesswork.'
              : 'La memoria ligera ayuda al staff a responder con contexto y no a ciegas.'}
            variant="soft"
          >
            <div className="space-y-3">
              {watchCustomers.length ? (
                watchCustomers.slice(0, 6).map((memory) => (
                  <article key={memory.userId} className="dashboard-data-card">
                    <div className="flex items-start gap-3">
                      <Users className="mt-1 h-4 w-4 text-brand-500" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-950 dark:text-white">{memory.displayLabel}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{memory.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                            {isEnglish ? `${memory.openTickets} open` : `${memory.openTickets} abiertos`}
                          </span>
                          <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                            {isEnglish ? `${memory.breachedTickets} breached` : `${memory.breachedTickets} vencidos`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  {isEnglish ? 'No users are under watch right now.' : 'No hay usuarios bajo seguimiento en este momento.'}
                </div>
              )}
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
