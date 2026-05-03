import { useEffect, useState, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import StarfieldBackground from '../../components/StarfieldBackground';
import type { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  LogOut,
  Menu,
  RefreshCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { dashboardSections, dashboardTaskGroups } from '../constants';
import { drawerVariants, fadeInVariants, fadeUpVariants, staggerContainerVariants } from '../motion';
import type { DashboardGuild, DashboardSectionId, GuildSyncStatus } from '../types';
import DashboardSelect from './DashboardSelect';
import {
  type DashboardSectionState,
  resolveGuildIconUrl,
} from '../utils';
import { config, getDiscordInviteUrl } from '../../config';
import Logo from '../../components/Logo';
import LanguageSelector from '../../components/LanguageSelector';
import CommandPalette from './CommandPalette';
import { usePrefetchSnapshot } from '../hooks/usePrefetchSnapshot';

/* ─── Glass tokens (matching Navbar scrolled state) ─── */
const GLASS_SIDEBAR =
  'bg-[linear-gradient(180deg,rgba(5,6,15,0.88),rgba(5,6,15,0.72))] backdrop-blur-2xl border border-white/[0.08] shadow-[0_18px_55px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.04)]';
const GLASS_HEADER =
  'bg-[linear-gradient(180deg,rgba(5,6,15,0.88),rgba(5,6,15,0.72))] backdrop-blur-2xl border border-white/[0.08] shadow-[0_18px_55px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.04)]';

interface DashboardShellProps {
  user: User | null;
  isAuthenticated: boolean;
  guilds: DashboardGuild[];
  selectedGuild: DashboardGuild | null;
  activeSection: DashboardSectionId;
  onSectionChange: (section: DashboardSectionId) => void;
  onGuildChange: (guildId: string) => void;
  onLogin: () => void;
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
  user: User | null;
  isAuthenticated: boolean;
  onSectionChange: (section: DashboardSectionId) => void;
  onGuildChange: (guildId: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  closeOnNavigate?: () => void;
}

function SidebarContent({
  guilds,
  selectedGuild,
  activeSection,
  user,
  isAuthenticated,
  onSectionChange,
  onGuildChange,
  onLogin,
  onLogout,
  closeOnNavigate,
}: SidebarProps) {
  const { t } = useTranslation();
  const prefetchSnapshot = usePrefetchSnapshot();
  const dashboardBrandLabel = `${config.botName} Dashboard`;
  const sectionMetaMap = new Map(dashboardSections.map((section) => [section.id, section]));

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="show"
      className={`relative flex h-full min-h-0 flex-col overflow-hidden text-white rounded-[1.75rem] p-2 ${GLASS_SIDEBAR}`}
    >
      {/* Ambient glow — matching Navbar radial accent */}
      <div className="pointer-events-none absolute -right-16 -top-8 h-52 w-52 rounded-full bg-indigo-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-16 h-36 w-36 rounded-full bg-cyan-400/[0.04] blur-3xl" />
      {/* Top edge light highlight — matching cinematic-glass inset */}
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        {/* ── Brand ── */}
        <div className="shrink-0 px-2 pt-2">
          <Link
            to="/"
            className="relative z-[1] flex items-center gap-4 rounded-2xl px-3 py-3 transition-all duration-300 hover:bg-white/[0.04]"
          >
            <Logo
              size="lg"
              withText={false}
              frameClassName="rounded-[1.2rem] h-12 w-12"
              imageClassName="drop-shadow-[0_20px_42px_rgba(129,140,248,0.32)]"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                {config.botName}
              </p>
              <p className="mt-0.5 text-base font-bold tracking-tight text-white">
                {dashboardBrandLabel}
              </p>
            </div>
          </Link>

          {/* ── Active guild block ── */}
          <div className="relative z-[1] mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t('dashboard.shell.activeServer')}
                </p>
                <p className="mt-1.5 break-words text-sm font-semibold text-white">
                  {selectedGuild?.guildName ?? t('dashboard.shell.selectServer')}
                </p>
              </div>
              <span className={`shrink-0 self-start whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${selectedGuild?.botInstalled
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                }`}>
                {selectedGuild?.botInstalled ? t('dashboard.shell.readyBadge') : t('dashboard.shell.pendingBadge')}
              </span>
            </div>

            <DashboardSelect
              value={selectedGuild?.guildId ?? ''}
              disabled={!isAuthenticated}
              onChange={(value) => {
                onGuildChange(value);
                closeOnNavigate?.();
              }}
              options={guilds.map((guild) => ({
                value: guild.guildId,
                label: guild.guildName,
              }))}
              className="mt-4"
              placeholder={t('dashboard.shell.selectServer')}
            />
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden px-2">
          <div className="relative z-[1] min-h-[10rem] flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <motion.nav variants={staggerContainerVariants} initial="hidden" animate="show" className="mt-2 space-y-4 pb-4">
              {dashboardTaskGroups.map((group) => (
                <section key={group.id}>
                  <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {t(group.label)}
                  </p>
                  <div className="space-y-1">
                    {group.sections.map((sectionId) => {
                      const section = sectionMetaMap.get(sectionId);
                      if (!section) return null;

                      const Icon = section.icon;
                      const active = activeSection === section.id;

                      return (
                        <motion.button
                          key={section.id}
                          type="button"
                          variants={fadeInVariants}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            onSectionChange(section.id);
                            closeOnNavigate?.();
                          }}
                          className={`group w-full rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
                            active
                              ? 'border-white/20 bg-white/[0.08] text-white shadow-[0_0_24px_rgba(255,255,255,0.06),0_0_48px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]'
                              : 'border-transparent bg-white/[0.015] text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'}`} />
                            <p className="truncate text-sm font-semibold flex-1">
                               {t(section.label)}
                            </p>
                            {active && <ChevronRight className="h-4 w-4 text-indigo-300" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </motion.nav>
          </div>

          {/* ── Logout ── */}
          <div className="relative z-[1] mt-3 shrink-0 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 mb-2 mx-2 space-y-3">
            <div className="sm:hidden flex justify-center pb-2 border-b border-white/[0.05]">
              <LanguageSelector />
            </div>

            {isAuthenticated && user && (
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (user.user_metadata?.full_name || user.email)?.[0] ?? 'U'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                </div>
              </div>
            )}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-4 py-2 text-sm font-semibold text-rose-300 transition-all duration-200 hover:border-rose-400/40 hover:bg-rose-500/[0.14] hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]"
              >
                <LogOut className="h-4 w-4" />
                {t('dashboard.shell.logout')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.08] px-4 py-2 text-sm font-semibold text-indigo-300 transition-all duration-200 hover:border-indigo-400/40 hover:bg-indigo-500/[0.14] hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              >
                <Sparkles className="h-4 w-4" />
                {t('dashboardAuth.authCard.cta')}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardShell({
  user,
  isAuthenticated,
  guilds,
  selectedGuild,
  activeSection,
  onSectionChange,
  onGuildChange,
  onLogin,
  onSync,
  onLogout,
  isSyncing,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const guildIconUrl = selectedGuild ? resolveGuildIconUrl(selectedGuild) : null;
  const inviteUrl = selectedGuild && !selectedGuild.botInstalled ? getDiscordInviteUrl(selectedGuild.guildId) : '';
  const showInviteCta = Boolean(selectedGuild && !selectedGuild.botInstalled && inviteUrl);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    const applyGlow = (e: MouseEvent) => {
      if (!shellRef.current) return;
      shellRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
      shellRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', applyGlow);
    return () => window.removeEventListener('mousemove', applyGlow);
  }, []);

  return (
    <div ref={shellRef} className="dashboard-shell text-white min-h-screen bg-[#02030a] mouse-glow">
      {/* STARFIELD BACKGROUND — same as landing Hero */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <StarfieldBackground />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_42%),radial-gradient(circle_at_18%_14%,rgba(34,211,238,0.06),transparent_28%),linear-gradient(180deg,rgba(5,6,15,0.4)_0%,rgba(2,3,10,0.85)_58%,rgba(0,0,0,0.96)_100%)]" />
      </div>

      {/* ── Layout grid ── */}
      <div className="relative z-[1] mx-auto grid max-w-[1760px] gap-5 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6 2xl:grid-cols-[320px_minmax(0,1fr)]">

        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden min-h-0 lg:block">
          <div className="sticky top-4 h-[calc(100dvh-2rem)] min-h-0 max-h-[calc(100dvh-2rem)]">
            <SidebarContent
              guilds={guilds}
              selectedGuild={selectedGuild}
              activeSection={activeSection}
              user={user}
              isAuthenticated={isAuthenticated}
              onSectionChange={onSectionChange}
              onGuildChange={onGuildChange}
              onLogin={onLogin}
              onLogout={onLogout}
            />
          </div>
        </aside>

        <div className="min-w-0">
          {/* ── Header bar (glassmorphism — identical to Navbar scrolled) ── */}
          <motion.header
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            className={`relative overflow-hidden rounded-[1.75rem] p-5 ${GLASS_HEADER}`}
          >
            {/* Subtle radial accent — top right cyan like Navbar */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.04),transparent_32%)]" />
            {/* Top edge light line — matching cinematic-glass inset */}
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <div className="relative z-[1] flex items-center justify-between gap-4">
              {/* Left Side: Server Name & Menu */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-300 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.8rem] border border-white/[0.08] bg-white/[0.04] p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  {guildIconUrl ? (
                    <img src={guildIconUrl} alt={t('dashboard.shell.guildIconAlt')} className="h-full w-full rounded-[0.6rem] object-cover" />
                  ) : (
                    <Logo size="sm" withText={false} frameClassName="h-full w-full rounded-[0.6rem] border-0 bg-transparent shadow-none" />
                  )}
                </div>

                <div className="min-w-0 hidden sm:block">
                  <h1 className="truncate text-lg font-bold tracking-tight text-white">
                    {selectedGuild?.guildName ?? t('dashboard.shell.selectServer')}
                  </h1>
                </div>
              </div>

              {/* Right Side: Search, Language, Sync, Profile */}
              <div className="flex flex-shrink-0 items-center gap-3">
                {/* Search Bar / Cmd+K trigger */}
                <button 
                  type="button"
                  onClick={() => {
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                  }}
                  className="hidden md:flex items-center justify-between w-48 lg:w-56 px-3 py-1.5 rounded-[0.85rem] bg-[#030408]/50 border border-white/[0.06] text-white/40 text-sm hover:bg-white/[0.04] hover:border-white/[0.12] hover:text-white/60 transition-all duration-200 cursor-pointer group shadow-inner overflow-hidden"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Search className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t('dashboard.commandPalette.placeholder', 'Buscar...')}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <kbd className="px-1.5 py-0.5 rounded-[0.3rem] bg-white/[0.08] text-[10px] font-sans group-hover:bg-white/[0.15] transition-colors shadow-sm border border-white/[0.04]">{typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}</kbd> 
                    <kbd className="px-1.5 py-0.5 rounded-[0.3rem] bg-white/[0.08] text-[10px] font-sans group-hover:bg-white/[0.15] transition-colors shadow-sm border border-white/[0.04]">K</kbd>
                  </div>
                </button>

                {/* Invite CTA */}
                {showInviteCta && (
                  <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className="btn-premium-primary hidden md:flex !py-1.5 !px-3 !text-xs !rounded-lg">
                    <Sparkles className="h-3 w-3" />
                    <span>{t('dashboard.inviteBot.cta')}</span>
                  </a>
                )}

                {/* Language (Compact) */}
                <div className="hidden sm:block">
                  <LanguageSelector />
                </div>

                {/* Sync button */}
                <button
                  type="button"
                  onClick={onSync}
                  disabled={isSyncing || !isAuthenticated}
                  title={isSyncing ? t('dashboard.actions.syncingNow') : t('dashboard.actions.resyncNow')}
                  className="flex items-center justify-center h-8 w-8 rounded-full border border-white/[0.08] bg-white/[0.02] text-slate-300 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                >
                  <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>

                {/* User chip */}
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] p-1 pr-3 backdrop-blur-md shadow-sm transition-colors hover:bg-white/[0.04]">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase overflow-hidden ring-1 ring-white/10">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (user.user_metadata?.full_name || user.email)?.[0] ?? 'U'
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 hidden sm:block truncate max-w-[100px]">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={onLogin}
                    className="flex items-center justify-center h-8 w-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all duration-300"
                    title={t('dashboardAuth.authCard.cta')}
                  >
                    <Sparkles className="h-4 w-4 text-indigo-300" />
                  </button>
                )}
              </div>
            </div>
          </motion.header>

          <main id="dashboard-main-content" tabIndex={-1} className="mt-5 pb-10">
            {children}
          </main>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop — same #02030a base as landing */}
            <motion.button
              className="absolute inset-0 bg-[#02030a]/80 backdrop-blur-md"
              variants={fadeInVariants}
              initial="hidden" animate="show" exit="hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-[92vw] max-w-[360px] p-3"
              variants={drawerVariants}
              initial="hidden" animate="show" exit="exit"
            >
              <SidebarContent
                guilds={guilds} selectedGuild={selectedGuild} activeSection={activeSection}
                user={user}
                isAuthenticated={isAuthenticated}
                onSectionChange={onSectionChange} onGuildChange={onGuildChange} 
                onLogin={onLogin} onLogout={onLogout}
                closeOnNavigate={() => setMobileOpen(false)}
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-6 top-6 rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-300 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <CommandPalette onSelect={(id) => onSectionChange(id)} />
    </div>
  );
}
