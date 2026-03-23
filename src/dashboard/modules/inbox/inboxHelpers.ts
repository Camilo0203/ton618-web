import type { TicketDashboardActionId, TicketInboxItem, TicketMacro, TicketWorkflowStatus } from '../../types';
import type { T, ActionFeedbackTone, OpenStateFilter, PriorityFilter, SlaFilter, AssignmentFilter } from './inboxTypes';

export function getWorkflowOptions(t: T): Array<{ value: TicketWorkflowStatus; label: string }> {
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

export function getOpenStateOptions(t: T): Array<{ value: OpenStateFilter; label: string }> {
  return [
    { value: 'all', label: t('dashboard.inbox.filters.all') },
    { value: 'open', label: t('dashboard.inbox.filters.open') },
    { value: 'closed', label: t('dashboard.inbox.filters.closed') },
  ];
}

export function getPriorityOptions(t: T): Array<{ value: PriorityFilter; label: string }> {
  return [
    { value: 'all', label: t('dashboard.inbox.filters.all') },
    { value: 'urgent', label: t('dashboard.inbox.filters.urgent') },
    { value: 'high', label: t('dashboard.inbox.filters.high') },
    { value: 'normal', label: t('dashboard.inbox.filters.normal') },
    { value: 'low', label: t('dashboard.inbox.filters.low') },
  ];
}

export function getSlaOptions(t: T): Array<{ value: SlaFilter; label: string }> {
  return [
    { value: 'all', label: t('dashboard.inbox.filters.all') },
    { value: 'breached', label: t('dashboard.inbox.filters.breached') },
    { value: 'warning', label: t('dashboard.inbox.filters.warning') },
    { value: 'healthy', label: t('dashboard.inbox.filters.healthy') },
    { value: 'paused', label: t('dashboard.inbox.filters.paused') },
    { value: 'resolved', label: t('dashboard.inbox.filters.resolved') },
  ];
}

export function getAssignmentOptions(t: T): Array<{ value: AssignmentFilter; label: string }> {
  return [
    { value: 'all', label: t('dashboard.inbox.filters.allQueue') },
    { value: 'unclaimed', label: t('dashboard.inbox.filters.unclaimed') },
    { value: 'claimed', label: t('dashboard.inbox.filters.claimed') },
    { value: 'unassigned', label: t('dashboard.inbox.filters.unassigned') },
    { value: 'assigned', label: t('dashboard.inbox.filters.assigned') },
  ];
}

export function getStatusTone(status: TicketWorkflowStatus) {
  if (status === 'escalated') return 'border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200';
  if (status === 'resolved' || status === 'closed') return 'border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200';
  if (status === 'waiting_user') return 'border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-200';
  if (status === 'waiting_staff') return 'border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200';
  return 'dashboard-neutral-pill';
}

export function getSlaTone(state: TicketInboxItem['slaState']) {
  if (state === 'breached') return 'border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200';
  if (state === 'warning') return 'border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200';
  if (state === 'resolved') return 'border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200';
  if (state === 'paused') return 'border-slate-300/60 bg-slate-100 text-slate-700 dark:border-surface-600 dark:bg-surface-700 dark:text-slate-200';
  return 'border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-200';
}

export function getPriorityTone(priority: TicketInboxItem['priority']) {
  if (priority === 'urgent') return 'border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200';
  if (priority === 'high') return 'border-orange-300/60 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/20 dark:text-orange-200';
  if (priority === 'low') return 'border-slate-300/60 bg-slate-50 text-slate-700 dark:border-surface-600 dark:bg-surface-700 dark:text-slate-200';
  return 'border-indigo-300/60 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-200';
}

export function getPriorityLabel(priority: TicketInboxItem['priority'], t: T) {
  if (priority === 'urgent') return t('dashboard.inbox.filters.urgent');
  if (priority === 'high') return t('dashboard.inbox.filters.high');
  if (priority === 'low') return t('dashboard.inbox.filters.low');
  return t('dashboard.inbox.filters.normal');
}

export function getVisibilityLabel(visibility: string | null, t: T) {
  if (visibility === 'internal') return t('dashboard.inbox.visibility.internal');
  if (visibility === 'public') return t('dashboard.inbox.visibility.public');
  return t('dashboard.inbox.visibility.system');
}

export function priorityWeight(priority: TicketInboxItem['priority']) {
  if (priority === 'urgent') return 4;
  if (priority === 'high') return 3;
  if (priority === 'normal') return 2;
  return 1;
}

export function getActionLabel(action: TicketDashboardActionId, t: T) {
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
    case 'confirm_recommendation':
      return 'confirmar la recomendacion';
    case 'dismiss_recommendation':
      return 'descartar la recomendacion';
    default:
      return t('dashboard.inbox.actions.fallback');
  }
}

export function getFeedbackClasses(tone: ActionFeedbackTone) {
  if (tone === 'error') return 'dashboard-action-alert';
  if (tone === 'success') return 'dashboard-action-success';
  return 'dashboard-action-note';
}

export function getMacroVisibilityLabel(macro: TicketMacro, t: T) {
  return macro.visibility === 'internal' ? t('dashboard.inbox.detail.ops.macroInternal') : t('dashboard.inbox.detail.ops.macroPublic');
}
