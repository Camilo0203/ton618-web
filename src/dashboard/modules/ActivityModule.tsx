import { Activity } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import StateCard from '../components/StateCard';
import type { DashboardGuild, GuildConfigMutation, GuildEvent } from '../types';
import { formatDateTime, summarizeMutationPayload } from '../utils';

interface ActivityModuleProps {
  guild: DashboardGuild;
  events: GuildEvent[];
  mutations: GuildConfigMutation[];
}

export default function ActivityModule({
  guild,
  events,
  mutations,
}: ActivityModuleProps) {
  if (!events.length && !mutations.length) {
    return (
      <StateCard
        eyebrow="Sin actividad"
        title="Todavia no hay auditoria reciente"
        description={guild.botInstalled
          ? 'Cuando solicites cambios, se apliquen mutaciones o se creen backups, aqui apareceran los eventos recientes.'
          : 'Invita el bot a este servidor y luego realiza la primera configuracion para construir la auditoria.'}
        icon={Activity}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <PanelCard
        eyebrow="Mutaciones"
        title="Cola de cambios"
        description="Solicitudes creadas desde la dashboard y su resultado final."
        variant="soft"
      >
        <div className="space-y-4">
          {mutations.length ? (
            mutations.map((mutation) => (
              <article key={mutation.id} className="dashboard-data-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-lg font-semibold text-slate-950 dark:text-white">
                      {mutation.section}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {summarizeMutationPayload(mutation.requestedPayload)}
                    </p>
                  </div>
                  <div className="dashboard-status-pill-compact border-slate-200/80 bg-white text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-300">
                    {mutation.status}
                  </div>
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">
                  Solicitud {formatDateTime(mutation.requestedAt)}
                </p>
                {mutation.errorMessage ? (
                  <p className="mt-2 text-sm text-rose-500">{mutation.errorMessage}</p>
                ) : null}
              </article>
            ))
          ) : (
            <div className="dashboard-empty-state">
              No hay mutaciones registradas todavia.
            </div>
          )}
        </div>
      </PanelCard>

      <PanelCard
        eyebrow="Eventos"
        title="Auditoria del panel y del bot"
        description="Eventos cronologicos publicados durante syncs, backups y confirmaciones."
        variant="soft"
      >
        <div className="space-y-4">
          {events.length ? (
            events.map((event) => (
              <article key={event.id} className="dashboard-data-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-lg font-semibold text-slate-950 dark:text-white">{event.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{event.description}</p>
                  </div>
                  <div className="dashboard-status-pill-compact border-slate-200/80 bg-white text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-slate-300">
                    {event.eventType}
                  </div>
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">{formatDateTime(event.createdAt)}</p>
              </article>
            ))
          ) : (
            <div className="dashboard-empty-state">
              Aun no hay eventos registrados por el bot o la dashboard.
            </div>
          )}
        </div>
      </PanelCard>
    </div>
  );
}
