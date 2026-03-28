import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ScreenshotEntry } from './screenshotData';
import { instantReveal, modalBackdrop, modalPanel } from '../../lib/motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: ScreenshotEntry[];
  activeIndex: number;
  onNavigate: (index: number) => void;
}

export default function ScreenshotModal({
  isOpen,
  onClose,
  screenshots,
  activeIndex,
  onNavigate,
}: ModalProps) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onNavigate(Math.max(0, activeIndex - 1));
      if (event.key === 'ArrowRight') onNavigate(Math.min(screenshots.length - 1, activeIndex + 1));
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeIndex, isOpen, onClose, onNavigate, screenshots.length]);

  const currentScreenshot = screenshots[activeIndex];
  const backdropVariants = shouldReduceMotion ? instantReveal : modalBackdrop;
  const panelVariants = shouldReduceMotion ? instantReveal : modalPanel;

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative mx-4 w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -right-4 -top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-[background-color,transform] duration-200 hover:bg-white/20"
              aria-label={t('gallery.modal.close')}
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {activeIndex > 0 ? (
              <button
                type="button"
                onClick={() => onNavigate(activeIndex - 1)}
                className="absolute -left-16 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-[background-color,transform] duration-200 hover:bg-white/20 lg:flex"
                aria-label={t('gallery.modal.previous')}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            ) : null}

            {activeIndex < screenshots.length - 1 ? (
              <button
                type="button"
                onClick={() => onNavigate(activeIndex + 1)}
                className="absolute -right-16 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-[background-color,transform] duration-200 hover:bg-white/20 lg:flex"
                aria-label={t('gallery.modal.next')}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-2xl md:p-8">
              <div className="space-y-5">
                <div className="border-b border-white/10 pb-4">
                  <h3 id="modal-title" className="text-xl font-semibold text-white md:text-2xl">
                    {currentScreenshot.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300 md:text-base">
                    {currentScreenshot.description}
                  </p>
                </div>

                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40">
                  <img
                    src={currentScreenshot.image}
                    alt={currentScreenshot.title}
                    loading="lazy"
                    decoding="async"
                    className="max-h-[70vh] w-full object-contain"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  className="dashboard-secondary-button"
                  aria-label={t('gallery.modal.previous')}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('gallery.modal.previous')}
                </button>

                <span className="text-sm text-slate-400">
                  {t('gallery.modal.position', { current: activeIndex + 1, total: screenshots.length })}
                </span>

                <button
                  type="button"
                  onClick={() => onNavigate(Math.min(screenshots.length - 1, activeIndex + 1))}
                  disabled={activeIndex === screenshots.length - 1}
                  className="dashboard-secondary-button"
                  aria-label={t('gallery.modal.next')}
                >
                  {t('gallery.modal.next')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
