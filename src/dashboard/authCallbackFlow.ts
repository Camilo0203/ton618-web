import type { Session } from '@supabase/supabase-js';
import type { QueryClient } from '@tanstack/react-query';
import i18n from '../locales/i18n';
import {
  clearDashboardAuthState,
  clearDashboardAuthIntent,
  exchangeDashboardCodeForSession,
  getFreshDashboardSession,
  getDashboardSession,
  isInvalidJwtError,
  peekDashboardAuthIntent,
  resolveDashboardRedirectPath,
  signInWithDiscord,
  syncDiscordGuilds,
} from './api';
import { debugAuthLog } from './api/shared';
import { dashboardQueryKeys } from './constants';

export const CALLBACK_REDIRECT_DELAY_MS = 700;
const CALLBACK_EXECUTION_STORAGE_PREFIX = 'dashboard:auth-callback:';

export type CallbackPhase = 'exchanging' | 'syncing' | 'redirecting' | 'error';

export interface CallbackViewState {
  phase: CallbackPhase;
  statusText: string;
  errorMessage: string;
  isCompleted: boolean;
  canRetrySync: boolean;
  canRestartLogin: boolean;
  redirectPath: string | null;
}

interface CallbackExecution {
  promise: Promise<string> | null;
  session: Session | null;
  requestedGuildId: string | null;
  state: CallbackViewState;
}

const callbackExecutions = new Map<string, CallbackExecution>();
const callbackSubscribers = new Map<string, Set<(state: CallbackViewState) => void>>();

export function normalizeAuthError(value: string | null): string {
  if (!value) {
    return '';
  }

  try {
    const decoded = decodeURIComponent(value.replace(/\+/g, ' ')).trim();
    return decoded || value;
  } catch {
    const decoded = value.replace(/\+/g, ' ').trim();
    return decoded || value;
  }
}

function createInitialState(): CallbackViewState {
  return {
    phase: 'exchanging',
    statusText: i18n.t('dashboardAuth.state.preparing'),
    errorMessage: '',
    isCompleted: false,
    canRetrySync: false,
    canRestartLogin: false,
    redirectPath: null,
  };
}

function readExecutionStorage(attemptKey: string): CallbackExecution | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawExecution = window.sessionStorage.getItem(`${CALLBACK_EXECUTION_STORAGE_PREFIX}${attemptKey}`);
    if (!rawExecution) {
      return null;
    }

    const parsedExecution = JSON.parse(rawExecution) as {
      requestedGuildId?: unknown;
      state?: Partial<CallbackViewState>;
    };

    return {
      promise: null,
      session: null,
      requestedGuildId:
        typeof parsedExecution.requestedGuildId === 'string' && parsedExecution.requestedGuildId
          ? parsedExecution.requestedGuildId
          : null,
      state: {
        ...createInitialState(),
        ...parsedExecution.state,
      },
    };
  } catch {
    return null;
  }
}

export function persistExecutionStorage(attemptKey: string, execution: { requestedGuildId: string | null; state: CallbackViewState; session?: Session | null; promise?: Promise<string> | null }) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(
      `${CALLBACK_EXECUTION_STORAGE_PREFIX}${attemptKey}`,
      JSON.stringify({
        requestedGuildId: execution.requestedGuildId,
        state: execution.state,
      }),
    );
  } catch {
    // Ignoramos errores de storage para no romper el callback.
  }
}

export function getOrCreateExecution(attemptKey: string): CallbackExecution {
  const current = callbackExecutions.get(attemptKey);
  if (current) {
    return current;
  }

  const storedExecution = readExecutionStorage(attemptKey);
  const requestedGuildId = storedExecution?.requestedGuildId ?? peekDashboardAuthIntent().requestedGuildId;
  const execution: CallbackExecution = storedExecution ?? {
    promise: null,
    session: null,
    requestedGuildId,
    state: createInitialState(),
  };
  callbackExecutions.set(attemptKey, execution);
  persistExecutionStorage(attemptKey, execution);
  return execution;
}

