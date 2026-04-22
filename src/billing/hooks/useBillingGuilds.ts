// Hook to fetch and manage user's guilds with premium status
import { useState, useEffect } from 'react';
import { fetchBillingGuilds } from '../api';
import type { GuildSummary } from '../types';

interface UseBillingGuildsResult {
  guilds: GuildSummary[];
  loading: boolean;
  error: string | null;
  premiumCount: number;
  totalCount: number;
  refetch: () => Promise<void>;
}

export function useBillingGuilds(): UseBillingGuildsResult {
  const [guilds, setGuilds] = useState<GuildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [premiumCount, setPremiumCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchGuilds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchBillingGuilds();
      
      setGuilds(response.guilds);
      setPremiumCount(response.premium_count);
      setTotalCount(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load guilds';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuilds();
  }, []);

  return {
    guilds,
    loading,
    error,
    premiumCount,
    totalCount,
    refetch: fetchGuilds,
  };
}
