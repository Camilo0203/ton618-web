import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Command, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { flattenFormErrors, getInventoryState } from '../validation';

const commandOverrideRowSchema = z.object({
  commandName: z.string().trim().min(1).max(64),
  maxActions: z.number().int().min(1).max(50),
  windowSeconds: z.number().int().min(1).max(300),
  enabled: z.boolean(),
});

const baseCommandModuleSchema = commandSettingsSchema.extend({
  overrides: z.array(commandOverrideRowSchema).max(12),
});

type CommandModuleValues = z.infer<typeof baseCommandModuleSchema>;

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
  const { t } = useTranslation();
  const commandOptions = getCommandOptions(inventory);

  const schema = useMemo(() => baseCommandModuleSchema.superRefine((value, context) => {
    const duplicateCommands = value.overrides
      .map((override) => override.commandName)
      .filter((command, index, commands) => commands.indexOf(command) !== index);

    if (duplicateCommands.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('dashboard.commands.validation.duplicateOverride', { commands: Array.from(new Set(duplicateCommands)).join(', ') }),
        path: ['overrides'],
      });
    }
  }), [t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CommandModuleValues>({
    resolver: zodResolver(schema),
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
  const validationErrors = flattenFormErrors(errors);
  const inventoryState = getInventoryState(inventory);
  const commandNames = new Set(commandOptions.map((command) => command.value));
  const missingDisabledCommands = config.commandSettings.disabledCommands
    .filter((command) => !commandNames.has(command))
    .map((command) => t('dashboard.commands.validation.missingDisabled', { command }));
  const missingOverrides = Object.keys(config.commandSettings.commandRateLimitOverrides)
    .filter((command) => !commandNames.has(command))
    .map((command) => t('dashboard.commands.validation.missingOverride', { command }));

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={t('dashboard.commands.onboarding.eyebrow')}
        title={t('dashboard.commands.onboarding.title')}
        description={t('dashboard.commands.onboarding.desc')}
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
        eyebrow={t('dashboard.commands.main.eyebrow')}
        title={t('dashboard.commands.main.title')}
        description={t('dashboard.commands.main.desc')}
        actions={(
          <ConfigFormActions
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={() => reset(toFormValues(config.commandSettings))}
            saveLabel={t('dashboard.commands.main.save')}
          />
        )}
      >
        <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
        <div className="mt-6 space-y-4">
          <ValidationSummary errors={[...validationErrors, ...missingDisabledCommands, ...missingOverrides]} />
          {!inventoryState.hasInventory ? (
            <InventoryNotice
              title={t('dashboard.commands.notices.emptyTitle')}
              message={t('dashboard.commands.notices.emptyMessage')}
            />
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          <FormSection
            title={t('dashboard.commands.policy.title')}
            description={t('dashboard.commands.policy.desc')}
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['rateLimitEnabled', t('dashboard.commands.policy.rateLimitEnabled.label'), t('dashboard.commands.policy.rateLimitEnabled.desc')],
                ['rateLimitBypassAdmin', t('dashboard.commands.policy.rateLimitBypassAdmin.label'), t('dashboard.commands.policy.rateLimitBypassAdmin.desc')],
                ['commandRateLimitEnabled', t('dashboard.commands.policy.commandRateLimitEnabled.label'), t('dashboard.commands.policy.commandRateLimitEnabled.desc')],
                ['simpleHelpMode', t('dashboard.commands.policy.simpleHelpMode.label'), t('dashboard.commands.policy.simpleHelpMode.desc')],
              ].map(([field, label, description]) => (
                <ToggleCard key={field} title={label} description={description}>
                  <input type="checkbox" {...register(field as keyof CommandModuleValues)} className="dashboard-module-checkbox mt-1" />
                </ToggleCard>
              ))}
            </div>
          </FormSection>

          <FormSection
            title={t('dashboard.commands.limits.title')}
            description={t('dashboard.commands.limits.desc')}
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['rateLimitWindowSeconds', t('dashboard.commands.limits.rateLimitWindowSeconds'), 3, 120],
                ['rateLimitMaxActions', t('dashboard.commands.limits.rateLimitMaxActions'), 1, 50],
                ['commandRateLimitWindowSeconds', t('dashboard.commands.limits.commandRateLimitWindowSeconds'), 1, 300],
                ['commandRateLimitMaxActions', t('dashboard.commands.limits.commandRateLimitMaxActions'), 1, 50],
              ].map(([field, label, min, max]) => (
                <FieldShell key={String(field)} label={String(label)}>
                  <input type="number" min={Number(min)} max={Number(max)} {...register(field as keyof CommandModuleValues, { valueAsNumber: true })} className="dashboard-form-field" />
                </FieldShell>
              ))}
            </div>
          </FormSection>
        </div>
      </PanelCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PanelCard title={t('dashboard.commands.disabled.title')} description={t('dashboard.commands.disabled.desc')}>
          <div className="grid max-h-[28rem] gap-3 overflow-auto pr-2 md:grid-cols-2">
            {commandOptions.length ? (
              commandOptions.map((command) => {
                const checked = disabledCommands.includes(command.value);

                return (
                  <label
                    key={command.value}
                    className="dashboard-module-card flex items-start gap-3"
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
                      className="dashboard-module-checkbox mt-1"
                    />
                    <span>
                      <span className="block font-semibold text-white">
                        /{command.value}
                      </span>
                      {command.category ? (
                        <span className="mt-1 block text-sm text-slate-300">
                          {command.category}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="dashboard-module-empty">
                {t('dashboard.commands.disabled.empty')}
              </div>
            )}
          </div>
        </PanelCard>

        <PanelCard
          title={t('dashboard.commands.overrides.title')}
          description={t('dashboard.commands.overrides.desc')}
          actions={(
            <button
              type="button"
              onClick={() => append({ commandName: commandOptions[0]?.value ?? 'ping', maxActions: 4, windowSeconds: 20, enabled: true })}
              className="dashboard-module-button"
            >
              <Plus className="h-4 w-4" />
              {t('dashboard.commands.overrides.add')}
            </button>
          )}
        >
          <div className="space-y-4">
            {fields.length ? (
              fields.map((field, index) => (
                <div key={field.id} className="dashboard-module-card grid gap-4 md:grid-cols-[1.1fr_0.7fr_0.7fr_auto_auto]">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">{t('dashboard.commands.overrides.command')}</span>
                    <select {...register(`overrides.${index}.commandName`)} className="dashboard-form-field">
                      {commandOptions.map((option) => (
                        <option key={option.value} value={option.value}>/{option.value}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">{t('dashboard.commands.overrides.max')}</span>
                    <input type="number" min={1} max={50} {...register(`overrides.${index}.maxActions`, { valueAsNumber: true })} className="dashboard-form-field" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">{t('dashboard.commands.overrides.window')}</span>
                    <input type="number" min={1} max={300} {...register(`overrides.${index}.windowSeconds`, { valueAsNumber: true })} className="dashboard-form-field" />
                  </label>
                  <label className="dashboard-module-card flex items-center justify-center gap-2 text-sm font-semibold text-white">
                    <input type="checkbox" {...register(`overrides.${index}.enabled`)} className="dashboard-module-checkbox" />
                    {t('dashboard.commands.overrides.active')}
                  </label>
                  <button type="button" onClick={() => remove(index)} className="dashboard-module-button dashboard-module-button-danger inline-flex items-center justify-center rounded-2xl px-4 py-3">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="dashboard-module-empty">
                {t('dashboard.commands.overrides.empty')}
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </form>
  );
}
