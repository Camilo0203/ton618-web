import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CreditCard, Check, Sparkles, Shield, Zap, CheckCircle } from 'lucide-react';
import { GuildSelector } from '../components/GuildSelector';
import { TrustSignals } from '../components/TrustSignals';
import { FAQSection } from '../components/FAQSection';
import { useBillingGuilds } from '../hooks/useBillingGuilds';
import { createBillingCheckout, signInWithDiscord, getCurrentSession } from '../api';
import { PRICING_CONFIG, type BillingCycle, type PricingPlanKey } from '../../config/pricing';
import { config, getDiscordInviteUrl } from '../../config';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';


const planKeys: PricingPlanKey[] = ['free', 'pro', 'enterprise'];

export default function PricingPage() {
  const { t } = useTranslation();
  const isEnglish = t('nav.docs') === 'Docs';
  const lang = isEnglish ? 'en' : 'es';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanKey | null>(null);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const inviteUrl = getDiscordInviteUrl();
  
  const { guilds, loading: guildsLoading, error: guildsError } = useBillingGuilds();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getCurrentSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithDiscord(window.location.href);
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in with Discord');
    }
  };

  const handlePlanSelect = (planKey: PricingPlanKey) => {
    if (planKey === 'free') {
      if (inviteUrl) {
        window.location.href = inviteUrl;
      } else {
        toast.error('Invite URL not configured');
      }
      return;
    }

    if (planKey === 'enterprise') {
      const contactUrl = config.supportServerUrl || (config.contactEmail ? `mailto:${config.contactEmail}` : '');
      if (contactUrl) {
        window.location.href = contactUrl;
      } else {
        toast.error('Contact URL not configured');
      }
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in with Discord to continue', {
        description: 'You need to authenticate to purchase Pro',
      });
      handleSignIn();
      return;
    }

    setSelectedPlan(planKey);
    toast.success('Plan selected!', {
      description: 'Now choose which server to upgrade',
    });
    
    setTimeout(() => {
      document.getElementById('guild-selector')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };


  const handleProceedToCheckout = async () => {
    if (!selectedPlan || !selectedGuildId) {
      toast.error('Missing information', {
        description: 'Please select both a plan and a server',
      });
      return;
    }

    const selectedGuild = guilds.find(g => g.id === selectedGuildId);
    const billingPlanKey = cycle === 'monthly' ? 'pro_monthly' : 'pro_yearly';

    try {
      setProcessingCheckout(true);
      toast.loading(`Creating checkout for ${selectedGuild?.name || 'your server'}...`, { id: 'checkout' });
      
      const response = await createBillingCheckout({
        guild_id: selectedGuildId,
        plan_key: billingPlanKey as any,
      });

      toast.success('Redirecting to secure checkout...', { id: 'checkout' });
      window.location.href = response.checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout';
      
      if (errorMessage.includes('already has an active')) {
        toast.error('Server already has premium', {
          id: 'checkout',
          description: 'This server already has an active premium subscription',
        });
      } else if (errorMessage.includes('permission')) {
        toast.error('Permission denied', {
          id: 'checkout',
          description: 'You need Manage Server permission to upgrade this server',
        });
      } else {
        toast.error('Checkout failed', {
          id: 'checkout',
          description: errorMessage,
        });
      }
      
      setProcessingCheckout(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-4">
            <svg
              className="w-8 h-8 animate-spin text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-white font-semibold">Loading pricing...</p>
          <p className="text-slate-400 text-sm mt-2">Checking authentication status</p>
        </div>
      </div>
    );
  }

  const trustBadges = [
    { icon: Shield, text: isEnglish ? 'Secure Payment' : 'Pago Seguro' },
    { icon: Zap, text: isEnglish ? 'Instant Activation' : 'Activación Instantánea' },
    { icon: CreditCard, text: 'Powered by Lemon Squeezy' },
    { icon: CheckCircle, text: isEnglish ? '7-Day Money-Back' : 'Devolución 7 Días' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cinematic-atmosphere absolute inset-0"></div>
        <div className="bg-cinematic-texture absolute inset-0 opacity-40"></div>
        <div className="bg-film-grain absolute inset-0 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-black"></div>
      </div>

      <div className="relative z-10">
        <header>
          <Navbar />
        </header>

        <main className="relative">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-black py-20 px-4 sm:py-32">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute left-1/3 top-0 h-80 w-80 rounded-full bg-purple-500/5 blur-[120px]" />
            
            <div className="relative mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2">
                  <CreditCard className="h-3 w-3 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">
                    {isEnglish ? 'Operational plans' : 'Planes operativos'}
                  </span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {isEnglish ? 'Price The Operations Layer' : 'Ponle Precio A La Capa Operativa'}
                  </span>
                </h1>

                <p className="mt-6 text-lg leading-8 text-slate-300 sm:text-xl max-w-3xl mx-auto">
                  {isEnglish
                    ? 'Free gets the server installed. Pro turns support into an operational system. Enterprise is for guided rollout across multiple communities.'
                    : 'Free instala la base. Pro convierte soporte en sistema operativo. Enterprise sirve para rollout guiado entre varias comunidades.'}
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-10 flex flex-wrap justify-center gap-4 sm:gap-6"
                >
                  {trustBadges.map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-sm border border-white/10"
                    >
                      <badge.icon className="h-5 w-5 text-indigo-400" />
                      <span className="text-sm font-medium text-slate-200">
                        {badge.text}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Auth prompt */}
          {!isAuthenticated && (
            <section className="py-12 px-4 bg-black">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-6 text-center backdrop-blur-sm"
                >
                  <p className="text-lg mb-4 text-white">
                    {isEnglish ? 'Sign in with Discord to get started' : 'Inicia sesión con Discord para comenzar'}
                  </p>
                  <button
                    onClick={handleSignIn}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                  >
                    {isEnglish ? 'Sign in with Discord' : 'Iniciar sesión con Discord'}
                  </button>
                </motion.div>
              </div>
            </section>
          )}

          {/* Pricing Cards */}
          <section id="pricing-cards" className="py-20 px-4 bg-black">
            <div className="mx-auto max-w-7xl">
              {/* Toggle */}
              <div className="mb-12 flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
                  <button
                    onClick={() => setCycle('monthly')}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                      cycle === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isEnglish ? 'Monthly' : 'Mensual'}
                  </button>
                  <button
                    onClick={() => setCycle('yearly')}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                      cycle === 'yearly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isEnglish ? 'Yearly' : 'Anual'}
                    <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {isEnglish ? 'Save 20%' : 'Ahorra 20%'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-8 md:grid-cols-3"
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
                  const period = planConfig.period[lang];

                  return (
                    <motion.div
                      key={planKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative ${
                        isPro ? 'md:scale-105' : ''
                      }`}
                    >
                      {popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                            {popular}
                          </span>
                        </div>
                      )}

                      <div
                        className={`relative h-full rounded-2xl border p-8 backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
                          isPro
                            ? 'border-indigo-500/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500/50'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-white">{name}</h3>
                        </div>

                        <p className="mt-2 text-sm text-slate-400 mb-6">{desc}</p>

                        <div className="mb-6">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white">{priceDisplay}</span>
                            {period && <span className="text-slate-400">/{period}</span>}
                          </div>
                        </div>

                        <ul className="mt-6 space-y-3 mb-8">
                          {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Check className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                              <span className="text-sm text-slate-300">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handlePlanSelect(planKey)}
                          disabled={processingCheckout && selectedPlan === planKey}
                          className={`mt-8 w-full rounded-xl py-3 px-6 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                            isPro
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500'
                              : 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500'
                          } ${
                            processingCheckout && selectedPlan === planKey
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:scale-105'
                          }`}
                        >
                          {processingCheckout && selectedPlan === planKey ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg
                                className="h-5 w-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Loading...
                            </span>
                          ) : (
                            cta
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* Guild Selector */}
          {isAuthenticated && selectedPlan === 'pro' && (
        <section className="py-12 px-4 bg-slate-900">
          <div className="max-w-4xl mx-auto">
            <motion.div
              id="guild-selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8"
            >
              {/* Progress Indicator */}
              <div className="mb-6 flex items-center justify-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-slate-400">Plan Selected</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-600" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <span className="text-white font-medium">Choose Server</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-600" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-slate-400 text-xs font-bold">
                    3
                  </div>
                  <span className="text-slate-400">Checkout</span>
                </div>
              </div>

              {/* Selected Plan Info */}
              <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-sm text-indigo-300 text-center">
                  Selected: <span className="font-semibold">{selectedPlan.replace('_', ' ').toUpperCase()}</span>
                </p>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Select a Server
              </h2>
              
              {guildsError ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{guildsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  <GuildSelector
                    guilds={guilds}
                    selectedGuildId={selectedGuildId}
                    onSelectGuild={setSelectedGuildId}
                    loading={guildsLoading}
                  />

                  {selectedGuildId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 flex justify-center"
                    >
                      <button
                        onClick={handleProceedToCheckout}
                        disabled={processingCheckout}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {processingCheckout ? 'Creating Checkout...' : 'Proceed to Checkout'}
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>
          </section>
          )}

          {/* Trust Signals */}
          <TrustSignals />

          {/* FAQ Section */}
          <FAQSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
