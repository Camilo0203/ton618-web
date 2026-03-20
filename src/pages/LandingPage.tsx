import { Helmet } from 'react-helmet-async';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import LegalModal from '../components/LegalModal';
import { config, getAbsoluteAssetUrl, getCanonicalUrl } from '../config';

const Features = lazy(() => import('../components/Features'));
const VisualExperience = lazy(() => import('../components/VisualExperience'));
const WhyTon = lazy(() => import('../components/WhyTon'));
const DocsSection = lazy(() => import('../components/DocsSection'));
const LiveStats = lazy(() => import('../components/LiveStats'));
const FinalCTA = lazy(() => import('../components/FinalCTA'));

type LegalModalType = 'terms' | 'privacy' | 'cookies' | null;

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const title = t('meta.title');
  const description = t('meta.description');
  const canonicalUrl = getCanonicalUrl(location.pathname);
  const socialImageUrl = getAbsoluteAssetUrl(config.socialImagePath);
  const locale = i18n.language.startsWith('es') ? 'es_ES' : 'en_US';
  const languageAlternates = [
    { hrefLang: 'en', href: canonicalUrl },
    { hrefLang: 'es', href: canonicalUrl },
    { hrefLang: 'x-default', href: canonicalUrl },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <Helmet>
        <html lang={i18n.language.startsWith('es') ? 'es' : 'en'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="Discord bot, Discord dashboard, Discord moderation bot, Discord automation, Discord verification bot, Discord tickets"
        />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#05060f" />
        <meta name="color-scheme" content="dark" />
        <link rel="canonical" href={canonicalUrl} />
        {languageAlternates.map((alternate) => (
          <link
            key={alternate.hrefLang}
            rel="alternate"
            hrefLang={alternate.hrefLang}
            href={alternate.href}
          />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={config.botName} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:locale" content={locale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialImageUrl} />
        <link rel="icon" type="image/png" href={config.faviconPath} />
        <link rel="apple-touch-icon" href={config.appleTouchIconPath} />
        <link rel="manifest" href={config.manifestPath} />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-slate-950"
      >
        {t('landing.skipToContent')}
      </a>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cinematic-atmosphere absolute inset-0"></div>
        <div className="bg-cinematic-texture absolute inset-0 opacity-40"></div>
        <div className="bg-film-grain absolute inset-0 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-black"></div>
        <div className="scanline-sweep absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      </div>

      <div className="relative z-10">
        <header>
          <Navbar />
        </header>

        <main id="main-content" className="relative">
          <Hero />
          <Suspense fallback={<div className="h-64 w-full animate-pulse bg-transparent"></div>}>
            <Features />
            <VisualExperience />
            <WhyTon />
            <DocsSection />
            <LiveStats />
            <FinalCTA />
          </Suspense>
        </main>

        <Footer onOpenLegal={setLegalModalType} />

        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
          botName={config.botName}
        />
      </div>
    </div>
  );
}
