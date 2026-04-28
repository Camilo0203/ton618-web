import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Zap, CreditCard, CheckCircle } from 'lucide-react';

export function PricingHero() {
  const { t } = useTranslation();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-cards');
    pricingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const trustBadges = [
    { icon: Shield, text: t('billing.trust.secure.title') },
    { icon: Zap, text: t('billing.trust.instant.title') },
    { icon: CreditCard, text: t('billing.trust.stripe.title') },
    { icon: CheckCircle, text: t('billing.trust.guarantee.title') },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-black via-slate-950 to-indigo-950 mt-16 pt-20 pb-20 px-4 sm:pt-28 sm:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('billing.hero.title')} {t('billing.hero.titleAccent')}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-slate-300 sm:text-xl max-w-3xl mx-auto">
            {t('billing.hero.description')}
          </p>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-4 sm:gap-6"
          >
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-sm border border-white/10"
              >
                <badge.icon className="h-5 w-5 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">
                  {badge.text}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10"
          >
            <button
              onClick={scrollToPricing}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/50 transition-all duration-200 hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {t('billing.hero.cta')}
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
