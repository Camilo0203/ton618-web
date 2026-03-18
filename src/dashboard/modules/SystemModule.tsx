import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArchiveRestore, HardDriveDownload, Wrench } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<SystemModuleValues>({
    resolver: zodResolver(systemSettingsSchema) as never,
    defaultValues: config.systemSettings,
  });

  useEffect(() => {
    reset(config.systemSettings);
  }, [config.systemSettings, reset]);

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Onboarding"
        title="Instala el bot para administrar el sistema"
        description="El modo mantenimiento y los backups dependen del bridge real del bot sobre Mongo y Supabase."
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
          eyebrow="Sistema"
          title="Mantenimiento y compatibilidad"
          description="Ajustes globales del bot y lectura del estado tecnico para saber si puedes seguir configurando con seguridad."
          actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
        >
          <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-5">
              <label className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
                <input type="checkbox" {...register('maintenanceMode')} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>
                  <span className="block font-semibold text-slate-950 dark:text-white">Modo mantenimiento</span>
                  <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">Detiene aperturas nuevas y deja visible el motivo configurado.</span>
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Motivo</span>
                <textarea {...register('maintenanceReason')} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['Bridge', syncStatus?.bridgeStatus ?? 'unknown'],
                ['Ultimo heartbeat', formatDateTime(syncStatus?.lastHeartbeatAt ?? guild.botLastSeenAt ?? null)],
                ['Ultimo inventario', formatDateTime(syncStatus?.lastInventoryAt ?? null)],
                ['Ultima config aplicada', formatDateTime(syncStatus?.lastConfigSyncAt ?? config.updatedAt ?? null)],
                ['Mutaciones pendientes', String(syncStatus?.pendingMutations ?? 0)],
                ['Mutaciones fallidas', String(syncStatus?.failedMutations ?? 0)],
              ].map(([label, value]) => (
                <article key={label} className="rounded-3xl border border-slate-200 bg-slate-50/90 p-5 dark:border-surface-600 dark:bg-surface-700/70">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{value}</p>
                </article>
              ))}
            </div>
          </div>
        </PanelCard>
      </form>

      <PanelCard
        title="Backups y restore"
        description="Crea una base segura antes de cambios grandes y restaura una version anterior si algo no queda como esperabas."
        actions={(
          <button
            type="button"
            onClick={() => void onCreateBackup()}
            disabled={isRequestingBackup}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HardDriveDownload className="h-4 w-4" />
            {isRequestingBackup ? 'Solicitando...' : 'Crear backup'}
          </button>
        )}
      >
        <SectionMutationBanner mutation={backupMutation} syncStatus={syncStatus} />

        <div className="mt-8 space-y-4">
          {backups.length ? (
            backups.map((backup) => (
              <article
                key={backup.backupId}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-5 dark:border-surface-600 dark:bg-surface-700/70 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">
                    {backup.source}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Exportado {formatRelativeTime(backup.exportedAt)}. Creado {formatDateTime(backup.createdAt)}.
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                    Backup ID: {backup.backupId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onRestoreBackup(backup.backupId)}
                  disabled={isRequestingBackup}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Restaurar
                </button>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-500 dark:border-surface-600 dark:bg-surface-700/40 dark:text-slate-400">
              Aun no existe un backup inicial. Crear uno ahora te deja un punto seguro antes de tocar tickets, verificacion o automatizaciones delicadas.
            </div>
          )}
        </div>
      </PanelCard>
    </div>
  );
}
