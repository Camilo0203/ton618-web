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
import type {
  ConfigMutationSectionId,
  GuildDashboardSnapshot,
  TicketDashboardActionId,
} from '../types';

function mergeOptimisticConfig(
  snapshot: GuildDashboardSnapshot | undefined,
  section: ConfigMutationSectionId,
  payload: unknown,
): GuildDashboardSnapshot | undefined {
  if (!snapshot) {
    return snapshot;
  }

  const config = snapshot.config;
  let nextConfig = config;

  switch (section) {
    case 'general': {
      const data = payload as {
        generalSettings?: typeof config.generalSettings;
        dashboardPreferences?: typeof config.dashboardPreferences;
      };
      nextConfig = {
        ...config,
        generalSettings: data.generalSettings ?? config.generalSettings,
        dashboardPreferences: data.dashboardPreferences ?? config.dashboardPreferences,
      };
      break;
    }
    case 'server_roles_channels':
      nextConfig = {
        ...config,
        serverRolesChannelsSettings: payload as typeof config.serverRolesChannelsSettings,
      };
      break;
    case 'tickets':
      nextConfig = {
        ...config,
        ticketsSettings: payload as typeof config.ticketsSettings,
      };
      break;
    case 'verification':
      nextConfig = {
        ...config,
        verificationSettings: payload as typeof config.verificationSettings,
      };
      break;
    case 'welcome':
      nextConfig = {
        ...config,
        welcomeSettings: payload as typeof config.welcomeSettings,
      };
      break;
    case 'suggestions':
      nextConfig = {
        ...config,
        suggestionSettings: payload as typeof config.suggestionSettings,
      };
      break;
    case 'modlogs':
      nextConfig = {
        ...config,
        modlogSettings: payload as typeof config.modlogSettings,
      };
      break;
    case 'commands':
      nextConfig = {
        ...config,
        commandSettings: payload as typeof config.commandSettings,
      };
      break;
    case 'system':
      nextConfig = {
        ...config,
        systemSettings: payload as typeof config.systemSettings,
      };
      break;
  }

  return {
    ...snapshot,
    config: nextConfig,
  };
}

function shouldRetryDashboardRequest(failureCount: number, error: unknown) {
  if (failureCount >= 3) {
    return false;
  }

  if (!(error instanceof Error)) {
    return failureCount < 2;
  }

  const normalizedMessage = error.message.toLowerCase();
  
  const nonRetryableErrors = [
    'unauthorized',
    'forbidden',
    'not found',
    '401',
    '403',
    '404',
    'invalid',
    'malformed',
  ];
  
  if (nonRetryableErrors.some((token) => normalizedMessage.includes(token))) {
    return false;
  }

  const retryableErrors = [
    'timeout',
    'tempor',
    'network',
    'fetch',
    'aborted',
    'econnreset',
    '429',
    '500',
    '502',
    '503',
    '504',
  ];
  
  return retryableErrors.some((token) => normalizedMessage.includes(token));
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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !guildId || !supabase) {
      return undefined;
    }

    const client = supabase;
    const channel = client.channel(`dashboard-realtime:${guildId}`);
    const realtimeTables = [
      'guild_config_mutations',
      'guild_sync_status',
      'guild_ticket_inbox',
      'guild_ticket_events',
      'guild_ticket_macros',
    ];

    realtimeTables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `guild_id=eq.${guildId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.snapshot(guildId) });
        },
      );
    });

    channel.subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [enabled, guildId, queryClient]);

  return useQuery({
    queryKey: dashboardQueryKeys.snapshot(guildId ?? 'idle'),
    queryFn: () => fetchGuildDashboardSnapshot(guildId ?? ''),
    enabled: enabled && Boolean(guildId),
    refetchOnWindowFocus: true,
    staleTime: 60_000,
    retry: shouldRetryDashboardRequest,
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return false;
      }

      const snapshot = query.state.data;
      const hasPendingMutation = snapshot?.mutations.some((mutation) => mutation.status === 'pending');
      const hasOpenTickets = snapshot?.ticketWorkspace.inbox.some((ticket) => ticket.isOpen);

      if (hasPendingMutation) {
        return 10_000;
      }

      if (hasOpenTickets) {
        return 30_000;
      }

      return 120_000;
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
    onMutate: async (variables) => {
      if (!guildId) {
        return { previousSnapshot: undefined };
      }

      const queryKey = dashboardQueryKeys.snapshot(guildId);
      await queryClient.cancelQueries({ queryKey });
      const previousSnapshot = queryClient.getQueryData<GuildDashboardSnapshot>(queryKey);

      queryClient.setQueryData<GuildDashboardSnapshot | undefined>(
        queryKey,
        (current) => mergeOptimisticConfig(current, variables.section, variables.payload),
      );

      return { previousSnapshot };
    },
    onError: (_error, _variables, context) => {
      if (!guildId) {
        return;
      }

      queryClient.setQueryData(dashboardQueryKeys.snapshot(guildId), context?.previousSnapshot);
    },
    onSuccess: async () => {
      if (!guildId) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.snapshot(guildId) });
    },
    onSettled: async () => {
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
