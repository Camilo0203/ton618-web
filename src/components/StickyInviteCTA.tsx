import { motion, AnimatePresence, useReducedMotion, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDiscordInviteUrl } from '../config';
import { instantTransition, motionDurations, motionEase } from '../lib/motion';

export default function StickyInviteCTA() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const inviteUrl = getDiscordInviteUrl();

  useEffect(() => {
    return scrollY.on('change', (v) => setVisible(v > 800));
  }, [scrollY]);

  if (!inviteUrl) return null;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={shouldReduceMotion ? false : { y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }}
          transition={shouldReduceMotion ? instantTransition : { duration: motionDurations.enter, ease: motionEase }}
          className="fixed bottom-6 right-6 z-40 sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-[calc(100dvh-4rem)] sm:-translate-x-1/2 md:hidden"
        >
          <a
            href={inviteUrl}
            className="btn-premium-primary shadow-[0_8px_32px_rgba(99,102,241,0.3)]"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t('stickyInvite.cta')}</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