export function subscribeToExecution(attemptKey: string, listener: (state: CallbackViewState) => void) {
  const listeners = callbackSubscribers.get(attemptKey) ?? new Set<(state: CallbackViewState) => void>();
  listeners.add(listener);
  callbackSubscribers.set(attemptKey, listeners);

  return () => {
    const currentListeners = callbackSubscribers.get(attemptKey);
    if (!currentListeners) {
      return;
    }

    currentListeners.delete(listener);
    if (!currentListeners.size) {
      callbackSubscribers.delete(attemptKey);
    }
  };
}

function emitExecutionState(attemptKey: string) {
  const execution = callbackExecutions.get(attemptKey);
  if (!execution) {
    return;
  }

  const listeners = callbackSubscribers.get(attemptKey);
  if (!listeners?.size) {
    return;
  }

  for (const listener of listeners) {
    listener(execution.state);
  }
}

export function updateExecutionState(attemptKey: string, patch: Partial<CallbackViewState>) {
  const execution = getOrCreateExecution(attemptKey);
  execution.state = {
    ...execution.state,
    ...patch,
  };
  persistExecutionStorage(attemptKey, execution);
  emitExecutionState(attemptKey);
}

async function recoverExistingSession() {
  const authState = await getFreshDashboardSession();
  return authState.session;
}

async function resolveFreshSessionAfterExchange(code: string | null) {
  let exchangeError: unknown = null;

  if (code) {
    try {
      await exchangeDashboardCodeForSession(code);
    } catch (error: unknown) {
      exchangeError = error;
    }
  }

  let authState: Awaited<ReturnType<typeof getDashboardSession>> | null = null;
  let sessionError: unknown = null;

  try {
    authState = await getFreshDashboardSession();
  } catch (error: unknown) {
    sessionError = error;
  }

  if (authState?.session) {
    return authState.session;
  }

  if (sessionError) {
    throw sessionError;
  }

  if (exchangeError) {
    throw exchangeError;
  }

  return null;
}

function buildRedirectPath(execution: CallbackExecution, availableGuildIds: string[]): string {
  const preferredGuildId = execution.requestedGuildId;
  if (preferredGuildId && availableGuildIds.includes(preferredGuildId)) {
    return resolveDashboardRedirectPath(preferredGuildId);
  }

  return resolveDashboardRedirectPath(availableGuildIds[0] ?? null);
}

async function invalidateDashboardQueries(queryClient: QueryClient, redirectGuildId: string | null) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.auth }),
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.guilds }),
    redirectGuildId
      ? queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.snapshot(redirectGuildId) })
      : Promise.resolve(),
    queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  ]);

  queryClient.removeQueries({ queryKey: ['dashboard', 'snapshot'] });
}

function resolveRetryFlags(errorMessage: string, execution: CallbackExecution) {
  const lowerMessage = errorMessage.toLowerCase();
  if (
    lowerMessage.includes('invalid jwt')
    || lowerMessage.includes('sesion del dashboard es invalida')
    || lowerMessage.includes('dashboard session is invalid')
    || lowerMessage.includes('expired')
  ) {
    return {
      canRetrySync: false,
      canRestartLogin: true,
    };
  }

  const canRetrySync =
    Boolean(execution.session?.provider_token)
    && !lowerMessage.includes('codigo')
    && !lowerMessage.includes('code')
    && !lowerMessage.includes('oauth')
    && !lowerMessage.includes('provider_token');
  const canRestartLogin =
    lowerMessage.includes('provider_token')
    || lowerMessage.includes('oauth')
    || lowerMessage.includes('codigo')
    || lowerMessage.includes('code')
    || !canRetrySync;

  return {
    canRetrySync,
    canRestartLogin,
  };
}

