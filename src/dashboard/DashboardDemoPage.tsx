import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardModuleViewport from './components/DashboardModuleViewport';
import DashboardShell from './components/DashboardShell';
import { usePersistentDashboardSection } from './hooks/usePersistentDashboardSection';
import { createDemoSnapshot, demoDashboardGuild, demoDashboardUser } from './demoSnapshot';
import type {
  ConfigMutationSectionId,
  GuildBackupManifest,
  GuildConfig,
  GuildConfigMutation,
  GuildDashboardSnapshot,
} from './types';
import { getDashboardSectionStates } from './utils';

type SectionConfigKey =
  | 'serverRolesChannelsSettings'
  | 'ticketsSettings'
  | 'verificationSettings'
  | 'welcomeSettings'
  | 'suggestionSettings'
  | 'modlogSettings'
  | 'commandSettings'
  | 'systemSettings';

const CONFIG_SECTION_MAP: Record<Exclude<ConfigMutationSectionId, 'general'>, SectionConfigKey> = {
  server_roles_channels: 'serverRolesChannelsSettings',
  tickets: 'ticketsSettings',
  verification: 'verificationSettings',
  welcome: 'welcomeSettings',
  suggestions: 'suggestionSettings',
  modlogs: 'modlogSettings',
  commands: 'commandSettings',
  system: 'systemSettings',
};

function createMutation(
  snapshot: GuildDashboardSnapshot,
  mutationType: GuildConfigMutation['mutationType'],
  section: string,
  requestedPayload: unknown,
): GuildConfigMutation {
  const now = new Date().toISOString();
  return {
    id: `demo-${mutationType}-${section}-${Date.now()}`,
    guildId: snapshot.config.guildId,
    actorUserId: demoDashboardUser.id,
    mutationType,
    section,
    status: 'applied',
    requestedPayload,
    appliedPayload: requestedPayload,
    metadata: {
      source: 'demo',
    },
    errorMessage: null,
    requestedAt: now,
    appliedAt: now,
    failedAt: null,
    supersededAt: null,
    updatedAt: now,
  };
}

function withAppliedMutation(
  snapshot: GuildDashboardSnapshot,
  mutation: GuildConfigMutation,
  overrides?: Partial<GuildDashboardSnapshot>,
): GuildDashboardSnapshot {
  const now = mutation.appliedAt ?? mutation.updatedAt;
  return {
    ...snapshot,
    ...overrides,
    mutations: [mutation, ...snapshot.mutations].slice(0, 20),
    syncStatus: snapshot.syncStatus
      ? {
        ...snapshot.syncStatus,
        lastMutationProcessedAt: now,
        updatedAt: now,
      }
      : snapshot.syncStatus,
  };
}

function applyDemoConfigChange(
  snapshot: GuildDashboardSnapshot,
  section: ConfigMutationSectionId,
  payload: unknown,
): GuildDashboardSnapshot {
  const now = new Date().toISOString();

  let nextConfig: GuildConfig = snapshot.config;
  if (section === 'general') {
    const values = (payload ?? {}) as Partial<Pick<GuildConfig, 'generalSettings' | 'dashboardPreferences'>>;
    nextConfig = {
      ...snapshot.config,
      generalSettings: {
        ...snapshot.config.generalSettings,
        ...(values.generalSettings ?? {}),
      },
      dashboardPreferences: {
        ...snapshot.config.dashboardPreferences,
        ...(values.dashboardPreferences ?? {}),
      },
      updatedBy: demoDashboardUser.id,
      updatedAt: now,
      configSource: 'dashboard-demo',
    };
  } else {
    const configKey = CONFIG_SECTION_MAP[section];
    nextConfig = {
      ...snapshot.config,
      [configKey]: {
        ...snapshot.config[configKey],
        ...((payload ?? {}) as Record<string, unknown>),
      },
      updatedBy: demoDashboardUser.id,
      updatedAt: now,
      configSource: 'dashboard-demo',
    };
  }

  return withAppliedMutation(
    snapshot,
    createMutation(snapshot, 'config', section, payload),
    {
      config: nextConfig,
      events: [
        {
          id: `demo-event-config-${Date.now()}`,
          guildId: snapshot.config.guildId,
          eventType: 'config',
          title: 'Cambio demo aplicado',
          description: `La seccion ${section} se actualizo dentro del demo operativo.`,
          metadata: { section },
          createdAt: now,
        },
        ...snapshot.events,
      ].slice(0, 20),
    },
  );
}

