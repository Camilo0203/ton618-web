import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, LayoutDashboard } from 'lucide-react';
import { config, getPublicDashboardUrl } from '../config';
import Logo from '../components/Logo';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const publicDashboardUrl = getPublicDashboardUrl();

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <Helmet>
        <title>{config.botName} | {t('notFound.pageTitle')}</title>
      </Helmet>
      <div className="max-w-xl w-full rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        <Logo size="lg" subtitle={t('notFound.subtitle')} className="mb-6" />
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300 mb-4">
          {t('notFound.errorCode')}
        </p>
        <h1 className="text-4xl font-bold mb-4">{t('notFound.title')}</h1>
        <p className="text-slate-300 leading-relaxed mb-8">
          {t(publicDashboardUrl ? 'notFound.description' : 'notFound.descriptionNoDashboard')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
          >
            <Home className="w-4 h-4" />
            {t('notFound.goHome')}
          </Link>
          {publicDashboardUrl ? (
            publicDashboardUrl.startsWith('/') ? (
              <Link
                to={publicDashboardUrl}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/15"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('notFound.goDashboard')}
              </Link>
            ) : (
              <a
                href={publicDashboardUrl}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/15"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('notFound.goDashboard')}
              </a>
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}
