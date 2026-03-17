import { Twitter, Github, MessageCircle, Mail, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { config } from '../config';
import Logo from './Logo';

interface FooterProps {
  onOpenLegal: (type: 'terms' | 'privacy' | 'cookies') => void;
}

export default function Footer({ onOpenLegal }: FooterProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-white/5 pt-40 pb-20 overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-4 mb-10">
              <Logo
                size="xl"
                subtitle="TON618"
                frameClassName="h-28 w-28 md:h-32 md:w-32"
                imageClassName="scale-[1.06]"
              />
            </div>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed mb-10 text-lg">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
               {[
                 { url: config.twitterUrl,      Icon: Twitter,        label: 'Twitter' },
                 { url: config.githubUrl,       Icon: Github,         label: 'GitHub' },
                 { url: config.supportServerUrl,Icon: MessageCircle,  label: 'Discord' },
                 { url: config.contactEmail ? `mailto:${config.contactEmail}` : null, Icon: Mail, label: 'Email' },
               ].filter(s => s.url).map(({ url, Icon, label }) => (
                 <a key={label} href={url!} target={label !== 'Email' ? '_blank' : undefined}
                   rel={label !== 'Email' ? 'noopener noreferrer' : undefined}
                   className="cinematic-glass flex h-14 w-14 items-center justify-center rounded-xl text-slate-400 transition-all duration-500 hover:scale-110 hover:text-white"
                   aria-label={label}>
                   <Icon className="w-6 h-6" />
                 </a>
               ))}
            </div>
          </div>

          <div>
             <h3 className="text-xs font-bold text-white uppercase tracking-[0.5em] mb-12 flex items-center gap-3">
                <div className="w-5 h-px bg-indigo-500"></div>
                {t('footer.navTitle')}
             </h3>
             <ul className="space-y-6">
                {[
                  { href: '#features', label: t('footer.nav.features') },
                  { href: '#experience', label: t('nav.architecture') },
                  { href: '#why', label: t('nav.whyTon') },
                  { href: '#stats', label: t('footer.nav.stats') }
                ].map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-xs text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-[0.2em] transition-all hover:translate-x-2 inline-block">
                      {item.label}
                    </a>
                  </li>
                ))}
             </ul>
          </div>

          <div>
             <h3 className="text-xs font-bold text-white uppercase tracking-[0.5em] mb-12 flex items-center gap-3">
                <div className="w-5 h-px bg-purple-500"></div>
                {t('footer.govTitle')}
             </h3>
             <ul className="space-y-6">
                {(['terms','privacy','cookies'] as const).map((type) => (
                  <li key={type}>
                    <button type="button" onClick={() => onOpenLegal(type)}
                      className="text-xs text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-[0.2em] transition-all hover:translate-x-2 text-left">
                      {t(`footer.gov.${type}`)}
                    </button>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex flex-wrap justify-center md:justify-start items-center gap-8">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                {t('footer.copyright', { year: currentYear })}
              </span>
              <div className="hidden md:block w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                   {t('footer.stabilized')}
                 </span>
              </div>
           </div>
           
           <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] group">
              <Map className="w-3 h-3 group-hover:text-indigo-500 transition-colors" />
              <span>{t('footer.commanded')}</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
