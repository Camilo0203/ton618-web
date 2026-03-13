import { Bot, ExternalLink, LayoutDashboard } from 'lucide-react';
import { getDiscordInviteUrl, config } from '../config';
import { useTranslation } from 'react-i18next';
import { motion, Variants } from 'framer-motion';

export default function Hero() {
  const inviteUrl = getDiscordInviteUrl();
  const inviteEnabled = Boolean(inviteUrl);
  const { t } = useTranslation();

  const dashboardHref = config.dashboardUrl || '#dashboard';
  const supportHref = config.supportServerUrl || '#support';
  const dashboardExternal = Boolean(config.dashboardUrl);
  const supportExternal = Boolean(config.supportServerUrl);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient — warm indigo/violet (light) to navy (dark) */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-violet-600 to-purple-700 dark:from-surface-900 dark:via-brand-900 dark:to-surface-700 animate-gradient transition-colors duration-500"></div>

      {/* Decorative warm blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-400/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Dot pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTEwIDBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0xMCAwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTIwIDEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTAgMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTEwIDBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wIDEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptLTEwIDBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0tMTAgMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="p-4 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/25 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <Bot className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
          {t('hero.title', 'The Ultimate Discord Bot')}
          <br />
          <span className="bg-gradient-to-r from-amber-300 to-violet-200 bg-clip-text text-transparent">
            {t('hero.subtitle', 'for Your Community')}
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow">
          {t('hero.description', 'Powerful moderation, engaging features, and seamless automation. Elevate your Discord server to the next level.')}
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={inviteEnabled ? inviteUrl : '#top'}
            target={inviteEnabled ? '_blank' : undefined}
            rel={inviteEnabled ? 'noopener noreferrer' : undefined}
            aria-disabled={!inviteEnabled}
            onClick={(event) => { if (!inviteEnabled) event.preventDefault(); }}
            className={`group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl flex items-center gap-2 ${
              inviteEnabled
                ? 'bg-white text-brand-600 hover:bg-white/95 hover:shadow-white/30 hover:scale-105'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-70'
            }`}
          >
            <Bot className="w-5 h-5" />
            {t('hero.invite', 'Invite Bot')}
          </a>

          <a
            href={dashboardHref}
            target={dashboardExternal ? '_blank' : undefined}
            rel={dashboardExternal ? 'noopener noreferrer' : undefined}
            className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300 shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <LayoutDashboard className="w-5 h-5" />
            {t('hero.dashboard', 'Open Dashboard')}
          </a>

          <a
            href={supportHref}
            target={supportExternal ? '_blank' : undefined}
            rel={supportExternal ? 'noopener noreferrer' : undefined}
            className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300 shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            {t('hero.support', 'Support Server')}
          </a>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: '50K+', label: t('stats.servers', 'Servers') },
            { value: '10M+', label: t('stats.users', 'Users') },
            { value: '99.9%', label: t('stats.uptime', 'Uptime') },
            { value: '24/7', label: t('stats.support', 'Support') },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/75 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
