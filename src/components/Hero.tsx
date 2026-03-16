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
  
  // High-fidelity scroll effects
  const ySingularity = useTransform(scrollY, [0, 1000], [0, 200]);
  const scaleSingularity = useTransform(scrollY, [0, 1000], [1, 1.3]);

  return (
    <section ref={containerRef} id="top" className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-[#010103]">
      {/* 1. COSMIC BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,20,50,0.4)_0%,rgba(1,1,3,1)_100%)]"></div>
        
        {/* NEBULA VOLUMES */}
        <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[80%] nebula-blur bg-indigo-900/10 animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] nebula-blur bg-purple-900/10 animate-pulse-soft" style={{ animationDelay: '-10s' }}></div>
      </div>

      {/* 2. THE GARGANTUA SINGULARITY (TON 618) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
        <motion.div 
          style={{ 
            y: shouldReduceMotion ? 0 : ySingularity, 
            scale: shouldReduceMotion ? 1 : scaleSingularity,
            willChange: 'transform'
          }}
          className="relative w-full h-full max-w-[1500px] max-h-[1500px] flex items-center justify-center"
        >
          {/* COMPOSITION RADIUS CONTAINER */}
          <div className="relative w-[600px] h-[600px] md:w-[900px] md:h-[900px] lg:w-[1200px] lg:h-[1200px] flex items-center justify-center">
            
            {/* A. LENSED BACK DISK - TOP ARCH (The Light Behind) */}
            <div 
              className="absolute w-[80%] h-[50%] top-[-5%] left-[10%] matter-flow-disk lensing-arch-mask animate-doppler-shimmer"
              style={{ transform: 'rotateX(-20deg) scale(1.1)', filter: 'blur(5px)' }}
            ></div>

            {/* B. LENSED BACK DISK - BOTTOM ARCH (The Light Beneath) */}
            <div 
              className="absolute w-[70%] h-[40%] bottom-[5%] left-[15%] matter-flow-disk lensing-arch-mask-bottom animate-doppler-shimmer"
              style={{ transform: 'rotateX(20deg) scale(0.9)', filter: 'blur(8px)', opacity: 0.6 }}
            ></div>

            {/* C. PRIMARY ACCRETION DISK - FRONT BAND (Matter in orbit) */}
            <div 
              className="absolute w-[120%] h-[25%] z-20 matter-flow-disk animate-orbit-matter"
              style={{ 
                maskImage: 'radial-gradient(circle at center, transparent 35%, black 45%, black 55%, transparent 65%)',
                WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 45%, black 55%, transparent 65%)',
                transform: 'rotateX(75deg) rotateZ(0deg)',
                background: 'conic-gradient(from 180deg at 50% 50%, transparent 0%, rgba(99,102,241,0.2) 15%, rgba(255,255,255,0.7) 45%, rgba(167,139,250,0.6) 55%, transparent 100%)'
              }}
            ></div>

            {/* D. THE VOID CORE (Event Horizon) */}
            <div className="absolute w-[30%] h-[30%] z-10 flex items-center justify-center">
                {/* Einstein Ring (Photosphere) */}
                <div className="absolute inset-[-2%] rounded-full einstein-ring animate-gravity-pulse"></div>
                
                {/* Event Horizon (Black Void) */}
                <div className="absolute inset-0 rounded-full event-horizon-core flex items-center justify-center overflow-hidden">
                    {/* Interior Mass Shimmer */}
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)]"></div>
                </div>
            </div>

            {/* E. DOPPLER BEAMING (Left-side Intensity Asymmetry) */}
            <div className="absolute left-[5%] top-1/2 -translate-y-1/2 w-[30%] h-[20%] bg-indigo-500/10 blur-[100px] z-30 mix-blend-screen pointer-events-none"></div>

            {/* F. GRAVITATIONAL WARP FIELD (Lens Artifacts) */}
            <div className="absolute inset-0 lensing-warp-field z-0 opacity-40"></div>
          </div>

          {/* G. AMBIENT ATMOSPHERIC SPILL */}
          <div className="absolute w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[150px] mix-blend-color-dodge animate-pulse-soft"></div>
        </motion.div>
      </div>

      {/* 3. UI CONTENT LAYER */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 text-center">
        {/* LEGIBILITY VIGNETTE */}
        <div className="absolute inset-[-150px] bg-black/40 blur-[100px] -z-10 rounded-full"></div>

        {/* STATUS BADGE */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-10 group cursor-default"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.4em]">{t('hero.badge')}</span>
          <Activity className="w-3.5 h-3.5 text-indigo-500 opacity-50 group-hover:rotate-180 transition-transform duration-1000" />
        </motion.div>

        {/* MAIN HEADLINE */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[11vw] md:text-[9vw] lg:text-[8vw] font-black leading-[0.8] tracking-tightest uppercase mb-8"
        >
          {t('hero.titleMain')} <br/>
          <span className="text-premium-gradient text-shadow-premium">{t('hero.titleAccent')}</span>
        </motion.h1>

        {/* SUBHEADLINE */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto mb-14 font-medium leading-relaxed tracking-tight"
        >
          {t('hero.description')} <br className="hidden md:block"/>
          <span className="text-slate-500 font-normal mt-2 block">{t('hero.descriptionSub')}</span>
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <a href={inviteUrl} className="btn-premium-primary group">
            <Sparkles className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12" />
            <span>{t('hero.ctaPrimary')}</span>
          </a>

          <a href={dashboardUrl} className="btn-premium-outline group shadow-lg hover:shadow-indigo-500/10">
            <span>{t('hero.ctaSecondary')}</span>
            <ChevronRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>

      {/* AMBIENT SCROLL INDICATOR */}
      <motion.div 
        animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-all duration-700 pointer-events-none"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
        <span className="text-[10px] uppercase tracking-[0.6em] font-black text-indigo-300/50">{t('hero.scroll')}</span>
      </motion.div>
    </section>
  );
}
