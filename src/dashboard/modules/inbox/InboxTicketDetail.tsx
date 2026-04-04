import {
  AlertTriangle,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  MessageSquareText,
  Send,
  ShieldAlert,
  Tags,
  XCircle,
} from 'lucide-react';
import PanelCard from '../../components/PanelCard';
import SectionMutationBanner from '../../components/SectionMutationBanner';
import type {
  CustomerMemory,
  GuildConfigMutation,
  GuildSyncStatus,
  PlaybookRun,
  TicketRecommendation,
  TicketConversationEvent,
  TicketDashboardActionId,
  TicketInboxItem,
  TicketMacro,
  TicketWorkflowStatus,
} from '../../types';
import { formatDateTime, formatMinutesLabel, getTicketQueueLabel, getTicketSlaLabel, getTicketStatusLabel } from '../../utils';
import InboxActionBar from './InboxActionBar';
import InboxMacroPanel from './InboxMacroPanel';
import { getFeedbackClasses, getPriorityLabel, getPriorityTone, getSlaTone, getStatusTone, getVisibilityLabel } from './inboxHelpers';
import type { ActionFeedback, PriorityFilter, T } from './inboxTypes';

interface CustomerProfile {
  displayLabel: string;
  lastTicketAt: string | null;
  openTickets: number;
  closedTickets: number;
  recentTickets: TicketInboxItem[];
}

interface InboxTicketDetailProps {
  t: T;
  ticket: TicketInboxItem;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isMutating: boolean;
  actionFeedback: ActionFeedback | null;
  timeline: TicketConversationEvent[];
  customerProfile: CustomerProfile | null;
  customerMemory: CustomerMemory | null;
  recommendations: TicketRecommendation[];
  playbookRuns: PlaybookRun[];
  workflowOptions: Array<{ value: TicketWorkflowStatus; label: string }>;
  priorityOptions: Array<{ value: PriorityFilter; label: string }>;
  statusDraft: TicketWorkflowStatus;
  onStatusDraftChange: (value: TicketWorkflowStatus) => void;
  priorityDraft: TicketInboxItem['priority'];
  onPriorityDraftChange: (value: TicketInboxItem['priority']) => void;
  tagDraft: string;
  onTagDraftChange: (value: string) => void;
  noteDraft: string;
  onNoteDraftChange: (value: string) => void;
  replyDraft: string;
  onReplyDraftChange: (value: string) => void;
  selectedMacroId: string;
  onSelectedMacroIdChange: (value: string) => void;
  selectedMacro: TicketMacro | null;
  macroConfirmed: boolean;
  onMacroConfirmedChange: (value: boolean) => void;
  macros: TicketMacro[];
  onSelectTicket: (ticketId: string) => void;
  onAction: (action: TicketDashboardActionId, payload?: Record<string, unknown>) => void;
}

function getFeedbackIcon(tone: ActionFeedback['tone']) {
  if (tone === 'error') return <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />;
  if (tone === 'success') return <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />;
  return <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0" />;
}

function getRecommendationToneClass(tone: TicketRecommendation['tone']) {
  switch (tone) {
    case 'danger':
      return 'border-rose-900/40 bg-rose-950/20 text-rose-100';
    case 'warning':
      return 'border-amber-900/40 bg-amber-950/20 text-amber-100';
    case 'info':
      return 'border-sky-900/40 bg-sky-950/20 text-sky-100';
    case 'success':
      return 'border-emerald-900/40 bg-emerald-950/20 text-emerald-100';
    default:
      return 'border-white/[0.07] bg-white/[0.04] text-slate-100';
  }
}

