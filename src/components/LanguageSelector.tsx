import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const languages = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'es', name: 'Espanol', short: 'ES' },
];

const normalizeLanguageCode = (language?: string) =>
  language?.toLowerCase().startsWith('es') ? 'es' : 'en';

function restoreScrollPosition(scrollX: number, scrollY: number) {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';

  const syncScroll = () => window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' });

  syncScroll();
  requestAnimationFrame(() => {
    syncScroll();
    requestAnimationFrame(() => {
      syncScroll();
      root.style.scrollBehavior = previousScrollBehavior;
    });
  });
}

type LanguageSelectorMode = 'auto' | 'mobile' | 'desktop';

interface LanguageSelectorProps {
  mode?: LanguageSelectorMode;
}

export default function LanguageSelector({ mode = 'auto' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const normalizedLanguage = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);

  const currentLanguage =
    languages.find((language) => language.code === normalizedLanguage) || languages[0];
  const showMobileSelector = mode === 'mobile' || mode === 'auto';
  const showDesktopSelector = mode === 'desktop' || mode === 'auto';

  useEffect(() => {
    setIsOpen(false);
  }, [normalizedLanguage]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const activeIndex = languages.findIndex((language) => language.code === normalizedLanguage);
    itemRefs.current[activeIndex >= 0 ? activeIndex : 0]?.focus();
  }, [isOpen, normalizedLanguage]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | PointerEvent | TouchEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleLanguage = async (code: string) => {
    if (code === normalizedLanguage) {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    await i18n.changeLanguage(code);
    restoreScrollPosition(scrollX, scrollY);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const getIsActiveLanguage = (code: string) => code === normalizedLanguage;

  function moveFocus(nextIndex: number) {
    const boundedIndex = (nextIndex + languages.length) % languages.length;
    itemRefs.current[boundedIndex]?.focus();
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  function handleMenuItemKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(index + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(index - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      moveFocus(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      moveFocus(languages.length - 1);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {showMobileSelector ? (
        <div className={`cinematic-glass items-center rounded-xl border border-white/5 ${mode === 'mobile' ? 'flex' : 'flex sm:hidden'}`}>
          {languages.map((language) => {
            const isActive = getIsActiveLanguage(language.code);

            return (
              <button
                key={language.code}
                type="button"
                onClick={() => toggleLanguage(language.code)}
                aria-pressed={isActive}
                aria-label={language.name}
                className={`flex min-w-[3.25rem] items-center justify-center px-3 py-2 text-[10px] font-black uppercase tracking-tight-readable transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
                  isActive ? 'bg-indigo-500/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language.short}
              </button>
            );
          })}
        </div>
      ) : null}

      {showDesktopSelector ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={handleTriggerKeyDown}
          className={`cinematic-glass group items-center gap-2 rounded-xl border border-white/5 px-4 py-2 transition-all duration-300 hover:border-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
            mode === 'desktop' ? 'inline-flex' : 'hidden sm:flex'
          }`}
          aria-label={t('languageSelector.triggerLabel')}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? 'language-selector-menu' : undefined}
        >
          <Globe className="h-4 w-4 text-indigo-400 transition-transform duration-500 group-hover:rotate-12" />
          <span className="text-[10px] font-black uppercase tracking-tight-readable text-white">
            {currentLanguage.short}
          </span>
          <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : null}

      <AnimatePresence>
        {showDesktopSelector && isOpen ? (
          <motion.div
            id="language-selector-menu"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="menu"
            aria-label={t('languageSelector.menuLabel')}
            className={`cinematic-glass shadow-3xl absolute right-0 top-[calc(100%+0.75rem)] z-[140] w-40 overflow-hidden rounded-2xl border border-white/10 ${
              mode === 'desktop' ? 'block' : 'hidden sm:block'
            }`}
          >
            <div className="flex flex-col gap-1 p-2">
              {languages.map((language, index) => {
                const isActive = getIsActiveLanguage(language.code);

                return (
                  <button
                    key={language.code}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    type="button"
                    onClick={() => toggleLanguage(language.code)}
                    onKeyDown={(event) => handleMenuItemKeyDown(event, index)}
                    role="menuitemradio"
                    aria-checked={isActive}
                    aria-label={language.name}
                    className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
                      isActive
                        ? 'bg-indigo-500/20 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">{language.name}</span>
                    {isActive ? <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
