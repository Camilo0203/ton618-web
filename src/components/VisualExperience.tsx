import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function VisualExperience() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 1.02]);

  return (
    <section ref={containerRef} id="experience" className="min-h-[100vh] py-24 relative bg-black overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <motion.div 
          style={{ y: shouldReduceMotion ? 0 : y1, willChange: 'transform' }}
          className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
        ></motion.div>
        
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-screen"
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

        <motion.div style={{ y: shouldReduceMotion ? 0 : y1 }} className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/[0.035] blur-[120px] rounded-full" />
        <div className="absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-[18%] h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <motion.div 
        style={{ 
          opacity: shouldReduceMotion ? 1 : opacity, 
          scale: shouldReduceMotion ? 1 : scale, 
          willChange: 'transform, opacity'
        }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tightest mb-6 leading-[0.85]">
          {t('experience.title')} <br/>
          <span className="headline-accent headline-accent-clean text-premium-gradient text-shadow-glow">{t('experience.titleAccent')}</span>
        </h2>
        
        <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto font-medium leading-relaxed tracking-[0.2em] uppercase opacity-70 italic">
          {t('experience.subtitle')}
        </p>
      </motion.div>
    </section>
  );
}
