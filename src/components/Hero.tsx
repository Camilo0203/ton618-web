import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Sparkles, Activity } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDiscordInviteUrl, getDashboardUrl } from '../config';

export default function Hero() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const inviteUrl = getDiscordInviteUrl();
  const dashboardUrl = getDashboardUrl();
  const instantReveal = { initial: false, animate: { opacity: 1 }, transition: { duration: 0.01 } };
  const fadeInUp = shouldReduceMotion
    ? instantReveal
    : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };
  const fadeInScale = shouldReduceMotion
    ? instantReveal
    : { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.8, delay: 0.1 } };
  const fadeInBody = shouldReduceMotion
    ? instantReveal
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 } };
  const fadeInActions = shouldReduceMotion
    ? instantReveal
    : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.4 } };

  useEffect(() => {
    if (shouldReduceMotion) {
      setShouldRenderVideo(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      return;
    }

    setShouldRenderVideo(true);
  }, [shouldReduceMotion]);

  return (
    <section id="top" className="relative min-h-[85dvh] flex items-center justify-center pt-32 pb-12 overflow-hidden bg-[#000]">
      {/* 1. VIDEO BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {shouldRenderVideo && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          >
            <source src="/videos/ton618-hero.mp4" type="video/mp4" />
          </video>
        )}

        <div
          className={`absolute inset-0 ${
            shouldReduceMotion
              ? 'bg-[radial-gradient(circle_at_50%_32%,rgba(99,102,241,0.24),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.1),transparent_24%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.06),transparent_18%),linear-gradient(180deg,rgba(5,6,15,0.34)_0%,rgba(0,0,0,0.84)_68%,rgba(0,0,0,0.96)_100%)]'
              : 'bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.18),transparent_36%),radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,rgba(5,6,15,0.18)_0%,rgba(0,0,0,0.75)_72%,rgba(0,0,0,0.94)_100%)]'
          }`}
        ></div>
        {shouldReduceMotion && <div className="bg-film-grain absolute inset-0 opacity-18"></div>}
        {shouldReduceMotion && <div className="bg-hero-still absolute inset-0 opacity-70"></div>}

        {/* 2. OVERLAY LAYERS */}
        {/* Primary Dark Overlay */}
        <div className={`absolute inset-0 z-10 ${shouldReduceMotion ? 'bg-black/72' : 'bg-black/60'}`}></div>
        
        {/* Radial Gradient Overlay (Softens the center/edges) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.8)_100%)] z-15"></div>
        
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-20"></div>

        {/* BOTTOM TRANSITION MASK (Cinematic fade to next section) */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-25"></div>
      </div>

      {/* 3. UI CONTENT LAYER */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 text-center">
        {/* STATUS BADGE */}
        <motion.div 
          {...fadeInUp}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-10 group cursor-default"
        >
          <div className={`h-1.5 w-1.5 rounded-full bg-indigo-500 ${shouldReduceMotion ? '' : 'animate-pulse'}`}></div>
          <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.4em]">{t('hero.badge')}</span>
          <Activity className={`h-3.5 w-3.5 text-indigo-500 opacity-50 ${shouldReduceMotion ? '' : 'transition-transform duration-1000 group-hover:rotate-180'}`} />
        </motion.div>

        {/* MAIN HEADLINE */}
        <motion.h1 
          {...fadeInScale}
          className="text-[11vw] md:text-[9vw] lg:text-[8vw] font-black leading-[0.8] tracking-tightest uppercase mb-8"
        >
          {t('hero.titleMain')} <br/>
          <span className="text-premium-gradient text-shadow-premium">{t('hero.titleAccent')}</span>
        </motion.h1>

        {/* SUBHEADLINE */}
        <motion.p 
          {...fadeInBody}
          className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto mb-14 font-medium leading-relaxed tracking-tight"
        >
          {t('hero.description')} <br className="hidden md:block"/>
          <span className="text-slate-500 font-normal mt-2 block">{t('hero.descriptionSub')}</span>
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div 
          {...fadeInActions}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <a href={inviteUrl} className="btn-premium-primary group">
            <Sparkles className={`h-5 w-5 ${shouldReduceMotion ? '' : 'transition-transform duration-500 group-hover:rotate-12'}`} />
            <span>{t('hero.ctaPrimary')}</span>
          </a>

          <a href={dashboardUrl} className="btn-premium-outline group shadow-lg hover:shadow-indigo-500/10">
            <span>{t('hero.ctaSecondary')}</span>
            <ChevronRight className={`h-4 w-4 ${shouldReduceMotion ? '' : 'transition-all duration-300 group-hover:translate-x-1'}`} />
          </a>
        </motion.div>
      </div>

      {/* AMBIENT SCROLL INDICATOR */}
      <motion.div 
        animate={shouldReduceMotion ? { opacity: 0.3 } : { y: [0, 8, 0] }}
        transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none ${shouldReduceMotion ? 'opacity-30' : 'opacity-40 hover:opacity-100 transition-all duration-700'}`}
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
        <span className="text-[10px] uppercase tracking-[0.6em] font-black text-indigo-300/50">{t('hero.scroll')}</span>
      </motion.div>
    </section>
  );
}
