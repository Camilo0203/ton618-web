import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Settings2, 
  ShieldCheck, 
  BarChart3, 
  LifeBuoy,
  ArrowLeft,
  MessageCircle,
  Mail,
  Crown,
  TicketCheck,
  Gift,
  Key
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { config, getCanonicalUrl } from '../config';

export default function DocsPage() {
  const { t } = useTranslation();

  const commandCategories = [
    {
      id: 'setup',
      icon: Settings2,
      title: t('docs.commands.setup.title'),
      description: t('docs.commands.setup.description'),
      commands: [
        { name: '/setup', desc: t('docs.commands.setup.cmds.setup') },
        { name: '/setup language', desc: t('docs.commands.setup.cmds.language') },
        { name: '/config center', desc: t('docs.commands.setup.cmds.configCenter') },
      ]
    },
    {
      id: 'tickets',
      icon: LifeBuoy,
      title: t('docs.commands.tickets.title'),
      description: t('docs.commands.tickets.description'),
      commands: [
        { name: '/ticket', desc: t('docs.commands.tickets.cmds.ticket') },
        { name: '/ticket panel', desc: t('docs.commands.tickets.cmds.panel') },
        { name: '/staff', desc: t('docs.commands.tickets.cmds.staff') },
      ]
    },
    {
      id: 'verification',
      icon: ShieldCheck,
      title: t('docs.commands.verification.title'),
      description: t('docs.commands.verification.description'),
      commands: [
        { name: '/verify', desc: t('docs.commands.verification.cmds.verify') },
        { name: '/verify panel', desc: t('docs.commands.verification.cmds.panel') },
      ]
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: t('docs.commands.analytics.title'),
      description: t('docs.commands.analytics.description'),
      commands: [
        { name: '/stats', desc: t('docs.commands.analytics.cmds.stats') },
        { name: '/audit', desc: t('docs.commands.analytics.cmds.audit') },
        { name: '/debug', desc: t('docs.commands.analytics.cmds.debug') },
      ]
    },
    {
      id: 'premium',
      icon: Crown,
      title: t('docs.commands.premium.title'),
      description: t('docs.commands.premium.description'),
      commands: [
        { name: '/pro redeem <code>', desc: t('docs.commands.premium.cmds.redeem') },
      ]
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <Helmet>
        <title>{t('docs.pageTitle')}</title>
        <meta name="description" content={t('docs.metaDescription')} />
        <link rel="canonical" href={getCanonicalUrl('/docs')} />
      </Helmet>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cinematic-atmosphere absolute inset-0"></div>
        <div className="bg-cinematic-texture absolute inset-0 opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-black"></div>
      </div>

      <div className="relative z-10">
        <header>
          <Navbar />
        </header>

        <main className="relative pt-24 pb-16">
          {/* Hero */}
          <section className="relative overflow-hidden px-4 pb-16">
            <div className="mx-auto max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">
                    {t('docs.hero.badge')}
                  </span>
                </div>

                <h1 className="text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-5xl lg:text-6xl">
                  {t('docs.hero.titlePrefix')} <br />
                  <span className="headline-accent headline-accent-solid">
                    {t('docs.hero.titleSuffix')}
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
                  {t('docs.hero.subtitle')}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Pro Activation Flow */}
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="tech-card overflow-hidden"
              >
                <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-6 py-4">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">
                    {t('docs.proActivation.title')}
                  </h2>
                </div>
                
                <div className="grid gap-6 p-6 md:grid-cols-4">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <TicketCheck className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">1. {t('docs.proActivation.steps.openTicket.title')}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {t('docs.proActivation.steps.openTicket.description')}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Key className="h-5 w-5 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">2. {t('docs.proActivation.steps.receiveCode.title')}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {t('docs.proActivation.steps.receiveCode.description')}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Terminal className="h-5 w-5 text-green-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">3. {t('docs.proActivation.steps.redeem.title')}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {t('docs.proActivation.steps.redeem.description')}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Gift className="h-5 w-5 text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">4. {t('docs.proActivation.steps.enjoyPro.title')}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {t('docs.proActivation.steps.enjoyPro.description')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Commands Grid */}
          <section className="px-4">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-6 md:grid-cols-2">
                {commandCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="tech-card overflow-hidden"
                    >
                      <div className="flex items-start gap-4 p-6">
                        <div className="premium-icon-tile h-12 w-12 shrink-0">
                          <Icon className="h-5 w-5 text-slate-200" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{category.title}</h2>
                          <p className="text-sm text-slate-400">{category.description}</p>
                        </div>
                      </div>

                      <div className="border-t border-white/8 px-6 py-4">
                        <ul className="space-y-3">
                          {category.commands.map((cmd) => (
                            <li key={cmd.name} className="flex items-start gap-3">
                              <code className="shrink-0 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 font-mono text-xs font-bold text-cyan-100">
                                {cmd.name}
                              </code>
                              <span className="text-sm text-slate-300">{cmd.desc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="mt-16 px-4">
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="cinematic-glass rounded-2xl border border-white/10 p-8 text-center"
              >
                <h2 className="text-2xl font-bold text-white">
                  {t('docs.quickLinks.title')}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-slate-400">
                  {t('docs.quickLinks.description')}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('docs.quickLinks.backToHome')}
                  </Link>

                  {config.supportServerUrl && (
                    <a
                      href={config.supportServerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t('docs.quickLinks.supportServer')}
                    </a>
                  )}

                  {config.contactEmail && (
                    <a
                      href={`mailto:${config.contactEmail}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      <Mail className="h-4 w-4" />
                      {config.contactEmail}
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
