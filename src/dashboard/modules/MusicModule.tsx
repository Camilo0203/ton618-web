import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Music2 } from 'lucide-react';
import {
  ConfigFormActions,
  FieldShell,
  InventoryNotice,
  ToggleCard,
  ValidationSummary,
} from '../components/ConfigForm';
import DashboardSelect from '../components/DashboardSelect';
import PanelCard from '../components/PanelCard';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { musicSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  MusicSettings,
} from '../types';
import { getRoleOptions } from '../utils';
import { flattenFormErrors, getInventoryState } from '../validation';

type MusicModuleValues = z.infer<typeof musicSettingsSchema>;

interface MusicModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: MusicSettings) => Promise<void>;
}

const copy = {
  es: {
    onboardingTitle: 'Instala TON618 para activar música',
    onboardingDesc: 'La configuración se puede preparar aquí, pero el bot debe estar en el servidor para aplicarla.',
    eyebrow: 'Música',
    title: 'Reproductor del servidor',
    desc: 'Configura límites FREE/PRO, Spotify, playlists, filtros y comportamiento automático del reproductor.',
    save: 'Guardar música',
    emptyTitle: 'No pude leer roles del servidor',
    emptyMessage: 'Puedes guardar el resto de opciones; vuelve a sincronizar el dashboard para elegir un rol DJ.',
    enable: 'Activar módulo de música',
    enableDesc: 'Permite usar los comandos de música integrados en TON618.',
    djRole: 'Rol DJ opcional',
    djRoleHint: 'Si eliges un rol, podrás usarlo para dar control avanzado del reproductor.',
    noRole: 'Sin rol DJ',
    playback: 'Reproducción',
    volume: 'Volumen por defecto',
    freeQueue: 'Cola máxima FREE',
    proQueue: 'Cola máxima PRO',
    freeDuration: 'Duración máxima FREE (min)',
    proDuration: 'Duración máxima PRO (min)',
    features: 'Funciones',
    spotify: 'Permitir Spotify',
    playlists: 'Permitir playlists',
    filters: 'Permitir filtros de audio',
    announce: 'Anunciar canción actual',
    disconnect: 'Desconectar si el canal queda vacío',
    proBoxTitle: 'Diferencia real FREE vs PRO',
    proBoxDesc: 'PRO desbloquea colas largas, sesiones extendidas y funciones premium como playlists/filtros sin recortar la experiencia básica FREE.',
  },
  en: {
    onboardingTitle: 'Install TON618 to enable music',
    onboardingDesc: 'You can prepare settings here, but the bot must be in the server to apply them.',
    eyebrow: 'Music',
    title: 'Server player',
    desc: 'Configure FREE/PRO limits, Spotify, playlists, filters, and automatic player behavior.',
    save: 'Save music',
    emptyTitle: 'Server roles were not available',
    emptyMessage: 'You can save the rest of the options; resync the dashboard to pick a DJ role.',
    enable: 'Enable music module',
    enableDesc: 'Allows TON618 integrated music commands to be used.',
    djRole: 'Optional DJ role',
    djRoleHint: 'Pick a role to grant advanced player control.',
    noRole: 'No DJ role',
    playback: 'Playback',
    volume: 'Default volume',
    freeQueue: 'FREE max queue',
    proQueue: 'PRO max queue',
    freeDuration: 'FREE max duration (min)',
    proDuration: 'PRO max duration (min)',
    features: 'Features',
    spotify: 'Allow Spotify',
    playlists: 'Allow playlists',
    filters: 'Allow audio filters',
    announce: 'Announce now playing',
    disconnect: 'Disconnect when the channel is empty',
    proBoxTitle: 'Real FREE vs PRO difference',
    proBoxDesc: 'PRO unlocks long queues, extended sessions, and premium features like playlists/filters without cutting the basic FREE experience.',
  },
};

function useCopy() {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith('es') ? copy.es : copy.en;
}

