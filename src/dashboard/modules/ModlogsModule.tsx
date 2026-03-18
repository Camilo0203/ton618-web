import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ShieldCheck } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { modlogSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  ModlogSettings,
} from '../types';
import { getChannelOptions } from '../utils';

type ModlogsModuleValues = z.infer<typeof modlogSettingsSchema>;

interface ModlogsModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: ModlogSettings) => Promise<void>;
}

export default function ModlogsModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: ModlogsModuleProps) {
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<ModlogsModuleValues>({
    resolver: zodResolver(modlogSettingsSchema) as never,
    defaultValues: config.modlogSettings,
  });

  useEffect(() => {
    reset(config.modlogSettings);
  }, [config.modlogSettings, reset]);

  const enabled = watch('enabled');

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Onboarding"
        title="Instala el bot para configurar modlogs"
        description="Los eventos de moderacion dependen de que el bot pueda escuchar acciones reales dentro del servidor."
        icon={ShieldCheck}
        tone="warning"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave(values);
      })}
      className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"
    >
      <PanelCard
        eyebrow="Modlogs"
        title="Canal de auditoria"
        description="Deja una bitacora clara de moderacion para que el equipo pueda revisar que paso y cuando paso."
        actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

        <div className="mt-8 space-y-5">
          <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
            <input type="checkbox" {...register('enabled')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-white">Modlogs activos</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">El bot escribira eventos de moderacion y cambios de miembros.</span>
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Canal</span>
            <select {...register('channelId')} disabled={!enabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
              <option value="">No configurado</option>
              {channelOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </PanelCard>

      <PanelCard title="Eventos registrados" description="Elige exactamente que acciones del servidor deben quedar guardadas en la bitacora.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['logBans', 'Baneos'],
            ['logUnbans', 'Desbaneos'],
            ['logKicks', 'Expulsiones'],
            ['logMessageDelete', 'Mensajes eliminados'],
            ['logMessageEdit', 'Mensajes editados'],
            ['logRoleAdd', 'Roles agregados'],
            ['logRoleRemove', 'Roles retirados'],
            ['logNickname', 'Cambios de nickname'],
            ['logJoins', 'Entradas'],
            ['logLeaves', 'Salidas'],
            ['logVoice', 'Eventos de voz'],
          ].map(([field, label]) => (
            <label key={field} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
              <input type="checkbox" {...register(field as keyof ModlogSettings)} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="block font-semibold text-slate-950 dark:text-white">{label}</span>
            </label>
          ))}
        </div>
      </PanelCard>
    </form>
  );
}
