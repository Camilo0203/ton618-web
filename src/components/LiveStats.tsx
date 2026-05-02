import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Server, Users, Zap, Clock, Radio, AlertTriangle, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BOT_STATS_STALE_AFTER_MINUTES, defaultBotStats, useBotStats } from '../hooks/useBotStats';
import { motion, useReducedMotion } from 'framer-motion';
import {
  cardStagger,
  instantReveal,
  motionDurations,
  motionEase,
  motionStagger,
  motionViewport,
  revealUp,
  sectionIntro,
  withDelay,
  withDuration,
} from '../lib/motion';

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

const StatCard = memo(function StatCard({ icon: Icon, label, value, sub, loading }: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const cardReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, motionDurations.base);
  const dividerReveal = shouldReduceMotion
    ? instantReveal
    : {
        hidden: { opacity: 0.55, scaleX: 0.72 },
        show: {
          opacity: 1,
          scaleX: 1,
          transition: {
            duration: motionDurations.fast,
            delay: motionStagger.tight,
            ease: motionEase,
          },
        },
        exit: {
          opacity: 0.55,
          scaleX: 0.72,
          transition: {
            duration: motionDurations.exit,
            ease: motionEase,
          },
        },
      };

  return (
    <motion.article variants={cardReveal} className="group ml-0">
      <div className="tech-card relative h-full overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60"></div>

        <div className="flex h-full flex-col items-center">
          <div className="premium-icon-tile mb-8 p-4">
            <Icon className="h-8 w-8 text-slate-200 transition-colors duration-300 group-hover:text-white" />
          </div>

          <div
            className={`mb-3 text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-tighter tabular-nums text-white transition-opacity duration-200 ${loading ? 'opacity-90' : 'opacity-100'}`}
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
              <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-400/70 motion-reduce:animate-none"></div>
            </div>
          ) : (
            <motion.div
              variants={dividerReveal}
              className="mt-10 h-px w-full origin-left bg-gradient-to-r from-transparent via-white/18 to-transparent"
            />
          )}
        </div>
      </div>
    </motion.article>
  );
});

StatCard.displayName = 'StatCard';

