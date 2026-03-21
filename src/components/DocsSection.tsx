import { BookOpen, ExternalLink, LifeBuoy, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { config, getDashboardUrl } from '../config';

export default function DocsSection() {
  const { t } = useTranslation();
  const supportHref = config.supportServerUrl || (config.contactEmail ? `mailto:${config.contactEmail}` : '#join');
  const resourceCards = [
    {
      id: 'docs',
      title: t('docsSection.cards.docs.title'),
      description: t('docsSection.cards.docs.description'),
      icon: BookOpen,
      href: config.docsUrl || '#join',
      external: Boolean(config.docsUrl),
      cta: config.docsUrl ? t('docsSection.cards.docs.ctaExternal') : t('docsSection.cards.docs.ctaFallback'),
    },
    {
      id: 'dashboard',
      title: t('docsSection.cards.dashboard.title'),
      description: t('docsSection.cards.dashboard.description'),
      icon: ShieldCheck,
      href: getDashboardUrl(),
      external: getDashboardUrl().startsWith('http'),
      cta: t('docsSection.cards.dashboard.cta'),
    },
    {
      id: 'support',
      title: t('docsSection.cards.support.title'),
      description: t('docsSection.cards.support.description'),
      icon: LifeBuoy,
      href: supportHref,
      external: Boolean(config.supportServerUrl || config.contactEmail),
      cta: (config.supportServerUrl || config.contactEmail)
        ? t('docsSection.cards.support.ctaExternal')
        : t('docsSection.cards.support.ctaFallback'),
    },
  ];

  return (
    <section id="docs" aria-labelledby="docs-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-400">{t('docsSection.eyebrow')}</span>
            <h2 id="docs-heading" className="text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl">
              {t('docsSection.title')}
              <br />
              <span className="headline-accent headline-accent-solid">{t('docsSection.titleAccent')}</span>
            </h2>
          </div>

          <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
            {t('docsSection.description')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {resourceCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.id} className="tech-card flex h-full flex-col overflow-hidden">
                <div className="premium-icon-tile mb-7 h-14 w-14">
                  <Icon className="h-6 w-6 text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">{card.title}</h3>
                <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-400">{card.description}</p>
                {card.external ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
                  >
                    <span>{card.cta}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : card.href.startsWith('/') ? (
                  <Link
                    to={card.href}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
                  >
                    <span>{card.cta}</span>
                  </Link>
                ) : (
                  <a href={card.href} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white">
                    <span>{card.cta}</span>
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
