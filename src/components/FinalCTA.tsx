import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Zap, BookOpen, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { config, getDiscordInviteUrl, getPublicDashboardUrl } from '../config';
import Logo from './Logo';

export default function FinalCTA() {
  const { t } = useTranslation();
  const isEnglish = t('nav.docs') === 'Docs';
  const inviteUrl = getDiscordInviteUrl();
  const publicDashboardUrl = getPublicDashboardUrl();
  const canInvite = Boolean(inviteUrl);
  const copy = isEnglish
    ? {
        tag: 'Launch path',
        title: 'Ship An Ops',
        titleAccent: 'Console That Staff Uses',
        description: 'Install TON618, open the dashboard, activate the first playbooks and run the beta with real staff instead of another command dump.',
        cta: 'Install beta',
        secondaryCta: 'Open ops console',
        docsCta: 'Launch docs',
        supportCta: 'Support channel',
        nodes: {
          active: 'Live playbooks',
          encryption: 'Guided rollout',
          stabilized: 'Staff-ready inbox',
        },
      }
    : {
        tag: 'Ruta de salida',
        title: 'Lanza Una Ops',
        titleAccent: 'Console Que El Staff Use',
        description: 'Instala TON618, abre el dashboard, activa los primeros playbooks y corre la beta con staff real en lugar de otro dump de comandos.',
        cta: 'Instalar beta',
        secondaryCta: 'Abrir ops console',
        docsCta: 'Docs de salida',
        supportCta: 'Canal de soporte',
        nodes: {
          active: 'Playbooks vivos',
          encryption: 'Rollout guiado',
          stabilized: 'Inbox listo para staff',
        },
      };

  return (
    <section id="join" aria-labelledby="final-heading" className="relative overflow-hidden bg-black py-28">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/4 blur-[180px]"></div>
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/6 blur-[120px] animate-pulse-slow"></div>

        <div
          className="absolute left-1/2 top-1/2 h-screen w-screen -translate-x-1/2 -translate-y-1/2 opacity-[0.16] mix-blend-screen"
          style={{
            maskImage: 'radial-gradient(circle at center, transparent 0%, transparent 16%, black 52%, transparent 88%)',
            WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, transparent 16%, black 52%, transparent 88%)',
          }}
        >
          <motion.video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            aria-hidden="true"
            className="h-full w-full scale-125 object-contain"
          >
            <source src="/videos/lensing-arc.webm" type="video/webm" />
            <source src="/videos/lensing-arc.mp4" type="video/mp4" />
          </motion.video>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,4,10,0.08)_0%,rgba(3,4,10,0.2)_44%,rgba(0,0,0,0.74)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2">
            <Zap className="h-3 w-3 fill-indigo-400 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-tight-readable text-indigo-300">{copy.tag}</span>
          </div>

          <h2 id="final-heading" className="mb-8 text-4xl font-black uppercase leading-[0.9] tracking-tightest text-white sm:text-6xl lg:text-7xl">
            {copy.title} <br />
            <span className="headline-accent headline-accent-solid">{copy.titleAccent}</span>
          </h2>

          <p className="mx-auto mb-12 max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
            {copy.description}
          </p>

          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            {canInvite ? (
              <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className="btn-premium-primary group text-base sm:text-lg !px-8 !py-5">
                <Logo size="xs" withText={false} frameClassName="border-black/5 bg-white/10 shadow-none" imageClassName="scale-[1.02]" />
                <span>{copy.cta}</span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="btn-premium-primary cursor-not-allowed text-base opacity-60 sm:text-lg !px-8 !py-5"
                title={t('final.unavailable')}
              >
                <Logo size="xs" withText={false} frameClassName="border-black/5 bg-white/10 shadow-none" imageClassName="scale-[1.02]" />
                <span>{copy.cta}</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {publicDashboardUrl ? (
              publicDashboardUrl.startsWith('/') ? (
                <Link to={publicDashboardUrl} className="btn-premium-outline group !px-8 !py-5">
                  <span>{copy.secondaryCta}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <a href={publicDashboardUrl} className="btn-premium-outline group !px-8 !py-5">
                  <span>{copy.secondaryCta}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              )
            ) : null}

            {config.docsUrl ? (
              <a href={config.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">
                <BookOpen className="h-4 w-4" />
                <span>{copy.docsCta}</span>
              </a>
            ) : null}

            {config.supportServerUrl ? (
              <a href={config.supportServerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">
                <LifeBuoy className="h-4 w-4" />
                <span>{copy.supportCta}</span>
              </a>
            ) : null}
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
              <span>{copy.nodes.active}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
              <span>{copy.nodes.encryption}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              <span>{copy.nodes.stabilized}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
