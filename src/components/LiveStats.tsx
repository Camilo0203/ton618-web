import { useEffect, useState } from 'react';
import { Server, Users, Zap, Clock } from 'lucide-react';
import { defaultBotStats, useBotStats } from '../hooks/useBotStats';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface AnimatedStats {
  servers: number;
  users: number;
  commands: number;
  uptimePercentage: number;
}



export default function LiveStats() {
  const { stats, error } = useBotStats();
  const [animated, setAnimated] = useState<AnimatedStats>(defaultBotStats);
  const { t } = useTranslation();

  useEffect(() => {
    const start = { ...animated };
    const target = { servers: stats.servers, users: stats.users, commands: stats.commands, uptimePercentage: stats.uptimePercentage };
    const durationMs = 800;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      setAnimated({
        servers: Math.round(start.servers + (target.servers - start.servers) * progress),
        users: Math.round(start.users + (target.users - start.users) * progress),
        commands: Math.round(start.commands + (target.commands - start.commands) * progress),
        uptimePercentage: Number((start.uptimePercentage + (target.uptimePercentage - start.uptimePercentage) * progress).toFixed(2)),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.servers, stats.users, stats.commands, stats.uptimePercentage]);

  const liveUnavailable = Boolean(error);

  const statCards = [
    { icon: Server, label: t('stats.servers', 'Active Servers'),     value: animated.servers.toLocaleString(),              gradient: 'from-brand-400 to-indigo-500' },
    { icon: Users,  label: t('stats.users', 'Total Users'),          value: animated.users.toLocaleString(),                gradient: 'from-violet-500 to-purple-600' },
    { icon: Zap,    label: t('stats.labels.commands', 'Commands Executed'), value: animated.commands.toLocaleString(),      gradient: 'from-amber-400 to-orange-500' },
    { icon: Clock,  label: t('stats.uptime', 'Uptime'),              value: `${animated.uptimePercentage.toFixed(2)}%`,     gradient: 'from-emerald-400 to-teal-500' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="stats"
      className="py-32 relative overflow-hidden bg-[#010413]"
    >
      {/* Interstellar background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(245,158,11,0.03),transparent_50%)]"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.03),transparent_50%)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 gravitational-lens rounded-full border border-white/10 mb-8 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <div className={`w-2.5 h-2.5 rounded-full ${liveUnavailable ? 'bg-red-500' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]'}`}></div>
            <span className="text-white font-black text-xs uppercase tracking-[0.2em]">{liveUnavailable ? 'Offline Sync' : 'Real-time Pulse'}</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">Verified <span className="text-brand-gradient">Mass</span></h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Real-time data streaming directly from the event horizon. Zero latency community monitoring.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div variants={itemVariants} key={stat.label} className="relative group">
                <div className="relative hud-border rounded-3xl p-10 hover:border-amber-500/40 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(245,158,11,0.1)] group/card">
                  <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 mb-8 group-hover/card:scale-110 transition-transform duration-500">
                    <Icon className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="text-5xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-loose">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
