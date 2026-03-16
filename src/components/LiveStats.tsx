import { useEffect, useState, memo } from 'react';
import { Server, Users, Zap, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { defaultBotStats, useBotStats } from '../hooks/useBotStats';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedStats {
  servers: number;
  users: number;
  commands: number;
  uptimePercentage: number;
}

const StatCard = memo(({ icon: Icon, label, value, sub, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="group ml-0"
  >
    <div className="tech-card h-full flex flex-col items-center text-center group">
      <div className="hud-accent-corner top-left"></div>
      <div className="hud-accent-corner top-right"></div>
      <div className="hud-accent-corner bottom-left"></div>
      <div className="hud-accent-corner bottom-right"></div>

      <div className="inline-flex p-4 rounded-2xl bg-indigo-500/5 mb-8 group-hover:bg-indigo-500/10 transition-colors duration-500">
        <Icon className="w-8 h-8 text-indigo-400" />
      </div>
      
      <div className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter tabular-nums text-shadow-glow" style={{ willChange: 'contents' }}>
        {value}
      </div>
      
      <div className="space-y-1">
        <div className="text-indigo-400 font-bold text-[11px] uppercase tracking-[0.25em]">
          {label}
        </div>
        <div className="text-slate-600 font-bold text-[9px] uppercase tracking-widest">
          {sub}
        </div>
      </div>
      
      <div className="w-full h-1 bg-white/[0.02] rounded-full mt-10 overflow-hidden relative">
         <motion.div 
           initial={{ width: 0 }}
           whileInView={{ width: '70%' }}
           viewport={{ once: true }}
           className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500/10 to-indigo-500/40"
         ></motion.div>
      </div>
    </div>
  </motion.div>
));

StatCard.displayName = 'StatCard';

export default function LiveStats() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const { stats, error } = useBotStats();
  const [animated, setAnimated] = useState<AnimatedStats>(defaultBotStats);

  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimated({
        servers: stats.servers,
        users: stats.users,
        commands: stats.commands,
        uptimePercentage: stats.uptimePercentage
      });
      return;
    }

    const start = { ...animated };
    const target = { servers: stats.servers, users: stats.users, commands: stats.commands, uptimePercentage: stats.uptimePercentage };
    const durationMs = 1500;
    const startTime = performance.now();
    
    let frameId: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setAnimated({
        servers: Math.round(start.servers + (target.servers - start.servers) * easeOutQuart),
        users: Math.round(start.users + (target.users - start.users) * easeOutQuart),
        commands: Math.round(start.commands + (target.commands - start.commands) * easeOutQuart),
        uptimePercentage: Number((start.uptimePercentage + (target.uptimePercentage - start.uptimePercentage) * easeOutQuart).toFixed(2)),
      });
      
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };
    
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [stats, shouldReduceMotion]);

  const liveUnavailable = Boolean(error);

  const statCardsData = [
    { icon: Server, label: t('stats.cards.clusters.label'), value: animated.servers.toLocaleString(), sub: t('stats.cards.clusters.sub') },
    { icon: Users,  label: t('stats.cards.souls.label'),    value: animated.users.toLocaleString(),   sub: t('stats.cards.souls.sub') },
    { icon: Zap,    label: t('stats.cards.ops.label'),      value: animated.commands.toLocaleString(), sub: t('stats.cards.ops.sub') },
    { icon: Clock,  label: t('stats.cards.stability.label'), value: `${animated.uptimePercentage.toFixed(2)}%`, sub: t('stats.cards.stability.sub') },
  ];

  return (
    <section id="stats" className="py-40 relative bg-black overflow-hidden">
      {/* Background Matrix/Grid - GPU accelerated */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'translate3d(0,0,0)' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 cinematic-glass rounded-full border border-white/10 mb-10">
            <div className={`w-2 h-2 rounded-full ${liveUnavailable ? 'bg-red-500' : 'bg-cyan-400 animate-pulse'}`}></div>
            <span className="text-white font-bold text-[10px] uppercase tracking-[0.4em]">
              {liveUnavailable ? t('stats.badgeOffline') : t('stats.badgeOnline')}
            </span>
          </div>

          <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tightest uppercase leading-none">
            {t('stats.title')} <span className="text-premium-gradient">{t('stats.titleAccent')}</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            {t('stats.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCardsData.map((stat, i) => (
            <StatCard
              key={i}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              sub={stat.sub}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

