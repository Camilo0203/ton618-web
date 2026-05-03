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
        {/* Background heavily blurred */}
        <div className="pointer-events-none select-none blur-[24px] opacity-20 grayscale-[0.8]">
          {viewportContent}
        </div>
        
        {/* Login Modal Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-[#5865F2]/30 via-indigo-500/20 to-purple-500/30 blur-2xl opacity-70" />
            
            {/* Main Card */}
            <div className="relative rounded-[2rem] border border-white/[0.08] bg-[#0A0A0F]/80 p-10 backdrop-blur-3xl shadow-[0_0_80px_rgba(88,101,242,0.15)] overflow-hidden">
              
              {/* Inner ambient gradients */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_40%)]" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="relative z-10">
                {/* Logo / Icon */}
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#5865F2]/30 bg-[#5865F2]/10 shadow-[inset_0_0_20px_rgba(88,101,242,0.2)]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-[#5865F2]">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </div>

                <h2 className="text-[2rem] font-bold tracking-tight text-white mb-3">
                  {t('dashboardAuth.authCard.cardTitle')}
                </h2>
                
                <p className="text-slate-300/80 mb-10 text-[0.95rem] leading-relaxed max-w-sm mx-auto">
                  {t('dashboardAuth.authCard.cardDescription')}
                </p>

                <div className="relative group">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#5865F2] to-indigo-500 opacity-40 blur transition duration-300 group-hover:opacity-70" />
                  <button
                    onClick={syncGuildAccess}
                    className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-6 py-4 text-[1.05rem] font-semibold text-white transition-all duration-300 shadow-[0_0_40px_rgba(88,101,242,0.4)]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                    </svg>
                    <span>{t('dashboardAuth.authCard.cta')}</span>
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500/80">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <span>OAuth2 Seguro</span>
                  </div>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span>Sin Pérdida de Datos</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return viewportContent;
}
