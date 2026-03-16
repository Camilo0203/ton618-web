import { useState } from 'react';
import { Bot, Menu, X, Globe } from 'lucide-react';
import { getDiscordInviteUrl, config } from '../config';
import { useTheme } from './ThemeProvider';
import { useTranslation } from 'react-i18next';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Stats', href: '#stats' },
  { label: 'Commands', href: '#commands' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
  { label: 'Support', href: '#support' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const inviteUrl = getDiscordInviteUrl();
  const inviteEnabled = Boolean(inviteUrl);
  useTheme(); // theme is not used
  const { i18n } = useTranslation();

  // The second redundant useTheme() call is removed.
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 gravitational-lens backdrop-blur-2xl border-b border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-amber-500 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <span className="font-black text-white text-xl tracking-tighter uppercase">{config.botName}</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-400 hover:text-amber-500 transition-colors font-bold text-sm uppercase tracking-widest"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold uppercase"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5 text-amber-500" />
              <span>{i18n.language.split('-')[0]}</span>
            </button>
            
            <a
              href={inviteEnabled ? inviteUrl : '#top'}
              target={inviteEnabled ? '_blank' : undefined}
              rel={inviteEnabled ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center px-8 py-3 bg-amber-500 text-black rounded-2xl font-black transition-all duration-300 text-sm hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-110 uppercase tracking-widest"
            >
              Establish Sync
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="md:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7 text-amber-500" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6 border-t border-white/5">
            <div className="space-y-2 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-amber-500 rounded-xl transition-colors font-bold uppercase tracking-wider"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-4 px-4 pt-4 border-t border-white/5 mt-4">
                <button onClick={toggleLanguage} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl text-slate-300 w-full justify-center">
                  <Globe className="w-5 h-5 text-amber-500" />
                  <span className="font-bold uppercase">{i18n.language}</span>
                </button>
              </div>
              <a
                href={inviteEnabled ? inviteUrl : '#top'}
                className="block w-full px-4 py-5 bg-amber-500 text-black rounded-2xl font-black text-center mt-6 uppercase tracking-widest"
              >
                Establish Sync
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
