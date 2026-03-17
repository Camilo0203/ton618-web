import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Server, Users, Zap, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { defaultBotStats, useBotStats } from '../hooks/useBotStats';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedStats {
  servers: number;
  users: number;
  commands: number;
  uptimePercentage: number;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  index: number;
  loading: boolean;
}

const StatCard = memo(({ icon: Icon, label, value, sub, index, loading }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="group ml-0"
  >
    <div className="tech-card relative h-full overflow-hidden text-center">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60"></div>

      <div className="flex h-full flex-col items-center">
        <div className="premium-icon-tile mb-8 p-4">
          <Icon className="h-8 w-8 text-slate-200 transition-colors duration-500 group-hover:text-white" />
        </div>

        <div
          className={`mb-4 text-4xl font-bold tracking-tighter tabular-nums text-white transition-opacity duration-300 md:text-5xl ${loading ? 'opacity-80' : 'opacity-100'}`}
          style={{ willChange: 'contents' }}
        >
          {value}
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-200">
            {label}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
            {sub}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0.45, scaleX: 0.4 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: index * 0.1 + 0.15 }}
          className="mt-10 h-px w-full origin-left bg-gradient-to-r from-transparent via-white/18 to-transparent"
        />
      </div>
    </div>
  </motion.div>
));

StatCard.displayName = 'StatCard';

export default function LiveStats() {
  const { t, i18n } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const { stats, loading, error, lastUpdated } = useBotStats();
  const [animated, setAnimated] = useState<AnimatedStats>(defaultBotStats);
  const previousStatsRef = useRef<AnimatedStats>(defaultBotStats);

  useEffect(() => {
    if (shouldReduceMotion) {
      const nextAnimated = {
        servers: stats.servers,
        users: stats.users,
        commands: stats.commands,
        uptimePercentage: stats.uptimePercentage
      };
      previousStatsRef.current = nextAnimated;
      setAnimated(nextAnimated);
      return;
    }

    const start = previousStatsRef.current;
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
      } else {
        previousStatsRef.current = target;
      }
    };
    
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [stats, shouldReduceMotion]);

  const liveUnavailable = Boolean(error);
  const badgeToneClass = liveUnavailable ? 'bg-red-500' : loading ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 animate-pulse';
  const badgeLabel = loading ? t('stats.badgeLoading') : liveUnavailable ? t('stats.badgeOffline') : t('stats.badgeOnline');
  const locale = i18n.resolvedLanguage || i18n.language || 'en';
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) {
      return '';
    }

    const parsedDate = new Date(lastUpdated);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsedDate);
  }, [lastUpdated, locale]);

  const statusMessage = loading
    ? t('stats.status.syncing')
    : formattedLastUpdated
      ? t('stats.lastUpdated', { value: formattedLastUpdated })
      : error
        ? t('stats.status.standby')
        : '';

  const statCardsData = [
    { icon: Server, label: t('stats.cards.clusters.label'), value: animated.servers.toLocaleString(), sub: t('stats.cards.clusters.sub') },
    { icon: Users,  label: t('stats.cards.souls.label'),    value: animated.users.toLocaleString(),   sub: t('stats.cards.souls.sub') },
    { icon: Zap,    label: t('stats.cards.ops.label'),      value: animated.commands.toLocaleString(), sub: t('stats.cards.ops.sub') },
    { icon: Clock,  label: t('stats.cards.stability.label'), value: `${animated.uptimePercentage.toFixed(2)}%`, sub: t('stats.cards.stability.sub') },
  ];

  return (
    <section id="stats" className="pt-16 pb-32 relative bg-black overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          transform: 'translate3d(0,0,0)',
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="premium-pill mb-10 px-6 py-2">
            <div className={`w-2 h-2 rounded-full ${badgeToneClass}`}></div>
            <span className="text-white font-bold text-[10px] uppercase tracking-[0.4em]">
              {badgeLabel}
            </span>
          </div>

          <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tightest uppercase leading-none">
            {t('stats.title')} <span className="headline-accent headline-accent-solid">{t('stats.titleAccent')}</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            {t('stats.description')}
          </p>
          {(statusMessage || error) && (
            <div className="mt-6 flex flex-col items-center gap-2">
              {statusMessage && (
                <div className="premium-pill gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                  <span className={`h-1.5 w-1.5 rounded-full ${liveUnavailable ? 'bg-red-400' : loading ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.75)]' : 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.65)]'}`}></span>
                  <span>{statusMessage}</span>
                </div>
              )}
              {error && (
                <p className="max-w-2xl text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  {t('stats.status.fallback')}
                </p>
              )}
            </div>
          )}
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
              loading={loading}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
