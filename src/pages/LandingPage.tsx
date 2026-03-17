import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import LiveStats from '../components/LiveStats';
import VisualExperience from '../components/VisualExperience';
import WhyTon from '../components/WhyTon';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import LegalModal from '../components/LegalModal';
import { config, getAbsoluteAssetUrl, getCanonicalUrl } from '../config';

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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <Helmet>
        <html lang={i18n.language.startsWith('es') ? 'es' : 'en'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#05060f" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
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

      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cinematic-atmosphere absolute inset-0"></div>
        <div className="bg-cinematic-texture absolute inset-0 opacity-40"></div>
        <div className="bg-film-grain absolute inset-0 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-black"></div>
        <div className="scanline-sweep absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <main>
          {/* Section 1: Hero */}
          <Hero />

          {/* Section 2: Features */}
          <Features />

          {/* Section 3: Experience */}
          <VisualExperience />

          {/* Section 4: Why TON618 */}
          <WhyTon />

          {/* Section 5: Stats */}
          <LiveStats />

          {/* Section 6: Final CTA */}
          <FinalCTA />
        </main>

        {/* Section 7: Footer */}
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
