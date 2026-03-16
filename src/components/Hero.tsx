import { ChevronRight, Sparkles, Activity } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDiscordInviteUrl, getDashboardUrl } from '../config';
import { useRef } from 'react';

export default function Hero() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inviteUrl = getDiscordInviteUrl();
  const dashboardUrl = getDashboardUrl();

  const { scrollY } = useScroll();
  
  // High-performance scroll transforms
  const ySingularity = useTransform(scrollY, [0, 800], [0, 120]);
  const scaleSingularity = useTransform(scrollY, [0, 800], [1, 1.15]);
  const opacitySingularity = useTransform(scrollY, [0, 600], [1, 0.4]);

  return (
    <section ref={containerRef} id="top" className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-[#010103]">
      {/* 1. LAYER: COSMIC BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,20,50,0.5)_0%,rgba(1,1,3,1)_100%)]"></div>
        
        {/* NEBULA CLOUDS */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] nebula-blur bg-indigo-900/10 animate-drift-cosmic"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] nebula-blur bg-purple-900/10 animate-drift-cosmic" style={{ animationDelay: '-15s' }}></div>
      </div>

      {/* 2. LAYER: THE DEFINITIVE SINGULARITY (TON 618) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
        <motion.div 
          style={{ 
            y: shouldReduceMotion ? 0 : ySingularity, 
            scale: shouldReduceMotion ? 1 : scaleSingularity,
            opacity: opacitySingularity,
            willChange: 'transform, opacity'
          }}
          className="relative w-full h-full max-w-[1400px] max-h-[1400px] flex items-center justify-center"
        >
          {/* A. GRAVITATIONAL LENSING (Atmospheric Distortion) */}
          <div className="absolute inset-0 animate-pulse-subtle">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-indigo-500/10 blur-[2px] rotate-[-5deg]"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[120%] bg-indigo-500/5 blur-[3px] rotate-[15deg]"></div>
          </div>

          <div className="relative w-[600px] h-[600px] md:w-[900px] md:h-[900px] lg:w-[1100px] lg:h-[1100px] flex items-center justify-center">
            
            {/* B. PRIMARY ACCRETION DISK (Visual Protagonist) */}
            <div 
              className="absolute inset-0 accretion-disk-texture mask-accretion-organic animate-accretion-spin"
            ></div>
            
            {/* C. SECONDARY ENERGY FLOW (Inner Heat) */}
            <div 
              className="absolute inset-[5%] accretion-disk-texture mask-accretion-organic animate-energy-surge"
              style={{ animationDirection: 'reverse', animationDuration: '15s', opacity: 0.5 }}
            ></div>

            {/* D. EVENT HORIZON BOUNDARY (The Sharp Edge) */}
            <div className="absolute w-[38.5%] h-[38.5%] rounded-full border border-indigo-500/30 blur-[1px]"></div>
            <div className="absolute w-[39%] h-[39%] rounded-full border border-indigo-400/10 blur-[4px]"></div>

            {/* E. THE VOID CORE (Volumetric Depth) */}
            <div className="absolute w-[38%] h-[38%] rounded-full singularity-core-depth animate-core-pulse flex items-center justify-center overflow-hidden">
               {/* Inner Singularity Glow */}
               <div className="w-[20%] h-[20%] bg-indigo-900/20 rounded-full blur-[30px]"></div>
            </div>

            {/* F. CINEMATIC LENSING ARTIFACTS (Warping Light) */}
            {!shouldReduceMotion && (
              <div className="absolute inset-[-10%] lensing-warp pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-300/10 to-transparent blur-[1px]"></div>
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-purple-300/10 to-transparent blur-[1px]"></div>
              </div>
            )}
          </div>

          {/* G. FORE-GLOW (Light spill toward viewer) */}
          <div className="absolute w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] mix-blend-screen animate-pulse-soft"></div>
        </motion.div>
      </div>

      {/* 3. LAYER: CONTENT UI */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* LEGIBILITY VIGNETTE (Subtle Frame) */}
        <div className="absolute inset-[-100px] bg-black/20 blur-[100px] -z-10 pointer-events-none"></div>

        {/* STATUS BADGE */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 group cursor-default"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.3em]">{t('hero.badge')}</span>
          <Activity className="w-3 h-3 text-indigo-500 opacity-50 group-hover:rotate-180 transition-transform duration-700" />
        </motion.div>

        {/* MAIN HEADLINE */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[10vw] md:text-[8vw] lg:text-[7.5vw] font-extrabold leading-[0.85] tracking-tightest uppercase mb-6"
        >
          {t('hero.titleMain')} <br/>
          <span className="text-premium-gradient text-shadow-glow">{t('hero.titleAccent')}</span>
        </motion.h1>

        {/* SUBHEADLINE */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto mb-12 font-medium leading-relaxed tracking-tight"
        >
          {t('hero.description')} <br className="hidden md:block"/>
          <span className="text-slate-500 font-normal">{t('hero.descriptionSub')}</span>
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <a href={inviteUrl} className="btn-premium-primary group">
            <Sparkles className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12 text-black" />
            <span>{t('hero.ctaPrimary')}</span>
          </a>

          <a href={dashboardUrl} className="btn-premium-outline group">
            <span>{t('hero.ctaSecondary')}</span>
            <ChevronRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>

      {/* AMBIENT SCROLL INDICATOR */}
      <motion.div 
        animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30 hover:opacity-100 transition-opacity duration-500"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
        <span className="text-[9px] uppercase tracking-[0.5em] font-black text-indigo-200/80">{t('hero.scroll')}</span>
      </motion.div>
    </section>
  );
}
