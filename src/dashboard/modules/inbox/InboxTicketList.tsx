import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import type { TicketInboxItem } from '../../types';
import { formatRelativeTime, getTicketQueueLabel, getTicketSlaLabel, getTicketStatusLabel } from '../../utils';
import { fadeInVariants } from '../../motion';
import { getPriorityLabel, getPriorityTone, getSlaTone, getStatusTone } from './inboxHelpers';
import type { T } from './inboxTypes';

interface InboxTicketListProps {
  tickets: TicketInboxItem[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  t: T;
}

export default function InboxTicketList({ tickets, selectedTicketId, onSelectTicket, t }: InboxTicketListProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: tickets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 172,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="dashboard-scroll-panel h-[34rem]" tabIndex={0} aria-label={t('dashboard.inbox.list.title')}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const ticket = tickets[virtualRow.index];
          const active = selectedTicketId === ticket.ticketId;

          return (
            <motion.button
              key={ticket.ticketId}
              type="button"
              variants={fadeInVariants}
              initial="hidden"
              animate="show"
              onClick={() => onSelectTicket(ticket.ticketId)}
              aria-pressed={active}
              className={`absolute left-0 top-0 w-full rounded-[1.55rem] border p-4 text-left ${active ? 'border-brand-700/60 bg-brand-950/18 shadow-[0_18px_40px_rgba(88,101,242,0.12)]' : 'dashboard-data-card hover:border-brand-800'}`}
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500">{t('dashboard.inbox.list.ticketPrefix', { id: ticket.ticketId })}</p>
                  <p className="mt-2 break-words text-lg font-semibold text-white">{ticket.subject || ticket.categoryLabel}</p>
                  <p className="mt-2 break-words text-sm text-slate-300">{ticket.userLabel ?? ticket.userId}</p>
                </div>
                <div className="flex min-w-[7rem] flex-col items-end gap-2">
                  <span className={`dashboard-status-pill ${getStatusTone(ticket.workflowStatus)}`}>{getTicketStatusLabel(ticket.workflowStatus)}</span>
                  <span className={`dashboard-status-pill ${getSlaTone(ticket.slaState)}`}>{getTicketSlaLabel(ticket.slaState)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="dashboard-status-pill-compact dashboard-neutral-pill">{getTicketQueueLabel(ticket.queueType)}</span>
                <span className={`dashboard-status-pill-compact ${getPriorityTone(ticket.priority)}`}>{getPriorityLabel(ticket.priority, t)}</span>
                <span className="dashboard-status-pill-compact dashboard-neutral-pill">{ticket.claimedByLabel ?? t('dashboard.inbox.list.unclaimed')}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <span>{formatRelativeTime(ticket.lastActivityAt ?? ticket.updatedAt)}</span>
                <span>{ticket.tags.slice(0, 2).join(' · ') || t('dashboard.inbox.filters.all')}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
