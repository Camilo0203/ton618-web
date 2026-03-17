import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Target, Zap, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export default function WhyTon() {
  const { t } = useTranslation();

  const reasons = [
    {
      icon: Target,
      title: t('why.reasons.precision.title'),
      description: t('why.reasons.precision.desc')
    },
    {
      icon: Zap,
      title: t('why.reasons.performance.title'),
      description: t('why.reasons.performance.desc')
    },
    {
      icon: ShieldCheck,
      title: t('why.reasons.security.title'),
      description: t('why.reasons.security.desc')
    },
    {
      icon: Cpu,
      title: t('why.reasons.integration.title'),
      description: t('why.reasons.integration.desc')
    }
  ];

  const highlights = [
    {
      label: t('why.stats.uptime'),
      value: t('why.stats.uptimeValue'),
      sub: t('why.stats.uptimeSub')
    },
    {
      label: t('why.stats.speed'),
      value: t('why.stats.speedValue'),
      sub: t('why.stats.speedSub')
    }
  ];

  return (
    <section id="why" className="pt-16 pb-32 bg-black relative overflow-hidden">
      {/* Structural Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-px bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
      <div className="absolute top-0 right-0 h-[500px] w-px bg-gradient-to-b from-indigo-500/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-8">
               <div className="h-[1px] w-12 bg-indigo-500"></div>
               <span className="text-xs font-bold uppercase tracking-[0.4em] text-indigo-500">{t('why.tag')}</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-white uppercase leading-[0.9] mb-10 tracking-tightest">
              {t('why.title')} <br/>
              <span className="headline-accent headline-accent-solid">{t('why.titleAccent')}</span>
            </h2>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-xl">
              {t('why.description')}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
               {highlights.map((item, i) => (
                 <div key={i} className="cinematic-glass group rounded-2xl p-6">
                    <div className="text-sm text-indigo-400 font-bold tracking-widest uppercase mb-1">{item.label}</div>
                    <div className="text-3xl font-bold text-white mb-1">{item.value}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.sub}</div>
                 </div>
               ))}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 relative">
            {reasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="tech-card overflow-hidden group"
              >
                <div className="relative z-10">
                  <div className="premium-icon-tile mb-6 h-12 w-12">
                    <reason.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-3 flex items-center justify-between">
                    {reason.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{reason.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
