import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Monitor, Shield, Zap, BarChart3, Settings, Users, MessageSquare, Activity } from 'lucide-react';

interface ScreenshotProps {
  title: string;
  description: string;
  delay: number;
  type: 'overview' | 'moderation' | 'automation' | 'analytics';
}

function DashboardScreenshot({ title, description, delay, type }: ScreenshotProps) {
  const shouldReduceMotion = useReducedMotion();

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

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : delay }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_20px_60px_rgba(99,102,241,0.2)]">
        {/* Header simulado */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/60"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60"></div>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <Monitor className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <MessageSquare className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Área de contenido */}
          <div className="flex-1 space-y-3">
            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-lg bg-gradient-to-br ${getGradient()} p-3 backdrop-blur-sm`}>
                <div className="mb-1 h-2 w-12 rounded bg-white/20"></div>
                <div className="h-4 w-16 rounded bg-white/30"></div>
              </div>
              <div className={`rounded-lg bg-gradient-to-br ${getGradient()} p-3 backdrop-blur-sm`}>
                <div className="mb-1 h-2 w-12 rounded bg-white/20"></div>
                <div className="h-4 w-16 rounded bg-white/30"></div>
              </div>
            </div>

            {/* Gráfica simulada */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-2 flex items-end gap-1">
                <div className="h-12 w-2 rounded-t bg-indigo-500/40"></div>
                <div className="h-16 w-2 rounded-t bg-indigo-500/50"></div>
                <div className="h-10 w-2 rounded-t bg-indigo-500/40"></div>
                <div className="h-20 w-2 rounded-t bg-indigo-500/60"></div>
                <div className="h-14 w-2 rounded-t bg-indigo-500/50"></div>
                <div className="h-18 w-2 rounded-t bg-indigo-500/55"></div>
                <div className="h-16 w-2 rounded-t bg-indigo-500/50"></div>
                <div className="h-22 w-2 rounded-t bg-indigo-500/65"></div>
              </div>
              <div className="h-1.5 w-full rounded bg-white/5"></div>
            </div>

            {/* Lista simulada */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400/60"></div>
                <div className="h-2 flex-1 rounded bg-white/10"></div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400/60"></div>
                <div className="h-2 flex-1 rounded bg-white/10"></div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-2">
                <div className="h-2 w-2 rounded-full bg-purple-400/60"></div>
                <div className="h-2 flex-1 rounded bg-white/10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm font-medium leading-relaxed text-slate-400">{description}</p>
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
