import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, CheckCircle2, Loader2 } from 'lucide-react';
import { config } from '../config';
import { exchangeDashboardCodeForSession, syncDiscordGuilds } from './api';
import Logo from '../components/Logo';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusText, setStatusText] = useState('Preparando autenticacion con Discord...');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const processedAttemptRef = useRef<string | null>(null);

  const authError = searchParams.get('error_description') || searchParams.get('error');
  const code = searchParams.get('code');
  const dashboardBrandLabel = `${config.botName} Dashboard`;

  useEffect(() => {
    const attemptKey = authError ? `error:${authError}` : code ? `code:${code}` : 'missing-code';
    if (processedAttemptRef.current === attemptKey) {
      return undefined;
    }

    processedAttemptRef.current = attemptKey;
    let isCancelled = false;
    let redirectTimeout: number | null = null;

    async function completeAuthFlow() {
      console.log('[dashboard-auth] callback:begin', {
        attemptKey,
        hasCode: Boolean(code),
        hasAuthError: Boolean(authError),
        callbackPath: window.location.pathname,
        callbackSearch: window.location.search,
      });

      if (authError) {
        throw new Error(authError);
      }

      if (!code) {
        throw new Error('No llego ningun codigo OAuth a la ruta de callback.');
      }

      setStatusText('Intercambiando codigo por sesion segura...');
      console.log('[dashboard-auth] callback:exchange:start', { attemptKey });
      const session = await exchangeDashboardCodeForSession(code);
      console.log('[dashboard-auth] callback:exchange:done', {
        attemptKey,
        hasSession: Boolean(session),
        hasProviderToken: Boolean(session?.provider_token),
        userId: session?.user?.id ?? null,
      });

      if (!session?.provider_token) {
        throw new Error('Discord no devolvio provider_token. Repite el login para sincronizar servidores.');
      }

      setStatusText('Sincronizando servidores administrables con Supabase...');
      const syncResult = await syncDiscordGuilds(session.provider_token);

      if (isCancelled) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      const firstGuildId = syncResult.guilds[0]?.guildId;
      setStatusText('Listo. Redirigiendo al panel...');
      setIsCompleted(true);
      console.log('[dashboard-auth] callback:complete', {
        attemptKey,
        firstGuildId: firstGuildId ?? null,
      });

      redirectTimeout = window.setTimeout(() => {
        navigate(firstGuildId ? `/dashboard?guild=${encodeURIComponent(firstGuildId)}` : '/dashboard', {
          replace: true,
        });
      }, 500);
    }

    void completeAuthFlow().catch((error: unknown) => {
      if (isCancelled) {
        return;
      }

      const message = error instanceof Error ? error.message : 'No se pudo completar el callback.';
      console.error('[dashboard-auth] callback:error', {
        attemptKey,
        message,
        error,
      });
      setErrorMessage(message);
      processedAttemptRef.current = null;
    });

    return () => {
      isCancelled = true;
      if (redirectTimeout !== null) {
        window.clearTimeout(redirectTimeout);
      }
    };
  }, [authError, code, navigate, queryClient]);

  return (
    <main className="dashboard-shell flex min-h-screen items-center justify-center px-4 text-white">
      <Helmet>
        <title>{dashboardBrandLabel} | Auth</title>
      </Helmet>
      <div className="dashboard-surface w-full max-w-xl p-8">
        <div className="flex items-center gap-4">
          <Logo size="lg" subtitle={config.botName} />
          <div>
            <p className="dashboard-panel-label">Discord OAuth</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">Acceso a {dashboardBrandLabel}</h1>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-8 rounded-[1.75rem] border border-rose-200/70 bg-rose-50/90 p-6 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
            <div className="flex items-start gap-3">
              <AlertOctagon className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">No pudimos completar el acceso</p>
                <p className="mt-2 text-sm leading-relaxed text-current/80">{errorMessage}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-emerald-200/70 bg-emerald-50/90 p-6 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
            <div className="flex items-start gap-3">
              {isCompleted ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
              ) : (
                <Loader2 className="mt-0.5 h-5 w-5 animate-spin" />
              )}
              <div>
                <p className="font-semibold">Procesando acceso seguro</p>
                <p className="mt-2 text-sm leading-relaxed text-current/80">{statusText}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
