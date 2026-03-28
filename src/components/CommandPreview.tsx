import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Terminal } from 'lucide-react';
import { instantReveal, motionStagger, motionViewport, revealUp, sectionIntro, withDelay, withDuration } from '../lib/motion';

const commandGroups = [
  { id: 'public', commands: ['help', 'perfil', 'poll', 'suggest'] },
  { id: 'staff', commands: ['ticketClaim', 'ticketNote', 'staffTickets', 'warnAdd'] },
  { id: 'admin', commands: ['setupWizard', 'verifyPanel', 'configStatus', 'statsSla'] },
] as const;

export default function CommandPreview() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const secondaryIntroReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);
  const groupReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, 0.28);
  const commandReveal = shouldReduceMotion ? instantReveal : withDuration(revealUp, 0.2);

  return (
    <section id="commands" aria-labelledby="commands-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute right-1/4 top-0 h-80 w-80 rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
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
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('commandPreview.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('commandPreview.titleAccent')}</span>
          </motion.h2>

          <motion.p
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('commandPreview.description')}
          </motion.p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {commandGroups.map((group, groupIndex) => (
            <motion.article
              key={group.id}
              variants={shouldReduceMotion ? instantReveal : withDelay(groupReveal, groupIndex * motionStagger.tight)}
              initial="hidden"
              whileInView="show"
              viewport={motionViewport}
              className="tech-card flex h-full flex-col overflow-hidden"
            >
              <div className="mb-8">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">
                  {t(`commandPreview.groups.${group.id}.label`)}
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  {t(`commandPreview.groups.${group.id}.title`)}
                </h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400">
                  {t(`commandPreview.groups.${group.id}.description`)}
                </p>
              </div>

              <div className="space-y-3">
                {group.commands.map((commandId, commandIndex) => (
                  <motion.div
                    key={commandId}
                    variants={shouldReduceMotion ? instantReveal : withDelay(commandReveal, commandIndex * 0.02)}
                    initial="hidden"
                    whileInView="show"
                    viewport={motionViewport}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                  >
                    <code className="block font-mono text-sm font-bold text-cyan-200">
                      {t(`commandPreview.groups.${group.id}.commands.${commandId}.path`)}
                    </code>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
                      {t(`commandPreview.groups.${group.id}.commands.${commandId}.description`)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
