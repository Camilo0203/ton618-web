import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { History, Tag } from 'lucide-react';

const entryIds = ['e1', 'e2', 'e3', 'e4'] as const;

export default function Changelog() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="changelog" aria-labelledby="changelog-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <History className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('changelog.tag')}</span>
          </motion.div>

          <motion.h2
            id="changelog-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('changelog.title')}{' '}
            <span className="headline-accent headline-accent-solid">{t('changelog.titleAccent')}</span>
          </motion.h2>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-white/10 to-transparent sm:left-1/2 sm:-translate-x-px" />

          {entryIds.map((id, i) => {
            const isLeft = i % 2 === 0;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : i * 0.08 }}
                className={`relative mb-12 flex flex-col pl-12 sm:w-1/2 sm:pl-0 ${isLeft ? 'sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12 sm:text-left'}`}
              >
                <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-slate-950 sm:left-auto ${isLeft ? 'sm:right-[-6.5px]' : 'sm:left-[-6.5px]'}`} />

                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-3 w-3 text-indigo-400 sm:hidden" />
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
                    {t(`changelog.entries.${id}.version`)}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {t(`changelog.entries.${id}.date`)}
                  </span>
                </div>

                <h3 className="mb-1 text-base font-bold text-white">
                  {t(`changelog.entries.${id}.title`)}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                  {t(`changelog.entries.${id}.desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
