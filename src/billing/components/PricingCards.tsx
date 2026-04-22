import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, Crown, Sparkles, Check } from 'lucide-react';
import type { PlanKey } from '../types';

interface PricingCardsProps {
  onSelectPlan: (planKey: PlanKey) => void;
  loading?: boolean;
  selectedPlan?: PlanKey | null;
}

export function PricingCards({ onSelectPlan, loading, selectedPlan }: PricingCardsProps) {
  const { t } = useTranslation();

  const plans = [
    {
      key: 'pro_monthly' as PlanKey,
      icon: Zap,
      iconColor: 'text-blue-400',
      name: t('pricing.plans.monthly.name'),
      description: t('pricing.plans.monthly.description'),
      price: '$9.99',
      interval: t('pricing.plans.monthly.interval'),
      planType: 'Subscription',
      billingCycle: 'Monthly',
      cancelable: true,
      requiresGuild: true,
      features: [
        'Up to 50 custom commands',
        '20 auto-role configurations',
        '10 welcome message templates',
        'Advanced moderation tools',
        'Custom embed builder',
        'Priority support',
        'Server analytics dashboard',
        'Cancel anytime',
      ],
      cta: t('pricing.plans.monthly.cta'),
      highlighted: false,
      badge: null,
    },
    {
      key: 'pro_yearly' as PlanKey,
      icon: Crown,
      iconColor: 'text-purple-400',
      name: t('pricing.plans.yearly.name'),
      description: t('pricing.plans.yearly.description'),
      price: '$89.99',
      interval: t('pricing.plans.yearly.interval'),
      planType: 'Subscription',
      billingCycle: 'Yearly',
      cancelable: true,
      requiresGuild: true,
      savings: 'Save 25% · BEST VALUE',
      features: [
        'Everything in Monthly',
        'Save $20 per year',
        'Priority feature requests',
        'Early access to new features',
        'Dedicated support channel',
        'Custom bot status (coming soon)',
        'Advanced analytics',
        'Yearly billing',
      ],
      cta: t('pricing.plans.yearly.cta'),
      highlighted: true,
      badge: 'Save 25% · BEST VALUE',
    },
    {
      key: 'lifetime' as PlanKey,
      icon: Sparkles,
      iconColor: 'text-yellow-400',
      name: t('pricing.plans.lifetime.name'),
      description: t('pricing.plans.lifetime.description'),
      price: '$299.99',
      interval: t('pricing.plans.lifetime.interval'),
      planType: 'One-Time Purchase',
      billingCycle: 'Forever',
      cancelable: false,
      requiresGuild: true,
      features: [
        'Everything in Pro',
        '100 custom commands',
        '50 auto-role configurations',
        '20 welcome message templates',
        'Lifetime updates',
        'VIP support',
        'Exclusive features',
        'No recurring payments',
        'Priority bug fixes',
      ],
      cta: t('pricing.plans.lifetime.cta'),
      highlighted: false,
      badge: 'Launch Offer',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="pricing-cards" className="py-20 px-4 bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.key}
              variants={cardVariants}
              className={`relative ${plan.highlighted ? 'md:scale-105' : ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Type Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  plan.planType === 'One-Time Purchase'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {plan.planType}
                </span>
              </div>

              {/* Card */}
              <div
                className={`relative h-full rounded-2xl border p-8 backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
                  plan.highlighted
                    ? 'border-indigo-500/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500/50'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                {/* Icon */}
                <div className="mb-4">
                  <div className="inline-flex rounded-xl bg-slate-900/50 p-3">
                    <plan.icon className={`h-8 w-8 ${plan.iconColor}`} />
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>

                {/* Description */}
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>

                {/* Billing Info */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {plan.billingCycle}
                  </span>
                  {plan.cancelable && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cancel anytime
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">/{plan.interval}</span>
                  </div>
                  {plan.savings && (
                    <p className="mt-1 text-sm font-medium text-green-400">{plan.savings}</p>
                  )}
                  {plan.key === 'lifetime' && (
                    <p className="mt-2 text-xs text-amber-400">⏳ Launch price — may increase as we grow</p>
                  )}
                </div>

                {/* Server Requirement Notice */}
                {plan.requiresGuild && (
                  <div className="mt-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
                    <p className="text-xs text-indigo-300 flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Requires server selection after purchase</span>
                    </p>
                  </div>
                )}

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-400 mt-0.5" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => onSelectPlan(plan.key)}
                  disabled={loading && selectedPlan === plan.key}
                  className={`mt-8 w-full rounded-xl py-3 px-6 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500'
                      : 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500'
                  } ${
                    loading && selectedPlan === plan.key
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:scale-105'
                  }`}
                >
                  {loading && selectedPlan === plan.key ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