export default function InboxTicketDetail(props: InboxTicketDetailProps) {
  const ticket = props.ticket;
  const isEnglish = props.t('nav.docs') === 'Docs';
  const runsByPlaybook = new Map(props.playbookRuns.map((run) => [run.playbookId, run]));
  const macrosById = new Map(props.macros.map((macro) => [macro.macroId, macro]));

  return (
    <PanelCard
      eyebrow={props.t('dashboard.inbox.detail.eyebrow')}
      title={ticket.subject || ticket.categoryLabel}
      description={props.t('dashboard.inbox.detail.desc', { id: ticket.ticketId, user: ticket.userLabel ?? ticket.userId })}
      variant="highlight"
      stickyActions
      actions={(
        <InboxActionBar
          ticket={ticket}
          isMutating={props.isMutating}
          labels={{
            claim: props.t('dashboard.inbox.detail.actions.claim'),
            unclaim: props.t('dashboard.inbox.detail.actions.unclaim'),
            assignSelf: props.t('dashboard.inbox.detail.actions.assignSelf'),
            unassign: props.t('dashboard.inbox.detail.actions.unassign'),
          }}
          onAction={(action) => props.onAction(action)}
        />
      )}
    >
      <SectionMutationBanner mutation={props.mutation} syncStatus={props.syncStatus} />

      {props.actionFeedback && props.actionFeedback.ticketId === ticket.ticketId ? (
        <div className={`mt-5 ${getFeedbackClasses(props.actionFeedback.tone)}`} role={props.actionFeedback.tone === 'error' ? 'alert' : 'status'} aria-live="polite">
          {getFeedbackIcon(props.actionFeedback.tone)}
          <p className="text-sm leading-6">{props.actionFeedback.message}</p>
        </div>
      ) : null}

      {props.syncStatus?.bridgeStatus === 'degraded' || props.syncStatus?.bridgeStatus === 'error' ? (
        <div className="dashboard-action-note mt-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="text-sm leading-6" dangerouslySetInnerHTML={{ __html: props.t('dashboard.inbox.detail.bridgeWarning', { status: props.syncStatus.bridgeStatus }) }} />
        </div>
      ) : null}

      {props.recommendations.length ? (
        <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="dashboard-panel-label">{isEnglish ? 'Live playbooks' : 'Playbooks vivos'}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">
                {isEnglish ? 'Guided actions for this ticket' : 'Acciones guiadas para este ticket'}
              </h3>
            </div>
            <span className="dashboard-status-pill-compact dashboard-neutral-pill">{props.recommendations.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {props.recommendations.map((recommendation) => {
              const run = runsByPlaybook.get(recommendation.playbookId);
              const recommendationMeta = {
                recommendationId: recommendation.recommendationId,
                runId: run?.runId ?? null,
              };
              const macro = recommendation.suggestedMacroId ? macrosById.get(recommendation.suggestedMacroId) ?? null : null;
              const metadata = recommendation.metadata as Record<string, unknown> | null;
              const assistant = metadata?.assistant as Record<string, unknown> | undefined;
              const assistantReplyDraft = typeof assistant?.replyDraft === 'string' ? assistant.replyDraft : null;
              const assistantNextAction = typeof assistant?.nextAction === 'string' ? assistant.nextAction : null;

              const applyPrimaryAction = () => {
                if (recommendation.suggestedAction === 'post_macro' && recommendation.suggestedMacroId) {
                  props.onAction('post_macro', { macroId: recommendation.suggestedMacroId, ...recommendationMeta });
                  return;
                }
                if (recommendation.suggestedAction === 'set_status' && recommendation.suggestedStatus) {
                  props.onAction('set_status', { workflowStatus: recommendation.suggestedStatus, ...recommendationMeta });
                  return;
                }
                if (recommendation.suggestedAction === 'set_priority' && recommendation.suggestedPriority) {
                  props.onAction('set_priority', { priority: recommendation.suggestedPriority, ...recommendationMeta });
                  return;
                }
                props.onAction('confirm_recommendation', recommendationMeta);
              };

              const primaryLabel = (() => {
                if (recommendation.suggestedAction === 'post_macro' && macro) {
                  return isEnglish ? `Post macro: ${macro.label}` : `Publicar macro: ${macro.label}`;
                }
                if (recommendation.suggestedAction === 'set_status' && recommendation.suggestedStatus) {
                  return isEnglish
                    ? `Set status to ${getTicketStatusLabel(recommendation.suggestedStatus)}`
                    : `Cambiar estado a ${getTicketStatusLabel(recommendation.suggestedStatus)}`;
                }
                if (recommendation.suggestedAction === 'set_priority' && recommendation.suggestedPriority) {
                  return isEnglish
                    ? `Set priority to ${getPriorityLabel(recommendation.suggestedPriority, props.t)}`
                    : `Subir prioridad a ${getPriorityLabel(recommendation.suggestedPriority, props.t)}`;
                }
                return isEnglish ? 'Confirm recommendation' : 'Confirmar recomendacion';
              })();

              return (
                <article key={recommendation.recommendationId} className={`rounded-[1.35rem] border p-4 ${getRecommendationToneClass(recommendation.tone)}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{recommendation.title}</p>
                      <p className="mt-2 text-sm leading-6 text-current/85">{recommendation.summary}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-current/65">{recommendation.reason}</p>
                    </div>
                    <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                      {Math.round(recommendation.confidence * 100)}%
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={applyPrimaryAction}
                      disabled={props.isMutating}
                      className="dashboard-primary-button"
                    >
                      {primaryLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => props.onAction('confirm_recommendation', recommendationMeta)}
                      disabled={props.isMutating}
                      className="dashboard-secondary-button"
                    >
                      {isEnglish ? 'Confirm' : 'Confirmar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => props.onAction('dismiss_recommendation', recommendationMeta)}
                      disabled={props.isMutating}
                      className="dashboard-secondary-button"
                    >
                      {isEnglish ? 'Dismiss' : 'Descartar'}
                    </button>
                  </div>
                  {assistantReplyDraft ? (
                    <div className="mt-4 rounded-[1rem] border border-white/30 bg-white/20 p-3 text-sm">
                      <p className="font-semibold">{isEnglish ? 'Assistive draft reply' : 'Borrador asistido'}</p>
                      <p className="mt-2 leading-6 text-current/85">{assistantReplyDraft}</p>
                      {assistantNextAction ? (
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-current/65">
                          {assistantNextAction}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <div className="dashboard-grid-fit-standard">
            {[
              [props.t('dashboard.inbox.detail.attrs.status'), getTicketStatusLabel(ticket.workflowStatus), getStatusTone(ticket.workflowStatus), ticket.isOpen ? props.t('dashboard.inbox.detail.attrs.statusActive') : props.t('dashboard.inbox.detail.attrs.statusInactive')],
              [props.t('dashboard.inbox.detail.attrs.priority'), getPriorityLabel(ticket.priority, props.t), getPriorityTone(ticket.priority), props.t('dashboard.inbox.detail.attrs.priorityNote')],
              [props.t('dashboard.inbox.detail.attrs.sla'), getTicketSlaLabel(ticket.slaState), getSlaTone(ticket.slaState), props.t('dashboard.inbox.detail.attrs.slaNote', { time: formatMinutesLabel(ticket.slaTargetMinutes) })],
              [props.t('dashboard.inbox.detail.attrs.category'), ticket.categoryLabel, 'dashboard-neutral-pill', getTicketQueueLabel(ticket.queueType)],
            ].map(([label, value, tone, note]) => (
              <article key={label} className="dashboard-data-card min-w-0">
                <p className="dashboard-data-label">{label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`dashboard-status-pill ${tone}`}>{value}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{note}</p>
              </article>
            ))}
          </div>

          <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
            <div className="flex items-center gap-3">
              <CircleUserRound className="h-4 w-4 text-brand-500" />
              <div>
                <p className="dashboard-panel-label">{props.t('dashboard.inbox.detail.customer.eyebrow')}</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{props.t('dashboard.inbox.detail.customer.title')}</h3>
              </div>
            </div>
            <div className="dashboard-grid-fit-standard mt-5">
              {[
                [props.t('dashboard.inbox.detail.customer.user'), ticket.userLabel ?? ticket.userId],
                [props.t('dashboard.inbox.detail.customer.claimOwner'), ticket.claimedByLabel ?? props.t('dashboard.inbox.list.unclaimed')],
                [props.t('dashboard.inbox.detail.customer.assignee'), ticket.assigneeLabel ?? props.t('dashboard.inbox.list.unassigned')],
                [isEnglish ? 'Operational memory' : 'Memoria operativa', props.customerMemory?.summary ?? (isEnglish ? 'No customer memory yet.' : 'Aun no existe memoria operativa.')],
                [props.t('dashboard.inbox.detail.customer.firstResponse'), formatDateTime(ticket.firstResponseAt)],
                [props.t('dashboard.inbox.detail.customer.lastCustomer'), formatDateTime(ticket.lastCustomerMessageAt)],
                [props.t('dashboard.inbox.detail.customer.lastStaff'), formatDateTime(ticket.lastStaffMessageAt)],
                [props.t('dashboard.inbox.detail.customer.created'), formatDateTime(ticket.createdAt)],
                [props.t('dashboard.inbox.detail.customer.lastSync'), formatDateTime(ticket.updatedAt)],
              ].map(([label, value]) => (
                <div key={label} className="dashboard-data-card">
                  <p className="dashboard-data-label">{label}</p>
                  <p className="dashboard-data-value break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="dashboard-panel-label">{props.t('dashboard.inbox.detail.timeline.eyebrow')}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{props.t('dashboard.inbox.detail.timeline.title')}</h3>
              </div>
              <span className="dashboard-status-pill-compact dashboard-neutral-pill">{props.t('dashboard.inbox.detail.timeline.eventsCount', { count: props.timeline.length })}</span>
            </div>
            <div className="dashboard-scroll-panel mt-5 space-y-3">
              {props.timeline.length ? props.timeline.map((event) => (
                <article key={event.id} className="dashboard-data-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-white">{event.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{event.description}</p>
                    </div>
                    <span className="dashboard-status-pill-compact dashboard-neutral-pill">{getVisibilityLabel(event.visibility, props.t)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <span>{event.actorLabel ?? props.t('dashboard.inbox.detail.timeline.systemActor')}</span>
                    <span>|</span>
                    <span>{formatDateTime(event.createdAt)}</span>
                  </div>
                </article>
              )) : <div className="dashboard-empty-state">{props.t('dashboard.inbox.detail.timeline.empty')}</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
            <p className="dashboard-panel-label">{props.t('dashboard.inbox.detail.ops.eyebrow')}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{props.t('dashboard.inbox.detail.ops.statusTitle')}</h3>
            <div className="mt-5 space-y-4">
              <div className="grid gap-3">
                <label htmlFor="ticket-status-draft" className="text-sm font-medium text-slate-300">{props.t('dashboard.inbox.detail.ops.statusLabel')}</label>
                <select id="ticket-status-draft" value={props.statusDraft} onChange={(event) => props.onStatusDraftChange(event.target.value as TicketWorkflowStatus)} className="dashboard-form-field">
                  {props.workflowOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <button type="button" onClick={() => props.onAction('set_status', { workflowStatus: props.statusDraft })} disabled={props.isMutating || props.statusDraft === ticket.workflowStatus} className="dashboard-primary-button">
                  <Clock3 className="h-4 w-4" />
                  {props.t('dashboard.inbox.detail.ops.applyStatus')}
                </button>
              </div>

              <div className="grid gap-3">
                <label htmlFor="ticket-priority-draft" className="text-sm font-medium text-slate-300">{props.t('dashboard.inbox.detail.ops.priorityLabel')}</label>
                <select id="ticket-priority-draft" value={props.priorityDraft} onChange={(event) => props.onPriorityDraftChange(event.target.value as TicketInboxItem['priority'])} className="dashboard-form-field">
                  {props.priorityOptions.filter((option) => option.value !== 'all').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <button type="button" onClick={() => props.onAction('set_priority', { priority: props.priorityDraft })} disabled={props.isMutating || props.priorityDraft === ticket.priority} className="dashboard-secondary-button">{props.t('dashboard.inbox.detail.ops.updatePriority')}</button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => props.onAction('reopen')} disabled={props.isMutating || ticket.isOpen} className="dashboard-secondary-button">{props.t('dashboard.inbox.detail.ops.reopen')}</button>
                <button type="button" onClick={() => props.onAction('close', { reason: props.t('dashboard.inbox.detail.ops.closeReason') })} disabled={props.isMutating || !ticket.isOpen} className="dashboard-secondary-button">{props.t('dashboard.inbox.detail.ops.close')}</button>
              </div>
            </div>
          </div>

          <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
            <div className="flex items-center gap-3">
              <Tags className="h-4 w-4 text-brand-500" />
              <div>
                <p className="dashboard-panel-label">{props.t('dashboard.inbox.detail.ops.tagsEyebrow')}</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{props.t('dashboard.inbox.detail.ops.tagsTitle')}</h3>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {ticket.tags.length ? ticket.tags.map((tag) => (
                <button key={tag} type="button" onClick={() => props.onAction('remove_tag', { tag })} disabled={props.isMutating} className="dashboard-status-pill-compact dashboard-neutral-pill hover:border-rose-300 hover:text-rose-600" title={props.t('dashboard.inbox.detail.ops.removeTag', { tag })}>{tag}</button>
              )) : <span className="text-sm text-slate-400">{props.t('dashboard.inbox.detail.ops.noTags')}</span>}
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <input value={props.tagDraft} onChange={(event) => props.onTagDraftChange(event.target.value)} placeholder={props.t('dashboard.inbox.detail.ops.tagPlaceholder')} className="dashboard-form-field" />
              <button type="button" onClick={() => props.onAction('add_tag', { tag: props.tagDraft.trim() })} disabled={props.isMutating || !props.tagDraft.trim()} className="dashboard-primary-button">{props.t('dashboard.inbox.detail.ops.addTag')}</button>
            </div>
          </div>

          <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4 text-brand-500" />
              <div>
                <p className="dashboard-panel-label">{props.t('dashboard.inbox.detail.ops.noteEyebrow')}</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{props.t('dashboard.inbox.detail.ops.noteTitle')}</h3>
              </div>
            </div>
            <textarea value={props.noteDraft} onChange={(event) => props.onNoteDraftChange(event.target.value)} rows={5} placeholder={props.t('dashboard.inbox.detail.ops.notePlaceholder')} className="dashboard-form-field mt-4" />
            <p className="mt-3 text-xs text-slate-400">{props.t('dashboard.inbox.detail.ops.shortcutHint')}</p>
            <button type="button" onClick={() => props.onAction('add_note', { note: props.noteDraft.trim() })} disabled={props.isMutating || !props.noteDraft.trim()} className="dashboard-primary-button mt-4">{props.t('dashboard.inbox.detail.ops.saveNote')}</button>
          </div>

          <InboxMacroPanel
            macros={props.macros}
            selectedMacroId={props.selectedMacroId}
            onSelectedMacroIdChange={props.onSelectedMacroIdChange}
            selectedMacro={props.selectedMacro}
            macroConfirmed={props.macroConfirmed}
            onMacroConfirmedChange={props.onMacroConfirmedChange}
            isMutating={props.isMutating}
            t={props.t}
            onPostMacro={() => props.onAction('post_macro', { macroId: props.selectedMacro?.macroId })}
          />

          <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-4 w-4 text-brand-500" />
              <div>
                <p className="dashboard-panel-label">{props.t('dashboard.inbox.detail.ops.replyEyebrow')}</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{props.t('dashboard.inbox.detail.ops.replyTitle')}</h3>
              </div>
            </div>
            <textarea value={props.replyDraft} onChange={(event) => props.onReplyDraftChange(event.target.value)} rows={5} placeholder={props.t('dashboard.inbox.detail.ops.replyPlaceholder')} className="dashboard-form-field mt-4" />
            <p className="mt-3 text-xs text-slate-400">{props.t('dashboard.inbox.detail.ops.shortcutHint')}</p>
            <button type="button" onClick={() => props.onAction('reply_customer', { message: props.replyDraft.trim() })} disabled={props.isMutating || !props.replyDraft.trim()} className="dashboard-primary-button mt-4">
              <Send className="h-4 w-4" />
              {props.t('dashboard.inbox.detail.ops.sendReply')}
            </button>
          </div>

          <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
            <p className="dashboard-panel-label">{props.t('dashboard.inbox.detail.history.eyebrow')}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{props.t('dashboard.inbox.detail.history.title')}</h3>
            {props.customerProfile ? (
              <>
                <div className="dashboard-grid-fit-standard mt-4">
                  <div className="dashboard-data-card">
                    <p className="dashboard-data-label">{props.t('dashboard.inbox.detail.history.client')}</p>
                    <p className="dashboard-data-value">{props.customerProfile.displayLabel}</p>
                  </div>
                  <div className="dashboard-data-card">
                    <p className="dashboard-data-label">{props.t('dashboard.inbox.detail.history.lastTicket')}</p>
                    <p className="dashboard-data-value">{formatDateTime(props.customerProfile.lastTicketAt)}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="dashboard-status-pill-compact dashboard-neutral-pill">{props.t('dashboard.inbox.detail.history.openCount', { count: props.customerProfile.openTickets })}</span>
                  <span className="dashboard-status-pill-compact dashboard-neutral-pill">{props.t('dashboard.inbox.detail.history.closedCount', { count: props.customerProfile.closedTickets })}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {props.customerProfile.recentTickets.map((recentTicket) => {
                    const isCurrent = recentTicket.ticketId === ticket.ticketId;
                    return (
                      <button key={recentTicket.ticketId} type="button" onClick={() => props.onSelectTicket(recentTicket.ticketId)} disabled={isCurrent} className="dashboard-data-card w-full text-left disabled:cursor-default disabled:opacity-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-white">#{recentTicket.ticketId}</p>
                            <p className="mt-2 break-words text-sm text-slate-300">{recentTicket.subject || recentTicket.categoryLabel}</p>
                          </div>
                          <span className={`dashboard-status-pill-compact ${getStatusTone(recentTicket.workflowStatus)}`}>{getTicketStatusLabel(recentTicket.workflowStatus)}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                          <span>{formatDateTime(recentTicket.createdAt)}</span>
                          {isCurrent ? <span>{props.t('dashboard.inbox.detail.history.currentTicket')}</span> : <span>{props.t('dashboard.inbox.detail.history.openDetail')}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : <div className="dashboard-empty-state mt-4">{props.t('dashboard.inbox.detail.history.empty')}</div>}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}
