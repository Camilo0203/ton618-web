import { Twitter, Github, MessageCircle, Mail, Map, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { config, getDashboardUrl, getDiscordInviteUrl } from '../config';
import Logo from './Logo';

interface FooterProps {
  onOpenLegal: (type: 'terms' | 'privacy' | 'cookies') => void;
}

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const isHash = href.startsWith('#');
  const isInternal = href.startsWith('/');

  if (isHash) {
    return (
      <a href={href} className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
        <span>{label}</span>
      </a>
    );
  }

  if (isInternal) {
    return (
      <Link to={href} className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export default function Footer({ onOpenLegal }: FooterProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const inviteUrl = getDiscordInviteUrl();
  const dashboardUrl = getDashboardUrl();

  const productLinks = [
    { href: '#features', label: t('footer.nav.features') },
    { href: '#experience', label: t('footer.nav.experience') },
    { href: '#why', label: t('footer.nav.why') },
    { href: '#stats', label: t('footer.nav.stats') },
  ];

  const resourceLinks = [
    inviteUrl ? { href: inviteUrl, label: t('footer.nav.invite') } : null,
    { href: dashboardUrl, label: t('footer.nav.dashboard') },
    config.docsUrl ? { href: config.docsUrl, label: t('footer.nav.docs') } : null,
    config.statusUrl ? { href: config.statusUrl, label: t('footer.nav.status') } : null,
    config.githubUrl ? { href: config.githubUrl, label: t('footer.nav.github') } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  const supportLinks = [
    config.supportServerUrl ? { href: config.supportServerUrl, label: t('footer.nav.support') } : null,
    config.contactEmail ? { href: `mailto:${config.contactEmail}`, label: config.contactEmail } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  const socialLinks = [
    { url: config.twitterUrl, Icon: Twitter, label: 'Twitter' },
    { url: config.githubUrl, Icon: Github, label: 'GitHub' },
    { url: config.supportServerUrl, Icon: MessageCircle, label: 'Discord' },
    { url: config.contactEmail ? `mailto:${config.contactEmail}` : null, Icon: Mail, label: 'Email' },
  ].filter((item) => item.url);

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-black pb-16 pt-24" aria-label="Footer">
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <h2 className="sr-only">Footer</h2>
        <div className="mb-16 grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <Logo size="xl" subtitle="TON618" frameClassName="h-24 w-24 md:h-28 md:w-28" imageClassName="scale-[1.06]" />
            </div>

            <p className="mb-8 max-w-md text-base font-medium leading-relaxed text-slate-400">
              {t('footer.tagline')}
            </p>

            {inviteUrl ? (
              <a href={inviteUrl} className="btn-premium-primary mb-8 !px-5 !py-3 !text-[10px]">
                <span>{t('footer.inviteCta')}</span>
              </a>
            ) : null}

            <div className="flex flex-wrap gap-4">
              {socialLinks.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url!}
                  target={label !== 'Email' ? '_blank' : undefined}
                  rel={label !== 'Email' ? 'noopener noreferrer' : undefined}
                  className="cinematic-glass flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 transition-all duration-500 hover:scale-105 hover:text-white"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-[11px] font-bold uppercase tracking-tight-readable text-white">{t('footer.product.title')}</h3>
            <ul className="space-y-4">
              {productLinks.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-[11px] font-bold uppercase tracking-tight-readable text-white">{t('footer.resources.title')}</h3>
            <ul className="space-y-4">
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-[11px] font-bold uppercase tracking-tight-readable text-white">{t('footer.support.title')}</h3>
            <ul className="space-y-4">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href} label={item.label} />
                </li>
              ))}
              {(['terms', 'privacy', 'cookies'] as const).map((type) => (
                <li key={type}>
                  <button
                    type="button"
                    onClick={() => onOpenLegal(type)}
                    className="text-left text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    {t(`footer.gov.${type}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-white/5 pt-8 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-tight-readable text-slate-500">{t('footerShare.label')}</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out TON618 — premium Discord bot for moderation, automations and ops')}&url=${encodeURIComponent(config.siteUrl || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 transition hover:border-white/20 hover:text-white"
          >
            <Twitter className="h-3 w-3" />
            {t('footerShare.twitter')}
          </a>
          {config.supportServerUrl && (
            <a
              href={config.supportServerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 transition hover:border-white/20 hover:text-white"
            >
              <MessageCircle className="h-3 w-3" />
              {t('footerShare.discord')}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-6 border-t border-white/5 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-5">
            <span className="text-[10px] font-bold uppercase tracking-tight-readable text-slate-600">
              {t('footer.copyright', { year: currentYear })}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/60"></div>
              <span className="text-[10px] font-bold uppercase tracking-tight-readable text-slate-500">
                {t('footer.stabilized')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight-readable text-slate-600">
            <Map className="h-3 w-3" />
            <span>{t('footer.commanded')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
