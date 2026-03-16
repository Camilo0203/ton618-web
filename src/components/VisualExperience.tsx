import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';

export default function VisualExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]);

  return (
    <section ref={containerRef} id="experience" className="h-[200vh] relative bg-black overflow-hidden flex items-center justify-center">
      {/* DEEP SPACE BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
        ></motion.div>
        
        {/* Dynamic Nebulas */}
        <motion.div style={{ y: y1 }} className="absolute top-1/4 left-1/4 w-[800px] h-[800px] nebula-blur bg-indigo-500/10"></motion.div>
        <motion.div style={{ y: y2 }} className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] nebula-blur bg-purple-500/10"></motion.div>
      </div>

      {/* CORE EXPERIENCE VISUAL */}
      <motion.div 
        style={{ opacity, scale, rotate }}
        className="relative z-10 text-center px-6"
      >
        <div className="relative mb-20 inline-block">
          {/* Energy Core HUD */}
          <div className="w-48 h-48 md:w-72 md:h-72 rounded-full border border-white/[0.03] flex items-center justify-center relative">
            <div className="absolute inset-[-10px] border border-indigo-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute inset-[-30px] border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
            
            <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.8)] z-10"></div>
            
            {/* Energy Ripples */}
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"
            ></motion.div>
          </div>
          
          {/* Floating HUD Elements around the core */}
          <div className="absolute top-0 -right-20 animate-float-subtle">
             <div className="cinematic-glass p-4 rounded-xl border-indigo-500/20 flex gap-3 items-center">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Flux: 0.88c</span>
             </div>
          </div>
        </div>

        <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tightest mb-10 leading-[0.85]">
          Architect the <br/>
          <span className="text-premium-gradient text-shadow-glow">Void</span>
        </h2>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed tracking-[0.3em] uppercase opacity-60 italic">
          Scaling civilizations beyond the event horizon.
        </p>
      </motion.div>

      {/* PARALLAX PANELS */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-[30%] right-[15%] hidden lg:block"
      >
        <div className="tech-card p-10 max-w-[300px] border-white/5 bg-black/40">
           <ShieldCheck className="w-8 h-8 text-indigo-500 mb-6" />
           <h4 className="text-lg font-bold text-white mb-3 tracking-tight">Vanguard Shield</h4>
           <p className="text-xs text-slate-500 leading-relaxed">Advanced kinetic barriers protecting your server against the pressures of extreme growth.</p>
        </div>
      </motion.div>

      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-[30%] left-[15%] hidden lg:block"
      >
        <div className="tech-card p-10 max-w-[300px] border-white/5 bg-black/40">
           <Cpu className="w-8 h-8 text-indigo-500 mb-6" />
           <h4 className="text-lg font-bold text-white mb-3 tracking-tight">Neural Sharding</h4>
           <p className="text-xs text-slate-500 leading-relaxed">Dynamic shard distribution allowing for uninterrupted processing at hyper-massive scales.</p>
        </div>
      </motion.div>
    </section>
  );
}

