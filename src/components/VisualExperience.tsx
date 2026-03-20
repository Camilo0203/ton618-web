import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function VisualExperience() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.2, 1, 1, 0.45]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 1.02]);

  return (
    <section
      ref={containerRef}
      id="experience"
      aria-labelledby="experience-heading"
      className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-black py-24"
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : y1, willChange: 'transform' }}
          className="absolute inset-0 opacity-[0.025] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
        ></motion.div>

        <div
          className="absolute inset-0 opacity-[0.2] mix-blend-screen"
          style={{
            maskImage: 'radial-gradient(circle at center, transparent 0%, transparent 14%, black 50%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, transparent 14%, black 50%, transparent 90%)',
          }}
        >
          <video autoPlay muted loop playsInline preload="none" poster="/cosmic-poster.jpg" aria-hidden="true" className="h-full w-full scale-110 object-cover">
            <source src="/videos/cosmic-haze.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,4,10,0.12)_0%,rgba(2,4,10,0.18)_40%,rgba(0,0,0,0.72)_100%)]" />
        <motion.div style={{ y: shouldReduceMotion ? 0 : y1 }} className="absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />
        <div className="absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-[18%] h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
      </div>

      <motion.div
        style={{
          opacity: shouldReduceMotion ? 1 : opacity,
          scale: shouldReduceMotion ? 1 : scale,
          willChange: 'transform, opacity',
        }}
        className="relative z-10 mx-auto max-w-6xl px-6"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="absolute inset-x-10 top-1/2 h-48 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(2,3,8,0.88)_0%,rgba(2,3,8,0.72)_48%,rgba(2,3,8,0.16)_78%,transparent_100%)] blur-2xl" aria-hidden="true" />
            <h2 id="experience-heading" className="relative z-10 mb-6 text-4xl font-black uppercase leading-[0.88] tracking-tightest text-white sm:text-6xl lg:text-7xl">
              {t('experience.title')} <br />
              <span className="headline-accent headline-accent-solid">{t('experience.titleAccent')}</span>
            </h2>

            <p className="relative z-10 max-w-2xl text-base font-medium leading-relaxed text-slate-300 md:text-lg">
              {t('experience.subtitle')}
            </p>
          </div>

          <div className="grid gap-4">
            <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="tech-card">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">{t('experience.card1Eyebrow')}</p>
              <h3 className="mb-3 text-xl font-bold text-white">{t('experience.card1Title')}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t('experience.card1Desc')}</p>
            </motion.article>

            <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="tech-card">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">{t('experience.card2Eyebrow')}</p>
              <h3 className="mb-3 text-xl font-bold text-white">{t('experience.card2Title')}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{t('experience.card2Desc')}</p>
            </motion.article>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