export default function LiveStats() {
  const { t, i18n } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const { stats, loading, refreshing, errorKind, lastUpdated, hasData, isStale, dataState } = useBotStats();
  const [animated, setAnimated] = useState<AnimatedStats>(defaultBotStats);
  const previousStatsRef = useRef<AnimatedStats>(defaultBotStats);
  const locale = i18n.resolvedLanguage || i18n.language || 'en';
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const sourceReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);
  const statsGridReveal = shouldReduceMotion ? instantReveal : cardStagger;

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
    const hasChanged =
      start.servers !== target.servers ||
      start.users !== target.users ||
      start.commands !== target.commands ||
      start.uptimePercentage !== target.uptimePercentage;

    if (!hasChanged) {
      setAnimated(target);
      previousStatsRef.current = target;
      return;
    }

    const durationMs = 850;
    const startTime = performance.now();

    let frameId: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 5);

      setAnimated({
        servers: Math.round(start.servers + (target.servers - start.servers) * easedProgress),
        users: Math.round(start.users + (target.users - start.users) * easedProgress),
        commands: Math.round(start.commands + (target.commands - start.commands) * easedProgress),
        uptimePercentage: Number((start.uptimePercentage + (target.uptimePercentage - start.uptimePercentage) * easedProgress).toFixed(2)),
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

  const badgeToneClass =
    dataState === 'live'
      ? 'bg-emerald-400'
      : dataState === 'refreshing'
        ? 'bg-cyan-300'
        : dataState === 'stale'
          ? 'bg-amber-300'
          : 'bg-slate-400';
  const badgeLabel =
    dataState === 'live'
      ? t('stats.badgeLive')
      : dataState === 'refreshing'
        ? t('stats.badgeRefreshing')
        : dataState === 'stale'
          ? t('stats.badgeStale')
          : t('stats.badgeUnavailable');
  const sourceToneClass =
    dataState === 'live'
      ? 'border-emerald-400/20 bg-emerald-400/[0.03]'
      : dataState === 'refreshing'
        ? 'border-cyan-300/20 bg-cyan-300/[0.03]'
        : dataState === 'stale'
          ? 'border-amber-400/20 bg-amber-400/[0.03]'
          : 'border-white/10 bg-white/[0.03]';
  const sourceIconToneClass =
    dataState === 'live'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
      : dataState === 'refreshing'
        ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-300'
        : dataState === 'stale'
          ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
          : 'border-white/10 bg-white/5 text-slate-300';
  const freshnessToneClass =
    dataState === 'live'
      ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
      : dataState === 'refreshing'
        ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'
        : dataState === 'stale'
          ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
          : 'border-white/10 bg-white/5 text-slate-300';
  const freshnessLabel =
    dataState === 'live'
      ? t('stats.freshness.live')
      : dataState === 'refreshing'
        ? t('stats.freshness.refreshing')
        : dataState === 'stale'
          ? t('stats.freshness.stale', { minutes: BOT_STATS_STALE_AFTER_MINUTES })
          : t('stats.freshness.unavailable');

  let statusMessage = '';
  let detailMessage = '';

  if (dataState === 'live') {
    statusMessage = t('stats.status.live');
  } else if (dataState === 'refreshing') {
    statusMessage = hasData ? t('stats.status.refreshingWithSnapshot') : t('stats.status.refreshing');
  } else if (dataState === 'stale') {
    statusMessage = t('stats.status.stale');
    detailMessage =
      errorKind === 'config'
        ? t('stats.status.staleFromConfig')
        : errorKind === 'network'
          ? t('stats.status.staleFromNetwork')
          : errorKind === 'query'
            ? t('stats.status.staleFromQuery')
            : isStale
              ? t('stats.status.staleByAge', { minutes: BOT_STATS_STALE_AFTER_MINUTES })
              : '';
  } else {
    statusMessage = t('stats.status.unavailable');
    detailMessage =
      errorKind === 'config'
        ? t('stats.status.unavailableFromConfig')
        : errorKind === 'network'
          ? t('stats.status.unavailableFromNetwork')
          : errorKind === 'query'
            ? t('stats.status.unavailableFromQuery')
            : '';
  }

  const showCardLoading = !hasData && (loading || refreshing);

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
        <motion.div
          variants={introReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="mb-14 text-center"
        >
          <div className="premium-pill mb-8 px-6 py-2">
            <div className={`h-2 w-2 rounded-full ${badgeToneClass} ${shouldReduceMotion ? '' : 'animate-pulse'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-white">{badgeLabel}</span>
          </div>

          <h2 id="stats-heading" className="mb-6 text-[clamp(2rem,5vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tightest text-white">
            {t('stats.title')} <span className="headline-accent headline-accent-solid">{t('stats.titleAccent')}</span>
          </h2>
          <p className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
            {t('stats.description')}
          </p>
        </motion.div>

        <motion.div
          variants={sourceReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className={`cinematic-glass mb-10 rounded-[2rem] border px-5 py-5 md:px-6 ${sourceToneClass}`}
          aria-live="polite"
        >
          <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${sourceIconToneClass}`}>
              {dataState === 'live' ? (
                <Radio className="h-5 w-5" />
              ) : dataState === 'refreshing' ? (
                <RefreshCw className={`h-5 w-5 ${shouldReduceMotion ? '' : 'animate-spin'}`} />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>

            <div className="grid gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-wide-readable text-slate-300">
                  {t('stats.source.label')}
                </p>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight-readable ${freshnessToneClass}`}>
                  {freshnessLabel}
                </span>
              </div>
              <p className="text-sm font-semibold text-white md:text-base">{t('stats.source.value')}</p>
              {statusMessage ? <p className="text-sm leading-relaxed text-slate-300">{statusMessage}</p> : null}
              {detailMessage ? <p className="text-sm leading-relaxed text-slate-400">{detailMessage}</p> : null}
              {formattedLastUpdated ? (
                <time dateTime={lastUpdated} className="text-xs text-slate-500">
                  {t('stats.timestamp', { value: formattedLastUpdated })}
                </time>
              ) : null}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={statsGridReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {statCardsData.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} sub={stat.sub} loading={showCardLoading} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
