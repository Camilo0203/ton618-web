import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDiscordLoginUrl } from '../config';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loginUrl = getDiscordLoginUrl();

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Architecture', href: '#experience' },
    { name: 'Why TON', href: '#why' },
    { name: 'Network', href: '#stats' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between px-6 py-3 transition-all duration-700 ${scrolled ? 'cinematic-glass rounded-2xl border-white/[0.05] shadow-2xl shadow-black/80' : ''}`}>
          
          <div className="flex items-center gap-16">
            <a href="/" className="flex items-center gap-3 group">
               <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-md group-hover:bg-indigo-500/40 transition-colors duration-500"></div>
                  <Zap className="w-5 h-5 text-indigo-400 relative z-10 group-hover:scale-110 transition-transform duration-500" />
               </div>
               <span className="text-lg font-black tracking-[-0.05em] uppercase text-white group-hover:text-indigo-200 transition-colors duration-500">TON618</span>
            </a>

            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 hover:text-white transition-all duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-indigo-500 transition-all duration-500 group-hover:w-full"></span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={loginUrl}
              className="hidden md:flex btn-premium-primary !px-6 !py-2.5 !text-[10px] !rounded-lg"
            >
              <span>Initialize HUD</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 px-6 pt-2 overflow-hidden"
          >
            <div className="cinematic-glass rounded-2xl border-white/5 p-8 flex flex-col gap-8 shadow-3xl shadow-black">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-white"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-white/5" />
              <a
                href={loginUrl}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl"
              >
                <span>Initialize Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

