import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface BotStats {
  servers: number;
  users: number;
  commands: number;
  uptimePercentage: number;
}

interface BotStatsRow {
  servers: number | null;
  users: number | null;
  commands_executed: number | null;
  uptime_percentage: number | null;
  updated_at: string | null;
}

export const defaultBotStats: BotStats = {
  servers: 0,
  users: 0,
  commands: 0,
  uptimePercentage: 0,
};

export type BotStatsErrorKind = 'none' | 'config' | 'network' | 'query';
export type BotStatsDataState = 'live' | 'refreshing' | 'stale' | 'unavailable';
export const BOT_STATS_STALE_AFTER_MS = 10 * 60 * 1000;
export const BOT_STATS_STALE_AFTER_MINUTES = BOT_STATS_STALE_AFTER_MS / 60000;

interface UseBotStatsResult {
  stats: BotStats;
  loading: boolean;
  refreshing: boolean;
  error: string;
  errorKind: BotStatsErrorKind;
  lastUpdated: string;
  hasData: boolean;
  isStale: boolean;
  dataState: BotStatsDataState;
}

function resolveStatsErrorKind(error: unknown): Exclude<BotStatsErrorKind, 'none' | 'config'> {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === 'string'
        ? error.toLowerCase()
        : '';

  return [
    'failed to fetch',
    'network',
    'fetch',
    'err_connection_closed',
    'load failed',
    'connection closed',
  ].some((token) => message.includes(token))
    ? 'network'
    : 'query';
}

function hasBotStatsData(stats: BotStats, lastUpdated: string): boolean {
  return (
    Boolean(lastUpdated) ||
    stats.servers > 0 ||
    stats.users > 0 ||
    stats.commands > 0 ||
    stats.uptimePercentage > 0
  );
}

function getStatsAgeMs(lastUpdated: string): number | null {
  if (!lastUpdated) {
    return null;
  }

  const parsedDate = new Date(lastUpdated);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return Math.max(0, Date.now() - parsedDate.getTime());
}

export function useBotStats(): UseBotStatsResult {
  const [stats, setStats] = useState<BotStats>(defaultBotStats);
  const [loading, setLoading] = useState<boolean>(Boolean(supabase));
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [errorKind, setErrorKind] = useState<BotStatsErrorKind>('none');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const initialFetchSettledRef = useRef(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setRefreshing(false);
      setError('Supabase not configured');
      setErrorKind('config');
      return undefined;
    }

    const client = supabase;
    let isMounted = true;
    let nextPollId: number | null = null;

    const scheduleNextPoll = (delayMs: number) => {
      if (!isMounted) {
        return;
      }

      nextPollId = window.setTimeout(() => {
        void fetchStats();
      }, delayMs);
    };

    const fetchStats = async () => {
      if (!isMounted) {
        return;
      }

      const isInitialFetch = !initialFetchSettledRef.current;
      if (isInitialFetch) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError('');
      setErrorKind('none');

      try {
        const { data, error: queryError } = await client
          .from('bot_stats')
          .select('servers, users, commands_executed, uptime_percentage, updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle<BotStatsRow>();

        if (!isMounted) {
          return;
        }

        if (queryError || !data) {
          setError('Live stats unavailable');
          setErrorKind(queryError ? resolveStatsErrorKind(queryError) : 'query');
          setLoading(false);
          setRefreshing(false);
          initialFetchSettledRef.current = true;
          scheduleNextPoll(120000);
          return;
        }

        setStats({
          servers: data.servers ?? defaultBotStats.servers,
          users: data.users ?? defaultBotStats.users,
          commands: data.commands_executed ?? defaultBotStats.commands,
          uptimePercentage: data.uptime_percentage ?? defaultBotStats.uptimePercentage,
        });
        setLastUpdated(data.updated_at ?? '');
        setError('');
        setErrorKind('none');
        setLoading(false);
        setRefreshing(false);
        initialFetchSettledRef.current = true;
        scheduleNextPoll(30000);
      } catch (fetchError: unknown) {
        if (!isMounted) {
          return;
        }

        setError('Live stats unavailable');
        setErrorKind(resolveStatsErrorKind(fetchError));
        setLoading(false);
        setRefreshing(false);
        initialFetchSettledRef.current = true;
        scheduleNextPoll(180000);
      }
    };

    void fetchStats();

    return () => {
      isMounted = false;
      if (nextPollId !== null) {
        window.clearTimeout(nextPollId);
      }
    };
  }, []);

  const hasData = hasBotStatsData(stats, lastUpdated);
  const isStale = hasData && (Boolean(error) || (getStatsAgeMs(lastUpdated) ?? 0) > BOT_STATS_STALE_AFTER_MS);
  const dataState: BotStatsDataState =
    loading || refreshing ? 'refreshing' : hasData ? (isStale ? 'stale' : 'live') : 'unavailable';

  return { stats, loading, refreshing, error, errorKind, lastUpdated, hasData, isStale, dataState };
}