function NumberField({
  label,
  error,
  register,
  field,
  disabled,
  min,
  max,
}: {
  label: string;
  error?: string;
  register: ReturnType<typeof useForm<MusicModuleValues>>['register'];
  field: keyof Pick<
    MusicModuleValues,
    'defaultVolume' | 'maxFreeQueue' | 'maxProQueue' | 'maxFreeDurationMinutes' | 'maxProDurationMinutes'
  >;
  disabled: boolean;
  min: number;
  max: number;
}) {
  return (
    <FieldShell label={label} error={error}>
      <input
        type="number"
        min={min}
        max={max}
        disabled={disabled}
        {...register(field, { valueAsNumber: true })}
        className="dashboard-module-input"
      />
    </FieldShell>
  );
}

export default function MusicModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: MusicModuleProps) {
  const text = useCopy();
  const roleOptions = getRoleOptions(inventory);
  const inventoryState = getInventoryState(inventory);

  const methods = useForm<MusicModuleValues>({
    resolver: zodResolver(musicSettingsSchema) as never,
    defaultValues: config.musicSettings,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = methods;

  useEffect(() => {
    reset(config.musicSettings);
  }, [config.musicSettings, reset]);

  const enabled = watch('enabled');
  const validationErrors = flattenFormErrors(errors);

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={text.eyebrow}
        title={text.onboardingTitle}
        description={text.onboardingDesc}
        icon={Music2}
        tone="warning"
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSave(values);
        })}
        className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"
      >
        <PanelCard
          eyebrow={text.eyebrow}
          title={text.title}
          description={text.desc}
          actions={(
            <ConfigFormActions
              isDirty={isDirty}
              isSaving={isSaving}
              onReset={() => reset(config.musicSettings)}
              saveLabel={text.save}
            />
          )}
        >
          <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
          <div className="mt-6 space-y-4">
            <ValidationSummary errors={validationErrors} />
            {!inventoryState.hasInventory ? (
              <InventoryNotice title={text.emptyTitle} message={text.emptyMessage} tone="neutral" />
            ) : null}
          </div>

          <div className="mt-8 space-y-5">
            <ToggleCard title={text.enable} description={text.enableDesc}>
              <input type="checkbox" {...register('enabled')} className="dashboard-module-checkbox mt-1" />
            </ToggleCard>

            <FieldShell label={text.djRole} hint={text.djRoleHint} error={errors.djRoleId?.message}>
              <DashboardSelect
                name="djRoleId"
                disabled={!enabled}
                options={roleOptions}
                placeholder={text.noRole}
              />
            </FieldShell>
          </div>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard title={text.playback} description={text.proBoxDesc}>
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label={text.volume} field="defaultVolume" register={register} error={errors.defaultVolume?.message} disabled={!enabled} min={1} max={100} />
              <NumberField label={text.freeQueue} field="maxFreeQueue" register={register} error={errors.maxFreeQueue?.message} disabled={!enabled} min={1} max={50} />
              <NumberField label={text.proQueue} field="maxProQueue" register={register} error={errors.maxProQueue?.message} disabled={!enabled} min={10} max={500} />
              <NumberField label={text.freeDuration} field="maxFreeDurationMinutes" register={register} error={errors.maxFreeDurationMinutes?.message} disabled={!enabled} min={1} max={60} />
              <NumberField label={text.proDuration} field="maxProDurationMinutes" register={register} error={errors.maxProDurationMinutes?.message} disabled={!enabled} min={10} max={720} />
            </div>
          </PanelCard>

          <PanelCard title={text.features} description={text.proBoxTitle}>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['allowSpotify', text.spotify],
                ['allowPlaylists', text.playlists],
                ['allowFilters', text.filters],
                ['announceNowPlaying', text.announce],
                ['disconnectOnEmpty', text.disconnect],
              ].map(([field, label]) => (
                <ToggleCard key={field} title={label}>
                  <input
                    type="checkbox"
                    disabled={!enabled}
                    {...register(field as keyof MusicSettings)}
                    className="dashboard-module-checkbox mt-1"
                  />
                </ToggleCard>
              ))}
            </div>
          </PanelCard>
        </div>
      </form>
    </FormProvider>
  );
}
