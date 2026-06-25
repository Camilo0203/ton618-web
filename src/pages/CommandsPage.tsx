import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Crown,
  Gift,
  LifeBuoy,
  Music2,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  UsersRound,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCanonicalUrl, getDiscordInviteUrl } from '../config';

const copy = {
  en: {
    title: 'TON618 command center',
    accent: 'All modules in one place',
    subtitle:
      'A clean public catalog for admins and staff: setup, moderation, tickets, verification, music, community tools and premium operations.',
    badge: 'Slash commands',
    metaTitle: 'TON618 Commands | Public command catalog',
    metaDescription:
      'Explore TON618 slash commands for setup, tickets, verification, moderation, music, analytics and premium tools.',
    back: 'Back home',
    invite: 'Invite TON618',
    docs: 'Open docs',
    tipTitle: 'Production tip',
    tipBody:
      'Start with setup, tickets and verification. Then enable moderation logs, music and community modules from the dashboard so staff see only what matters.',
    searchHint: 'Use Discord slash autocomplete: type / and choose TON618.',
    categories: [
      {
        id: 'setup',
        icon: Settings2,
        title: 'Setup & dashboard',
        description: 'Initial configuration, language and server control panel.',
        commands: [
          ['/setup', 'Launch the guided server setup.'],
          ['/setup language', 'Choose English or Spanish for the server.'],
          ['/config center', 'Open the interactive configuration center.'],
          ['/quickstart', 'Review the fastest launch checklist.'],
        ],
      },
      {
        id: 'tickets',
        icon: LifeBuoy,
        title: 'Tickets & support',
        description: 'Professional support flow for staff teams.',
        commands: [
          ['/ticket', 'Create or manage support tickets.'],
          ['/ticket panel', 'Publish a ticket panel in a channel.'],
          ['/staff', 'Manage staff helpers and assignments.'],
          ['/stats sla', 'Review response time and SLA health.'],
        ],
      },
      {
        id: 'verification',
        icon: ShieldCheck,
        title: 'Verification & security',
        description: 'Protect access and keep new members controlled.',
        commands: [
          ['/verify', 'Start member verification.'],
          ['/verify panel', 'Create a verification panel.'],
          ['/automod', 'Tune automated protection rules.'],
          ['/audit', 'Review security and configuration events.'],
        ],
      },
      {
        id: 'moderation',
        icon: UsersRound,
        title: 'Moderation',
        description: 'Tools for warnings, logs and server discipline.',
        commands: [
          ['/warn', 'Warn a member and keep a staff record.'],
          ['/mod', 'Open moderation actions.'],
          ['/modlogs', 'Configure moderation log channels.'],
          ['/case', 'Review a moderation case.'],
        ],
      },
      {
        id: 'music',
        icon: Music2,
        title: 'Music',
        description: 'Lavalink-powered playback now inside ton618-bot.',
        commands: [
          ['/play', 'Play a track, playlist or search query.'],
          ['/pause', 'Pause or resume the current player.'],
          ['/skip', 'Skip to the next track.'],
          ['/queue', 'View the current music queue.'],
          ['/nowplaying', 'Show the active track and controls.'],
          ['/shuffle', 'Shuffle the queue.'],
          ['/loop', 'Loop track or queue.'],
          ['/volume', 'Adjust server playback volume.'],
        ],
      },
      {
        id: 'community',
        icon: Gift,
        title: 'Community',
        description: 'Engagement commands for active Discord servers.',
        commands: [
          ['/giveaway', 'Create giveaways with automatic winners.'],
          ['/poll', 'Run community polls.'],
          ['/suggest', 'Send and manage suggestions.'],
          ['/profile', 'View a member profile.'],
          ['/level', 'Check XP and leveling progress.'],
        ],
      },
      {
        id: 'analytics',
        icon: BarChart3,
        title: 'Analytics & operations',
        description: 'Health, activity and server metrics for owners.',
        commands: [
          ['/stats', 'View server and bot statistics.'],
          ['/serverstats', 'Inspect server activity and growth.'],
          ['/health', 'Check bot and service health.'],
          ['/debug', 'Collect diagnostic information.'],
        ],
      },
      {
        id: 'premium',
        icon: Crown,
        title: 'Premium',
        description: 'Billing and premium server features.',
        commands: [
          ['/premium', 'View premium state and benefits.'],
          ['/premium activate', 'Redeem an activation code.'],
          ['/pro', 'Open pro tools and upgrade paths.'],
        ],
      },
    ],
  },
  es: {
    title: 'Centro de comandos TON618',
    accent: 'Todos los módulos en un solo lugar',
    subtitle:
      'Un catálogo público limpio para admins y staff: setup, moderación, tickets, verificación, música, comunidad y herramientas premium.',
    badge: 'Slash commands',
    metaTitle: 'Comandos TON618 | Catálogo público',
    metaDescription:
      'Explora los slash commands de TON618 para setup, tickets, verificación, moderación, música, analíticas y herramientas premium.',
    back: 'Volver al inicio',
    invite: 'Invitar TON618',
    docs: 'Abrir docs',
    tipTitle: 'Consejo de producción',
    tipBody:
      'Empieza por setup, tickets y verificación. Luego activa logs de moderación, música y comunidad desde el dashboard para que el staff vea solo lo importante.',
    searchHint: 'Usa el autocompletado de Discord: escribe / y elige TON618.',
    categories: [
      {
        id: 'setup',
        icon: Settings2,
        title: 'Setup y dashboard',
        description: 'Configuración inicial, idioma y panel de control del servidor.',
        commands: [
          ['/setup', 'Inicia la configuración guiada del servidor.'],
          ['/setup language', 'Elige inglés o español para el servidor.'],
          ['/config center', 'Abre el centro interactivo de configuración.'],
          ['/quickstart', 'Revisa el checklist más rápido para lanzar.'],
        ],
      },
      {
        id: 'tickets',
        icon: LifeBuoy,
        title: 'Tickets y soporte',
        description: 'Flujo profesional de soporte para equipos de staff.',
        commands: [
          ['/ticket', 'Crea o gestiona tickets de soporte.'],
          ['/ticket panel', 'Publica un panel de tickets en un canal.'],
          ['/staff', 'Gestiona helpers y asignaciones del staff.'],
          ['/stats sla', 'Revisa tiempos de respuesta y salud SLA.'],
        ],
      },
      {
        id: 'verification',
        icon: ShieldCheck,
        title: 'Verificación y seguridad',
        description: 'Protege el acceso y controla nuevos miembros.',
        commands: [
          ['/verify', 'Inicia la verificación de miembros.'],
          ['/verify panel', 'Crea un panel de verificación.'],
          ['/automod', 'Ajusta reglas de protección automática.'],
          ['/audit', 'Revisa eventos de seguridad y configuración.'],
        ],
      },
      {
        id: 'moderation',
        icon: UsersRound,
        title: 'Moderación',
        description: 'Herramientas para warns, logs y disciplina del servidor.',
        commands: [
          ['/warn', 'Advierte a un miembro y guarda registro.'],
          ['/mod', 'Abre acciones de moderación.'],
          ['/modlogs', 'Configura canales de logs de moderación.'],
          ['/case', 'Revisa un caso de moderación.'],
        ],
      },
      {
        id: 'music',
        icon: Music2,
        title: 'Música',
        description: 'Reproducción con Lavalink integrada dentro de ton618-bot.',
        commands: [
          ['/play', 'Reproduce una canción, playlist o búsqueda.'],
          ['/pause', 'Pausa o reanuda el reproductor actual.'],
          ['/skip', 'Salta a la siguiente canción.'],
          ['/queue', 'Muestra la cola de música.'],
          ['/nowplaying', 'Muestra la canción actual y controles.'],
          ['/shuffle', 'Mezcla la cola.'],
          ['/loop', 'Activa loop de canción o cola.'],
          ['/volume', 'Ajusta el volumen del servidor.'],
        ],
      },
      {
        id: 'community',
        icon: Gift,
        title: 'Comunidad',
        description: 'Comandos de engagement para servidores activos.',
        commands: [
          ['/giveaway', 'Crea sorteos con ganadores automáticos.'],
          ['/poll', 'Lanza encuestas para la comunidad.'],
          ['/suggest', 'Envía y gestiona sugerencias.'],
          ['/profile', 'Muestra el perfil de un miembro.'],
          ['/level', 'Consulta XP y progreso de niveles.'],
        ],
      },
      {
        id: 'analytics',
        icon: BarChart3,
        title: 'Analíticas y operación',
        description: 'Salud, actividad y métricas para owners.',
        commands: [
          ['/stats', 'Muestra estadísticas del servidor y bot.'],
          ['/serverstats', 'Inspecciona actividad y crecimiento.'],
          ['/health', 'Comprueba salud del bot y servicios.'],
          ['/debug', 'Recoge información de diagnóstico.'],
        ],
      },
      {
        id: 'premium',
        icon: Crown,
        title: 'Premium',
        description: 'Facturación y funciones premium del servidor.',
        commands: [
          ['/premium', 'Muestra estado premium y beneficios.'],
          ['/premium activate', 'Canjea un código de activación.'],
          ['/pro', 'Abre herramientas pro y opciones de mejora.'],
        ],
      },
    ],
  },
} as const;

