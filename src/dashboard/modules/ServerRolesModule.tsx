import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Layers3 } from 'lucide-react';
import {
  ConfigFormActions,
  FieldShell,
  FormSection,
  InventoryNotice,
  ValidationSummary,
} from '../components/ConfigForm';
import PanelCard from '../components/PanelCard';
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
import { findMissingSelections, flattenFormErrors, getInventoryState } from '../validation';

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
  hint,
  error,
  placeholder,
  registerName,
  options,
  register,
}: {
  label: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  registerName: keyof ServerRolesChannelsSettings;
  options: Array<{ value: string; label: string }>;
  register: ReturnType<typeof useForm<ServerRolesModuleValues>>['register'];
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <select
        {...register(registerName)}
        className="dashboard-form-field"
      >
        <option value="">{placeholder ?? ''}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
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
  const { t } = useTranslation();
  const roleOptions = getRoleOptions(inventory);
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const voiceChannelOptions = getChannelOptions(inventory, ['voice']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ServerRolesModuleValues>({
    resolver: zodResolver(serverRolesChannelsSettingsSchema) as never,
    defaultValues: config.serverRolesChannelsSettings,
  });

  useEffect(() => {
    reset(config.serverRolesChannelsSettings);
  }, [config.serverRolesChannelsSettings, reset]);
  const validationErrors = flattenFormErrors(errors);
  const inventoryState = getInventoryState(inventory);
  const missingSelections = [
    ...findMissingSelections(
      [
        { label: t('dashboard.serverRoles.validation.dashboard'), value: config.serverRolesChannelsSettings.dashboardChannelId },
        { label: t('dashboard.serverRoles.validation.ticketPanel'), value: config.serverRolesChannelsSettings.ticketPanelChannelId },
        { label: t('dashboard.serverRoles.validation.logs'), value: config.serverRolesChannelsSettings.logsChannelId },
        { label: t('dashboard.serverRoles.validation.transcript'), value: config.serverRolesChannelsSettings.transcriptChannelId },
        { label: t('dashboard.serverRoles.validation.weeklyReport'), value: config.serverRolesChannelsSettings.weeklyReportChannelId },
        { label: t('dashboard.serverRoles.validation.liveMembers'), value: config.serverRolesChannelsSettings.liveMembersChannelId },
        { label: t('dashboard.serverRoles.validation.liveRoleCount'), value: config.serverRolesChannelsSettings.liveRoleChannelId },
      ],
      [...channelOptions, ...voiceChannelOptions],
    ),
    ...findMissingSelections(
      [
        { label: t('dashboard.serverRoles.validation.liveRole'), value: config.serverRolesChannelsSettings.liveRoleId },
        { label: t('dashboard.serverRoles.validation.support'), value: config.serverRolesChannelsSettings.supportRoleId },
        { label: t('dashboard.serverRoles.validation.admin'), value: config.serverRolesChannelsSettings.adminRoleId },
        { label: t('dashboard.serverRoles.validation.verify'), value: config.serverRolesChannelsSettings.verifyRoleId },
      ],
      roleOptions,
    ),
  ];

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.serverRoles.onboarding.eyebrow')}
        title={t('dashboard.serverRoles.onboarding.title')}
        description={t('dashboard.serverRoles.onboarding.desc')}
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
        eyebrow={t('dashboard.serverRoles.main.eyebrow')}
        title={t('dashboard.serverRoles.main.title')}
        description={t('dashboard.serverRoles.main.desc')}
        actions={(
          <ConfigFormActions
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={() => reset(config.serverRolesChannelsSettings)}
            saveLabel={t('dashboard.serverRoles.main.save')}
          />
        )}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <div className="mt-6 space-y-4">
          <ValidationSummary errors={[...validationErrors, ...missingSelections]} />
          {!inventoryState.hasInventory ? (
            <InventoryNotice
              title={t('dashboard.serverRoles.notices.emptyTitle')}
              message={t('dashboard.serverRoles.notices.emptyMessage')}
            />
          ) : null}
          {inventoryState.isStale ? (
            <InventoryNotice
              title={t('dashboard.serverRoles.notices.staleTitle')}
              message={t('dashboard.serverRoles.notices.staleMessage')}
              tone="neutral"
            />
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          <FormSection
            title={t('dashboard.serverRoles.channels.title')}
            description={t('dashboard.serverRoles.channels.desc')}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <SelectField label={t('dashboard.serverRoles.channels.dashboard.label')} hint={t('dashboard.serverRoles.channels.dashboard.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="dashboardChannelId" options={channelOptions} register={register} />
              <SelectField label={t('dashboard.serverRoles.channels.ticketPanel.label')} hint={t('dashboard.serverRoles.channels.ticketPanel.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="ticketPanelChannelId" options={channelOptions} register={register} />
              <SelectField label={t('dashboard.serverRoles.channels.logs.label')} hint={t('dashboard.serverRoles.channels.logs.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="logsChannelId" options={channelOptions} register={register} />
              <SelectField label={t('dashboard.serverRoles.channels.transcript.label')} hint={t('dashboard.serverRoles.channels.transcript.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="transcriptChannelId" options={channelOptions} register={register} />
              <SelectField label={t('dashboard.serverRoles.channels.weeklyReport.label')} hint={t('dashboard.serverRoles.channels.weeklyReport.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="weeklyReportChannelId" options={channelOptions} register={register} />
              <SelectField label={t('dashboard.serverRoles.channels.liveMembers.label')} hint={t('dashboard.serverRoles.channels.liveMembers.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="liveMembersChannelId" options={voiceChannelOptions} register={register} />
              <SelectField label={t('dashboard.serverRoles.channels.liveRoleCount.label')} hint={t('dashboard.serverRoles.channels.liveRoleCount.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="liveRoleChannelId" options={voiceChannelOptions} register={register} />
              <SelectField label={t('dashboard.serverRoles.channels.liveRole.label')} hint={t('dashboard.serverRoles.channels.liveRole.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="liveRoleId" options={roleOptions} register={register} />
            </div>
          </FormSection>
        </div>
      </PanelCard>

      <PanelCard
        eyebrow={t('dashboard.serverRoles.access.eyebrow')}
        title={t('dashboard.serverRoles.access.title')}
        description={t('dashboard.serverRoles.access.desc')}
      >
        <FormSection
          title={t('dashboard.serverRoles.access.sectionTitle')}
          description={t('dashboard.serverRoles.access.sectionDesc')}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField label={t('dashboard.serverRoles.access.support.label')} hint={t('dashboard.serverRoles.access.support.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="supportRoleId" options={roleOptions} register={register} />
            <SelectField label={t('dashboard.serverRoles.access.admin.label')} hint={t('dashboard.serverRoles.access.admin.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="adminRoleId" options={roleOptions} register={register} />
            <SelectField label={t('dashboard.serverRoles.access.verify.label')} hint={t('dashboard.serverRoles.access.verify.hint')} placeholder={t('dashboard.serverRoles.notConfigured')} registerName="verifyRoleId" options={roleOptions} register={register} />
          </div>
        </FormSection>

        <div className="mt-8 rounded-3xl border border-brand-900/50 bg-brand-950/20 p-4 text-sm text-brand-200">
          {t('dashboard.serverRoles.footerNote')}
        </div>
      </PanelCard>
    </form>
  );
}
