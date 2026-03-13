interface LegalModalProps {
  type: 'terms' | 'privacy' | 'cookies' | null;
  onClose: () => void;
  botName: string;
}

const legalCopy = {
  terms: {
    title: 'Terms of Service',
    content:
      'By using this bot you agree to use it responsibly, follow Discord policies, and avoid abuse. Service availability may change over time, and features can be updated without prior notice.',
  },
  privacy: {
    title: 'Privacy Policy',
    content:
      'We only process data required for bot functionality, moderation, and analytics. We do not sell personal data. You can request removal of server-related data by contacting support.',
  },
  cookies: {
    title: 'Cookies Policy',
    content:
      'This site may use essential and analytics cookies to improve performance and user experience. You can control cookies through your browser settings at any time.',
  },
};

export default function LegalModal({ type, onClose, botName }: LegalModalProps) {
  if (!type) {
    return null;
  }

  const content = legalCopy[type];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-brand-900/80 dark:bg-surface-950/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-brand-50 dark:bg-surface-800 rounded-3xl shadow-2xl border border-brand-200 dark:border-surface-700 overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-8 border-b border-brand-200 dark:border-surface-700 flex items-start justify-between gap-4">
          <div>
            <h3 id="legal-modal-title" className="text-3xl font-bold text-gray-900 dark:text-white">
              {content.title}
            </h3>
            <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mt-1">{botName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-100 dark:bg-surface-700 hover:bg-brand-200 dark:hover:bg-surface-600 text-brand-700 dark:text-white text-sm font-bold transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-8 text-gray-700 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto">
          <p className="text-lg">{content.content}</p>
          <div className="mt-8 pt-6 border-t border-brand-100 dark:border-surface-700 flex justify-between items-center text-xs text-gray-500 dark:text-slate-500 uppercase tracking-widest font-bold">
            <span>Last updated</span>
            <span>March 5, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
