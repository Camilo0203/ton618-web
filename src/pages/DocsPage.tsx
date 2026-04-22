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

const commandCategories = [
  {
    id: 'setup',
    icon: Settings2,
    title: 'Setup & Configuration',
    description: 'Initial server setup and configuration commands',
    commands: [
      { name: '/setup', desc: 'Interactive setup wizard for channels, roles and permissions' },
      { name: '/setup language', desc: 'Change server language (English/Español)' },
      { name: '/config center', desc: 'Open configuration panel' },
    ]
  },
  {
    id: 'tickets',
    icon: LifeBuoy,
    title: 'Tickets & Support',
    description: 'Support ticket management commands',
    commands: [
      { name: '/ticket', desc: 'Create or manage support tickets' },
      { name: '/ticket panel', desc: 'Publish ticket panel to a channel' },
      { name: '/staff', desc: 'Staff queue and ticket assignment' },
    ]
  },
  {
    id: 'verification',
    icon: ShieldCheck,
    title: 'Verification',
    description: 'Member verification and access control',
    commands: [
      { name: '/verify', desc: 'Verification panel and member screening' },
      { name: '/verify panel', desc: 'Publish verification panel' },
    ]
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Stats & Analytics',
    description: 'Server metrics and operational data',
    commands: [
      { name: '/stats', desc: 'View server statistics and metrics' },
      { name: '/audit', desc: 'Audit log and moderation history' },
      { name: '/debug', desc: 'Technical diagnostics' },
    ]
  },
  {
    id: 'premium',
    icon: Crown,
    title: 'Premium',
    description: 'Activate and manage Pro subscription',
    commands: [
      { name: '/pro redeem <code>', desc: 'Activate Pro using your activation code (server owner only)' },
    ]
  }
];

export default function DocsPage() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language.startsWith('en');

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <Helmet>
        <title>{isEnglish ? 'Documentation | TON618' : 'Documentación | TON618'}</title>
        <meta name="description" content={isEnglish 
          ? 'TON618 command reference and documentation. Setup, tickets, verification, stats and staff operations.' 
          : 'Referencia de comandos y documentación de TON618. Setup, tickets, verificación, estadísticas y operaciones de staff.'} />
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
                    {isEnglish ? 'Command Reference' : 'Referencia de Comandos'}
                  </span>
                </div>

                <h1 className="text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-5xl lg:text-6xl">
                  {isEnglish ? 'TON618' : 'TON618'} <br />
                  <span className="headline-accent headline-accent-solid">
                    {isEnglish ? 'Documentation' : 'Documentación'}
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
                  {isEnglish 
                    ? 'Quick reference for all TON618 slash commands. All operations happen inside Discord—no external dashboard needed.'
                    : 'Referencia rápida de todos los comandos slash de TON618. Todas las operaciones ocurren dentro de Discord—sin dashboard externo.'}
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
                    {isEnglish ? 'Pro Activation Flow' : 'Flujo de Activación Pro'}
                  </h2>
                </div>
                
                <div className="grid gap-6 p-6 md:grid-cols-4">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <TicketCheck className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">1. {isEnglish ? 'Open Ticket' : 'Abrir Ticket'}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isEnglish 
                        ? 'Join support server and open a billing ticket with your payment receipt'
                        : 'Únete al servidor de soporte y abre un ticket de facturación con tu comprobante de pago'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Key className="h-5 w-5 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">2. {isEnglish ? 'Receive Code' : 'Recibir Código'}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isEnglish 
                        ? 'After verification, you\'ll receive an activation code via DM with instructions'
                        : 'Después de verificar, recibirás un código de activación por DM con instrucciones'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Terminal className="h-5 w-5 text-green-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">3. {isEnglish ? 'Redeem' : 'Canjear'}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isEnglish 
                        ? 'Run /pro redeem &lt;code&gt; in your server as the server owner'
                        : 'Ejecuta /pro redeem &lt;código&gt; en tu servidor como owner'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Gift className="h-5 w-5 text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">4. {isEnglish ? 'Enjoy Pro' : 'Disfruta Pro'}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isEnglish 
                        ? 'Premium features are instantly activated on your server'
                        : 'Las características premium se activan instantáneamente en tu servidor'}
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
                  {isEnglish ? 'Need more help?' : '¿Necesitas más ayuda?'}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-slate-400">
                  {isEnglish 
                    ? 'Join our support server for personalized assistance or check the live metrics page.'
                    : 'Únete a nuestro servidor de soporte para asistencia personalizada o revisa la página de métricas en vivo.'}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {isEnglish ? 'Back to home' : 'Volver al inicio'}
                  </Link>

                  {config.supportServerUrl && (
                    <a
                      href={config.supportServerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {isEnglish ? 'Support server' : 'Servidor de soporte'}
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
