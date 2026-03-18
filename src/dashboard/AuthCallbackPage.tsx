import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, ArrowRight, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { config } from '../config';
import {
  consumeDashboardAuthIntent,
  exchangeDashboardCodeForSession,
  resolveDashboardRedirectPath,
  signInWithDiscord,
  syncDiscordGuilds,
} from './api';
import { dashboardQueryKeys } from './constants';
import Logo from '../components/Logo';

const CALLBACK_REDIRECT_DELAY_MS = 700;

type CallbackPhase = 'exchanging' | 'syncing' | 'redirecting' | 'error';

interface CallbackViewState {
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

function normalizeAuthError(value: string | null): string {
  if (!value) {
    return '';
  }

  const decoded = value.replace(/\+/g, ' ').trim();
  return decoded || value;
}

function createInitialState(): CallbackViewState {
  return {
    phase: 'exchanging',
    statusText: 'Preparando autenticacion con Discord...',
    errorMessage: '',
    isCompleted: false,
    canRetrySync: false,
    canRestartLogin: false,
    redirectPath: null,
  };
}

function getOrCreateExecution(attemptKey: string): CallbackExecution {
  const current = callbackExecutions.get(attemptKey);
  if (current) {
    return current;
  }

  const requestedGuildId = consumeDashboardAuthIntent().requestedGuildId;
  const execution: CallbackExecution = {
    promise: null,
    session: null,
    requestedGuildId,
    state: createInitialState(),
  };
  callbackExecutions.set(attemptKey, execution);
  return execution;
}

function subscribeToExecution(attemptKey: string, listener: (state: CallbackViewState) => void) {
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

function updateExecutionState(attemptKey: string, patch: Partial<CallbackViewState>) {
  const execution = getOrCreateExecution(attemptKey);
  execution.state = {
    ...execution.state,
    ...patch,
  };
  emitExecutionState(attemptKey);
}

function buildRedirectPath(execution: CallbackExecution, availableGuildIds: string[]): string {
  const preferredGuildId = execution.requestedGuildId;
  if (preferredGuildId && availableGuildIds.includes(preferredGuildId)) {
    return resolveDashboardRedirectPath(preferredGuildId);
  }

  return resolveDashboardRedirectPath(availableGuildIds[0] ?? null);
}

async function invalidateDashboardQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  redirectGuildId: string | null,
) {
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
  const canRetrySync = Boolean(execution.session?.provider_token);
  const canRestartLogin =
    lowerMessage.includes('provider_token')
    || lowerMessage.includes('oauth')
    || lowerMessage.includes('codigo')
    || !canRetrySync;

  return {
    canRetrySync,
    canRestartLogin,
  };
}

function runAuthCallbackFlow(
  attemptKey: string,
  code: string | null,
  authError: string | null,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<string> {
  const execution = getOrCreateExecution(attemptKey);
  if (execution.state.isCompleted && execution.state.redirectPath) {
    return Promise.resolve(execution.state.redirectPath);
  }

  if (execution.promise) {
    return execution.promise;
  }

  execution.promise = (async () => {
    console.log('[dashboard-auth] callback:begin', {
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

    if (!code && !execution.session) {
      throw new Error('No llego ningun codigo OAuth a la ruta de callback. Vuelve a iniciar sesion desde el dashboard.');
    }

    if (!execution.session) {
      updateExecutionState(attemptKey, {
        phase: 'exchanging',
        statusText: 'Intercambiando codigo por sesion segura...',
        errorMessage: '',
        canRetrySync: false,
        canRestartLogin: false,
      });

      const session = await exchangeDashboardCodeForSession(code ?? '');
      execution.session = session;

      console.log('[dashboard-auth] callback:exchange:done', {
        attemptKey,
        hasSession: Boolean(session),
        hasProviderToken: Boolean(session?.provider_token),
        userId: session?.user?.id ?? null,
      });
    } else {
      console.log('[dashboard-auth] callback:exchange:reuse-session', {
        attemptKey,
        hasProviderToken: Boolean(execution.session.provider_token),
        userId: execution.session.user?.id ?? null,
      });
    }

    if (!execution.session?.provider_token) {
      throw new Error('Discord no devolvio provider_token. Repite el login para sincronizar servidores.');
    }

    updateExecutionState(attemptKey, {
      phase: 'syncing',
      statusText: 'Sincronizando servidores administrables con Supabase...',
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

    updateExecutionState(attemptKey, {
      phase: 'redirecting',
      statusText: 'Listo. Redirigiendo al panel...',
      errorMessage: '',
      isCompleted: true,
      canRetrySync: false,
      canRestartLogin: false,
      redirectPath,
    });

    console.log('[dashboard-auth] callback:complete', {
      attemptKey,
      guildCount: syncResult.guilds.length,
      redirectGuildId,
      redirectPath,
    });

    return redirectPath;
  })().catch((error: unknown) => {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'No se pudo completar el callback del dashboard.';
    const retryFlags = resolveRetryFlags(message, execution);

    console.error('[dashboard-auth] callback:error', {
      attemptKey,
      message,
      hasCachedSession: Boolean(execution.session),
      hasProviderToken: Boolean(execution.session?.provider_token),
      requestedGuildId: execution.requestedGuildId,
      error,
    });

    updateExecutionState(attemptKey, {
      phase: 'error',
      statusText: 'El acceso seguro no pudo completarse.',
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

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [retryNonce, setRetryNonce] = useState(0);

  const authError = normalizeAuthError(
    searchParams.get('error_description') || searchParams.get('error'),
  );
  const code = searchParams.get('code');
  const attemptKey = useMemo(
    () => (authError ? `error:${authError}` : code ? `code:${code}` : 'missing-code'),
    [authError, code],
  );
  const [viewState, setViewState] = useState<CallbackViewState>(() => getOrCreateExecution(attemptKey).state);
  const dashboardBrandLabel = `${config.botName} Dashboard`;

  useEffect(() => {
    setViewState(getOrCreateExecution(attemptKey).state);
    return subscribeToExecution(attemptKey, setViewState);
  }, [attemptKey]);

  useEffect(() => {
    let redirectTimeout: number | null = null;

    void runAuthCallbackFlow(attemptKey, code, authError || null, queryClient)
      .then((redirectPath) => {
        redirectTimeout = window.setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, CALLBACK_REDIRECT_DELAY_MS);
      })
      .catch(() => undefined);

    return () => {
      if (redirectTimeout !== null) {
        window.clearTimeout(redirectTimeout);
      }
    };
  }, [attemptKey, authError, code, navigate, queryClient, retryNonce]);

  function handleRetrySync() {
    const execution = getOrCreateExecution(attemptKey);
    updateExecutionState(attemptKey, {
      phase: 'syncing',
      statusText: 'Reintentando sincronizacion de servidores...',
      errorMessage: '',
      canRetrySync: false,
      canRestartLogin: false,
    });
    execution.promise = null;
    setRetryNonce((current) => current + 1);
  }

  function handleRestartLogin() {
    const execution = getOrCreateExecution(attemptKey);
    console.log('[dashboard-auth] callback:restart-login', {
      attemptKey,
      requestedGuildId: execution.requestedGuildId,
    });
    void signInWithDiscord(execution.requestedGuildId).catch((error: unknown) => {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No se pudo reiniciar el login con Discord.';

      updateExecutionState(attemptKey, {
        phase: 'error',
        statusText: 'No se pudo reiniciar el login.',
        errorMessage: message,
        canRetrySync: false,
        canRestartLogin: true,
      });
    });
  }

  return (
    <main className="dashboard-shell flex min-h-screen items-center justify-center px-4 py-8 text-white sm:px-6">
      <Helmet>
        <title>{dashboardBrandLabel} | Auth</title>
      </Helmet>
      <div className="dashboard-surface relative w-full max-w-xl overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.12),transparent_28%)]" />
        <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-center">
          <Logo size="lg" subtitle={config.botName} />
          <div>
            <p className="dashboard-panel-label">Discord OAuth</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">Acceso a {dashboardBrandLabel}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
              Verificando la sesion segura y sincronizando acceso a servidores sin alterar tu configuracion actual.
            </p>
          </div>
        </div>

        {viewState.errorMessage ? (
          <div className="relative z-[1] mt-8 rounded-[1.75rem] border border-rose-200/70 bg-rose-50/90 p-5 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertOctagon className="mt-0.5 h-5 w-5" />
              <div className="w-full">
                <p className="font-semibold">No pudimos completar el acceso</p>
                <p className="mt-2 text-sm leading-relaxed text-current/80">{viewState.errorMessage}</p>
                <p className="mt-3 text-xs leading-6 text-current/70">
                  Revisa la consola del navegador para ver los logs de diagnostico bajo `dashboard-auth`.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {viewState.canRetrySync ? (
                    <button
                      type="button"
                      onClick={handleRetrySync}
                      className="inline-flex items-center gap-2 rounded-xl border border-current/20 px-4 py-2 text-sm font-semibold transition hover:bg-current/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reintentar sincronizacion
                    </button>
                  ) : null}
                  {viewState.canRestartLogin ? (
                    <button
                      type="button"
                      onClick={handleRestartLogin}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Iniciar sesion otra vez
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard', { replace: true })}
                    className="inline-flex items-center gap-2 rounded-xl border border-current/20 px-4 py-2 text-sm font-semibold transition hover:bg-current/10"
                  >
                    Volver al dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-[1] mt-8 rounded-[1.75rem] border border-emerald-200/70 bg-emerald-50/90 p-5 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200 sm:p-6">
            <div className="flex items-start gap-3">
              {viewState.isCompleted ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
              ) : (
                <Loader2 className="mt-0.5 h-5 w-5 animate-spin" />
              )}
              <div>
                <p className="font-semibold">
                  {viewState.phase === 'redirecting' ? 'Acceso confirmado' : 'Procesando acceso seguro'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-current/80">{viewState.statusText}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
