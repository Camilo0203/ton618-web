import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const EVENT_KEYS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'] as const;
const DISPLAY_DURATION = 4000;
const INTERVAL_BETWEEN = 5000;
const AUTO_HIDE_AFTER = 35000;

export default function LiveNotifications() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [eventIndex, setEventIndex] = useState(0);

  const showNext = useCallback(() => {
    const key = EVENT_KEYS[eventIndex % EVENT_KEYS.length];
    setCurrentEvent(t(`notifications.events.${key}`));
    setEventIndex((prev) => prev + 1);

    setTimeout(() => {
      setCurrentEvent(null);
    }, DISPLAY_DURATION);
  }, [eventIndex, t]);

  useEffect(() => {
    if (dismissed || shouldReduceMotion) return;

    const autoHideTimer = setTimeout(() => {
      setDismissed(true);
    }, AUTO_HIDE_AFTER);

    return () => clearTimeout(autoHideTimer);
  }, [dismissed, shouldReduceMotion]);

  useEffect(() => {
    if (dismissed || shouldReduceMotion) return;

    const initialDelay = setTimeout(() => {
      showNext();
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, [dismissed, shouldReduceMotion, showNext]);

  useEffect(() => {
    if (dismissed || shouldReduceMotion || eventIndex === 0) return;

    const interval = setTimeout(() => {
      showNext();
    }, INTERVAL_BETWEEN + DISPLAY_DURATION);

    return () => clearTimeout(interval);
  }, [eventIndex, dismissed, shouldReduceMotion, showNext]);

  if (dismissed || shouldReduceMotion) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm" aria-live="polite">
      <AnimatePresence>
        {currentEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <span className="flex-1 text-sm font-medium text-slate-200">{currentEvent}</span>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={t('notifications.dismiss')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
