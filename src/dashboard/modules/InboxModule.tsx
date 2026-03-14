import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, LifeBuoy, MessageSquareText, Send, ShieldAlert, Tags, UserRoundCheck } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { fadeInVariants, panelSwapVariants, staggerContainerVariants } from '../motion';
import type { DashboardGuild, GuildConfigMutation, GuildSyncStatus, TicketDashboardActionId, TicketInboxItem, TicketWorkspaceSnapshot, TicketWorkflowStatus } from '../types';
import { formatDateTime, formatMinutesLabel, formatRelativeTime, getCustomerProfileForTicket, getTicketEventsForTicket, getTicketQueueLabel, getTicketSlaLabel, getTicketStatusLabel, getTicketWorkspaceSummary } from '../utils';

interface InboxModuleProps {
  guild: DashboardGuild;
  workspace: TicketWorkspaceSnapshot;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isMutating: boolean;
  onAction: (action: TicketDashboardActionId, payload: Record<string, unknown>) => Promise<void>;
}

const workflowOptions: Array<{ value: TicketWorkflowStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'new', label: 'Nuevo' },
  { value: 'triage', label: 'Triage' },
  { value: 'waiting_staff', label: 'Esperando staff' },
  { value: 'waiting_user', label: 'Esperando usuario' },
  { value: 'escalated', label: 'Escalado' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'closed', label: 'Cerrado' },
];

const queueOptions = [
  { value: 'all', label: 'Todas las colas' },
  { value: 'support', label: 'Soporte premium' },
  { value: 'community', label: 'Comunidad' },
] as const;

