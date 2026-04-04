import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ArchiveRestore, HardDriveDownload, ShieldAlert, Wrench } from 'lucide-react';
import {
  ConfigFormActions,
  FieldShell,
  FormSection,
  ToggleCard,
  ValidationSummary,
} from '../components/ConfigForm';
import PanelCard from '../components/PanelCard';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { systemSettingsSchema } from '../schemas';
import type {
  DashboardGuild,
  GuildBackupManifest,
  GuildConfig,
  GuildConfigMutation,
  GuildSyncStatus,
  SystemSettings,
} from '../types';
import { formatDateTime, formatRelativeTime } from '../utils';
import { flattenFormErrors } from '../validation';

type SystemModuleValues = z.infer<typeof systemSettingsSchema>;

interface SystemModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  backups: GuildBackupManifest[];
  mutation: GuildConfigMutation | null;
  backupMutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  isRequestingBackup: boolean;
  onSave: (values: SystemSettings) => Promise<void>;
  onCreateBackup: () => Promise<void>;
  onRestoreBackup: (backupId: string) => Promise<void>;
}

export default function SystemModule({
  guild,
  config,
  backups,
  mutation,
  backupMutation,
  syncStatus,
  isSaving,
  isRequestingBackup,
  onSave,
  onCreateBackup,
  onRestoreBackup,
}: SystemModuleProps) {
  const { t } = useTranslation();

  const [restoreDraft, setRestoreDraft] = useState<string | null>(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<SystemModuleValues>({
    resolver: zodResolver(systemSettingsSchema) as never,
    defaultValues: config.systemSettings,
  });

  useEffect(() => {
    reset(config.systemSettings);
  }, [config.systemSettings, reset]);
  const maintenanceMode = watch('maintenanceMode');
  const validationErrors = flattenFormErrors(errors);
  const restoreTarget = useMemo(
    () => backups.find((backup) => backup.backupId === restoreDraft) ?? null,
    [backups, restoreDraft],
  );

  useEffect(() => {
    if (!restoreTarget) {
      setRestoreConfirmation('');
    }
  }, [restoreTarget]);

  const restoreKeyword = t('dashboard.system.restore.keyword');

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.system.onboarding.eyebrow')}
        title={t('dashboard.system.onboarding.title')}
        description={t('dashboard.system.onboarding.desc')}
        icon={Wrench}
        tone="warning"
      />
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSave(values);
        })}
      >
        <PanelCard
          eyebrow={t('dashboard.system.main.eyebrow')}
          title={t('dashboard.system.main.title')}
          description={t('dashboard.system.main.desc')}
          actions={(
            <ConfigFormActions
              isDirty={isDirty}
              isSaving={isSaving}
              onReset={() => reset(config.systemSettings)}
              saveLabel={t('dashboard.system.main.save')}
            />
          )}
        >
          <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
          <div className="mt-6">
            <ValidationSummary errors={validationErrors} />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-5">
              <ToggleCard
                title={t('dashboard.system.maintenance.label')}
                description={t('dashboard.system.maintenance.desc')}
              >
                <input type="checkbox" {...register('maintenanceMode')} className="dashboard-module-checkbox mt-1" />
              </ToggleCard>

              <FieldShell
                label={t('dashboard.system.maintenance.reasonLabel')}
                hint={t('dashboard.system.maintenance.reasonHint')}
                error={errors.maintenanceReason?.message}
              >
                <textarea
                  {...register('maintenanceReason')}
                  rows={4}
                  disabled={!maintenanceMode}
                  className="dashboard-form-field"
                />
              </FieldShell>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                [t('dashboard.system.sync.bridge'), syncStatus?.bridgeStatus ?? 'unknown'],
                [t('dashboard.system.sync.heartbeat'), formatDateTime(syncStatus?.lastHeartbeatAt ?? guild.botLastSeenAt ?? null)],
                [t('dashboard.system.sync.inventory'), formatDateTime(syncStatus?.lastInventoryAt ?? null)],
                [t('dashboard.system.sync.config'), formatDateTime(syncStatus?.lastConfigSyncAt ?? config.updatedAt ?? null)],
                [t('dashboard.system.sync.pendingMutations'), String(syncStatus?.pendingMutations ?? 0)],
                [t('dashboard.system.sync.failedMutations'), String(syncStatus?.failedMutations ?? 0)],
              ].map(([label, value]) => (
                <article key={label} className="dashboard-module-card p-5">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                </article>
              ))}
            </div>
          </div>
        </PanelCard>
      </form>

      <PanelCard
        title={t('dashboard.system.backups.title')}
        description={t('dashboard.system.backups.desc')}
        actions={(
          <button
            type="button"
            onClick={() => void onCreateBackup()}
            disabled={isRequestingBackup}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HardDriveDownload className="h-4 w-4" />
            {isRequestingBackup ? t('dashboard.system.backups.requesting') : t('dashboard.system.backups.create')}
          </button>
        )}
      >
        <SectionMutationBanner mutation={backupMutation} syncStatus={syncStatus} />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {backups.length ? (
              backups.map((backup) => (
                <article
                  key={backup.backupId}
                  className="dashboard-module-card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {backup.source}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {t('dashboard.system.backups.item.exported', { time: formatRelativeTime(backup.exportedAt) })}. {t('dashboard.system.backups.item.created', { time: formatDateTime(backup.createdAt) })}.
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {t('dashboard.system.backups.item.schema', { version: backup.schemaVersion })}.
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                      {t('dashboard.system.backups.item.id', { id: backup.backupId })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRestoreDraft(backup.backupId)}
                    disabled={isRequestingBackup}
                    className="dashboard-module-button disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ArchiveRestore className="h-4 w-4" />
                    {t('dashboard.system.backups.item.restore')}
                  </button>
                </article>
              ))
            ) : (
              <div className="dashboard-module-empty p-6">
                {t('dashboard.system.backups.empty')}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <PanelCard
              title={t('dashboard.system.restore.title')}
              description={t('dashboard.system.restore.desc')}
              variant="danger"
              className="h-full"
            >
              {restoreTarget ? (
                <div className="space-y-5">
                  <div className="dashboard-module-notice-danger">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{t('dashboard.system.restore.alertTitle')}</p>
                        <p className="mt-1 text-sm leading-6 opacity-90">
                          {t('dashboard.system.restore.alertDesc', { source: restoreTarget.source, time: formatDateTime(restoreTarget.exportedAt) })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormSection
                    title={t('dashboard.system.restore.confirmTitle')}
                    description={t('dashboard.system.restore.confirmDesc', { keyword: restoreKeyword, id: restoreTarget.backupId })}
                  >
                    <FieldShell label={t('dashboard.system.restore.confirmLabel')}>
                      <input
                        value={restoreConfirmation}
                        onChange={(event) => setRestoreConfirmation(event.target.value)}
                        className="dashboard-form-field"
                        placeholder={restoreKeyword}
                      />
                    </FieldShell>
                  </FormSection>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRestoreDraft(null);
                        setRestoreConfirmation('');
                      }}
                      className="dashboard-secondary-button"
                    >
                      {t('dashboard.system.restore.cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={isRequestingBackup || restoreConfirmation.trim().toUpperCase() !== restoreKeyword.toUpperCase()}
                      onClick={() => {
                        void onRestoreBackup(restoreTarget.backupId);
                        setRestoreDraft(null);
                        setRestoreConfirmation('');
                      }}
                      className="dashboard-primary-button"
                    >
                      <ArchiveRestore className="h-4 w-4" />
                      {t('dashboard.system.restore.submit')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dashboard-module-empty p-6 leading-6">
                  {t('dashboard.system.restore.empty')}
                </div>
              )}
            </PanelCard>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
