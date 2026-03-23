import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '../../lib/rateLimiting';
import { motion } from 'framer-motion';
import { LifeBuoy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardDegradationNotice from '../components/DashboardDegradationNotice';
import ModuleEmptyState from '../components/ModuleEmptyState';
import PanelCard from '../components/PanelCard';
import StateCard from '../components/StateCard';
import { fadeInVariants, staggerContainerVariants } from '../motion';
import type {
  CustomerMemory,
  DashboardGuild,
  DashboardPartialFailure,
  GuildConfigMutation,
  GuildSyncStatus,
  PlaybookRun,
  PlaybookWorkspaceSnapshot,
  TicketRecommendation,
  TicketDashboardActionId,
  TicketInboxItem,
  TicketWorkspaceSnapshot,
  TicketWorkflowStatus,
} from '../types';
import { getCustomerProfileForTicket, getTicketEventsForTicket, getTicketWorkspaceSummary } from '../utils';
import InboxFilters from './inbox/InboxFilters';
import InboxTicketDetail from './inbox/InboxTicketDetail';
import InboxTicketList from './inbox/InboxTicketList';
import type { ActionFeedback, AssignmentFilter, OpenStateFilter, PriorityFilter, SlaFilter } from './inbox/inboxTypes';
import { getActionLabel, getAssignmentOptions, getOpenStateOptions, getPriorityOptions, getSlaOptions, getWorkflowOptions, priorityWeight } from './inbox/inboxHelpers';

interface InboxModuleProps {
  guild: DashboardGuild;
  workspace: TicketWorkspaceSnapshot;
  playbooks: PlaybookWorkspaceSnapshot;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isMutating: boolean;
  onAction: (action: TicketDashboardActionId, payload: Record<string, unknown>) => Promise<void>;
  partialFailures: DashboardPartialFailure[];
}

export default function InboxModule({
  guild,
  workspace,
  playbooks,
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

  const debouncedSearch = useDebouncedValue(search, 250);

  const filteredInbox = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return workspace.inbox
      .filter((ticket) => (openStateFilter === 'all' ? true : openStateFilter === 'open' ? ticket.isOpen : !ticket.isOpen))
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
        if (!query) return true;
        return [
          ticket.ticketId,
          ticket.categoryLabel,
          ticket.subject ?? '',
          ticket.userLabel ?? '',
          ticket.userId,
          ticket.claimedByLabel ?? '',
          ticket.assigneeLabel ?? '',
          ticket.tags.join(' '),
        ].join(' ').toLowerCase().includes(query);
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
  }, [assignmentFilter, categoryFilter, openStateFilter, priorityFilter, debouncedSearch, slaFilter, workspace.inbox]);

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
    if (!selectedTicket || lastDraftTicketIdRef.current === selectedTicket.ticketId) {
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
  const selectedRecommendations = useMemo<TicketRecommendation[]>(
    () =>
      selectedTicket
        ? playbooks.recommendations.filter(
            (recommendation) =>
              recommendation.ticketId === selectedTicket.ticketId
              && recommendation.status === 'pending',
          )
        : [],
    [playbooks.recommendations, selectedTicket],
  );
  const selectedPlaybookRuns = useMemo<PlaybookRun[]>(
    () =>
      selectedTicket
        ? playbooks.runs.filter((run) => run.ticketId === selectedTicket.ticketId)
        : [],
    [playbooks.runs, selectedTicket],
  );
  const selectedCustomerMemory = useMemo<CustomerMemory | null>(
    () =>
      selectedTicket
        ? playbooks.customerMemory.find((memory) => memory.userId === selectedTicket.userId) ?? null
        : null,
    [playbooks.customerMemory, selectedTicket],
  );

  const activeFiltersCount = [
    openStateFilter !== 'open',
    priorityFilter !== 'all',
    slaFilter !== 'all',
    categoryFilter !== 'all',
    assignmentFilter !== 'all',
    search.trim().length > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setOpenStateFilter('open');
    setPriorityFilter('all');
    setSlaFilter('all');
    setCategoryFilter('all');
    setAssignmentFilter('all');
  };

  async function runAction(action: TicketDashboardActionId, payload: Record<string, unknown> = {}) {
    if (!selectedTicket) return;

    setActionFeedback({
      tone: 'pending',
      message: `Registrando la solicitud para ${getActionLabel(action, t)}...`,
      action,
      ticketId: selectedTicket.ticketId,
    });

    try {
      await onAction(action, { ticketId: selectedTicket.ticketId, channelId: selectedTicket.channelId, ...payload });

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
    return <StateCard eyebrow={t('dashboard.inbox.install.eyebrow')} title={t('dashboard.inbox.install.title')} description={t('dashboard.inbox.install.desc')} icon={LifeBuoy} tone="warning" />;
  }

  if (!workspace.inbox.length) {
    return <ModuleEmptyState icon={LifeBuoy} title={t('dashboard.inbox.empty.title')} description={t('dashboard.inbox.empty.desc')} />;
  }

  return (
    <div className="space-y-6">
      <DashboardDegradationNotice failures={partialFailures} title={t('dashboard.inbox.degraded')} />

      <PanelCard eyebrow={t('dashboard.inbox.workspace.eyebrow')} title={t('dashboard.inbox.workspace.title')} description={t('dashboard.inbox.workspace.desc')} variant="highlight">
        <motion.div variants={staggerContainerVariants} initial="hidden" animate="show" className="dashboard-grid-fit-standard mt-2">
          {[
            [t('dashboard.inbox.workspace.kpi.open.label'), `${summary.open}`, t('dashboard.inbox.workspace.kpi.open.note')],
            [t('dashboard.inbox.workspace.kpi.unclaimed.label'), `${summary.unclaimed}`, t('dashboard.inbox.workspace.kpi.unclaimed.note')],
            [t('dashboard.inbox.workspace.kpi.breached.label'), `${summary.breached}`, t('dashboard.inbox.workspace.kpi.breached.note')],
            [t('dashboard.inbox.workspace.kpi.warning.label'), `${summary.warning}`, t('dashboard.inbox.workspace.kpi.warning.note')],
            [t('dashboard.inbox.workspace.kpi.resolved.label'), `${summary.resolved}`, t('dashboard.inbox.workspace.kpi.resolved.note')],
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
        <PanelCard eyebrow={t('dashboard.inbox.list.eyebrow')} title={t('dashboard.inbox.list.title')} description={t('dashboard.inbox.list.desc')} variant="soft">
          <InboxFilters
            search={search}
            onSearchChange={setSearch}
            openStateFilter={openStateFilter}
            onOpenStateFilterChange={setOpenStateFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            slaFilter={slaFilter}
            onSlaFilterChange={setSlaFilter}
            assignmentFilter={assignmentFilter}
            onAssignmentFilterChange={setAssignmentFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            openStateOptions={openStateOptions}
            priorityOptions={priorityOptions}
            slaOptions={slaOptions}
            assignmentOptions={assignmentOptions}
            categoryOptions={categoryOptions}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            resultsLabel={t('dashboard.inbox.list.results', { count: filteredInbox.length })}
            supportLabel={`${summary.queues.support} ${t('dashboard.inbox.list.support')}`}
            communityLabel={`${summary.queues.community} ${t('dashboard.inbox.list.community')}`}
            clearFiltersLabel={t('dashboard.inbox.list.clearFilters')}
            searchLabel={t('dashboard.inbox.list.searchLabel')}
            searchPlaceholder={t('dashboard.inbox.list.searchPlaceholder')}
            openStateLabel={t('dashboard.inbox.list.openState')}
            priorityLabel={t('dashboard.inbox.list.priority')}
            slaLabel={t('dashboard.inbox.list.sla')}
            assignmentLabel={t('dashboard.inbox.list.assignment')}
            categoryLabel={t('dashboard.inbox.list.category')}
            allCategoriesLabel={t('dashboard.inbox.filters.allCategories')}
          />

          <div className="mt-4">
            {!filteredInbox.length ? (
              <div className="dashboard-empty-state">{t('dashboard.inbox.list.noResults')}</div>
            ) : (
              <InboxTicketList tickets={filteredInbox} selectedTicketId={selectedTicket?.ticketId ?? null} onSelectTicket={setSelectedTicketId} t={t} />
            )}
          </div>
        </PanelCard>

        {selectedTicket ? (
          <InboxTicketDetail
            t={t}
            ticket={selectedTicket}
            mutation={mutation}
            syncStatus={syncStatus}
            isMutating={isMutating}
            actionFeedback={actionFeedback}
            timeline={timeline}
            customerProfile={customerProfile}
            customerMemory={selectedCustomerMemory}
            recommendations={selectedRecommendations}
            playbookRuns={selectedPlaybookRuns}
            workflowOptions={workflowOptions}
            priorityOptions={priorityOptions}
            statusDraft={statusDraft}
            onStatusDraftChange={setStatusDraft}
            priorityDraft={priorityDraft}
            onPriorityDraftChange={setPriorityDraft}
            tagDraft={tagDraft}
            onTagDraftChange={setTagDraft}
            noteDraft={noteDraft}
            onNoteDraftChange={setNoteDraft}
            replyDraft={replyDraft}
            onReplyDraftChange={setReplyDraft}
            selectedMacroId={selectedMacroId}
            onSelectedMacroIdChange={setSelectedMacroId}
            selectedMacro={selectedMacro}
            macroConfirmed={macroConfirmed}
            onMacroConfirmedChange={setMacroConfirmed}
            macros={workspace.macros}
            onSelectTicket={setSelectedTicketId}
            onAction={(action, payload) => void runAction(action, payload)}
          />
        ) : (
          <StateCard eyebrow={t('dashboard.inbox.selection.eyebrow')} title={t('dashboard.inbox.selection.title')} description={t('dashboard.inbox.selection.desc')} icon={LifeBuoy} />
        )}
      </div>
    </div>
  );
}
