import { BarChart3, ShieldCheck, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { config } from '../config';

export default function DashboardSection() {
  const hasDashboard = Boolean(config.dashboardUrl);

  return (
    <section id="dashboard" className="pt-32 pb-24 bg-brand-50 dark:bg-surface-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5">Control Everything in One Dashboard</h2>
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
              Manage moderation, automations, and engagement settings with an interface built for server owners and moderators.
            </p>

            <div className="space-y-4 text-gray-700 dark:text-slate-300 mb-8">
              <p className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Role-based moderation controls</p>
              <p className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Live analytics and usage reports</p>
              <p className="flex items-center gap-3"><Settings2 className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Fast feature toggles and presets</p>
            </div>

            {hasDashboard ? (
              <a
                href={config.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-violet-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
              >
                Open Dashboard
              </a>
            ) : (
              <span className="inline-flex px-6 py-3 rounded-xl bg-brand-100 dark:bg-surface-700 text-brand-700 dark:text-slate-400 font-semibold border border-brand-200 dark:border-surface-600">
                Dashboard coming soon
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-brand-900 via-violet-900 to-brand-900 dark:from-surface-900 dark:via-brand-900 dark:to-surface-900 rounded-3xl p-8 text-white shadow-2xl border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
            <p className="text-sm uppercase tracking-wide text-white/70 mb-3 relative z-10">Preview</p>
            <h3 className="text-2xl font-bold mb-4 relative z-10">Command Activity</h3>
            <div className="space-y-3 relative z-10">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: '82%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-brand-400"></motion.div></div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: '64%' }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-violet-400"></motion.div></div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: '91%' }} transition={{ duration: 1, delay: 0.7 }} className="h-full bg-amber-400"></motion.div></div>
            </div>
            <p className="text-white/80 mt-6 text-sm relative z-10">Real-time insights for moderation, engagement, and feature usage.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
