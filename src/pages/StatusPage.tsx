import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { config, getCanonicalUrl } from '../config';

const DEFAULT_STATUS_URL = 'https://status.ton618bot.xyz/';

export default function StatusPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.location.replace(config.statusUrl || DEFAULT_STATUS_URL);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <Helmet>
        <title>{t('status.pageTitle', `${config.botName} - Status`)}</title>
        <meta
          name="description"
          content={t(
            'status.metaDescription',
            'Check TON618 bot health, uptime and server status in real time.',
          )}
        />
        <link rel="canonical" href={getCanonicalUrl('/status')} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
      >
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-indigo-500" />
          <h1 className="text-2xl font-bold">{t('nav.status', 'TON618 Status')}</h1>
        </div>
        <p className="text-slate-300">{t('app.loadingDescription')}</p>
      </motion.div>
    </div>
  );
}
