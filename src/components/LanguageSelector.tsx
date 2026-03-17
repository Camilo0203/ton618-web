import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const languages = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'es', name: 'Español', short: 'ES' },
];

const MENU_WIDTH = 160;
const MENU_HEIGHT = 132;
const VIEWPORT_GUTTER = 12;
const MENU_OFFSET = 12;

const normalizeLanguageCode = (language?: string) =>
  language?.toLowerCase().startsWith('es') ? 'es' : 'en';

const getMenuPosition = (trigger: HTMLElement, menuHeight = MENU_HEIGHT) => {
  const rect = trigger.getBoundingClientRect();
  const availableBelow = window.innerHeight - rect.bottom - VIEWPORT_GUTTER;
  const availableAbove = rect.top - VIEWPORT_GUTTER;
  const openUpward = availableBelow < menuHeight && availableAbove > availableBelow;
  const minLeft = VIEWPORT_GUTTER;
  const maxLeft = Math.max(VIEWPORT_GUTTER, window.innerWidth - MENU_WIDTH - VIEWPORT_GUTTER);
  const left = Math.min(Math.max(rect.right - MENU_WIDTH, minLeft), maxLeft);
  const rawTop = openUpward ? rect.top - menuHeight - MENU_OFFSET : rect.bottom + MENU_OFFSET;
  const maxTop = Math.max(VIEWPORT_GUTTER, window.innerHeight - menuHeight - VIEWPORT_GUTTER);
  const top = Math.min(Math.max(rawTop, VIEWPORT_GUTTER), maxTop);

  return { top, left, openUpward };
};

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, openUpward: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const normalizedLanguage = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);

  const currentLanguage =
    languages.find((language) => language.code === normalizedLanguage) || languages[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      setMenuPosition(getMenuPosition(trigger, menuRef.current?.offsetHeight || MENU_HEIGHT));
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (triggerRef.current) {
      setMenuPosition(getMenuPosition(triggerRef.current, menuRef.current?.offsetHeight || MENU_HEIGHT));
    }

    setIsOpen(true);
  };

  const getIsActiveLanguage = (code: string) => code === normalizedLanguage;

  const menu = (
    <motion.div
      id="language-selector-menu"
      ref={menuRef}
      initial={{ opacity: 0, y: menuPosition.openUpward ? -8 : 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: menuPosition.openUpward ? -8 : 8, scale: 0.95 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      role="menu"
      className="fixed z-[140] w-40 overflow-hidden rounded-2xl border border-white/10 cinematic-glass shadow-3xl"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        transformOrigin: menuPosition.openUpward ? 'bottom right' : 'top right',
      }}
    >
      <div className="flex flex-col gap-1 p-2">
        {languages.map((language) => {
          const isActive = getIsActiveLanguage(language.code);

          return (
          <button
            key={language.code}
            onClick={() => toggleLanguage(language.code)}
            role="menuitemradio"
            aria-checked={isActive}
            className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
              isActive
                ? 'bg-indigo-500/20 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">{language.name}</span>
            {isActive ? (
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            ) : null}
          </button>
          );
        })}
      </div>

      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
    </motion.div>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-xl border border-white/5 px-4 py-2 transition-all duration-300 cinematic-glass group hover:border-indigo-500/30"
        aria-label="Change language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'language-selector-menu' : undefined}
      >
        <Globe className="h-4 w-4 text-indigo-400 transition-transform duration-500 group-hover:rotate-12" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
          {currentLanguage.short}
        </span>
        <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
      </AnimatePresence>
    </div>
  );
}
