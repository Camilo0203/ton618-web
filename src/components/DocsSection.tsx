import { BookOpen, ExternalLink, LifeBuoy, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { config, getDashboardUrl, getDiscordInviteUrl } from '../config';

const resourceCards = [
  {
    id: 'docs',
    title: 'Documentacion operativa',
    description:
      'Guia de setup, modulos y decisiones de operacion para pasar de instalacion a uso real sin depender de conocimiento tribal.',
    icon: BookOpen,
    href: config.docsUrl || '#join',
    external: Boolean(config.docsUrl),
    cta: config.docsUrl ? 'Abrir docs' : 'Ir al cierre',
  },
  {
    id: 'dashboard',
    title: 'Dashboard listo para staff',
    description:
      'Abre configuracion, tickets y seguimiento operativo desde un panel que ya degrada con gracia cuando una fuente secundaria falla.',
    icon: ShieldCheck,
    href: getDashboardUrl(),
    external: getDashboardUrl().startsWith('http'),
    cta: 'Ver dashboard',
  },
  {
    id: 'support',
    title: 'Ruta de soporte y confianza',
    description:
      'Status, soporte y contacto quedan visibles para reducir friccion en evaluacion, onboarding y resolucion de incidencias.',
    icon: LifeBuoy,
    href: config.supportServerUrl || getDiscordInviteUrl() || '#join',
    external: Boolean(config.supportServerUrl || getDiscordInviteUrl()),
    cta: config.supportServerUrl ? 'Entrar a soporte' : 'Ver CTA principal',
  },
];

export default function DocsSection() {
  return (
    <section id="docs" aria-labelledby="docs-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-6 text-[10px] font-black uppercase tracking-[0.38em] text-cyan-300">Cierre comercial</p>
            <h2 id="docs-heading" className="text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl">
              Todo Lo Necesario
              <br />
              <span className="headline-accent headline-accent-solid">Para Evaluar Y Lanzar</span>
            </h2>
          </div>

          <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
            TON618 ya no se presenta solo como una landing bonita: invita, explica valor, abre dashboard y deja visibles los recursos que un equipo serio necesita antes de adoptar el producto.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {resourceCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.id} className="tech-card flex h-full flex-col overflow-hidden">
                <div className="premium-icon-tile mb-7 h-14 w-14">
                  <Icon className="h-6 w-6 text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">{card.title}</h3>
                <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-400">{card.description}</p>
                {card.external ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
                  >
                    <span>{card.cta}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : card.href.startsWith('/') ? (
                  <Link
                    to={card.href}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
                  >
                    <span>{card.cta}</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : (
                  <a href={card.href} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white">
                    <span>{card.cta}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
