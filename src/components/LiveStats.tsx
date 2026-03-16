import { useEffect, useState } from 'react';
import { Server, Users, Zap, Clock } from 'lucide-react';
import { defaultBotStats, useBotStats } from '../hooks/useBotStats';
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

  useEffect(() => {
    const start = { ...animated };
    const target = { servers: stats.servers, users: stats.users, commands: stats.commands, uptimePercentage: stats.uptimePercentage };
    const durationMs = 2000; // Slower, more deliberate count
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setAnimated({
        servers: Math.round(start.servers + (target.servers - start.servers) * easeOutQuart),
        users: Math.round(start.users + (target.users - start.users) * easeOutQuart),
        commands: Math.round(start.commands + (target.commands - start.commands) * easeOutQuart),
        uptimePercentage: Number((start.uptimePercentage + (target.uptimePercentage - start.uptimePercentage) * easeOutQuart).toFixed(2)),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [stats.servers, stats.users, stats.commands, stats.uptimePercentage]);

  const liveUnavailable = Boolean(error);

  const statCards = [
    { icon: Server, label: 'Active Clusters',     value: animated.servers.toLocaleString(),              sub: 'Across Global Nodes' },
    { icon: Users,  label: 'Synchronized Souls',    value: animated.users.toLocaleString(),                sub: 'Verified Identities' },
    { icon: Zap,    label: 'Operations Executed',   value: animated.commands.toLocaleString(),             sub: 'Real-time Throughput' },
    { icon: Clock,  label: 'Stability Index',       value: `${animated.uptimePercentage.toFixed(2)}%`,     sub: 'L1 Uptime Standard' },
  ];

  return (
    <section id="stats" className="py-40 relative bg-black overflow-hidden">
      {/* Background Matrix/Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 cinematic-glass rounded-full border border-white/10 mb-10">
            <div className={`w-2 h-2 rounded-full ${liveUnavailable ? 'bg-red-500' : 'bg-cyan-400 animate-pulse'}`}></div>
            <span className="text-white font-bold text-[10px] uppercase tracking-[0.4em]">{liveUnavailable ? 'Protocol Restricted' : 'Telemetry Online'}</span>
          </div>

          <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tightest uppercase leading-none">
            Proven <span className="text-premium-gradient">Scale</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Live telemetry data verified by our global synchronization layer. Power without compromise.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
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
                  
                  <div className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter tabular-nums text-shadow-glow">
                    {stat.value}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-indigo-400 font-bold text-[11px] uppercase tracking-[0.25em]">
                      {stat.label}
                    </div>
                    <div className="text-slate-600 font-bold text-[9px] uppercase tracking-widest">
                      {stat.sub}
                    </div>
                  </div>
                  
                  {/* Subtle decorative meter */}
                  <div className="w-full h-1 bg-white/[0.03] rounded-full mt-10 overflow-hidden relative">
                     <motion.div 
                       initial={{ width: 0 }}
                       whileInView={{ width: '70%' }}
                       viewport={{ once: true }}
                       className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500/20 to-indigo-500/60"
                     ></motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

