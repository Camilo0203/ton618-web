import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { dashboardQueryKeys } from '../constants';
import { fetchGuildDashboardSnapshot } from '../api';

export function usePrefetchSnapshot() {
  const queryClient = useQueryClient();

  const prefetchSnapshot = useCallback(
    (guildId: string | null) => {
      if (!guildId) return;

      const queryKey = dashboardQueryKeys.snapshot(guildId);

      // Only prefetch if not already in cache
      const existingData = queryClient.getQueryData(queryKey);
      if (existingData) return;

      // Prefetch with low priority
      queryClient
        .prefetchQuery({
          queryKey,
          queryFn: () => fetchGuildDashboardSnapshot(guildId),
          staleTime: 60_000,
          gcTime: 5 * 60_000,
        })
        .catch(() => {
          // Silently fail - this is just a prefetch optimization
        });
    },
    [queryClient]
  );

  return prefetchSnapshot;
}
