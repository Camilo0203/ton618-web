// Cancel page when user cancels checkout
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function BillingCancelPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4">
      <Helmet>
        <title>{t('billing.cancel.pageTitle', 'Payment Cancelled')}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500/20 mb-8"
        >
          <XCircle className="w-16 h-16 text-orange-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          {t('billing.cancel.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-slate-300 mb-8"
        >
          {t('billing.cancel.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">{t('billing.cancel.whyUpgrade')}</h2>
          <ul className="text-left space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">✓</span>
              <span>{t('billing.cancel.features.f1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">✓</span>
              <span>{t('billing.cancel.features.f2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">✓</span>
              <span>{t('billing.cancel.features.f3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400">✓</span>
              <span>{t('billing.cancel.features.f4')}</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            {t('billing.cancel.tryAgain')}
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('billing.cancel.backToHome')}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-slate-400 mt-8"
        >
          {t('billing.cancel.haveQuestions')}{' '}
          <a
            href={import.meta.env.VITE_SUPPORT_SERVER_URL || 'https://discord.gg/ton618'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            {t('billing.cancel.contactSupport')}
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
