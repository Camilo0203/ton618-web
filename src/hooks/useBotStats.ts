import { useEffect, useState } from 'react';
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

interface UseBotStatsResult {
  stats: BotStats;
  loading: boolean;
  error: string;
  errorKind: BotStatsErrorKind;
  lastUpdated: string;
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

export function useBotStats(): UseBotStatsResult {
  const [stats, setStats] = useState<BotStats>(defaultBotStats);
  const [loading, setLoading] = useState<boolean>(Boolean(supabase));
  const [error, setError] = useState<string>('');
  const [errorKind, setErrorKind] = useState<BotStatsErrorKind>('none');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
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
        scheduleNextPoll(30000);
      } catch (fetchError: unknown) {
        if (!isMounted) {
          return;
        }

        setError('Live stats unavailable');
        setErrorKind(resolveStatsErrorKind(fetchError));
        setLoading(false);
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

  return { stats, loading, error, errorKind, lastUpdated };
}
