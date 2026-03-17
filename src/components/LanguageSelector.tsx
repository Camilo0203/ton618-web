import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'es', name: 'Español', short: 'ES' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((language) => language.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-white/5 px-4 py-2 transition-all duration-300 cinematic-glass group hover:border-indigo-500/30"
        aria-label="Change language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4 text-indigo-400 transition-transform duration-500 group-hover:rotate-12" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
          {currentLanguage.short}
        </span>
        <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="menu"
            className="absolute right-0 z-[100] mt-3 w-40 overflow-hidden rounded-2xl border border-white/10 cinematic-glass shadow-3xl"
          >
            <div className="flex flex-col gap-1 p-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => toggleLanguage(language.code)}
                  role="menuitemradio"
                  aria-checked={i18n.language === language.code}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
                    i18n.language === language.code
                      ? 'bg-indigo-500/20 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">{language.name}</span>
                  {i18n.language === language.code ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
