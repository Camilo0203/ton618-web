import { type ReactNode } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface ProLockProps {
  plan: string;
  requiredPlan?: 'pro' | 'enterprise';
  children: ReactNode;
  className?: string;
}

export default function ProLock({
  plan,
  requiredPlan = 'pro',
  children,
  className = '',
}: ProLockProps) {
  const { t } = useTranslation();
  
  const isLocked = plan === 'free' && (requiredPlan === 'pro' || requiredPlan === 'enterprise');
  
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="pointer-events-none select-none blur-[6px] opacity-40 grayscale-[0.5] transition-all duration-500 group-hover:blur-[8px]">
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-[280px] rounded-3xl border border-amber-500/30 bg-[#05060f]/90 p-6 text-center shadow-2xl backdrop-blur-xl"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="flex items-center justify-center gap-2 text-base font-bold text-white">
            <Sparkles className="h-4 w-4 text-amber-400" />
            {t('dashboard.pro.lockedTitle')}
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {t('dashboard.pro.lockedDesc', { plan: requiredPlan.toUpperCase() })}
          </p>
          <button
            type="button"
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => window.open('/#pricing', '_blank')}
          >
            {t('dashboard.pro.upgradeCta')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
