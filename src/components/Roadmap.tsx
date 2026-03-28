import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Rocket, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { cardStagger, instantReveal, motionStagger, motionViewport, revealUp, sectionIntro, withDelay, withDuration } from '../lib/motion';

const itemIds = ['r1', 'r2', 'r3', 'r4'] as const;

const statusIcon: Record<string, typeof Clock> = {
  'En desarrollo': Clock,
  'In development': Clock,
  'Planeado': ArrowRight,
  'Planned': ArrowRight,
  'Próximamente': CheckCircle2,
  'Coming soon': CheckCircle2,
};

export default function Roadmap() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const secondaryIntroReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);
  const gridReveal = shouldReduceMotion ? instantReveal : cardStagger;
  const itemReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, 0.28);

  return (
    <section id="roadmap" aria-labelledby="roadmap-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            variants={introReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <Rocket className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('roadmap.tag')}</span>
          </motion.div>

          <motion.h2
            id="roadmap-heading"
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('roadmap.title')}{' '}
            <span className="headline-accent headline-accent-solid">{t('roadmap.titleAccent')}</span>
          </motion.h2>

          <motion.p
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('roadmap.description')}
          </motion.p>
        </div>

        <motion.div
          variants={gridReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="grid gap-6 sm:grid-cols-2"
        >
          {itemIds.map((id) => {
            const status = t(`roadmap.items.${id}.status`) as string;
            const Icon = statusIcon[status] || Clock;

            return (
              <motion.div
                key={id}
                variants={itemReveal}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:border-white/20 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-300">
                    {t(`roadmap.items.${id}.quarter`)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    <Icon className="h-3 w-3" />
                    {status}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-white">
                  {t(`roadmap.items.${id}.title`)}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-slate-400">
                  {t(`roadmap.items.${id}.desc`)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
