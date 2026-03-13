import { BarChart3, ShieldCheck, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { config } from '../config';

export default function DashboardSection() {
  const hasDashboard = Boolean(config.dashboardUrl);

  return (
    <section id="dashboard" className="pt-32 pb-24 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-5">Control Everything in One Dashboard</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Manage moderation, automations, and engagement settings with an interface built for server owners and moderators.
            </p>

            <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-8">
              <p className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Role-based moderation controls</p>
              <p className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Live analytics and usage reports</p>
              <p className="flex items-center gap-3"><Settings2 className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Fast feature toggles and presets</p>
            </div>

            {hasDashboard ? (
              <a
                href={config.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
              >
                Open Dashboard
              </a>
            ) : (
              <span className="inline-flex px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                Dashboard coming soon
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 dark:from-gray-950 dark:via-purple-950 dark:to-gray-950 rounded-3xl p-8 text-white shadow-2xl border border-white/10"
          >
            <p className="text-sm uppercase tracking-wide text-white/70 mb-3">Preview</p>
            <h3 className="text-2xl font-bold mb-4">Command Activity</h3>
            <div className="space-y-3">
              <div className="h-3 bg-white/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: '82%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-cyan-400"></motion.div></div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: '64%' }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-pink-400"></motion.div></div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: '91%' }} transition={{ duration: 1, delay: 0.7 }} className="h-full bg-emerald-400"></motion.div></div>
            </div>
            <p className="text-white/80 mt-6 text-sm">Real-time insights for moderation, engagement, and feature usage.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
