import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { MessageSquareQuote } from 'lucide-react';
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
import { suggestionSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  SuggestionSettings,
} from '../types';
import { getChannelOptions } from '../utils';
import { findMissingSelections, flattenFormErrors, getInventoryState } from '../validation';

type SuggestionsModuleValues = z.infer<typeof suggestionSettingsSchema>;

interface SuggestionsModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: SuggestionSettings) => Promise<void>;
}

export default function SuggestionsModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: SuggestionsModuleProps) {
  const { t } = useTranslation();
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<SuggestionsModuleValues>({
    resolver: zodResolver(suggestionSettingsSchema) as never,
    defaultValues: config.suggestionSettings,
  });

  useEffect(() => {
    reset(config.suggestionSettings);
  }, [config.suggestionSettings, reset]);

  const enabled = watch('enabled');
  const validationErrors = flattenFormErrors(errors);
  const inventoryState = getInventoryState(inventory);
  const missingSelections = findMissingSelections(
    [
      { label: t('dashboard.suggestions.destinations.base.label'), value: config.suggestionSettings.channelId },
      { label: t('dashboard.suggestions.destinations.logs.label'), value: config.suggestionSettings.logChannelId },
      { label: t('dashboard.suggestions.destinations.approved.label'), value: config.suggestionSettings.approvedChannelId },
      { label: t('dashboard.suggestions.destinations.rejected.label'), value: config.suggestionSettings.rejectedChannelId },
    ],
    channelOptions,
  );

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.suggestions.onboarding.eyebrow')}
        title={t('dashboard.suggestions.onboarding.title')}
        description={t('dashboard.suggestions.onboarding.desc')}
        icon={MessageSquareQuote}
        tone="warning"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave(values);
      })}
      className="grid gap-6 xl:grid-cols-[1fr_1fr]"
    >
      <PanelCard
        eyebrow={t('dashboard.suggestions.main.eyebrow')}
        title={t('dashboard.suggestions.main.title')}
        description={t('dashboard.suggestions.main.desc')}
        actions={(
          <ConfigFormActions
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={() => reset(config.suggestionSettings)}
            saveLabel={t('dashboard.suggestions.main.save')}
          />
        )}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <div className="mt-6 space-y-4">
          <ValidationSummary errors={[...validationErrors, ...missingSelections]} />
          {!inventoryState.hasInventory ? (
            <InventoryNotice
              title={t('dashboard.suggestions.notices.emptyTitle')}
              message={t('dashboard.suggestions.notices.emptyMessage')}
            />
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          <ToggleCard
            title={t('dashboard.suggestions.destinations.enableLabel')}
            description={t('dashboard.suggestions.destinations.enableDesc')}
          >
            <input type="checkbox" {...register('enabled')} className="dashboard-module-checkbox mt-1" />
          </ToggleCard>

          <FormSection
            title={t('dashboard.suggestions.destinations.title')}
            description={t('dashboard.suggestions.destinations.desc')}
          >
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['channelId', t('dashboard.suggestions.destinations.base.label'), t('dashboard.suggestions.destinations.base.hint')],
                ['logChannelId', t('dashboard.suggestions.destinations.logs.label'), t('dashboard.suggestions.destinations.logs.hint')],
                ['approvedChannelId', t('dashboard.suggestions.destinations.approved.label'), t('dashboard.suggestions.destinations.approved.hint')],
                ['rejectedChannelId', t('dashboard.suggestions.destinations.rejected.label'), t('dashboard.suggestions.destinations.rejected.hint')],
              ].map(([field, label, hint]) => (
                <FieldShell key={field} label={label} hint={hint} error={errors[field as keyof typeof errors]?.message as string | undefined}>
                  <select {...register(field as keyof SuggestionSettings)} disabled={!enabled} className="w-full rounded-2xl border dashboard-module-select">
                    <option value="">{t('dashboard.suggestions.notConfigured')}</option>
                    {channelOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </FieldShell>
              ))}
            </div>
          </FormSection>
        </div>
      </PanelCard>

      <PanelCard title={t('dashboard.suggestions.moderation.title')} description={t('dashboard.suggestions.moderation.desc')}>
        <div className="space-y-6">
          <FieldShell
            label={t('dashboard.suggestions.moderation.cooldown.label')}
            hint={t('dashboard.suggestions.moderation.cooldown.hint')}
            error={errors.cooldownMinutes?.message}
          >
            <input type="number" min={0} max={1440} {...register('cooldownMinutes', { valueAsNumber: true })} className="dashboard-form-field" />
          </FieldShell>

          {[
            ['dmOnResult', t('dashboard.suggestions.moderation.dm.label'), t('dashboard.suggestions.moderation.dm.desc')],
            ['requireReason', t('dashboard.suggestions.moderation.reason.label'), t('dashboard.suggestions.moderation.reason.desc')],
            ['anonymous', t('dashboard.suggestions.moderation.anonymous.label'), t('dashboard.suggestions.moderation.anonymous.desc')],
          ].map(([field, label, description]) => (
            <ToggleCard key={field} title={label} description={description}>
              <input type="checkbox" {...register(field as keyof SuggestionSettings)} className="dashboard-module-checkbox mt-1" />
            </ToggleCard>
          ))}
        </div>
      </PanelCard>
    </form>
  );
}
