import { Helmet } from 'react-helmet-async';
import { lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import LoadingSkeleton from '../components/LoadingSkeleton';
import LazyViewportSection from '../components/LazyViewportSection';
import { config, getAbsoluteAssetUrl, getCanonicalUrl } from '../config';

const Features = lazy(() => import('../components/Features'));
const VisualExperience = lazy(() => import('../components/VisualExperience'));
const WhyTon = lazy(() => import('../components/WhyTon'));
const DocsSection = lazy(() => import('../components/DocsSection'));
const LiveStats = lazy(() => import('../components/LiveStats'));
const PricingPreview = lazy(() => import('../components/PricingPreview'));
const FAQ = lazy(() => import('../components/FAQ'));
const FinalCTA = lazy(() => import('../components/FinalCTA'));
const CommandPreview = lazy(() => import('../components/CommandPreview'));
const ScrollToTop = lazy(() => import('../components/ScrollToTop'));
const StickyInviteCTA = lazy(() => import('../components/StickyInviteCTA'));

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const title = t('meta.title');
  const description = t('meta.description');
  const canonicalUrl = getCanonicalUrl(location.pathname);
  const socialImageUrl = getAbsoluteAssetUrl(config.socialImagePath);
  const locale = i18n.language.startsWith('es') ? 'es_ES' : 'en_US';
  const faqItems = useMemo(
    () =>
      ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].map((id) => ({
        '@type': 'Question',
        name: t(`faq.items.${id}.question`),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t(`faq.items.${id}.answer`),
        },
      })),
    [t],
  );
  const structuredData = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: config.botName,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        url: canonicalUrl,
        image: socialImageUrl,
        description,
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: '9',
          highPrice: '84',
          offerCount: '2',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: config.botName,
        url: canonicalUrl,
        logo: getAbsoluteAssetUrl(config.brandMarkPath),
        image: socialImageUrl,
      },
    ],
    [canonicalUrl, description, faqItems, socialImageUrl],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <Helmet>
        <html lang={i18n.language.startsWith('es') ? 'es' : 'en'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="Discord bot, bilingual Discord bot, Discord ticket bot, Discord verification bot, English Spanish Discord bot, Discord staff operations, bot bilingue Discord"
        />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#05060f" />
        <meta name="color-scheme" content="dark" />
        <link rel="canonical" href={canonicalUrl} />
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
        {structuredData.map((entry, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(entry)}
          </script>
        ))}
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
      </div>

      <ScrollProgress />
      
      <div className="relative z-10">
        <header>
          <Navbar />
        </header>

        <main id="main-content" className="relative">
          <Hero />
          <Suspense fallback={<LoadingSkeleton />}>
            <Features />
            <VisualExperience />
          </Suspense>
          <LazyViewportSection
            fallback={<LoadingSkeleton />}
            loader={async () => ({
              default: () => (
                <>
                  <WhyTon />
                  <DocsSection />
                  <CommandPreview />
                  <PricingPreview />
                </>
              ),
            })}
          />
          <LazyViewportSection
            fallback={<LoadingSkeleton />}
            loader={async () => ({
              default: () => (
                <>
                  <LiveStats />
                  <FAQ />
                  <FinalCTA />
                </>
              ),
            })}
          />
        </main>

        <Suspense fallback={null}>
          <ScrollToTop />
          <StickyInviteCTA />
        </Suspense>

        <Footer />
      </div>
    </div>
  );
}
