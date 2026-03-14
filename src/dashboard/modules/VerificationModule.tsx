import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Shield } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { verificationSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  VerificationSettings,
} from '../types';
import { getChannelOptions, getRoleOptions } from '../utils';

type VerificationModuleValues = z.infer<typeof verificationSettingsSchema>;

interface VerificationModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: VerificationSettings) => Promise<void>;
}

export default function VerificationModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: VerificationModuleProps) {
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const roleOptions = getRoleOptions(inventory);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<VerificationModuleValues>({
    resolver: zodResolver(verificationSettingsSchema) as never,
    defaultValues: config.verificationSettings,
  });

  useEffect(() => {
    reset(config.verificationSettings);
  }, [config.verificationSettings, reset]);

  const enabled = watch('enabled');
  const mode = watch('mode');

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Onboarding"
        title="Instala el bot para administrar la verificacion"
        description="El panel de verificacion depende del inventario y de los handlers activos del bot dentro del servidor."
        icon={Shield}
        tone="warning"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave(values);
      })}
      className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
    >
      <PanelCard
        eyebrow="Verificacion"
        title="Flujo de acceso al servidor"
        description="Roles, panel visual y defensas de antiraid para el sistema de verificacion."
        actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 md:col-span-2 dark:border-surface-600 dark:bg-surface-700/70">
            <input type="checkbox" {...register('enabled')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-white">Sistema activo</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">Activa el panel y las reglas de acceso verificable.</span>
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Canal del panel</span>
            <select {...register('channelId')} disabled={!enabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
              <option value="">No configurado</option>
              {channelOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Canal de logs</span>
            <select {...register('logChannelId')} disabled={!enabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
              <option value="">No configurado</option>
              {channelOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Rol verificado</span>
            <select {...register('verifiedRoleId')} disabled={!enabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
              <option value="">No configurado</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Rol no verificado</span>
            <select {...register('unverifiedRoleId')} disabled={!enabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
              <option value="">No configurado</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Modo</span>
            <select {...register('mode')} disabled={!enabled} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:bg-surface-700">
              <option value="button">Boton</option>
              <option value="code">Codigo</option>
              <option value="question">Pregunta</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Autokick (horas)</span>
            <input type="number" min={0} max={168} {...register('kickUnverifiedHours', { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
        </div>
      </PanelCard>

      <PanelCard title="Panel visual y antiraid" description="Textos, color y reglas defensivas del sistema.">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Titulo</span>
            <input {...register('panelTitle')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Descripcion</span>
            <textarea {...register('panelDescription')} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Color HEX</span>
              <input {...register('panelColor')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
              {errors.panelColor ? <span className="mt-2 block text-sm text-rose-500">{errors.panelColor.message}</span> : null}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Imagen</span>
              <input {...register('panelImage')} placeholder="https://..." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
            </label>
          </div>
          {mode === 'question' ? (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Pregunta</span>
                <input {...register('question')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Respuesta esperada</span>
                <input {...register('questionAnswer')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
              </label>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
              <input type="checkbox" {...register('antiraidEnabled')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span>
                <span className="block font-semibold text-slate-950 dark:text-white">Antiraid</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">Controla joins anormales antes de verificar.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
              <input type="checkbox" {...register('dmOnVerify')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span>
                <span className="block font-semibold text-slate-950 dark:text-white">DM al verificar</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">Confirma por mensaje directo cuando alguien completa el proceso.</span>
              </span>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Joins umbral</span>
              <input type="number" min={3} max={50} {...register('antiraidJoins', { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Ventana (seg)</span>
              <input type="number" min={5} max={60} {...register('antiraidSeconds', { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Accion</span>
              <select {...register('antiraidAction')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700">
                <option value="pause">Pause</option>
                <option value="kick">Kick</option>
              </select>
            </label>
          </div>
        </div>
      </PanelCard>
    </form>
  );
}
