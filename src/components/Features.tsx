import { Shield, Zap, Cpu, BarChart3, Lock, Globe, Layers, Radio } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  status: string;
}

interface FeatureCardProps {
  feature: Feature;
  variants: {
    hidden: { opacity: number; scale: number; y: number };
    visible: {
      opacity: number;
      scale: number;
      y: number;
      transition: { duration: number; ease: 'easeOut' };
    };
  };
}

const FeatureCard = memo(({ feature, variants }: FeatureCardProps) => {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={variants}
      className="tech-card group flex h-full flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60"></div>

      <div className="premium-icon-tile relative mb-7 h-14 w-14">
        <Icon className="w-6 h-6 text-slate-300/85 group-hover:text-white transition-colors duration-500" />
      </div>

      <h3 className="mb-4 text-xl font-bold tracking-tight text-white transition-colors duration-500 group-hover:text-white/95">
        {feature.title}
      </h3>
      <p className="mb-8 text-sm font-medium leading-relaxed text-slate-400 transition-colors duration-500 group-hover:text-slate-300">
        {feature.description}
      </p>
      
      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 transition-colors duration-500 group-hover:text-slate-300">
          {feature.status}
        </span>
        <div className="h-1.5 w-1.5 rounded-full bg-white/20 transition-colors duration-500 group-hover:bg-white/50"></div>
      </div>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default function Features() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: shouldReduceMotion ? 0 : 0.05, 
        delayChildren: 0.1 
      } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    } as const,
  };

  return (
    <section id="features" className="pt-16 pb-32 relative overflow-hidden bg-black/50">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] nebula-blur bg-indigo-500/5 -translate-y-1/2 translate-x-1/2" style={{ transform: 'translate3d(0,0,0)' }}></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] nebula-blur bg-white/[0.03] translate-y-1/2 -translate-x-1/2" style={{ transform: 'translate3d(0,0,0)' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="w-8 h-[px] bg-indigo-500/30"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">{t('features.tag')}</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tightest uppercase"
            >
              {t('features.title')} <br/>
              <span className="text-premium-gradient">{t('features.titleAccent')}</span>
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-md"
          >
            <p className="text-lg text-slate-400 font-medium leading-relaxed border-l border-white/10 pl-8">
              {t('features.description')}
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              feature={feature} 
              variants={itemVariants} 
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
