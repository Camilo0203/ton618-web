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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="#top" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 hidden sm:inline">{config.botName}</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5" />
              <span className="uppercase">{i18n.language.split('-')[0]}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a
              href={inviteEnabled ? inviteUrl : '#top'}
              target={inviteEnabled ? '_blank' : undefined}
              rel={inviteEnabled ? 'noopener noreferrer' : undefined}
              aria-disabled={!inviteEnabled}
              onClick={(event) => {
                if (!inviteEnabled) {
                  event.preventDefault();
                }
              }}
              className={`inline-flex items-center justify-center px-5 h-9 rounded-lg font-semibold transition-all duration-300 text-sm ${
                inviteEnabled
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-70'
              }`}
            >
              Invite
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="md:hidden p-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex gap-2 items-center"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="space-y-2 pt-4">
              <div className="flex justify-around pb-2 border-b border-gray-200/50 dark:border-gray-800/50 mb-2">
                <button
                  onClick={toggleLanguage}
                  className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300"
                >
                  <Globe className="w-5 h-5 mb-1" />
                  <span className="text-xs uppercase">{i18n.language.split('-')[0]}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 mb-1" /> : <Moon className="w-5 h-5 mb-1" />}
                  <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors"
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
                  if (!inviteEnabled) {
                    event.preventDefault();
                    return;
                  }
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2 rounded-lg font-semibold text-center mt-2 ${
                  inviteEnabled
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-70'
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
