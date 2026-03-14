import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Command, Plus, Trash2 } from 'lucide-react';
import PanelCard from '../components/PanelCard';
import SaveRequestButton from '../components/SaveRequestButton';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { commandSettingsSchema } from '../schemas';
import type {
  CommandSettings,
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
} from '../types';
import { getCommandOptions } from '../utils';

const commandOverrideRowSchema = z.object({
  commandName: z.string().trim().min(1).max(64),
  maxActions: z.number().int().min(1).max(50),
  windowSeconds: z.number().int().min(1).max(300),
  enabled: z.boolean(),
});

const commandModuleSchema = commandSettingsSchema.extend({
  overrides: z.array(commandOverrideRowSchema).max(12),
});

type CommandModuleValues = z.infer<typeof commandModuleSchema>;

interface CommandsModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: CommandSettings) => Promise<void>;
}

function toFormValues(config: CommandSettings): CommandModuleValues {
  return {
    ...config,
    overrides: Object.entries(config.commandRateLimitOverrides).map(([commandName, override]) => ({
      commandName,
      maxActions: override.maxActions,
      windowSeconds: override.windowSeconds,
      enabled: override.enabled,
    })),
  };
}

export default function CommandsModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: CommandsModuleProps) {
  const commandOptions = getCommandOptions(inventory);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { isDirty },
  } = useForm<CommandModuleValues>({
    resolver: zodResolver(commandModuleSchema),
    defaultValues: toFormValues(config.commandSettings),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'overrides',
  });

  useEffect(() => {
    reset(toFormValues(config.commandSettings));
  }, [config.commandSettings, reset]);

  const disabledCommands = watch('disabledCommands');

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow="Onboarding"
        title="Instala el bot para gestionar comandos"
        description="La configuracion de comandos depende del inventario real y de los limites en runtime del bot."
        icon={Command}
        tone="warning"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave({
          disabledCommands: values.disabledCommands,
          simpleHelpMode: values.simpleHelpMode,
          rateLimitEnabled: values.rateLimitEnabled,
          rateLimitWindowSeconds: values.rateLimitWindowSeconds,
          rateLimitMaxActions: values.rateLimitMaxActions,
          rateLimitBypassAdmin: values.rateLimitBypassAdmin,
          commandRateLimitEnabled: values.commandRateLimitEnabled,
          commandRateLimitWindowSeconds: values.commandRateLimitWindowSeconds,
          commandRateLimitMaxActions: values.commandRateLimitMaxActions,
          commandRateLimitOverrides: Object.fromEntries(
            values.overrides.map((override) => [
              override.commandName,
              {
                maxActions: override.maxActions,
                windowSeconds: override.windowSeconds,
                enabled: override.enabled,
              },
            ]),
          ),
        });
      })}
      className="space-y-6"
    >
      <PanelCard
        eyebrow="Comandos"
        title="Disponibilidad y limites"
        description="Controla que comandos estan activos y como se rate-limitan en este servidor."
        actions={<SaveRequestButton isDirty={isDirty} isSaving={isSaving} />}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['rateLimitEnabled', 'Rate limit global'],
            ['rateLimitBypassAdmin', 'Admins sin limite'],
            ['commandRateLimitEnabled', 'Rate limit por comando'],
            ['simpleHelpMode', 'Help simple'],
          ].map(([field, label]) => (
            <label key={field} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70">
              <input type="checkbox" {...register(field as keyof CommandModuleValues)} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="block font-semibold text-slate-950 dark:text-white">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['rateLimitWindowSeconds', 'Ventana global (seg)', 3, 120],
            ['rateLimitMaxActions', 'Max acciones global', 1, 50],
            ['commandRateLimitWindowSeconds', 'Ventana comando (seg)', 1, 300],
            ['commandRateLimitMaxActions', 'Max acciones comando', 1, 50],
          ].map(([field, label, min, max]) => (
            <label key={field} className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
              <input type="number" min={Number(min)} max={Number(max)} {...register(field as keyof CommandModuleValues, { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-700" />
            </label>
          ))}
        </div>
      </PanelCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PanelCard title="Comandos deshabilitados" description="Checklist directo desde el inventario de comandos disponible.">
          <div className="grid max-h-[28rem] gap-3 overflow-auto pr-2 md:grid-cols-2">
            {commandOptions.length ? (
              commandOptions.map((command) => {
                const checked = disabledCommands.includes(command.value);

                return (
                  <label
                    key={command.value}
                    className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const next = new Set(disabledCommands);
                        if (event.target.checked) next.add(command.value);
                        else next.delete(command.value);
                        setValue('disabledCommands', Array.from(next).sort(), { shouldDirty: true });
                      }}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                      <span className="block font-semibold text-slate-950 dark:text-white">
                        /{command.value}
                      </span>
                      {command.category ? (
                        <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                          {command.category}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500 dark:border-surface-600 dark:bg-surface-700/40 dark:text-slate-400">
                El bot todavia no ha publicado inventario de comandos para este guild.
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard
          title="Overrides por comando"
          description="Ajustes finos sobre comandos concretos sin tocar el limite global."
          actions={(
            <button
              type="button"
              onClick={() => append({ commandName: commandOptions[0]?.value ?? 'ping', maxActions: 4, windowSeconds: 20, enabled: true })}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-surface-600 dark:bg-surface-700 dark:text-white"
            >
              <Plus className="h-4 w-4" />
              Agregar override
            </button>
          )}
        >
          <div className="space-y-4">
            {fields.length ? (
              fields.map((field, index) => (
                <div key={field.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-surface-600 dark:bg-surface-700/70 md:grid-cols-[1.1fr_0.7fr_0.7fr_auto_auto]">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Comando</span>
                    <select {...register(`overrides.${index}.commandName`)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-800">
                      {commandOptions.map((option) => (
                        <option key={option.value} value={option.value}>/{option.value}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Max</span>
                    <input type="number" min={1} max={50} {...register(`overrides.${index}.maxActions`, { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-800" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Ventana</span>
                    <input type="number" min={1} max={300} {...register(`overrides.${index}.windowSeconds`, { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400 dark:border-surface-600 dark:bg-surface-800" />
                  </label>
                  <label className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-surface-600 dark:bg-surface-800 dark:text-white">
                    <input type="checkbox" {...register(`overrides.${index}.enabled`)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    Activo
                  </label>
                  <button type="button" onClick={() => remove(index)} className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:bg-surface-800 dark:text-rose-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500 dark:border-surface-600 dark:bg-surface-700/40 dark:text-slate-400">
                Todavia no hay overrides. Puedes agregar uno y asignarlo a cualquier comando publicado por el bot.
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </form>
  );
}
