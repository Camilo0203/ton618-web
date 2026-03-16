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
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/90 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#010208] hud-border rounded-[40px] shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-10 border-b border-white/5 flex items-start justify-between gap-6">
          <div>
            <h3 id="legal-modal-title" className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              {content.title}
            </h3>
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]">{botName} // Core Protocol</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            Close HUD
          </button>
        </div>

        <div className="p-10 text-slate-400 font-bold leading-relaxed max-h-[60vh] overflow-y-auto uppercase text-xs tracking-wider">
          <p className="text-xl text-white normal-case font-medium mb-10 leading-relaxed border-l-2 border-amber-500/30 pl-6">{content.content}</p>
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-[0.25em] font-black">
            <span>Protocol Update</span>
            <span className="text-amber-500/60">March 5, 2026 // Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
