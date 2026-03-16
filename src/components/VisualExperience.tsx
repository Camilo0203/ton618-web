import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';

export default function VisualExperience() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 25]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.05]);

  return (
    <section ref={containerRef} id="experience" className="h-[200vh] relative bg-black overflow-hidden flex items-center justify-center">
      {/* DEEP SPACE BACKGROUND */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <motion.div 
          style={{ y: shouldReduceMotion ? 0 : y1, willChange: 'transform' }}
          className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
        ></motion.div>
        
        {/* Dynamic Nebulas - Optimized with GPU acceleration hint */}
        <motion.div style={{ y: shouldReduceMotion ? 0 : y1, willChange: 'transform' }} className="absolute top-1/4 left-1/4 w-[600px] h-[600px] nebula-blur bg-indigo-500/10" />
        <motion.div style={{ y: shouldReduceMotion ? 0 : y2, willChange: 'transform' }} className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] nebula-blur bg-purple-500/10" />
      </div>

      {/* CORE EXPERIENCE VISUAL */}
      <motion.div 
        style={{ 
          opacity: shouldReduceMotion ? 1 : opacity, 
          scale: shouldReduceMotion ? 1 : scale, 
          rotate: shouldReduceMotion ? 0 : rotate,
          willChange: 'transform, opacity'
        }}
        className="relative z-10 text-center px-6"
      >
        <div className="relative mb-20 inline-block">
          {/* Energy Core HUD */}
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-white/[0.05] flex items-center justify-center relative">
            <div className="absolute inset-[-10px] border border-indigo-500/10 rounded-full animate-[spin_25s_linear_infinite]"></div>
            <div className="absolute inset-[-30px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
            
            <div className="w-6 h-6 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.6)] z-10"></div>
            
            {/* Energy Ripples - Simplified opacity animation */}
            {!shouldReduceMotion && (
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"
              />
            )}
          </div>
          
          {/* Floating HUD Elements */}
          <div className="absolute top-0 -right-20 animate-float-subtle">
             <div className="cinematic-glass p-3 rounded-xl border-indigo-500/10 flex gap-3 items-center">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('experience.hud')}</span>
             </div>
          </div>
        </div>

        <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tightest mb-10 leading-[0.85]">
          {t('experience.title')} <br/>
          <span className="text-premium-gradient text-shadow-glow">{t('experience.titleAccent')}</span>
        </h2>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed tracking-[0.3em] uppercase opacity-60 italic">
          {t('experience.subtitle')}
        </p>
      </motion.div>

      {/* PARALLAX PANELS - Optimized shadows and blurs */}
      <motion.div 
        style={{ y: shouldReduceMotion ? 0 : y1, willChange: 'transform' }}
        className="absolute top-[30%] right-[10%] hidden xl:block"
      >
        <div className="tech-card p-8 max-w-[280px] border-white/5 bg-black/40 backdrop-blur-md">
           <ShieldCheck className="w-8 h-8 text-indigo-500 mb-6" />
           <h4 className="text-lg font-bold text-white mb-3 tracking-tight">{t('experience.card1Title')}</h4>
           <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('experience.card1Desc')}</p>
        </div>
      </motion.div>

      <motion.div 
        style={{ y: shouldReduceMotion ? 0 : y2, willChange: 'transform' }}
        className="absolute bottom-[30%] left-[10%] hidden xl:block"
      >
        <div className="tech-card p-8 max-w-[280px] border-white/5 bg-black/40 backdrop-blur-md">
           <Cpu className="w-8 h-8 text-indigo-500 mb-6" />
           <h4 className="text-lg font-bold text-white mb-3 tracking-tight">{t('experience.card2Title')}</h4>
           <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('experience.card2Desc')}</p>
        </div>
      </motion.div>
    </section>
  );
}

