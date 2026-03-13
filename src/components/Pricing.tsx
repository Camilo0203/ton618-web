import { Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDiscordInviteUrl } from '../config';

export default function Pricing() {
  const inviteUrl = getDiscordInviteUrl();
  const hasInvite = Boolean(inviteUrl);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="pricing" className="py-24 bg-brand-100 dark:bg-surface-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Simple Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto"
          >
            Start free and upgrade when your community needs more advanced control.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
        >
          {/* Free plan */}
          <motion.div variants={itemVariants} className="flex flex-col h-full bg-brand-50 dark:bg-surface-700 rounded-2xl p-8 border border-brand-200 dark:border-surface-600 shadow-sm transition-transform hover:-translate-y-2 hover:shadow-lg">
            <p className="text-sm uppercase tracking-wide text-brand-600 dark:text-brand-400 font-semibold mb-3">Free</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">$0</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Core moderation, utility, and setup tools.</p>
            <ul className="mt-6 space-y-2 text-gray-700 dark:text-slate-300 flex-grow">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>Moderation + automod</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>Slash commands</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>Community features</li>
            </ul>
            {hasInvite ? (
              <a href={inviteUrl} target="_blank" rel="noopener noreferrer"
                className="mt-8 inline-flex justify-center px-5 py-3 rounded-xl bg-gray-900 dark:bg-surface-900 text-white font-semibold hover:bg-gray-800 dark:hover:bg-surface-800 transition-colors">
                Start Free
              </a>
            ) : (
              <a href="#top" aria-disabled="true" onClick={(e) => e.preventDefault()}
                className="mt-8 inline-flex justify-center px-5 py-3 rounded-xl bg-gray-200 dark:bg-surface-800 text-gray-500 dark:text-slate-500 font-semibold cursor-not-allowed">
                Start Free
              </a>
            )}
          </motion.div>

          {/* Premium plan */}
          <motion.div variants={itemVariants} className="flex flex-col h-full bg-gradient-to-br from-brand-500 to-violet-600 dark:from-brand-700 dark:to-violet-800 rounded-2xl p-8 text-white shadow-xl border border-brand-400/30 relative overflow-hidden transition-transform hover:-translate-y-2">
            {/* Warm shimmer overlay */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-3">
              <p className="text-sm uppercase tracking-wide text-white/80 font-semibold">Premium</p>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-400/30">Popular</span>
            </div>
            <h3 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="w-7 h-7 text-amber-300" />
              $9/mo
            </h3>
            <p className="text-white/85 mt-2">Advanced analytics, priority support, and pro automation.</p>
            <ul className="mt-6 space-y-2 text-white/90 flex-grow">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-300 rounded-full"></span>Premium dashboards</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-300 rounded-full"></span>Advanced logging + insights</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-amber-300 rounded-full"></span>Priority support queue</li>
            </ul>
            <a href="#support"
              className="mt-8 inline-flex justify-center px-5 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-white/95 transition-colors items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Contact Sales
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
