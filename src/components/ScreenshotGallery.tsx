import { motion, useReducedMotion, AnimatePresence, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Monitor, Shield, Zap, BarChart3, Settings, Users, MessageSquare, Activity, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { config } from '../config';

interface ScreenshotProps {
  title: string;
  description: string;
  delay: number;
  type: 'overview' | 'moderation' | 'automation' | 'analytics';
  onClick: () => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: Array<{
    type: 'overview' | 'moderation' | 'automation' | 'analytics';
    title: string;
    description: string;
  }>;
  activeIndex: number;
  onNavigate: (index: number) => void;
}

function ScreenshotModal({ isOpen, onClose, screenshots, activeIndex, onNavigate }: ModalProps) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(Math.max(0, activeIndex - 1));
      if (e.key === 'ArrowRight') onNavigate(Math.min(screenshots.length - 1, activeIndex + 1));
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, activeIndex, screenshots.length, onClose, onNavigate]);

  if (!isOpen) return null;

  const currentScreenshot = screenshots[activeIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            className="relative mx-4 max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -right-4 -top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-all hover:bg-white/20"
              aria-label={t('gallery.modal.close')}
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Navigation buttons */}
            {activeIndex > 0 && (
              <button
                onClick={() => onNavigate(activeIndex - 1)}
                className="absolute -left-16 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-all hover:bg-white/20"
                aria-label={t('gallery.modal.previous')}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}

            {activeIndex < screenshots.length - 1 && (
              <button
                onClick={() => onNavigate(activeIndex + 1)}
                className="absolute -right-16 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-all hover:bg-white/20"
                aria-label={t('gallery.modal.next')}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            )}

            {/* Modal content */}
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-2xl">
              <DashboardScreenshotLarge type={currentScreenshot.type} title={currentScreenshot.title} description={currentScreenshot.description} />
              
              {/* Position indicator */}
              <div className="mt-6 text-center">
                <span className="text-sm text-slate-400">
                  {t('gallery.modal.position', { current: activeIndex + 1, total: screenshots.length })}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DashboardScreenshotLarge({ type, title, description }: { type: string; title: string; description: string }) {
  const getGradient = () => {
    switch (type) {
      case 'overview':
        return 'from-indigo-500/20 via-purple-500/10 to-transparent';
      case 'moderation':
        return 'from-red-500/20 via-orange-500/10 to-transparent';
      case 'automation':
        return 'from-cyan-500/20 via-blue-500/10 to-transparent';
      case 'analytics':
        return 'from-emerald-500/20 via-teal-500/10 to-transparent';
      default:
        return 'from-indigo-500/20 via-purple-500/10 to-transparent';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'overview':
        return Monitor;
      case 'moderation':
        return Shield;
      case 'automation':
        return Zap;
      case 'analytics':
        return BarChart3;
      default:
        return Monitor;
    }
  };

  const Icon = getIcon();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-3 w-3 rounded-full bg-red-400/60"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="h-3 w-3 rounded-full bg-yellow-400/60"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              className="h-3 w-3 rounded-full bg-emerald-400/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-indigo-400" />
            <span className="text-base font-semibold text-slate-200" id="modal-title">{title}</span>
          </div>
        </div>
        <Settings className="h-4 w-4 text-slate-500" />
      </div>

      {/* Content area */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          {[Monitor, Users, MessageSquare, Activity].map((IconComponent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5"
            >
              <IconComponent className="h-5 w-5 text-slate-400" />
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-4">
          {/* Metrics cards with animation */}
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-lg bg-gradient-to-br ${getGradient()} p-4 backdrop-blur-sm`}
              >
                <div className="mb-2 h-2 w-16 rounded bg-white/20"></div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '4rem' }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                  className="h-5 rounded bg-white/30"
                />
              </motion.div>
            ))}
          </div>

          {/* Animated chart */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-end gap-2">
              {[12, 16, 10, 20, 14, 18, 16, 22].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height * 4}px` }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                  className="w-3 rounded-t bg-indigo-500/50"
                />
              ))}
            </div>
            <div className="h-2 w-full rounded bg-white/5"></div>
          </div>

          {/* Animated list */}
          <div className="space-y-2">
            {[{ color: 'bg-cyan-400/60' }, { color: 'bg-emerald-400/60' }, { color: 'bg-purple-400/60' }].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + i * 0.1 }}
                className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                />
                <div className="h-2 flex-1 rounded bg-white/10"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-base leading-relaxed text-slate-300">{description}</p>
      </div>
    </div>
  );
}

