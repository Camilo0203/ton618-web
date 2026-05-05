import type { Session } from '@supabase/supabase-js';
import { getAuthCallbackUrl } from '../../config';
import i18n from '../../locales/i18n';
import { clearSupabaseAuthStorage } from '../../lib/supabaseClient';
import { dashboardSyncResultSchema } from '../schemas';
import type { DashboardSessionState, DashboardSyncResult } from '../types';
import {
  createDashboardError,
  getSupabaseClient,
  GUILD_SYNC_TIMEOUT_MS,
  OAUTH_EXCHANGE_TIMEOUT_MS,
  persistDashboardAuthIntent,
  runQueryWithTimeout,
  withTimeout,
  debugAuthLog,
} from './shared';

export function isInvalidJwtError(error: unknown): boolean {
  return createDashboardError('auth.jwt', error, 'Invalid JWT').message.toLowerCase().includes('invalid jwt');
}

export async function clearDashboardAuthState(): Promise<void> {
  if (!supabaseAuthConfigured()) {
    clearSupabaseAuthStorage();
    return;
  }

  const client = getSupabaseClient();

  try {
    await client.auth.signOut({ scope: 'local' });
  } catch {
    // Continuamos con limpieza local manual aunque Supabase no responda.
  }

  clearSupabaseAuthStorage();
}

function supabaseAuthConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export async function getDashboardSession(): Promise<DashboardSessionState> {
  debugAuthLog('getDashboardSession:start', {
    supabaseAuthConfigured: supabaseAuthConfigured(),
  });

  if (!supabaseAuthConfigured()) {
    debugAuthLog('getDashboardSession:disabled', {
      sessionExists: false,
      userExists: false,
    });
    return {
      session: null,
      user: null,
    };
  }

  const client = getSupabaseClient();
  const [{ data: sessionData, error: sessionError }, { data: userData, error: userError }] =
    await runQueryWithTimeout(
      'auth.session',
      Promise.all([client.auth.getSession(), client.auth.getUser()]),
    );

  const isSessionMissingError = (error: unknown): boolean => {
    if (!error) return false;
    const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
    return msg.includes('auth session missing') || msg.includes('session missing');
  };

  if (sessionError) {
    if (isSessionMissingError(sessionError)) {
      debugAuthLog('getDashboardSession:unauthenticated', {
        stage: 'session',
        reason: 'no_active_session',
      });
      return { session: null, user: null };
    }
    debugAuthLog('getDashboardSession:error', {
      stage: 'session',
      message: createDashboardError(
        'auth.session',
        sessionError,
        i18n.t('dashboardAuth.errors.sessionValidationFailed'),
      ).message,
      error: sessionError,
    }, 'error');
    throw createDashboardError(
      'auth.session',
      sessionError,
      i18n.t('dashboardAuth.errors.sessionValidationFailed'),
    );
  }

  if (userError) {
    if (isSessionMissingError(userError)) {
      debugAuthLog('getDashboardSession:unauthenticated', {
        stage: 'user',
        reason: 'no_active_session',
      });
      return { session: null, user: null };
    }
    debugAuthLog('getDashboardSession:error', {
      stage: 'user',
      message: createDashboardError(
        'auth.user',
        userError,
        i18n.t('dashboardAuth.errors.userLoadFailed'),
      ).message,
      error: userError,
    }, 'error');
    throw createDashboardError(
      'auth.user',
      userError,
      i18n.t('dashboardAuth.errors.userLoadFailed'),
    );
  }

  if (!sessionData.session) {
    return { session: null, user: null };
  }

  debugAuthLog('getDashboardSession:success', {
    sessionExists: Boolean(sessionData.session),
    userExists: Boolean(userData.user),
    hasAccessToken: Boolean(sessionData.session?.access_token),
    expiresAt: sessionData.session?.expires_at ?? null,
    userId: userData.user?.id ?? sessionData.session?.user?.id ?? null,
  });

  return {
    session: sessionData.session,
    user: userData.user,
  };
}

export async function signInWithDiscord(requestedGuildId?: string | null): Promise<void> {
  const client = getSupabaseClient();
  persistDashboardAuthIntent(requestedGuildId);

  debugAuthLog('signInWithDiscord:start', {
    redirectTo: getAuthCallbackUrl(),
    requestedGuildId: requestedGuildId ?? null,
  });

  const { error } = await client.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: getAuthCallbackUrl(),
      scopes: 'identify guilds guilds.members.read',
    },
  });

  if (error) {
    throw createDashboardError(
      'auth.oauth.start',
      error,
      i18n.t('dashboardAuth.errors.startLoginFailed'),
    );
  }
}

