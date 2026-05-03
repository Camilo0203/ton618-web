import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import {
  ConfigFormActions,
  FieldShell,
  FormSection,
  InventoryNotice,
  ToggleCard,
  ValidationSummary,
} from '../components/ConfigForm';
import PanelCard from '../components/PanelCard';
import DashboardSelect from '../components/DashboardSelect';
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
import { findMissingSelections, flattenFormErrors, getInventoryState } from '../validation';

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
  const { t } = useTranslation();
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const roleOptions = getRoleOptions(inventory);

  const methods = useForm<VerificationModuleValues>({
    resolver: zodResolver(verificationSettingsSchema) as never,
    defaultValues: config.verificationSettings,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = methods;

  useEffect(() => {
    reset(config.verificationSettings);
  }, [config.verificationSettings, reset]);

  const enabled = watch('enabled');
  const mode = watch('mode');
  const validationErrors = flattenFormErrors(errors);
  const inventoryState = getInventoryState(inventory);
  const missingSelections = [
    ...findMissingSelections(
      [
        { label: t('dashboard.verification.flow.channel'), value: config.verificationSettings.channelId },
        { label: t('dashboard.verification.flow.logs'), value: config.verificationSettings.logChannelId },
      ],
      channelOptions,
    ),
    ...findMissingSelections(
      [
        { label: t('dashboard.verification.flow.verifiedRole'), value: config.verificationSettings.verifiedRoleId },
        { label: t('dashboard.verification.flow.unverifiedRole'), value: config.verificationSettings.unverifiedRoleId },
      ],
      roleOptions,
    ),
  ];

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.verification.onboarding.eyebrow')}
        title={t('dashboard.verification.onboarding.title')}
        description={t('dashboard.verification.onboarding.desc')}
        icon={Shield}
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
      className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
    >
      <PanelCard
        eyebrow={t('dashboard.verification.main.eyebrow')}
        title={t('dashboard.verification.main.title')}
        description={t('dashboard.verification.main.desc')}
        actions={(
          <ConfigFormActions
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={() => reset(config.verificationSettings)}
            saveLabel={t('dashboard.verification.main.save')}
          />
        )}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <div className="mt-6 space-y-4">
          <ValidationSummary errors={[...validationErrors, ...missingSelections]} />
          {!inventoryState.hasInventory ? (
            <InventoryNotice
              title={t('dashboard.verification.notices.emptyTitle')}
              message={t('dashboard.verification.notices.emptyMessage')}
            />
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          <FormSection
            title={t('dashboard.verification.flow.title')}
            description={t('dashboard.verification.flow.desc')}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <ToggleCard title={t('dashboard.verification.flow.enabled.label')} description={t('dashboard.verification.flow.enabled.desc')}>
                <input type="checkbox" {...register('enabled')} className="dashboard-module-checkbox mt-1" />
              </ToggleCard>

              <FieldShell label={t('dashboard.verification.flow.channel')} error={errors.channelId?.message}>
                <DashboardSelect
                  name="channelId"
                  disabled={!enabled}
                  options={channelOptions}
                  placeholder={t('dashboard.verification.notConfigured')}
                />
              </FieldShell>

              <FieldShell label={t('dashboard.verification.flow.logs')}>
                <DashboardSelect
                  name="logChannelId"
                  disabled={!enabled}
                  options={channelOptions}
                  placeholder={t('dashboard.verification.notConfigured')}
                />
              </FieldShell>

              <FieldShell label={t('dashboard.verification.flow.verifiedRole')} error={errors.verifiedRoleId?.message}>
                <DashboardSelect
                  name="verifiedRoleId"
                  disabled={!enabled}
                  options={roleOptions}
                  placeholder={t('dashboard.verification.notConfigured')}
                />
              </FieldShell>

              <FieldShell label={t('dashboard.verification.flow.unverifiedRole')}>
                <DashboardSelect
                  name="unverifiedRoleId"
                  disabled={!enabled}
                  options={roleOptions}
                  placeholder={t('dashboard.verification.notConfigured')}
                />
              </FieldShell>

              <FieldShell label={t('dashboard.verification.flow.mode.label')}>
                <DashboardSelect
                  name="mode"
                  disabled={!enabled}
                  options={[
                    { value: 'button', label: t('dashboard.verification.flow.mode.button') },
                    { value: 'code', label: t('dashboard.verification.flow.mode.code') },
                    { value: 'question', label: t('dashboard.verification.flow.mode.question') },
                  ]}
                />
              </FieldShell>

              <FieldShell label={t('dashboard.verification.flow.autokick.label')} hint={t('dashboard.verification.flow.autokick.hint')}>
                <input type="number" min={0} max={168} {...register('kickUnverifiedHours', { valueAsNumber: true })} className="dashboard-form-field" />
              </FieldShell>
            </div>
          </FormSection>
        </div>
      </PanelCard>

      <PanelCard title={t('dashboard.verification.visual.title')} description={t('dashboard.verification.visual.desc')}>
        <div className="space-y-6">
          <FieldShell label={t('dashboard.verification.visual.titleLabel')}>
            <input {...register('panelTitle')} className="dashboard-form-field" />
          </FieldShell>
          <FieldShell label={t('dashboard.verification.visual.descLabel')}>
            <textarea {...register('panelDescription')} rows={4} className="dashboard-form-field" />
          </FieldShell>
          <div className="grid gap-5 md:grid-cols-2">
            <FieldShell label={t('dashboard.verification.visual.colorLabel')} error={errors.panelColor?.message}>
              <input {...register('panelColor')} className="dashboard-form-field" />
            </FieldShell>
            <FieldShell label={t('dashboard.verification.visual.imageLabel')}>
              <input {...register('panelImage')} placeholder={t('dashboard.verification.visual.imagePlaceholder')} className="dashboard-form-field" />
            </FieldShell>
          </div>
          {mode === 'question' ? (
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label={t('dashboard.verification.visual.questionLabel')} error={errors.question?.message}>
                <input {...register('question')} className="dashboard-form-field" />
              </FieldShell>
              <FieldShell label={t('dashboard.verification.visual.answerLabel')} error={errors.questionAnswer?.message}>
                <input {...register('questionAnswer')} className="dashboard-form-field" />
              </FieldShell>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <ToggleCard title={t('dashboard.verification.visual.antiraid.label')} description={t('dashboard.verification.visual.antiraid.desc')}>
              <input type="checkbox" {...register('antiraidEnabled')} className="dashboard-module-checkbox mt-1" />
            </ToggleCard>
            <ToggleCard title={t('dashboard.verification.visual.dm.label')} description={t('dashboard.verification.visual.dm.desc')}>
              <input type="checkbox" {...register('dmOnVerify')} className="dashboard-module-checkbox mt-1" />
            </ToggleCard>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">{t('dashboard.verification.visual.thresholds.joins')}</span>
              <input type="number" min={3} max={50} {...register('antiraidJoins', { valueAsNumber: true })} className="w-full rounded-2xl border dashboard-module-select" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">{t('dashboard.verification.visual.thresholds.window')}</span>
              <input type="number" min={5} max={60} {...register('antiraidSeconds', { valueAsNumber: true })} className="w-full rounded-2xl border dashboard-module-select" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">{t('dashboard.verification.visual.thresholds.action')}</span>
            <DashboardSelect
              name="antiraidAction"
              options={[
                { value: 'pause', label: t('dashboard.verification.visual.thresholds.pause') },
                { value: 'kick', label: t('dashboard.verification.visual.thresholds.kick') },
              ]}
            />
            </label>
          </div>
        </div>
      </PanelCard>
    </form>
    </FormProvider>
  );
}
