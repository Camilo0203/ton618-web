import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
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
import DiscordMessagePreview from '../components/DiscordMessagePreview';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { welcomeSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
  WelcomeSettings,
} from '../types';
import { getChannelOptions, getRoleOptions } from '../utils';
import { findMissingSelections, flattenFormErrors, getInventoryState } from '../validation';

type WelcomeModuleValues = z.infer<typeof welcomeSettingsSchema>;

interface WelcomeModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: WelcomeSettings) => Promise<void>;
}

export default function WelcomeModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: WelcomeModuleProps) {
  const { t } = useTranslation();
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const roleOptions = getRoleOptions(inventory);

  const methods = useForm<WelcomeModuleValues>({
    resolver: zodResolver(welcomeSettingsSchema) as never,
    defaultValues: config.welcomeSettings,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = methods;

  useEffect(() => {
    reset(config.welcomeSettings);
  }, [config.welcomeSettings, reset]);

  const welcomeEnabled = watch('welcomeEnabled');
  const goodbyeEnabled = watch('goodbyeEnabled');
  
  // Watch fields for live preview
  const welcomeTitle = watch('welcomeTitle');
  const welcomeMessage = watch('welcomeMessage');
  const welcomeColor = watch('welcomeColor');
  const welcomeBanner = watch('welcomeBanner');
  const welcomeFooter = watch('welcomeFooter');
  const welcomeThumbnail = watch('welcomeThumbnail');

  const goodbyeTitle = watch('goodbyeTitle');
  const goodbyeMessage = watch('goodbyeMessage');
  const goodbyeColor = watch('goodbyeColor');
  const goodbyeFooter = watch('goodbyeFooter');
  const goodbyeThumbnail = watch('goodbyeThumbnail');
  const validationErrors = flattenFormErrors(errors);
  const inventoryState = getInventoryState(inventory);
  const missingSelections = [
    ...findMissingSelections(
      [
        { label: t('dashboard.welcome.welcome.channelLabel'), value: config.welcomeSettings.welcomeChannelId },
        { label: t('dashboard.welcome.goodbye.channelLabel'), value: config.welcomeSettings.goodbyeChannelId },
      ],
      channelOptions,
    ),
    ...findMissingSelections(
      [{ label: t('dashboard.welcome.welcome.autoroleLabel'), value: config.welcomeSettings.welcomeAutoroleId }],
      roleOptions,
    ),
  ];

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.welcome.onboarding.eyebrow')}
        title={t('dashboard.welcome.onboarding.title')}
        description={t('dashboard.welcome.onboarding.desc')}
        icon={Sparkles}
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
      className="grid gap-6 xl:grid-cols-2"
    >
      <PanelCard
        eyebrow={t('dashboard.welcome.main.eyebrow')}
        title={t('dashboard.welcome.main.title')}
        description={t('dashboard.welcome.main.desc')}
        actions={(
          <ConfigFormActions
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={() => reset(config.welcomeSettings)}
            saveLabel={t('dashboard.welcome.main.save')}
          />
        )}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <div className="mt-6 space-y-4">
          <ValidationSummary errors={[...validationErrors, ...missingSelections]} />
          {!inventoryState.hasInventory ? (
            <InventoryNotice
              title={t('dashboard.welcome.notices.emptyTitle')}
              message={t('dashboard.welcome.notices.emptyMessage')}
            />
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          <ToggleCard
            title={t('dashboard.welcome.welcome.enableLabel')}
            description={t('dashboard.welcome.welcome.enableDesc')}
          >
            <input type="checkbox" {...register('welcomeEnabled')} className="dashboard-module-checkbox mt-1" />
          </ToggleCard>

          <FormSection
            title={t('dashboard.welcome.welcome.sectionTitle')}
            description={t('dashboard.welcome.welcome.sectionDesc')}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label={t('dashboard.welcome.welcome.channelLabel')} error={errors.welcomeChannelId?.message}>
                <DashboardSelect
                  name="welcomeChannelId"
                  disabled={!welcomeEnabled}
                  options={channelOptions}
                  placeholder={t('dashboard.welcome.notConfigured')}
                />
              </FieldShell>
              <FieldShell label={t('dashboard.welcome.welcome.autoroleLabel')}>
                <DashboardSelect
                  name="welcomeAutoroleId"
                  disabled={!welcomeEnabled}
                  options={roleOptions}
                  placeholder={t('dashboard.welcome.notConfigured')}
                />
              </FieldShell>
            </div>

            <div className="mb-8 rounded-xl border border-white/5 bg-[#05060f]/40 p-1">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Live Preview
                </p>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-rose-500/80" />
                  <div className="h-2 w-2 rounded-full bg-amber-500/80" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
                </div>
              </div>
              <div className="p-4 flex justify-center bg-[#1e1f22]/30">
                <DiscordMessagePreview
                  botName="TON618"
                  embed={{
                    title: welcomeTitle || 'Welcome to the server!',
                    description: welcomeMessage || 'We are glad to have you here. Please read the rules.',
                    color: welcomeColor || '#5865F2',
                    footer: welcomeFooter,
                    thumbnail: welcomeThumbnail,
                    image: welcomeBanner,
                  }}
                />
              </div>
            </div>

            <FieldShell label={t('dashboard.welcome.welcome.titleLabel')}>
              <input {...register('welcomeTitle')} className="dashboard-form-field" />
            </FieldShell>
            <FieldShell label={t('dashboard.welcome.welcome.messageLabel')}>
              <textarea {...register('welcomeMessage')} rows={4} className="dashboard-form-field" />
            </FieldShell>
            <div className="grid gap-5 md:grid-cols-2">
              <FieldShell label={t('dashboard.welcome.welcome.colorLabel')} error={errors.welcomeColor?.message}>
                <input {...register('welcomeColor')} className="dashboard-form-field" />
              </FieldShell>
              <FieldShell label={t('dashboard.welcome.welcome.bannerLabel')}>
                <input {...register('welcomeBanner')} placeholder={t('dashboard.welcome.welcome.bannerPlaceholder')} className="dashboard-form-field" />
              </FieldShell>
            </div>
            <FieldShell label={t('dashboard.welcome.welcome.footerLabel')}>
              <input {...register('welcomeFooter')} className="dashboard-form-field" />
            </FieldShell>
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleCard title={t('dashboard.welcome.welcome.thumbnailLabel')}>
                <input type="checkbox" {...register('welcomeThumbnail')} className="dashboard-module-checkbox mt-1" />
              </ToggleCard>
              <ToggleCard title={t('dashboard.welcome.welcome.dmLabel')}>
                <input type="checkbox" {...register('welcomeDm')} className="dashboard-module-checkbox mt-1" />
              </ToggleCard>
            </div>
            <FieldShell label={t('dashboard.welcome.welcome.dmMessageLabel')} error={errors.welcomeDmMessage?.message}>
              <textarea {...register('welcomeDmMessage')} rows={3} className="dashboard-form-field" />
            </FieldShell>
          </FormSection>
        </div>
      </PanelCard>

      <PanelCard title={t('dashboard.welcome.goodbye.title')} description={t('dashboard.welcome.goodbye.desc')}>
        <div className="space-y-5">
          <ToggleCard
            title={t('dashboard.welcome.goodbye.enableLabel')}
            description={t('dashboard.welcome.goodbye.enableDesc')}
          >
            <input type="checkbox" {...register('goodbyeEnabled')} className="dashboard-module-checkbox mt-1" />
          </ToggleCard>
          <FieldShell label={t('dashboard.welcome.goodbye.channelLabel')} error={errors.goodbyeChannelId?.message}>
            <DashboardSelect
              name="goodbyeChannelId"
              disabled={!goodbyeEnabled}
              options={channelOptions}
              placeholder={t('dashboard.welcome.notConfigured')}
            />
          </FieldShell>
          <div className="mb-8 rounded-xl border border-white/5 bg-[#05060f]/40 p-1">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Live Preview
              </p>
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-500/80" />
                <div className="h-2 w-2 rounded-full bg-amber-500/80" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
              </div>
            </div>
            <div className="p-4 flex justify-center bg-[#1e1f22]/30">
              <DiscordMessagePreview
                botName="TON618"
                embed={{
                  title: goodbyeTitle || 'Goodbye!',
                  description: goodbyeMessage || 'We are sad to see you go.',
                  color: goodbyeColor || '#ED4245',
                  footer: goodbyeFooter,
                  thumbnail: goodbyeThumbnail,
                }}
              />
            </div>
          </div>

          <FieldShell label={t('dashboard.welcome.goodbye.titleLabel')}>
            <input {...register('goodbyeTitle')} className="dashboard-form-field" />
          </FieldShell>
          <FieldShell label={t('dashboard.welcome.goodbye.messageLabel')}>
            <textarea {...register('goodbyeMessage')} rows={4} className="dashboard-form-field" />
          </FieldShell>
          <div className="grid gap-5 md:grid-cols-2">
            <FieldShell label={t('dashboard.welcome.goodbye.colorLabel')} error={errors.goodbyeColor?.message}>
              <input {...register('goodbyeColor')} className="dashboard-form-field" />
            </FieldShell>
            <ToggleCard title={t('dashboard.welcome.goodbye.thumbnailLabel')}>
              <input type="checkbox" {...register('goodbyeThumbnail')} className="dashboard-module-checkbox mt-1" />
            </ToggleCard>
          </div>
          <FieldShell label={t('dashboard.welcome.goodbye.footerLabel')}>
            <input {...register('goodbyeFooter')} className="dashboard-form-field" />
          </FieldShell>
        </div>
      </PanelCard>
    </form>
    </FormProvider>
  );
}
