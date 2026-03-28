import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BarChart3, BookOpen, Bug, LifeBuoy, Settings2, ShieldCheck, SlidersHorizontal, Terminal, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { config, getDiscordInviteUrl } from '../config';
import { cardStagger, instantReveal, motionStagger, motionViewport, revealUp, sectionIntro, withDelay, withDuration } from '../lib/motion';

const capabilityCards = [
  { id: 'launch', icon: Settings2, commands: ['/setup', '/ticket', '/verify'] },
  { id: 'operate', icon: Users, commands: ['/staff', '/stats'] },
  { id: 'control', icon: SlidersHorizontal, commands: ['/config center', '/audit', '/debug'] },
] as const;

const workflowSteps = [
  { id: 'setup', index: '01', icon: Settings2, commands: ['/setup'] },
  { id: 'tickets', index: '02', icon: LifeBuoy, commands: ['/ticket'] },
  { id: 'verify', index: '03', icon: ShieldCheck, commands: ['/verify'] },
  { id: 'staff', index: '04', icon: Users, commands: ['/staff'] },
  { id: 'measure', index: '05', icon: BarChart3, commands: ['/stats', '/config center'] },
  { id: 'audit', index: '06', icon: Bug, commands: ['/audit', '/debug'] },
] as const;

const roleCards = [
  { id: 'admin', icon: Settings2, commands: ['/setup', '/ticket', '/verify'] },
  { id: 'staff', icon: Users, commands: ['/staff'] },
  { id: 'owner', icon: SlidersHorizontal, commands: ['/stats', '/config center', '/audit', '/debug'] },
] as const;

interface CommandChipListProps {
  commands: readonly string[];
  label: string;
  className?: string;
}

function CommandChipList({ commands, label, className = 'mt-5' }: CommandChipListProps) {
  return (
    <ul aria-label={label} className={`${className} flex flex-wrap gap-2`}>
      {commands.map((command) => (
        <li key={command} className="list-none">
          <code className="inline-flex max-w-full rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 font-mono text-xs font-bold text-cyan-100">
            {command}
          </code>
        </li>
      ))}
    </ul>
  );
}

