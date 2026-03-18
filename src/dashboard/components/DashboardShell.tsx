import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { dashboardSections } from '../constants';
import { drawerVariants, fadeInVariants, fadeUpVariants, staggerContainerVariants } from '../motion';
import type { DashboardGuild, DashboardSectionId, GuildSyncStatus } from '../types';
import {
  formatDateTime,
  formatRelativeTime,
  getHealthLabel,
  resolveGuildIconUrl,
  resolveUserAvatarUrl,
} from '../utils';
import { config } from '../../config';
import { useTheme } from '../../components/ThemeProvider';
import Logo from '../../components/Logo';

interface DashboardShellProps {
  user: User;
  guilds: DashboardGuild[];
  selectedGuild: DashboardGuild | null;
  activeSection: DashboardSectionId;
  onSectionChange: (section: DashboardSectionId) => void;
  onGuildChange: (guildId: string) => void;
  onSync: () => void;
  onLogout: () => void;
  isSyncing: boolean;
  syncError?: string;
  syncStatus: GuildSyncStatus | null;
  pendingMutations: number;
  failedMutations: number;
  children: ReactNode;
}

interface SidebarProps {
  guilds: DashboardGuild[];
  selectedGuild: DashboardGuild | null;
  activeSection: DashboardSectionId;
  onSectionChange: (section: DashboardSectionId) => void;
  onGuildChange: (guildId: string) => void;
  onLogout: () => void;
  isSyncing: boolean;
  closeOnNavigate?: () => void;
}

