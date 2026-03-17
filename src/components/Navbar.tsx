import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDiscordLoginUrl } from '../config';
import LanguageSelector from './LanguageSelector';
import Logo from './Logo';

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loginUrl = getDiscordLoginUrl();

  const navLinks = [
    { name: t('nav.features'), href: '#features' },
    { name: t('nav.architecture'), href: '#experience' },
    { name: t('nav.whyTon'), href: '#why' },
    { name: t('nav.network'), href: '#stats' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between px-6 py-3 transition-all duration-700 ${scrolled ? 'cinematic-glass rounded-2xl border-white/[0.05] shadow-2xl shadow-black/80' : ''}`}>
          
          <div className="flex items-center gap-10 lg:gap-16">
            <a href="/" className="flex items-center gap-3 group">
              <Logo
                size="md"
                subtitle="Neural Core"
                className="transition-transform duration-500 group-hover:scale-[1.02]"
                textClassName="group-hover:text-indigo-200 transition-colors duration-500"
                frameClassName="h-12 w-12 rounded-[1.1rem] p-1.5 md:h-14 md:w-14 md:rounded-[1.25rem] md:p-2 group-hover:border-indigo-300/30"
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
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <a
              href={loginUrl}
              className="hidden md:flex btn-premium-primary !px-6 !py-2.5 !text-[10px] !rounded-lg"
            >
              <span>{t('nav.cta')}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
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
            className="lg:hidden absolute top-full left-0 right-0 px-6 pt-2 overflow-hidden"
          >
            <div className="cinematic-glass rounded-2xl border-white/5 p-8 flex flex-col gap-8 shadow-3xl shadow-black">
              <div className="flex items-center justify-between mb-4">
                <Logo size="sm" subtitle="Regional Protocol" frameClassName="p-1.5" />
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
                href={loginUrl}
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
