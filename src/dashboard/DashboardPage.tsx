import { Suspense, lazy, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, RefreshCcw, ServerCrash } from 'lucide-react';
import { config } from '../config';
import AuthCard from './components/AuthCard';
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
import { useGuildSelection } from './hooks/useGuildSelection';
import {
  DASHBOARD_SECTION_STORAGE_PREFIX,
} from './constants';
import { dashboardSectionIds } from './schemas';
import { getLatestBackupMutation, getLatestMutationForSection } from './utils';
import type { ConfigMutationSectionId, DashboardSectionId, TicketDashboardActionId } from './types';

const OverviewModule = lazy(() => import('./modules/OverviewModule'));
const InboxModule = lazy(() => import('./modules/InboxModule'));
const GeneralModule = lazy(() => import('./modules/GeneralModule'));
const ServerRolesModule = lazy(() => import('./modules/ServerRolesModule'));
const TicketsModule = lazy(() => import('./modules/TicketsModule'));
const VerificationModule = lazy(() => import('./modules/VerificationModule'));
const WelcomeModule = lazy(() => import('./modules/WelcomeModule'));
const SuggestionsModule = lazy(() => import('./modules/SuggestionsModule'));
const ModlogsModule = lazy(() => import('./modules/ModlogsModule'));
const CommandsModule = lazy(() => import('./modules/CommandsModule'));
const SystemModule = lazy(() => import('./modules/SystemModule'));
const ActivityModule = lazy(() => import('./modules/ActivityModule'));
const AnalyticsModule = lazy(() => import('./modules/AnalyticsModule'));

function ModuleFallback() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="dashboard-skeleton h-56 rounded-[2rem] border border-white/10 bg-white/70 dark:bg-surface-800/75"
        />
      ))}
    </div>
  );
}

function isDashboardSectionId(value: string | null): value is DashboardSectionId {
  return Boolean(value && dashboardSectionIds.includes(value as DashboardSectionId));
}

function readStoredSection(guildId: string): DashboardSectionId | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(`${DASHBOARD_SECTION_STORAGE_PREFIX}${guildId}`);
  return isDashboardSectionId(value) ? value : null;
}

function persistSection(guildId: string, section: DashboardSectionId) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`${DASHBOARD_SECTION_STORAGE_PREFIX}${guildId}`, section);
}

