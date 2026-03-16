import { LifeBuoy, Mail, MessageCircle } from 'lucide-react';
import { config } from '../config';

export default function SupportSection() {
  const hasSupportServer = Boolean(config.supportServerUrl);
  const hasEmail = Boolean(config.contactEmail);
  return (
    <section id="support" className="py-32 bg-[#010208] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-2 hud-border rounded-full mb-8 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <LifeBuoy className="w-4 h-4 text-amber-500" />
            <span className="text-white font-black text-xs uppercase tracking-[0.2em]">Signal Support</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter">Need <span className="text-brand-gradient">Support?</span></h2>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">Our team can help you stabilize your bot experience within the cluster.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {hasSupportServer ? (
            <a href={config.supportServerUrl} target="_blank" rel="noopener noreferrer"
              className="px-10 py-5 rounded-2xl bg-amber-500 text-black font-black uppercase tracking-widest hover:bg-amber-400 transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] hover:scale-110 flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              Join Support HUD
            </a>
          ) : (
            <span className="px-10 py-5 rounded-2xl hud-border text-slate-500 font-black uppercase tracking-widest opacity-50 cursor-not-allowed">Signal offline</span>
          )}
          {hasEmail ? (
            <a href={`mailto:${config.contactEmail}`}
              className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300 hover:scale-105 flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-500" />
              Email Protocol
            </a>
          ) : (
            <span className="px-10 py-5 rounded-2xl hud-border text-slate-500 font-black uppercase tracking-widest opacity-50 cursor-not-allowed">Email unavailable</span>
          )}
        </div>
      </div>
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(245,158,11,0.05),transparent_70%)]"></div>
    </section>
  );
}
