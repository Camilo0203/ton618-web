import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDashboardUrl } from '../config';
import LanguageSelector from './LanguageSelector';
import Logo from './Logo';

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navbarClassName = scrolled
    ? 'bg-[linear-gradient(180deg,rgba(5,6,15,0.88),rgba(5,6,15,0.72))] backdrop-blur-xl border-0 shadow-[0_18px_55px_rgba(0,0,0,0.52)]'
    : 'bg-transparent border-0 shadow-none';

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

  const dashboardUrl = getDashboardUrl();

  const navLinks = [
    { name: t('nav.features'), href: '#features' },
    { name: t('nav.architecture'), href: '#experience' },
    { name: t('nav.whyTon'), href: '#why' },
    { name: t('nav.network'), href: '#stats' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="relative max-w-7xl mx-auto px-6">
        <div className={`relative flex items-center justify-between overflow-visible px-6 py-3 rounded-[1.75rem] transition-all duration-500 ${navbarClassName}`}>
          
          <div className="flex items-center gap-10 lg:gap-16">
            <a href="/" className="flex items-center gap-3 group">
              <Logo
                size="lg"
                subtitle="TON618"
                className="transition-transform duration-500 group-hover:scale-[1.02]"
                textClassName="group-hover:text-indigo-200 transition-colors duration-500"
                frameClassName="h-[5.25rem] w-[5.25rem] md:h-[5.75rem] md:w-[5.75rem]"
                imageClassName="transition-transform duration-500 group-hover:scale-[1.9]"
              />
            </a>

            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 hover:text-white transition-all duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-indigo-500 transition-all duration-500 group-hover:w-full"></span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <LanguageSelector />

            <a
              href={dashboardUrl}
              className="hidden md:flex btn-premium-primary !px-6 !py-2.5 !text-[10px] !rounded-lg"
            >
              <span>{t('nav.cta')}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            id="mobile-navigation"
            className="lg:hidden absolute top-full left-0 right-0 z-[95] px-6 pt-2 overflow-hidden"
          >
            <div className="cinematic-glass rounded-2xl border-white/5 p-8 flex flex-col gap-8 shadow-3xl shadow-black">
              <div className="flex items-center justify-between mb-4">
                <Logo
                  size="md"
                  subtitle="TON618"
                  frameClassName="h-[4.75rem] w-[4.75rem]"
                />
                <LanguageSelector />
              </div>

              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-white"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-white/5" />
              <a
                href={dashboardUrl}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl"
              >
                <span>{t('nav.mobileCta')}</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
