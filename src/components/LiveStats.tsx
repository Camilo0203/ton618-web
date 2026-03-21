import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Server, Users, Zap, Clock, Radio, AlertTriangle, RefreshCw } from 'lucide-react';
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

function formatTimestamp(value: string, locale: string): string {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(parsedDate);
  } catch {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsedDate);
  }
}

const StatCard = memo(({ icon: Icon, label, value, sub, index, loading }: StatCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.08 }}
    className="group ml-0"
  >
    <div className="tech-card relative h-full overflow-hidden text-center">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60"></div>

      <div className="flex h-full flex-col items-center">
        <div className="premium-icon-tile mb-8 p-4">
          <Icon className="h-8 w-8 text-slate-200 transition-colors duration-500 group-hover:text-white" />
        </div>

        <div
          className={`mb-4 text-4xl font-bold tracking-tighter tabular-nums text-white transition-opacity duration-300 md:text-5xl ${loading ? 'opacity-90' : 'opacity-100'}`}
          style={{ willChange: 'contents' }}
        >
          {value}
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-tight-readable text-slate-200">{label}</div>
          <div className="text-[10px] font-bold uppercase tracking-tight-readable text-slate-500">{sub}</div>
        </div>

        {loading ? (
          <div className="mt-8 h-1.5 w-24 overflow-hidden rounded-full bg-white/8" aria-hidden="true">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-400/70"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0.45, scaleX: 0.4 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.08 + 0.15 }}
            className="mt-10 h-px w-full origin-left bg-gradient-to-r from-transparent via-white/18 to-transparent"
          />
        )}
      </div>
    </div>
  </motion.article>
));

StatCard.displayName = 'StatCard';

export default function LiveStats() {
  const { t, i18n } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const { stats, loading, error, errorKind, lastUpdated } = useBotStats();
  const [animated, setAnimated] = useState<AnimatedStats>(defaultBotStats);
  const previousStatsRef = useRef<AnimatedStats>(defaultBotStats);
  const liveUnavailable = Boolean(error);
  const locale = i18n.resolvedLanguage || i18n.language || 'en';

  useEffect(() => {
    if (shouldReduceMotion) {
      const nextAnimated = {
        servers: stats.servers,
        users: stats.users,
        commands: stats.commands,
        uptimePercentage: stats.uptimePercentage,
      };
      previousStatsRef.current = nextAnimated;
      setAnimated(nextAnimated);
      return;
    }

    const start = previousStatsRef.current;
    const target = {
      servers: stats.servers,
      users: stats.users,
      commands: stats.commands,
      uptimePercentage: stats.uptimePercentage,
    };
    const durationMs = 1400;
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

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) {
      return '';
    }

    return formatTimestamp(lastUpdated, locale);
  }, [lastUpdated, locale]);

  const badgeToneClass = liveUnavailable ? 'bg-amber-400' : loading ? 'bg-cyan-300' : 'bg-emerald-400';
  const badgeLabel = loading ? t('stats.badgeLoading') : liveUnavailable ? t('stats.badgeOffline') : t('stats.badgeOnline');
  const sourceLabel = loading ? t('stats.source.loading') : liveUnavailable ? t('stats.source.fallback') : t('stats.source.live');
  const statusMessage = loading ? t('stats.status.syncing') : liveUnavailable ? t('stats.status.standby') : formattedLastUpdated ? t('stats.lastUpdated', { value: formattedLastUpdated }) : '';
  const fallbackDetail = liveUnavailable
    ? errorKind === 'config'
      ? t('stats.status.configFallback')
      : errorKind === 'network'
        ? t('stats.status.networkFallback')
        : formattedLastUpdated
          ? t('stats.status.fallbackWithTime', { value: formattedLastUpdated })
          : stats.servers > 0
            ? t('stats.status.fallback')
            : ''
    : '';

  const hasData = animated.servers > 0 || animated.users > 0 || animated.commands > 0;

  const statCardsData = [
    { icon: Server, label: t('stats.cards.clusters.label'), value: hasData ? animated.servers.toLocaleString(locale) : '-', sub: t('stats.cards.clusters.sub') },
    { icon: Users, label: t('stats.cards.souls.label'), value: hasData ? animated.users.toLocaleString(locale) : '-', sub: t('stats.cards.souls.sub') },
    { icon: Zap, label: t('stats.cards.ops.label'), value: hasData ? animated.commands.toLocaleString(locale) : '-', sub: t('stats.cards.ops.sub') },
    { icon: Clock, label: t('stats.cards.stability.label'), value: hasData ? `${animated.uptimePercentage.toFixed(2)}%` : '-', sub: t('stats.cards.stability.sub') },
  ];

  return (
    <section id="stats" aria-labelledby="stats-heading" className="relative overflow-hidden bg-black pb-28 pt-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          transform: 'translate3d(0,0,0)',
        }}
      ></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
          <div className="premium-pill mb-8 px-6 py-2">
            <div className={`h-2 w-2 rounded-full ${badgeToneClass} ${shouldReduceMotion ? '' : 'animate-pulse'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-white">{badgeLabel}</span>
          </div>

          <h2 id="stats-heading" className="mb-6 text-4xl font-black uppercase leading-none tracking-tightest text-white sm:text-6xl lg:text-7xl">
            {t('stats.title')} <span className="headline-accent headline-accent-solid">{t('stats.titleAccent')}</span>
          </h2>
          <p className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
            {t('stats.description')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`cinematic-glass mb-10 rounded-[2rem] border px-5 py-5 md:px-6 ${liveUnavailable ? 'border-amber-400/20 bg-amber-400/[0.03]' : 'border-white/10'
            }`}
          aria-live="polite"
        >
          <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${liveUnavailable ? 'border-amber-400/20 bg-amber-400/10' : 'border-white/10 bg-white/5'}`}>
              {liveUnavailable ? (
                <AlertTriangle className="h-5 w-5 text-amber-300" />
              ) : loading ? (
                <RefreshCw className={`h-5 w-5 text-cyan-300 ${shouldReduceMotion ? '' : 'animate-spin'}`} />
              ) : (
                <Radio className="h-5 w-5 text-emerald-300" />
              )}
            </div>

            <div className="grid gap-1">
              <p className="text-[10px] font-black uppercase tracking-wide-readable text-slate-300">{sourceLabel}</p>
              {statusMessage ? <p className="text-sm font-semibold text-white md:text-base">{statusMessage}</p> : null}
              {fallbackDetail ? <p className="text-sm leading-relaxed text-slate-400">{fallbackDetail}</p> : null}
              {formattedLastUpdated ? (
                <time dateTime={lastUpdated} className="text-xs text-slate-500">
                  {formattedLastUpdated}
                </time>
              ) : null}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCardsData.map((stat, index) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} sub={stat.sub} index={index} loading={loading} />
          ))}
        </div>
      </div>
    </section>
  );
}
