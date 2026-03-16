import { motion } from 'framer-motion';
import { Bot, ChevronRight, Zap } from 'lucide-react';
import { getDiscordInviteUrl } from '../config';

export default function FinalCTA() {
  const inviteUrl = getDiscordInviteUrl();

  return (
    <section id="join" className="py-60 relative overflow-hidden bg-black">
      {/* Cinematic Singularity Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-500/5 blur-[180px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <div className="inline-flex items-center gap-2 mb-10 px-4 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5">
             <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
             <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Protocol Finalization</span>
          </div>

          <h2 className="text-6xl md:text-9xl font-bold text-white uppercase tracking-tightest leading-none mb-12">
            Expand Your <br/>
            <span className="text-premium-gradient">Empire</span>
          </h2>
          
          <p className="text-xl text-slate-400 font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
            The singularity is ready. Initiate the synchronization protocol and bring cosmic-scale power to your Discord server today.
          </p>

          <div className="flex justify-center items-center">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium-primary text-lg !px-20 !py-6 group"
            >
              <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-500" />
              <span>Initialize Sync</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="mt-24 flex flex-wrap justify-center gap-12 text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">
             <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:animate-ping"></div>
                <span>NODE-01 ACTIVE</span>
             </div>
             <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:animate-ping"></div>
                <span>ENCRYPTION VERIFIED</span>
             </div>
             <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:animate-ping"></div>
                <span>VOID STABILIZED</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

