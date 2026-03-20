import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  FilterX,
  LifeBuoy,
  MessageSquareText,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Tags,
  UserRoundCheck,
  XCircle,
} from 'lucide-react';
import PanelCard from '../components/PanelCard';
import DashboardDegradationNotice from '../components/DashboardDegradationNotice';
import SectionMutationBanner from '../components/SectionMutationBanner';
import { useTranslation } from 'react-i18next';
import StateCard from '../components/StateCard';
import ModuleEmptyState from '../components/ModuleEmptyState';
import { fadeInVariants, panelSwapVariants, staggerContainerVariants } from '../motion';
import type {
  DashboardGuild,
  DashboardPartialFailure,
  GuildConfigMutation,
  GuildSyncStatus,
  TicketDashboardActionId,
  TicketInboxItem,
  TicketMacro,
  TicketWorkspaceSnapshot,
  TicketWorkflowStatus,
} from '../types';
import {
  formatDateTime,
  formatMinutesLabel,
  formatRelativeTime,
  getCustomerProfileForTicket,
  getTicketEventsForTicket,
  getTicketQueueLabel,
  getTicketSlaLabel,
  getTicketStatusLabel,
  getTicketWorkspaceSummary,
} from '../utils';

interface InboxModuleProps {
  guild: DashboardGuild;
  workspace: TicketWorkspaceSnapshot;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isMutating: boolean;
  onAction: (action: TicketDashboardActionId, payload: Record<string, unknown>) => Promise<void>;
  partialFailures: DashboardPartialFailure[];
}

type OpenStateFilter = 'all' | 'open' | 'closed';
type PriorityFilter = TicketInboxItem['priority'] | 'all';
type SlaFilter = TicketInboxItem['slaState'] | 'all';
type AssignmentFilter = 'all' | 'claimed' | 'unclaimed' | 'assigned' | 'unassigned';
type ActionFeedbackTone = 'success' | 'error' | 'pending';

interface ActionFeedback {
  tone: ActionFeedbackTone;
  message: string;
  action: TicketDashboardActionId;
  ticketId: string;
}

type T = ReturnType<typeof useTranslation>['t'];

function getWorkflowOptions(t: T): Array<{ value: TicketWorkflowStatus; label: string }> {
  return [
    { value: 'new', label: t('dashboard.inbox.workflow.new') },
    { value: 'triage', label: t('dashboard.inbox.workflow.triage') },
    { value: 'waiting_staff', label: t('dashboard.inbox.workflow.waitingStaff') },
    { value: 'waiting_user', label: t('dashboard.inbox.workflow.waitingUser') },
    { value: 'escalated', label: t('dashboard.inbox.workflow.escalated') },
    { value: 'resolved', label: t('dashboard.inbox.workflow.resolved') },
    { value: 'closed', label: t('dashboard.inbox.workflow.closed') },
  ];
}

function getOpenStateOptions(t: T): Array<{ value: OpenStateFilter; label: string }> {
  return [
    { value: 'all', label: t('dashboard.inbox.filters.all') },
    { value: 'open', label: t('dashboard.inbox.filters.open') },
    { value: 'closed', label: t('dashboard.inbox.filters.closed') },
  ];
}

function getPriorityOptions(t: T): Array<{ value: PriorityFilter; label: string }> {
  return [
    { value: 'all', label: t('dashboard.inbox.filters.all') },
    { value: 'urgent', label: t('dashboard.inbox.filters.urgent') },
    { value: 'high', label: t('dashboard.inbox.filters.high') },
    { value: 'normal', label: t('dashboard.inbox.filters.normal') },
    { value: 'low', label: t('dashboard.inbox.filters.low') },
  ];
}

function getSlaOptions(t: T): Array<{ value: SlaFilter; label: string }> {
  return [
    { value: 'all', label: t('dashboard.inbox.filters.all') },
    { value: 'breached', label: t('dashboard.inbox.filters.breached') },
    { value: 'warning', label: t('dashboard.inbox.filters.warning') },
    { value: 'healthy', label: t('dashboard.inbox.filters.healthy') },
    { value: 'paused', label: t('dashboard.inbox.filters.paused') },
    { value: 'resolved', label: t('dashboard.inbox.filters.resolved') },
  ];
}

function getAssignmentOptions(t: T): Array<{ value: AssignmentFilter; label: string }> {
  return [
    { value: 'all', label: t('dashboard.inbox.filters.allQueue') },
    { value: 'unclaimed', label: t('dashboard.inbox.filters.unclaimed') },
    { value: 'claimed', label: t('dashboard.inbox.filters.claimed') },
    { value: 'unassigned', label: t('dashboard.inbox.filters.unassigned') },
    { value: 'assigned', label: t('dashboard.inbox.filters.assigned') },
  ];
}

