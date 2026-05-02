import {
  BarChart3,
  Bug,
  Globe2,
  LifeBuoy,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
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
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60"></div>

      <div className="feature-icon-tile relative mb-6 h-12 w-12">
        <Icon className="h-5 w-5 text-slate-300/85 transition-colors duration-300 group-hover:text-white" />
      </div>

      <h3 className="mb-3 text-base font-bold tracking-tight text-white">{feature.title}</h3>
      <p className="mb-6 text-sm font-normal leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
        {feature.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-5">
        <span className="text-[10px] font-bold uppercase tracking-normal-readable text-slate-500 transition-colors duration-300 group-hover:text-slate-400">
          {feature.status}
        </span>
        <div className="h-1.5 w-1.5 rounded-full bg-white/20 transition-colors duration-300 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
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
    { icon: Globe2, title: t('features.items.bilingual.title'), description: t('features.items.bilingual.desc'), status: t('features.items.bilingual.status') },
    { icon: Settings2, title: t('features.items.setup.title'), description: t('features.items.setup.desc'), status: t('features.items.setup.status') },
    { icon: LifeBuoy, title: t('features.items.tickets.title'), description: t('features.items.tickets.desc'), status: t('features.items.tickets.status') },
    { icon: ShieldCheck, title: t('features.items.verification.title'), description: t('features.items.verification.desc'), status: t('features.items.verification.status') },
    { icon: Users, title: t('features.items.staff.title'), description: t('features.items.staff.desc'), status: t('features.items.staff.status') },
    { icon: BarChart3, title: t('features.items.stats.title'), description: t('features.items.stats.desc'), status: t('features.items.stats.status') },
    { icon: SlidersHorizontal, title: t('features.items.config.title'), description: t('features.items.config.desc'), status: t('features.items.config.status') },
    { icon: Bug, title: t('features.items.audit.title'), description: t('features.items.audit.desc'), status: t('features.items.audit.status') },
  ];

  const useCases = [
    t('features.useCases.language'),
    t('features.useCases.rollout'),
    t('features.useCases.operations'),
  ];

  return (
    <section id="features" aria-labelledby="features-heading" className="relative overflow-hidden bg-black/50 py-20 md:py-28">
      <div className="nebula-blur absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 bg-indigo-500/5"></div>
      <div className="nebula-blur absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 bg-white/[0.03]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-10 lg:mb-20 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div className="max-w-3xl">
            <motion.div variants={introReveal} initial="hidden" whileInView="show" viewport={motionViewport} className="mb-6 flex items-center gap-3">
              <div className="h-px w-8 bg-indigo-500/40"></div>
              <span className="label-eyebrow text-indigo-400">{t('features.tag')}</span>
            </motion.div>

            <motion.h2
              id="features-heading"
              variants={secondaryIntroReveal}
              initial="hidden"
              whileInView="show"
              viewport={motionViewport}
              className="text-[clamp(2rem,5vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tightest text-white"
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
            className="max-w-md border-l border-white/8 pl-6 text-base font-normal leading-relaxed text-slate-400 md:pl-7"
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
