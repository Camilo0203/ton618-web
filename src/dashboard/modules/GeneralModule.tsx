import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<GeneralModuleValues>({
    resolver: zodResolver(generalModuleSchema),
    defaultValues: {
      generalSettings: config.generalSettings,
      dashboardPreferences: config.dashboardPreferences,
    },
  });

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
      label: 'Roles y canales base',
      done: Boolean(config.serverRolesChannelsSettings.supportRoleId && config.serverRolesChannelsSettings.ticketPanelChannelId),
      section: 'server_roles' as const,
    },
    {
      id: 'sla',
      label: 'SLA operativo',
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
    <form
      onSubmit={handleSubmit(async (values) => {
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
                <select
                  {...register('generalSettings.language')}
                  className="dashboard-form-field"
                >
                  <option value="es">{t('dashboard.general.locale.language.es')}</option>
                  <option value="en">{t('dashboard.general.locale.language.en')}</option>
                </select>
              </FieldShell>

              <FieldShell
                label={t('dashboard.general.locale.timezone.label')}
                hint={t('dashboard.general.locale.timezone.hint')}
                error={errors.generalSettings?.timezone?.message}
              >
                <input
                  {...register('generalSettings.timezone')}
                  placeholder="America/Bogota"
                  className="dashboard-form-field"
                />
              </FieldShell>

              <FieldShell
                label={t('dashboard.general.locale.commandMode.label')}
                hint={t('dashboard.general.locale.commandMode.hint')}
              >
                <select
                  {...register('generalSettings.commandMode')}
                  className="dashboard-form-field"
                >
                  <option value="mention">{t('dashboard.general.locale.commandMode.mention')}</option>
                  <option value="prefix">{t('dashboard.general.locale.commandMode.prefix')}</option>
                </select>
              </FieldShell>

              <FieldShell
                label={t('dashboard.general.locale.opsPlan.label')}
                hint={t('dashboard.general.locale.opsPlan.hint')}
              >
                <select
                  {...register('generalSettings.opsPlan')}
                  className="dashboard-form-field"
                >
                  <option value="free">{t('dashboard.general.locale.opsPlan.free')}</option>
                  <option value="pro">{t('dashboard.general.locale.opsPlan.pro')}</option>
                  <option value="enterprise">{t('dashboard.general.locale.opsPlan.enterprise')}</option>
                </select>
              </FieldShell>

              <FieldShell
                label={t('dashboard.general.locale.prefix.label')}
                hint={t('dashboard.general.locale.prefix.hint')}
                error={errors.generalSettings?.prefix?.message}
              >
                <input
                  {...register('generalSettings.prefix')}
                  disabled={commandMode !== 'prefix'}
                  placeholder="!"
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
              <select
                {...register('dashboardPreferences.defaultSection')}
                className="dashboard-form-field"
              >
                <option value="overview">{t('dashboard.general.sections.overview')}</option>
                <option value="general">{t('dashboard.general.sections.general')}</option>
                <option value="server_roles">{t('dashboard.general.sections.server_roles')}</option>
                <option value="tickets">{t('dashboard.general.sections.tickets')}</option>
                <option value="verification">{t('dashboard.general.sections.verification')}</option>
                <option value="welcome">{t('dashboard.general.sections.welcome')}</option>
                <option value="suggestions">{t('dashboard.general.sections.suggestions')}</option>
                <option value="modlogs">{t('dashboard.general.sections.modlogs')}</option>
                <option value="commands">{t('dashboard.general.sections.commands')}</option>
                <option value="system">{t('dashboard.general.sections.system')}</option>
                <option value="activity">{t('dashboard.general.sections.activity')}</option>
                <option value="analytics">{t('dashboard.general.sections.analytics')}</option>
              </select>
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
  );
}