export default function CommandsPage() {
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith('es') ? 'es' : 'en';
  const text = copy[language];
  const inviteUrl = getDiscordInviteUrl();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-indigo-500/30">
      <Helmet>
        <title>{text.metaTitle}</title>
        <meta name="description" content={text.metaDescription} />
        <link rel="canonical" href={getCanonicalUrl('/commands')} />
      </Helmet>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-cinematic-atmosphere absolute inset-0" />
        <div className="bg-cinematic-texture absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-black" />
      </div>

      <div className="relative z-10">
        <header>
          <Navbar />
        </header>

        <main className="relative px-4 pb-16 pt-28">
          <section className="mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2">
                <Terminal className="h-4 w-4 text-indigo-300" />
                <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">
                  {text.badge}
                </span>
              </div>

              <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tightest text-white sm:text-5xl lg:text-7xl">
                {text.title}
                <br />
                <span className="headline-accent headline-accent-solid">{text.accent}</span>
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {text.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/" className="btn-premium-secondary">
                  <ArrowLeft className="h-4 w-4" />
                  {text.back}
                </Link>
                {inviteUrl ? (
                  <a href={inviteUrl} className="btn-premium-primary">
                    <Sparkles className="h-4 w-4" />
                    {text.invite}
                  </a>
                ) : null}
                <Link to="/docs" className="btn-premium-secondary">
                  <Bot className="h-4 w-4" />
                  {text.docs}
                </Link>
              </div>
            </motion.div>
          </section>

          <section className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-2">
            {text.categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <motion.article
                  key={category.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="tech-card group relative overflow-hidden p-6"
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-indigo-500/10 blur-3xl transition-opacity group-hover:opacity-80" />
                  <div className="relative flex items-start gap-4">
                    <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-[-0.04em] text-white">
                        {category.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-6 grid gap-2">
                    {category.commands.map(([name, description]) => (
                      <div
                        key={name}
                        className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 transition-colors hover:border-indigo-400/25 hover:bg-indigo-500/[0.055]"
                      >
                        <code className="font-mono text-sm font-black text-indigo-200">{name}</code>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
                      </div>
                    ))}
                  </div>
                </motion.article>
              );
            })}
          </section>

          <section className="mx-auto mt-10 max-w-6xl">
            <div className="tech-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-300">
                  {text.tipTitle}
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  {text.tipBody}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs font-bold text-slate-400">
                {text.searchHint}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