function applyDemoBackupAction(
  snapshot: GuildDashboardSnapshot,
  action: 'create_backup' | 'restore_backup',
  backupId?: string,
): GuildDashboardSnapshot {
  const now = new Date().toISOString();

  if (action === 'create_backup') {
    const nextBackup: GuildBackupManifest = {
      backupId: `backup-demo-${snapshot.backups.length + 1}`,
      guildId: snapshot.config.guildId,
      actorUserId: demoDashboardUser.id,
      source: 'manual',
      schemaVersion: 2,
      exportedAt: now,
      createdAt: now,
      metadata: {
        source: 'dashboard-demo',
      },
    };

    return withAppliedMutation(
      snapshot,
      createMutation(snapshot, 'backup', 'system', { action }),
      {
        backups: [nextBackup, ...snapshot.backups].slice(0, 10),
        syncStatus: snapshot.syncStatus
          ? {
            ...snapshot.syncStatus,
            lastBackupAt: now,
          }
          : snapshot.syncStatus,
      },
    );
  }

  return withAppliedMutation(
    snapshot,
    createMutation(snapshot, 'backup', 'system', { action, backupId: backupId ?? null }),
    {
      events: [
        {
          id: `demo-event-backup-${Date.now()}`,
          guildId: snapshot.config.guildId,
          eventType: 'backup',
          title: 'Restore demo ejecutado',
          description: `Se simulo la restauracion del backup ${backupId ?? 'desconocido'}.`,
          metadata: { backupId: backupId ?? null },
          createdAt: now,
        },
        ...snapshot.events,
      ].slice(0, 20),
    },
  );
}

export default function DashboardDemoPage() {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<GuildDashboardSnapshot>(() => createDemoSnapshot());
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedGuildId = demoDashboardGuild.guildId;
  const { activeSection, setActiveSection } = usePersistentDashboardSection(
    selectedGuildId,
    snapshot.config.dashboardPreferences.defaultSection,
  );

  const sectionStates = useMemo(
    () =>
      getDashboardSectionStates(
        snapshot.config,
        demoDashboardGuild,
        snapshot.syncStatus,
        snapshot.backups,
        snapshot.mutations,
        snapshot.playbooks,
      ),
    [snapshot],
  );

  return (
    <>
      <Helmet>
        <title>{`${t('dashboard.pageTitle')} | Demo Ops Console | ${demoDashboardGuild.guildName}`}</title>
        <meta
          name="description"
          content="Demo operativo del dashboard de TON618 con inbox, playbooks vivos, SLA e incident mode."
        />
      </Helmet>
      <DashboardShell
        user={demoDashboardUser}
        guilds={[demoDashboardGuild]}
        selectedGuild={demoDashboardGuild}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onGuildChange={() => undefined}
        onSync={() => {
          setIsSyncing(true);
          setTimeout(() => {
            setSnapshot((current) => ({
              ...current,
              syncStatus: current.syncStatus
                ? {
                  ...current.syncStatus,
                  bridgeStatus: 'healthy',
                  bridgeMessage: 'Demo sync completed successfully.',
                  lastHeartbeatAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
                : current.syncStatus,
            }));
            setIsSyncing(false);
          }, 450);
        }}
        onLogout={() => undefined}
        isSyncing={isSyncing}
        syncStatus={snapshot.syncStatus}
        pendingMutations={snapshot.mutations.filter((mutation) => mutation.status === 'pending').length}
        failedMutations={snapshot.mutations.filter((mutation) => mutation.status === 'failed').length}
        sectionStates={sectionStates}
      >
        <DashboardModuleViewport
          activeSection={activeSection}
          selectedGuild={demoDashboardGuild}
          invalidRequestedGuildId={null}
          fallbackGuildId={null}
          setSelectedGuildId={() => undefined}
          syncGuildAccess={() => undefined}
          isSyncing={isSyncing}
          snapshot={snapshot}
          snapshotErrorMessage=""
          isSnapshotLoading={false}
          isSnapshotError={false}
          refetchSnapshot={() => setSnapshot(createDemoSnapshot())}
          requestConfigChangePending={false}
          requestConfigChangeErrorMessage=""
          requestConfigChangeErrorSection={null}
          requestBackupActionPending={false}
          onSectionChange={setActiveSection}
          onConfigSave={async (section, payload) => {
            setSnapshot((current) => applyDemoConfigChange(current, section, payload));
          }}
          onCreateBackup={async () => {
            setSnapshot((current) => applyDemoBackupAction(current, 'create_backup'));
          }}
          onRestoreBackup={async (backupId) => {
            setSnapshot((current) => applyDemoBackupAction(current, 'restore_backup', backupId));
          }}
        />
      </DashboardShell>
    </>
  );
}
