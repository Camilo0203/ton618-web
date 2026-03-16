import { ChevronRight, Sparkles, Activity } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getDiscordInviteUrl, getDashboardUrl } from '../config';
import { useRef } from 'react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inviteUrl = getDiscordInviteUrl();
  const dashboardUrl = getDashboardUrl();

  const { scrollY } = useScroll();
  const ySingularity = useTransform(scrollY, [0, 500], [0, 150]);
  const scaleSingularity = useTransform(scrollY, [0, 500], [1, 1.2]);
  const rotateSingularity = useTransform(scrollY, [0, 2000], [0, 360]);

  return (
    <section ref={containerRef} id="top" className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,20,50,1)_0%,rgba(1,1,3,1)_100%)]"></div>
        
        {/* NEBULA LAYERS */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] nebula-blur bg-indigo-600/10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] nebula-blur bg-purple-600/10"></div>
      </div>

      {/* THE SINGULARITY (TON 618 CORE) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: ySingularity, scale: scaleSingularity, rotate: rotateSingularity }}
          className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px]"
        >
          {/* Outer Accretion Disk (Slow, Massive) */}
          <div className="absolute inset-0 rounded-full border-[0.5px] border-indigo-500/10 animate-[spin_120s_linear_infinite] mask-radial-faded"></div>
          
          {/* Middle Energy Disk (Counter-rotate, Glow) */}
          <div className="absolute inset-[10%] rounded-full border-[1px] border-indigo-500/20 blur-[2px] animate-[spin_80s_linear_infinite_reverse] mask-radial-faded"></div>
          
          {/* The Event Horizon Core */}
          <div className="absolute inset-[30%] rounded-full bg-black shadow-[0_0_80px_rgba(79,70,229,0.3)] flex items-center justify-center group overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(79,70,229,0.1),transparent)] animate-[spin_10s_linear_infinite]"></div>
            <div className="w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
          
          {/* Quasar Jet Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-[2px] h-[1000px] bg-gradient-to-t from-transparent via-indigo-500/40 to-transparent"
              style={{ rotate: i * 60, translateX: '-50%', translateY: '-50%' }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: i }}
            />
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* STATUS BADGE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 group cursor-default"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.3em]">Quantum Protocol v2.5.0 Active</span>
          <Activity className="w-3 h-3 text-indigo-500 opacity-50 group-hover:rotate-180 transition-transform duration-700" />
        </motion.div>

        {/* MAIN HEADLINE */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-[13vw] md:text-[8vw] lg:text-[7.5vw] font-extrabold leading-[0.85] tracking-tightest uppercase mb-6"
        >
          Beyond <br/>
          <span className="text-premium-gradient text-shadow-glow">Gravity</span>
        </motion.h1>

        {/* SUBHEADLINE */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed tracking-tight"
        >
          Forge your Discord ecosystem within the singularity. <br className="hidden md:block"/>
          <span className="text-slate-600 font-normal">Massive automation, extreme precision, cosmic scale.</span>
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <a href={inviteUrl} className="btn-premium-primary group">
            <Sparkles className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12 text-indigo-900" />
            <span>Launch Protocol</span>
          </a>

          <a href={dashboardUrl} className="btn-premium-outline group">
            <span>Access Terminal</span>
            <ChevronRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>

      {/* AMBIENT SCROLL INDICATOR */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-opacity duration-500 cursor-default"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
        <span className="text-[9px] uppercase tracking-[0.5em] font-black text-indigo-200">Singular Exploration</span>
      </motion.div>
    </section>
  );
}