const priorityOptions = [
  { value: 'all', label: 'Todas las prioridades' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'high', label: 'Alta' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Baja' },
] as const;

function getStatusTone(status: TicketWorkflowStatus) {
  if (status === 'escalated') return 'border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200';
  if (status === 'resolved' || status === 'closed') return 'border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200';
  if (status === 'waiting_user') return 'border-sky-300/60 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-200';
  if (status === 'waiting_staff') return 'border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200';
  return 'border-slate-300/60 bg-white text-slate-700 dark:border-surface-600 dark:bg-surface-700 dark:text-slate-200';
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

function getPriorityLabel(priority: TicketInboxItem['priority']) {
  if (priority === 'urgent') return 'Urgente';
  if (priority === 'high') return 'Alta';
  if (priority === 'low') return 'Baja';
  return 'Normal';
}

function getVisibilityLabel(visibility: string | null) {
  if (visibility === 'internal') return 'Interno';
  if (visibility === 'public') return 'Cliente';
  return 'Sistema';
}

function priorityWeight(priority: TicketInboxItem['priority']) {
  if (priority === 'urgent') return 4;
  if (priority === 'high') return 3;
  if (priority === 'normal') return 2;
  return 1;
}

export default function InboxModule({ guild, workspace, mutation, syncStatus, isMutating, onAction }: InboxModuleProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof workflowOptions)[number]['value']>('all');
  const [queueFilter, setQueueFilter] = useState<(typeof queueOptions)[number]['value']>('all');
  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityOptions)[number]['value']>('all');
  const [replyDraft, setReplyDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<TicketWorkflowStatus>('triage');
  const summary = useMemo(() => getTicketWorkspaceSummary(workspace.inbox), [workspace.inbox]);

  const filteredInbox = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workspace.inbox
      .filter((ticket) => (statusFilter === 'all' ? true : ticket.workflowStatus === statusFilter))
      .filter((ticket) => (queueFilter === 'all' ? true : ticket.queueType === queueFilter))
      .filter((ticket) => (priorityFilter === 'all' ? true : ticket.priority === priorityFilter))
      .filter((ticket) => (!query ? true : [ticket.ticketId, ticket.categoryLabel, ticket.subject ?? '', ticket.userLabel ?? '', ticket.userId].join(' ').toLowerCase().includes(query)))
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
  }, [priorityFilter, queueFilter, search, statusFilter, workspace.inbox]);

  useEffect(() => {
    if (!filteredInbox.length) {
      setSelectedTicketId(null);
      return;
    }
    if (!selectedTicketId || !filteredInbox.some((ticket) => ticket.ticketId === selectedTicketId)) {
      setSelectedTicketId(filteredInbox[0].ticketId);
    }
  }, [filteredInbox, selectedTicketId]);

  const selectedTicket = useMemo(() => filteredInbox.find((ticket) => ticket.ticketId === selectedTicketId) ?? null, [filteredInbox, selectedTicketId]);
  useEffect(() => {
    if (selectedTicket) setStatusDraft(selectedTicket.workflowStatus);
  }, [selectedTicket]);
  const timeline = useMemo(() => getTicketEventsForTicket(workspace.events, selectedTicket?.ticketId ?? null), [selectedTicket?.ticketId, workspace.events]);
  const customerProfile = useMemo(() => getCustomerProfileForTicket(workspace.inbox, selectedTicket), [selectedTicket, workspace.inbox]);

  async function runAction(action: TicketDashboardActionId, payload: Record<string, unknown> = {}) {
    if (!selectedTicket) return;
    await onAction(action, { ticketId: selectedTicket.ticketId, channelId: selectedTicket.channelId, ...payload });
    if (action === 'reply_customer' || action === 'post_macro') setReplyDraft('');
    if (action === 'add_note') setNoteDraft('');
    if (action === 'add_tag') setTagDraft('');
  }

  if (!guild.botInstalled) return <StateCard eyebrow="Instalacion" title="Instala el bot para activar la bandeja operativa" description="La bandeja viva depende del bridge del bot para publicar tickets, bitacora, macros y acciones auditadas." icon={LifeBuoy} tone="warning" />;
  if (!workspace.inbox.length) return <StateCard eyebrow="Sin tickets" title="Todavia no hay tickets para operar desde la dashboard" description="Cuando entren tickets reales en Discord, aqui veras la cola, su SLA, el historial del cliente y las acciones del staff." icon={LifeBuoy} />;

  return (
    <div className="space-y-6">
      <PanelCard eyebrow="Bandeja viva" title="Workspace operativa del helpdesk" description="Filtra la cola, reclama tickets, cambia estados, agrega notas internas y responde con macros o mensajes directos desde la web." variant="highlight">
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <motion.div variants={staggerContainerVariants} initial="hidden" animate="show" className="dashboard-grid-fit-standard mt-8">
          {[
            ['Abiertos', `${summary.open}`, 'Tickets listos para operar ahora.'],
            ['Sin reclamar', `${summary.unclaimed}`, 'Casos que aun no tienen responsable.'],
            ['SLA incumplido', `${summary.breached}`, 'Casos que necesitan atencion urgente.'],
            ['Soporte premium', `${summary.queues.support}`, 'Cola principal de soporte y pagos.'],
            ['Comunidad', `${summary.queues.community}`, 'Reportes, asociaciones y staff apps.'],
          ].map(([label, value, note]) => (
            <motion.article key={label} variants={fadeInVariants} className="dashboard-kpi-card min-w-0">
              <p className="dashboard-data-label">{label}</p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-950 dark:text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{note}</p>
            </motion.article>
          ))}
        </motion.div>
      </PanelCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
        <PanelCard eyebrow="Cola" title="Bandeja priorizada" description="Ordenada por SLA, prioridad y actividad reciente." variant="soft">
          <div className="dashboard-grid-fit-standard">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por ticket, cliente o categoria" className="dashboard-form-field" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof workflowOptions)[number]['value'])} className="dashboard-form-field">
              {workflowOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select value={queueFilter} onChange={(event) => setQueueFilter(event.target.value as (typeof queueOptions)[number]['value'])} className="dashboard-form-field">
              {queueOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as (typeof priorityOptions)[number]['value'])} className="dashboard-form-field">
              {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <motion.div variants={staggerContainerVariants} initial="hidden" animate="show" className="dashboard-scroll-panel mt-6 space-y-3">
            {filteredInbox.map((ticket) => {
              const active = selectedTicket?.ticketId === ticket.ticketId;
              return (
                <motion.button key={ticket.ticketId} type="button" variants={fadeInVariants} whileHover={{ y: -2 }} onClick={() => setSelectedTicketId(ticket.ticketId)} className={`dashboard-interactive-card w-full rounded-[1.55rem] border p-4 text-left ${active ? 'border-brand-300/55 bg-[linear-gradient(135deg,rgba(88,101,242,0.12),rgba(20,184,166,0.06))] shadow-[0_18px_40px_rgba(88,101,242,0.12)] dark:border-brand-700/60 dark:bg-brand-950/18' : 'border-slate-200/90 bg-white/80 hover:border-brand-200 hover:bg-white dark:border-surface-600 dark:bg-surface-700/70 dark:hover:border-brand-800'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500">Ticket #{ticket.ticketId}</p>
                      <p className="mt-2 break-words text-lg font-semibold text-slate-950 dark:text-white">{ticket.subject || ticket.categoryLabel}</p>
                      <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-300">{ticket.userLabel ?? ticket.userId}</p>
                    </div>
                    <div className="flex min-w-[7rem] flex-col items-end gap-2">
                      <span className={`dashboard-status-pill ${getStatusTone(ticket.workflowStatus)}`}>{getTicketStatusLabel(ticket.workflowStatus)}</span>
                      <span className={`dashboard-status-pill ${getSlaTone(ticket.slaState)}`}>{getTicketSlaLabel(ticket.slaState)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="dashboard-status-pill-compact border-slate-200/80 bg-white/80 text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-200">{getTicketQueueLabel(ticket.queueType)}</span>
                    <span className={`dashboard-status-pill-compact ${getPriorityTone(ticket.priority)}`}>Prioridad {getPriorityLabel(ticket.priority)}</span>
                    <span className="dashboard-status-pill-compact border-slate-200/80 bg-white/80 text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-200">{ticket.claimedBy ? 'Reclamado' : 'Libre'}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Ultima actividad {formatRelativeTime(ticket.lastActivityAt ?? ticket.updatedAt)}</p>
                </motion.button>
              );
            })}
          </motion.div>
        </PanelCard>

        {!selectedTicket ? (
          <StateCard eyebrow="Seleccion" title="Elige un ticket para trabajar" description="La columna derecha mostrara la ficha operativa, la bitacora, el historial del cliente y las macros de respuesta." icon={LifeBuoy} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selectedTicket.ticketId} variants={panelSwapVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
              <PanelCard eyebrow="Ficha del ticket" title={`#${selectedTicket.ticketId} - ${selectedTicket.categoryLabel}`} description={selectedTicket.subject || 'Ticket sin asunto explicito'} variant="highlight" stickyActions actions={
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => runAction('claim')} disabled={isMutating || Boolean(selectedTicket.claimedBy)} className="dashboard-primary-button"><UserRoundCheck className="h-4 w-4" />Reclamar</button>
                  <button type="button" onClick={() => runAction('assign_self')} disabled={isMutating} className="dashboard-secondary-button">Asignarme</button>
                  <button type="button" onClick={() => runAction('unclaim')} disabled={isMutating || !selectedTicket.claimedBy} className="dashboard-secondary-button">Liberar</button>
                </div>
              }>
                <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
                <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-5">
                    <div className="dashboard-grid-fit-standard">
                      {[
                        ['Estado', getTicketStatusLabel(selectedTicket.workflowStatus), getStatusTone(selectedTicket.workflowStatus), selectedTicket.isOpen ? 'Caso abierto y operativo.' : 'Caso fuera de la cola activa.'],
                        ['SLA', getTicketSlaLabel(selectedTicket.slaState), getSlaTone(selectedTicket.slaState), `Objetivo ${formatMinutesLabel(selectedTicket.slaTargetMinutes)}`],
                        ['Cola', getTicketQueueLabel(selectedTicket.queueType), 'border-slate-200/80 bg-white text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-200', 'Carril operativo asignado a este ticket.'],
                        ['Prioridad', getPriorityLabel(selectedTicket.priority), getPriorityTone(selectedTicket.priority), 'Nivel de atencion esperado para el caso.'],
                      ].map(([label, value, tone, note]) => (
                        <article key={label} className="dashboard-data-card min-w-0">
                          <p className="dashboard-data-label">{label}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`dashboard-status-pill ${tone}`}>{value}</span>
                          </div>
                          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{note}</p>
                        </article>
                      ))}
                    </div>

                    <div className="dashboard-grid-fit-standard">
                      {[
                        ['Cliente', selectedTicket.userLabel ?? selectedTicket.userId],
                        ['Reclamado por', selectedTicket.claimedByLabel ?? 'Disponible'],
                        ['Asignado a', selectedTicket.assigneeLabel ?? 'Sin asignar'],
                        ['Tiempo SLA', formatMinutesLabel(selectedTicket.slaTargetMinutes)],
                        ['Primer respuesta', formatDateTime(selectedTicket.firstResponseAt)],
                        ['Ultimo cliente', formatDateTime(selectedTicket.lastCustomerMessageAt)],
                        ['Ultimo staff', formatDateTime(selectedTicket.lastStaffMessageAt)],
                        ['Ultima sync', formatDateTime(selectedTicket.updatedAt)],
                      ].map(([label, value]) => (
                        <div key={label} className="dashboard-data-card">
                          <p className="dashboard-data-label">{label}</p>
                          <p className="dashboard-data-value">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <p className="dashboard-panel-label">Flujo operativo</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Cambiar estado del ticket</h3>
                      <div className="dashboard-grid-fit-standard mt-5 items-start">
                        <select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as TicketWorkflowStatus)} className="dashboard-form-field">
                          {workflowOptions.filter((option) => option.value !== 'all').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                        <button type="button" onClick={() => runAction('set_status', { workflowStatus: statusDraft })} disabled={isMutating} className="dashboard-primary-button"><Clock3 className="h-4 w-4" />Aplicar estado</button>
                        <button type="button" onClick={() => runAction('reopen')} disabled={isMutating || selectedTicket.isOpen} className="dashboard-secondary-button">Reabrir</button>
                        <button type="button" onClick={() => runAction('close', { reason: 'Cerrado desde la dashboard' })} disabled={isMutating || !selectedTicket.isOpen} className="dashboard-secondary-button">Cerrar</button>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                        <div className="flex items-center gap-3">
                          <Tags className="h-4 w-4 text-brand-500" />
                          <p className="text-lg font-semibold text-slate-950 dark:text-white">Tags</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedTicket.tags.length ? selectedTicket.tags.map((tag) => (
                            <button key={tag} type="button" onClick={() => runAction('remove_tag', { tag })} disabled={isMutating} className="dashboard-status-pill-compact border-slate-200/80 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-600 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-200">{tag}</button>
                          )) : <span className="text-sm text-slate-500 dark:text-slate-400">Sin tags todavia.</span>}
                        </div>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <input value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} placeholder="Ej. vip, pago, bug" className="dashboard-form-field" />
                          <button type="button" onClick={() => runAction('add_tag', { tag: tagDraft.trim() })} disabled={isMutating || !tagDraft.trim()} className="dashboard-primary-button">Agregar</button>
                        </div>
                      </div>

                      <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                        <div className="flex items-center gap-3">
                          <ShieldAlert className="h-4 w-4 text-brand-500" />
                          <p className="text-lg font-semibold text-slate-950 dark:text-white">Nota interna</p>
                        </div>
                        <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={4} placeholder="Contexto interno, handoff o detalle que no debe ir al cliente." className="dashboard-form-field mt-4" />
                        <button type="button" onClick={() => runAction('add_note', { note: noteDraft.trim() })} disabled={isMutating || !noteDraft.trim()} className="dashboard-primary-button mt-4">Guardar nota</button>
                      </div>
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <div className="flex items-center gap-3">
                        <MessageSquareText className="h-4 w-4 text-brand-500" />
                        <p className="text-lg font-semibold text-slate-950 dark:text-white">Responder al cliente</p>
                      </div>
                      <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} rows={5} placeholder="Escribe una respuesta operativa; el bot la publicara en el canal del ticket." className="dashboard-form-field mt-4" />
                      <div className="mt-4 flex flex-wrap gap-2">
                        {workspace.macros.length ? workspace.macros.map((macro) => (
                          <button key={macro.macroId} type="button" onClick={() => runAction('post_macro', { macroId: macro.macroId })} disabled={isMutating} className="dashboard-secondary-button">{macro.label}</button>
                        )) : <span className="text-sm text-slate-500 dark:text-slate-400">No hay macros configuradas para este guild.</span>}
                      </div>
                      <button type="button" onClick={() => runAction('reply_customer', { message: replyDraft.trim() })} disabled={isMutating || !replyDraft.trim()} className="dashboard-primary-button mt-4"><Send className="h-4 w-4" />Enviar respuesta</button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <p className="dashboard-panel-label">Historial del cliente</p>
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
                            <span className="dashboard-status-pill-compact border-slate-200/80 bg-white text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-200">{customerProfile.openTickets} abiertos</span>
                            <span className="dashboard-status-pill-compact border-slate-200/80 bg-white text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-200">{customerProfile.closedTickets} cerrados</span>
                          </div>
                          <div className="mt-5 space-y-3">
                            {customerProfile.recentTickets.map((ticket) => (
                              <article key={ticket.ticketId} className="dashboard-data-card">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-950 dark:text-white">#{ticket.ticketId}</p>
                                    <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-300">{ticket.categoryLabel}</p>
                                  </div>
                                  <span className={`dashboard-status-pill-compact ${getStatusTone(ticket.workflowStatus)}`}>{getTicketStatusLabel(ticket.workflowStatus)}</span>
                                </div>
                                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{formatDateTime(ticket.createdAt)}</p>
                              </article>
                            ))}
                          </div>
                        </>
                      ) : <div className="dashboard-empty-state mt-4">Aun no tenemos historial suficiente para este cliente.</div>}
                    </div>

                    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
                      <p className="dashboard-panel-label">Bitacora</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Bitacora del ticket</h3>
                      <div className="dashboard-scroll-panel mt-5 space-y-3">
                        {timeline.length ? timeline.map((event) => (
                          <article key={event.id} className="dashboard-data-card">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words font-semibold text-slate-950 dark:text-white">{event.title}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.description}</p>
                              </div>
                              <span className="dashboard-status-pill-compact border-slate-200/80 bg-white text-slate-700 dark:border-surface-600 dark:bg-surface-700 dark:text-slate-200">{getVisibilityLabel(event.visibility)}</span>
                            </div>
                            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{event.actorLabel ? `${event.actorLabel} - ` : ''}{formatDateTime(event.createdAt)}</p>
                          </article>
                        )) : <div className="dashboard-empty-state">Este ticket aun no tiene eventos sincronizados en la bitacora.</div>}
                      </div>
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
