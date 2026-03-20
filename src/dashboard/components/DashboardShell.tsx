import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ChevronRight,
  LogOut,
  Menu,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { dashboardSections, dashboardTaskGroups } from '../constants';
import { drawerVariants, fadeInVariants, fadeUpVariants, staggerContainerVariants } from '../motion';
import type { DashboardGuild, DashboardSectionId, GuildSyncStatus } from '../types';
import {
  formatDateTime,
  formatRelativeTime,
  type DashboardSectionState,
  getHealthLabel,
  resolveGuildIconUrl,
  resolveUserAvatarUrl,
} from '../utils';
import { config, getDiscordInviteUrl } from '../../config';
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
  sectionStates: DashboardSectionState[];
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
  syncStatus: GuildSyncStatus | null;
  sectionStates: DashboardSectionState[];
  closeOnNavigate?: () => void;
}

function getSectionStatusLabel(status: DashboardSectionState['status'], t: ReturnType<typeof useTranslation>['t']) {
  switch (status) {
    case 'active':
      return t('dashboard.shell.sectionStatus.active');
    case 'basic':
      return t('dashboard.shell.sectionStatus.basic');
    case 'needs_attention':
      return t('dashboard.shell.sectionStatus.needsAttention');
    default:
      return t('dashboard.shell.sectionStatus.notConfigured');
  }
}

function getSectionStatusClasses(status: DashboardSectionState['status']) {
  switch (status) {
    case 'active':
      return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100';
    case 'basic':
      return 'border-sky-400/25 bg-sky-400/10 text-sky-100';
    case 'needs_attention':
      return 'border-amber-400/25 bg-amber-400/10 text-amber-100';
    default:
      return 'border-white/10 bg-white/5 text-white/68';
  }
}

