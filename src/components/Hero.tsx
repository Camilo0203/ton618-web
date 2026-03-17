import { useState } from 'react';
import { ChevronRight, Sparkles, Activity } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDiscordInviteUrl, getDashboardUrl } from '../config';
import Logo from './Logo';

export default function Hero() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
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

  return (
    <section id="top" className="relative min-h-[85dvh] flex items-center justify-center pt-32 pb-12 overflow-hidden bg-[#000]">
      {/* 1. BACKDROP LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div
          className={`absolute inset-0 bg-[#02030a] bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
            videoReady && !videoFailed ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ backgroundImage: 'url("/hero-poster.jpg")' }}
          aria-hidden="true"
        />

        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          aria-hidden="true"
          onLoadedData={() => {
            setVideoReady(true);
            setVideoFailed(false);
          }}
          onError={() => {
            setVideoReady(false);
            setVideoFailed(true);
          }}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
            videoFailed ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <source src="/videos/ton618-hero.mp4" type="video/mp4" />
        </video>

        <div
          className={`absolute inset-0 ${
            shouldReduceMotion
              ? 'bg-[radial-gradient(circle_at_50%_30%,rgba(8,10,24,0.62),transparent_36%),radial-gradient(circle_at_50%_32%,rgba(99,102,241,0.15),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.03),transparent_22%),radial-gradient(circle_at_82%_24%,rgba(139,92,246,0.06),transparent_18%),linear-gradient(180deg,rgba(5,6,15,0.78)_0%,rgba(1,2,8,0.92)_58%,rgba(0,0,0,0.985)_100%)]'
              : 'bg-[radial-gradient(circle_at_50%_34%,rgba(7,9,20,0.5),transparent_38%),radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.12),transparent_36%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.03),transparent_20%),radial-gradient(circle_at_84%_22%,rgba(139,92,246,0.07),transparent_18%),linear-gradient(180deg,rgba(5,6,15,0.42)_0%,rgba(0,0,0,0.86)_72%,rgba(0,0,0,0.97)_100%)]'
          }`}
        />
        <div className="absolute inset-x-[12%] top-[12%] h-[28rem] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.22)_0%,rgba(67,56,202,0.16)_38%,rgba(15,23,42,0.04)_72%,transparent_100%)] blur-3xl" />
        <div className="absolute inset-x-[24%] top-[18%] h-[20rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,rgba(99,102,241,0.08)_24%,transparent_68%)] blur-[120px]" />
        {shouldReduceMotion && <div className="bg-film-grain absolute inset-0 opacity-[0.08]"></div>}

        {/* 2. OVERLAY LAYERS */}
        {/* Primary Dark Overlay */}
        <div className={`absolute inset-0 z-10 ${shouldReduceMotion ? 'bg-black/62' : 'bg-black/58'}`}></div>
        
        {/* Radial Gradient Overlay (Softens the center/edges) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(3,4,12,0.06)_0%,rgba(3,4,12,0.18)_30%,transparent_52%),radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_74%,rgba(0,0,0,0.82)_100%)] z-15" />
        
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.9)] z-20" />

        {/* BOTTOM TRANSITION MASK (Cinematic fade to next section) */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-25" />
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

        <motion.div {...fadeInScale} className="mb-8 flex justify-center">
          <Logo
            size="xl"
            subtitle="Official Brand Mark"
            className="gap-6 md:gap-7"
            frameClassName="h-[10.5rem] w-[10.5rem] md:h-[12rem] md:w-[12rem] lg:h-[13rem] lg:w-[13rem]"
            imageClassName="drop-shadow-[0_24px_56px_rgba(99,102,241,0.24)]"
          />
        </motion.div>

        {/* MAIN HEADLINE */}
        <motion.h1 
          {...fadeInBody}
          className="text-[11vw] md:text-[9vw] lg:text-[8vw] font-black leading-[0.8] tracking-tightest uppercase mb-8"
        >
          {t('hero.titleMain')} <br/>
          <span className="headline-accent headline-accent-solid">{t('hero.titleAccent')}</span>
        </motion.h1>

        {/* SUBHEADLINE */}
        <motion.p 
          {...fadeInActions}
          className="text-lg md:text-xl text-slate-200/95 max-w-2xl mx-auto mb-14 font-medium leading-relaxed tracking-tight"
        >
          {t('hero.description')} <br className="hidden md:block"/>
          <span className="mt-2 block font-normal text-slate-400">{t('hero.descriptionSub')}</span>
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div 
          {...(shouldReduceMotion
            ? instantReveal
            : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.55 } })}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
        >
          <a href={inviteUrl} className="btn-premium-primary group w-full sm:w-auto">
            <Sparkles className={`h-5 w-5 ${shouldReduceMotion ? '' : 'transition-transform duration-500 group-hover:rotate-12'}`} />
            <span>{t('hero.ctaPrimary')}</span>
          </a>

          <a href={dashboardUrl} className="btn-premium-outline group w-full sm:w-auto shadow-lg hover:shadow-indigo-500/10">
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
