import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Terminal } from 'lucide-react';

const commandIds = ['c1', 'c2', 'c3', 'c4', 'c5'] as const;

export default function CommandPreview() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="commands" aria-labelledby="commands-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute right-1/4 top-0 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <Terminal className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('commandPreview.tag')}</span>
          </motion.div>

          <motion.h2
            id="commands-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('commandPreview.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('commandPreview.titleAccent')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('commandPreview.description')}
          </motion.p>
        </div>

        <div className="space-y-4">
          {commandIds.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : i * 0.06 }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/20"
            >
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex-1 min-w-0">
                  <code className="mb-2 block font-mono text-base font-bold text-indigo-300">
                    {t(`commandPreview.commands.${id}.name`)}
                  </code>
                  <p className="text-sm font-medium text-slate-400">
                    {t(`commandPreview.commands.${id}.desc`)}
                  </p>
                </div>
                <div className="flex-shrink-0 rounded-xl border border-white/5 bg-black/40 px-4 py-2.5">
                  <code className="font-mono text-xs text-slate-500">
                    {t(`commandPreview.commands.${id}.example`)}
                  </code>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
