import { BookOpen, TerminalSquare } from 'lucide-react';
import { config } from '../config';

export default function DocsSection() {
  return (
    <section id="docs" className="py-24 bg-brand-100 dark:bg-surface-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Documentation</h2>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            Learn commands, setup flow, and best practices to launch in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-brand-50 dark:bg-surface-800 border border-brand-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm transition-colors duration-300 transition-transform hover:-translate-y-1 hover:shadow-md">
            <BookOpen className="w-8 h-8 text-brand-600 dark:text-brand-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Full Docs</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-5">Guides, troubleshooting, and integration references.</p>
            {config.docsUrl ? (
              <a
                href={config.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-5 py-2.5 rounded-lg bg-brand-600 dark:bg-brand-500 text-white font-semibold hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors"
              >
                Open Docs
              </a>
            ) : (
              <a href="#guide" className="inline-flex px-5 py-2.5 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-semibold hover:bg-brand-200 dark:hover:bg-brand-900/60 transition-colors">
                Read Setup Guide
              </a>
            )}
          </div>

          <div className="bg-brand-50 dark:bg-surface-800 border border-brand-200 dark:border-surface-700 rounded-2xl p-6 shadow-sm transition-colors duration-300 transition-transform hover:-translate-y-1 hover:shadow-md">
            <TerminalSquare className="w-8 h-8 text-brand-600 dark:text-brand-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Command Reference</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-5">Browse slash commands and common usage examples.</p>
            <a href="#commands" className="inline-flex px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-violet-600 text-white font-semibold hover:shadow-lg transition-colors">
              View Commands
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
