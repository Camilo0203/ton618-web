import { Helmet } from 'react-helmet-async';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, RefreshCcw, ServerCrash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { config } from '../config';
import StarfieldBackground from '../components/StarfieldBackground';
import DashboardAccessStage, {
  DashboardAccessStatusPill,
  type DashboardAccessProgressStep,
} from './components/DashboardAccessStage';
import DashboardDemoPage from './DashboardDemoPage';
import DashboardModuleViewport from './components/DashboardModuleViewport';
import DashboardLoginPage from './components/DashboardLoginPage';
import DashboardShell from './components/DashboardShell';
import ErrorBoundary from './components/ErrorBoundary';
import {
  useDashboardAuth,
  useDashboardGuilds,
  useGuildDashboardSnapshot,
  useRequestGuildBackupAction,
  useRequestGuildConfigChange,
  useSignInWithDiscord,
  useSignOutDashboard,
  useSyncDashboardGuilds,
} from './hooks/useDashboardData';
import { usePersistentDashboardSection } from './hooks/usePersistentDashboardSection';
import { useGuildSelection } from './hooks/useGuildSelection';
import { useDashboardDarkMode } from './hooks/useDashboardDarkMode';
import { useMinimumDisplayState } from './hooks/useMinimumDisplayState';
import { getDashboardSectionStates, isGuildAccessFresh as checkIsAccessFresh } from './utils';
import type { ConfigMutationSectionId } from './types';
import {
  addSentryModuleNavigation,
  clearSentryDashboardGuild,
  clearSentryDashboardUser,
  setSentryDashboardGuild,
  setSentryDashboardUser,
} from '../lib/sentryEnrich';

type DashboardEntryStage =
  | 'auth-loading'
  | 'auth-error'
  | 'guilds-loading'
  | 'guilds-error'
  | 'empty-guilds'
  | 'login'
  | 'shell';

const DASHBOARD_ENTRY_STAGE_MIN_MS = 700;

function shouldDelayDashboardEntryStage(stage: DashboardEntryStage) {
  return stage === 'auth-loading' || stage === 'guilds-loading';
}

export default function DashboardPage() {
  useDashboardDarkMode();
  const [searchParams] = useSearchParams();
  const demoVariant = searchParams.get('demo');
  const requestedGuildId = searchParams.get('guild');
  const requestedSection = searchParams.get('section');

  if (demoVariant === 'ops-console') {
    return <DashboardDemoPage />;
  }

  return <DashboardLivePage requestedGuildId={requestedGuildId} requestedSection={requestedSection} />;
}

