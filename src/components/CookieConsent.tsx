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
          className="ton-cookie-consent fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl px-4 py-3 backdrop-blur-xl sm:bottom-5 sm:left-5 sm:right-auto"
          role="dialog"
          aria-label={t('cookies.title', { defaultValue: 'Cookie consent' })}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <Cookie className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-300" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-[0.8rem] font-medium leading-relaxed text-slate-300">
                {t('cookies.message', { defaultValue: 'We use cookies and analytics to improve your experience. By continuing, you agree to our use of cookies.' })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={accept}
                  className="btn-premium-primary !min-h-0 !rounded-lg !px-4 !py-1.5 !text-xs"
                >
                  {t('cookies.accept', { defaultValue: 'Accept' })}
                </button>
                <Link
                  to="/privacy"
                  className="btn-premium-outline !min-h-0 !rounded-lg !px-4 !py-1.5 !text-xs"
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
