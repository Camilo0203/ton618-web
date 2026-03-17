import { Shield, Zap, Cpu, BarChart3, Lock, Globe, Layers, Radio } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

const FeatureCard = memo(({ feature, variants }: { feature: any, variants: any }) => {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={variants}
      className="tech-card group h-full flex flex-col"
    >
      {/* HUD ACCENTS */}
      <div className="hud-accent-corner top-left"></div>
      <div className="hud-accent-corner top-right"></div>
      <div className="hud-accent-corner bottom-left"></div>
      <div className="hud-accent-corner bottom-right"></div>

      {/* ICON BOX */}
      <div className="relative mb-8 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.04] group-hover:border-indigo-500/20 transition-all duration-500">
        <Icon className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-colors duration-500" />
      </div>

      <h3 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:text-indigo-100 transition-colors">{feature.title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 group-hover:text-slate-400 transition-colors duration-500">
        {feature.description}
      </p>
      
      <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/[0.04]">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 group-hover:text-indigo-500/60 transition-colors">
          {feature.status}
        </span>
        <div className="w-1.2 h-1.2 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors"></div>
      </div>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default function Features() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const features = [
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
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] nebula-blur bg-indigo-500/5 -translate-y-1/2 translate-x-1/2" style={{ transform: 'translate3d(0,0,0)' }}></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] nebula-blur bg-purple-500/5 translate-y-1/2 -translate-x-1/2" style={{ transform: 'translate3d(0,0,0)' }}></div>

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

