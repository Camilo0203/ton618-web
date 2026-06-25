import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import {
  ConfigFormActions,
  FieldShell,
  FormSection,
  InventoryNotice,
  ToggleCard,
  ValidationSummary,
} from '../components/ConfigForm';
import DashboardSelect from '../components/DashboardSelect';
import PanelCard from '../components/PanelCard';
import SectionMutationBanner from '../components/SectionMutationBanner';
import StateCard from '../components/StateCard';
import { automodSettingsSchema } from '../schemas';
import type {
  AutomodSettings,
  DashboardGuild,
  GuildConfig,
  GuildConfigMutation,
  GuildInventory,
  GuildSyncStatus,
} from '../types';
import { getChannelOptions, getRoleOptions } from '../utils';
import { flattenFormErrors, getInventoryState } from '../validation';

type AutomodModuleValues = z.infer<typeof automodSettingsSchema>;

interface AutomodModuleProps {
  guild: DashboardGuild;
  config: GuildConfig;
  inventory: GuildInventory;
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
  isSaving: boolean;
  onSave: (values: AutomodSettings) => Promise<void>;
}

const copy = {
  es: {
    eyebrow: 'AutoMod',
    onboardingTitle: 'Instala TON618 para activar AutoMod',
    onboardingDesc: 'La protección automática necesita que el bot esté dentro del servidor.',
    title: 'Protección automática',
    desc: 'Configura filtros contra spam, invitaciones, links, menciones masivas, mayúsculas y contenido sospechoso.',
    save: 'Guardar AutoMod',
    emptyTitle: 'No pude leer canales o roles',
    emptyMessage: 'Puedes guardar los filtros; vuelve a sincronizar para seleccionar canal de logs y rol de alerta.',
    enable: 'Activar AutoMod',
    enableDesc: 'TON618 revisará mensajes y aplicará la política elegida.',
    preset: 'Nivel de protección',
    off: 'Sin castigos automáticos',
    balanced: 'Balanceado',
    strict: 'Estricto',
    destinations: 'Alertas y trazabilidad',
    logChannel: 'Canal de logs',
    alertRole: 'Rol a mencionar en alertas',
    noChannel: 'Sin canal de logs',
    noRole: 'Sin rol de alerta',
    filters: 'Filtros activos',
    blockInvites: 'Bloquear invitaciones de Discord',
    blockLinks: 'Bloquear links',
    blockSpam: 'Bloquear spam repetido',
    blockMassMentions: 'Bloquear menciones masivas',
    blockCaps: 'Bloquear exceso de mayúsculas',
    scamProtection: 'Protección anti-scam',
    regexProtection: 'Reglas avanzadas / regex',
    proTitle: 'Listo para escalar',
    proDesc: 'FREE cubre protección básica; PRO puede usar reglas estrictas, anti-scam y ajustes avanzados desde un solo panel.',
  },
  en: {
    eyebrow: 'AutoMod',
    onboardingTitle: 'Install TON618 to enable AutoMod',
    onboardingDesc: 'Automatic protection needs the bot to be inside the server.',
    title: 'Automatic protection',
    desc: 'Configure filters against spam, invites, links, mass mentions, caps, and suspicious content.',
    save: 'Save AutoMod',
    emptyTitle: 'Channels or roles were not available',
    emptyMessage: 'You can save filters; resync to pick a log channel and alert role.',
    enable: 'Enable AutoMod',
    enableDesc: 'TON618 will review messages and apply the selected policy.',
    preset: 'Protection level',
    off: 'No automatic punishments',
    balanced: 'Balanced',
    strict: 'Strict',
    destinations: 'Alerts and traceability',
    logChannel: 'Log channel',
    alertRole: 'Role to mention in alerts',
    noChannel: 'No log channel',
    noRole: 'No alert role',
    filters: 'Active filters',
    blockInvites: 'Block Discord invites',
    blockLinks: 'Block links',
    blockSpam: 'Block repeated spam',
    blockMassMentions: 'Block mass mentions',
    blockCaps: 'Block excessive caps',
    scamProtection: 'Anti-scam protection',
    regexProtection: 'Advanced rules / regex',
    proTitle: 'Ready to scale',
    proDesc: 'FREE covers basic protection; PRO can use strict rules, anti-scam, and advanced tuning from one panel.',
  },
};

