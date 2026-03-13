import { useState } from 'react';
import { Bot, Menu, X, Moon, Sun, Globe } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-50/90 dark:bg-surface-900/90 backdrop-blur-xl border-b border-brand-200 dark:border-surface-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-1.5 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white hidden sm:inline tracking-tight">{config.botName}</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-brand-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-brand-400 transition-colors font-medium text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="p-2 text-brand-600 dark:text-slate-400 hover:bg-brand-100 dark:hover:bg-surface-700 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{i18n.language.split('-')[0]}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-brand-600 dark:text-slate-400 hover:bg-brand-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a
              href={inviteEnabled ? inviteUrl : '#top'}
              target={inviteEnabled ? '_blank' : undefined}
              rel={inviteEnabled ? 'noopener noreferrer' : undefined}
              aria-disabled={!inviteEnabled}
              onClick={(event) => { if (!inviteEnabled) event.preventDefault(); }}
              className={`inline-flex items-center justify-center px-5 h-9 rounded-lg font-semibold transition-all duration-300 text-sm ${
                inviteEnabled
                  ? 'bg-gradient-to-r from-brand-500 to-violet-600 text-white hover:shadow-lg hover:scale-105 hover:from-brand-600 hover:to-violet-700'
                  : 'bg-gray-200 dark:bg-surface-700 text-gray-500 dark:text-slate-500 cursor-not-allowed opacity-70'
              }`}
            >
              Invite
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="md:hidden p-2 text-gray-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-surface-700 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-brand-100 dark:border-surface-700">
            <div className="space-y-1 pt-4">
              <div className="flex justify-around pb-3 border-b border-brand-100 dark:border-surface-700 mb-2">
                <button onClick={toggleLanguage} className="flex flex-col items-center p-2 text-gray-500 dark:text-slate-400">
                  <Globe className="w-5 h-5 mb-1" />
                  <span className="text-xs uppercase">{i18n.language.split('-')[0]}</span>
                </button>
                <button onClick={toggleTheme} className="flex flex-col items-center p-2 text-gray-500 dark:text-slate-400">
                  {theme === 'dark' ? <Sun className="w-5 h-5 mb-1" /> : <Moon className="w-5 h-5 mb-1" />}
                  <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-surface-700 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={inviteEnabled ? inviteUrl : '#top'}
                target={inviteEnabled ? '_blank' : undefined}
                rel={inviteEnabled ? 'noopener noreferrer' : undefined}
                aria-disabled={!inviteEnabled}
                onClick={(event) => {
                  if (!inviteEnabled) { event.preventDefault(); return; }
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2.5 rounded-lg font-semibold text-center mt-2 ${
                  inviteEnabled
                    ? 'bg-gradient-to-r from-brand-500 to-violet-600 text-white'
                    : 'bg-gray-200 dark:bg-surface-700 text-gray-500 cursor-not-allowed opacity-70'
                }`}
              >
                Invite Bot
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
