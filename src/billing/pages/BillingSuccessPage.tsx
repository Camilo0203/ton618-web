// Success page after completing checkout
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useEffect } from 'react';

const PLAN_LABELS: Record<string, string> = {
  pro_monthly: 'Pro Monthly',
  pro_yearly: 'Pro Yearly',
  lifetime: 'Lifetime',
  donate: 'Donation',
};

export function BillingSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planKey = searchParams.get('plan_key') || '';
  const planLabel = PLAN_LABELS[planKey] || 'Premium';
  const isDonation = planKey === 'donate';

  useEffect(() => {
    console.log('Billing checkout successful', { plan_key: planKey });
  }, [planKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4">
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
          {isDonation ? 'Thank you for your donation!' : 'Payment Successful!'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-slate-300 mb-8"
        >
          {isDonation
            ? 'Your generous donation helps keep TON618 running. Thank you!'
            : `Thank you for upgrading to TON618 ${planLabel}! Your server's premium features are being activated.`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">What's Next?</h2>
          <ul className="text-left space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>
                {isDonation
                  ? 'Your donation has been recorded — thank you!'
                  : 'Your premium features will be active within a few minutes (up to 5 min for webhook processing)'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>You'll receive a confirmation email from Lemon Squeezy</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Access your server's dashboard to configure premium features</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Manage your subscription anytime from the billing portal</span>
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
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-slate-400 mt-8"
        >
          Need help? Join our{' '}
          <a
            href={import.meta.env.VITE_SUPPORT_SERVER_URL || 'https://discord.gg/ton618'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            support server
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
