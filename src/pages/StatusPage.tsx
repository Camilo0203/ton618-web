import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { config, getCanonicalUrl } from '../config';

interface BotHealth {
  status: 'online' | 'degraded' | 'offline';
  pingMs: number;
  uptime: string;
  guilds: number;
  users: number;
  version?: string;
}

const FALLBACK_HEALTH_URL = 'https://ton618-bot.squareweb.app/health';

export default function StatusPage() {
  const { t } = useTranslation();
  const [health, setHealth] = useState<BotHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_BOT_HEALTH_URL || FALLBACK_HEALTH_URL;
    fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setHealth({
          status: data.status === 'healthy' ? 'online' : data.status === 'degraded' ? 'degraded' : 'offline',
          pingMs: data.pingMs ?? 0,
          uptime: data.uptime ?? '-',
          guilds: data.guilds ?? 0,
          users: data.users ?? 0,
          version: data.version,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statusColor =
    health?.status === 'online'
      ? 'bg-emerald-500'
      : health?.status === 'degraded'
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <Helmet>
        <title>{t('status.pageTitle', `${config.botName} — Status`)}</title>
        <meta name="description" content={t('status.metaDescription', 'Check TON618 bot health, uptime and server status in real time.')} />
        <link rel="canonical" href={getCanonicalUrl('/status')} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className={`inline-block h-3 w-3 rounded-full ${statusColor} ${loading ? 'animate-pulse' : ''}`} />
          <h1 className="text-2xl font-bold">{t('status.title', 'TON618 Status')}</h1>
        </div>

        {loading && (
          <p className="text-slate-300">{t('status.loading', 'Checking bot health...')}</p>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="text-rose-300">{t('status.error', 'Unable to reach bot health endpoint')}</p>
            <p className="mt-1 text-xs text-rose-400/80">{error}</p>
          </div>
        )}

        {health && !error && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">{t('status.status', 'Status')}</p>
              <p className="mt-1 text-lg font-semibold capitalize">{health.status}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">{t('status.ping', 'Ping')}</p>
              <p className="mt-1 text-lg font-semibold">{health.pingMs}ms</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">{t('status.guilds', 'Guilds')}</p>
              <p className="mt-1 text-lg font-semibold">{health.guilds.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">{t('status.users', 'Users')}</p>
              <p className="mt-1 text-lg font-semibold">{health.users.toLocaleString()}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">{t('status.version', 'Version')}</p>
              <p className="mt-1 text-lg font-semibold">{health.version || '-'}</p>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          {t('status.updated', 'Last updated: {{time}}', { time: new Date().toLocaleString() })}
        </p>
      </motion.div>
    </div>
  );
}
