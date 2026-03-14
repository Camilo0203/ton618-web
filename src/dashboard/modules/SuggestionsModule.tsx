import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MessageSquareQuote } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { suggestionSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  SuggestionSettings,
} from '../types';
import { getChannelOptions } from '../utils';

type SuggestionsModuleValues = z.infer<typeof suggestionSettingsSchema>;

interface SuggestionsModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: SuggestionSettings) => Promise<void>;
}

export default function SuggestionsModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: SuggestionsModuleProps) {
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<SuggestionsModuleValues>({
    resolver: zodResolver(suggestionSettingsSchema) as never,
    defaultValues: config.suggestionSettings,
  });

  useEffect(() => {
    reset(config.suggestionSettings);
  }, [config.suggestionSettings, reset]);

  const enabled = watch('enabled');

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Onboarding"
        title="Instala el bot para gestionar sugerencias"
        description="Este modulo refleja el sistema real de sugerencias del bot y sus canales asociados."
        icon={MessageSquareQuote}
        tone="warning"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave(values);
      })}
      className="grid gap-6 xl:grid-cols-[1fr_1fr]"
    >
      <PanelCard
        eyebrow="Sugerencias"
        title="Canales y experiencia del usuario"
        description="Controla donde nacen, se revisan y se cierran las sugerencias."
        actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

        <div className="mt-8 space-y-5">
          <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
            <input type="checkbox" {...register('enabled')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-white">Activar sugerencias</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">Permite usar el flujo `/suggest` del bot.</span>
            </span>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              ['channelId', 'Canal base'],
              ['logChannelId', 'Canal logs'],
              ['approvedChannelId', 'Canal aprobadas'],
              ['rejectedChannelId', 'Canal rechazadas'],
            ].map(([field, label]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                <select {...register(field as keyof SuggestionSettings)} disabled={!enabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
                  <option value="">No configurado</option>
                  {channelOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Reglas de moderacion" description="Condiciones que afectan el flujo de sugerencias.">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Cooldown (min)</span>
            <input type="number" min={0} max={1440} {...register('cooldownMinutes', { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>

          {[
            ['dmOnResult', 'Enviar DM al resolver'],
            ['requireReason', 'Exigir razon para moderar'],
            ['anonymous', 'Modo anonimo'],
          ].map(([field, label]) => (
            <label key={field} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
              <input type="checkbox" {...register(field as keyof SuggestionSettings)} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="block font-semibold text-slate-950 dark:text-white">{label}</span>
            </label>
          ))}
        </div>
      </PanelCard>
    </form>
  );
}
