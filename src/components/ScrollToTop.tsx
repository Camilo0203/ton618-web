import { motion, AnimatePresence, useReducedMotion, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { instantTransition, motionDurations, motionEase } from '../lib/motion';

export default function ScrollToTop() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (v) => setVisible(v > 600));
  }, [scrollY]);

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.button
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.96 }}
          transition={shouldReduceMotion ? instantTransition : { duration: motionDurations.enter, ease: motionEase }}
          onClick={() => window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' })}
          className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-slate-400 shadow-lg backdrop-blur-xl transition-colors duration-200 hover:border-white/20 hover:text-white"
          aria-label={t('scrollToTop.label')}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
