import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Layers3 } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { serverRolesChannelsSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  ServerRolesChannelsSettings,
} from '../types';
import { getChannelOptions, getRoleOptions } from '../utils';

type ServerRolesModuleValues = z.infer<typeof serverRolesChannelsSettingsSchema>;

interface ServerRolesModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: ServerRolesChannelsSettings) => Promise<void>;
}

function SelectField({
  label,
  registerName,
  options,
  register,
}: {
  label: string;
  registerName: keyof ServerRolesChannelsSettings;
  options: Array<{ value: string; label: string }>;
  register: ReturnType<typeof useForm<ServerRolesModuleValues>>['register'];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <select
        {...register(registerName)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700"
      >
        <option value="">No configurado</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ServerRolesModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: ServerRolesModuleProps) {
  const roleOptions = getRoleOptions(inventory);
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const voiceChannelOptions = getChannelOptions(inventory, ['voice']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ServerRolesModuleValues>({
    resolver: zodResolver(serverRolesChannelsSettingsSchema) as never,
    defaultValues: config.serverRolesChannelsSettings,
  });

  useEffect(() => {
    reset(config.serverRolesChannelsSettings);
  }, [config.serverRolesChannelsSettings, reset]);

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Onboarding"
        title="Instala el bot para publicar canales y roles en la dashboard"
        description="Este modulo usa inventario real del servidor. Cuando el bot este dentro, cargaremos canales, roles y paneles disponibles."
        icon={Layers3}
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
        eyebrow="Servidor y roles"
        title="Canales base"
        description="Define los canales que sostienen la operacion diaria del bot."
        actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <SelectField label="Canal dashboard" registerName="dashboardChannelId" options={channelOptions} register={register} />
          <SelectField label="Canal panel tickets" registerName="ticketPanelChannelId" options={channelOptions} register={register} />
          <SelectField label="Canal logs" registerName="logsChannelId" options={channelOptions} register={register} />
          <SelectField label="Canal transcripts" registerName="transcriptChannelId" options={channelOptions} register={register} />
          <SelectField label="Canal reporte semanal" registerName="weeklyReportChannelId" options={channelOptions} register={register} />
          <SelectField label="Canal live members" registerName="liveMembersChannelId" options={voiceChannelOptions} register={register} />
          <SelectField label="Canal live role" registerName="liveRoleChannelId" options={voiceChannelOptions} register={register} />
          <SelectField label="Rol live count" registerName="liveRoleId" options={roleOptions} register={register} />
        </div>
      </PanelCard>

      <PanelCard
        eyebrow="Accesos"
        title="Roles operativos"
        description="Roles que el bot usa para tickets, dashboards y restricciones."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField label="Rol staff" registerName="supportRoleId" options={roleOptions} register={register} />
          <SelectField label="Rol admin" registerName="adminRoleId" options={roleOptions} register={register} />
          <SelectField label="Rol minimo para tickets" registerName="verifyRoleId" options={roleOptions} register={register} />
        </div>

        <div className="mt-8 rounded-3xl border border-brand-200 bg-brand-50/70 p-4 text-sm text-brand-800 dark:border-brand-900/50 dark:bg-brand-950/20 dark:text-brand-200">
          Todos los selectores salen del inventario sincronizado por el bot. Si falta algo, revisa el heartbeat o vuelve a sincronizar el inventario.
        </div>
      </PanelCard>
    </form>
  );
}