function useCopy() {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith('es') ? copy.es : copy.en;
}

export default function AutomodModule({
  guild,
  config,
  inventory,
  mutation,
  syncStatus,
  isSaving,
  onSave,
}: AutomodModuleProps) {
  const text = useCopy();
  const channelOptions = getChannelOptions(inventory, ['text', 'announcement', 'forum']);
  const roleOptions = getRoleOptions(inventory);
  const inventoryState = getInventoryState(inventory);

  const methods = useForm<AutomodModuleValues>({
    resolver: zodResolver(automodSettingsSchema) as never,
    defaultValues: config.automodSettings,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = methods;

  useEffect(() => {
    reset(config.automodSettings);
  }, [config.automodSettings, reset]);

  const enabled = watch('enabled');
  const validationErrors = flattenFormErrors(errors);

  if (!guild.botInstalled) {
    return (
      <StateCard
        eyebrow={text.eyebrow}
        title={text.onboardingTitle}
        description={text.onboardingDesc}
        icon={ShieldAlert}
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
        className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"
      >
        <PanelCard
          eyebrow={text.eyebrow}
          title={text.title}
          description={text.desc}
          actions={(
            <ConfigFormActions
              isDirty={isDirty}
              isSaving={isSaving}
              onReset={() => reset(config.automodSettings)}
              saveLabel={text.save}
            />
          )}
        >
          <SectionMutationBanner mutation={mutation} syncStatus={syncStatus} />
          <div className="mt-6 space-y-4">
            <ValidationSummary errors={validationErrors} />
            {!inventoryState.hasInventory ? (
              <InventoryNotice title={text.emptyTitle} message={text.emptyMessage} tone="neutral" />
            ) : null}
          </div>

          <div className="mt-8 space-y-5">
            <ToggleCard title={text.enable} description={text.enableDesc}>
              <input type="checkbox" {...register('enabled')} className="dashboard-module-checkbox mt-1" />
            </ToggleCard>

            <FieldShell label={text.preset} error={errors.preset?.message}>
              <select disabled={!enabled} {...register('preset')} className="dashboard-module-input">
                <option value="off">{text.off}</option>
                <option value="balanced">{text.balanced}</option>
                <option value="strict">{text.strict}</option>
              </select>
            </FieldShell>
          </div>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard title={text.destinations} description={text.proDesc}>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldShell label={text.logChannel} error={errors.logChannelId?.message}>
                <DashboardSelect
                  name="logChannelId"
                  disabled={!enabled}
                  options={channelOptions}
                  placeholder={text.noChannel}
                />
              </FieldShell>
              <FieldShell label={text.alertRole} error={errors.alertRoleId?.message}>
                <DashboardSelect
                  name="alertRoleId"
                  disabled={!enabled}
                  options={roleOptions}
                  placeholder={text.noRole}
                />
              </FieldShell>
            </div>
          </PanelCard>

          <PanelCard title={text.filters} description={text.proTitle}>
            <FormSection title={text.filters}>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['blockInvites', text.blockInvites],
                  ['blockLinks', text.blockLinks],
                  ['blockSpam', text.blockSpam],
                  ['blockMassMentions', text.blockMassMentions],
                  ['blockCaps', text.blockCaps],
                  ['scamProtection', text.scamProtection],
                  ['regexProtection', text.regexProtection],
                ].map(([field, label]) => (
                  <ToggleCard key={field} title={label}>
                    <input
                      type="checkbox"
                      disabled={!enabled}
                      {...register(field as keyof AutomodSettings)}
                      className="dashboard-module-checkbox mt-1"
                    />
                  </ToggleCard>
                ))}
              </div>
            </FormSection>
          </PanelCard>
        </div>
      </form>
    </FormProvider>
  );
}
