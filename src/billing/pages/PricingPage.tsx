import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Zap, Crown, Heart, ArrowRight, X } from 'lucide-react';
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

const WHOP_LINKS: Record<'pro_monthly' | 'pro_yearly' | 'lifetime', string> = {
  pro_monthly: 'https://whop.com/checkout/plan_yI6fFUFSaIMf5',
  pro_yearly: 'https://whop.com/checkout/plan_8SKj3v4lL6XEF',
  lifetime: 'https://whop.com/checkout/plan_nuXvSWVBzZHWf',
};

const planKeys: PricingPlanKey[] = ['free', 'pro', 'donation'];

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
      planKey === 'donation' ? 'lifetime' : cycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';

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
      <Navbar />
      {showFounding && foundingSpotsLeft > 0 && (
        <div className="sticky top-16 z-30 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-4 py-3 text-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <p className="text-white">{t('billing.foundingOffer.text', { spots: foundingSpotsLeft })}</p>
            <button
              onClick={() => {
                setShowFounding(false);
                try { localStorage.setItem('ton618_founding_dismissed', 'true'); } catch { /* storage unavailable */ }
              }}
              aria-label={t('billing.foundingOffer.dismissAriaLabel')}
              className="ml-4 shrink-0 text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <PricingHero />
      <main className="mx-auto max-w-6xl px-4 py-12">

        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <button onClick={() => setCycle('monthly')} className={`rounded-full px-4 py-2 text-sm ${cycle === 'monthly' ? 'bg-indigo-600' : ''}`}>{t('billing.toggle.monthly')}</button>
            <button onClick={() => setCycle('yearly')} className={`rounded-full px-4 py-2 text-sm ${cycle === 'yearly' ? 'bg-indigo-600' : ''}`}>{t('billing.toggle.yearly')} <span className="ml-1 text-emerald-300">{t('billing.toggle.discount')}</span></button>
          </div>
        </div>

        <section id="pricing-cards" className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {planKeys.map((planKey) => {
            const plan = PRICING_CONFIG[planKey];
            const isPro = planKey === 'pro';
            const isDonation = planKey === 'donation';
            const isYearlyPro = isPro && cycle === 'yearly';
            return (
              <motion.div
                key={planKey}
                className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                  isYearlyPro
                    ? 'z-10 border-indigo-500/60 bg-indigo-950/50 ring-2 ring-indigo-500 md:scale-105'
                    : isPro
                    ? 'border-indigo-500/40 bg-slate-900/50'
                    : 'border-white/10 bg-slate-900/50'
                }`}
              >
                <div className="mb-3 inline-flex rounded-lg bg-white/10 p-2">
                  {isPro ? <Crown className="h-4 w-4" /> : isDonation ? <Heart className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                </div>
                <h3 className="text-xl font-bold">{plan.name[lang]}</h3>
                <p className="mt-1 text-sm text-slate-300">{plan.description[lang]}</p>
                <p className="mt-5 text-4xl font-black">{plan.price[cycle].display}<span className="ml-1 text-sm text-slate-400">{getPlanPeriod(planKey, cycle, lang)}</span></p>
                {isYearlyPro && <p className="mt-2 text-xs font-semibold text-emerald-300">{t('billing.toggle.discount')}</p>}
                {isYearlyPro && <p className="mt-2 text-xs text-amber-400">{t('billing.lifetimeUrgency')}</p>}
                <ul className="mt-5 space-y-2">
                  {plan.features[lang].slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={() => void handlePlanSelect(planKey)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold">
                  {plan.cta[lang]} <ArrowRight className="h-4 w-4" />
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
  );
}
