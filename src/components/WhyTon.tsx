import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Target, Zap, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';
import { cardStagger, instantReveal, motionViewport, revealUp, sectionIntro, withDuration } from '../lib/motion';

export default function WhyTon() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const gridReveal = shouldReduceMotion ? instantReveal : cardStagger;
  const reasonReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, 0.28);

  const reasons = [
    {
      icon: Target,
      title: t('why.reasons.precision.title'),
      description: t('why.reasons.precision.desc'),
    },
    {
      icon: Zap,
      title: t('why.reasons.performance.title'),
      description: t('why.reasons.performance.desc'),
    },
    {
      icon: ShieldCheck,
      title: t('why.reasons.security.title'),
      description: t('why.reasons.security.desc'),
    },
    {
      icon: Cpu,
      title: t('why.reasons.integration.title'),
      description: t('why.reasons.integration.desc'),
    },
  ];

  const highlights = [
    {
      label: t('why.stats.uptime'),
      value: t('why.stats.uptimeValue'),
      sub: t('why.stats.uptimeSub'),
    },
    {
      label: t('why.stats.speed'),
      value: t('why.stats.speedValue'),
      sub: t('why.stats.speedSub'),
    },
  ];

  return (
    <section id="why" aria-labelledby="why-heading" className="relative overflow-hidden bg-black pb-28 pt-16">
      <div className="absolute right-0 top-0 h-px w-[500px] bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
      <div className="absolute right-0 top-0 h-[500px] w-px bg-gradient-to-b from-indigo-500/20 to-transparent"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <motion.div variants={introReveal} initial="hidden" whileInView="show" viewport={motionViewport}>
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px w-12 bg-indigo-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-400">{t('why.tag')}</span>
            </div>

            <h2 id="why-heading" className="mb-8 text-[clamp(2rem,5vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tightest text-white">
              {t('why.title')} <br />
              <span className="headline-accent headline-accent-solid">{t('why.titleAccent')}</span>
            </h2>

            <p className="mb-10 max-w-2xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
              {t('why.description')}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.label} className="cinematic-glass rounded-2xl p-6">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-tight-readable text-indigo-300">{item.label}</div>
                  <div className="mb-2 text-3xl font-bold text-white">{item.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight-readable text-slate-500">{item.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={gridReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="grid gap-6 sm:grid-cols-2"
          >
            {reasons.map((reason) => (
              <motion.article
                key={reason.title}
                variants={reasonReveal}
                className="tech-card overflow-hidden group"
              >
                <div className="relative z-10">
                  <div className="premium-icon-tile mb-6 h-12 w-12">
                    <reason.icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="mb-2.5 flex items-center justify-between text-base font-bold tracking-tight text-white">
                    {reason.title}
                    <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-40" />
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-400">{reason.description}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
