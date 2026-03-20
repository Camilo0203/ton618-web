import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import {
  fetchDashboardGuilds,
  fetchGuildDashboardSnapshot,
  getDashboardSession,
  requestGuildBackupAction,
  requestGuildConfigChange,
  requestTicketDashboardAction,
  signInWithDiscord,
  signOutDashboard,
  syncDiscordGuilds,
} from '../api';
import { dashboardQueryKeys } from '../constants';
import type { ConfigMutationSectionId, TicketDashboardActionId } from '../types';

function shouldRetryDashboardRequest(failureCount: number, error: unknown) {
  if (failureCount >= 2) {
    return false;
  }

  if (!(error instanceof Error)) {
    return failureCount < 1;
  }

  const normalizedMessage = error.message.toLowerCase();
  return [
    'timeout',
    'tempor',
    'network',
    'fetch',
    '429',
    '500',
    '502',
    '503',
    '504',
  ].some((token) => normalizedMessage.includes(token));
}

export function useDashboardAuth() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: dashboardQueryKeys.auth,
    queryFn: getDashboardSession,
    staleTime: 30_000,
    retry: shouldRetryDashboardRequest,
  });
}

export function useDashboardGuilds(enabled: boolean) {
  return useQuery({
    queryKey: dashboardQueryKeys.guilds,
    queryFn: fetchDashboardGuilds,
    enabled,
    staleTime: 30_000,
    retry: shouldRetryDashboardRequest,
  });
}

export function useGuildDashboardSnapshot(guildId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: dashboardQueryKeys.snapshot(guildId ?? 'idle'),
    queryFn: () => fetchGuildDashboardSnapshot(guildId ?? ''),
    enabled: enabled && Boolean(guildId),
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    retry: shouldRetryDashboardRequest,
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return false;
      }

      const snapshot = query.state.data;
      const hasPendingMutation = snapshot?.mutations.some((mutation) => mutation.status === 'pending');
      const hasOpenTickets = snapshot?.ticketWorkspace.inbox.some((ticket) => ticket.isOpen);
      const hasTicketHistory = (snapshot?.ticketWorkspace.inbox.length ?? 0) > 0;

      if (hasPendingMutation) {
        return 5_000;
      }

      if (hasOpenTickets) {
        return 10_000;
      }

      if (hasTicketHistory) {
        return 20_000;
      }

      return 30_000;
    },
  });
}

export function useSignInWithDiscord() {
  return useMutation({
    mutationFn: signInWithDiscord,
  });
}

export function useSignOutDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOutDashboard,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.removeQueries({ queryKey: ['dashboard', 'snapshot'] });
    },
  });
}

export function useSyncDashboardGuilds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncDiscordGuilds,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.auth }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.guilds }),
      ]);
      queryClient.removeQueries({ queryKey: ['dashboard', 'snapshot'] });
    },
  });
}

export function useRequestGuildConfigChange(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { section: ConfigMutationSectionId; payload: unknown }) =>
      requestGuildConfigChange(guildId ?? '', payload.section, payload.payload),
    onSuccess: async () => {
      if (!guildId) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.snapshot(guildId) });
    },
  });
}

export function useRequestGuildBackupAction(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      action: 'create_backup' | 'restore_backup';
      payload: Record<string, unknown>;
    }) => requestGuildBackupAction(guildId ?? '', payload.action, payload.payload),
    onSuccess: async () => {
      if (!guildId) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.snapshot(guildId) });
    },
  });
}

export function useRequestTicketDashboardAction(guildId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { action: TicketDashboardActionId; payload: Record<string, unknown> }) =>
      requestTicketDashboardAction(guildId ?? '', payload.action, payload.payload),
    onSuccess: async () => {
      if (!guildId) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.snapshot(guildId) });
    },
  });
}
