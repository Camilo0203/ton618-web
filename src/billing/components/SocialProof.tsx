import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBotStats } from '../../hooks/useBotStats';

export function SocialProof() {
  const { t } = useTranslation();
  const { stats, hasData } = useBotStats();

  const targetServers = useMemo(() => {
    if (hasData && stats.servers > 0) return stats.servers;
    return 0;
  }, [hasData, stats.servers]);

  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (targetServers <= 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = targetServers / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetServers) {
        setDisplayCount(targetServers);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [targetServers]);

  if (!hasData || targetServers === 0) {
    return (
      <section className="px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            <MessageCircle className="h-4 w-4" />
            {t('billing.socialProof.label')}
          </div>
          <p className="text-xl font-semibold text-slate-300">
            {t('billing.socialProof.emptyState')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
          <MessageCircle className="h-4 w-4" />
          {t('billing.socialProof.label')}
        </div>
        <motion.p
          key={targetServers}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-black text-white"
        >
          {displayCount.toLocaleString()}+
        </motion.p>
        <p className="mt-2 text-slate-300">{t('billing.socialProof.description')}</p>
      </div>
    </section>
  );
}
