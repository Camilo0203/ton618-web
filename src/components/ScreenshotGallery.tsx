import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Monitor } from 'lucide-react';
import { useState } from 'react';
import DashboardScreenshot from './gallery/DashboardScreenshot';
import ScreenshotModal from './gallery/ScreenshotModal';
import { buildScreenshotEntries } from './gallery/screenshotData';
import { instantReveal, motionStagger, motionViewport, sectionIntro, withDelay } from '../lib/motion';

export default function ScreenshotGallery() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const secondaryIntroReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);

  const screenshots = buildScreenshotEntries(t);

  const handleOpenModal = (index: number) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            variants={introReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <Monitor className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('gallery.tag')}</span>
          </motion.div>

          <motion.h2
            id="gallery-heading"
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('gallery.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('gallery.titleAccent')}</span>
          </motion.h2>

          <motion.p
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('gallery.description')}
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {screenshots.map((screenshot, index) => (
            <DashboardScreenshot
              key={screenshot.type}
              type={screenshot.type}
              title={screenshot.title}
              description={screenshot.description}
              image={screenshot.image}
              delay={index * 0.05}
              onClick={() => handleOpenModal(index)}
            />
          ))}
        </div>
      </div>

      <ScreenshotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        screenshots={screenshots}
        activeIndex={activeIndex}
        onNavigate={setActiveIndex}
      />
    </section>
  );
}
