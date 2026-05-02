import { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { Menu, X, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { config, getDiscordInviteUrl } from '../config';
import LanguageSelector from './LanguageSelector';
import Logo from './Logo';
import { instantTransition, motionDurations, motionEase } from '../lib/motion';

function Navbar() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inviteUrl = getDiscordInviteUrl();
  const canInvite = Boolean(inviteUrl);

  const navbarClassName = useMemo(
    () =>
      scrolled
        ? 'bg-[linear-gradient(180deg,rgba(5,6,15,0.9),rgba(5,6,15,0.76))] backdrop-blur-2xl border border-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.52)]'
        : 'bg-[linear-gradient(180deg,rgba(5,6,15,0.42),rgba(5,6,15,0.2))] backdrop-blur-md border border-white/5 shadow-none',
    [scrolled]
  );

  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > 20;
    setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
    { name: t('nav.setup'), href: '#experience' },
    { name: t('nav.commands'), href: '#commands' },
    { name: t('nav.stats'), href: '#stats' },
  ];

  const utilityLinks = [
    config.docsUrl ? { href: config.docsUrl, label: t('nav.docs'), external: true } : { href: '/docs', label: t('nav.docs'), external: false },
    { href: '/pricing', label: t('nav.pricing', { defaultValue: 'Pricing' }), external: false },
    config.statusUrl ? { href: config.statusUrl, label: t('nav.status'), external: true } : null,
    config.supportServerUrl ? { href: config.supportServerUrl, label: t('nav.support'), external: true } : null,
  ].filter(Boolean) as { href: string; label: string; external: boolean }[];

  function renderUtilityLink(link: { href: string; label: string; external: boolean }) {
    const isInternal = link.href.startsWith('/');
    const className = "inline-flex items-center gap-1 text-sm font-bold uppercase tracking-tight-readable text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";
    
    if (isInternal) {
      return (
        <Link
          key={link.label}
          to={link.href}
          className={className}
        >
          <span>{link.label}</span>
        </Link>
      );
    }
    
    return (
      <a
        key={link.label}
        href={link.href}
        target={link.external ? '_blank' : undefined}
        rel={link.external ? 'noopener noreferrer' : undefined}
        className={className}
      >
        <span>{link.label}</span>
        {link.external ? <ExternalLink className="h-3 w-3" /> : null}
      </a>
    );
  }

  return (
    <nav className={`fixed left-0 right-0 top-0 z-[90] transition-[padding] duration-300 ${scrolled ? 'py-4' : 'py-5 md:py-6'}`} aria-label={t('nav.primaryAria')}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`relative flex items-center justify-between overflow-visible rounded-[1.75rem] px-4 py-3 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 md:px-6 ${navbarClassName}`}>
          <div className="flex min-w-0 items-center gap-6 lg:gap-10">
            <Link to="/" className="flex min-w-0 items-center gap-3 group" aria-label={t('nav.homeAria')}>
              <Logo
                size="lg"
                withText={false}
                className="transition-transform duration-300 group-hover:scale-[1.01]"
                frameClassName="h-[4.7rem] w-[4.7rem] md:h-[5.1rem] md:w-[5.1rem]"
                imageClassName="transition-transform duration-300 group-hover:scale-[1.82]"
              />
            </Link>

            <div className="hidden items-center gap-8 xl:flex">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="group relative text-sm font-bold uppercase tracking-tight-readable text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-indigo-500 transition-[width] duration-300 group-hover:w-full"></span>
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

          <div className="flex items-center gap-4 lg:hidden">
            <LanguageSelector mode="mobile" />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition-colors duration-200 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
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
        <AnimatePresence initial={false}>
          {mobileMenuOpen ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1, height: 'auto', y: 0 } : { opacity: 0, height: 0, y: -6 }}
              transition={shouldReduceMotion ? instantTransition : { duration: motionDurations.enter, ease: motionEase }}
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
                      className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-base font-bold text-white transition-[background-color,border-color,color] duration-200 hover:border-white/15 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
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
                        className="inline-flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-slate-300 transition-[background-color,border-color,color] duration-200 hover:border-white/15 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
                      >
                        <span>{link.label}</span>
                        {link.href.startsWith('#') ? null : <ExternalLink className="h-4 w-4" />}
                      </a>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-3 border-t border-white/8 pt-4">
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

export default memo(Navbar);
