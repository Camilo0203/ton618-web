import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, ArrowRight, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { config } from '../config';
import Logo from '../components/Logo';
import {
  CALLBACK_REDIRECT_DELAY_MS,
  type CallbackViewState,
  getOrCreateExecution,
  normalizeAuthError,
  restartAuthCallbackFlow,
  restartDiscordLogin,
  runAuthCallbackFlow,
  subscribeToExecution,
  updateExecutionState,
} from './authCallbackFlow';
import { useDashboardDarkMode } from './hooks/useDashboardDarkMode';

export default function AuthCallbackPage() {
  useDashboardDarkMode();
  const { t } = useTranslation();
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
    restartAuthCallbackFlow(attemptKey);
    setRetryNonce((current) => current + 1);
  }

  function handleRestartLogin() {
    void restartDiscordLogin(attemptKey).catch((error: unknown) => {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('dashboardAuth.errors.restartLoginAction');

      updateExecutionState(attemptKey, {
        phase: 'error',
        statusText: t('dashboardAuth.errors.restartLoginFailed'),
        errorMessage: message,
        canRetrySync: false,
        canRestartLogin: true,
      });
    });
  }

  return (
    <main className="dashboard-shell flex min-h-screen items-center justify-center px-4 py-8 text-white sm:px-6">
      <Helmet>
        <title>{dashboardBrandLabel} | {t('dashboardAuth.pageTitle')}</title>
      </Helmet>
      <div className="dashboard-surface relative w-full max-w-xl overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.12),transparent_28%)]" />
        <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-center">
          <Logo size="lg" subtitle={config.botName} />
          <div>
            <p className="dashboard-panel-label">{t('dashboardAuth.oauthLabel')}</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-white">{t('dashboardAuth.pageHeading', { name: dashboardBrandLabel })}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {t('dashboardAuth.pageDescription')}
            </p>
          </div>
        </div>

        {viewState.errorMessage ? (
          <div className="dashboard-inline-notice-danger relative z-[1] mt-8 rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertOctagon className="mt-0.5 h-5 w-5" />
              <div className="w-full">
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">{t('dashboardAuth.errorEyebrow')}</p>
                <p className="mt-2 text-lg font-semibold">{t('dashboardAuth.errorTitle')}</p>
                <p className="mt-2 text-sm leading-relaxed text-current/80">{viewState.errorMessage}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {viewState.canRetrySync ? (
                    <button type="button" onClick={handleRetrySync} className="dashboard-primary-button">
                      <RotateCcw className="h-4 w-4" />
                      {t('dashboardAuth.retrySync')}
                    </button>
                  ) : null}
                  {viewState.canRestartLogin ? (
                    <button type="button" onClick={handleRestartLogin} className="dashboard-secondary-button">
                      {t('dashboardAuth.restartLogin')}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-header-info-card relative z-[1] mt-8 rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              {viewState.isCompleted ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
              ) : (
                <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-brand-500" />
              )}
              <div className="w-full">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {viewState.phase === 'redirecting' ? t('dashboardAuth.successEyebrowRedirecting') : t('dashboardAuth.successEyebrowLoading')}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{viewState.statusText}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {viewState.phase === 'syncing'
                    ? t('dashboardAuth.syncingDescription')
                    : t('dashboardAuth.holdingContextDescription')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