export default function CommandPreview() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const inviteUrl = getDiscordInviteUrl();
  const supportHref = config.supportServerUrl || (config.contactEmail ? `mailto:${config.contactEmail}` : '');
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const secondaryIntroReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);
  const gridReveal = shouldReduceMotion ? instantReveal : cardStagger;
  const summaryReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, 0.24);
  const stepReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, 0.28);
  const roleReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, 0.24);
  const noteReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.base);
  const sectionReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.base);
  const actions = [
    inviteUrl ? { id: 'invite', href: inviteUrl, label: t('nav.primaryCta'), prominent: true } : null,
    config.docsUrl ? { id: 'docs', href: config.docsUrl, label: t('hero.ctaSecondary'), prominent: false } : null,
    supportHref ? { id: 'support', href: supportHref, label: t('hero.ctaTertiary'), prominent: false } : null,
  ].filter((action): action is { id: string; href: string; label: string; prominent: boolean } => Boolean(action));

  return (
    <section id="commands" aria-labelledby="commands-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="absolute right-1/4 top-0 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-end">
          <div className="max-w-3xl">
            <motion.div
              variants={introReveal}
              initial="hidden"
              whileInView="show"
              viewport={motionViewport}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
            >
              <Terminal className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('commandPreview.tag')}</span>
            </motion.div>

            <motion.h2
              id="commands-heading"
              variants={secondaryIntroReveal}
              initial="hidden"
              whileInView="show"
              viewport={motionViewport}
              className="text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
            >
              {t('commandPreview.title')} <br />
              <span className="headline-accent headline-accent-solid">{t('commandPreview.titleAccent')}</span>
            </motion.h2>

            <motion.p
              variants={secondaryIntroReveal}
              initial="hidden"
              whileInView="show"
              viewport={motionViewport}
              className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
            >
              {t('commandPreview.description')}
            </motion.p>
          </div>

          <motion.aside variants={noteReveal} initial="hidden" whileInView="show" viewport={motionViewport} className="cinematic-glass rounded-[2rem] p-6 md:p-8">
            <div className="premium-icon-tile mb-6 h-12 w-12">
              <Terminal className="h-5 w-5 text-slate-100" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('commandPreview.note.eyebrow')}</p>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">{t('commandPreview.note.title')}</h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-300 md:text-base">{t('commandPreview.note.description')}</p>

            <ul className="mt-6 space-y-3">
              {['point1', 'point2', 'point3'].map((pointId) => (
                <li key={pointId} className="flex items-start gap-3 text-sm font-medium leading-relaxed text-slate-400">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <span>{t(`commandPreview.note.points.${pointId}`)}</span>
                </li>
              ))}
            </ul>

            {actions.length > 0 ? (
              <div className="mt-7 flex flex-wrap gap-3">
                {actions.map((action) => {
                  const isMailto = action.href.startsWith('mailto:');

                  return (
                    <a
                      key={action.id}
                      href={action.href}
                      target={isMailto ? undefined : '_blank'}
                      rel={isMailto ? undefined : 'noopener noreferrer'}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-[border-color,background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                        action.prominent
                          ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-50 hover:border-cyan-300/40 hover:bg-cyan-400/14'
                          : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {action.id === 'docs' ? <BookOpen className="h-4 w-4" /> : null}
                      <span>{action.label}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </motion.aside>
        </div>

        <motion.ul
          variants={gridReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {capabilityCards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.li key={card.id} variants={summaryReveal} className="list-none">
                <article className="cinematic-glass h-full rounded-[1.75rem] p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="premium-icon-tile h-12 w-12 shrink-0">
                      <Icon className="h-5 w-5 text-slate-100" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-tight-readable text-slate-300">
                      {t(`commandPreview.summary.items.${card.id}.label`)}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold tracking-tight text-white">{t(`commandPreview.summary.items.${card.id}.title`)}</h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400">{t(`commandPreview.summary.items.${card.id}.description`)}</p>
                  <CommandChipList commands={card.commands} label={t('commandPreview.commandsAria', { context: t(`commandPreview.summary.items.${card.id}.title`) })} />
                </article>
              </motion.li>
            );
          })}
        </motion.ul>

        <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-end">
          <motion.div variants={sectionReveal} initial="hidden" whileInView="show" viewport={motionViewport}>
            <p className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('commandPreview.workflow.eyebrow')}</p>
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{t('commandPreview.workflow.title')}</h3>
          </motion.div>

          <motion.p variants={secondaryIntroReveal} initial="hidden" whileInView="show" viewport={motionViewport} className="max-w-2xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
            {t('commandPreview.workflow.description')}
          </motion.p>
        </div>

        <motion.ol
          variants={gridReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {workflowSteps.map((step) => {
            const Icon = step.icon;

            return (
              <motion.li key={step.id} variants={stepReveal} className="list-none">
              <article className="tech-card flex h-full flex-col overflow-hidden">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-mono text-sm font-bold text-white">
                    {step.index}
                  </span>
                  <div className="premium-icon-tile h-11 w-11 shrink-0">
                    <Icon className="h-5 w-5 text-slate-100" />
                  </div>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t(`commandPreview.steps.${step.id}.role`)}</p>
                <h3 className="text-xl font-bold tracking-tight text-white">{t(`commandPreview.steps.${step.id}.title`)}</h3>
                <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-400">{t(`commandPreview.steps.${step.id}.description`)}</p>

                <div className="mt-6 border-t border-white/8 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-wide-readable text-slate-500">{t('commandPreview.commandsLabel')}</p>
                  <CommandChipList
                    commands={step.commands}
                    label={t('commandPreview.commandsAria', { context: t(`commandPreview.steps.${step.id}.title`) })}
                    className="mt-3"
                  />
                </div>
              </article>
              </motion.li>
            );
          })}
        </motion.ol>

        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <motion.div variants={secondaryIntroReveal} initial="hidden" whileInView="show" viewport={motionViewport} className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('commandPreview.roles.eyebrow')}</p>
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{t('commandPreview.roles.title')}</h3>
            <p className="mt-4 text-base font-medium leading-relaxed text-slate-400 md:text-lg">{t('commandPreview.roles.description')}</p>
          </motion.div>

          <motion.ul variants={gridReveal} initial="hidden" whileInView="show" viewport={motionViewport} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roleCards.map((role) => {
              const Icon = role.icon;

              return (
                <motion.li key={role.id} variants={roleReveal} className="list-none">
                <article className="cinematic-glass h-full rounded-[1.75rem] p-6">
                  <div className="premium-icon-tile mb-6 h-11 w-11">
                    <Icon className="h-5 w-5 text-slate-100" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wide-readable text-cyan-200">{t(`commandPreview.roles.items.${role.id}.eyebrow`)}</p>
                  <h4 className="mt-3 text-lg font-bold tracking-tight text-white">{t(`commandPreview.roles.items.${role.id}.title`)}</h4>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-400">{t(`commandPreview.roles.items.${role.id}.description`)}</p>

                  <p className="mt-5 text-[10px] font-bold uppercase tracking-wide-readable text-slate-500">{t('commandPreview.commandsLabel')}</p>
                  <CommandChipList
                    commands={role.commands}
                    label={t('commandPreview.commandsAria', { context: t(`commandPreview.roles.items.${role.id}.eyebrow`) })}
                    className="mt-3"
                  />
                </article>
              </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
