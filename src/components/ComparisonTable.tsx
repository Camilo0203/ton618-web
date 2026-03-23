import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GitCompareArrows, Check, Minus, X } from 'lucide-react';

type Support = 'full' | 'partial' | 'none';

interface BotData {
  key: string;
  support: Record<string, Support>;
}

const featureKeys = [
  'opsConsole',
  'livePlaybooks',
  'slaOps',
  'incidentControl',
  'inboxWorkspace',
  'customerMemory',
  'backups',
  'guidedOnboarding',
] as const;

const bots: BotData[] = [
  {
    key: 'ton618',
    support: {
      opsConsole: 'full',
      livePlaybooks: 'full',
      slaOps: 'full',
      incidentControl: 'full',
      inboxWorkspace: 'full',
      customerMemory: 'full',
      backups: 'full',
      guidedOnboarding: 'full',
    },
  },
  {
    key: 'mee6',
    support: {
      opsConsole: 'partial',
      livePlaybooks: 'none',
      slaOps: 'none',
      incidentControl: 'none',
      inboxWorkspace: 'none',
      customerMemory: 'none',
      backups: 'none',
      guidedOnboarding: 'partial',
    },
  },
  {
    key: 'dyno',
    support: {
      opsConsole: 'partial',
      livePlaybooks: 'none',
      slaOps: 'none',
      incidentControl: 'partial',
      inboxWorkspace: 'none',
      customerMemory: 'none',
      backups: 'none',
      guidedOnboarding: 'partial',
    },
  },
  {
    key: 'carlbot',
    support: {
      opsConsole: 'partial',
      livePlaybooks: 'none',
      slaOps: 'none',
      incidentControl: 'partial',
      inboxWorkspace: 'none',
      customerMemory: 'none',
      backups: 'none',
      guidedOnboarding: 'partial',
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
  const isEnglish = t('nav.docs') === 'Docs';
  const shouldReduceMotion = useReducedMotion();
  const copy = isEnglish
    ? {
        tag: 'Operational differentiation',
        title: 'Built To Replace',
        titleAccent: 'Bot Glue',
        description: 'TON618 competes on operations, not on who has the longest feature checklist. The difference is a real support console with guided decisions.',
        features: {
          opsConsole: 'Web ops console for staff',
          livePlaybooks: 'Live playbooks with guided actions',
          slaOps: 'SLA visibility and escalation workflows',
          incidentControl: 'Incident mode and reduced operating posture',
          inboxWorkspace: 'Inbox workspace with macros and follow-up',
          customerMemory: 'Lightweight customer memory',
          backups: 'Backups and config rollback',
          guidedOnboarding: 'Guided rollout for staff teams',
        },
        legend: { full: 'Built for it', partial: 'Partial fit', none: 'Not core' },
      }
    : {
        tag: 'Diferenciacion operativa',
        title: 'Hecho Para Reemplazar',
        titleAccent: 'El Pegante De Bots',
        description: 'TON618 compite por operacion, no por checklists infinitos. La diferencia es una consola real de soporte con decisiones guiadas.',
        features: {
          opsConsole: 'Ops console web para staff',
          livePlaybooks: 'Playbooks vivos con acciones guiadas',
          slaOps: 'Visibilidad SLA y flujos de escalado',
          incidentControl: 'Incident mode y postura operativa reducida',
          inboxWorkspace: 'Inbox con macros y seguimiento',
          customerMemory: 'Memoria operativa ligera',
          backups: 'Backups y rollback de configuracion',
          guidedOnboarding: 'Despliegue guiado para staff',
        },
        legend: { full: 'Hecho para eso', partial: 'Ajuste parcial', none: 'No es core' },
      };

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
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{copy.tag}</span>
          </motion.div>

          <motion.h2
            id="comparison-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {copy.title} <br />
            <span className="headline-accent headline-accent-solid">{copy.titleAccent}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {copy.description}
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
                    {copy.features[featureKey]}
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
            <span>{copy.legend.full}</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-amber-400" />
            <span>{copy.legend.partial}</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-slate-600" />
            <span>{copy.legend.none}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
