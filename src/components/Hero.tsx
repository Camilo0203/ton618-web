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
  
  // Optimized scroll transforms
  const ySingularity = useTransform(scrollY, [0, 500], [0, 80]);
  const scaleSingularity = useTransform(scrollY, [0, 500], [1, 1.1]);
  const rotateSingularity = useTransform(scrollY, [0, 2000], [0, 180]);

  return (
    <section ref={containerRef} id="top" className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,20,50,0.8)_0%,rgba(1,1,3,1)_100%)]"></div>
        
        {/* NEBULA LAYERS - Optimized transforms */}
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] nebula-blur bg-indigo-600/10" style={{ transform: 'translate3d(0,0,0)' }}></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] nebula-blur bg-purple-600/10" style={{ transform: 'translate3d(0,0,0)' }}></div>
      </div>

      {/* THE SINGULARITY (TON 618 ABSTRACT PRESENCE) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ 
            y: shouldReduceMotion ? 0 : ySingularity, 
            scale: shouldReduceMotion ? 1 : scaleSingularity, 
            rotate: shouldReduceMotion ? 0 : rotateSingularity,
            willChange: 'transform'
          }}
          className="relative w-full h-full max-w-[1200px] max-h-[1200px] flex items-center justify-center"
        >
          {/* 1. Deep Gravitational Well (Core Atmosphere) */}
          <div className="absolute w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08)_0%,rgba(0,0,0,0)_70%)] blur-[80px] animate-pulse-soft"></div>
          
          {/* 2. Abstract Singular Point (The Energy Center - NOT solid black) */}
          <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,rgba(0,0,0,0)_60%)] blur-3xl"></div>
            <div className="absolute w-1/4 h-1/4 bg-white/5 rounded-full blur-[100px] mix-blend-screen"></div>
            
            {/* 3. Gravitational Waves (Fine Orbital Lines) */}
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="absolute inset-0 rounded-full border-[0.5px] border-indigo-500/10 animate-orbit-slow"
                style={{ 
                  padding: `${i * 15}%`, 
                  animationDuration: `${120 + i * 40}s`,
                  opacity: 0.3 - i * 0.05
                }}
              >
                <div className="w-full h-full rounded-full mask-radial-faded"></div>
              </div>
            ))}
          </div>

          {/* 4. Ethereal Halos (Large & Suttle) */}
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.03)_0%,rgba(0,0,0,0)_50%)] mask-radial-faded"></div>
          
          {/* 5. Spatial Distortion Accents (Refined Particles/Lines) */}
          {!shouldReduceMotion && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[150%] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent rotate-45 blur-[1px]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[150%] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent -rotate-45 blur-[1px]"></div>
            </div>
          )}

          {/* 6. Deep Dark Tensity (The "Weight" of the singularity) */}
          <div className="absolute w-[40%] h-[40%] rounded-full bg-black/40 blur-[120px]"></div>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
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
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed tracking-tight"
        >
          {t('hero.description')} <br className="hidden md:block"/>
          <span className="text-slate-600 font-normal">{t('hero.descriptionSub')}</span>
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <a href={inviteUrl} className="btn-premium-primary group">
            <Sparkles className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12 text-indigo-900" />
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
        animate={shouldReduceMotion ? {} : { y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-opacity duration-500 cursor-default"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
        <span className="text-[9px] uppercase tracking-[0.5em] font-black text-indigo-200">{t('hero.scroll')}</span>
      </motion.div>
    </section>
  );
}

