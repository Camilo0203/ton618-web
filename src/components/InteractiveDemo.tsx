import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Monitor, Shield, Zap, BarChart3, Ticket, Settings, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  instantReveal,
  instantTransition,
  motionDurations,
  motionEase,
  motionStagger,
  motionViewport,
  sectionIntro,
  tabPanelTransition,
  withDelay,
} from '../lib/motion';

type TabKey = 'moderation' | 'automation' | 'tickets' | 'analytics';

function ModerationView({ t }: { t: (key: string) => string }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setVisibleLines(5);
      return;
    }
    setVisibleLines(0);
    const interval = setInterval(() => {
      setVisibleLines((prev) => (prev < 5 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const actions = [
    { text: t('demo.moderation.action1'), icon: Shield, color: 'text-red-400', time: '12:03' },
    { text: t('demo.moderation.action2'), icon: AlertTriangle, color: 'text-amber-400', time: '12:05' },
    { text: t('demo.moderation.action3'), icon: Clock, color: 'text-orange-400', time: '12:08' },
    { text: t('demo.moderation.action4'), icon: Shield, color: 'text-red-400', time: '12:12' },
    { text: t('demo.moderation.action5'), icon: AlertTriangle, color: 'text-amber-400', time: '12:15' },
  ];

  return (
    <div className="space-y-2">
      {actions.slice(0, visibleLines).map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={i}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? instantTransition : { duration: motionDurations.fast, ease: motionEase }}
            className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-4 py-3"
          >
            <Icon className={`h-4 w-4 flex-shrink-0 ${action.color}`} />
            <span className="flex-1 text-sm text-slate-300">{action.text}</span>
            <span className="text-[10px] font-mono text-slate-600">{action.time}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function AutomationView({ t }: { t: (key: string) => string }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveNode(4);
      return;
    }
    setActiveNode(0);
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev < 4 ? prev + 1 : 0));
    }, 800);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const nodes = [
    { label: t('demo.automation.node1'), color: 'border-cyan-500/40 bg-cyan-500/10' },
    { label: t('demo.automation.node2'), color: 'border-amber-500/40 bg-amber-500/10' },
    { label: t('demo.automation.node3'), color: 'border-indigo-500/40 bg-indigo-500/10' },
    { label: t('demo.automation.node4'), color: 'border-emerald-500/40 bg-emerald-500/10' },
    { label: t('demo.automation.node5'), color: 'border-purple-500/40 bg-purple-500/10' },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      {nodes.map((node, i) => (
        <div key={i} className="flex w-full items-center gap-3">
          <motion.div
            animate={{
              scale: activeNode === i ? 1.02 : 1,
              borderColor: activeNode === i ? 'rgba(99,102,241,0.6)' : undefined,
            }}
            transition={shouldReduceMotion ? instantTransition : { duration: motionDurations.fast, ease: motionEase }}
            className={`flex-1 rounded-xl border px-4 py-3 text-center text-sm font-semibold text-slate-200 transition-[background-color,border-color,color,transform] duration-200 ${
              activeNode >= i ? node.color : 'border-white/5 bg-white/[0.02] text-slate-500'
            }`}
          >
            {node.label}
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div
              animate={{ opacity: activeNode > i ? 1 : 0.2 }}
              transition={shouldReduceMotion ? instantTransition : { duration: motionDurations.fast, ease: motionEase }}
              className="flex-shrink-0"
            >
              <ArrowRight className="h-4 w-4 rotate-90 text-indigo-500/60" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

function TicketsView({ t }: { t: (key: string) => string }) {
  const shouldReduceMotion = useReducedMotion();
  const tickets = [
    { ...getTicket(t, 't1'), statusColor: 'bg-emerald-400' },
    { ...getTicket(t, 't2'), statusColor: 'bg-amber-400' },
    { ...getTicket(t, 't3'), statusColor: 'bg-slate-400' },
    { ...getTicket(t, 't4'), statusColor: 'bg-red-400' },
  ];

  return (
    <div className="space-y-2">
      {tickets.map((ticket, i) => (
        <motion.div
          key={i}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? instantTransition
              : { duration: motionDurations.fast, delay: i * motionStagger.base, ease: motionEase }
          }
          className="flex items-center gap-4 rounded-lg bg-white/[0.03] px-4 py-3"
        >
          <div className={`h-2 w-2 flex-shrink-0 rounded-full ${ticket.statusColor}`} />
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold text-slate-200">{ticket.subject}</div>
            <div className="text-[10px] text-slate-500">{ticket.status} · {ticket.priority}</div>
          </div>
          <Ticket className="h-4 w-4 flex-shrink-0 text-slate-600" />
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsView({ t }: { t: (key: string) => string }) {
  const shouldReduceMotion = useReducedMotion();
  const labels = [
    t('demo.analytics.label1'),
    t('demo.analytics.label2'),
    t('demo.analytics.label3'),
    t('demo.analytics.label4'),
  ];
  const values = [847, 1243, 356, 42];
  const barHeights = [68, 88, 52, 36];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {labels.map((label, i) => (
          <motion.div
            key={i}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              shouldReduceMotion
                ? instantTransition
                : { duration: motionDurations.fast, delay: i * motionStagger.base, ease: motionEase }
            }
            className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center"
          >
            <div className="text-[10px] font-bold uppercase tracking-tight-readable text-slate-500">{label}</div>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={
                shouldReduceMotion
                  ? instantTransition
                  : { duration: motionDurations.fast, delay: 0.12 + i * motionStagger.base, ease: motionEase }
              }
              className="mt-1 text-xl font-bold tabular-nums text-white"
            >
              {values[i].toLocaleString()}
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-end justify-center gap-2" style={{ height: '100px' }}>
          {barHeights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}px` }}
              transition={
                shouldReduceMotion
                  ? instantTransition
                  : { duration: 0.4, delay: 0.08 + i * motionStagger.base, ease: motionEase }
              }
              className="w-8 rounded-t bg-gradient-to-t from-indigo-500/60 to-indigo-400/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getTicket(t: (key: string) => string, id: string) {
  return {
    subject: t(`demo.tickets.${id}.subject`),
    status: t(`demo.tickets.${id}.status`),
    priority: t(`demo.tickets.${id}.priority`),
  };
}

const tabIcons: Record<TabKey, typeof Shield> = {
  moderation: Shield,
  automation: Zap,
  tickets: Ticket,
  analytics: BarChart3,
};

export default function InteractiveDemo() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('moderation');
  const shouldReduceMotion = useReducedMotion();
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const secondaryIntroReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);

  const tabs: TabKey[] = ['moderation', 'automation', 'tickets', 'analytics'];

  return (
    <section id="demo" aria-labelledby="demo-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            variants={introReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <Monitor className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('demo.tag')}</span>
          </motion.div>

          <motion.h2
            id="demo-heading"
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('demo.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('demo.titleAccent')}</span>
          </motion.h2>

          <motion.p
            variants={secondaryIntroReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-400 md:text-lg"
          >
            {t('demo.description')}
          </motion.p>
        </div>

        <motion.div
          variants={secondaryIntroReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl"
        >
          {/* Window header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <span className="text-xs font-semibold text-slate-400">TON618 Dashboard</span>
            </div>
            <Settings className="h-3.5 w-3.5 text-slate-600" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-[background-color,border-color,color] duration-200 ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-500 bg-indigo-500/5 text-indigo-300'
                      : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t(`demo.tabs.${tab}`)}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                transition={shouldReduceMotion ? instantTransition : tabPanelTransition}
              >
                {activeTab === 'moderation' && <ModerationView t={t} />}
                {activeTab === 'automation' && <AutomationView t={t} />}
                {activeTab === 'tickets' && <TicketsView t={t} />}
                {activeTab === 'analytics' && <AnalyticsView t={t} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
