import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Shield, Zap, Users } from 'lucide-react';
import { getDiscordInviteUrl } from '../config';
import Logo from './Logo';
import { instantReveal, motionViewport, motionStagger, sectionIntro, withDelay } from '../lib/motion';

export default function FinalCTA() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const inviteUrl = getDiscordInviteUrl();
  const canInvite = Boolean(inviteUrl);
  const reveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const trustReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);

  const trustSignals = [
    { icon: Shield, text: t('final.trust.free', { defaultValue: 'Free to start' }) },
    { icon: Zap, text: t('final.trust.instant', { defaultValue: 'Instant setup' }) },
    { icon: Users, text: t('final.trust.servers', { defaultValue: 'Trusted by 500+ servers' }) },
  ];

  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-black py-24 sm:py-32"
    >
      {/* Layered ambient glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/10 to-black" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent" />

      {/* Large central glow */}
      <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/8 blur-[160px]" />
      {/* Accent glows */}
      <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[120px]" />
      <div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="mx-auto max-w-4xl"
        >
          {/* Eyebrow */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2">
            <div className={`h-1.5 w-1.5 rounded-full bg-cyan-400 ${shouldReduceMotion ? '' : 'animate-pulse'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">
              {t('final.eyebrow', { defaultValue: 'Join now' })}
            </span>
          </div>

          <h2
            id="final-cta-heading"
            className="mb-8 text-[clamp(2.5rem,7vw,6rem)] font-black uppercase leading-[0.9] tracking-tightest text-white"
          >
            {t('final.title')} <br />
            <span className="headline-accent headline-accent-solid">
              {t('final.titleAccent')}
            </span>
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-base font-normal leading-relaxed text-slate-300 md:text-lg">
            {t('final.description')}
          </p>

          <div className="flex flex-col items-center justify-center gap-6">
            {canInvite ? (
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium-primary group text-base !px-10 !py-5 sm:text-lg sm:!py-6"
              >
                <Logo
                  size="xs"
                  withText={false}
                  frameClassName="border-black/5 bg-white/10 shadow-none"
                  imageClassName="scale-[1.02]"
                />
                <span>{t('final.cta')}</span>
                <Sparkles
                  className={`h-5 w-5 ${shouldReduceMotion ? '' : 'transition-transform duration-200 group-hover:rotate-12'}`}
                />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="btn-premium-primary cursor-not-allowed text-base opacity-60 !px-10 !py-5 sm:text-lg sm:!py-6"
                title={t('final.unavailable')}
              >
                <Logo
                  size="xs"
                  withText={false}
                  frameClassName="border-black/5 bg-white/10 shadow-none"
                  imageClassName="scale-[1.02]"
                />
                <span>{t('final.cta')}</span>
                <Sparkles className="h-5 w-5" />
              </button>
            )}

            <p className="text-sm text-slate-500">
              {t('final.subtitle')}
            </p>
          </div>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          variants={trustReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 border-t border-white/5 pt-10"
        >
          {trustSignals.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Icon className="h-4 w-4 text-indigo-400/70" aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
