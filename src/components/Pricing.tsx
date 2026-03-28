import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CreditCard, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { getDiscordInviteUrl } from '../config';
import { cardStagger, instantReveal, motionStagger, motionViewport, revealUp, sectionIntro, withDelay, withDuration } from '../lib/motion';

type BillingCycle = 'monthly' | 'yearly';
const planKeys = ['free', 'pro', 'enterprise'] as const;

export default function Pricing() {
  const { t } = useTranslation();
  const isEnglish = t('nav.docs') === 'Docs';
  const shouldReduceMotion = useReducedMotion();
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const secondaryIntroReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);
  const gridReveal = shouldReduceMotion ? instantReveal : cardStagger;
  const planReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, 0.28);
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const inviteUrl = getDiscordInviteUrl();
  const copy = isEnglish
    ? {
        tag: 'Operational plans',
        title: 'Price The',
        titleAccent: 'Operations Layer',
        description: 'Free gets the server installed. Pro turns support into an operational system. Enterprise is for guided rollout across multiple communities.',
        toggle: { monthly: 'Monthly', yearly: 'Yearly', discount: 'Save 20%' },
        plans: {
          free: {
            name: 'Free',
            desc: 'Install the base layer and prove the workflow.',
            cta: 'Start free',
            popular: null,
            features: ['Basic setup essentials', 'Simple tickets', 'Verification', 'Basic operational metrics'],
          },
          pro: {
            name: 'Pro operativo',
            desc: 'For staff teams that need inbox, SLA and guided decisions.',
            cta: 'Upgrade to Pro',
            popular: 'Core plan',
            features: ['Everything in Free', 'Advanced web inbox', 'Macros, SLA and escalation', 'Live playbooks and incident mode', 'Operational analytics and backups'],
          },
          enterprise: {
            name: 'Enterprise rollout',
            desc: 'For staged launches, multiple servers and white-glove onboarding.',
            cta: 'Contact sales',
            popular: null,
            features: ['Everything in Pro', 'Guided onboarding', 'Multi-server rollout', 'Priority support', 'Custom operating defaults'],
          },
        },
      }
    : {
        tag: 'Planes operativos',
        title: 'Ponle Precio A',
        titleAccent: 'La Capa Operativa',
        description: 'Free instala la base. Pro convierte soporte en sistema operativo. Enterprise sirve para rollout guiado entre varias comunidades.',
        toggle: { monthly: 'Mensual', yearly: 'Anual', discount: 'Ahorra 20%' },
        plans: {
          free: {
            name: 'Free',
            desc: 'Instala la base y valida el flujo.',
            cta: 'Empezar gratis',
            popular: null,
            features: ['Setup base esencial', 'Tickets simples', 'Verificacion', 'Metricas operativas basicas'],
          },
          pro: {
            name: 'Pro operativo',
            desc: 'Para staffs que necesitan inbox, SLA y decisiones guiadas.',
            cta: 'Subir a Pro',
            popular: 'Plan core',
            features: ['Todo en Free', 'Inbox web avanzado', 'Macros, SLA y escalado', 'Playbooks vivos e incident mode', 'Analitica operativa y backups'],
          },
          enterprise: {
            name: 'Enterprise rollout',
            desc: 'Para betas cuidadas, multi-servidor y onboarding white-glove.',
            cta: 'Contactar ventas',
            popular: null,
            features: ['Todo en Pro', 'Onboarding guiado', 'Rollout multi-servidor', 'Soporte prioritario', 'Defaults operativos a medida'],
          },
        },
      };

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/3 top-0 h-80 w-80 rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            variants={introReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <CreditCard className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{copy.tag}</span>
          </motion.div>

          <motion.h2
            id="pricing-heading"
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {copy.title} <br />
            <span className="headline-accent headline-accent-solid">{copy.titleAccent}</span>
          </motion.h2>

          <motion.p
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mx-auto mb-10 max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {copy.description}
          </motion.p>

          <motion.div
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1"
          >
            <button
              onClick={() => setCycle('monthly')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 ${cycle === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {copy.toggle.monthly}
            </button>
            <button
              onClick={() => setCycle('yearly')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 ${cycle === 'yearly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {copy.toggle.yearly}
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{copy.toggle.discount}</span>
            </button>
          </motion.div>
        </div>

        <motion.div
          variants={gridReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="grid gap-6 lg:grid-cols-3"
        >
          {planKeys.map((plan) => {
            const isPro = plan === 'pro';
            const planCopy = copy.plans[plan];
            const features = planCopy.features;
            const popular = planCopy.popular;

            return (
              <motion.div
                key={plan}
                variants={planReveal}
                className={`relative flex flex-col overflow-hidden rounded-[2rem] border p-8 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 ${
                  isPro
                    ? 'border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 shadow-[0_0_64px_rgba(99,102,241,0.12)]'
                    : 'border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]'
                }`}
              >
                {popular && (
                  <div className="absolute right-6 top-6 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {popular}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="mb-2 text-lg font-bold text-white">{planCopy.name}</h3>
                  <p className="text-sm text-slate-400">{planCopy.desc}</p>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-black tabular-nums text-white">{t(`pricing.plans.${plan}.price.${cycle}`)}</span>
                  <span className="ml-1 text-sm font-semibold text-slate-500">{t(`pricing.plans.${plan}.period`)}</span>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={inviteUrl || '#pricing'}
                  className={isPro ? 'btn-premium-primary w-full' : 'btn-premium-outline w-full'}
                >
                  {isPro && <Sparkles className="h-4 w-4" />}
                  <span>{planCopy.cta}</span>
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
