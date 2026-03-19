import { Suspense, lazy } from 'react';
import { AlertTriangle, RefreshCcw, ServerCrash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StateCard from './StateCard';
import DashboardDegradationNotice from './DashboardDegradationNotice';
import type {
  ConfigMutationSectionId,
  DashboardGuild,
  DashboardPartialFailure,
  DashboardSectionId,
  GuildConfigMutation,
  GuildDashboardSnapshot,
  GuildSyncStatus,
  TicketDashboardActionId,
} from '../types';
import {
  getDashboardChecklist,
  getDashboardQuickActions,
  getDashboardSectionStates,
  getLatestBackupMutation,
  getLatestMutationForSection,
  type DashboardChecklistStep,
  type DashboardQuickAction,
  type DashboardSectionState,
} from '../utils';

const OverviewModule = lazy(() => import('../modules/OverviewModule'));
const InboxModule = lazy(() => import('../modules/InboxModule'));
const GeneralModule = lazy(() => import('../modules/GeneralModule'));
const ServerRolesModule = lazy(() => import('../modules/ServerRolesModule'));
const TicketsModule = lazy(() => import('../modules/TicketsModule'));
const VerificationModule = lazy(() => import('../modules/VerificationModule'));
const WelcomeModule = lazy(() => import('../modules/WelcomeModule'));
const SuggestionsModule = lazy(() => import('../modules/SuggestionsModule'));
const ModlogsModule = lazy(() => import('../modules/ModlogsModule'));
const CommandsModule = lazy(() => import('../modules/CommandsModule'));
const SystemModule = lazy(() => import('../modules/SystemModule'));
const ActivityModule = lazy(() => import('../modules/ActivityModule'));
const AnalyticsModule = lazy(() => import('../modules/AnalyticsModule'));

function ModuleFallback() {
  return (
    <div className="space-y-6">
      <div className="dashboard-skeleton h-72 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75" />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="dashboard-skeleton h-64 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75" />
          <div className="dashboard-skeleton h-80 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75" />
        </div>
        <div className="space-y-6">
          <div className="dashboard-skeleton h-56 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75" />
          <div className="dashboard-skeleton h-56 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75" />
        </div>
      </div>
    </div>
  );
}

interface DashboardModuleViewportProps {
  activeSection: DashboardSectionId;
  selectedGuild: DashboardGuild | null;
  invalidRequestedGuildId: string | null;
  fallbackGuildId: string | null;
  setSelectedGuildId: (guildId: string) => void;
  syncGuildAccess: () => void;
  isSyncing: boolean;
  snapshot: GuildDashboardSnapshot | undefined;
  snapshotErrorMessage: string;
  isSnapshotLoading: boolean;
  isSnapshotError: boolean;
  refetchSnapshot: () => void;
  requestConfigChangePending: boolean;
  requestBackupActionPending: boolean;
  requestTicketActionPending: boolean;
  onSectionChange: (section: DashboardSectionId) => void;
  onConfigSave: (section: ConfigMutationSectionId, payload: unknown) => Promise<void>;
  onCreateBackup: () => Promise<void>;
  onRestoreBackup: (backupId: string) => Promise<void>;
  onTicketAction: (action: TicketDashboardActionId, payload: Record<string, unknown>) => Promise<void>;
}

function buildDerivedViewModel(
  selectedGuild: DashboardGuild | null,
  snapshot: GuildDashboardSnapshot | undefined,
): {
  mutations: GuildConfigMutation[];
  syncStatus: GuildSyncStatus | null;
  sectionStates: DashboardSectionState[];
  checklist: DashboardChecklistStep[];
  quickActions: DashboardQuickAction[];
  backupMutation: GuildConfigMutation | null;
  partialFailures: DashboardPartialFailure[];
} {
  const mutations = snapshot?.mutations ?? [];
  const syncStatus = snapshot?.syncStatus ?? null;
  const sectionStates = snapshot && selectedGuild
    ? getDashboardSectionStates(snapshot.config, selectedGuild, syncStatus, snapshot.backups, mutations)
    : [];
  const checklist = snapshot && selectedGuild
    ? getDashboardChecklist(selectedGuild, sectionStates, snapshot.backups, syncStatus)
    : [];
  const quickActions = snapshot
    ? getDashboardQuickActions(sectionStates, checklist, syncStatus)
    : [];

  return {
    mutations,
    syncStatus,
    sectionStates,
    checklist,
    quickActions,
    backupMutation: getLatestBackupMutation(mutations),
    partialFailures: snapshot?.partialFailures ?? [],
  };
}

export default function DashboardModuleViewport({
  activeSection,
  selectedGuild,
  invalidRequestedGuildId,
  fallbackGuildId,
  setSelectedGuildId,
  syncGuildAccess,
  isSyncing,
  snapshot,
  snapshotErrorMessage,
  isSnapshotLoading,
  isSnapshotError,
  refetchSnapshot,
  requestConfigChangePending,
  requestBackupActionPending,
  requestTicketActionPending,
  onSectionChange,
  onConfigSave,
  onCreateBackup,
  onRestoreBackup,
  onTicketAction,
}: DashboardModuleViewportProps) {
  const { t } = useTranslation();
  const {
    sectionStates,
    checklist,
    quickActions,
    backupMutation,
    partialFailures,
  } = buildDerivedViewModel(selectedGuild, snapshot);

  if (invalidRequestedGuildId) {
    return (
      <StateCard
        eyebrow={t('dashboard.states.invalidGuild.eyebrow')}
        title={t('dashboard.states.invalidGuild.title')}
        description={t('dashboard.states.invalidGuild.description', { guildId: invalidRequestedGuildId })}
        icon={AlertTriangle}
        tone="warning"
        actions={(
          <>
            {fallbackGuildId ? (
              <button
                type="button"
                onClick={() => setSelectedGuildId(fallbackGuildId)}
                className="dashboard-primary-button"
              >
                {t('dashboard.actions.goToAvailableGuild')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={syncGuildAccess}
              disabled={isSyncing}
              className="dashboard-secondary-button"
            >
              <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {t('dashboard.actions.resyncAccess')}
            </button>
          </>
        )}
      />
    );
  }

  if (!selectedGuild) {
    return (
      <StateCard
        eyebrow={t('dashboard.states.noSelectedGuild.eyebrow')}
        title={t('dashboard.states.noSelectedGuild.title')}
        description={t('dashboard.states.noSelectedGuild.description')}
        icon={AlertTriangle}
      />
    );
  }

  if (isSnapshotError) {
    return (
      <StateCard
        eyebrow={t('dashboard.states.snapshotError.eyebrow')}
        title={t('dashboard.states.snapshotError.title')}
        description={snapshotErrorMessage}
        icon={ServerCrash}
        tone="danger"
        actions={(
          <>
            <button
              type="button"
              onClick={refetchSnapshot}
              className="dashboard-primary-button"
            >
              <RefreshCcw className="h-4 w-4" />
              {t('dashboard.actions.retrySnapshot')}
            </button>
            <button
              type="button"
              onClick={syncGuildAccess}
              disabled={isSyncing}
              className="dashboard-secondary-button"
            >
              <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {t('dashboard.actions.resyncServer')}
            </button>
          </>
        )}
      />
    );
  }

  if (isSnapshotLoading || !snapshot) {
    return <ModuleFallback />;
  }

  const activityFailure = partialFailures.find((failure) => failure.id === 'activity') ?? null;
  const metricsFailure = partialFailures.find((failure) => failure.id === 'metrics') ?? null;
  const inboxFailures = partialFailures.filter(
    (failure) => failure.id === 'ticket_events' || failure.id === 'ticket_macros',
  );

  return (
    <Suspense fallback={<ModuleFallback />}>
      <div className="space-y-6">
        <DashboardDegradationNotice failures={partialFailures} />

        {activeSection === 'overview' ? (
          <OverviewModule
            guild={selectedGuild}
            config={snapshot.config}
            events={snapshot.events}
            metrics={snapshot.metrics}
            mutations={snapshot.mutations}
            backups={snapshot.backups}
            syncStatus={snapshot.syncStatus}
            workspace={snapshot.ticketWorkspace}
            onSectionChange={onSectionChange}
            sectionStates={sectionStates}
            checklist={checklist}
            quickActions={quickActions}
            partialFailures={partialFailures}
          />
        ) : null}
        {activeSection === 'inbox' ? (
          <InboxModule
            guild={selectedGuild}
            workspace={snapshot.ticketWorkspace}
            mutation={snapshot.mutations.find((entry) => entry.mutationType === 'ticket_action') ?? null}
            syncStatus={snapshot.syncStatus}
            isMutating={requestTicketActionPending}
            onAction={onTicketAction}
            partialFailures={inboxFailures}
          />
        ) : null}
        {activeSection === 'general' ? (
          <GeneralModule
            guild={selectedGuild}
            config={snapshot.config}
            mutation={getLatestMutationForSection(snapshot.mutations, 'general')}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            onSave={(values) =>
              onConfigSave('general', {
                generalSettings: values.generalSettings,
                dashboardPreferences: values.dashboardPreferences,
              })
            }
          />
        ) : null}
        {activeSection === 'server_roles' ? (
          <ServerRolesModule
            guild={selectedGuild}
            config={snapshot.config}
            inventory={snapshot.inventory}
            mutation={getLatestMutationForSection(snapshot.mutations, 'server_roles_channels')}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            onSave={(values) => onConfigSave('server_roles_channels', values)}
          />
        ) : null}
        {activeSection === 'tickets' ? (
          <TicketsModule
            guild={selectedGuild}
            config={snapshot.config}
            inventory={snapshot.inventory}
            mutation={getLatestMutationForSection(snapshot.mutations, 'tickets')}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            onSave={(values) => onConfigSave('tickets', values)}
          />
        ) : null}
        {activeSection === 'verification' ? (
          <VerificationModule
            guild={selectedGuild}
            config={snapshot.config}
            inventory={snapshot.inventory}
            mutation={getLatestMutationForSection(snapshot.mutations, 'verification')}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            onSave={(values) => onConfigSave('verification', values)}
          />
        ) : null}
        {activeSection === 'welcome' ? (
          <WelcomeModule
            guild={selectedGuild}
            config={snapshot.config}
            inventory={snapshot.inventory}
            mutation={getLatestMutationForSection(snapshot.mutations, 'welcome')}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            onSave={(values) => onConfigSave('welcome', values)}
          />
        ) : null}
        {activeSection === 'suggestions' ? (
          <SuggestionsModule
            guild={selectedGuild}
            config={snapshot.config}
            inventory={snapshot.inventory}
            mutation={getLatestMutationForSection(snapshot.mutations, 'suggestions')}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            onSave={(values) => onConfigSave('suggestions', values)}
          />
        ) : null}
        {activeSection === 'modlogs' ? (
          <ModlogsModule
            guild={selectedGuild}
            config={snapshot.config}
            inventory={snapshot.inventory}
            mutation={getLatestMutationForSection(snapshot.mutations, 'modlogs')}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            onSave={(values) => onConfigSave('modlogs', values)}
          />
        ) : null}
        {activeSection === 'commands' ? (
          <CommandsModule
            guild={selectedGuild}
            config={snapshot.config}
            inventory={snapshot.inventory}
            mutation={getLatestMutationForSection(snapshot.mutations, 'commands')}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            onSave={(values) => onConfigSave('commands', values)}
          />
        ) : null}
        {activeSection === 'system' ? (
          <SystemModule
            guild={selectedGuild}
            config={snapshot.config}
            backups={snapshot.backups}
            mutation={getLatestMutationForSection(snapshot.mutations, 'system')}
            backupMutation={backupMutation}
            syncStatus={snapshot.syncStatus}
            isSaving={requestConfigChangePending}
            isRequestingBackup={requestBackupActionPending}
            onSave={(values) => onConfigSave('system', values)}
            onCreateBackup={onCreateBackup}
            onRestoreBackup={onRestoreBackup}
          />
        ) : null}
        {activeSection === 'activity' ? (
          <ActivityModule
            guild={selectedGuild}
            events={snapshot.events}
            mutations={snapshot.mutations}
            partialFailure={activityFailure}
          />
        ) : null}
        {activeSection === 'analytics' ? (
          <AnalyticsModule
            guild={selectedGuild}
            metrics={snapshot.metrics}
            partialFailure={metricsFailure}
          />
        ) : null}
      </div>
    </Suspense>
  );
}
