import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, RefreshCw, DollarSign, Zap } from 'lucide-react';
import { motionViewport, sectionIntro, withDelay, motionStagger } from '../../lib/motion';

export function TrustSignals() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const motionReveal = shouldReduceMotion ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : sectionIntro;
  const secondaryReveal = shouldReduceMotion ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : withDelay(sectionIntro, motionStagger.tight);

  const signals = [
    {
      icon: Shield,
      titleKey: 'billing.trustSignals.manual.title',
      descriptionKey: 'billing.trustSignals.manual.description',
    },
    {
      icon: RefreshCw,
      titleKey: 'billing.trustSignals.flexible.title',
      descriptionKey: 'billing.trustSignals.flexible.description',
    },
    {
      icon: DollarSign,
      titleKey: 'billing.trustSignals.protected.title',
      descriptionKey: 'billing.trustSignals.protected.description',
    },
    {
      icon: Zap,
      titleKey: 'billing.trustSignals.support.title',
      descriptionKey: 'billing.trustSignals.support.description',
    },
    {
      customIcon: (
        <svg className="h-5 w-5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      titleKey: 'billing.trustSignals.poweredBy',
      descriptionKey: 'billing.trustSignals.eyebrow',
    },
  ];

  return (
    <section className="relative">
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.03] blur-[100px]" />

      <motion.div
        variants={motionReveal}
        initial="hidden"
        whileInView="show"
        viewport={motionViewport}
        className="relative z-10 mx-auto w-full max-w-6xl px-6"
      >
        <div className="tech-card relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.02] via-transparent to-cyan-500/[0.02]" />

          {/* 5-column grid — uniform on desktop, 2-col wrap on mobile */}
          <div className="relative flex flex-wrap items-center justify-center divide-y divide-white/[0.04] sm:flex-nowrap sm:divide-x sm:divide-y-0">
            {signals.map((signal, index) => (
              <motion.div
                key={index}
                variants={secondaryReveal}
                initial="hidden"
                whileInView="show"
                viewport={motionViewport}
                className="group flex flex-1 items-center gap-3 px-5 py-7 sm:justify-center"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                  {signal.customIcon
                    ? signal.customIcon
                    : signal.icon && <signal.icon className="h-5 w-5 text-indigo-300" />}
                </div>

                {/* Text */}
                <div className="text-left">
                  <p className="text-sm font-semibold text-white transition-colors group-hover:text-indigo-200">
                    {t(signal.titleKey)}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    {t(signal.descriptionKey)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
