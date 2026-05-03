import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import {
  ConfigFormActions,
  FieldShell,
  InventoryNotice,
  ToggleCard,
  ValidationSummary,
} from '../components/ConfigForm';
import PanelCard from '../components/PanelCard';
import DashboardSelect from '../components/DashboardSelect';
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
import { findMissingSelections, flattenFormErrors, getInventoryState } from '../validation';

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
  const { t } = useTranslation();
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);

  const methods = useForm<ModlogsModuleValues>({
    resolver: zodResolver(modlogSettingsSchema) as never,
    defaultValues: config.modlogSettings,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = methods;

  useEffect(() => {
    reset(config.modlogSettings);
  }, [config.modlogSettings, reset]);

  const enabled = watch('enabled');
  const validationErrors = flattenFormErrors(errors);
  const inventoryState = getInventoryState(inventory);
  const missingSelections = findMissingSelections(
    [{ label: t('dashboard.modlogs.validation.channel'), value: config.modlogSettings.channelId }],
    channelOptions,
  );

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.modlogs.onboarding.eyebrow')}
        title={t('dashboard.modlogs.onboarding.title')}
        description={t('dashboard.modlogs.onboarding.desc')}
        icon={ShieldCheck}
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
      className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"
    >
      <PanelCard
        eyebrow={t('dashboard.modlogs.main.eyebrow')}
        title={t('dashboard.modlogs.main.title')}
        description={t('dashboard.modlogs.main.desc')}
        actions={(
          <ConfigFormActions
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={() => reset(config.modlogSettings)}
            saveLabel={t('dashboard.modlogs.main.save')}
          />
        )}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <div className="mt-6 space-y-4">
          <ValidationSummary errors={[...validationErrors, ...missingSelections]} />
          {!inventoryState.hasInventory ? (
            <InventoryNotice
              title={t('dashboard.modlogs.notices.emptyTitle')}
              message={t('dashboard.modlogs.notices.emptyMessage')}
            />
          ) : null}
        </div>

        <div className="mt-8 space-y-5">
          <ToggleCard
            title={t('dashboard.modlogs.setup.enableLabel')}
            description={t('dashboard.modlogs.setup.enableDesc')}
          >
            <input type="checkbox" {...register('enabled')} className="dashboard-module-checkbox mt-1" />
          </ToggleCard>

          <FieldShell
            label={t('dashboard.modlogs.setup.channelLabel')}
            hint={t('dashboard.modlogs.setup.channelHint')}
            error={errors.channelId?.message}
          >
            <DashboardSelect
              name="channelId"
              disabled={!enabled}
              options={channelOptions}
              placeholder={t('dashboard.modlogs.notConfigured')}
            />
          </FieldShell>
        </div>
      </PanelCard>

      <PanelCard title={t('dashboard.modlogs.events.title')} description={t('dashboard.modlogs.events.desc')}>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['logBans', t('dashboard.modlogs.events.logBans')],
            ['logUnbans', t('dashboard.modlogs.events.logUnbans')],
            ['logKicks', t('dashboard.modlogs.events.logKicks')],
            ['logMessageDelete', t('dashboard.modlogs.events.logMessageDelete')],
            ['logMessageEdit', t('dashboard.modlogs.events.logMessageEdit')],
            ['logRoleAdd', t('dashboard.modlogs.events.logRoleAdd')],
            ['logRoleRemove', t('dashboard.modlogs.events.logRoleRemove')],
            ['logNickname', t('dashboard.modlogs.events.logNickname')],
            ['logJoins', t('dashboard.modlogs.events.logJoins')],
            ['logLeaves', t('dashboard.modlogs.events.logLeaves')],
            ['logVoice', t('dashboard.modlogs.events.logVoice')],
          ].map(([field, label]) => (
            <ToggleCard key={field} title={label}>
              <input type="checkbox" {...register(field as keyof ModlogSettings)} className="dashboard-module-checkbox mt-1" />
            </ToggleCard>
          ))}
        </div>
      </PanelCard>
    </form>
    </FormProvider>
  );
}
