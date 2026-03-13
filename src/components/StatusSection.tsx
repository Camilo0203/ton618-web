import { Activity } from 'lucide-react';
import { config } from '../config';

export default function StatusSection() {
  const hasStatus = Boolean(config.statusUrl);
  return (
    <section id="status" className="py-20 bg-white dark:bg-surface-800 border-y border-brand-100 dark:border-surface-700 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold mb-6 border border-emerald-200 dark:border-emerald-800/40">
          <Activity className="w-4 h-4" />
          Service Status
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Stay Updated on Bot Health</h2>
        {hasStatus ? (
          <a href={config.statusUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex px-6 py-3 rounded-xl bg-gray-900 dark:bg-brand-600 text-white font-semibold hover:bg-gray-800 dark:hover:bg-brand-700 transition-colors">
            Open Status Page
          </a>
        ) : (
          <p className="text-gray-600 dark:text-slate-400">
            Public status page is not available yet. Visit <a href="#support" className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300">support</a> for incident updates.
          </p>
        )}
      </div>
    </section>
  );
}
