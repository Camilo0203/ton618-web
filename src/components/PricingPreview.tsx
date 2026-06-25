import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Crown, Lock, Users, Zap } from 'lucide-react';
import { instantReveal, motionViewport, sectionIntro, withDelay, motionStagger } from '../lib/motion';

const planCopy = {
  en: {
    freeLabel: 'FREE gives you the base',
    proLabel: 'PRO unlocks the serious server layer',
    rows: [
      ['Music', '10 queue, 5 min tracks, 80% volume', '200 queue, 6h tracks, Spotify, playlists, filters'],
      ['Tickets', 'Basic panels and support flow', 'Custom panels, custom embeds, SLA, smart pings, auto-close'],
      ['Verification', '5 questions and basic anti-raid', '20 questions, risk escalation, emoji captcha, stricter age rules'],
      ['Community', 'Basic polls, suggestions and giveaways', 'Advanced requirements, comments, auto threads and bonus entries'],
      ['Operations', 'Basic setup and status', 'Analytics, playbooks, incident mode and priority support'],
    ],
  },
  es: {
    freeLabel: 'FREE te da la base',
    proLabel: 'PRO desbloquea la capa seria del servidor',
    rows: [
      ['Música', 'Cola 10, canciones 5 min, volumen 80%', 'Cola 200, canciones 6h, Spotify, playlists y filtros'],
      ['Tickets', 'Paneles base y flujo de soporte', 'Paneles personalizados, embeds, SLA, smart pings y auto-cierre'],
      ['Verificación', '5 preguntas y anti-raid básico', '20 preguntas, risk escalation, captcha emoji y reglas de antigüedad'],
      ['Comunidad', 'Polls, sugerencias y sorteos básicos', 'Requisitos avanzados, comentarios, hilos auto y bonus entries'],
      ['Operación', 'Setup y estado básico', 'Analytics, playbooks, modo incidente y soporte prioritario'],
    ],
  },
} as const;

export default function PricingPreview() {
  const { t, i18n } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const language = i18n.language.startsWith('es') ? 'es' : 'en';
  const comparison = planCopy[language];
  
  const reveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const cardReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);

  return (
    <section id="pricing-preview" aria-labelledby="pricing-preview-heading" className="relative overflow-hidden bg-black py-16 sm:py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.p
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-6 text-xs font-bold uppercase tracking-wide-readable text-indigo-400"
          >
            {t('pricing.eyebrow')}
          </motion.p>
          <motion.h2
            id="pricing-preview-heading"
            variants={cardReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-5xl"
          >
            {t('pricing.headline')}
          </motion.h2>
        </div>

        {/* Compact Layout: Side notes + Center Card + Side note */}
        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="grid items-stretch gap-4 sm:grid-cols-[1fr_1.5fr_1fr]"
        >
          {/* Free Note */}
          <div className="flex flex-col justify-center rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {t('pricing.free.name')}
              </span>
            </div>
            <p className="text-xl font-semibold text-white">{t('pricing.free.description')}</p>
          </div>

          {/* Pro Card - Main */}
          <div className="relative flex flex-col justify-between rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-6 text-center">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1">
                <Crown className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-400">
                  {t('pricing.pro.name')}
                </span>
                <span className="text-[10px] font-bold text-white">•</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-400">
                  {t('pricing.pro.badge')}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{t('pricing.pro.description')}</p>
            </div>
            <Link
              to="/pricing"
              className="group mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label={t('pricing.pro.cta')}
            >
              {t('pricing.pro.cta')}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Enterprise Note */}
          <div className="flex flex-col justify-center rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {t('pricing.enterprise.name')}
              </span>
            </div>
            <p className="text-xl font-semibold text-white">{t('pricing.enterprise.description')}</p>
          </div>
        </motion.div>

        <motion.div
          variants={cardReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
        >
          <div className="grid border-b border-white/10 bg-white/[0.03] text-xs font-black uppercase tracking-[0.18em] text-slate-400 md:grid-cols-[1fr_1.25fr_1.45fr]">
            <div className="px-4 py-3">{t('pricing.tag')}</div>
            <div className="flex items-center gap-2 px-4 py-3">
              <Lock className="h-3.5 w-3.5" />
              {comparison.freeLabel}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 text-indigo-200">
              <Crown className="h-3.5 w-3.5" />
              {comparison.proLabel}
            </div>
          </div>

          <div className="divide-y divide-white/8">
            {comparison.rows.map(([area, free, pro]) => (
              <div key={area} className="grid gap-0 md:grid-cols-[1fr_1.25fr_1.45fr]">
                <div className="px-4 py-4 text-sm font-black text-white">{area}</div>
                <div className="flex gap-2 px-4 py-4 text-sm leading-6 text-slate-400">
                  <Zap className="mt-1 h-4 w-4 flex-none text-slate-500" />
                  <span>{free}</span>
                </div>
                <div className="flex gap-2 border-t border-white/8 px-4 py-4 text-sm font-semibold leading-6 text-indigo-100 md:border-l md:border-t-0 md:border-white/8">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-emerald-300" />
                  <span>{pro}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
