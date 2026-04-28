import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Logo from '../components/Logo';
import { config, getCanonicalUrl } from '../config';

export default function ComingSoonPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <Helmet>
        <title>{t('comingSoon.title')}</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={getCanonicalUrl('/dashboard')} />
      </Helmet>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cinematic-atmosphere absolute inset-0"></div>
        <div className="bg-cinematic-texture absolute inset-0 opacity-40"></div>
        <div className="bg-film-grain absolute inset-0 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-black"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl text-center"
        >
          <div className="mb-8 flex justify-center">
            <Logo
              size="xl"
              subtitle="TON618"
              frameClassName="h-24 w-24 md:h-28 md:w-28"
              imageClassName="scale-[1.06]"
            />
          </div>

          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2">
            <Lock className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">
              {t('comingSoon.badge')}
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl">
            {t('comingSoon.headlinePrefix')} <br />
            <span className="headline-accent headline-accent-solid">
              {t('comingSoon.headlineSuffix')}
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
            {t('comingSoon.description')}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/" className="btn-premium-primary group">
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>{t('comingSoon.backToHome')}</span>
            </Link>

            {config.supportServerUrl && (
              <a
                href={config.supportServerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium-outline"
              >
                <span>{t('comingSoon.joinSupport')}</span>
              </a>
            )}
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
              <span>{t('comingSoon.footer.discordFirst')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              <span>{t('comingSoon.footer.slashReady')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
