import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Ticket } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { ticketsSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  TicketsSettings,
} from '../types';
import { getCategoryOptions, getChannelOptions, getRoleOptions } from '../utils';

type TicketsModuleValues = z.infer<typeof ticketsSettingsSchema>;

interface TicketsModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: TicketsSettings) => Promise<void>;
}

const priorityLabels = [
  ['low', 'Baja'],
  ['normal', 'Normal'],
  ['high', 'Alta'],
  ['urgent', 'Urgente'],
] as const;

export default function TicketsModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: TicketsModuleProps) {
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const roleOptions = getRoleOptions(inventory);
  const categoryOptions = getCategoryOptions(inventory);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<TicketsModuleValues>({
    resolver: zodResolver(ticketsSettingsSchema) as never,
    defaultValues: config.ticketsSettings,
  });

  useEffect(() => {
    reset(config.ticketsSettings);
  }, [config.ticketsSettings, reset]);

  const slaEscalationEnabled = watch('slaEscalationEnabled');
  const dailySlaReportEnabled = watch('dailySlaReportEnabled');
  const incidentPausedCategories = watch('incidentPausedCategories');
  const slaOverridesPriority = watch('slaOverridesPriority');

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Onboarding"
        title="Instala el bot para activar configuracion de tickets"
        description="En cuanto el bot este dentro podremos aplicar limites, SLA, autoasignacion y modo incidente al flujo real de tickets."
        icon={Ticket}
        tone="warning"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave(values);
      })}
      className="space-y-6"
    >
      <PanelCard
        eyebrow="Tickets y SLA"
        title="Operacion del sistema de tickets"
        description="Limites, tiempos, SLA y comportamientos automaticos sobre el flujo real del bot."
        actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['maxTickets', 'Max tickets por usuario', 1, 10],
            ['globalTicketLimit', 'Limite global', 0, 500],
            ['cooldownMinutes', 'Cooldown (min)', 0, 1440],
            ['minDays', 'Minimo dias en servidor', 0, 365],
            ['autoCloseMinutes', 'Auto close (min)', 0, 10080],
            ['slaMinutes', 'SLA alerta (min)', 0, 1440],
            ['smartPingMinutes', 'Smart ping (min)', 0, 1440],
            ['slaEscalationMinutes', 'Escalado SLA (min)', 0, 10080],
          ].map(([field, label, min, max]) => (
            <label key={field} className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                {label}
              </span>
              <input
                type="number"
                min={Number(min)}
                max={Number(max)}
                {...register(field as keyof TicketsSettings, { valueAsNumber: true })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700"
              />
            </label>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['autoAssignEnabled', 'Autoasignacion'],
            ['autoAssignRequireOnline', 'Solo online'],
            ['autoAssignRespectAway', 'Respeta ausentes'],
            ['dailySlaReportEnabled', 'Reporte diario SLA'],
            ['incidentModeEnabled', 'Modo incidente'],
            ['dmOnOpen', 'DM al abrir'],
            ['dmOnClose', 'DM al cerrar'],
            ['dmTranscripts', 'Enviar transcripts'],
            ['dmAlerts', 'DM alertas'],
            ['slaEscalationEnabled', 'Escalado automatico'],
          ].map(([field, label]) => (
            <label
              key={field}
              className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70"
            >
              <input
                type="checkbox"
                {...register(field as keyof TicketsSettings)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                <span className="block font-semibold text-slate-950 dark:text-white">{label}</span>
              </span>
            </label>
          ))}
        </div>
      </PanelCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <PanelCard title="Escalado y reportes" description="Roles y canales usados por las alertas del sistema.">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Rol escalado
              </span>
              <select
                {...register('slaEscalationRoleId')}
                disabled={!slaEscalationEnabled}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700"
              >
                <option value="">No configurado</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Canal escalado
              </span>
              <select
                {...register('slaEscalationChannelId')}
                disabled={!slaEscalationEnabled}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700"
              >
                <option value="">No configurado</option>
                {channelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Canal reporte diario
              </span>
              <select
                {...register('dailySlaReportChannelId')}
                disabled={!dailySlaReportEnabled}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700"
              >
                <option value="">Usar fallback del bot</option>
                {channelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Mensaje modo incidente
              </span>
              <textarea
                {...register('incidentMessage')}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700"
              />
            </label>
          </div>
        </PanelCard>

        <PanelCard title="Reglas avanzadas" description="Overrides por prioridad y categoria del sistema de tickets.">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Overrides SLA por prioridad</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {priorityLabels.map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">{label}</span>
                    <input
                      type="number"
                      min={0}
                      max={10080}
                      value={slaOverridesPriority[key] ?? 0}
                      onChange={(event) => {
                        const next = { ...watch('slaOverridesPriority') };
                        const value = Number(event.target.value) || 0;
                        if (value > 0) next[key] = value;
                        else delete next[key];
                        setValue('slaOverridesPriority', next, { shouldDirty: true });
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Categorias pausadas en incidente</p>
              <div className="mt-3 grid gap-3">
                {categoryOptions.length ? (
                  categoryOptions.map((category) => {
                    const checked = incidentPausedCategories.includes(category.value);
                    return (
                      <label
                        key={category.value}
                        className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            const next = new Set(watch('incidentPausedCategories'));
                            if (event.target.checked) next.add(category.value);
                            else next.delete(category.value);
                            setValue('incidentPausedCategories', Array.from(next), { shouldDirty: true });
                          }}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span>
                          <span className="block font-semibold text-slate-950 dark:text-white">{category.label}</span>
                          {category.description ? (
                            <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                              {category.description}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500 dark:border-surface-600 dark:bg-surface-700/40 dark:text-slate-400">
                    El inventario todavia no ha publicado categorias de tickets configurables.
                  </div>
                )}
              </div>
            </div>
          </div>
        </PanelCard>
      </div>
    </form>
  );
}
