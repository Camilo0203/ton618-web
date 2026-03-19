import { useEffect, useState } from 'react';
import { Menu, X, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { config, getDashboardUrl, getDiscordInviteUrl } from '../config';
import LanguageSelector from './LanguageSelector';
import Logo from './Logo';

function NavAction({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const isInternal = href.startsWith('/');

  if (isInternal) {
    return (
      <Link to={href} onClick={onClick} className="text-sm font-semibold text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-semibold text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      {label}
    </a>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dashboardUrl = getDashboardUrl();
  const inviteUrl = getDiscordInviteUrl();
  const canInvite = Boolean(inviteUrl);
  const navbarClassName = scrolled
    ? 'bg-[linear-gradient(180deg,rgba(5,6,15,0.9),rgba(5,6,15,0.76))] backdrop-blur-2xl border border-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.52)]'
    : 'bg-[linear-gradient(180deg,rgba(5,6,15,0.42),rgba(5,6,15,0.2))] backdrop-blur-md border border-white/5 shadow-none';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navLinks = [
    { name: t('nav.features'), href: '#features' },
    { name: t('nav.architecture'), href: '#experience' },
    { name: t('nav.whyTon'), href: '#why' },
    { name: t('nav.network'), href: '#stats' },
  ];

  const utilityLinks = [
    { href: config.docsUrl || '#docs', label: t('nav.docs') },
    config.statusUrl ? { href: config.statusUrl, label: t('nav.status') } : null,
    config.supportServerUrl ? { href: config.supportServerUrl, label: t('nav.support') } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  function renderUtilityLink(link: { href: string; label: string }) {
    const isHash = link.href.startsWith('#');

    return (
      <a
        key={link.label}
        href={link.href}
        target={isHash ? undefined : '_blank'}
        rel={isHash ? undefined : 'noopener noreferrer'}
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        <span>{link.label}</span>
        {!isHash ? <ExternalLink className="h-3 w-3" /> : null}
      </a>
    );
  }

  return (
    <nav className={`fixed left-0 right-0 top-0 z-[90] transition-all duration-500 ${scrolled ? 'py-4' : 'py-5 md:py-6'}`} aria-label={t('nav.primaryAria')}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`relative flex items-center justify-between overflow-visible rounded-[1.75rem] px-4 py-3 transition-all duration-500 md:px-6 ${navbarClassName}`}>
          <div className="flex min-w-0 items-center gap-6 lg:gap-10">
            <Link to="/" className="flex min-w-0 items-center gap-3 group" aria-label={t('nav.homeAria')}>
              <Logo
                size="lg"
                subtitle="TON618"
                className="transition-transform duration-500 group-hover:scale-[1.02]"
                textClassName="transition-colors duration-500 group-hover:text-indigo-200"
                frameClassName="h-[4.7rem] w-[4.7rem] md:h-[5.1rem] md:w-[5.1rem]"
                imageClassName="transition-transform duration-500 group-hover:scale-[1.9]"
              />
            </Link>

            <div className="hidden items-center gap-8 xl:flex">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 transition-all duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-indigo-500 transition-all duration-500 hover:w-full"></span>
                </a>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-5 lg:flex">
            {utilityLinks.length > 0 ? (
              <div className="hidden items-center gap-4 xl:flex">
                {utilityLinks.map(renderUtilityLink)}
              </div>
            ) : null}

            <LanguageSelector mode="desktop" />

            <NavAction href={dashboardUrl} label={t('nav.secondaryCta')} />

            {canInvite ? (
              <a href={inviteUrl} className="btn-premium-primary !px-5 !py-3 !text-[10px] !rounded-xl">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('nav.primaryCta')}</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="btn-premium-primary !cursor-not-allowed !px-5 !py-3 !text-[10px] !rounded-xl opacity-60"
                title={t('hero.inviteUnavailable')}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('nav.primaryCta')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSelector mode="mobile" />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
              aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:hidden">
        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              id="mobile-navigation"
              className="relative z-[95] overflow-hidden pt-2"
            >
              <div className="cinematic-glass flex flex-col gap-6 rounded-[1.75rem] border-white/10 p-6 shadow-3xl shadow-black">
                <div className="grid gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-base font-bold text-white transition hover:border-white/15 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>

                {utilityLinks.length > 0 ? (
                  <div className="grid gap-3">
                    {utilityLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith('#') ? undefined : '_blank'}
                        rel={link.href.startsWith('#') ? undefined : 'noopener noreferrer'}
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
                      >
                        <span>{link.label}</span>
                        {link.href.startsWith('#') ? null : <ExternalLink className="h-4 w-4" />}
                      </a>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-3 border-t border-white/8 pt-4">
                  <NavAction href={dashboardUrl} label={t('nav.mobileSecondaryCta')} onClick={() => setMobileMenuOpen(false)} />

                  {canInvite ? (
                    <a
                      href={inviteUrl}
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-premium-primary w-full justify-center"
                    >
                      <span>{t('nav.mobilePrimaryCta')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="btn-premium-primary w-full cursor-not-allowed justify-center opacity-60"
                      title={t('hero.inviteUnavailable')}
                    >
                      <span>{t('nav.mobilePrimaryCta')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </nav>
  );
}