export default function DashboardPage() {
  const authQuery = useDashboardAuth();
  const signIn = useSignInWithDiscord();
  const signOut = useSignOutDashboard();
  const syncGuilds = useSyncDashboardGuilds();
  const [activeSection, setActiveSection] = useState<DashboardSectionId>('overview');

  const authState = authQuery.data ?? { session: null, user: null };
  const canUseDashboard = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const isAuthenticated = Boolean(authState.user);

  const guildsQuery = useDashboardGuilds(isAuthenticated);
  const guilds = guildsQuery.data ?? [];
  const { selectedGuild, selectedGuildId, setSelectedGuildId } = useGuildSelection(guilds);
  const snapshotQuery = useGuildDashboardSnapshot(selectedGuildId, Boolean(selectedGuildId));
  const requestConfigChange = useRequestGuildConfigChange(selectedGuildId);
  const requestBackupAction = useRequestGuildBackupAction(selectedGuildId);
  const requestTicketAction = useRequestTicketDashboardAction(selectedGuildId);

  const snapshot = snapshotQuery.data;
  const mutations = snapshot?.mutations ?? [];
  const syncStatus = snapshot?.syncStatus ?? null;
  const syncErrorMessage =
    syncGuilds.error instanceof Error ? syncGuilds.error.message : undefined;

  useEffect(() => {
    if (!selectedGuildId) {
      return;
    }

    const stored = readStoredSection(selectedGuildId);
    if (stored) {
      setActiveSection(stored);
      return;
    }

    setActiveSection(snapshot?.config.dashboardPreferences.defaultSection ?? 'overview');
  }, [selectedGuildId, snapshot?.config.dashboardPreferences.defaultSection]);

  useEffect(() => {
    if (!selectedGuildId) {
      return;
    }

    persistSection(selectedGuildId, activeSection);
  }, [activeSection, selectedGuildId]);

  function handleSectionChange(section: DashboardSectionId) {
    setActiveSection(section);
  }

  async function handleConfigSave(section: ConfigMutationSectionId, payload: unknown) {
    await requestConfigChange.mutateAsync({
      section,
      payload,
    });
  }

  async function handleCreateBackup() {
    await requestBackupAction.mutateAsync({
      action: 'create_backup',
      payload: {},
    });
  }

  async function handleRestoreBackup(backupId: string) {
    await requestBackupAction.mutateAsync({
      action: 'restore_backup',
      payload: { backupId },
    });
  }

  async function handleTicketAction(action: TicketDashboardActionId, payload: Record<string, unknown>) {
    await requestTicketAction.mutateAsync({
      action,
      payload,
    });
  }

  function syncGuildAccess() {
    if (!authState.session?.provider_token) {
      signIn.mutate();
      return;
    }

    void syncGuilds.mutateAsync(authState.session.provider_token).catch(() => undefined);
  }

  const titleGuildName = selectedGuild?.guildName ?? 'Dashboard';
  const backupMutation = getLatestBackupMutation(mutations);
  const pendingMutations = syncStatus?.pendingMutations ?? mutations.filter((mutation) => mutation.status === 'pending').length;
  const failedMutations = syncStatus?.failedMutations ?? mutations.filter((mutation) => mutation.status === 'failed').length;

  return (
    <>
      <Helmet>
        <title>{config.botName} | Dashboard | {titleGuildName}</title>
        <meta
          name="description"
          content="Dashboard profesional para administrar configuraciones, actividad y analiticas de tu bot de Discord."
        />
      </Helmet>

      {authQuery.isLoading ? (
        <div className="dashboard-shell flex min-h-screen items-center justify-center px-4 text-white">
          <div className="dashboard-surface px-8 py-10">
            <p className="text-lg font-semibold">Validando sesion del dashboard...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="dashboard-shell px-4 py-10 text-white">
          <div className="mx-auto max-w-5xl">
            <AuthCard
              canUseDashboard={canUseDashboard}
              isLoading={signIn.isPending}
              errorMessage={signIn.error instanceof Error ? signIn.error.message : undefined}
              onLogin={() => signIn.mutate()}
            />
          </div>
        </div>
      ) : guildsQuery.isLoading ? (
        <div className="dashboard-shell px-4 py-10 text-white">
          <div className="dashboard-surface mx-auto max-w-6xl p-8">
            <p className="text-lg font-semibold">Cargando servidores administrables...</p>
          </div>
        </div>
      ) : guildsQuery.isError ? (
        <div className="dashboard-shell px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <StateCard
              eyebrow="Error de datos"
              title="No pudimos cargar tus servidores"
              description={guildsQuery.error instanceof Error ? guildsQuery.error.message : 'Intenta sincronizar otra vez o revisa la configuracion de Supabase.'}
              icon={ServerCrash}
              tone="danger"
            />
          </div>
        </div>
      ) : !guilds.length ? (
        <div className="dashboard-shell px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <StateCard
              eyebrow="Sin servidores"
              title="No encontramos guilds administrables para esta cuenta"
              description="Asegurate de tener permisos de administracion o Manage Server en Discord y vuelve a sincronizar el acceso."
              icon={AlertTriangle}
              tone="warning"
              actions={(
                <button
                  type="button"
                  onClick={syncGuildAccess}
                  disabled={syncGuilds.isPending}
                  className="dashboard-primary-button"
                >
                  <RefreshCcw className={`h-4 w-4 ${syncGuilds.isPending ? 'animate-spin' : ''}`} />
                  Re-sincronizar acceso
                </button>
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
          onSectionChange={handleSectionChange}
          onGuildChange={setSelectedGuildId}
          onSync={syncGuildAccess}
          onLogout={() => signOut.mutate()}
          isSyncing={syncGuilds.isPending}
          syncError={syncErrorMessage}
          syncStatus={syncStatus}
          pendingMutations={pendingMutations}
          failedMutations={failedMutations}
        >
          {!selectedGuild ? (
            <StateCard
              eyebrow="Seleccion requerida"
              title="Escoge un servidor para continuar"
              description="En cuanto elijas un guild, cargaremos configuracion aplicada, inventario, auditoria y analiticas asociadas."
              icon={AlertTriangle}
            />
          ) : snapshotQuery.isError ? (
            <StateCard
              eyebrow="Modulo no disponible"
              title="No pudimos cargar este servidor"
              description={snapshotQuery.error instanceof Error ? snapshotQuery.error.message : 'Revisa tablas, politicas RLS y el bridge del bot.'}
              icon={ServerCrash}
              tone="danger"
            />
          ) : snapshotQuery.isLoading || !snapshot ? (
            <ModuleFallback />
          ) : (
            <Suspense fallback={<ModuleFallback />}>
              {activeSection === 'overview' ? (
                <OverviewModule
                  guild={selectedGuild}
                  config={snapshot.config}
                  events={snapshot.events}
                  metrics={snapshot.metrics}
                  mutations={snapshot.mutations}
                  backups={snapshot.backups}
                  syncStatus={snapshot.syncStatus}
                  onSectionChange={handleSectionChange}
                />
              ) : null}
              {activeSection === 'inbox' ? (
                <InboxModule
                  guild={selectedGuild}
                  workspace={snapshot.ticketWorkspace}
                  mutation={snapshot.mutations.find((entry) => entry.mutationType === 'ticket_action') ?? null}
                  syncStatus={snapshot.syncStatus}
                  isMutating={requestTicketAction.isPending}
                  onAction={handleTicketAction}
                />
              ) : null}
              {activeSection === 'general' ? (
                <GeneralModule
                  guild={selectedGuild}
                  config={snapshot.config}
                  mutation={getLatestMutationForSection(snapshot.mutations, 'general')}
                  syncStatus={snapshot.syncStatus}
                  isSaving={requestConfigChange.isPending}
                  onSave={(values) =>
                    handleConfigSave('general', {
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
                  isSaving={requestConfigChange.isPending}
                  onSave={(values) => handleConfigSave('server_roles_channels', values)}
                />
              ) : null}
              {activeSection === 'tickets' ? (
                <TicketsModule
                  guild={selectedGuild}
                  config={snapshot.config}
                  inventory={snapshot.inventory}
                  mutation={getLatestMutationForSection(snapshot.mutations, 'tickets')}
                  syncStatus={snapshot.syncStatus}
                  isSaving={requestConfigChange.isPending}
                  onSave={(values) => handleConfigSave('tickets', values)}
                />
              ) : null}
              {activeSection === 'verification' ? (
                <VerificationModule
                  guild={selectedGuild}
                  config={snapshot.config}
                  inventory={snapshot.inventory}
                  mutation={getLatestMutationForSection(snapshot.mutations, 'verification')}
                  syncStatus={snapshot.syncStatus}
                  isSaving={requestConfigChange.isPending}
                  onSave={(values) => handleConfigSave('verification', values)}
                />
              ) : null}
              {activeSection === 'welcome' ? (
                <WelcomeModule
                  guild={selectedGuild}
                  config={snapshot.config}
                  inventory={snapshot.inventory}
                  mutation={getLatestMutationForSection(snapshot.mutations, 'welcome')}
                  syncStatus={snapshot.syncStatus}
                  isSaving={requestConfigChange.isPending}
                  onSave={(values) => handleConfigSave('welcome', values)}
                />
              ) : null}
              {activeSection === 'suggestions' ? (
                <SuggestionsModule
                  guild={selectedGuild}
                  config={snapshot.config}
                  inventory={snapshot.inventory}
                  mutation={getLatestMutationForSection(snapshot.mutations, 'suggestions')}
                  syncStatus={snapshot.syncStatus}
                  isSaving={requestConfigChange.isPending}
                  onSave={(values) => handleConfigSave('suggestions', values)}
                />
              ) : null}
              {activeSection === 'modlogs' ? (
                <ModlogsModule
                  guild={selectedGuild}
                  config={snapshot.config}
                  inventory={snapshot.inventory}
                  mutation={getLatestMutationForSection(snapshot.mutations, 'modlogs')}
                  syncStatus={snapshot.syncStatus}
                  isSaving={requestConfigChange.isPending}
                  onSave={(values) => handleConfigSave('modlogs', values)}
                />
              ) : null}
              {activeSection === 'commands' ? (
                <CommandsModule
                  guild={selectedGuild}
                  config={snapshot.config}
                  inventory={snapshot.inventory}
                  mutation={getLatestMutationForSection(snapshot.mutations, 'commands')}
                  syncStatus={snapshot.syncStatus}
                  isSaving={requestConfigChange.isPending}
                  onSave={(values) => handleConfigSave('commands', values)}
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
                  isSaving={requestConfigChange.isPending}
                  isRequestingBackup={requestBackupAction.isPending}
                  onSave={(values) => handleConfigSave('system', values)}
                  onCreateBackup={handleCreateBackup}
                  onRestoreBackup={handleRestoreBackup}
                />
              ) : null}
              {activeSection === 'activity' ? (
                <ActivityModule
                  guild={selectedGuild}
                  events={snapshot.events}
                  mutations={snapshot.mutations}
                />
              ) : null}
              {activeSection === 'analytics' ? (
                <AnalyticsModule guild={selectedGuild} metrics={snapshot.metrics} />
              ) : null}
            </Suspense>
          )}
        </DashboardShell>
      )}
    </>
  );
}
