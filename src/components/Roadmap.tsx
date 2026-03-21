import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Rocket, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

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

  return (
    <section id="roadmap" aria-labelledby="roadmap-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <Rocket className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('roadmap.tag')}</span>
          </motion.div>

          <motion.h2
            id="roadmap-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('roadmap.title')}{' '}
            <span className="headline-accent headline-accent-solid">{t('roadmap.titleAccent')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('roadmap.description')}
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {itemIds.map((id, i) => {
            const status = t(`roadmap.items.${id}.status`) as string;
            const Icon = statusIcon[status] || Clock;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : i * 0.08 }}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:-translate-y-1"
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
        </div>
      </div>
    </section>
  );
}
