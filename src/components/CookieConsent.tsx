import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'ton618_cookie_consent';

export default function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35 }}
          className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-950/95 px-5 py-4 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-auto"
          role="dialog"
          aria-label={t('cookies.title', { defaultValue: 'Cookie consent' })}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <Cookie className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-400" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed text-slate-300">
                {t('cookies.message', { defaultValue: 'We use cookies and analytics to improve your experience. By continuing, you agree to our use of cookies.' })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={accept}
                  className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {t('cookies.accept', { defaultValue: 'Accept' })}
                </button>
                <Link
                  to="/privacy"
                  className="rounded-lg border border-white/10 px-4 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  {t('cookies.privacy', { defaultValue: 'Privacy Policy' })}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
