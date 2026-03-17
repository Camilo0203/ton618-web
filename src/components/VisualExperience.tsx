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
    <section ref={containerRef} id="experience" className="min-h-[100vh] py-24 relative bg-black overflow-hidden flex items-center justify-center">
      {/* DEEP SPACE BACKGROUND */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* Deep Space Texture */}
        <motion.div 
          style={{ y: shouldReduceMotion ? 0 : y1, willChange: 'transform' }}
          className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
        ></motion.div>
        
        {/* ORGANIC ATMOSPHERIC VIDEO - No rectangular containers */}
        <div 
          className="absolute inset-0 opacity-[0.12] mix-blend-screen"
          style={{ 
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
          }}
        >
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            preload="metadata"
            className="w-full h-full object-cover scale-110"
          >
            <source src="/videos/cosmic-haze.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Dynamic Light Accents - Extremely subtle and soft to avoid "blocks" */}
        <motion.div style={{ y: shouldReduceMotion ? 0 : y1 }} className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <motion.div style={{ y: shouldReduceMotion ? 0 : y2 }} className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* CORE EXPERIENCE VISUAL */}
      <motion.div 
        style={{ 
          opacity: shouldReduceMotion ? 1 : opacity, 
          scale: shouldReduceMotion ? 1 : scale, 
          rotate: shouldReduceMotion ? 0 : rotate,
          willChange: 'transform, opacity'
        }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        <div className="relative mb-12 inline-block">
          {/* Energy Core HUD - Resized */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/[0.05] flex items-center justify-center relative">
            <div className="absolute inset-[-6px] border border-indigo-500/10 rounded-full animate-[spin_25s_linear_infinite]"></div>
            <div className="absolute inset-[-15px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
            
            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] z-10"></div>
            
            {!shouldReduceMotion && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute w-12 h-12 bg-indigo-500/10 rounded-full blur-lg"
              />
            )}
          </div>
          
          {/* Floating HUD Elements */}
          <div className="absolute top-0 -right-16 animate-float-subtle">
             <div className="cinematic-glass p-2 rounded-lg border-indigo-500/10 flex gap-2 items-center">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('experience.hud')}</span>
             </div>
          </div>
        </div>

        <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tightest mb-6 leading-[0.85]">
          {t('experience.title')} <br/>
          <span className="text-premium-gradient text-shadow-glow">{t('experience.titleAccent')}</span>
        </h2>
        
        <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto font-medium leading-relaxed tracking-[0.2em] uppercase opacity-70 italic">
          {t('experience.subtitle')}
        </p>
      </motion.div>

      {/* PARALLAX PANELS - Adjusted position for tighter layout */}
      <motion.div 
        style={{ y: shouldReduceMotion ? 0 : y1, willChange: 'transform' }}
        className="absolute top-[15%] right-[5%] hidden xl:block"
      >
        <div className="tech-card p-6 max-w-[240px] border-white/5 bg-black/40 backdrop-blur-md">
           <ShieldCheck className="w-6 h-6 text-indigo-500 mb-4" />
           <h4 className="text-base font-bold text-white mb-2 tracking-tight">{t('experience.card1Title')}</h4>
           <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{t('experience.card1Desc')}</p>
        </div>
      </motion.div>

      <motion.div 
        style={{ y: shouldReduceMotion ? 0 : y2, willChange: 'transform' }}
        className="absolute bottom-[15%] left-[5%] hidden xl:block"
      >
        <div className="tech-card p-6 max-w-[240px] border-white/5 bg-black/40 backdrop-blur-md">
           <Cpu className="w-6 h-6 text-indigo-500 mb-4" />
           <h4 className="text-base font-bold text-white mb-2 tracking-tight">{t('experience.card2Title')}</h4>
           <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{t('experience.card2Desc')}</p>
        </div>
      </motion.div>
    </section>
  );
}

