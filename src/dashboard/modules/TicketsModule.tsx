import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Ticket } from 'lucide-react';
import {
  ConfigFormActions,
  FieldShell,
  FormSection,
  InventoryNotice,
  ToggleCard,
  ValidationSummary,
} from '../components/ConfigForm';
import PanelCard from '../components/PanelCard';
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
import { findMissingSelections, flattenFormErrors, getInventoryState } from '../validation';

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

export default function TicketsModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: TicketsModuleProps) {
  const { t } = useTranslation();

  const priorityLabels = [
    ['low', t('dashboard.tickets.priority.low')],
    ['normal', t('dashboard.tickets.priority.normal')],
    ['high', t('dashboard.tickets.priority.high')],
    ['urgent', t('dashboard.tickets.priority.urgent')],
  ] as const;

  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const roleOptions = getRoleOptions(inventory);
  const categoryOptions = getCategoryOptions(inventory);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
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
  const validationErrors = flattenFormErrors(errors);
  const inventoryState = getInventoryState(inventory);
  const missingSelections = [
    ...findMissingSelections(
      [
        { label: t('dashboard.tickets.escalation.roleLabel'), value: config.ticketsSettings.slaEscalationRoleId },
      ],
      roleOptions,
    ),
    ...findMissingSelections(
      [
        { label: t('dashboard.tickets.escalation.channelLabel'), value: config.ticketsSettings.slaEscalationChannelId },
        { label: t('dashboard.tickets.escalation.reportLabel'), value: config.ticketsSettings.dailySlaReportChannelId },
      ],
      channelOptions,
    ),
  ];
  const missingIncidentCategories = config.ticketsSettings.incidentPausedCategories
    .filter((categoryId) => !categoryOptions.some((category) => category.value === categoryId))
    .map((categoryId) => t('dashboard.tickets.advanced.missingCategory', { id: categoryId }));

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.tickets.onboarding.eyebrow')}
        title={t('dashboard.tickets.onboarding.title')}
        description={t('dashboard.tickets.onboarding.desc')}
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
        eyebrow={t('dashboard.tickets.main.eyebrow')}
        title={t('dashboard.tickets.main.title')}
        description={t('dashboard.tickets.main.desc')}
        actions={(
          <ConfigFormActions
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={() => reset(config.ticketsSettings)}
            saveLabel={t('dashboard.tickets.main.save')}
          />
        )}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <div className="mt-6 space-y-4">
          <ValidationSummary errors={[...validationErrors, ...missingSelections, ...missingIncidentCategories]} />
          {!inventoryState.hasInventory ? (
            <InventoryNotice
              title={t('dashboard.tickets.inventoryNotice.title')}
              message={t('dashboard.tickets.inventoryNotice.message')}
            />
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          <FormSection
            title={t('dashboard.tickets.capacity.title')}
            description={t('dashboard.tickets.capacity.desc')}
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['maxTickets', t('dashboard.tickets.capacity.maxTickets'), 1, 10],
                ['globalTicketLimit', t('dashboard.tickets.capacity.globalLimit'), 0, 500],
                ['cooldownMinutes', t('dashboard.tickets.capacity.cooldown'), 0, 1440],
                ['minDays', t('dashboard.tickets.capacity.minDays'), 0, 365],
                ['autoCloseMinutes', t('dashboard.tickets.capacity.autoClose'), 0, 10080],
                ['slaMinutes', t('dashboard.tickets.capacity.slaMinutes'), 0, 1440],
                ['smartPingMinutes', t('dashboard.tickets.capacity.smartPing'), 0, 1440],
                ['slaEscalationMinutes', t('dashboard.tickets.capacity.slaEscalation'), 0, 10080],
              ].map(([field, label, min, max]) => (
                <FieldShell key={String(field)} label={String(label)} error={errors[field as keyof typeof errors]?.message as string | undefined}>
                  <input
                    type="number"
                    min={Number(min)}
                    max={Number(max)}
                    {...register(field as keyof TicketsSettings, { valueAsNumber: true })}
                    className="dashboard-form-field"
                  />
                </FieldShell>
              ))}
            </div>
          </FormSection>

          <FormSection
            title={t('dashboard.tickets.automation.title')}
            description={t('dashboard.tickets.automation.desc')}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['autoAssignEnabled', t('dashboard.tickets.automation.autoAssign.label'), t('dashboard.tickets.automation.autoAssign.desc')],
                ['autoAssignRequireOnline', t('dashboard.tickets.automation.requireOnline.label'), t('dashboard.tickets.automation.requireOnline.desc')],
                ['autoAssignRespectAway', t('dashboard.tickets.automation.respectAway.label'), t('dashboard.tickets.automation.respectAway.desc')],
                ['dailySlaReportEnabled', t('dashboard.tickets.automation.dailyReport.label'), t('dashboard.tickets.automation.dailyReport.desc')],
                ['incidentModeEnabled', t('dashboard.tickets.automation.incidentMode.label'), t('dashboard.tickets.automation.incidentMode.desc')],
                ['dmOnOpen', t('dashboard.tickets.automation.dmOpen.label'), t('dashboard.tickets.automation.dmOpen.desc')],
                ['dmOnClose', t('dashboard.tickets.automation.dmClose.label'), t('dashboard.tickets.automation.dmClose.desc')],
                ['dmTranscripts', t('dashboard.tickets.automation.dmTranscripts.label'), t('dashboard.tickets.automation.dmTranscripts.desc')],
                ['dmAlerts', t('dashboard.tickets.automation.dmAlerts.label'), t('dashboard.tickets.automation.dmAlerts.desc')],
                ['slaEscalationEnabled', t('dashboard.tickets.automation.slaEscalation.label'), t('dashboard.tickets.automation.slaEscalation.desc')],
              ].map(([field, label, description]) => (
                <ToggleCard key={field} title={label} description={description}>
                  <input
                    type="checkbox"
                    {...register(field as keyof TicketsSettings)}
                    className="dashboard-module-checkbox mt-1"
                  />
                </ToggleCard>
              ))}
            </div>
          </FormSection>
        </div>
      </PanelCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <PanelCard title={t('dashboard.tickets.escalation.title')} description={t('dashboard.tickets.escalation.desc')}>
          <div className="grid gap-5 md:grid-cols-2">
            <FieldShell label={t('dashboard.tickets.escalation.roleLabel')} error={errors.slaEscalationRoleId?.message}>
              <select
                {...register('slaEscalationRoleId')}
                disabled={!slaEscalationEnabled}
                className="w-full rounded-2xl border dashboard-module-select"
              >
                <option value="">{t('dashboard.tickets.escalation.notConfigured')}</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label={t('dashboard.tickets.escalation.channelLabel')}>
              <select
                {...register('slaEscalationChannelId')}
                disabled={!slaEscalationEnabled}
                className="w-full rounded-2xl border dashboard-module-select"
              >
                <option value="">{t('dashboard.tickets.escalation.notConfigured')}</option>
                {channelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label={t('dashboard.tickets.escalation.reportLabel')} error={errors.dailySlaReportChannelId?.message}>
              <select
                {...register('dailySlaReportChannelId')}
                disabled={!dailySlaReportEnabled}
                className="w-full rounded-2xl border dashboard-module-select"
              >
                <option value="">{t('dashboard.tickets.escalation.useFallback')}</option>
                {channelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label={t('dashboard.tickets.escalation.incidentLabel')} error={errors.incidentMessage?.message}>
              <textarea
                {...register('incidentMessage')}
                rows={3}
                className="dashboard-form-field"
              />
            </FieldShell>
          </div>
        </PanelCard>

        <PanelCard title={t('dashboard.tickets.advanced.title')} description={t('dashboard.tickets.advanced.desc')}>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-200">{t('dashboard.tickets.advanced.slaOverrides')}</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {priorityLabels.map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm text-slate-300">{label}</span>
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
                      className="w-full rounded-2xl border dashboard-module-select"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">{t('dashboard.tickets.advanced.pausedCategories')}</p>
              <div className="mt-3 grid gap-3">
                {categoryOptions.length ? (
                  categoryOptions.map((category) => {
                    const checked = incidentPausedCategories.includes(category.value);
                    return (
                      <label
                        key={category.value}
                        className="flex items-start gap-3 rounded-3xl border dashboard-module-card p-4"
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
                          className="dashboard-module-checkbox mt-1"
                        />
                        <span>
                          <span className="block font-semibold text-white">{category.label}</span>
                          {category.description ? (
                            <span className="mt-1 block text-sm text-slate-300">
                              {category.description}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border dashboard-module-empty p-5 text-sm text-slate-500">
                    {t('dashboard.tickets.advanced.noCategories')}
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
