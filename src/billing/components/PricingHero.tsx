import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Zap, CreditCard, CheckCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type PricingHeroProps = {
  foundingOffer?: ReactNode;
};

export function PricingHero({ foundingOffer }: PricingHeroProps) {
  const { t } = useTranslation();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-cards');
    pricingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const trustBadges = [
    { icon: Shield, text: t('billing.trust.secure.title') },
    { icon: Zap, text: t('billing.trust.instant.title') },
    { icon: CreditCard, text: t('billing.trust.whop.title') },
    { icon: CheckCircle, text: t('billing.trust.guarantee.title') },
  ];

  return (
    <section className="relative overflow-hidden pt-20 pb-20 px-4 sm:pt-28 sm:pb-32">
      
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {foundingOffer ? (
            <div className="mb-8 flex justify-center">
              {foundingOffer}
            </div>
          ) : null}

          {/* Headline */}
          <p className="mb-6 text-xs font-bold uppercase tracking-wide-readable text-indigo-400">
            {t('pricing.eyebrow', 'Simple pricing')}
          </p>
          <h1 className="headline-accent-solid text-4xl font-black uppercase tracking-tightest sm:text-5xl lg:text-6xl">
            {t('billing.hero.title')}{' '}
            <span className="text-premium-gradient">
              {t('billing.hero.titleAccent')}
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
                className="premium-pill px-4 py-2"
              >
                <badge.icon className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
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
              className="btn-premium-primary"
            >
              {t('billing.hero.cta')}
              <svg
                className="ml-1 h-4 w-4"
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
