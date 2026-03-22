import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  LogOut,
  Menu,
  RefreshCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { dashboardSections, dashboardTaskGroups } from '../constants';
import { drawerVariants, fadeInVariants, fadeUpVariants, staggerContainerVariants } from '../motion';
import type { DashboardGuild, DashboardSectionId, GuildSyncStatus } from '../types';
import {
  type DashboardSectionState,
  resolveGuildIconUrl,
} from '../utils';
import { config, getDiscordInviteUrl } from '../../config';
import Logo from '../../components/Logo';
import { usePrefetchSnapshot } from '../hooks/usePrefetchSnapshot';

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
  closeOnNavigate?: () => void;
}

function SidebarContent({
  guilds,
  selectedGuild,
  activeSection,
  onSectionChange,
  onGuildChange,
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
      // ESTILO LANDING APLICADO AL CONTENEDOR DEL SIDEBAR
      className="relative flex h-full min-h-0 flex-col overflow-hidden text-white rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(5,6,15,0.42),rgba(5,6,15,0.2))] backdrop-blur-xl border border-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.52)] p-2"
    >
      <div className="pointer-events-none absolute -right-12 top-0 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
      
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-2 pt-2">
          <Link to="/" className="relative z-[1] flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-white/[0.05]">
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

          <div className="relative z-[1] mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
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

            <select
              id="guild-select"
              value={selectedGuild?.guildId ?? ''}
              onChange={(event) => {
                onGuildChange(event.target.value);
                closeOnNavigate?.();
              }}
              className="mt-4 w-full rounded-xl border border-white/10 bg-[#0A0D1A] px-3 py-2.5 text-sm font-medium text-slate-200 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
            >
              {!selectedGuild ? (
                <option value="">{t('dashboard.shell.selectServer')}</option>
              ) : null}
              {guilds.map((guild) => (
                <option 
                  key={guild.guildId} 
                  value={guild.guildId}
                  onMouseEnter={() => prefetchSnapshot(guild.guildId)}
                >
                  {guild.guildName}
                </option>
              ))}
            </select>
          </div>
        </div>

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
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onSectionChange(section.id);
                            closeOnNavigate?.();
                          }}
                          // ESTILOS DE LOS BOTONES DE LA LANDING APLICADOS AQUÍ
                          className={`group w-full rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
                            active
                              ? 'border-indigo-500/30 bg-indigo-500/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                              : 'border-white/8 bg-white/[0.02] text-slate-400 hover:border-white/15 hover:bg-white/[0.05] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
                            <p className="truncate text-sm font-semibold flex-1">
                               {t(section.label)}
                            </p>
                            {active && <ChevronRight className="h-4 w-4 text-indigo-400" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </motion.nav>
          </div>

          <div className="relative z-[1] mt-3 shrink-0 rounded-2xl border border-white/8 bg-white/[0.02] p-3 mb-2 mx-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
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
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
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

  return (
    <div className="dashboard-shell text-white min-h-screen bg-[#05060F]">
      {/* GRID ORIGINAL PRESERVADO PARA NO ROMPER ESTRUCTURA */}
      <div className="relative z-[1] mx-auto grid max-w-[1760px] gap-5 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
        
        {/* ASIDE ORIGINAL PRESERVADO */}
        <aside className="hidden min-h-0 lg:block">
          <div className="sticky top-4 h-[calc(100dvh-2rem)] min-h-0 max-h-[calc(100dvh-2rem)]">
            <SidebarContent
              guilds={guilds}
              selectedGuild={selectedGuild}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              onGuildChange={onGuildChange}
              onLogout={onLogout}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <motion.header
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            // ESTILO LANDING APLICADO AL HEADER PRINCIPAL (CRISTAL)
            className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(5,6,15,0.42),rgba(5,6,15,0.2))] backdrop-blur-xl border border-white/10 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.52)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.05),transparent_28%)]" />
            
            <div className="relative z-[1] flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between 2xl:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:border-white/20 hover:text-white lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.15rem] border border-white/10 bg-white/5 p-[3px]">
                  {guildIconUrl ? (
                    <img src={guildIconUrl} alt="Guild" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <Logo size="sm" withText={false} frameClassName="h-full w-full rounded-xl border-0 bg-transparent shadow-none" />
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-bold tracking-tight text-white">
                    {selectedGuild?.guildName ?? t('dashboard.shell.selectServer')}
                  </h1>
                  <p className="mt-1 text-sm text-slate-400">
                    {t('dashboard.shell.headerDescription')}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-3 xl:w-auto xl:items-end">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                      {user.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-white">
                         {user.email}
                      </p>
                    </div>
                  </div>

                  {showInviteCta && (
                    <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className="btn-premium-primary !py-2.5 !px-4 !text-xs !rounded-xl">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{t('dashboard.inviteBot.cta')}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={onSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                  </button>
                </div>
              </div>
            </div>
          </motion.header>

          <main id="dashboard-main-content" tabIndex={-1} className="mt-5 pb-10">
            {children}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.button
              className="absolute inset-0 bg-[#05060F]/80 backdrop-blur-sm"
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
                onSectionChange={onSectionChange} onGuildChange={onGuildChange} onLogout={onLogout}
                closeOnNavigate={() => setMobileOpen(false)}
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-6 top-6 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
