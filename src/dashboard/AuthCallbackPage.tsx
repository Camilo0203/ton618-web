import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, Bot, CheckCircle2, Loader2 } from 'lucide-react';
import { config } from '../config';
import { exchangeDashboardCodeForSession, syncDiscordGuilds } from './api';
import { dashboardQueryKeys } from './constants';

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

  useEffect(() => {
    const attemptKey = authError ? `error:${authError}` : code ? `code:${code}` : 'missing-code';
    if (processedAttemptRef.current === attemptKey) {
      return undefined;
    }

    processedAttemptRef.current = attemptKey;
    let isCancelled = false;

    async function completeAuthFlow() {
      if (authError) {
        throw new Error(authError);
      }

      if (!code) {
        throw new Error('No llego ningun codigo OAuth a la ruta de callback.');
      }

      setStatusText('Intercambiando codigo por sesion segura...');
      const session = await exchangeDashboardCodeForSession(code);

      if (!session?.provider_token) {
        throw new Error('Discord no devolvio provider_token. Repite el login para sincronizar servidores.');
      }

      setStatusText('Sincronizando servidores administrables con Supabase...');
      const syncResult = await syncDiscordGuilds(session.provider_token);

      if (isCancelled) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.auth }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.guilds }),
      ]);

      const firstGuildId = syncResult.guilds[0]?.guildId;
      setStatusText('Listo. Redirigiendo al panel...');
      setIsCompleted(true);

      window.setTimeout(() => {
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
      setErrorMessage(message);
      processedAttemptRef.current = null;
    });

    return () => {
      isCancelled = true;
    };
  }, [authError, code, navigate, queryClient]);

  return (
    <main className="dashboard-shell flex min-h-screen items-center justify-center px-4 text-white">
      <Helmet>
        <title>{config.botName} | Auth Callback</title>
      </Helmet>
      <div className="dashboard-surface w-full max-w-xl p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#5865f2_0%,_#7c6af7_55%,_#14b8a6_100%)] shadow-[0_18px_45px_rgba(88,101,242,0.35)]">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <p className="dashboard-panel-label">Discord OAuth</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">Callback del dashboard</h1>
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
