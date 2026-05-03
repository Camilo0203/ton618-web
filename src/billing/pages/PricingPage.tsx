import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Zap, Crown, Users, ArrowRight, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { TrustSignals } from '../components/TrustSignals';
import { FAQSection } from '../components/FAQSection';
import { GuildSelector } from '../components/GuildSelector';
import { SocialProof } from '../components/SocialProof';
import { PricingHero } from '../components/PricingHero';
import { PRICING_CONFIG, getPlanPeriod, type BillingCycle, type PricingPlanKey } from '../../config/pricing';
import { fetchBillingGuilds } from '../api';
import { supabase } from '../../lib/supabaseClient';
import { config, getAbsoluteAssetUrl, getCanonicalUrl } from '../../config';
import type { GuildSummary } from '../types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const WHOP_BASE = 'https://whop.com/checkout';
const WHOP_LINKS: Record<'pro_monthly' | 'pro_yearly' | 'lifetime', string> = {
  pro_monthly: `${WHOP_BASE}/${config.whopPlanMonthly || 'plan_yI6fFUFSaIMf5'}`,
  pro_yearly: `${WHOP_BASE}/${config.whopPlanYearly || 'plan_8SKj3v4lL6XEF'}`,
  lifetime: `${WHOP_BASE}/${config.whopPlanLifetime || 'plan_nuXvSWVBzZHWf'}`,
};

const planKeys: PricingPlanKey[] = ['free', 'pro', 'enterprise'];

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [guilds, setGuilds] = useState<GuildSummary[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<'pro_monthly' | 'pro_yearly' | 'lifetime' | null>(null);
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
    if (planKey === 'free') {
      window.location.href = '/dashboard';
      return;
    }

    const whopKey: 'pro_monthly' | 'pro_yearly' | 'lifetime' =
      planKey === 'enterprise' ? 'lifetime' : cycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';

    try {
      const result = await fetchBillingGuilds();
      setGuilds(result.guilds);
      setPendingPlan(whopKey);
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

      <div className="relative z-10 pt-36">
        <Navbar />
      {showFounding && foundingSpotsLeft > 0 && (
        <div className="sticky top-24 z-30 mx-auto w-full max-w-[1200px] px-4 pointer-events-none flex justify-center">
          <div className="pointer-events-auto flex items-center justify-between gap-4 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(20,20,40,0.6)] px-6 py-2.5 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[12px] transition-all duration-300">
            <p className="text-slate-200 font-medium">{t('billing.foundingOffer.text', { spots: foundingSpotsLeft })}</p>
            <button
              onClick={() => {
                setShowFounding(false);
                try { localStorage.setItem('ton618_founding_dismissed', 'true'); } catch { /* storage unavailable */ }
              }}
              aria-label={t('billing.foundingOffer.dismissAriaLabel')}
              className="shrink-0 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <PricingHero />
      <main className="mx-auto max-w-6xl px-4 py-12">

        <div className="mb-16 flex justify-center relative z-10">
          <div className="inline-flex rounded-full border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl shadow-2xl">
            <button onClick={() => setCycle('monthly')} className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${cycle === 'monthly' ? 'bg-white text-black shadow-lg scale-100' : 'text-slate-400 hover:text-white hover:bg-white/5 scale-95'}`}>{t('billing.toggle.monthly')}</button>
            <button onClick={() => setCycle('yearly')} className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${cycle === 'yearly' ? 'bg-white text-black shadow-lg scale-100' : 'text-slate-400 hover:text-white hover:bg-white/5 scale-95'}`}>{t('billing.toggle.yearly')} <span className={`rounded-full px-2 py-0.5 text-[10px] tracking-widest ${cycle === 'yearly' ? 'bg-black/10 text-indigo-600' : 'bg-indigo-500/20 text-indigo-300'}`}>-25%</span></button>
          </div>
        </div>

        <section id="pricing-cards" className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center max-w-7xl mx-auto">
          {planKeys.map((planKey) => {
            const plan = PRICING_CONFIG[planKey];
            const isPro = planKey === 'pro';
            const isEnterprise = planKey === 'enterprise';
            const isYearlyPro = isPro && cycle === 'yearly';
            let cardClasses = "relative flex flex-col justify-between h-full ";
            if (isPro) {
              cardClasses += "tech-card md:scale-105 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 shadow-[0_0_40px_-10px_rgba(79,70,229,0.3)] z-10 ";
            } else if (isEnterprise) {
              cardClasses += "tech-card opacity-90 ";
            } else {
              cardClasses += "tech-card opacity-80 ";
            }

            let ctaClass = "w-full ";
            if (isPro) {
              ctaClass += "btn-premium-primary";
            } else {
              ctaClass += "btn-premium-outline";
            }

            return (
              <motion.div
                key={planKey}
                className={cardClasses}
              >
                {isPro && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <span className="premium-pill px-4 py-1 text-xs font-bold uppercase tracking-wide text-indigo-400">
                      {t('pricing.pro.badge', 'Most Popular')}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="mb-4 inline-flex items-center gap-2 premium-pill px-3 py-1.5">
                    {isPro ? <Crown className="h-4 w-4 text-indigo-400" /> : isEnterprise ? <Users className="h-4 w-4 text-slate-400" /> : <Zap className="h-4 w-4 text-slate-400" />}
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${isPro ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {plan.name[lang]}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-300 min-h-[40px]">{plan.description[lang]}</p>

                  <div className="my-8">
                    <p className="text-5xl font-black tracking-tight text-white flex items-baseline gap-1">
                      {plan.price[cycle].display}
                      <span className="text-base font-medium text-slate-400">{getPlanPeriod(planKey, cycle, lang)}</span>
                    </p>
                    {isYearlyPro && <p className="mt-2 text-xs font-bold text-emerald-400 tracking-wide">{t('billing.toggle.discount')}</p>}
                  </div>

                  <ul className="mb-8 space-y-4">
                    {plan.features[lang].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isPro ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={() => void handlePlanSelect(planKey)} className={ctaClass}>
                  {plan.cta[lang]}
                  {isPro && <ArrowRight className="h-4 w-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5" />}
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
