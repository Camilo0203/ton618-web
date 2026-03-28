import { Shield, Zap, Cpu, BarChart3, Lock, Globe, Layers, Radio } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { cardStagger, instantReveal, motionStagger, motionViewport, revealUp, sectionIntro, withDelay } from '../lib/motion';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  status: string;
}

const FeatureCard = memo(({ feature }: { feature: Feature }) => {
  const Icon = feature.icon;
  const shouldReduceMotion = useReducedMotion();
  const cardReveal = shouldReduceMotion ? instantReveal : revealUp;

  return (
    <motion.article variants={cardReveal} className="feature-tech-card group flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60"></div>

      <div className="feature-icon-tile relative mb-7 h-14 w-14">
        <Icon className="h-6 w-6 text-slate-300/85 transition-colors duration-300 group-hover:text-white" />
      </div>

      <h3 className="mb-4 text-xl font-bold tracking-tight text-white">{feature.title}</h3>
      <p className="mb-8 text-sm font-medium leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
        {feature.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
        <span className="text-[10px] font-bold uppercase tracking-normal-readable text-slate-500 transition-colors duration-300 group-hover:text-slate-300">
          {feature.status}
        </span>
        <div className="h-1.5 w-1.5 rounded-full bg-white/20 transition-colors duration-300 group-hover:bg-cyan-300"></div>
      </div>
    </motion.article>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default function Features() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const secondaryIntroReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);
  const useCasesReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.base);
  const gridReveal = shouldReduceMotion ? instantReveal : cardStagger;

  const features: Feature[] = [
    { icon: Shield, title: t('features.items.moderation.title'), description: t('features.items.moderation.desc'), status: t('features.items.moderation.status') },
    { icon: Cpu, title: t('features.items.autonomy.title'), description: t('features.items.autonomy.desc'), status: t('features.items.autonomy.status') },
    { icon: Zap, title: t('features.items.latency.title'), description: t('features.items.latency.desc'), status: t('features.items.latency.status') },
    { icon: Lock, title: t('features.items.security.title'), description: t('features.items.security.desc'), status: t('features.items.security.status') },
    { icon: BarChart3, title: t('features.items.analytics.title'), description: t('features.items.analytics.desc'), status: t('features.items.analytics.status') },
    { icon: Globe, title: t('features.items.network.title'), description: t('features.items.network.desc'), status: t('features.items.network.status') },
    { icon: Layers, title: t('features.items.modular.title'), description: t('features.items.modular.desc'), status: t('features.items.modular.status') },
    { icon: Radio, title: t('features.items.comms.title'), description: t('features.items.comms.desc'), status: t('features.items.comms.status') },
  ];

  const useCases = [
    t('features.useCases.moderation'),
    t('features.useCases.onboarding'),
    t('features.useCases.support'),
  ];

  return (
    <section id="features" aria-labelledby="features-heading" className="relative overflow-hidden bg-black/50 pb-28 pt-12 md:pt-16">
      <div className="nebula-blur absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 bg-indigo-500/5"></div>
      <div className="nebula-blur absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 bg-white/[0.03]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-10 lg:mb-20 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div className="max-w-3xl">
            <motion.div variants={introReveal} initial="hidden" whileInView="show" viewport={motionViewport} className="mb-8 flex items-center gap-4">
              <div className="h-px w-8 bg-indigo-500/30"></div>
              <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-400">{t('features.tag')}</span>
            </motion.div>

            <motion.h2
              id="features-heading"
              variants={secondaryIntroReveal}
              initial="hidden"
              whileInView="show"
              viewport={motionViewport}
              className="text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
            >
              {t('features.title')} <br />
              <span className="headline-accent headline-accent-solid">{t('features.titleAccent')}</span>
            </motion.h2>
          </div>

          <motion.p
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="max-w-md border-l border-white/10 pl-6 text-base font-medium leading-relaxed text-slate-400 md:pl-8 md:text-lg"
          >
            {t('features.description')}
          </motion.p>
        </div>

        <motion.div
          variants={useCasesReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="mb-10 grid gap-4 md:grid-cols-3"
        >
          {useCases.map((useCase) => (
            <div key={useCase} className="cinematic-glass rounded-2xl border-white/8 px-5 py-5">
              <p className="text-sm font-semibold leading-relaxed text-slate-200">{useCase}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={gridReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
