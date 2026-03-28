import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Quote, Star, Users } from 'lucide-react';
import { memo } from 'react';
import { instantReveal, motionStagger, motionViewport, revealUp, sectionIntro, withDelay, withDuration } from '../lib/motion';

interface TestimonialCardProps {
  name: string;
  role: string;
  server: string;
  members: string;
  quote: string;
  index: number;
  accentColor: string;
}

const TestimonialCard = memo(({ name, role, server, members, quote, index, accentColor }: TestimonialCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const cardReveal = shouldReduceMotion ? instantReveal : withDelay(withDuration(revealUp, 0.28), index * motionStagger.tight);

  return (
    <motion.article
      variants={cardReveal}
      initial="hidden"
      whileInView="show"
      viewport={motionViewport}
      className="tech-card group flex h-full flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60" />

      <div className="mb-6 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <div className="mb-6 flex-1">
        <Quote className="mb-3 h-6 w-6 text-indigo-500/40" />
        <p className="text-sm font-medium leading-relaxed text-slate-300">{quote}</p>
      </div>

      <div className="flex items-center gap-4 border-t border-white/10 pt-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accentColor}`}>
          <span className="text-lg font-black text-white">{name.charAt(0)}</span>
        </div>
        <div>
          <div className="text-sm font-bold text-white">{name}</div>
          <div className="text-[11px] font-semibold text-slate-400">{role} · {server}</div>
          <div className="text-[10px] font-bold uppercase tracking-tight-readable text-slate-500">{members}</div>
        </div>
      </div>
    </motion.article>
  );
});

TestimonialCard.displayName = 'TestimonialCard';

export default function Testimonials() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const secondaryIntroReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);

  const testimonials = [
    {
      ...getTestimonial(t, 't1'),
      accentColor: 'from-indigo-500 to-purple-600',
    },
    {
      ...getTestimonial(t, 't2'),
      accentColor: 'from-cyan-500 to-blue-600',
    },
    {
      ...getTestimonial(t, 't3'),
      accentColor: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute right-1/4 top-0 h-80 w-80 rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            variants={introReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <Users className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('testimonials.tag')}</span>
          </motion.div>

          <motion.h2
            id="testimonials-heading"
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('testimonials.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('testimonials.titleAccent')}</span>
          </motion.h2>

          <motion.p
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('testimonials.description')}
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <TestimonialCard key={index} {...item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function getTestimonial(t: (key: string) => string, id: string) {
  return {
    name: t(`testimonials.items.${id}.name`),
    role: t(`testimonials.items.${id}.role`),
    server: t(`testimonials.items.${id}.server`),
    members: t(`testimonials.items.${id}.members`),
    quote: t(`testimonials.items.${id}.quote`),
  };
}
