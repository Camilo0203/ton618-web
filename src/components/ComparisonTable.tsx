import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GitCompareArrows, Check, Minus, X } from 'lucide-react';

type Support = 'full' | 'partial' | 'none';

interface BotData {
  key: string;
  support: Record<string, Support>;
}

const featureKeys = [
  'moderation',
  'automation',
  'dashboard',
  'analytics',
  'verification',
  'tickets',
  'liveUptime',
  'customFlows',
] as const;

const bots: BotData[] = [
  {
    key: 'ton618',
    support: {
      moderation: 'full',
      automation: 'full',
      dashboard: 'full',
      analytics: 'full',
      verification: 'full',
      tickets: 'full',
      liveUptime: 'full',
      customFlows: 'full',
    },
  },
  {
    key: 'mee6',
    support: {
      moderation: 'full',
      automation: 'partial',
      dashboard: 'full',
      analytics: 'partial',
      verification: 'none',
      tickets: 'none',
      liveUptime: 'none',
      customFlows: 'partial',
    },
  },
  {
    key: 'dyno',
    support: {
      moderation: 'full',
      automation: 'partial',
      dashboard: 'full',
      analytics: 'none',
      verification: 'partial',
      tickets: 'none',
      liveUptime: 'none',
      customFlows: 'partial',
    },
  },
  {
    key: 'carlbot',
    support: {
      moderation: 'partial',
      automation: 'full',
      dashboard: 'partial',
      analytics: 'none',
      verification: 'partial',
      tickets: 'none',
      liveUptime: 'none',
      customFlows: 'full',
    },
  },
];

function SupportIcon({ level }: { level: Support }) {
  switch (level) {
    case 'full':
      return <Check className="h-5 w-5 text-emerald-400" />;
    case 'partial':
      return <Minus className="h-5 w-5 text-amber-400" />;
    case 'none':
      return <X className="h-5 w-5 text-slate-600" />;
  }
}

export default function ComparisonTable() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="comparison" aria-labelledby="comparison-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/3 top-0 h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <GitCompareArrows className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('comparison.tag')}</span>
          </motion.div>

          <motion.h2
            id="comparison-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('comparison.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('comparison.titleAccent')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('comparison.description')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wide-readable text-slate-500" />
                {bots.map((bot) => (
                  <th
                    key={bot.key}
                    className={`px-4 py-4 text-center text-sm font-bold uppercase tracking-tight ${
                      bot.key === 'ton618'
                        ? 'text-indigo-300'
                        : 'text-slate-400'
                    }`}
                  >
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                      bot.key === 'ton618'
                        ? 'border border-indigo-500/30 bg-indigo-500/10'
                        : ''
                    }`}>
                      {t(`comparison.bots.${bot.key}`)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureKeys.map((featureKey, i) => (
                <motion.tr
                  key={featureKey}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: shouldReduceMotion ? 0 : i * 0.03 }}
                  className="border-t border-white/5 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4 text-sm font-semibold text-slate-300">
                    {t(`comparison.features.${featureKey}`)}
                  </td>
                  {bots.map((bot) => (
                    <td key={bot.key} className={`px-4 py-4 text-center ${bot.key === 'ton618' ? 'bg-indigo-500/[0.03]' : ''}`}>
                      <div className="flex items-center justify-center">
                        <SupportIcon level={bot.support[featureKey]} />
                      </div>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{t('comparison.legend.full')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-amber-400" />
            <span>{t('comparison.legend.partial')}</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-slate-600" />
            <span>{t('comparison.legend.none')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