function DashboardScreenshot({ title, description, delay, type, onClick }: ScreenshotProps) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const getGradient = () => {
    switch (type) {
      case 'overview':
        return 'from-indigo-500/20 via-purple-500/10 to-transparent';
      case 'moderation':
        return 'from-red-500/20 via-orange-500/10 to-transparent';
      case 'automation':
        return 'from-cyan-500/20 via-blue-500/10 to-transparent';
      case 'analytics':
        return 'from-emerald-500/20 via-teal-500/10 to-transparent';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'overview':
        return Monitor;
      case 'moderation':
        return Shield;
      case 'automation':
        return Zap;
      case 'analytics':
        return BarChart3;
    }
  };

  const getCTALinks = () => {
    switch (type) {
      case 'overview':
        return { primary: config.dashboardUrl, secondary: config.docsUrl };
      case 'moderation':
        return { primary: '#features', secondary: config.docsUrl };
      case 'automation':
        return { primary: '#features', secondary: config.docsUrl };
      case 'analytics':
        return { primary: '#stats', secondary: config.docsUrl };
    }
  };

  const Icon = getIcon();
  const links = getCTALinks();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : delay }}
      className="group relative"
    >
      <div 
        className="relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_20px_60px_rgba(99,102,241,0.2)]"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        aria-label={`View ${title} in detail`}
      >
        {/* Header simulado */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <motion.div
                animate={isInView ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2.5 w-2.5 rounded-full bg-red-400/60"
              />
              <motion.div
                animate={isInView ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                className="h-2.5 w-2.5 rounded-full bg-yellow-400/60"
              />
              <motion.div
                animate={isInView ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                className="h-2.5 w-2.5 rounded-full bg-emerald-400/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">{title}</span>
            </div>
          </div>
          <Settings className="h-3.5 w-3.5 text-slate-500" />
        </div>

        {/* Sidebar simulado */}
        <div className="mb-4 flex gap-4">
          <div className="flex flex-col gap-2">
            {[Monitor, Users, MessageSquare, Activity].map((IconComponent, i) => (
              <div key={i} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                <IconComponent className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>

          {/* Área de contenido */}
          <div className="flex-1 space-y-3">
            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((i) => (
                <div key={i} className={`rounded-lg bg-gradient-to-br ${getGradient()} p-3 backdrop-blur-sm`}>
                  <div className="mb-1 h-2 w-12 rounded bg-white/20"></div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '4rem' } : {}}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                    className="h-4 rounded bg-white/30"
                  />
                </div>
              ))}
            </div>

            {/* Gráfica simulada con animación */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-2 flex items-end gap-1">
                {[12, 16, 10, 20, 14, 18, 16, 22].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={isInView ? { height: `${height * 3}px` } : {}}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                    className="w-2 rounded-t bg-indigo-500/50"
                  />
                ))}
              </div>
              <div className="h-1.5 w-full rounded bg-white/5"></div>
            </div>

            {/* Lista simulada */}
            <div className="space-y-2">
              {[{ color: 'bg-cyan-400/60' }, { color: 'bg-emerald-400/60' }, { color: 'bg-purple-400/60' }].map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-2">
                  <motion.div
                    animate={isInView ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className={`h-2 w-2 rounded-full ${item.color}`}
                  />
                  <div className="h-2 flex-1 rounded bg-white/10"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm font-medium leading-relaxed text-slate-400">{description}</p>
        </div>

        {/* CTAs */}
        <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
          <a
            href={links.primary}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded-lg bg-indigo-500 px-4 py-2 text-center text-xs font-semibold text-white transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/50"
          >
            {t(`gallery.ctas.${type}.primary`)}
          </a>
          <a
            href={links.secondary}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-center text-xs font-semibold text-slate-300 transition-all hover:bg-white/10"
          >
            {t(`gallery.ctas.${type}.secondary`)}
          </a>
        </div>

        {/* Glow effect on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className={`absolute inset-0 rounded-[1.5rem] bg-gradient-to-br ${getGradient()} blur-xl`}></div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ScreenshotGallery() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const screenshots = [
    {
      type: 'overview' as const,
      title: t('gallery.screenshots.overview.title'),
      description: t('gallery.screenshots.overview.desc'),
    },
    {
      type: 'moderation' as const,
      title: t('gallery.screenshots.moderation.title'),
      description: t('gallery.screenshots.moderation.desc'),
    },
    {
      type: 'automation' as const,
      title: t('gallery.screenshots.automation.title'),
      description: t('gallery.screenshots.automation.desc'),
    },
    {
      type: 'analytics' as const,
      title: t('gallery.screenshots.analytics.title'),
      description: t('gallery.screenshots.analytics.desc'),
    },
  ];

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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <Monitor className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('gallery.tag')}</span>
          </motion.div>

          <motion.h2
            id="gallery-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('gallery.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('gallery.titleAccent')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
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
              delay={index * 0.1}
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
