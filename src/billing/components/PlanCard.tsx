// Plan card component for displaying pricing plans
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Zap, Crown, Sparkles, Heart } from 'lucide-react';
import type { PlanDetails } from '../types';

interface PlanCardProps {
  plan: PlanDetails;
  onSelect: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const iconMap = {
  zap: Zap,
  crown: Crown,
  sparkles: Sparkles,
  heart: Heart,
};

export function PlanCard({ plan, onSelect, loading = false, disabled = false }: PlanCardProps) {
  const { t } = useTranslation();
  const Icon = iconMap[plan.icon];
  const isHighlighted = plan.highlighted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`
        relative rounded-2xl p-6 transition-all duration-300
        ${isHighlighted 
          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl ring-2 ring-indigo-400' 
          : 'bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-xs font-bold">
          {plan.badge}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl ${isHighlighted ? 'bg-white/20' : 'bg-indigo-500/20'}`}>
          <Icon className={`w-6 h-6 ${isHighlighted ? 'text-white' : 'text-indigo-400'}`} />
        </div>
        <h3 className={`text-2xl font-bold ${isHighlighted ? 'text-white' : 'text-white'}`}>
          {plan.name}
        </h3>
      </div>

      <p className={`mb-6 text-sm ${isHighlighted ? 'text-white/90' : 'text-slate-300'}`}>
        {plan.description}
      </p>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${isHighlighted ? 'text-white' : 'text-white'}`}>
            {plan.price}
          </span>
          {plan.interval && (
            <span className={`text-lg ${isHighlighted ? 'text-white/70' : 'text-slate-400'}`}>
              /{plan.interval}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onSelect}
        disabled={loading || disabled}
        className={`
          w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200
          ${isHighlighted
            ? 'bg-white text-indigo-600 hover:bg-slate-100'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }
          ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          disabled:hover:scale-100
        `}
      >
        {loading ? t('billing.pricingCards.loading') : t('billing.pricingCards.monthly.cta')}
      </button>

      <div className="mt-6 space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isHighlighted ? 'text-white' : 'text-green-400'}`} />
            <span className={`text-sm ${isHighlighted ? 'text-white/90' : 'text-slate-300'}`}>
              {feature}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
