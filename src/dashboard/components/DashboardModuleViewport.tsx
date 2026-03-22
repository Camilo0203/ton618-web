import { Suspense, lazy } from 'react';
import { AlertTriangle, RefreshCcw, ServerCrash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StateCard from './StateCard';
import DashboardDegradationNotice from './DashboardDegradationNotice';
import ErrorBoundary from './ErrorBoundary';
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

function ConfigModuleFallback() {
  return (
    <div className="space-y-6">
      <div className="dashboard-skeleton h-52 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
        <div className="mb-4 h-6 w-48 rounded bg-white/40 dark:bg-surface-700/60" />
        <div className="h-4 w-full max-w-2xl rounded bg-white/30 dark:bg-surface-700/40" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="dashboard-skeleton h-80 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
          <div className="mb-6 h-5 w-32 rounded bg-white/40 dark:bg-surface-700/60" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded bg-white/30 dark:bg-surface-700/40" />
                <div className="h-10 rounded-lg bg-white/40 dark:bg-surface-700/60" />
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-skeleton h-80 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
          <div className="mb-6 h-5 w-32 rounded bg-white/40 dark:bg-surface-700/60" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded bg-white/30 dark:bg-surface-700/40" />
                <div className="h-10 rounded-lg bg-white/40 dark:bg-surface-700/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewModuleFallback() {
  return (
    <div className="space-y-6">
      <div className="dashboard-skeleton h-48 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
        <div className="mb-4 h-7 w-56 rounded bg-white/40 dark:bg-surface-700/60" />
        <div className="mb-3 h-4 w-full max-w-3xl rounded bg-white/30 dark:bg-surface-700/40" />
        <div className="h-4 w-2/3 rounded bg-white/30 dark:bg-surface-700/40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="dashboard-skeleton h-36 rounded-[1.6rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-5">
            <div className="mb-3 h-4 w-20 rounded bg-white/30 dark:bg-surface-700/40" />
            <div className="mb-2 h-8 w-24 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="h-3 w-32 rounded bg-white/30 dark:bg-surface-700/40" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="dashboard-skeleton h-72 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
            <div className="mb-5 h-5 w-40 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-white/40 dark:bg-surface-700/60" />
                  <div className="h-4 flex-1 rounded bg-white/30 dark:bg-surface-700/40" />
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-skeleton h-80 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
            <div className="mb-5 h-5 w-36 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/30 p-3 dark:bg-surface-700/40">
                  <div className="h-4 w-32 rounded bg-white/40 dark:bg-surface-700/60" />
                  <div className="h-4 w-20 rounded bg-white/40 dark:bg-surface-700/60" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="dashboard-skeleton h-64 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
            <div className="mb-5 h-5 w-32 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-4 w-4 rounded bg-white/40 dark:bg-surface-700/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full rounded bg-white/30 dark:bg-surface-700/40" />
                    <div className="h-3 w-2/3 rounded bg-white/20 dark:bg-surface-700/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-skeleton h-56 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
            <div className="mb-5 h-5 w-36 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-white/30 p-3 dark:bg-surface-700/40">
                  <div className="mb-2 h-4 w-28 rounded bg-white/40 dark:bg-surface-700/60" />
                  <div className="h-3 w-full rounded bg-white/20 dark:bg-surface-700/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxModuleFallback() {
  return (
    <div className="space-y-6">
      <div className="dashboard-skeleton h-40 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
        <div className="mb-4 h-6 w-40 rounded bg-white/40 dark:bg-surface-700/60" />
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-lg bg-white/40 dark:bg-surface-700/60" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="dashboard-skeleton h-52 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-5">
            <div className="mb-4 h-5 w-24 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 rounded bg-white/30 dark:bg-surface-700/40" />
                  <div className="h-9 rounded-lg bg-white/40 dark:bg-surface-700/60" />
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-skeleton h-[32rem] rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-5">
            <div className="mb-4 h-5 w-32 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/30 p-3 dark:bg-surface-700/40">
                  <div className="h-10 w-10 rounded-lg bg-white/40 dark:bg-surface-700/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-white/40 dark:bg-surface-700/60" />
                    <div className="h-3 w-1/2 rounded bg-white/30 dark:bg-surface-700/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="dashboard-skeleton h-24 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-5">
            <div className="mb-3 h-4 w-32 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="h-5 w-48 rounded bg-white/40 dark:bg-surface-700/60" />
          </div>
          <div className="dashboard-skeleton h-[48rem] rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75 p-6">
            <div className="mb-5 h-5 w-40 rounded bg-white/40 dark:bg-surface-700/60" />
            <div className="mb-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-white/30 p-4 dark:bg-surface-700/40">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-white/40 dark:bg-surface-700/60" />
                    <div className="h-4 w-32 rounded bg-white/40 dark:bg-surface-700/60" />
                  </div>
                  <div className="h-3 w-full rounded bg-white/20 dark:bg-surface-700/30" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-10 rounded-lg bg-white/40 dark:bg-surface-700/60" />
              <div className="h-9 rounded-lg bg-white/30 dark:bg-surface-700/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleFallback({ activeSection }: { activeSection: DashboardSectionId }) {
  if (activeSection === 'overview') {
    return <OverviewModuleFallback />;
  }

  if (activeSection === 'inbox') {
    return <InboxModuleFallback />;
  }

  return <ConfigModuleFallback />;
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
  requestConfigChangeErrorMessage: string;
  requestConfigChangeErrorSection: ConfigMutationSectionId | null;
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
  requestConfigChangeErrorMessage,
  requestConfigChangeErrorSection,
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
    return <ModuleFallback activeSection={activeSection} />;
  }

  const activityFailure = partialFailures.find((failure) => failure.id === 'activity') ?? null;
  const metricsFailure = partialFailures.find((failure) => failure.id === 'metrics') ?? null;
  const inboxFailures = partialFailures.filter(
    (failure) => failure.id === 'ticket_events' || failure.id === 'ticket_macros',
  );
  const activeConfigSection: ConfigMutationSectionId | null = (() => {
    switch (activeSection) {
      case 'general':
        return 'general';
      case 'server_roles':
        return 'server_roles_channels';
      case 'tickets':
        return 'tickets';
      case 'verification':
        return 'verification';
      case 'welcome':
        return 'welcome';
      case 'suggestions':
        return 'suggestions';
      case 'modlogs':
        return 'modlogs';
      case 'commands':
        return 'commands';
      case 'system':
        return 'system';
      default:
        return null;
    }
  })();
  const showConfigError =
    Boolean(requestConfigChangeErrorMessage)
    && Boolean(activeConfigSection)
    && requestConfigChangeErrorSection === activeConfigSection;

  return (
    <Suspense fallback={<ModuleFallback activeSection={activeSection} />}>
      <div className="space-y-6">
        <DashboardDegradationNotice failures={partialFailures} />
        {showConfigError ? (
          <div
            className="rounded-[1.55rem] border border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,245,245,0.92))] p-4 text-rose-900 dark:border-rose-900/40 dark:bg-[linear-gradient(135deg,rgba(72,22,38,0.76),rgba(46,18,28,0.68))] dark:text-rose-100"
            role="alert"
            aria-live="polite"
          >
            <p className="font-semibold">No se pudo enviar la solicitud de cambio</p>
            <p className="mt-2 text-sm text-current/85">{requestConfigChangeErrorMessage}</p>
          </div>
        ) : null}

        {activeSection === 'overview' ? (
          <ErrorBoundary moduleLabel="Overview" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
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
          </ErrorBoundary>
        ) : null}
        {activeSection === 'inbox' ? (
          <ErrorBoundary moduleLabel="Inbox" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <InboxModule
              guild={selectedGuild}
              workspace={snapshot.ticketWorkspace}
              mutation={snapshot.mutations.find((entry) => entry.mutationType === 'ticket_action') ?? null}
              syncStatus={snapshot.syncStatus}
              isMutating={requestTicketActionPending}
              onAction={onTicketAction}
              partialFailures={inboxFailures}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'general' ? (
          <ErrorBoundary moduleLabel="General" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
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
          </ErrorBoundary>
        ) : null}
        {activeSection === 'server_roles' ? (
          <ErrorBoundary moduleLabel="Server Roles" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <ServerRolesModule
              guild={selectedGuild}
              config={snapshot.config}
              inventory={snapshot.inventory}
              mutation={getLatestMutationForSection(snapshot.mutations, 'server_roles_channels')}
              syncStatus={snapshot.syncStatus}
              isSaving={requestConfigChangePending}
              onSave={(values) => onConfigSave('server_roles_channels', values)}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'tickets' ? (
          <ErrorBoundary moduleLabel="Tickets" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <TicketsModule
              guild={selectedGuild}
              config={snapshot.config}
              inventory={snapshot.inventory}
              mutation={getLatestMutationForSection(snapshot.mutations, 'tickets')}
              syncStatus={snapshot.syncStatus}
              isSaving={requestConfigChangePending}
              onSave={(values) => onConfigSave('tickets', values)}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'verification' ? (
          <ErrorBoundary moduleLabel="Verification" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <VerificationModule
              guild={selectedGuild}
              config={snapshot.config}
              inventory={snapshot.inventory}
              mutation={getLatestMutationForSection(snapshot.mutations, 'verification')}
              syncStatus={snapshot.syncStatus}
              isSaving={requestConfigChangePending}
              onSave={(values) => onConfigSave('verification', values)}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'welcome' ? (
          <ErrorBoundary moduleLabel="Welcome" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <WelcomeModule
              guild={selectedGuild}
              config={snapshot.config}
              inventory={snapshot.inventory}
              mutation={getLatestMutationForSection(snapshot.mutations, 'welcome')}
              syncStatus={snapshot.syncStatus}
              isSaving={requestConfigChangePending}
              onSave={(values) => onConfigSave('welcome', values)}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'suggestions' ? (
          <ErrorBoundary moduleLabel="Suggestions" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <SuggestionsModule
              guild={selectedGuild}
              config={snapshot.config}
              inventory={snapshot.inventory}
              mutation={getLatestMutationForSection(snapshot.mutations, 'suggestions')}
              syncStatus={snapshot.syncStatus}
              isSaving={requestConfigChangePending}
              onSave={(values) => onConfigSave('suggestions', values)}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'modlogs' ? (
          <ErrorBoundary moduleLabel="Modlogs" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <ModlogsModule
              guild={selectedGuild}
              config={snapshot.config}
              inventory={snapshot.inventory}
              mutation={getLatestMutationForSection(snapshot.mutations, 'modlogs')}
              syncStatus={snapshot.syncStatus}
              isSaving={requestConfigChangePending}
              onSave={(values) => onConfigSave('modlogs', values)}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'commands' ? (
          <ErrorBoundary moduleLabel="Commands" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <CommandsModule
              guild={selectedGuild}
              config={snapshot.config}
              inventory={snapshot.inventory}
              mutation={getLatestMutationForSection(snapshot.mutations, 'commands')}
              syncStatus={snapshot.syncStatus}
              isSaving={requestConfigChangePending}
              onSave={(values) => onConfigSave('commands', values)}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'system' ? (
          <ErrorBoundary moduleLabel="System" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
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
          </ErrorBoundary>
        ) : null}
        {activeSection === 'activity' ? (
          <ErrorBoundary moduleLabel="Activity" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <ActivityModule
              guild={selectedGuild}
              events={snapshot.events}
              mutations={snapshot.mutations}
              partialFailure={activityFailure}
            />
          </ErrorBoundary>
        ) : null}
        {activeSection === 'analytics' ? (
          <ErrorBoundary moduleLabel="Analytics" guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
            <AnalyticsModule
              guild={selectedGuild}
              metrics={snapshot.metrics}
              partialFailure={metricsFailure}
            />
          </ErrorBoundary>
        ) : null}
      </div>
    </Suspense>
  );
}
