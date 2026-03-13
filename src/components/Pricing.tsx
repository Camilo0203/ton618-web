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
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Simple Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
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
          <motion.div variants={itemVariants} className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg transition-transform hover:-translate-y-2">
            <p className="text-sm uppercase tracking-wide text-purple-600 dark:text-purple-400 font-semibold mb-3">Free</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">$0</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Core moderation, utility, and setup tools.</p>
            <ul className="mt-6 space-y-2 text-gray-700 dark:text-gray-300 flex-grow">
              <li>Moderation + automod</li>
              <li>Slash commands</li>
              <li>Community features</li>
            </ul>
            {hasInvite ? (
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex px-5 py-3 rounded-xl bg-gray-900 dark:bg-gray-700 text-white font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                Start Free
              </a>
            ) : (
              <a
                href="#top"
                aria-disabled="true"
                onClick={(event) => event.preventDefault()}
                className="mt-8 inline-flex px-5 py-3 rounded-xl bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold cursor-not-allowed"
              >
                Start Free
              </a>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col h-full bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-900 rounded-2xl p-8 text-white shadow-xl border border-purple-400/30 relative overflow-hidden transition-transform hover:-translate-y-2">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Popular</div>
            <p className="text-sm uppercase tracking-wide text-white/80 font-semibold mb-3">Premium</p>
            <h3 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="w-7 h-7" />
              $9/mo
            </h3>
            <p className="text-white/90 mt-2">Advanced analytics, priority support, and pro automation.</p>
            <ul className="mt-6 space-y-2 text-white/90 flex-grow">
              <li>Premium dashboards</li>
              <li>Advanced logging + insights</li>
              <li>Priority support queue</li>
            </ul>
            <a
              href="#support"
              className="mt-8 inline-flex px-5 py-3 rounded-xl bg-white text-purple-700 dark:text-purple-900 font-semibold hover:bg-white/90 transition-colors items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Contact Sales
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
