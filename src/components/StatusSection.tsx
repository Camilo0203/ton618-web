import { Activity } from 'lucide-react';
import { config } from '../config';

export default function StatusSection() {
  const hasStatus = Boolean(config.statusUrl);
  return (
    <section id="status" className="py-32 bg-[#010208] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-6 py-2 hud-border rounded-full mb-10 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-white font-black text-xs uppercase tracking-[0.2em]">Service Pulse</span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 uppercase tracking-tighter">Stay Updated on <span className="text-brand-gradient">Bot Health</span></h2>
        
        {hasStatus ? (
          <a href={config.statusUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex px-10 py-5 rounded-2xl bg-amber-500 text-black font-black uppercase tracking-widest hover:bg-amber-400 transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] hover:scale-110">
            Open Status HUD
          </a>
        ) : (
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm leading-relaxed max-w-xl mx-auto">
            Public status HUD is currently offline. Access the <a href="#support" className="text-amber-500 hover:text-amber-400 underline decoration-amber-500/30 underline-offset-4">Support HUD</a> for real-time manifest updates.
          </p>
        )}
      </div>
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none"></div>
    </section>
  );
}