function SidebarContent({
  guilds,
  selectedGuild,
  activeSection,
  onSectionChange,
  onGuildChange,
  onLogout,
  isSyncing,
  closeOnNavigate,
}: SidebarProps) {
  const dashboardBrandLabel = `${config.botName} Dashboard`;

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="show"
      className="dashboard-sidebar-panel relative flex h-full min-h-0 flex-col overflow-hidden text-white"
    >
      <div className="pointer-events-none absolute -right-12 top-0 h-44 w-44 rounded-full bg-brand-500/18 blur-3xl" />

      <Link to="/" className="relative z-[1] flex items-center gap-3">
        <Logo size="lg" withText={false} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-200">
            {config.botName}
          </p>
          <p className="mt-1 text-[1.2rem] font-bold tracking-[-0.04em] text-white">
            {dashboardBrandLabel}
          </p>
        </div>
      </Link>

      <div className="relative z-[1] mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Servidor activo
            </p>
            <p className="mt-2 break-words text-base font-semibold text-white">
              {selectedGuild?.guildName ?? 'Selecciona un servidor'}
            </p>
          </div>
          <span className={`dashboard-status-pill-compact min-w-[7rem] justify-center px-3 py-2 text-center tracking-[0.13em] ${
            selectedGuild?.botInstalled
              ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
              : 'border-amber-400/25 bg-amber-400/10 text-amber-100'
          }`}>
            {selectedGuild?.botInstalled ? 'Instalado' : 'Pendiente'}
          </span>
        </div>

        <label
          htmlFor="guild-select"
          className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45"
        >
          Cambiar servidor
        </label>
        <select
          id="guild-select"
          value={selectedGuild?.guildId ?? ''}
          onChange={(event) => {
            onGuildChange(event.target.value);
            closeOnNavigate?.();
          }}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-brand-300 focus:bg-white/[0.14]"
        >
          {guilds.map((guild) => (
            <option key={guild.guildId} value={guild.guildId} className="bg-surface-800 text-white">
              {guild.guildName}
              {guild.botInstalled ? ' - listo' : ' - invitar'}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-sidebar-scroll relative z-[1] mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/40">
          Modulos
        </p>
        <motion.nav variants={staggerContainerVariants} initial="hidden" animate="show" className="mt-3 space-y-1.5 pb-4">
          {dashboardSections.map((section) => {
            const Icon = section.icon;
            const active = activeSection === section.id;

            return (
              <motion.button
                key={section.id}
                type="button"
                variants={fadeInVariants}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  onSectionChange(section.id);
                  closeOnNavigate?.();
                }}
                className={`group w-full rounded-[1.35rem] border px-4 py-3 text-left transition ${
                  active
                    ? 'border-brand-300/30 bg-[linear-gradient(135deg,rgba(88,101,242,0.22),rgba(20,184,166,0.11))] text-white shadow-[0_16px_30px_rgba(88,101,242,0.16)]'
                    : 'border-transparent bg-white/[0.028] text-white/72 hover:border-white/10 hover:bg-white/[0.055] hover:text-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[1rem] border ${
                    active
                      ? 'border-white/10 bg-white/10 text-white'
                      : 'border-white/[0.08] bg-white/5 text-white/70 group-hover:text-white'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold tracking-[-0.02em]">{section.label}</p>
                    <p className="mt-1 text-sm leading-5 text-white/52 group-hover:text-white/72">
                      {section.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.nav>
      </div>

      <div className="relative z-[1] mt-4 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
              Sesion
            </p>
            <p className="mt-2 text-sm text-white/68">
              {isSyncing ? 'Actualizando inventario...' : 'Panel listo para operar'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/35" />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="dashboard-secondary-button mt-4 w-full border-white/10 bg-white/[0.06] text-white hover:border-rose-300/30 hover:text-rose-100 dark:border-white/10 dark:bg-white/[0.06]"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </div>
    </motion.div>
  );
}

export default function DashboardShell({
  user,
  guilds,
  selectedGuild,
  activeSection,
  onSectionChange,
  onGuildChange,
  onSync,
  onLogout,
  isSyncing,
  syncError,
  syncStatus,
  pendingMutations,
  failedMutations,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const userAvatarUrl = resolveUserAvatarUrl(user);
  const guildIconUrl = selectedGuild ? resolveGuildIconUrl(selectedGuild) : null;
  const dashboardBrandLabel = `${config.botName} Dashboard`;

  const statusPills = [
    {
      label: selectedGuild?.botInstalled ? 'Bot activo en el servidor' : 'Bot sin instalar',
      className: selectedGuild?.botInstalled
        ? 'border-emerald-200/70 bg-emerald-50/90 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/25 dark:text-emerald-200'
        : 'border-amber-200/70 bg-amber-50/90 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-200',
    },
    {
      label: getHealthLabel(syncStatus),
      className:
        syncStatus?.bridgeStatus === 'error'
          ? 'border-rose-200/70 bg-rose-50/90 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/25 dark:text-rose-200'
          : syncStatus?.bridgeStatus === 'degraded'
            ? 'border-amber-200/70 bg-amber-50/90 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-200'
            : 'border-sky-200/70 bg-sky-50/90 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/25 dark:text-sky-200',
    },
    {
      label: `${pendingMutations} en cola`,
      className: 'border-slate-200/80 bg-white/90 text-slate-700 dark:border-surface-600 dark:bg-surface-700/80 dark:text-slate-200',
    },
    {
      label: `${failedMutations} fallidas`,
      className:
        failedMutations > 0
          ? 'border-rose-200/70 bg-rose-50/90 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/25 dark:text-rose-200'
          : 'border-slate-200/80 bg-white/90 text-slate-700 dark:border-surface-600 dark:bg-surface-700/80 dark:text-slate-200',
    },
  ];

  return (
    <div className="dashboard-shell text-slate-950 dark:text-white">
      <div className="relative z-[1] mx-auto grid max-w-[1760px] gap-5 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-4 h-[calc(100vh-2rem)]">
            <SidebarContent
              guilds={guilds}
              selectedGuild={selectedGuild}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              onGuildChange={onGuildChange}
              onLogout={onLogout}
              isSyncing={isSyncing}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <motion.header
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            className="dashboard-header-shell overflow-hidden px-4 py-4 sm:px-5 lg:px-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_24%),linear-gradient(135deg,rgba(88,101,242,0.16),transparent_55%)]" />
            <div className="relative z-[1] flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="flex items-start gap-3 lg:gap-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="dashboard-secondary-button h-11 w-11 p-0 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)),radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_62%),rgba(5,8,18,0.92)] p-[3px] text-white shadow-[0_16px_36px_rgba(88,101,242,0.22)]">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[0.95rem] bg-[rgba(7,12,24,0.82)]">
                    {guildIconUrl ? (
                      <img
                        src={guildIconUrl}
                        alt={selectedGuild?.guildName ?? 'Servidor'}
                        className="h-full w-full rounded-[0.95rem] object-cover"
                      />
                    ) : (
                      <Logo size="sm" withText={false} frameClassName="h-full w-full rounded-[0.95rem] border-0 bg-transparent p-1.5 shadow-none" />
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="dashboard-panel-label">{dashboardBrandLabel}</p>
                  <h1 className="mt-1.5 break-words text-[1.45rem] font-bold tracking-[-0.05em] text-slate-950 dark:text-white lg:text-[1.65rem]">
                    {selectedGuild?.guildName ?? 'Sin seleccion'}
                  </h1>
                  <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Estado del servidor, sincronizacion del bridge y acciones de operacion en una vista mas compacta.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="dashboard-status-pill-compact border-slate-200/80 bg-white/90 text-slate-700 dark:border-surface-600 dark:bg-surface-700/80 dark:text-slate-200">
                      <Users className="h-3.5 w-3.5" />
                      {selectedGuild?.memberCount?.toLocaleString() ?? '0'} miembros
                    </span>
                    <span className="dashboard-status-pill-compact border-slate-200/80 bg-white/90 text-slate-700 dark:border-surface-600 dark:bg-surface-700/80 dark:text-slate-200">
                      <Sparkles className="h-3.5 w-3.5" />
                      Plan {selectedGuild?.premiumTier ?? 'free'}
                    </span>
                    <span className="dashboard-status-pill-compact border-slate-200/80 bg-white/90 text-slate-700 dark:border-surface-600 dark:bg-surface-700/80 dark:text-slate-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Ultimo heartbeat {formatRelativeTime(syncStatus?.lastHeartbeatAt ?? selectedGuild?.botLastSeenAt ?? null)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-3 2xl:max-w-[52rem] 2xl:items-end">
                <div className="flex flex-wrap gap-2 2xl:justify-end">
                  {statusPills.map((pill) => (
                    <span key={pill.label} className={`dashboard-status-pill-compact ${pill.className}`}>
                      {pill.label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 2xl:justify-end">
                  <div className="dashboard-surface-soft flex min-w-0 items-center gap-3 px-3 py-2.5">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-surface-600">
                      {userAvatarUrl ? (
                        <img
                          src={userAvatarUrl}
                          alt={user.email ?? 'Usuario'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-slate-700 dark:text-white">
                          {user.email?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                      )}
                    </div>
                    <div className="hidden min-w-0 text-left sm:block">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                        {user.user_metadata?.full_name
                          || user.user_metadata?.name
                          || user.email
                          || 'Administrador'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ultima sincronizacion {formatDateTime(syncStatus?.lastConfigSyncAt ?? selectedGuild?.lastSyncedAt ?? null)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="dashboard-secondary-button h-11 w-11 p-0"
                    aria-label="Cambiar tema"
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={onSync}
                    disabled={isSyncing}
                    className="dashboard-primary-button min-w-[12.25rem]"
                  >
                    <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Re-sincronizar'}
                  </button>
                </div>

                {syncError ? (
                  <div className="rounded-[1.1rem] border border-rose-200/70 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
                    {syncError}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.header>

          <main className="mt-5 pb-10">{children}</main>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.button
              type="button"
              aria-label="Cerrar menu"
              className="absolute inset-0 bg-slate-950/72 backdrop-blur-md"
              variants={fadeInVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-[92vw] max-w-[360px] p-4"
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <SidebarContent
                guilds={guilds}
                selectedGuild={selectedGuild}
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onGuildChange={onGuildChange}
                onLogout={onLogout}
                isSyncing={isSyncing}
                closeOnNavigate={() => setMobileOpen(false)}
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
