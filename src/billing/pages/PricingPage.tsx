import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Crown, Gift, Heart, ArrowRight, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { TrustSignals } from '../components/TrustSignals';
import { FAQSection } from '../components/FAQSection';
import { GuildSelector } from '../components/GuildSelector';
import { SocialProof } from '../components/SocialProof';
import { PricingHero } from '../components/PricingHero';
import { PRICING_CONFIG, donationPlanKeys, premiumPlanKeys, type BillingPlanKey, type PricingPlanKey } from '../../config/pricing';
import { fetchBillingGuilds } from '../api';
import { supabase } from '../../lib/supabaseClient';
import { config, getAbsoluteAssetUrl, getCanonicalUrl } from '../../config';
import type { GuildSummary } from '../types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const WHOP_BASE = 'https://whop.com/checkout';
const WHOP_LINKS: Record<BillingPlanKey, string> = {
  pro_monthly: `${WHOP_BASE}/${config.whopPlanMonthly || 'plan_yI6fFUFSaIMf5'}`,
  pro_yearly: `${WHOP_BASE}/${config.whopPlanYearly || 'plan_8SKj3v4lL6XEF'}`,
  lifetime: `${WHOP_BASE}/${config.whopPlanLifetime || 'plan_nuXvSWVBzZHWf'}`,
};

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';
  const [guilds, setGuilds] = useState<GuildSummary[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<BillingPlanKey | null>(null);
  const [showFounding, setShowFounding] = useState(() => {
    try {
      return localStorage.getItem('ton618_founding_dismissed') !== 'true';
    } catch {
      return true;
    }
  });
  const [foundingSpotsLeft, setFoundingSpotsLeft] = useState(50);

  useEffect(() => {
    const loadFoundingSpots = async () => {
      if (!supabase) return;
      const { count } = await supabase
        .from('guild_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('is_founding_member', true);
      setFoundingSpotsLeft(Math.max(0, 50 - (count ?? 0)));
    };
    void loadFoundingSpots();
  }, []);

  const handlePlanSelect = async (planKey: PricingPlanKey) => {
    const plan = PRICING_CONFIG[planKey];

    if (plan.whopKey === 'donation') {
      if (!config.donationUrl) {
        toast.error(lang === 'es' ? 'El link de donacion aun no esta configurado.' : 'Donation link is not configured yet.');
        return;
      }
      window.location.href = config.donationUrl;
      return;
    }

    try {
      const result = await fetchBillingGuilds();
      setGuilds(result.guilds);
      setPendingPlan(plan.whopKey);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('billing.serverSelection.error'));
    }
  };

  const proceedCheckout = () => {
    if (!pendingPlan || !selectedGuildId) return;
    const base = WHOP_LINKS[pendingPlan];
    window.location.href = `${base}?pass_guild_id=${selectedGuildId}`;
  };

  const canonicalUrl = getCanonicalUrl('/pricing');
  const socialImageUrl = getAbsoluteAssetUrl(config.socialImagePath);

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <html lang={i18n.language.startsWith('es') ? 'es' : 'en'} />
        <title>{t('billing.pricing.pageTitle', `${config.botName} — Pricing`)}</title>
        <meta name="description" content={t('billing.pricing.metaDescription', 'Upgrade your Discord server with TON618 Pro. Monthly, yearly and lifetime plans.')} />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#05060f" />
        <meta name="color-scheme" content="dark" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={config.botName} />
        <meta property="og:title" content={t('billing.pricing.ogTitle', `${config.botName} — Pricing`)} />
        <meta property="og:description" content={t('billing.pricing.ogDescription', 'Upgrade your Discord server with TON618 Pro.')} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:locale" content={i18n.language.startsWith('es') ? 'es_ES' : 'en_US'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('billing.pricing.ogTitle', `${config.botName} — Pricing`)} />
        <meta name="twitter:description" content={t('billing.pricing.ogDescription', 'Upgrade your Discord server with TON618 Pro.')} />
        <meta name="twitter:image" content={socialImageUrl} />
      </Helmet>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cinematic-atmosphere absolute inset-0"></div>
        <div className="bg-cinematic-texture absolute inset-0 opacity-40"></div>
        <div className="bg-film-grain absolute inset-0 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-black"></div>
      </div>

      <div className="relative z-10 pt-44">
        <Navbar />
      <PricingHero
        foundingOffer={showFounding && foundingSpotsLeft > 0 ? (
          <div className="flex max-w-4xl items-center justify-between gap-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(20,20,40,0.6)] px-5 py-3 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[12px] transition-all duration-300 sm:rounded-full sm:px-6">
            <p className="text-slate-200 font-medium">{t('billing.foundingOffer.text', { spots: foundingSpotsLeft })}</p>
            <button
              onClick={() => {
                setShowFounding(false);
                try { localStorage.setItem('ton618_founding_dismissed', 'true'); } catch { /* storage unavailable */ }
              }}
              aria-label={t('billing.foundingOffer.dismissAriaLabel')}
              className="shrink-0 text-slate-400 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      />
      <main className="mx-auto max-w-6xl px-4 py-12">

        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wide-readable text-indigo-400">
            {lang === 'es' ? 'Donaciones' : 'Donations'}
          </p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tightest text-white sm:text-3xl">
            {lang === 'es' ? 'Apoya TON618 Bot' : 'Support TON618 Bot'}
          </h2>
        </div>

        <section id="pricing-cards" className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {donationPlanKeys.map((planKey) => {
            const plan = PRICING_CONFIG[planKey];

            return (
              <motion.div key={planKey} className="tech-card flex h-full flex-col justify-between opacity-90">
                <div className="flex-1">
                  <div className="mb-4 inline-flex items-center gap-2 premium-pill px-3 py-1.5">
                    <Heart className="h-4 w-4 text-pink-300" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      {plan.badge[lang]}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{plan.name[lang]}</h3>
                  <p className="mt-3 min-h-[48px] text-sm font-medium text-slate-300">{plan.description[lang]}</p>

                  <div className="my-7">
                    <p className="flex items-baseline gap-1 text-4xl font-black tracking-tight text-white">
                      {plan.price.display}
                    </p>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features[lang].map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-pink-300" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={() => void handlePlanSelect(planKey)} className="btn-premium-outline w-full">
                  {plan.cta[lang]}
                </button>
              </motion.div>
            );
          })}
        </section>

        <div className="mb-8 mt-20 text-center">
          <p className="text-xs font-bold uppercase tracking-wide-readable text-indigo-400">
            Premium
          </p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tightest text-white sm:text-3xl">
            {lang === 'es' ? 'Elige tu acceso premium' : 'Choose your premium access'}
          </h2>
        </div>

        <section id="premium-pricing-cards" className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center max-w-7xl mx-auto">
          {premiumPlanKeys.map((planKey) => {
            const plan = PRICING_CONFIG[planKey];
            const isPopular = plan.popular;
            let cardClasses = "relative flex flex-col justify-between h-full ";
            if (isPopular) {
              cardClasses += "tech-card md:scale-105 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 shadow-[0_0_40px_-10px_rgba(79,70,229,0.3)] z-10 ";
            } else {
              cardClasses += "tech-card opacity-90 ";
            }

            return (
              <motion.div
                key={planKey}
                className={cardClasses}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <span className="premium-pill px-4 py-1 text-xs font-bold uppercase tracking-wide text-indigo-400">
                      {t('pricing.pro.badge', 'Most Popular')}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="mb-4 inline-flex items-center gap-2 premium-pill px-3 py-1.5">
                    {isPopular ? <Crown className="h-4 w-4 text-indigo-400" /> : <Gift className="h-4 w-4 text-slate-400" />}
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${isPopular ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {plan.badge[lang]}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{plan.name[lang]}</h3>
                  <p className="mt-3 min-h-[48px] text-sm font-medium text-slate-300">{plan.description[lang]}</p>

                  <div className="my-8">
                    <p className="flex items-baseline gap-1 text-5xl font-black tracking-tight text-white">
                      {plan.price.display}
                      <span className="text-base font-medium text-slate-400">{plan.period[lang]}</span>
                    </p>
                  </div>

                  <ul className="mb-8 space-y-4">
                    {plan.features[lang].map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isPopular ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={() => void handlePlanSelect(planKey)} className={`w-full ${isPopular ? 'btn-premium-primary' : 'btn-premium-outline'}`}>
                  {plan.cta[lang]}
                  {isPopular && <ArrowRight className="h-4 w-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5" />}
                </button>
              </motion.div>
            );
          })}
        </section>

        <SocialProof />

        {pendingPlan && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-lg font-bold">{t('billing.serverSelection.title')}</h3>
            <p className="mb-4 text-sm text-slate-400">{t('billing.serverSelection.subtitle')}</p>
            <GuildSelector guilds={guilds} selectedGuildId={selectedGuildId} onSelectGuild={setSelectedGuildId} />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setPendingPlan(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm">{t('billing.cancel.backToHome')}</button>
              <button onClick={proceedCheckout} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold">{t('billing.checkout.proceed')}</button>
            </div>
          </section>
        )}

        <div className="mt-14">
          <TrustSignals />
        </div>
        <div className="mt-14">
          <FAQSection />
        </div>
      </main>
      <Footer />
      </div>
    </div>
  );
}