function SidebarContent({
  guilds,
  selectedGuild,
  activeSection,
  onSectionChange,
  onGuildChange,
  onLogout,
  isSyncing,
  syncStatus,
  sectionStates,
  closeOnNavigate,
}: SidebarProps) {
  const { t } = useTranslation();
  const dashboardBrandLabel = `${config.botName} Dashboard`;
  const sectionStateMap = new Map(sectionStates.map((section) => [section.sectionId, section]));
  const sectionMetaMap = new Map(dashboardSections.map((section) => [section.id, section]));

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="show"
      className="dashboard-sidebar-panel relative flex h-full min-h-0 flex-col overflow-hidden text-white"
    >
      <div className="pointer-events-none absolute -right-12 top-0 h-44 w-44 rounded-full bg-brand-500/18 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="dashboard-sidebar-main relative z-[1] flex min-h-0 flex-1 flex-col">
        <div className="dashboard-sidebar-top shrink-0">
          <Link to="/" className="dashboard-sidebar-brand relative z-[1] flex items-center gap-4 rounded-[1.65rem] px-4 py-4">
            <Logo
              size="lg"
              withText={false}
              frameClassName="rounded-[1.9rem]"
              imageClassName="drop-shadow-[0_20px_42px_rgba(129,140,248,0.32)]"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-100/90">
                {config.botName}
              </p>
              <p className="mt-1 text-[1.2rem] font-black tracking-[-0.04em] text-white">
                {dashboardBrandLabel}
              </p>
              <p className="mt-1 max-w-[14rem] text-[0.88rem] leading-5 text-slate-200/78">
                {t('dashboard.shell.brandDescription')}
              </p>
            </div>
          </Link>

          <div className="dashboard-sidebar-block dashboard-sidebar-active-guild relative z-[1] mt-5 rounded-[1.45rem] p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="dashboard-sidebar-label text-[11px] font-semibold uppercase tracking-[0.24em]">
                  {t('dashboard.shell.activeServer')}
                </p>
                <p className="mt-2 break-words text-[0.97rem] font-semibold text-white">
                  {selectedGuild?.guildName ?? t('dashboard.shell.selectServer')}
                </p>
                <p className="dashboard-sidebar-copy mt-1.5 text-[0.84rem] leading-5">
                  {!selectedGuild
                    ? t('dashboard.shell.serverEmpty')
                    : selectedGuild.botInstalled
                      ? t('dashboard.shell.serverReady')
                      : t('dashboard.shell.serverPending')}
                </p>
              </div>
              <span className={`dashboard-status-pill-compact shrink-0 self-start whitespace-nowrap px-3 py-2 text-center tracking-[0.13em] ${selectedGuild?.botInstalled
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                : 'border-amber-400/25 bg-amber-400/10 text-amber-100'
                }`}>
                {selectedGuild?.botInstalled ? t('dashboard.shell.readyBadge') : t('dashboard.shell.pendingBadge')}
              </span>
            </div>

            <label
              htmlFor="guild-select"
              className="dashboard-sidebar-label mt-4 block text-[11px] font-semibold uppercase tracking-[0.24em]"
            >
              {t('dashboard.shell.guildSelector')}
            </label>
            <select
              id="guild-select"
              value={selectedGuild?.guildId ?? ''}
              onChange={(event) => {
                onGuildChange(event.target.value);
                closeOnNavigate?.();
              }}
              className="dashboard-sidebar-select mt-2 w-full rounded-2xl px-4 py-3 text-sm font-medium outline-none transition"
            >
              {!selectedGuild ? (
                <option value="" className="bg-surface-800 text-white">
                  {t('dashboard.shell.selectServer')}
                </option>
              ) : null}
              {guilds.map((guild) => (
                <option key={guild.guildId} value={guild.guildId} className="bg-surface-800 text-white">
                  {guild.guildName}
                  {guild.botInstalled ? t('dashboard.shell.readySuffix') : t('dashboard.shell.inviteSuffix')}
                </option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                {t('dashboard.shell.guildsCount', { count: guilds.length })}
              </span>
              <span className={`dashboard-status-pill-compact ${syncStatus?.bridgeStatus === 'error'
                ? 'border-rose-400/25 bg-rose-400/10 text-rose-100'
                : syncStatus?.bridgeStatus === 'degraded'
                  ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
                  : 'border-sky-400/25 bg-sky-400/10 text-sky-100'
                }`}>
                {getHealthLabel(syncStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar-bottom mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="dashboard-sidebar-scroll relative z-[1] mt-2 min-h-[10rem] flex-1 overflow-y-auto pr-2">
            <p className="dashboard-sidebar-muted px-2 text-[11px] font-semibold uppercase tracking-[0.26em]">
              {t('dashboard.shell.taskNavigation')}
            </p>
            <motion.nav variants={staggerContainerVariants} initial="hidden" animate="show" className="mt-3 space-y-3 pb-4">
              {dashboardTaskGroups.map((group) => (
                <section key={group.id} className="dashboard-sidebar-group dashboard-sidebar-group-shell">
                  <div className="mb-3 flex items-start gap-2 px-1">
                    <div className="dashboard-sidebar-group-icon mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[0.9rem]">
                      <group.icon className="h-3.5 w-3.5 text-white/72" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/70">
                        {group.label}
                      </p>
                      <p className="text-[0.78rem] leading-5 text-white/46">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {group.sections.map((sectionId) => {
                      const section = sectionMetaMap.get(sectionId);
                      if (!section) {
                        return null;
                      }

                      const state = sectionStateMap.get(section.id);
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
                          className={`group w-full rounded-[1.15rem] border px-3 py-2.5 text-left transition focus-visible:outline-none ${active
                            ? 'dashboard-sidebar-nav-active border-brand-300/40 bg-[linear-gradient(135deg,rgba(88,101,242,0.24),rgba(20,184,166,0.1))] text-white shadow-[0_14px_28px_rgba(88,101,242,0.18)]'
                            : 'dashboard-sidebar-nav'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[0.95rem] border ${active
                              ? 'border-white/14 bg-white/12 text-white shadow-[0_12px_22px_rgba(15,23,42,0.18)]'
                              : 'dashboard-sidebar-icon text-white/80 group-hover:text-white'
                              }`}>
                              <Icon className="h-[0.95rem] w-[0.95rem]" />
                            </div>
                            <div className="min-w-0 flex-1 pr-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-[0.92rem] font-semibold tracking-[-0.02em] text-white">
                                  {section.label}
                                </p>
                                {state ? (
                                  <span className={`dashboard-status-pill-compact hidden px-2.5 py-1 text-[0.62rem] xl:inline-flex ${getSectionStatusClasses(state.status)}`}>
                                    {getSectionStatusLabel(state.status, t)}
                                  </span>
                                ) : null}
                              </div>
                              <p className="dashboard-sidebar-nav-copy mt-0.5 transition-colors group-hover:text-white/84">
                                {state?.summary ?? section.description}
                              </p>
                              {state ? (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="dashboard-sidebar-progress h-1.5 flex-1 overflow-hidden rounded-full">
                                    <div
                                      className="dashboard-sidebar-progress-bar h-full rounded-full"
                                      style={{ width: `${Math.max(6, Math.round(state.progress * 100))}%` }}
                                    />
                                  </div>
                                  <span className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/44">
                                    {Math.round(state.progress * 100)}%
                                  </span>
                                </div>
                              ) : null}
                            </div>
                            <ChevronRight className={`h-4 w-4 flex-shrink-0 transition ${active ? 'text-white/78' : 'text-white/28 group-hover:text-white/54'
                              }`} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {group.shortcuts.map((shortcut) => {
                      const shortcutActive = activeSection === shortcut.sectionId;

                      return (
                        <button
                          key={shortcut.id}
                          type="button"
                          onClick={() => {
                            onSectionChange(shortcut.sectionId);
                            closeOnNavigate?.();
                          }}
                          className={`dashboard-sidebar-shortcut ${shortcutActive ? 'dashboard-sidebar-shortcut-active' : ''
                            }`}
                          title={shortcut.description}
                        >
                          {shortcut.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </motion.nav>
          </div>

          <div className="dashboard-sidebar-block dashboard-sidebar-session relative z-[1] mt-3 shrink-0 rounded-[1.3rem] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="dashboard-sidebar-muted text-[11px] font-semibold uppercase tracking-[0.24em]">
                  {t('dashboard.shell.session')}
                </p>
                <p className="dashboard-sidebar-copy mt-1.5 text-[0.85rem]">
                  {isSyncing ? t('dashboard.shell.syncingInventory') : syncStatus?.bridgeMessage ?? t('dashboard.shell.panelReady')}
                </p>
                <p className="dashboard-sidebar-label mt-1.5 text-[0.73rem] tracking-[0.12em]">
                  {t('dashboard.shell.lastHeartbeat', { time: formatRelativeTime(syncStatus?.lastHeartbeatAt ?? null) })}
                </p>
              </div>
              <ChevronRight className="dashboard-sidebar-muted h-4 w-4 flex-shrink-0" />
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="dashboard-secondary-button dashboard-secondary-button-inverse mt-4 w-full hover:border-rose-300/30 hover:text-rose-100"
            >
              <LogOut className="h-4 w-4" />
              {t('dashboard.shell.logout')}
            </button>
          </div>
        </div>
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
  sectionStates,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const userAvatarUrl = resolveUserAvatarUrl(user);
  const guildIconUrl = selectedGuild ? resolveGuildIconUrl(selectedGuild) : null;
  const dashboardBrandLabel = `${config.botName} Dashboard`;
  const inviteUrl =
    selectedGuild && !selectedGuild.botInstalled
      ? getDiscordInviteUrl(selectedGuild.guildId)
      : '';
  const showInviteCta = Boolean(selectedGuild && !selectedGuild.botInstalled && inviteUrl);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const statusPills = [
    {
      label: selectedGuild?.botInstalled ? t('dashboard.shell.statusBotActive') : t('dashboard.shell.statusBotMissing'),
      className: selectedGuild?.botInstalled
        ? 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100'
        : 'border-amber-400/30 bg-amber-500/12 text-amber-100',
    },
    {
      label: getHealthLabel(syncStatus),
      className:
        syncStatus?.bridgeStatus === 'error'
          ? 'border-rose-400/30 bg-rose-500/12 text-rose-100'
          : syncStatus?.bridgeStatus === 'degraded'
            ? 'border-amber-400/30 bg-amber-500/12 text-amber-100'
            : 'border-sky-400/30 bg-sky-500/12 text-sky-100',
    },
    {
      label: t('dashboard.shell.statusInQueue', { count: pendingMutations }),
      className: 'dashboard-neutral-pill',
    },
    {
      label: t('dashboard.shell.statusFailed', { count: failedMutations }),
      className:
        failedMutations > 0
          ? 'border-rose-400/30 bg-rose-500/12 text-rose-100'
          : 'dashboard-neutral-pill',
    },
  ];

  return (
    <div className="dashboard-shell text-white">
      <a
        href="#dashboard-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-xl focus:border focus:border-white/20 focus:bg-slate-950 focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        {t('dashboard.shell.skipToContent')}
      </a>

      <div className="relative z-[1] mx-auto grid max-w-[1760px] gap-5 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 lg:block" aria-label={t('dashboard.shell.navAria')}>
          <div className="sticky top-4 h-[calc(100dvh-2rem)] min-h-0 max-h-[calc(100dvh-2rem)]">
            <SidebarContent
              guilds={guilds}
              selectedGuild={selectedGuild}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              onGuildChange={onGuildChange}
              onLogout={onLogout}
              isSyncing={isSyncing}
              syncStatus={syncStatus}
              sectionStates={sectionStates}
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_28%),radial-gradient(circle_at_14%_0%,rgba(88,101,242,0.15),transparent_36%),linear-gradient(135deg,rgba(8,12,28,0.26),transparent_58%)]" />
            <div className="relative z-[1] flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between 2xl:items-center">
              <div className="flex min-w-0 items-start gap-3 lg:gap-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="dashboard-secondary-button h-11 w-11 p-0 lg:hidden"
                  aria-label={t('dashboard.shell.openMenuAria')}
                  aria-expanded={mobileOpen}
                  aria-controls="dashboard-mobile-navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="dashboard-header-orb flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[1.15rem] p-[3px] text-white shadow-[0_16px_36px_rgba(88,101,242,0.22)] sm:h-14 sm:w-14">
                  <div className="dashboard-header-orb-inner flex h-full w-full items-center justify-center overflow-hidden rounded-[0.95rem]">
                    {guildIconUrl ? (
                      <img
                        src={guildIconUrl}
                        alt={selectedGuild?.guildName ?? 'Servidor'}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full rounded-[0.95rem] object-cover"
                      />
                    ) : (
                      <Logo size="sm" withText={false} frameClassName="h-full w-full rounded-[0.95rem] border-0 bg-transparent p-1.5 shadow-none" />
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="dashboard-panel-label">{dashboardBrandLabel}</p>
                  <h1 className="mt-1.5 break-words text-[1.45rem] font-bold tracking-[-0.05em] text-white lg:text-[1.65rem]">
                    {selectedGuild?.guildName ?? t('dashboard.shell.selectServer')}
                  </h1>
                  <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-300">
                    {t('dashboard.shell.headerDescription')}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                      <Users className="h-3.5 w-3.5" />
                      {t('dashboard.shell.membersCount', { count: (selectedGuild?.memberCount?.toLocaleString() ?? '0') as unknown as number })}
                    </span>
                    <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                      <Sparkles className="h-3.5 w-3.5" />
                      {t('dashboard.shell.planBadge', { tier: selectedGuild?.premiumTier ?? 'free' })}
                    </span>
                    <span className="dashboard-status-pill-compact dashboard-neutral-pill">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {t('dashboard.shell.heartbeatBadge', { time: formatRelativeTime(syncStatus?.lastHeartbeatAt ?? selectedGuild?.botLastSeenAt ?? null) })}
                    </span>
                  </div>
                  <div className="dashboard-header-focus-card mt-4 max-w-md rounded-[1.25rem] p-3.5">
                    <label
                      htmlFor="header-guild-select"
                      className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400"
                    >
                      {t('dashboard.shell.focusServer')}
                    </label>
                    <select
                      id="header-guild-select"
                      value={selectedGuild?.guildId ?? ''}
                      onChange={(event) => onGuildChange(event.target.value)}
                      className="dashboard-header-select mt-2 w-full rounded-2xl px-4 py-3 text-sm font-medium outline-none transition"
                    >
                      {!selectedGuild ? (
                        <option value="">{t('dashboard.shell.selectServer')}</option>
                      ) : null}
                      {guilds.map((guild) => (
                        <option key={guild.guildId} value={guild.guildId}>
                          {guild.guildName}
                          {guild.botInstalled ? t('dashboard.shell.readySuffix') : t('dashboard.shell.inviteSuffix')}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {selectedGuild?.botInstalled
                        ? t('dashboard.shell.focusReadyInfo')
                        : t('dashboard.shell.focusPendingInfo')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-3 xl:w-auto xl:max-w-[52rem] xl:items-end">
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  {statusPills.map((pill) => (
                    <span key={pill.label} className={`dashboard-status-pill-compact ${pill.className}`}>
                      {pill.label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:justify-between xl:justify-end">
                  <div className="dashboard-user-chip flex min-w-0 flex-1 items-center gap-3 rounded-[1.3rem] px-3 py-2.5 sm:flex-none">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                      {userAvatarUrl ? (
                        <img
                          src={userAvatarUrl}
                          alt={user.email ?? 'Usuario'}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-white">
                          {user.email?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                      )}
                    </div>
                    <div className="hidden min-w-0 text-left sm:block">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.user_metadata?.full_name
                          || user.user_metadata?.name
                          || user.email
                          || t('dashboard.shell.defaultUser')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t('dashboard.shell.lastSync', { time: formatDateTime(syncStatus?.lastConfigSyncAt ?? selectedGuild?.lastSyncedAt ?? null) })}
                      </p>
                    </div>
                  </div>

                  {showInviteCta ? (
                    <div className="dashboard-inline-notice-warning w-full rounded-[1.1rem] px-4 py-3 text-sm sm:w-auto">
                      <p className="text-xs leading-5 text-current/85">
                        {t('dashboard.inviteBot.helper')}
                      </p>
                      <a
                        href={inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dashboard-secondary-button mt-3 w-full border-amber-500/35 bg-amber-500/10 text-amber-100 hover:border-amber-400/45 hover:bg-amber-500/14 sm:min-w-[14rem] sm:w-auto"
                      >
                        {t('dashboard.inviteBot.cta')}
                      </a>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={onSync}
                    disabled={isSyncing}
                    className="dashboard-primary-button w-full sm:min-w-[12.25rem] sm:w-auto"
                  >
                    <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? t('dashboard.actions.syncingNow') : t('dashboard.actions.resyncNow')}
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:w-full xl:max-w-[44rem]">
                  <div className="dashboard-header-info-card rounded-[1.1rem] px-4 py-3 text-sm text-slate-200">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {t('dashboard.shell.bridgeHealth')}
                    </p>
                    <p className="mt-1.5 font-semibold text-white">
                      {getHealthLabel(syncStatus)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {syncStatus?.bridgeMessage ?? t('dashboard.shell.bridgeNoDetails')}
                    </p>
                  </div>
                  <div className="dashboard-header-info-card rounded-[1.1rem] px-4 py-3 text-sm text-slate-200">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {t('dashboard.shell.syncActivity')}
                    </p>
                    <p className="mt-1.5 font-semibold text-white">
                      {t('dashboard.shell.configSync', { time: formatRelativeTime(syncStatus?.lastConfigSyncAt ?? selectedGuild?.lastSyncedAt ?? null) })}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {t('dashboard.shell.inventorySync', {
                        time: formatRelativeTime(syncStatus?.lastInventoryAt ?? null),
                        pending: pendingMutations,
                        failed: failedMutations
                      })}
                    </p>
                  </div>
                </div>

                {syncError ? (
                  <div className="dashboard-inline-notice-danger rounded-[1.1rem] px-4 py-3 text-sm font-medium">
                    <p className="font-semibold">{t('dashboard.shell.syncFailed')}</p>
                    <p className="mt-1.5 text-sm leading-6 text-current/85">{syncError}</p>
                  </div>
                ) : null}
                {!syncError && failedMutations > 0 ? (
                  <div className="dashboard-inline-notice-warning flex items-start gap-2 rounded-[1.1rem] px-4 py-3 text-sm font-medium">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    {t('dashboard.shell.reviewNeeded')}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.header>

          <main id="dashboard-main-content" tabIndex={-1} className="mt-5 pb-10">
            {children}
          </main>
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
              id="dashboard-mobile-navigation"
              className="absolute inset-y-0 left-0 w-[92vw] max-w-[360px] p-3 sm:p-4"
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label={t('dashboard.shell.navAria')}
            >
              <SidebarContent
                guilds={guilds}
                selectedGuild={selectedGuild}
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onGuildChange={onGuildChange}
                onLogout={onLogout}
                isSyncing={isSyncing}
                syncStatus={syncStatus}
                sectionStates={sectionStates}
                closeOnNavigate={() => setMobileOpen(false)}
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="dashboard-secondary-button dashboard-secondary-button-inverse absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-2xl p-0"
                aria-label={t('dashboard.shell.closeMenuAria')}
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
