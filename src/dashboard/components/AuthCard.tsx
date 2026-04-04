import { AlertTriangle, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StateCard from './StateCard';
import Logo from '../../components/Logo';
import { config } from '../../config';

interface AuthCardProps {
  canUseDashboard: boolean;
  isLoading: boolean;
  errorMessage?: string;
  onLogin: () => void;
}

export default function AuthCard({
  canUseDashboard,
  isLoading,
  errorMessage,
  onLogin,
}: AuthCardProps) {
  const { t } = useTranslation();
  const dashboardBrandLabel = `${config.botName} Dashboard`;

  if (!canUseDashboard) {
    return (
      <StateCard
        eyebrow={t('dashboardAuth.authCard.missingConfigEyebrow')}
        title={t('dashboardAuth.authCard.missingConfigTitle')}
        description={t('dashboardAuth.authCard.missingConfigDescription')}
        icon={AlertTriangle}
        tone="warning"
      />
    );
  }

  return (
    <section className="dashboard-auth-card relative overflow-hidden px-6 py-8 text-center sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/60 to-transparent dark:via-white/25" />
      <div className="pointer-events-none absolute left-1/2 top-14 h-36 w-36 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative z-[1] mx-auto flex max-w-[34rem] flex-col items-center">
        <Logo
          size="lg"
          withText={false}
          className="justify-center"
          frameClassName="mx-auto"
          imageClassName="drop-shadow-[0_24px_48px_rgba(99,102,241,0.3)]"
        />

        <div className="dashboard-auth-badge mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]">
          <LockKeyhole className="h-3.5 w-3.5" />
          {t('dashboardAuth.authCard.protectedAccess')}
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
            {dashboardBrandLabel}
          </p>
          <h1 className="text-balance text-[2rem] font-bold tracking-[-0.05em] text-white sm:text-[2.35rem]">
            {t('dashboardAuth.authCard.cardTitle')}
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-300 sm:text-[0.95rem]">
            {errorMessage || t('dashboardAuth.authCard.cardDescription')}
          </p>
        </div>

        <div className="relative mt-8 w-full">
          <div className="pointer-events-none absolute inset-x-10 -inset-y-2 rounded-full bg-brand-500/25 blur-2xl" />
          <button
            type="button"
            onClick={onLogin}
            disabled={isLoading}
            className="dashboard-auth-button relative inline-flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn className="h-4 w-4" />
            {isLoading ? t('dashboardAuth.authCard.loadingCta') : t('dashboardAuth.authCard.cta')}
          </button>
        </div>

        <p className="mt-5 text-xs leading-6 text-slate-400">
          {t('dashboardAuth.authCard.trustLine')}
        </p>
      </div>
      <div className="relative z-[1] mt-7 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
        {t('dashboardAuth.authCard.trustFooter')}
      </div>
    </section>
  );
}