export async function signOutDashboard(): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await runQueryWithTimeout('auth.signout', client.auth.signOut());

  if (error) {
    throw createDashboardError(
      'auth.signout',
      error,
      i18n.t('dashboardAuth.errors.signOutFailed'),
    );
  }
}

export async function exchangeDashboardCodeForSession(code: string): Promise<Session | null> {
  const startedAt = Date.now();
  const client = getSupabaseClient();

  if (!code.trim()) {
    throw new Error(i18n.t('dashboardAuth.errors.missingOauthCode'));
  }

  debugAuthLog('exchangeDashboardCodeForSession:start', {
    startedAt: new Date(startedAt).toISOString(),
    codeLength: code.length,
  });

  try {
    const { data, error } = await withTimeout(
      client.auth.exchangeCodeForSession(code),
      OAUTH_EXCHANGE_TIMEOUT_MS,
      i18n.t('dashboardAuth.errors.exchangeTimeout', { seconds: OAUTH_EXCHANGE_TIMEOUT_MS / 1000 }),
    );

    if (error) {
      throw error;
    }

    debugAuthLog('exchangeDashboardCodeForSession:success', {
      durationMs: Date.now() - startedAt,
      sessionExists: Boolean(data.session),
      userExists: Boolean(data.user ?? data.session?.user),
      hasAccessToken: Boolean(data.session?.access_token),
      expiresAt: data.session?.expires_at ?? null,
      userId: data.user?.id ?? data.session?.user?.id ?? null,
    });

    return data.session;
  } catch (error: unknown) {
    const dashboardError = createDashboardError(
      'auth.oauth.exchange',
      error,
      i18n.t('dashboardAuth.errors.exchangeFailed'),
    );
    debugAuthLog('exchangeDashboardCodeForSession:error', {
      durationMs: Date.now() - startedAt,
      message: dashboardError.message,
      error,
    }, 'error');
    throw dashboardError;
  }
}

export async function getFreshDashboardSession(): Promise<DashboardSessionState> {
  debugAuthLog('getFreshDashboardSession:start');

  try {
    const sessionState = await getDashboardSession();
    debugAuthLog('getFreshDashboardSession:success', {
      sessionExists: Boolean(sessionState.session),
      userExists: Boolean(sessionState.user),
      hasAccessToken: Boolean(sessionState.session?.access_token),
      expiresAt: sessionState.session?.expires_at ?? null,
      userId: sessionState.user?.id ?? sessionState.session?.user?.id ?? null,
    });
    return sessionState;
  } catch (error: unknown) {
    if (isInvalidJwtError(error)) {
      const invalidSessionError = createDashboardError('auth.jwt', error, 'Invalid JWT');
      debugAuthLog('getFreshDashboardSession:invalid-session', {
        message: invalidSessionError.message,
        sessionExists: false,
        userExists: false,
        hasAccessToken: false,
        expiresAt: null,
        userId: null,
        error,
      }, 'error');
      await clearDashboardAuthState();
      throw invalidSessionError;
    }

    debugAuthLog('getFreshDashboardSession:error', {
      message: error instanceof Error ? error.message : String(error),
      error,
    }, 'error');
    throw error;
  }
}

export async function syncDiscordGuilds(providerToken: string): Promise<DashboardSyncResult> {
  const startedAt = Date.now();
  const client = getSupabaseClient();

  if (!providerToken.trim()) {
    throw new Error(i18n.t('dashboardAuth.errors.syncMissingToken'));
  }

  debugAuthLog('syncDiscordGuilds:start', {
    startedAt: new Date(startedAt).toISOString(),
    tokenLength: providerToken.length,
  });

  try {
    const { data, error } = await withTimeout(
      client.functions.invoke('sync-discord-guilds', {
        body: {
          providerToken,
        },
      }),
      GUILD_SYNC_TIMEOUT_MS,
      i18n.t('dashboardAuth.errors.syncTimeout', { seconds: GUILD_SYNC_TIMEOUT_MS / 1000 }),
    );

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(i18n.t('dashboardAuth.errors.syncEmptyResponse'));
    }

    const parsedResult = dashboardSyncResultSchema.parse(data);
    debugAuthLog('syncDiscordGuilds:success', {
      durationMs: Date.now() - startedAt,
      manageableCount: parsedResult.manageableCount,
      installedCount: parsedResult.installedCount,
    });

    return parsedResult;
  } catch (error: unknown) {
    const dashboardError = createDashboardError(
      'auth.guild-sync',
      error,
      i18n.t('dashboardAuth.errors.syncFailed'),
    );
    debugAuthLog('syncDiscordGuilds:error', {
      durationMs: Date.now() - startedAt,
      message: dashboardError.message,
      error,
    }, 'error');
    throw dashboardError;
  }
}
