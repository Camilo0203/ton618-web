// Success page after completing checkout
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';

export default function BillingSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planKey = searchParams.get('plan_key') || '';
  const planLabel = t(`billing.success.planLabels.${planKey}`) || t('billing.success.planLabels.default');
  const isDonation = planKey === 'donate';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4">
      <Helmet>
        <title>{t('billing.success.pageTitle', 'Payment Successful')}</title>
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
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-8"
        >
          <CheckCircle className="w-16 h-16 text-green-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          {isDonation ? t('billing.success.titleDonation') : t('billing.success.titlePayment')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-slate-300 mb-8"
        >
          {isDonation
            ? t('billing.success.descriptionDonation')
            : t('billing.success.descriptionPayment', { plan: planLabel })}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">{t('billing.success.whatsNext')}</h2>
          <ul className="text-left space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                {isDonation
                  ? t('billing.success.steps.s1Donation')
                  : t('billing.success.steps.s1')}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>{t('billing.success.steps.s2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>{t('billing.success.steps.s3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>{t('billing.success.steps.s4')}</span>
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            {t('billing.success.goToDashboard')}
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            {t('billing.success.backToHome')}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-slate-400 mt-8"
        >
          {t('billing.success.needHelp')}{' '}
          <a
            href={import.meta.env.VITE_SUPPORT_SERVER_URL || 'https://discord.gg/ton618'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            {t('billing.success.supportServer')}
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
