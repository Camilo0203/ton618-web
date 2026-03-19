import type { Session } from '@supabase/supabase-js';
import { getAuthCallbackUrl } from '../../config';
import i18n from '../../i18n';
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
  if (!supabaseAuthConfigured()) {
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

  if (sessionError) {
    throw createDashboardError(
      'auth.session',
      sessionError,
      i18n.t('dashboardAuth.errors.sessionValidationFailed'),
    );
  }

  if (userError) {
    throw createDashboardError(
      'auth.user',
      userError,
      i18n.t('dashboardAuth.errors.userLoadFailed'),
    );
  }

  return {
    session: sessionData.session,
    user: userData.user,
  };
}

export async function signInWithDiscord(requestedGuildId?: string | null): Promise<void> {
  const client = getSupabaseClient();
  persistDashboardAuthIntent(requestedGuildId);

  console.log('[dashboard-auth] signInWithDiscord:start', {
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

  console.log('[dashboard-auth] exchangeDashboardCodeForSession:start', {
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

    console.log('[dashboard-auth] exchangeDashboardCodeForSession:success', {
      durationMs: Date.now() - startedAt,
      hasSession: Boolean(data.session),
      userId: data.session?.user?.id ?? null,
    });

    return data.session;
  } catch (error: unknown) {
    const dashboardError = createDashboardError(
      'auth.oauth.exchange',
      error,
      i18n.t('dashboardAuth.errors.exchangeFailed'),
    );
    console.error('[dashboard-auth] exchangeDashboardCodeForSession:error', {
      durationMs: Date.now() - startedAt,
      message: dashboardError.message,
      error,
    });
    throw dashboardError;
  }
}

export async function getFreshDashboardSession(): Promise<DashboardSessionState> {
  try {
    return await getDashboardSession();
  } catch (error: unknown) {
    if (isInvalidJwtError(error)) {
      await clearDashboardAuthState();
      throw new Error(i18n.t('dashboardAuth.errors.invalidSession'));
    }

    throw error;
  }
}

export async function syncDiscordGuilds(providerToken: string): Promise<DashboardSyncResult> {
  const startedAt = Date.now();
  const client = getSupabaseClient();

  if (!providerToken.trim()) {
    throw new Error(i18n.t('dashboardAuth.errors.syncMissingToken'));
  }

  console.log('[dashboard-auth] syncDiscordGuilds:start', {
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
    console.log('[dashboard-auth] syncDiscordGuilds:success', {
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
    console.error('[dashboard-auth] syncDiscordGuilds:error', {
      durationMs: Date.now() - startedAt,
      message: dashboardError.message,
      error,
    });
    throw dashboardError;
  }
}
