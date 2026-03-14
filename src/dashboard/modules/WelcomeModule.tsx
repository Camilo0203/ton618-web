import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { welcomeSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  WelcomeSettings,
} from '../types';
import { getChannelOptions, getRoleOptions } from '../utils';

type WelcomeModuleValues = z.infer<typeof welcomeSettingsSchema>;

interface WelcomeModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: WelcomeSettings) => Promise<void>;
}

export default function WelcomeModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: WelcomeModuleProps) {
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const roleOptions = getRoleOptions(inventory);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<WelcomeModuleValues>({
    resolver: zodResolver(welcomeSettingsSchema) as never,
    defaultValues: config.welcomeSettings,
  });

  useEffect(() => {
    reset(config.welcomeSettings);
  }, [config.welcomeSettings, reset]);

  const welcomeEnabled = watch('welcomeEnabled');
  const goodbyeEnabled = watch('goodbyeEnabled');

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Onboarding"
        title="Instala el bot para editar bienvenida y despedida"
        description="Estos mensajes se aplican en eventos reales de miembros. El bot necesita estar dentro del servidor para ejecutarlos."
        icon={Sparkles}
        tone="warning"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave(values);
      })}
      className="grid gap-6 xl:grid-cols-2"
    >
      <PanelCard
        eyebrow="Bienvenida"
        title="Bienvenida"
        description="Mensajes de entrada, DM de onboarding y autoroles."
        actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

        <div className="mt-8 space-y-5">
          <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
            <input type="checkbox" {...register('welcomeEnabled')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-white">Activar bienvenida</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">Publica embeds de bienvenida y opcionalmente DM al usuario.</span>
            </span>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Canal bienvenida</span>
              <select {...register('welcomeChannelId')} disabled={!welcomeEnabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
                <option value="">No configurado</option>
                {channelOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Autorole</span>
              <select {...register('welcomeAutoroleId')} disabled={!welcomeEnabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
                <option value="">No configurado</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Titulo</span>
            <input {...register('welcomeTitle')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Mensaje</span>
            <textarea {...register('welcomeMessage')} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Color HEX</span>
              <input {...register('welcomeColor')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
              {errors.welcomeColor ? <span className="mt-2 block text-sm text-rose-500">{errors.welcomeColor.message}</span> : null}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Banner</span>
              <input {...register('welcomeBanner')} placeholder="https://..." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Footer</span>
            <input {...register('welcomeFooter')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
              <input type="checkbox" {...register('welcomeThumbnail')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="block font-semibold text-slate-950 dark:text-white">Mostrar thumbnail</span>
            </label>
            <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
              <input type="checkbox" {...register('welcomeDm')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="block font-semibold text-slate-950 dark:text-white">Enviar DM</span>
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Mensaje DM</span>
            <textarea {...register('welcomeDmMessage')} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
        </div>
      </PanelCard>

      <PanelCard title="Despedida" description="Mensajes cuando un usuario abandona el servidor.">
        <div className="space-y-5">
          <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
            <input type="checkbox" {...register('goodbyeEnabled')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-white">Activar despedida</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">Publica embed cuando un miembro sale del servidor.</span>
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Canal despedida</span>
            <select {...register('goodbyeChannelId')} disabled={!goodbyeEnabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
              <option value="">No configurado</option>
              {channelOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Titulo</span>
            <input {...register('goodbyeTitle')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Mensaje</span>
            <textarea {...register('goodbyeMessage')} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Color HEX</span>
              <input {...register('goodbyeColor')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
            </label>
            <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
              <input type="checkbox" {...register('goodbyeThumbnail')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="block font-semibold text-slate-950 dark:text-white">Mostrar thumbnail</span>
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Footer</span>
            <input {...register('goodbyeFooter')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
        </div>
      </PanelCard>
    </form>
  );
}
