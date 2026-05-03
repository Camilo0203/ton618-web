import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react';
import {
  ConfigFormActions,
  FieldShell,
  FormSection,
  ValidationSummary,
} from '../components/ConfigForm';
import PanelCard from '../components/PanelCard';
import DashboardSelect from '../components/DashboardSelect';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import {
  dashboardPreferencesSchema,
  generalSettingsSchema,
} from '../schemas';
import { flattenFormErrors } from '../validation';
import type {
  DashboardGuild,
  DashboardSectionId,
  DashboardPreferences,
  GeneralSettings,
  GuildConfig,
  GuildConfigMutation,
  GuildSyncStatus,
} from '../types';

const generalModuleSchema = z.object({
  generalSettings: generalSettingsSchema,
  dashboardPreferences: dashboardPreferencesSchema,
});

type GeneralModuleValues = z.infer<typeof generalModuleSchema>;

interface GeneralModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSectionChange: (section: DashboardSectionId) => void;
  onSave: (values: {
    generalSettings: GeneralSettings;
    dashboardPreferences: DashboardPreferences;
  }) => Promise<void>;
}

export default function GeneralModule({
  guild,
  config,
  mutation,
  syncStatus,
  isSaving,
  onSectionChange,
  onSave,
}: GeneralModuleProps) {
  const { t } = useTranslation();

  const methods = useForm<GeneralModuleValues>({
    resolver: zodResolver(generalModuleSchema),
    defaultValues: {
      generalSettings: config.generalSettings,
      dashboardPreferences: config.dashboardPreferences,
    },
  });

  const { register, watch, reset, formState: { errors, isDirty } } = methods;

  useEffect(() => {
    reset({
      generalSettings: config.generalSettings,
      dashboardPreferences: config.dashboardPreferences,
    });
  }, [config.dashboardPreferences, config.generalSettings, reset]);
  const commandMode = watch('generalSettings.commandMode');
  const validationErrors = flattenFormErrors(errors);
  const launchpadSteps = [
    {
      id: 'roles',
      label: t('dashboard.general.launchpad.rolesLabel'),
      done: Boolean(config.serverRolesChannelsSettings.supportRoleId && config.serverRolesChannelsSettings.ticketPanelChannelId),
      section: 'server_roles' as const,
    },
    {
      id: 'sla',
      label: t('dashboard.general.launchpad.slaLabel'),
      done: config.ticketsSettings.slaMinutes > 0,
      section: 'tickets' as const,
    },
  ];

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.general.onboarding.eyebrow')}
        title={t('dashboard.general.onboarding.title')}
        description={t('dashboard.general.onboarding.desc')}
        icon={Settings2}
        tone="warning"
      />
    );
  }

  return (
    <FormProvider {...methods}>
    <form
      onSubmit={methods.handleSubmit(async (values) => {
        await onSave(values);
      })}
      className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
    >
      <PanelCard
        eyebrow={t('dashboard.general.main.eyebrow')}
        title={t('dashboard.general.main.title')}
        description={t('dashboard.general.main.desc')}
        actions={(
          <ConfigFormActions
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={() =>
              reset({
                generalSettings: config.generalSettings,
                dashboardPreferences: config.dashboardPreferences,
              })
            }
            saveLabel={t('dashboard.general.main.save')}
          />
        )}
        variant="highlight"
        stickyActions
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <div className="mt-6">
          <ValidationSummary errors={validationErrors} />
        </div>

        <div className="mt-8 space-y-8">
          <FormSection
            title={t('dashboard.general.locale.title')}
            description={t('dashboard.general.locale.desc')}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell
                label={t('dashboard.general.locale.language.label')}
                hint={t('dashboard.general.locale.language.hint')}
              >
                <DashboardSelect
                  name="generalSettings.language"
                  options={[
                    { value: 'es', label: t('dashboard.general.locale.language.es') },
                    { value: 'en', label: t('dashboard.general.locale.language.en') },
                  ]}
                />
              </FieldShell>

              <FieldShell
                label={t('dashboard.general.locale.timezone.label')}
                hint={t('dashboard.general.locale.timezone.hint')}
                error={errors.generalSettings?.timezone?.message}
              >
                <input
                  {...register('generalSettings.timezone')}
                  placeholder={t('dashboard.general.locale.timezonePlaceholder')}
                  className="dashboard-form-field"
                />
              </FieldShell>

              <FieldShell
                label={t('dashboard.general.locale.commandMode.label')}
                hint={t('dashboard.general.locale.commandMode.hint')}
              >
                <DashboardSelect
                  name="generalSettings.commandMode"
                  options={[
                    { value: 'mention', label: t('dashboard.general.locale.commandMode.mention') },
                    { value: 'prefix', label: t('dashboard.general.locale.commandMode.prefix') },
                  ]}
                />
              </FieldShell>

              <FieldShell
                label={t('dashboard.general.locale.opsPlan.label')}
                hint={t('dashboard.general.locale.opsPlan.hint')}
              >
                <DashboardSelect
                  name="generalSettings.opsPlan"
                  options={[
                    { value: 'free', label: t('dashboard.general.locale.opsPlan.free') },
                    { value: 'pro', label: t('dashboard.general.locale.opsPlan.pro') },
                    { value: 'enterprise', label: t('dashboard.general.locale.opsPlan.enterprise') },
                  ]}
                />
              </FieldShell>

              <FieldShell
                label={t('dashboard.general.locale.prefix.label')}
                hint={t('dashboard.general.locale.prefix.hint')}
                error={errors.generalSettings?.prefix?.message}
              >
                <input
                  {...register('generalSettings.prefix')}
                  disabled={commandMode !== 'prefix'}
                  placeholder={t('dashboard.general.locale.prefixPlaceholder')}
                  className="dashboard-form-field"
                />
              </FieldShell>
            </div>
          </FormSection>

          <FormSection
            title={t('dashboard.general.moderation.title')}
            description={t('dashboard.general.moderation.desc')}
          >
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['relaxed', t('dashboard.general.moderation.relaxed.label'), t('dashboard.general.moderation.relaxed.desc')],
                ['balanced', t('dashboard.general.moderation.balanced.label'), t('dashboard.general.moderation.balanced.desc')],
                ['strict', t('dashboard.general.moderation.strict.label'), t('dashboard.general.moderation.strict.desc')],
              ].map(([value, title, description]) => (
                <label
                  key={value}
                  className="dashboard-toggle-card has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50/90 dark:has-[:checked]:border-brand-800 dark:has-[:checked]:bg-brand-900/20"
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('generalSettings.moderationPreset')}
                    className="sr-only"
                  />
                  <span className="block text-lg font-semibold text-white">
                    {title}
                  </span>
                  <span className="mt-2 block text-sm text-slate-300">
                    {description}
                  </span>
                </label>
              ))}
            </div>
          </FormSection>
        </div>
      </PanelCard>

      <div className="space-y-6">
        <PanelCard
          eyebrow={t('dashboard.general.prefs.eyebrow')}
          title={t('dashboard.general.prefs.title')}
          description={t('dashboard.general.prefs.desc')}
          variant="soft"
        >
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">
                {t('dashboard.general.prefs.defaultSection')}
              </span>
              <DashboardSelect
                name="dashboardPreferences.defaultSection"
                options={[
                  { value: 'overview', label: t('dashboard.general.sections.overview') },
                  { value: 'general', label: t('dashboard.general.sections.general') },
                  { value: 'server_roles', label: t('dashboard.general.sections.server_roles') },
                  { value: 'tickets', label: t('dashboard.general.sections.tickets') },
                  { value: 'verification', label: t('dashboard.general.sections.verification') },
                  { value: 'welcome', label: t('dashboard.general.sections.welcome') },
                  { value: 'suggestions', label: t('dashboard.general.sections.suggestions') },
                  { value: 'modlogs', label: t('dashboard.general.sections.modlogs') },
                  { value: 'commands', label: t('dashboard.general.sections.commands') },
                  { value: 'system', label: t('dashboard.general.sections.system') },
                  { value: 'activity', label: t('dashboard.general.sections.activity') },
                  { value: 'analytics', label: t('dashboard.general.sections.analytics') },
                  { value: 'playbooks', label: t('dashboard.general.sections.playbooks') },
                  { value: 'inbox', label: t('dashboard.general.sections.inbox') },
                ]}
              />
            </label>

            <label className="dashboard-toggle-card flex items-start gap-3">
              <input
                type="checkbox"
                {...register('dashboardPreferences.compactMode')}
                className="dashboard-module-checkbox mt-1"
              />
              <span>
                <span className="block font-semibold text-white">
                  {t('dashboard.general.prefs.compactMode.label')}
                </span>
                <span className="mt-1 block text-sm text-slate-300">
                  {t('dashboard.general.prefs.compactMode.desc')}
                </span>
              </span>
            </label>

            <label className="dashboard-toggle-card flex items-start gap-3">
              <input
                type="checkbox"
                {...register('dashboardPreferences.showAdvancedCards')}
                className="dashboard-module-checkbox mt-1"
              />
              <span>
                <span className="block font-semibold text-white">
                  {t('dashboard.general.prefs.advancedCards.label')}
                </span>
                <span className="mt-1 block text-sm text-slate-300">
                  {t('dashboard.general.prefs.advancedCards.desc')}
                </span>
              </span>
            </label>

            <div className="rounded-[1.5rem] border border-brand-900/50 bg-brand-950/20 p-4 text-sm text-brand-200">
              {t('dashboard.general.prefs.notice')}
            </div>
          </div>
        </PanelCard>

        <PanelCard
          eyebrow={t('dashboard.general.launchpad.eyebrow')}
          title={t('dashboard.general.launchpad.title')}
          description={t('dashboard.general.launchpad.desc')}
          variant="soft"
        >
          <div className="space-y-3">
            {launchpadSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => onSectionChange(step.section)}
                className="dashboard-checklist-item w-full text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{step.label}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {step.done ? t('dashboard.general.launchpad.ready') : t('dashboard.general.launchpad.pending')}
                    </p>
                  </div>
                  <span className={`dashboard-status-pill-compact ${step.done ? 'dashboard-success-pill' : 'dashboard-neutral-pill'}`}>
                    {step.done ? t('dashboard.general.launchpad.done') : t('dashboard.general.launchpad.cta')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </PanelCard>
      </div>
    </form>
    </FormProvider>
  );
}