export function runAuthCallbackFlow(
  attemptKey: string,
  code: string | null,
  authError: string | null,
  queryClient: QueryClient,
): Promise<string> {
  const execution = getOrCreateExecution(attemptKey);
  if (execution.state.isCompleted && execution.state.redirectPath) {
    return Promise.resolve(execution.state.redirectPath);
  }

  if (execution.promise) {
    return execution.promise;
  }

  execution.promise = (async () => {
    debugAuthLog('callback:begin', {
      attemptKey,
      hasCode: Boolean(code),
      hasAuthError: Boolean(authError),
      callbackPath: window.location.pathname,
      callbackSearch: window.location.search,
      requestedGuildId: execution.requestedGuildId,
      hasCachedSession: Boolean(execution.session),
    });

    if (authError) {
      throw new Error(authError);
    }

    if (!execution.session) {
      updateExecutionState(attemptKey, {
        phase: 'exchanging',
        statusText: i18n.t('dashboardAuth.state.exchanging'),
        errorMessage: '',
        canRetrySync: false,
        canRestartLogin: false,
      });

      const session = code
        ? await resolveFreshSessionAfterExchange(code)
        : await recoverExistingSession();

      if (!session) {
        await clearDashboardAuthState();
        throw new Error(i18n.t('dashboardAuth.errors.missingSessionAfterCallback'));
      }

      execution.session = session;
      persistExecutionStorage(attemptKey, execution);
    }

    if (!execution.session?.provider_token) {
      throw new Error(i18n.t('dashboardAuth.errors.missingProviderToken'));
    }

    updateExecutionState(attemptKey, {
      phase: 'syncing',
      statusText: i18n.t('dashboardAuth.state.syncing'),
      errorMessage: '',
      canRetrySync: false,
      canRestartLogin: false,
    });

    const syncResult = await syncDiscordGuilds(execution.session.provider_token);
    const redirectGuildId =
      execution.requestedGuildId && syncResult.guilds.some((guild) => guild.guildId === execution.requestedGuildId)
        ? execution.requestedGuildId
        : syncResult.guilds[0]?.guildId ?? null;

    await invalidateDashboardQueries(queryClient, redirectGuildId);

    const redirectPath = buildRedirectPath(
      execution,
      syncResult.guilds.map((guild) => guild.guildId),
    );
    clearDashboardAuthIntent();

    updateExecutionState(attemptKey, {
      phase: 'redirecting',
      statusText: syncResult.guilds.length
        ? i18n.t('dashboardAuth.state.redirectingWithGuilds')
        : i18n.t('dashboardAuth.state.redirectingWithoutGuilds'),
      errorMessage: '',
      isCompleted: true,
      canRetrySync: false,
      canRestartLogin: false,
      redirectPath,
    });

    return redirectPath;
  })().catch((error: unknown) => {
    const shouldResetAuth = isInvalidJwtError(error);
    const message =
      shouldResetAuth
        ? i18n.t('dashboardAuth.errors.invalidSession')
        : error instanceof Error && error.message
          ? error.message
          : i18n.t('dashboardAuth.errors.callbackFailed');
    const retryFlags = resolveRetryFlags(message, execution);

    debugAuthLog('callback:error', {
      attemptKey,
      message,
      hasCachedSession: Boolean(execution.session),
      hasProviderToken: Boolean(execution.session?.provider_token),
      requestedGuildId: execution.requestedGuildId,
      error,
    }, 'error');

    if (shouldResetAuth) {
      void clearDashboardAuthState();
      execution.session = null;
      clearDashboardAuthIntent();
      persistExecutionStorage(attemptKey, execution);
    }

    updateExecutionState(attemptKey, {
      phase: 'error',
      statusText: i18n.t('dashboardAuth.state.secureAccessFailed'),
      errorMessage: message,
      isCompleted: false,
      canRetrySync: retryFlags.canRetrySync,
      canRestartLogin: retryFlags.canRestartLogin,
      redirectPath: null,
    });

    throw error;
  }).finally(() => {
    const currentExecution = callbackExecutions.get(attemptKey);
    if (currentExecution) {
      currentExecution.promise = null;
    }
  });

  return execution.promise;
}

export function restartAuthCallbackFlow(attemptKey: string) {
  const execution = getOrCreateExecution(attemptKey);
  updateExecutionState(attemptKey, {
    phase: 'syncing',
    statusText: i18n.t('dashboardAuth.state.retryingSync'),
    errorMessage: '',
    canRetrySync: false,
    canRestartLogin: false,
  });
  execution.promise = null;
  persistExecutionStorage(attemptKey, execution);
}

export async function restartDiscordLogin(attemptKey: string) {
  const execution = getOrCreateExecution(attemptKey);
  execution.promise = null;
  execution.session = null;
  persistExecutionStorage(attemptKey, execution);

  await clearDashboardAuthState();
  return signInWithDiscord(execution.requestedGuildId);
}