function DashboardLivePage({
  requestedGuildId,
  requestedSection,
}: {
  requestedGuildId: string | null;
  requestedSection: string | null;
}) {
  const { t } = useTranslation();

  const authQuery = useDashboardAuth();
  const signIn = useSignInWithDiscord();
  const signOut = useSignOutDashboard();
  const syncGuilds = useSyncDashboardGuilds();

  const authState = authQuery.data ?? { session: null, user: null };
  const canUseDashboard = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const isAuthenticated = Boolean(authState.user);

  const guildsQuery = useDashboardGuilds(isAuthenticated);
  const guilds = guildsQuery.data ?? [];
  const {
    selectedGuild,
    selectedGuildId,
    invalidRequestedGuildId,
    fallbackGuildId,
    setSelectedGuildId,
  } = useGuildSelection(guilds);

  const isSelectedGuildAccessFresh = checkIsAccessFresh(selectedGuild?.lastSyncedAt ?? null);
  const snapshotQuery = useGuildDashboardSnapshot(
    selectedGuildId,
    Boolean(selectedGuildId && isSelectedGuildAccessFresh),
  );
  const snapshot = snapshotQuery.data;
  const requestConfigChange = useRequestGuildConfigChange(selectedGuildId);
  const requestBackupAction = useRequestGuildBackupAction(selectedGuildId);
  const [configSaveError, setConfigSaveError] = useState<{
    section: ConfigMutationSectionId;
    message: string;
  } | null>(null);

  const { activeSection, setActiveSection } = usePersistentDashboardSection(
    selectedGuildId,
    snapshot?.config.dashboardPreferences.defaultSection,
    requestedSection,
  );

  const syncStatus = snapshot?.syncStatus ?? null;
  const mutations = snapshot?.mutations ?? [];
  const sectionStates = snapshot && selectedGuild
    ? getDashboardSectionStates(snapshot.config, selectedGuild, syncStatus, snapshot.backups, mutations)
    : [];
  const pendingMutations =
    syncStatus?.pendingMutations ?? mutations.filter((mutation) => mutation.status === 'pending').length;
  const failedMutations =
    syncStatus?.failedMutations ?? mutations.filter((mutation) => mutation.status === 'failed').length;
  const syncErrorMessage = syncGuilds.error instanceof Error ? syncGuilds.error.message : undefined;

  function syncGuildAccess() {
    const preferredGuildId = selectedGuildId ?? requestedGuildId;
    if (!authState.session?.provider_token) {
      if (import.meta.env.DEV) {
        console.warn('[dashboard-auth] dashboard:missing-provider-token', {
          selectedGuildId: preferredGuildId,
          hasSession: Boolean(authState.session),
          userId: authState.user?.id ?? null,
        });
      }
      signIn.mutate(preferredGuildId);
      return;
    }

    void syncGuilds.mutateAsync(authState.session.provider_token).catch(() => undefined);
  }

  const titleGuildName = selectedGuild?.guildName ?? t('dashboard.pageTitle');
  const authErrorMessage =
    authQuery.error instanceof Error ? authQuery.error.message : t('dashboard.errors.authValidation');
  const guildsErrorMessage =
    guildsQuery.error instanceof Error
      ? guildsQuery.error.message
      : t('dashboard.errors.guildsLoad');
  const snapshotErrorMessage =
    snapshotQuery.error instanceof Error
      ? snapshotQuery.error.message
      : t('dashboard.errors.snapshotLoad');
  const dashboardBrandLabel = `${config.botName} Dashboard`;
  const accessProgressLabel = t('dashboard.accessStage.progressLabel');
  const authLoadingSteps: DashboardAccessProgressStep[] = [
    { label: t('dashboard.accessStage.steps.validateSession'), state: 'active' },
    { label: t('dashboard.accessStage.steps.resolveGuilds'), state: 'pending' },
  ];
  const guildsLoadingSteps: DashboardAccessProgressStep[] = [
    { label: t('dashboard.accessStage.steps.validateSession'), state: 'complete' },
    { label: t('dashboard.accessStage.steps.resolveGuilds'), state: 'active' },
  ];
  const guildsErrorSteps: DashboardAccessProgressStep[] = [
    { label: t('dashboard.accessStage.steps.validateSession'), state: 'complete' },
    { label: t('dashboard.accessStage.steps.resolveGuilds'), state: 'error' },
  ];
  const emptyGuildsSteps: DashboardAccessProgressStep[] = [
    { label: t('dashboard.accessStage.steps.validateSession'), state: 'complete' },
    { label: t('dashboard.accessStage.steps.resolveGuilds'), state: 'error' },
  ];
  const actualEntryStage: DashboardEntryStage = authQuery.isLoading
    ? 'auth-loading'
    : authQuery.isError
      ? 'auth-error'
      : !isAuthenticated
        ? 'login'
        : guildsQuery.isLoading
          ? 'guilds-loading'
          : guildsQuery.isError
            ? 'guilds-error'
            : !guilds.length
              ? 'empty-guilds'
              : 'shell';
  const displayEntryStage = useMinimumDisplayState({
    value: actualEntryStage,
    getKey: (stage) => stage,
    minimumMs: DASHBOARD_ENTRY_STAGE_MIN_MS,
    shouldDelay: shouldDelayDashboardEntryStage,
  });
  const resolvedEntryStage = (
    actualEntryStage === 'auth-error'
    || actualEntryStage === 'guilds-error'
    || actualEntryStage === 'empty-guilds'
    || actualEntryStage === 'login'
  )
    ? actualEntryStage
    : displayEntryStage;

  useEffect(() => {
    setConfigSaveError(null);
  }, [selectedGuildId]);

  useEffect(() => {
    if (authState.user) {
      setSentryDashboardUser(authState.user.id, authState.user.email);
    } else {
      clearSentryDashboardUser();
    }
  }, [authState.user]);

  useEffect(() => {
    if (selectedGuild) {
      setSentryDashboardGuild(selectedGuild.guildId, selectedGuild.guildName);
    } else {
      clearSentryDashboardGuild();
    }
  }, [selectedGuild]);

  const previousSectionRef = useRef(activeSection);
  useEffect(() => {
    if (previousSectionRef.current !== activeSection) {
      addSentryModuleNavigation(previousSectionRef.current, activeSection);
      previousSectionRef.current = activeSection;
    }
  }, [activeSection]);

  const pageHelmet = (
    <Helmet>
      <title>{config.botName} | {t('dashboard.pageTitle')} | {titleGuildName}</title>
      <meta
        name="description"
        content={t('dashboard.metaDescription')}
      />
    </Helmet>
  );

  const isAccessFresh = checkIsAccessFresh(syncStatus?.updatedAt ?? null);
  const handleTicketAction = async (action: string, _payload: unknown) => {
    void _payload;
    // TODO: Implement actual ticket action handling via dashboard API
    // This requires implementing the dashboard ticket action RPC
    toast.info(t('dashboard.ticketActionNotImplemented', { action, defaultValue: `Ticket action "${action}" is not yet available. Please use Discord for ticket operations.` }));
  };

  function renderEntryStage(stage: ReactNode, maxWidthClass = 'max-w-[76rem]') {
    return (
      <>
        {pageHelmet}
        <div className="dashboard-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-white sm:px-6 bg-[#02030a]">
          {/* Starfield + cinematic overlay — same as landing */}
          <div className="pointer-events-none absolute inset-0 z-0 select-none">
            <StarfieldBackground />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_42%),radial-gradient(circle_at_18%_14%,rgba(34,211,238,0.06),transparent_28%),linear-gradient(180deg,rgba(5,6,15,0.4)_0%,rgba(2,3,10,0.85)_58%,rgba(0,0,0,0.96)_100%)]" />
          </div>
          <div className={`relative z-[1] mx-auto w-full ${maxWidthClass}`}>
            {stage}
          </div>
        </div>
      </>
    );
  }

  if (resolvedEntryStage === 'login') {
    return renderEntryStage(<DashboardLoginPage requestedGuildId={requestedGuildId} />);
  }

  if (resolvedEntryStage === 'auth-loading') {
    return renderEntryStage(
      <DashboardAccessStage
        key="auth-loading"
        variant="loading"
        eyebrow={t('dashboard.states.authLoading.eyebrow')}
        title={t('dashboard.states.authLoading.title')}
        description={t('dashboard.accessStage.descriptions.authLoading')}
        statusText={t('dashboard.accessStage.states.authLoading')}
        progressLabel={accessProgressLabel}
        progressDescription={t('dashboard.states.authLoading.description')}
        progressSteps={authLoadingSteps}
        statusPill={(
          <DashboardAccessStatusPill
            label={t('dashboard.states.authLoading.pill')}
            tone="brand"
            icon={RefreshCcw}
            spin
          />
        )}
        brandLabel={dashboardBrandLabel}
      />,
    );
  }

  if (resolvedEntryStage === 'auth-error') {
    const isSessionError = authErrorMessage.toLowerCase().includes('session') || authErrorMessage.toLowerCase().includes('auth');
    return renderEntryStage(
      <div className="relative isolate flex min-h-screen items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg z-10"
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#5865F2] to-indigo-500 opacity-40 blur transition duration-300 group-hover:opacity-70" />
          <div className="relative rounded-[2rem] border border-white/[0.08] bg-[#0A0A0F]/80 p-10 backdrop-blur-3xl shadow-[0_0_80px_rgba(88,101,242,0.15)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_40%)]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative z-10">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#5865F2]/30 bg-[#5865F2]/10 shadow-[inset_0_0_20px_rgba(88,101,242,0.2)]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-[#5865F2]">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </div>
              <h2 className="text-[2rem] font-bold tracking-tight text-white mb-3">
                {isSessionError ? t('dashboardAuth.authCard.cardTitle') : t('dashboard.states.authError.title')}
              </h2>
              <p className="text-slate-300/80 mb-10 text-[0.95rem] leading-relaxed max-w-sm mx-auto">
                {isSessionError ? t('dashboardAuth.authCard.cardDescription') : authErrorMessage}
              </p>
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#5865F2] to-indigo-500 opacity-40 blur transition duration-300 group-hover:opacity-70" />
                <button
                  type="button"
                  onClick={() => signIn.mutate(requestedGuildId)}
                  disabled={signIn.isPending || !canUseDashboard}
                  className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-6 py-4 text-[1.05rem] font-semibold text-white transition-all duration-300 shadow-[0_0_40px_rgba(88,101,242,0.4)] disabled:opacity-70"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  <span>{signIn.isPending ? t('dashboardAuth.authCard.loadingCta') : t('dashboardAuth.authCard.cta')}</span>
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
    );
  }

  if (resolvedEntryStage === 'guilds-loading') {
    return renderEntryStage(
      <DashboardAccessStage
        key="guilds-loading"
        variant="loading"
        eyebrow={t('dashboard.states.guildsLoading.eyebrow')}
        title={t('dashboard.states.guildsLoading.title')}
        description={t('dashboard.accessStage.descriptions.guildsLoading')}
        statusText={t('dashboard.accessStage.states.guildsLoading')}
        progressLabel={accessProgressLabel}
        progressDescription={t('dashboard.states.guildsLoading.description')}
        progressSteps={guildsLoadingSteps}
        statusPill={(
          <DashboardAccessStatusPill
            label={t('dashboard.states.guildsLoading.pill')}
            tone="brand"
            icon={RefreshCcw}
            spin
          />
        )}
        icon={RefreshCcw}
        brandLabel={dashboardBrandLabel}
      />,
    );
  }

  if (resolvedEntryStage === 'guilds-error') {
    return renderEntryStage(
      <DashboardAccessStage
        key="guilds-error"
        variant="error"
        eyebrow={t('dashboard.states.guildsError.eyebrow')}
        title={t('dashboard.states.guildsError.title')}
        description={t('dashboard.accessStage.descriptions.guildsError')}
        statusText={guildsErrorMessage}
        progressLabel={accessProgressLabel}
        progressSteps={guildsErrorSteps}
        statusPill={(
          <DashboardAccessStatusPill
            label={t('dashboard.states.guildsError.eyebrow')}
            tone="danger"
            icon={ServerCrash}
          />
        )}
        actions={(
          <>
            <button
              type="button"
              onClick={() => guildsQuery.refetch()}
              className="dashboard-primary-button"
            >
              <RefreshCcw className="h-4 w-4" />
              {t('dashboard.actions.retryLoad')}
            </button>
            <button
              type="button"
              onClick={syncGuildAccess}
              disabled={syncGuilds.isPending}
              className="dashboard-secondary-button"
            >
              <RefreshCcw className={`h-4 w-4 ${syncGuilds.isPending ? 'animate-spin' : ''}`} />
              {t('dashboard.actions.resyncAccess')}
            </button>
          </>
        )}
        icon={ServerCrash}
        brandLabel={dashboardBrandLabel}
      />,
    );
  }

  if (resolvedEntryStage === 'empty-guilds') {
    return renderEntryStage(
      <DashboardAccessStage
        key="empty-guilds"
        variant="warning"
        eyebrow={t('dashboard.states.emptyGuilds.eyebrow')}
        title={t('dashboard.states.emptyGuilds.title')}
        description={t('dashboard.accessStage.descriptions.emptyGuilds')}
        statusText={t('dashboard.accessStage.states.emptyGuilds')}
        progressLabel={accessProgressLabel}
        progressDescription={t('dashboard.states.emptyGuilds.description')}
        progressSteps={emptyGuildsSteps}
        statusPill={(
          <DashboardAccessStatusPill
            label={t('dashboard.states.emptyGuilds.eyebrow')}
            tone="warning"
            icon={AlertTriangle}
          />
        )}
        actions={(
          <>
            <button
              type="button"
              onClick={syncGuildAccess}
              disabled={syncGuilds.isPending}
              className="dashboard-primary-button"
            >
              <RefreshCcw className={`h-4 w-4 ${syncGuilds.isPending ? 'animate-spin' : ''}`} />
              {t('dashboard.actions.resyncAccess')}
            </button>
            <button
              type="button"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="dashboard-secondary-button"
            >
              {t('dashboard.actions.switchAccount')}
            </button>
          </>
        )}
        icon={AlertTriangle}
        brandLabel={dashboardBrandLabel}
      />,
    );
  }

  return (
    <>
      {pageHelmet}
      <DashboardShell
        user={authState.user}
        isAuthenticated={isAuthenticated}
        guilds={guilds}
        selectedGuild={selectedGuild}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onGuildChange={setSelectedGuildId}
        onLogin={() => signIn.mutate(selectedGuildId ?? requestedGuildId)}
        onSync={syncGuildAccess}
        onLogout={() => signOut.mutate()}
        isSyncing={syncGuilds.isPending}
        syncError={syncErrorMessage}
        syncStatus={syncStatus}
        pendingMutations={pendingMutations}
        failedMutations={failedMutations}
        sectionStates={sectionStates}
      >
        <ErrorBoundary
          fallbackEyebrow={t('dashboard.shell.errorBoundary.eyebrow')}
          fallbackTitle={t('dashboard.shell.errorBoundary.title')}
          moduleLabel={t(`dashboard.sections.${activeSection}.label`)}
          guildId={selectedGuildId}
          onRetry={() => void snapshotQuery.refetch()}
        >
          <DashboardModuleViewport
            activeSection={activeSection}
            selectedGuild={selectedGuild}
            invalidRequestedGuildId={invalidRequestedGuildId}
            fallbackGuildId={fallbackGuildId}
            setSelectedGuildId={setSelectedGuildId}
            syncGuildAccess={syncGuildAccess}
            isSyncing={syncGuilds.isPending}
            isAuthenticated={isAuthenticated}
            snapshot={snapshot}
            snapshotErrorMessage={snapshotErrorMessage}
            isSnapshotLoading={snapshotQuery.isLoading}
            isSnapshotError={snapshotQuery.isError}
            refetchSnapshot={() => void snapshotQuery.refetch()}
            requestConfigChangePending={requestConfigChange.isPending}
            requestConfigChangeErrorMessage={configSaveError?.message ?? ''}
            requestConfigChangeErrorSection={configSaveError?.section ?? null}
            requestBackupActionPending={requestBackupAction.isPending}
            isGuildAccessFresh={isAccessFresh}
            onTicketAction={handleTicketAction}
            onSectionChange={setActiveSection}
            onConfigSave={async (section, payload) => {
              try {
                await requestConfigChange.mutateAsync({ section, payload });
                setConfigSaveError(null);
                toast.success(t('dashboard.toast.configSaved', { label: t(`dashboard.sections.${section}.label`) }), { icon: '✅' });
              } catch (error) {
                setConfigSaveError({
                  section,
                  message: error instanceof Error
                    ? error.message
                    : t('dashboard.shell.configSaveError'),
                });
                toast.error(t('dashboard.shell.configSaveError'));
                throw error;
              }
            }}
            onCreateBackup={async () => {
              try {
                await requestBackupAction.mutateAsync({
                  action: 'create_backup',
                  payload: {},
                });
                toast.success(t('dashboard.toast.backupScheduled'), { icon: '📦' });
              } catch (error) {
                toast.error(t('dashboard.toast.backupPermissionError'));
                throw error;
              }
            }}
            onRestoreBackup={async (backupId) => {
              try {
                await requestBackupAction.mutateAsync({
                  action: 'restore_backup',
                  payload: { backupId },
                });
                toast.success(t('dashboard.toast.restoreStarted'), { icon: '✨' });
              } catch (error) {
                toast.error(t('dashboard.toast.restoreError'));
                throw error;
              }
            }}
          />
        </ErrorBoundary>
      </DashboardShell>
    </>
  );
}
