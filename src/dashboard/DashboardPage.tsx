import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, RefreshCcw, ServerCrash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { config } from '../config';
import AuthCard from './components/AuthCard';
import DashboardModuleViewport from './components/DashboardModuleViewport';
import DashboardShell from './components/DashboardShell';
import StateCard from './components/StateCard';
import {
  useDashboardAuth,
  useDashboardGuilds,
  useGuildDashboardSnapshot,
  useRequestGuildBackupAction,
  useRequestGuildConfigChange,
  useRequestTicketDashboardAction,
  useSignInWithDiscord,
  useSignOutDashboard,
  useSyncDashboardGuilds,
} from './hooks/useDashboardData';
import { usePersistentDashboardSection } from './hooks/usePersistentDashboardSection';
import { useGuildSelection } from './hooks/useGuildSelection';
import { useDashboardDarkMode } from './hooks/useDashboardDarkMode';
import { getDashboardSectionStates } from './utils';
import type { ConfigMutationSectionId } from './types';

export default function DashboardPage() {
  useDashboardDarkMode();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const requestedGuildId = searchParams.get('guild');

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

  const snapshotQuery = useGuildDashboardSnapshot(selectedGuildId, Boolean(selectedGuildId));
  const snapshot = snapshotQuery.data;
  const requestConfigChange = useRequestGuildConfigChange(selectedGuildId);
  const requestBackupAction = useRequestGuildBackupAction(selectedGuildId);
  const requestTicketAction = useRequestTicketDashboardAction(selectedGuildId);
  const [configSaveError, setConfigSaveError] = useState<{
    section: ConfigMutationSectionId;
    message: string;
  } | null>(null);

  const { activeSection, setActiveSection } = usePersistentDashboardSection(
    selectedGuildId,
    snapshot?.config.dashboardPreferences.defaultSection,
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
      console.warn('[dashboard-auth] dashboard:missing-provider-token', {
        selectedGuildId: preferredGuildId,
        hasSession: Boolean(authState.session),
        userId: authState.user?.id ?? null,
      });
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

  useEffect(() => {
    setConfigSaveError(null);
  }, [selectedGuildId]);

  return (
    <>
      <Helmet>
        <title>{config.botName} | {t('dashboard.pageTitle')} | {titleGuildName}</title>
        <meta
          name="description"
          content={t('dashboard.metaDescription')}
        />
      </Helmet>

      {authQuery.isLoading ? (
        <div className="dashboard-shell flex min-h-screen items-center justify-center px-4 text-white">
          <div className="mx-auto w-full max-w-[42rem]">
            <StateCard
              eyebrow={t('dashboard.states.authLoading.eyebrow')}
              title={t('dashboard.states.authLoading.title')}
              description={t('dashboard.states.authLoading.description')}
              icon={RefreshCcw}
              actions={(
                <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  {t('dashboard.states.authLoading.pill')}
                </span>
              )}
            />
          </div>
        </div>
      ) : authQuery.isError ? (
        <div className="dashboard-shell px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <StateCard
              eyebrow={t('dashboard.states.authError.eyebrow')}
              title={t('dashboard.states.authError.title')}
              description={authErrorMessage}
              icon={ServerCrash}
              tone="danger"
              actions={(
                <>
                  <button
                    type="button"
                    onClick={() => authQuery.refetch()}
                    className="dashboard-primary-button"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {t('dashboard.actions.retryValidation')}
                  </button>
                  <button
                    type="button"
                    onClick={() => signIn.mutate(requestedGuildId)}
                    disabled={signIn.isPending || !canUseDashboard}
                    className="dashboard-secondary-button"
                  >
                    {t('dashboard.actions.restartDiscord')}
                  </button>
                </>
              )}
            />
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="dashboard-shell flex min-h-screen items-center justify-center px-4 py-8 text-white sm:px-6">
          <div className="mx-auto w-full max-w-[42rem]">
            <AuthCard
              canUseDashboard={canUseDashboard}
              isLoading={signIn.isPending}
              errorMessage={signIn.error instanceof Error ? signIn.error.message : undefined}
              onLogin={() => signIn.mutate(selectedGuildId ?? requestedGuildId)}
            />
          </div>
        </div>
      ) : guildsQuery.isLoading ? (
        <div className="dashboard-shell px-4 py-10 text-white">
          <div className="mx-auto max-w-5xl">
            <StateCard
              eyebrow={t('dashboard.states.guildsLoading.eyebrow')}
              title={t('dashboard.states.guildsLoading.title')}
              description={t('dashboard.states.guildsLoading.description')}
              icon={RefreshCcw}
              actions={(
                <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  {t('dashboard.states.guildsLoading.pill')}
                </span>
              )}
            />
          </div>
        </div>
      ) : guildsQuery.isError ? (
        <div className="dashboard-shell px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <StateCard
              eyebrow={t('dashboard.states.guildsError.eyebrow')}
              title={t('dashboard.states.guildsError.title')}
              description={guildsErrorMessage}
              icon={ServerCrash}
              tone="danger"
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
            />
          </div>
        </div>
      ) : !guilds.length ? (
        <div className="dashboard-shell px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <StateCard
              eyebrow={t('dashboard.states.emptyGuilds.eyebrow')}
              title={t('dashboard.states.emptyGuilds.title')}
              description={t('dashboard.states.emptyGuilds.description')}
              icon={AlertTriangle}
              tone="warning"
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
            />
          </div>
        </div>
      ) : (
        <DashboardShell
          user={authState.user!}
          guilds={guilds}
          selectedGuild={selectedGuild}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onGuildChange={setSelectedGuildId}
          onSync={syncGuildAccess}
          onLogout={() => signOut.mutate()}
          isSyncing={syncGuilds.isPending}
          syncError={syncErrorMessage}
          syncStatus={syncStatus}
          pendingMutations={pendingMutations}
          failedMutations={failedMutations}
          sectionStates={sectionStates}
        >
          <DashboardModuleViewport
            activeSection={activeSection}
            selectedGuild={selectedGuild}
            invalidRequestedGuildId={invalidRequestedGuildId}
            fallbackGuildId={fallbackGuildId}
            setSelectedGuildId={setSelectedGuildId}
            syncGuildAccess={syncGuildAccess}
            isSyncing={syncGuilds.isPending}
            snapshot={snapshot}
            snapshotErrorMessage={snapshotErrorMessage}
            isSnapshotLoading={snapshotQuery.isLoading}
            isSnapshotError={snapshotQuery.isError}
            refetchSnapshot={() => void snapshotQuery.refetch()}
            requestConfigChangePending={requestConfigChange.isPending}
            requestConfigChangeErrorMessage={configSaveError?.message ?? ''}
            requestConfigChangeErrorSection={configSaveError?.section ?? null}
            requestBackupActionPending={requestBackupAction.isPending}
            requestTicketActionPending={requestTicketAction.isPending}
            onSectionChange={setActiveSection}
            onConfigSave={async (section, payload) => {
              try {
                await requestConfigChange.mutateAsync({ section, payload });
                setConfigSaveError(null);
              } catch (error) {
                setConfigSaveError({
                  section,
                  message: error instanceof Error
                    ? error.message
                    : 'No se pudo registrar la solicitud de cambio.',
                });
                throw error;
              }
            }}
            onCreateBackup={async () => {
              await requestBackupAction.mutateAsync({
                action: 'create_backup',
                payload: {},
              });
            }}
            onRestoreBackup={async (backupId) => {
              await requestBackupAction.mutateAsync({
                action: 'restore_backup',
                payload: { backupId },
              });
            }}
            onTicketAction={async (action, payload) => {
              await requestTicketAction.mutateAsync({ action, payload });
            }}
          />
        </DashboardShell>
      )}
    </>
  );
}
