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

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString();
}

export default function LiveStats() {
  const { stats, loading, error, lastUpdated } = useBotStats();
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
      className="py-24 relative overflow-hidden transition-colors duration-300 bg-gradient-to-br from-brand-600 via-violet-700 to-purple-800 dark:from-surface-900 dark:via-brand-900 dark:to-surface-800"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djYuOTEzYzAtLjUtLjItLjktLjYtMS4ybC00LTQuMGMtLjQtLjQtLjktLjYtMS40LS42SDI0Yy0xLjEgMC0yIC45LTIgMnYxMmMwIDEuMS45IDIgMiAyaDE2YzEuMSAwIDItLjkgMi0yVjM2YzAtMS4xLS45LTItMi0yem0tNiAxOGgtNHYtNGg0djR6bTAtOGgtNHYtNGg0djR6bTggOGgtNHYtNGg0djR6bTAtOGgtNHYtNGg0djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-xl rounded-full border border-white/25 mb-6 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${liveUnavailable ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`}></div>
            <span className="text-white font-medium text-sm">{liveUnavailable ? 'Fallback Statistics' : 'Live Statistics'}</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Trusted by Thousands</h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Join the growing community of Discord servers using our bot every day.
          </p>
          {!loading && liveUnavailable && (
            <p className="mt-4 text-sm text-white/60">Live stats unavailable. Showing latest fallback values.</p>
          )}
          {!loading && !liveUnavailable && lastUpdated && (
            <p className="mt-4 text-sm text-white/60">{t('stats.lastUpdated', 'Last updated')} {formatDate(lastUpdated)}</p>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div variants={itemVariants} key={stat.label} className="relative group">
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 shadow-lg">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4 shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/70 font-medium text-sm">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
