import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Puzzle } from 'lucide-react';
import { memo } from 'react';

interface IntegrationItemProps {
  id: string;
  name: string;
  desc: string;
  index: number;
  gradient: string;
  icon: string;
}

const IntegrationItem = memo(({ name, desc, index, gradient, icon }: IntegrationItemProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.06 }}
      className="tech-card group flex flex-col items-center overflow-hidden text-center"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60" />

      <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <span className="text-2xl">{icon}</span>
      </div>

      <h3 className="mb-2 text-lg font-bold text-white">{name}</h3>
      <p className="text-sm font-medium leading-relaxed text-slate-400">{desc}</p>
    </motion.div>
  );
});

IntegrationItem.displayName = 'IntegrationItem';

const integrationsMeta = [
  { id: 'discord', gradient: 'from-[#5865F2]/20 to-[#5865F2]/5', icon: '💬' },
  { id: 'supabase', gradient: 'from-emerald-500/20 to-emerald-500/5', icon: '⚡' },
  { id: 'nodejs', gradient: 'from-green-500/20 to-green-500/5', icon: '🟢' },
  { id: 'typescript', gradient: 'from-blue-500/20 to-blue-500/5', icon: '🔷' },
  { id: 'react', gradient: 'from-cyan-500/20 to-cyan-500/5', icon: '⚛️' },
  { id: 'tailwind', gradient: 'from-sky-500/20 to-sky-500/5', icon: '🎨' },
];

export default function Integrations() {
  const { t } = useTranslation();

  const items = integrationsMeta.map((meta) => ({
    ...meta,
    name: t(`integrations.items.${meta.id}.name`),
    desc: t(`integrations.items.${meta.id}.desc`),
  }));

  return (
    <section id="integrations" aria-labelledby="integrations-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute right-1/3 top-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <Puzzle className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('integrations.tag')}</span>
          </motion.div>

          <motion.h2
            id="integrations-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('integrations.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('integrations.titleAccent')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('integrations.description')}
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <IntegrationItem key={item.id} {...item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
