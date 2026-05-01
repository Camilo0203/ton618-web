import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, ArrowRight, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { config } from '../config';
import DashboardAccessStage, {
  DashboardAccessStatusPill,
  type DashboardAccessProgressStep,
} from './components/DashboardAccessStage';
import {
  CALLBACK_REDIRECT_DELAY_MS,
  type CallbackPhase,
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
import { useMinimumDisplayState } from './hooks/useMinimumDisplayState';

const CALLBACK_STAGE_MIN_MS = 450;

function shouldDelayCallbackStage(phase: CallbackPhase) {
  return phase !== 'error';
}

function getCallbackProgressSteps(
  viewState: CallbackViewState,
  t: ReturnType<typeof useTranslation>['t'],
): DashboardAccessProgressStep[] {
  if (viewState.phase === 'error') {
    if (viewState.canRetrySync) {
      return [
        { label: t('dashboardAuth.accessStage.steps.secureSession'), state: 'complete' },
        { label: t('dashboardAuth.accessStage.steps.exchangeOauth'), state: 'complete' },
        { label: t('dashboardAuth.accessStage.steps.syncGuilds'), state: 'error' },
        { label: t('dashboardAuth.accessStage.steps.redirect'), state: 'pending' },
      ];
    }

    return [
      { label: t('dashboardAuth.accessStage.steps.secureSession'), state: 'error' },
      { label: t('dashboardAuth.accessStage.steps.exchangeOauth'), state: 'pending' },
      { label: t('dashboardAuth.accessStage.steps.syncGuilds'), state: 'pending' },
      { label: t('dashboardAuth.accessStage.steps.redirect'), state: 'pending' },
    ];
  }

  if (viewState.phase === 'redirecting') {
    return [
      { label: t('dashboardAuth.accessStage.steps.secureSession'), state: 'complete' },
      { label: t('dashboardAuth.accessStage.steps.exchangeOauth'), state: 'complete' },
      { label: t('dashboardAuth.accessStage.steps.syncGuilds'), state: 'complete' },
      { label: t('dashboardAuth.accessStage.steps.redirect'), state: 'active' },
    ];
  }

  if (viewState.phase === 'syncing') {
    return [
      { label: t('dashboardAuth.accessStage.steps.secureSession'), state: 'complete' },
      { label: t('dashboardAuth.accessStage.steps.exchangeOauth'), state: 'complete' },
      { label: t('dashboardAuth.accessStage.steps.syncGuilds'), state: 'active' },
      { label: t('dashboardAuth.accessStage.steps.redirect'), state: 'pending' },
    ];
  }

  return [
    { label: t('dashboardAuth.accessStage.steps.secureSession'), state: 'active' },
    { label: t('dashboardAuth.accessStage.steps.exchangeOauth'), state: 'active' },
    { label: t('dashboardAuth.accessStage.steps.syncGuilds'), state: 'pending' },
    { label: t('dashboardAuth.accessStage.steps.redirect'), state: 'pending' },
  ];
}

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
  const returnedState = searchParams.get('state');

  const stateMismatch = (() => {
    if (!code) return false;
    const storedState = window.sessionStorage.getItem('discord_oauth_state');
    if (!storedState) return false;
    return returnedState !== storedState;
  })();

  const attemptKey = useMemo(
    () => (authError ? `error:${authError}` : stateMismatch ? 'state-mismatch' : code ? `code:${code}` : 'missing-code'),
    [authError, stateMismatch, code],
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

  const displayViewState = useMinimumDisplayState({
    value: viewState,
    getKey: (state) => state.phase,
    minimumMs: CALLBACK_STAGE_MIN_MS,
    shouldDelay: shouldDelayCallbackStage,
  });
  const isErrorState = Boolean(displayViewState.errorMessage);
  const isRedirecting = displayViewState.phase === 'redirecting';
  const stageVariant = isErrorState ? 'error' : displayViewState.isCompleted ? 'success' : 'loading';
  const callbackProgressSteps = getCallbackProgressSteps(displayViewState, t);
  const stageEyebrow = isErrorState
    ? t('dashboardAuth.errorEyebrow')
    : isRedirecting
      ? t('dashboardAuth.successEyebrowRedirecting')
      : t('dashboardAuth.successEyebrowLoading');
  const stageStatusText = isErrorState
    ? displayViewState.errorMessage
    : displayViewState.statusText;
  const stageDescription = isErrorState
    ? t('dashboardAuth.accessStage.descriptions.error')
    : isRedirecting
      ? t('dashboardAuth.accessStage.descriptions.redirecting')
      : displayViewState.phase === 'syncing'
        ? t('dashboardAuth.accessStage.descriptions.syncing')
        : t('dashboardAuth.accessStage.descriptions.exchanging');
  const stageProgressDescription = isErrorState
    ? t('dashboardAuth.accessStage.states.error')
    : isRedirecting
      ? t('dashboardAuth.accessStage.states.redirecting')
      : displayViewState.phase === 'syncing'
        ? t('dashboardAuth.accessStage.states.syncing')
        : t('dashboardAuth.accessStage.states.exchanging');

  return (
    <main className="dashboard-shell flex min-h-screen items-center justify-center px-4 py-8 text-white sm:px-6">
      <Helmet>
        <title>{dashboardBrandLabel} | {t('dashboardAuth.pageTitle')}</title>
      </Helmet>
      <div className="mx-auto w-full max-w-[76rem]">
        <DashboardAccessStage
          key={`${displayViewState.phase}-${isErrorState ? 'error' : 'flow'}`}
          variant={stageVariant}
          eyebrow={stageEyebrow}
          title={t('dashboardAuth.pageHeading', { name: dashboardBrandLabel })}
          description={stageDescription}
          statusText={stageStatusText}
          progressLabel={t('dashboardAuth.accessStage.progressLabel')}
          progressDescription={stageProgressDescription}
          progressSteps={callbackProgressSteps}
          statusPill={(
            <DashboardAccessStatusPill
              label={stageEyebrow}
              tone={isErrorState ? 'danger' : isRedirecting ? 'success' : 'brand'}
              icon={isErrorState ? AlertOctagon : undefined}
            />
          )}
          actions={isErrorState ? (
            <>
              {displayViewState.canRetrySync ? (
                <button type="button" onClick={handleRetrySync} className="dashboard-primary-button">
                  <RotateCcw className="h-4 w-4" />
                  {t('dashboardAuth.retrySync')}
                </button>
              ) : null}
              {displayViewState.canRestartLogin ? (
                <button type="button" onClick={handleRestartLogin} className="dashboard-secondary-button">
                  {t('dashboardAuth.restartLogin')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </>
          ) : undefined}
          icon={isErrorState ? AlertOctagon : undefined}
          brandLabel={dashboardBrandLabel}
        />
      </div>
    </main>
  );
}
