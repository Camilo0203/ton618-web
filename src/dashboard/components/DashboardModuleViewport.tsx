import { Suspense, lazy } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { moduleTransitionVariants, instantVariants } from '../motion';
import { AlertTriangle, RefreshCcw, ServerCrash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StateCard from './StateCard';
import DashboardDegradationNotice from './DashboardDegradationNotice';
import DashboardLoadingSkeleton from './DashboardLoadingSkeleton';
import ErrorBoundary from './ErrorBoundary';
import type {
  ConfigMutationSectionId,
  DashboardGuild,
  DashboardPartialFailure,
  DashboardSectionId,
  GuildConfigMutation,
  GuildDashboardSnapshot,
  GuildSyncStatus,
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

function ModuleFallback({ activeSection }: { activeSection: DashboardSectionId }) {
  if (activeSection === 'overview') return <DashboardLoadingSkeleton variant="overview" />;
  if (activeSection === 'system') return <DashboardLoadingSkeleton variant="system" />;

  return <DashboardLoadingSkeleton variant="config" />;
}

interface DashboardModuleViewportProps {
  activeSection: DashboardSectionId;
  selectedGuild: DashboardGuild | null;
  isGuildAccessFresh: boolean;
  invalidRequestedGuildId: string | null;
  fallbackGuildId: string | null;
  setSelectedGuildId: (guildId: string) => void;
  syncGuildAccess: () => void;
  isSyncing: boolean;
  isAuthenticated: boolean;
  snapshot: GuildDashboardSnapshot | undefined;
  snapshotErrorMessage: string;
  isSnapshotLoading: boolean;
  isSnapshotError: boolean;
  refetchSnapshot: () => void;
  requestConfigChangePending: boolean;
  requestConfigChangeErrorMessage: string;
  requestConfigChangeErrorSection: ConfigMutationSectionId | null;
  requestBackupActionPending: boolean;
  onSectionChange: (section: DashboardSectionId) => void;
  onConfigSave: (section: ConfigMutationSectionId, payload: unknown) => Promise<void>;
  onTicketAction: (action: string, payload: unknown) => Promise<void>;
  onCreateBackup: () => Promise<void>;
  onRestoreBackup: (backupId: string) => Promise<void>;
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
    ? getDashboardSectionStates(snapshot.config, selectedGuild, syncStatus, snapshot.backups, mutations, snapshot.playbooks)
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
  isGuildAccessFresh,
  invalidRequestedGuildId,
  fallbackGuildId,
  setSelectedGuildId,
  syncGuildAccess,
  isSyncing,
  isAuthenticated,
  snapshot,
  snapshotErrorMessage,
  isSnapshotLoading,
  isSnapshotError,
  refetchSnapshot,
  requestConfigChangePending,
  requestConfigChangeErrorMessage,
  requestConfigChangeErrorSection,
  requestBackupActionPending,
  onSectionChange,
  onConfigSave,
  onTicketAction,
  onCreateBackup,
  onRestoreBackup,
}: DashboardModuleViewportProps) {
  const { t } = useTranslation();
  const shouldReduce = useReducedMotion();
  const variants = shouldReduce ? instantVariants : moduleTransitionVariants;
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

  if (!selectedGuild && isAuthenticated) {
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


  const viewportContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection}
        variants={variants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <Suspense fallback={<ModuleFallback activeSection={activeSection} />}>
          <div className="space-y-6">
            <DashboardDegradationNotice failures={partialFailures} />
            {showConfigError ? (
              <div
                className="rounded-[1.55rem] border dashboard-module-notice-danger"
                role="alert"
                aria-live="polite"
              >
                <p className="font-semibold">{t('dashboard.shell.configSaveError')}</p>
                <p className="mt-2 text-sm text-current/85">{requestConfigChangeErrorMessage}</p>
              </div>
            ) : null}

            {activeSection === 'overview' ? (
              <ErrorBoundary moduleLabel={t('dashboard.sections.overview')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <OverviewModule
                  guild={selectedGuild!}
                  config={snapshot.config}
                  events={snapshot.events}
                  metrics={snapshot.metrics}
                  mutations={snapshot.mutations}
                  backups={snapshot.backups}
                  syncStatus={snapshot.syncStatus}
                  workspace={snapshot.ticketWorkspace}
                  playbooks={snapshot.playbooks}
                  onSectionChange={onSectionChange}
                  sectionStates={sectionStates}
                  checklist={checklist}
                  quickActions={quickActions}
                  partialFailures={partialFailures}
                  isGuildAccessFresh={isGuildAccessFresh}
                  onTicketAction={onTicketAction}
                />
              </ErrorBoundary>
            ) : null}

            {activeSection === 'general' ? (
              <ErrorBoundary moduleLabel={t('dashboard.sections.general')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <GeneralModule
                  guild={selectedGuild!}
                  config={snapshot.config}
                  mutation={getLatestMutationForSection(snapshot.mutations, 'general')}
                  syncStatus={snapshot.syncStatus}
                  isSaving={requestConfigChangePending}
                  onSectionChange={onSectionChange}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.server_roles')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <ServerRolesModule
                  guild={selectedGuild!}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.tickets')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <TicketsModule
                  guild={selectedGuild!}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.verification')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <VerificationModule
                  guild={selectedGuild!}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.welcome')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <WelcomeModule
                  guild={selectedGuild!}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.suggestions')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <SuggestionsModule
                  guild={selectedGuild!}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.modlogs')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <ModlogsModule
                  guild={selectedGuild!}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.commands')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <CommandsModule
                  guild={selectedGuild!}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.system')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <SystemModule
                  guild={selectedGuild!}
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
              <ErrorBoundary moduleLabel={t('dashboard.sections.activity')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <ActivityModule
                  guild={selectedGuild!}
                  events={snapshot.events}
                  mutations={snapshot.mutations}
                  partialFailure={activityFailure}
                />
              </ErrorBoundary>
            ) : null}
            {activeSection === 'analytics' ? (
              <ErrorBoundary moduleLabel={t('dashboard.sections.analytics')} guildId={selectedGuild?.guildId} onRetry={refetchSnapshot}>
                <AnalyticsModule
                  guild={selectedGuild!}
                  metrics={snapshot.metrics}
                  playbooks={snapshot.playbooks}
                  config={snapshot.config}
                  partialFailure={metricsFailure}
                />
              </ErrorBoundary>
            ) : null}
          </div>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );

  if (!isAuthenticated) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-xl opacity-40 grayscale-[0.5]">
          {viewportContent}
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-2xl">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 mb-6">
              <RefreshCcw className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {t('dashboard.dashboardAuth.authCard.cardTitle')}
            </h2>
            <p className="text-slate-300 mb-8 text-sm leading-relaxed">
              {t('dashboard.dashboardAuth.authCard.cardDescription')}
            </p>
            <button
              onClick={syncGuildAccess}
              className="btn-premium-primary w-full py-4 px-6 text-base rounded-[1.2rem] shadow-lg shadow-indigo-500/20"
            >
              <RefreshCcw className="h-5 w-5" />
              <span>{t('dashboard.dashboardAuth.authCard.cta')}</span>
            </button>
            <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span>Secure Sync</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>Discord OAuth</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>No Config Loss</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return viewportContent;
}
