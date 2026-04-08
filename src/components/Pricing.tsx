import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CreditCard, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { config, getDiscordInviteUrl } from '../config';
import { PRICING_CONFIG, getPlanPeriod, type BillingCycle, type PricingPlanKey } from '../config/pricing';
import { cardStagger, instantReveal, motionStagger, motionViewport, revealUp, sectionIntro, withDelay, withDuration } from '../lib/motion';

const planKeys: PricingPlanKey[] = ['free', 'pro', 'enterprise'];

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
  const lang = isEnglish ? 'en' : 'es';
  const copy = {
    tag: isEnglish ? 'Operational plans' : 'Planes operativos',
    title: isEnglish ? 'Price The' : 'Ponle Precio A',
    titleAccent: isEnglish ? 'Operations Layer' : 'La Capa Operativa',
    description: isEnglish
      ? 'Free gets the server installed. Pro turns support into an operational system. Enterprise is for guided rollout across multiple communities.'
      : 'Free instala la base. Pro convierte soporte en sistema operativo. Enterprise sirve para rollout guiado entre varias comunidades.',
    toggle: {
      monthly: isEnglish ? 'Monthly' : 'Mensual',
      yearly: isEnglish ? 'Yearly' : 'Anual',
      discount: isEnglish ? 'Save 20%' : 'Ahorra 20%',
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
          {planKeys.map((planKey) => {
            const planConfig = PRICING_CONFIG[planKey];
            const isPro = planKey === 'pro';
            const name = planConfig.name[lang];
            const desc = planConfig.description[lang];
            const features = planConfig.features[lang];
            const cta = planConfig.cta[lang];
            const popular = planConfig.popular ? planConfig.popularLabel?.[lang] : null;
            const priceDisplay = planConfig.price[cycle].display;
            const period = getPlanPeriod(planKey, cycle, lang);
            
            const isYearly = cycle === 'yearly' && isPro;
            const billingCycleText = isYearly && 'billingCycle' in planConfig 
              ? (planConfig.billingCycle as any)[cycle][lang] 
              : null;
            const effectiveMonthlyDisplay = isYearly && 'effectiveMonthly' in planConfig
              ? (planConfig.effectiveMonthly as any).yearly.display
              : null;

            const ctaElement = (() => {
              if (planConfig.ctaType === 'invite') {
                return inviteUrl ? (
                  <a href={inviteUrl} className="btn-premium-outline w-full">
                    <span>{cta}</span>
                  </a>
                ) : (
                  <button disabled className="btn-premium-outline w-full opacity-60 cursor-not-allowed">
                    <span>{cta}</span>
                  </button>
                );
              }

              if (planConfig.ctaType === 'pricing') {
                return (
                  <Link to="/pricing" className="btn-premium-primary w-full">
                    <Sparkles className="h-4 w-4" />
                    <span>{cta}</span>
                  </Link>
                );
              }

              if (planConfig.ctaType === 'contact') {
                const contactUrl = config.supportServerUrl || (config.contactEmail ? `mailto:${config.contactEmail}` : '#pricing');
                return (
                  <a href={contactUrl} className="btn-premium-outline w-full">
                    <span>{cta}</span>
                  </a>
                );
              }

              return null;
            })();

            return (
              <motion.div
                key={planKey}
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
                  <h3 className="mb-2 text-lg font-bold text-white">{name}</h3>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tabular-nums text-white">{priceDisplay}</span>
                    {period && <span className="text-sm font-semibold text-slate-500">{period}</span>}
                  </div>
                  {billingCycleText && (
                    <p className="mt-2 text-xs text-slate-400">{billingCycleText}</p>
                  )}
                  {effectiveMonthlyDisplay && (
                    <p className="mt-1 text-xs font-medium text-emerald-400">
                      {effectiveMonthlyDisplay}/mo {isEnglish ? 'effective' : 'efectivo'}
                    </p>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {ctaElement}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