function getStatusTone(status: TicketWorkflowStatus) {
  if (status === 'escalated') return 'border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200';
  if (status === 'resolved' || status === 'closed') return 'border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200';
  if (status === 'waiting_user') return 'border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-200';
  if (status === 'waiting_staff') return 'border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200';
  return 'dashboard-neutral-pill';
}

function getSlaTone(state: TicketInboxItem['slaState']) {
  if (state === 'breached') return 'border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200';
  if (state === 'warning') return 'border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200';
  if (state === 'resolved') return 'border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200';
  if (state === 'paused') return 'border-slate-300/60 bg-slate-100 text-slate-700 dark:border-surface-600 dark:bg-surface-700 dark:text-slate-200';
  return 'border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-200';
}

function getPriorityTone(priority: TicketInboxItem['priority']) {
  if (priority === 'urgent') return 'border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200';
  if (priority === 'high') return 'border-orange-300/60 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/20 dark:text-orange-200';
  if (priority === 'low') return 'border-slate-300/60 bg-slate-50 text-slate-700 dark:border-surface-600 dark:bg-surface-700 dark:text-slate-200';
  return 'border-indigo-300/60 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-200';
}

function getPriorityLabel(priority: TicketInboxItem['priority'], t: T) {
  if (priority === 'urgent') return t('dashboard.inbox.filters.urgent');
  if (priority === 'high') return t('dashboard.inbox.filters.high');
  if (priority === 'low') return t('dashboard.inbox.filters.low');
  return t('dashboard.inbox.filters.normal');
}

function getVisibilityLabel(visibility: string | null, t: T) {
  if (visibility === 'internal') return t('dashboard.inbox.visibility.internal');
  if (visibility === 'public') return t('dashboard.inbox.visibility.public');
  return t('dashboard.inbox.visibility.system');
}

function priorityWeight(priority: TicketInboxItem['priority']) {
  if (priority === 'urgent') return 4;
  if (priority === 'high') return 3;
  if (priority === 'normal') return 2;
  return 1;
}

function getActionLabel(action: TicketDashboardActionId, t: T) {
  switch (action) {
    case 'claim':
      return t('dashboard.inbox.actions.claim');
    case 'unclaim':
      return t('dashboard.inbox.actions.unclaim');
    case 'assign_self':
      return t('dashboard.inbox.actions.assignSelf');
    case 'unassign':
      return t('dashboard.inbox.actions.unassign');
    case 'set_status':
      return t('dashboard.inbox.actions.setStatus');
    case 'close':
      return t('dashboard.inbox.actions.close');
    case 'reopen':
      return t('dashboard.inbox.actions.reopen');
    case 'add_note':
      return t('dashboard.inbox.actions.addNote');
    case 'add_tag':
      return t('dashboard.inbox.actions.addTag');
    case 'remove_tag':
      return t('dashboard.inbox.actions.removeTag');
    case 'reply_customer':
      return t('dashboard.inbox.actions.replyCustomer');
    case 'post_macro':
      return t('dashboard.inbox.actions.postMacro');
    case 'set_priority':
      return t('dashboard.inbox.actions.setPriority');
    default:
      return t('dashboard.inbox.actions.fallback');
  }
}

function getFeedbackClasses(tone: ActionFeedbackTone) {
  if (tone === 'error') return 'dashboard-action-alert';
  if (tone === 'success') return 'dashboard-action-success';
  return 'dashboard-action-note';
}

