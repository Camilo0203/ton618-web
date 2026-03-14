import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Settings2 } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import {
  dashboardPreferencesSchema,
  generalSettingsSchema,
} from '../schemas';
import type {
  DashboardGuild,
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
  onSave,
}: GeneralModuleProps) {
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

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Instalacion requerida"
        title="Invita el bot antes de editar configuraciones"
        description="Cuando el bot este instalado en este servidor podremos mantener idioma, invocacion y preferencias persistentes del panel."
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
        eyebrow="General"
        title="Identidad operativa del servidor"
        description="Define idioma, modo de invocacion del bot y la experiencia principal del panel."
        actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
        variant="highlight"
        stickyActions
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Idioma base
            </span>
            <select
              {...register('generalSettings.language')}
              className="dashboard-form-field"
            >
              <option value="es">Espanol</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Zona horaria
            </span>
            <input
              {...register('generalSettings.timezone')}
              placeholder="America/Bogota"
              className="dashboard-form-field"
            />
            {errors.generalSettings?.timezone ? (
              <span className="mt-2 block text-sm text-rose-500">
                {errors.generalSettings.timezone.message}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Modo de comandos
            </span>
            <select
              {...register('generalSettings.commandMode')}
              className="dashboard-form-field"
            >
              <option value="mention">Mencion del bot</option>
              <option value="prefix">Prefijo</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Prefijo
            </span>
            <input
              {...register('generalSettings.prefix')}
              disabled={commandMode !== 'prefix'}
              placeholder="!"
              className="dashboard-form-field"
            />
            {errors.generalSettings?.prefix ? (
              <span className="mt-2 block text-sm text-rose-500">
                {errors.generalSettings.prefix.message}
              </span>
            ) : null}
          </label>
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Preset general de moderacion
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {[
              ['relaxed', 'Relajado', 'Mas flexible y menos intervencion automatica.'],
              ['balanced', 'Balanceado', 'Equilibrio entre proteccion y comodidad.'],
              ['strict', 'Estricto', 'Mas disciplina y menos tolerancia al ruido.'],
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
                <span className="block text-lg font-semibold text-slate-950 dark:text-white">
                  {title}
                </span>
                <span className="mt-2 block text-sm text-slate-600 dark:text-slate-300">
                  {description}
                </span>
              </label>
            ))}
          </div>
        </div>
      </PanelCard>

      <PanelCard
        eyebrow="Panel"
        title="Preferencias de trabajo"
        description="Ajustes que cambian como se siente la dashboard para el staff."
        variant="soft"
      >
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Modulo inicial
            </span>
            <select
              {...register('dashboardPreferences.defaultSection')}
              className="dashboard-form-field"
            >
              <option value="overview">Resumen</option>
              <option value="inbox">Bandeja viva</option>
              <option value="general">General</option>
              <option value="server_roles">Servidor y roles</option>
              <option value="tickets">Tickets y SLA</option>
              <option value="verification">Verificacion</option>
              <option value="welcome">Bienvenida</option>
              <option value="suggestions">Sugerencias</option>
              <option value="modlogs">Modlogs</option>
              <option value="commands">Comandos</option>
              <option value="system">Sistema</option>
              <option value="activity">Actividad</option>
              <option value="analytics">Analitica</option>
            </select>
          </label>

          <label className="dashboard-toggle-card flex items-start gap-3">
            <input
              type="checkbox"
              {...register('dashboardPreferences.compactMode')}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-white">
                Modo compacto
              </span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                Reduce densidad visual para sesiones largas de moderacion.
              </span>
            </span>
          </label>

          <label className="dashboard-toggle-card flex items-start gap-3">
            <input
              type="checkbox"
              {...register('dashboardPreferences.showAdvancedCards')}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-white">
                Tarjetas avanzadas
              </span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                Muestra contexto extra, recomendaciones y salud operativa ampliada.
              </span>
            </span>
          </label>

          <div className="rounded-[1.5rem] border border-brand-200/70 bg-brand-50/75 p-4 text-sm text-brand-800 dark:border-brand-900/50 dark:bg-brand-950/20 dark:text-brand-200">
            Los cambios se envian a una cola auditada. El bot los aplica y confirma despues en la vista Resumen.
          </div>
        </div>
      </PanelCard>
    </form>
  );
}
