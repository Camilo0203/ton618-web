import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail, MessageCircle } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import Logo from '../components/Logo';
import { config, getAbsoluteAssetUrl, getCanonicalUrl } from '../config';
import {
  LEGAL_DOCUMENT_TYPES,
  getLegalDocumentContent,
  type LegalDocumentType,
} from '../lib/legalDocuments';

interface LegalPageProps {
  type: LegalDocumentType;
}

export default function LegalPage({ type }: LegalPageProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const document = getLegalDocumentContent(t, type);
  const canonicalUrl = getCanonicalUrl(location.pathname);
  const socialImageUrl = getAbsoluteAssetUrl(config.socialImagePath);
  const locale = i18n.language.startsWith('es') ? 'es_ES' : 'en_US';
  const contactLinks = [
    config.supportServerUrl
      ? {
          href: config.supportServerUrl,
          label: t('legal.page.supportCta'),
          icon: MessageCircle,
          external: true,
        }
      : null,
    config.contactEmail
      ? {
          href: `mailto:${config.contactEmail}`,
          label: config.contactEmail,
          icon: Mail,
          external: false,
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    icon: typeof MessageCircle;
    external: boolean;
  }>;

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <Helmet>
        <html lang={i18n.language.startsWith('es') ? 'es' : 'en'} />
        <title>{`${config.botName} | ${document.title}`}</title>
        <meta name="description" content={document.metaDescription} />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#05060f" />
        <meta name="color-scheme" content="dark" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={config.botName} />
        <meta property="og:title" content={`${config.botName} | ${document.title}`} />
        <meta property="og:description" content={document.metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:locale" content={locale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${config.botName} | ${document.title}`} />
        <meta name="twitter:description" content={document.metaDescription} />
        <meta name="twitter:image" content={socialImageUrl} />
      </Helmet>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cinematic-atmosphere absolute inset-0" />
        <div className="bg-cinematic-texture absolute inset-0 opacity-35" />
        <div className="bg-film-grain absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040612] via-black/80 to-black" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/8 bg-black/45 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex items-center justify-between gap-4 sm:gap-5 lg:min-w-0">
              <Link
                to="/"
                className="inline-flex min-w-0 items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition hover:border-white/15 hover:bg-white/[0.05]"
              >
                <Logo size="md" subtitle={config.botName} withText={false} frameClassName="h-14 w-14" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-300">
                    {t('legal.page.eyebrow')}
                  </p>
                  <p className="text-sm font-semibold text-white">{t('legal.page.backToSite')}</p>
                </div>
              </Link>

              <div className="shrink-0 lg:hidden">
                <LanguageSelector />
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:flex-row lg:items-center lg:justify-end lg:gap-4">
              <nav
                aria-label={t('legal.page.navLabel')}
                className="flex flex-wrap gap-2 lg:min-w-0 lg:flex-1 lg:justify-end"
              >
                {LEGAL_DOCUMENT_TYPES.map((documentType) => {
                  const href = `/${documentType}`;
                  const isActive = location.pathname === href;

                  return (
                    <Link
                      key={documentType}
                      to={href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-tight-readable transition ${
                        isActive
                          ? 'border-indigo-400/50 bg-indigo-500/15 text-white'
                          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {t(`legal.${documentType}.title`)}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden lg:block lg:shrink-0">
                <LanguageSelector mode="desktop" desktopMenuPlacement="bottom" />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-12">
            <div className="mb-10 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-300">
                {t('legal.core')}
              </span>
              <span>{`${t('legal.update')}: ${document.lastUpdated}`}</span>
              <span>{t('legal.status')}</span>
            </div>

            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('legal.page.backToSite')}</span>
            </Link>

            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-300">
                {t('legal.page.publicLabel')}
              </p>
              <h1 className="mt-4 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white md:text-6xl">
                {document.title}
              </h1>
              <p className="mt-6 text-base leading-relaxed text-slate-300 md:text-lg">
                {document.summary}
              </p>
            </div>

            <div className="mt-12 grid gap-6">
              {document.sections.map((section) => (
                <section
                  key={section.heading}
                  className="rounded-[1.5rem] border border-white/8 bg-black/30 p-6 md:p-7"
                >
                  <h2 className="text-xl font-bold text-white md:text-2xl">{section.heading}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <section className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6">
                <h2 className="text-lg font-bold text-white">{t('legal.page.relatedTitle')}</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {LEGAL_DOCUMENT_TYPES.map((documentType) => (
                    <Link
                      key={documentType}
                      to={`/${documentType}`}
                      className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
                    >
                      {t(`legal.${documentType}.title`)}
                    </Link>
                  ))}
                </div>
              </section>

              {contactLinks.length > 0 ? (
                <section className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6">
                  <h2 className="text-lg font-bold text-white">{t('legal.page.contactTitle')}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {t('legal.page.contactDescription')}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {contactLinks.map(({ href, label, icon: Icon, external }) => (
                      <a
                        key={href}
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                        {external ? <ExternalLink className="h-3.5 w-3.5" /> : null}
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