function getFeedbackIcon(tone: ActionFeedbackTone) {
  if (tone === 'error') return <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />;
  if (tone === 'success') return <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />;
  return <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0" />;
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function getMacroVisibilityLabel(macro: TicketMacro) {
  return macro.visibility === 'internal' ? 'Nota interna' : 'Respuesta publica';
}

export default function InboxModule({
  guild,
  workspace,
  mutation,
  syncStatus,
  isMutating,
  onAction,
  partialFailures,
}: InboxModuleProps) {
  const { t } = useTranslation();
  const workflowOptions = useMemo(() => getWorkflowOptions(t), [t]);
  const openStateOptions = useMemo(() => getOpenStateOptions(t), [t]);
  const priorityOptions = useMemo(() => getPriorityOptions(t), [t]);
  const slaOptions = useMemo(() => getSlaOptions(t), [t]);
  const assignmentOptions = useMemo(() => getAssignmentOptions(t), [t]);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openStateFilter, setOpenStateFilter] = useState<OpenStateFilter>('open');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [slaFilter, setSlaFilter] = useState<SlaFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('all');
  const [replyDraft, setReplyDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<TicketWorkflowStatus>('triage');
  const [priorityDraft, setPriorityDraft] = useState<TicketInboxItem['priority']>('normal');
  const [selectedMacroId, setSelectedMacroId] = useState('');
  const [macroConfirmed, setMacroConfirmed] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const lastDraftTicketIdRef = useRef<string | null>(null);

  const summary = useMemo(() => getTicketWorkspaceSummary(workspace.inbox), [workspace.inbox]);

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(workspace.inbox.map((ticket) => ticket.categoryLabel).filter(Boolean)))
        .sort((left, right) => left.localeCompare(right, 'es'))
        .map((label) => ({ value: label, label })),
    [workspace.inbox],
  );

  const filteredInbox = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workspace.inbox
      .filter((ticket) => {
        if (openStateFilter === 'open') return ticket.isOpen;
        if (openStateFilter === 'closed') return !ticket.isOpen;
        return true;
      })
      .filter((ticket) => (priorityFilter === 'all' ? true : ticket.priority === priorityFilter))
      .filter((ticket) => (slaFilter === 'all' ? true : ticket.slaState === slaFilter))
      .filter((ticket) => (categoryFilter === 'all' ? true : ticket.categoryLabel === categoryFilter))
      .filter((ticket) => {
        if (assignmentFilter === 'claimed') return Boolean(ticket.claimedBy);
        if (assignmentFilter === 'unclaimed') return !ticket.claimedBy;
        if (assignmentFilter === 'assigned') return Boolean(ticket.assigneeId);
        if (assignmentFilter === 'unassigned') return !ticket.assigneeId;
        return true;
      })
      .filter((ticket) => {
        if (!query) {
          return true;
        }

        return [
          ticket.ticketId,
          ticket.categoryLabel,
          ticket.subject ?? '',
          ticket.userLabel ?? '',
          ticket.userId,
          ticket.claimedByLabel ?? '',
          ticket.assigneeLabel ?? '',
          ticket.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((left, right) => {
        if (left.isOpen !== right.isOpen) return left.isOpen ? -1 : 1;
        if (left.slaState !== right.slaState) {
          if (left.slaState === 'breached') return -1;
          if (right.slaState === 'breached') return 1;
          if (left.slaState === 'warning') return -1;
          if (right.slaState === 'warning') return 1;
        }
        const priorityDelta = priorityWeight(right.priority) - priorityWeight(left.priority);
        if (priorityDelta !== 0) return priorityDelta;
        return (right.lastActivityAt ?? right.updatedAt).localeCompare(left.lastActivityAt ?? left.updatedAt);
      });
  }, [assignmentFilter, categoryFilter, openStateFilter, priorityFilter, search, slaFilter, workspace.inbox]);

  useEffect(() => {
    if (!filteredInbox.length) {
      setSelectedTicketId(null);
      return;
    }

    if (!selectedTicketId || !filteredInbox.some((ticket) => ticket.ticketId === selectedTicketId)) {
      setSelectedTicketId(filteredInbox[0].ticketId);
    }
  }, [filteredInbox, selectedTicketId]);

  const selectedTicket = useMemo(
    () => filteredInbox.find((ticket) => ticket.ticketId === selectedTicketId) ?? null,
    [filteredInbox, selectedTicketId],
  );

  useEffect(() => {
    if (!selectedTicket) {
      return;
    }

    if (lastDraftTicketIdRef.current === selectedTicket.ticketId) {
      return;
    }

    lastDraftTicketIdRef.current = selectedTicket.ticketId;

    setStatusDraft(selectedTicket.workflowStatus);
    setPriorityDraft(selectedTicket.priority);
    setReplyDraft('');
    setNoteDraft('');
    setTagDraft('');
    setSelectedMacroId('');
    setMacroConfirmed(false);
    setActionFeedback(null);
  }, [selectedTicket]);

  useEffect(() => {
    setMacroConfirmed(false);
  }, [selectedMacroId]);

  const timeline = useMemo(
    () => getTicketEventsForTicket(workspace.events, selectedTicket?.ticketId ?? null),
    [selectedTicket?.ticketId, workspace.events],
  );

  const customerProfile = useMemo(
    () => getCustomerProfileForTicket(workspace.inbox, selectedTicket),
    [selectedTicket, workspace.inbox],
  );

  const selectedMacro = useMemo(
    () => workspace.macros.find((macro) => macro.macroId === selectedMacroId) ?? null,
    [selectedMacroId, workspace.macros],
  );

  const activeFiltersCount = [
    openStateFilter !== 'open',
    priorityFilter !== 'all',
    slaFilter !== 'all',
    categoryFilter !== 'all',
    assignmentFilter !== 'all',
    search.trim().length > 0,
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch('');
    setOpenStateFilter('open');
    setPriorityFilter('all');
    setSlaFilter('all');
    setCategoryFilter('all');
    setAssignmentFilter('all');
  }

  function moveSelection(direction: 1 | -1) {
    if (!filteredInbox.length) {
      return;
    }

    const currentIndex = filteredInbox.findIndex((ticket) => ticket.ticketId === selectedTicketId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = Math.min(filteredInbox.length - 1, Math.max(0, safeIndex + direction));
    setSelectedTicketId(filteredInbox[nextIndex].ticketId);
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const tagName = target.tagName;

    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveSelection(1);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(-1);
    }
  }

  async function runAction(action: TicketDashboardActionId, payload: Record<string, unknown> = {}) {
    if (!selectedTicket) return;

    setActionFeedback({
      tone: 'pending',
      message: `Registrando la solicitud para ${getActionLabel(action, t)}...`,
      action,
      ticketId: selectedTicket.ticketId,
    });

    try {
      await onAction(action, {
        ticketId: selectedTicket.ticketId,
        channelId: selectedTicket.channelId,
        ...payload,
      });

      if (action === 'reply_customer' || action === 'post_macro') {
        setReplyDraft('');
        setSelectedMacroId('');
        setMacroConfirmed(false);
      }

      if (action === 'add_note') setNoteDraft('');
      if (action === 'add_tag') setTagDraft('');

      setActionFeedback({
        tone: 'success',
        message: `Solicitud enviada para ${getActionLabel(action, t)}. El inbox se actualizara en el siguiente refresh.`,
        action,
        ticketId: selectedTicket.ticketId,
      });
    } catch (error) {
      setActionFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : `No se pudo ${getActionLabel(action, t)}.`,
        action,
        ticketId: selectedTicket.ticketId,
      });
    }
  }

  if (!guild.botInstalled) {
    return <StateCard eyebrow="Instalacion" title="Instala el bot para activar la bandeja operativa" description="La bandeja viva depende del bridge del bot para publicar tickets, bitacora, macros y acciones auditadas." icon={LifeBuoy} tone="warning" />;
  }

  if (!workspace.inbox.length) {
    return (
      <ModuleEmptyState
        icon={LifeBuoy}
        title="La bandeja de tickets esta limpia"
        description="Cuando los usuarios abran tickets reales en Discord, aqui veras la cola operativa, alertas SLA, el historial del cliente y las acciones del staff."
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardDegradationNotice
        failures={partialFailures}
        title="La bandeja sigue disponible con algunas fuentes limitadas"
      />

      <PanelCard eyebrow="Workspace operativo" title="Inbox profesional para staff y administradores" description="Opera tickets por prioridad, SLA y contexto del cliente. La interfaz mantiene polling y mutaciones auditadas sin bloquear la pantalla completa." variant="highlight">
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <motion.div variants={staggerContainerVariants} initial="hidden" animate="show" className="dashboard-grid-fit-standard mt-8">
          {[
            ['Abiertos', `${summary.open}`, 'Casos activos listos para trabajar.'],
            ['Sin reclamar', `${summary.unclaimed}`, 'Tickets que todavia no tienen owner.'],
            ['SLA incumplido', `${summary.breached}`, 'Casos que exigen atencion inmediata.'],
            ['SLA por vencer', `${summary.warning}`, 'Tickets cerca del umbral operativo.'],
            ['Resueltos', `${summary.resolved}`, 'Tickets movidos a salida del flujo activo.'],
          ].map(([label, value, note]) => (
            <motion.article key={label} variants={fadeInVariants} className="dashboard-kpi-card min-w-0">
              <p className="dashboard-data-label">{label}</p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-950 dark:text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{note}</p>
            </motion.article>
          ))}
        </motion.div>
      </PanelCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <PanelCard eyebrow="Cola" title="Lista de tickets" description="Busca y navega con teclado. Flechas arriba/abajo cambian la seleccion cuando el foco esta en la lista." variant="soft">
          <div className="space-y-4" onKeyDown={handleListKeyDown}>
            <FilterField label="Buscar tickets" htmlFor="ticket-search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="ticket-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por ticket, usuario, asunto, agente o tag" className="dashboard-form-field pl-11" />
              </div>
            </FilterField>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <FilterField label="Apertura" htmlFor="open-state-filter">
                <select id="open-state-filter" value={openStateFilter} onChange={(event) => setOpenStateFilter(event.target.value as OpenStateFilter)} className="dashboard-form-field">
                  {openStateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FilterField>
              <FilterField label="Prioridad" htmlFor="priority-filter">
                <select id="priority-filter" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)} className="dashboard-form-field">
                  {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FilterField>
              <FilterField label="SLA" htmlFor="sla-filter">
                <select id="sla-filter" value={slaFilter} onChange={(event) => setSlaFilter(event.target.value as SlaFilter)} className="dashboard-form-field">
                  {slaOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FilterField>
              <FilterField label="Asignacion" htmlFor="assignment-filter">
                <select id="assignment-filter" value={assignmentFilter} onChange={(event) => setAssignmentFilter(event.target.value as AssignmentFilter)} className="dashboard-form-field">
                  {assignmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FilterField>
              <FilterField label="Categoria" htmlFor="category-filter">
                <select id="category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="dashboard-form-field md:col-span-2 xl:col-span-1 2xl:col-span-2">
                  <option value="all">{t('dashboard.inbox.filters.allCategories')}</option>
                  {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </FilterField>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="dashboard-status-pill-compact dashboard-neutral-pill">{filteredInbox.length} resultados</span>
              <span className="dashboard-status-pill-compact dashboard-neutral-pill">{summary.queues.support} soporte</span>
              <span className="dashboard-status-pill-compact dashboard-neutral-pill">{summary.queues.community} comunidad</span>
              {activeFiltersCount ? (
                <button type="button" onClick={clearFilters} className="dashboard-secondary-button">
                  <FilterX className="h-4 w-4" />
                  Limpiar filtros
                </button>
              ) : null}
            </div>

            {!filteredInbox.length ? (
              <div className="dashboard-empty-state">
                No hay tickets que coincidan con los filtros actuales. Ajusta la busqueda o limpia los filtros para recuperar la cola completa.
              </div>
            ) : (
              <motion.div variants={staggerContainerVariants} initial="hidden" animate="show" className="dashboard-scroll-panel space-y-3" tabIndex={0} aria-label="Resultados de tickets">
                {filteredInbox.map((ticket) => {
                  const active = selectedTicket?.ticketId === ticket.ticketId;
                  return (
                    <motion.button key={ticket.ticketId} type="button" variants={fadeInVariants} whileHover={{ y: -2 }} onClick={() => setSelectedTicketId(ticket.ticketId)} aria-pressed={active} className={`dashboard-interactive-card w-full rounded-[1.55rem] border p-4 text-left ${active ? 'border-brand-300/55 bg-[linear-gradient(135deg,rgba(88,101,242,0.12),rgba(20,184,166,0.06))] shadow-[0_18px_40px_rgba(88,101,242,0.12)] dark:border-brand-700/60 dark:bg-brand-950/18' : 'dashboard-data-card hover:border-brand-200/80 hover:bg-white/95 dark:hover:border-brand-800'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500">Ticket #{ticket.ticketId}</p>
                          <p className="mt-2 break-words text-lg font-semibold text-slate-950 dark:text-white">{ticket.subject || ticket.categoryLabel}</p>
                          <p className="mt-2 break-words text-sm text-slate-700 dark:text-slate-300">{ticket.userLabel ?? ticket.userId}</p>
                        </div>
                        <div className="flex min-w-[7rem] flex-col items-end gap-2">
                          <span className={`dashboard-status-pill ${getStatusTone(ticket.workflowStatus)}`}>{getTicketStatusLabel(ticket.workflowStatus)}</span>
                          <span className={`dashboard-status-pill ${getSlaTone(ticket.slaState)}`}>{getTicketSlaLabel(ticket.slaState)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">{getTicketQueueLabel(ticket.queueType)}</span>
                        <span className={`dashboard-status-pill-compact ${getPriorityTone(ticket.priority)}`}>Prioridad {getPriorityLabel(ticket.priority, t)}</span>
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">{ticket.claimedByLabel ?? 'Sin reclamar'}</span>
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">{ticket.assigneeLabel ?? 'Sin asignar'}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span>{ticket.messageCount} mensajes</span>
                        <span>Actividad {formatRelativeTime(ticket.lastActivityAt ?? ticket.updatedAt)}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </PanelCard>

        {!selectedTicket ? (
          <StateCard eyebrow="Seleccion" title="Elige un ticket para trabajar" description="La vista detalle muestra contexto del cliente, timeline y acciones de operacion para ese ticket." icon={LifeBuoy} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selectedTicket.ticketId} variants={panelSwapVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
              <PanelCard
                eyebrow="Detalle"
                title={`${selectedTicket.subject || selectedTicket.categoryLabel}`}
                description={`Ticket #${selectedTicket.ticketId} - ${selectedTicket.userLabel ?? selectedTicket.userId}`}
                variant="highlight"
                stickyActions
                actions={
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => runAction('claim')} disabled={isMutating || Boolean(selectedTicket.claimedBy)} className="dashboard-primary-button">
                      <UserRoundCheck className="h-4 w-4" />
                      Reclamar
                    </button>
                    <button type="button" onClick={() => runAction('unclaim')} disabled={isMutating || !selectedTicket.claimedBy} className="dashboard-secondary-button">Liberar</button>
                    <button type="button" onClick={() => runAction('assign_self')} disabled={isMutating || Boolean(selectedTicket.assigneeId)} className="dashboard-secondary-button">Asignarme</button>
                    <button type="button" onClick={() => runAction('unassign')} disabled={isMutating || !selectedTicket.assigneeId} className="dashboard-secondary-button">Desasignar</button>
                  </div>
                }
              >
                <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

                {actionFeedback && actionFeedback.ticketId === selectedTicket.ticketId ? (
                  <div className={`mt-5 ${getFeedbackClasses(actionFeedback.tone)}`} role={actionFeedback.tone === 'error' ? 'alert' : 'status'} aria-live="polite">
                    {getFeedbackIcon(actionFeedback.tone)}
                    <p className="text-sm leading-6">{actionFeedback.message}</p>
                  </div>
                ) : null}

                {(syncStatus?.bridgeStatus === 'degraded' || syncStatus?.bridgeStatus === 'error') ? (
                  <div className="dashboard-action-note mt-5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm leading-6">El bridge reporta estado <strong>{syncStatus.bridgeStatus}</strong>. Las acciones pueden tardar mas en reflejarse hasta el siguiente ciclo de polling.</p>
                  </div>
                ) : null}

                <div className="mt-8 grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                  <div className="space-y-6">
                    <div className="dashboard-grid-fit-standard">
                      {[
                        ['Estado', getTicketStatusLabel(selectedTicket.workflowStatus), getStatusTone(selectedTicket.workflowStatus), selectedTicket.isOpen ? 'Ticket activo dentro de la cola operativa.' : 'Ticket fuera de la cola activa.'],
                        ['Prioridad', getPriorityLabel(selectedTicket.priority, t), getPriorityTone(selectedTicket.priority), 'Nivel de urgencia esperado para el caso.'],
                        ['SLA', getTicketSlaLabel(selectedTicket.slaState), getSlaTone(selectedTicket.slaState), `Objetivo ${formatMinutesLabel(selectedTicket.slaTargetMinutes)}`],
                        ['Categoria', selectedTicket.categoryLabel, 'dashboard-neutral-pill', getTicketQueueLabel(selectedTicket.queueType)],
                      ].map(([label, value, tone, note]) => (
                        <article key={label} className="dashboard-data-card min-w-0">
                          <p className="dashboard-data-label">{label}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`dashboard-status-pill ${tone}`}>{value}</span>
                          </div>
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{note}</p>
                        </article>
                      ))}
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <div className="flex items-center gap-3">
                        <CircleUserRound className="h-4 w-4 text-brand-500" />
                        <div>
                          <p className="dashboard-panel-label">Cliente</p>
                          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Contexto del usuario</h3>
                        </div>
                      </div>

                      <div className="dashboard-grid-fit-standard mt-5">
                        {[
                          ['Usuario', selectedTicket.userLabel ?? selectedTicket.userId],
                          ['Claim owner', selectedTicket.claimedByLabel ?? 'Sin reclamar'],
                          ['Assignee', selectedTicket.assigneeLabel ?? 'Sin asignar'],
                          ['Primer respuesta', formatDateTime(selectedTicket.firstResponseAt)],
                          ['Ultimo cliente', formatDateTime(selectedTicket.lastCustomerMessageAt)],
                          ['Ultimo staff', formatDateTime(selectedTicket.lastStaffMessageAt)],
                          ['Creado', formatDateTime(selectedTicket.createdAt)],
                          ['Ultima sync', formatDateTime(selectedTicket.updatedAt)],
                        ].map(([label, value]) => (
                          <div key={label} className="dashboard-data-card">
                            <p className="dashboard-data-label">{label}</p>
                            <p className="dashboard-data-value break-words">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">{selectedTicket.messageCount} mensajes totales</span>
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">{selectedTicket.staffMessageCount} del staff</span>
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">{selectedTicket.reopenCount} reaperturas</span>
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">SLA vence {formatDateTime(selectedTicket.slaDueAt)}</span>
                      </div>
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="dashboard-panel-label">Conversacion</p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Timeline del ticket</h3>
                        </div>
                        <span className="dashboard-status-pill-compact dashboard-neutral-pill">{timeline.length} eventos</span>
                      </div>

                      <div className="dashboard-scroll-panel mt-5 space-y-3">
                        {timeline.length ? timeline.map((event) => (
                          <article key={event.id} className="dashboard-data-card">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words font-semibold text-slate-950 dark:text-white">{event.title}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{event.description}</p>
                              </div>
                              <span className="dashboard-status-pill-compact dashboard-neutral-pill">{getVisibilityLabel(event.visibility, t)}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                              <span>{event.actorLabel ?? 'Sistema'}</span>
                              <span>|</span>
                              <span>{formatDateTime(event.createdAt)}</span>
                            </div>
                          </article>
                        )) : <div className="dashboard-empty-state">Este ticket aun no tiene eventos sincronizados en la bitacora.</div>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <p className="dashboard-panel-label">Acciones operativas</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Estado y prioridad</h3>

                      <div className="mt-5 space-y-4">
                        <div className="grid gap-3">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
                          <select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as TicketWorkflowStatus)} className="dashboard-form-field">
                            {workflowOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                          <button type="button" onClick={() => runAction('set_status', { workflowStatus: statusDraft })} disabled={isMutating || statusDraft === selectedTicket.workflowStatus} className="dashboard-primary-button">
                            <Clock3 className="h-4 w-4" />
                            Aplicar estado
                          </button>
                        </div>

                        <div className="grid gap-3">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prioridad</label>
                          <select value={priorityDraft} onChange={(event) => setPriorityDraft(event.target.value as TicketInboxItem['priority'])} className="dashboard-form-field">
                            {priorityOptions.filter((option) => option.value !== 'all').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                          <button type="button" onClick={() => runAction('set_priority', { priority: priorityDraft })} disabled={isMutating || priorityDraft === selectedTicket.priority} className="dashboard-secondary-button">Actualizar prioridad</button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <button type="button" onClick={() => runAction('reopen')} disabled={isMutating || selectedTicket.isOpen} className="dashboard-secondary-button">Reabrir</button>
                          <button type="button" onClick={() => runAction('close', { reason: 'Cerrado desde la dashboard' })} disabled={isMutating || !selectedTicket.isOpen} className="dashboard-secondary-button">Cerrar</button>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <div className="flex items-center gap-3">
                        <Tags className="h-4 w-4 text-brand-500" />
                        <div>
                          <p className="dashboard-panel-label">Tags</p>
                          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Clasificacion rapida</h3>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedTicket.tags.length ? selectedTicket.tags.map((tag) => (
                          <button key={tag} type="button" onClick={() => runAction('remove_tag', { tag })} disabled={isMutating} className="dashboard-status-pill-compact dashboard-neutral-pill hover:border-rose-300 hover:text-rose-600" title={`Quitar tag ${tag}`}>
                            {tag}
                          </button>
                        )) : <span className="text-sm text-slate-600 dark:text-slate-400">Sin tags todavia.</span>}
                      </div>

                      <div className="mt-4 flex flex-col gap-3">
                        <input
                          value={tagDraft}
                          onChange={(event) => setTagDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey && tagDraft.trim() && !isMutating) {
                              event.preventDefault();
                              void runAction('add_tag', { tag: tagDraft.trim() });
                            }
                          }}
                          placeholder="Ej. vip, pago, bug"
                          className="dashboard-form-field"
                        />
                        <button type="button" onClick={() => runAction('add_tag', { tag: tagDraft.trim() })} disabled={isMutating || !tagDraft.trim()} className="dashboard-primary-button">Agregar tag</button>
                      </div>
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="h-4 w-4 text-brand-500" />
                        <div>
                          <p className="dashboard-panel-label">Nota interna</p>
                          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Handoff y contexto</h3>
                        </div>
                      </div>
                      <textarea
                        value={noteDraft}
                        onChange={(event) => setNoteDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && noteDraft.trim() && !isMutating) {
                            event.preventDefault();
                            void runAction('add_note', { note: noteDraft.trim() });
                          }
                        }}
                        rows={5}
                        placeholder="Contexto interno, handoff o detalles que no deben publicarse al cliente."
                        className="dashboard-form-field mt-4"
                      />
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Usa Ctrl/Cmd + Enter para guardar rapido.</p>
                      <button type="button" onClick={() => runAction('add_note', { note: noteDraft.trim() })} disabled={isMutating || !noteDraft.trim()} className="dashboard-primary-button mt-4">Guardar nota</button>
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-brand-500" />
                        <div>
                          <p className="dashboard-panel-label">Macros</p>
                          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Seleccion, preview y confirmacion</h3>
                        </div>
                      </div>

                      {workspace.macros.length ? (
                        <div className="mt-4 space-y-4">
                          <select value={selectedMacroId} onChange={(event) => setSelectedMacroId(event.target.value)} className="dashboard-form-field">
                            <option value="">Selecciona una macro</option>
                            {workspace.macros.map((macro) => (
                              <option key={macro.macroId} value={macro.macroId}>
                                {macro.label}
                              </option>
                            ))}
                          </select>

                          {selectedMacro ? (
                            <>
                              <div className="dashboard-data-card">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="dashboard-status-pill-compact dashboard-neutral-pill">{selectedMacro.label}</span>
                                  <span className="dashboard-status-pill-compact dashboard-neutral-pill">{getMacroVisibilityLabel(selectedMacro)}</span>
                                  {selectedMacro.isSystem ? <span className="dashboard-status-pill-compact dashboard-neutral-pill">System</span> : null}
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{selectedMacro.content}</p>
                              </div>

                              <label className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200/70 bg-white/60 p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                                <input type="checkbox" checked={macroConfirmed} onChange={(event) => setMacroConfirmed(event.target.checked)} className="mt-1" />
                                <span>Confirmo publicar esta macro en el ticket seleccionado.</span>
                              </label>

                              <button type="button" onClick={() => runAction('post_macro', { macroId: selectedMacro.macroId })} disabled={isMutating || !macroConfirmed} className="dashboard-primary-button">
                                Publicar macro
                              </button>
                            </>
                          ) : <div className="dashboard-empty-state">Selecciona una macro para ver el contenido antes de enviarlo.</div>}
                        </div>
                      ) : <div className="dashboard-empty-state mt-4">No hay macros configuradas para este guild.</div>}
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <div className="flex items-center gap-3">
                        <MessageSquareText className="h-4 w-4 text-brand-500" />
                        <div>
                          <p className="dashboard-panel-label">Respuesta al cliente</p>
                          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Mensaje manual</h3>
                        </div>
                      </div>
                      <textarea
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && replyDraft.trim() && !isMutating) {
                            event.preventDefault();
                            void runAction('reply_customer', { message: replyDraft.trim() });
                          }
                        }}
                        rows={5}
                        placeholder="Escribe una respuesta clara; el bot la publicara en el canal del ticket."
                        className="dashboard-form-field mt-4"
                      />
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Usa Ctrl/Cmd + Enter para enviar.</p>
                      <button type="button" onClick={() => runAction('reply_customer', { message: replyDraft.trim() })} disabled={isMutating || !replyDraft.trim()} className="dashboard-primary-button mt-4">
                        <Send className="h-4 w-4" />
                        Enviar respuesta
                      </button>
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <p className="dashboard-panel-label">Historial</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Contexto del cliente</h3>
                      {customerProfile ? (
                        <>
                          <div className="dashboard-grid-fit-standard mt-4">
                            <div className="dashboard-data-card">
                              <p className="dashboard-data-label">Cliente</p>
                              <p className="dashboard-data-value">{customerProfile.displayLabel}</p>
                            </div>
                            <div className="dashboard-data-card">
                              <p className="dashboard-data-label">Ultimo ticket</p>
                              <p className="dashboard-data-value">{formatDateTime(customerProfile.lastTicketAt)}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="dashboard-status-pill-compact dashboard-neutral-pill">{customerProfile.openTickets} abiertos</span>
                            <span className="dashboard-status-pill-compact dashboard-neutral-pill">{customerProfile.closedTickets} cerrados</span>
                          </div>

                          <div className="mt-5 space-y-3">
                            {customerProfile.recentTickets.map((ticket) => {
                              const isCurrent = ticket.ticketId === selectedTicket.ticketId;
                              return (
                                <button key={ticket.ticketId} type="button" onClick={() => setSelectedTicketId(ticket.ticketId)} disabled={isCurrent} className="dashboard-data-card w-full text-left disabled:cursor-default disabled:opacity-100">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-950 dark:text-white">#{ticket.ticketId}</p>
                                      <p className="mt-2 break-words text-sm text-slate-700 dark:text-slate-300">{ticket.subject || ticket.categoryLabel}</p>
                                    </div>
                                    <span className={`dashboard-status-pill-compact ${getStatusTone(ticket.workflowStatus)}`}>{getTicketStatusLabel(ticket.workflowStatus)}</span>
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                                    <span>{formatDateTime(ticket.createdAt)}</span>
                                    {isCurrent ? <span>Ticket actual</span> : <span>Abrir detalle</span>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : <div className="dashboard-empty-state mt-4">Aun no tenemos historial suficiente para este cliente.</div>}
                    </div>
                  </div>
                </div>
              </PanelCard>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
