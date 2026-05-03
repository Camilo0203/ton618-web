import type { ReactNode } from 'react';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Loader2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Logo from '../../components/Logo';
import { config } from '../../config';
import { dashboardEase, fadeUpVariants } from '../motion';

export type DashboardAccessStageVariant = 'loading' | 'success' | 'warning' | 'error';
export type DashboardAccessStageTone = 'brand' | 'success' | 'warning' | 'danger';
export type DashboardAccessStepState = 'pending' | 'active' | 'complete' | 'error';

export interface DashboardAccessProgressStep {
  label: string;
  state: DashboardAccessStepState;
}

interface DashboardAccessStageProps {
  variant?: DashboardAccessStageVariant;
  tone?: DashboardAccessStageTone;
  eyebrow: string;
  title: string;
  description: string;
  statusText?: string;
  progressLabel?: string;
  progressDescription?: string;
  progressSteps?: DashboardAccessProgressStep[];
  statusPill?: ReactNode;
  actions?: ReactNode;
  icon?: LucideIcon;
  brandLabel?: string;
}

interface DashboardAccessStatusPillProps {
  label: string;
  tone?: DashboardAccessStageTone;
  icon?: LucideIcon;
  spin?: boolean;
}

const toneByVariant: Record<DashboardAccessStageVariant, DashboardAccessStageTone> = {
  loading: 'brand',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

const variantIcons: Record<DashboardAccessStageVariant, LucideIcon> = {
  loading: Loader2,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const toneStyles: Record<
  DashboardAccessStageTone,
  {
    eyebrow: string;
    glow: string;
    panel: string;
    statusBox: string;
    iconTile: string;
    pill: string;
    activeStep: string;
    completeStep: string;
    errorStep: string;
  }
> = {
  brand: {
    eyebrow: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
    glow: 'bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.34),transparent_42%),radial-gradient(circle_at_18%_30%,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_82%_26%,rgba(255,255,255,0.06),transparent_18%)]',
    panel: 'border-indigo-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),rgba(4,7,18,0.88)]',
    statusBox: 'border-indigo-400/22 bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(34,211,238,0.04)),rgba(255,255,255,0.02)]',
    iconTile: 'border-indigo-400/24 bg-[linear-gradient(180deg,rgba(99,102,241,0.18),rgba(34,211,238,0.08)),rgba(255,255,255,0.04)] text-indigo-100',
    pill: 'border-indigo-400/24 bg-indigo-400/12 text-indigo-100',
    activeStep: 'border-indigo-400/26 bg-indigo-400/10 text-indigo-50',
    completeStep: 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100',
    errorStep: 'border-rose-400/24 bg-rose-400/10 text-rose-100',
  },
  success: {
    eyebrow: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    glow: 'bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.28),transparent_42%),radial-gradient(circle_at_24%_34%,rgba(34,211,238,0.1),transparent_22%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.06),transparent_18%)]',
    panel: 'border-emerald-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),rgba(4,9,14,0.88)]',
    statusBox: 'border-emerald-400/22 bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(34,197,94,0.05)),rgba(255,255,255,0.02)]',
    iconTile: 'border-emerald-400/24 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(34,197,94,0.08)),rgba(255,255,255,0.04)] text-emerald-100',
    pill: 'border-emerald-400/24 bg-emerald-400/12 text-emerald-100',
    activeStep: 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100',
    completeStep: 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100',
    errorStep: 'border-rose-400/24 bg-rose-400/10 text-rose-100',
  },
  warning: {
    eyebrow: 'border-amber-300/24 bg-amber-300/10 text-amber-50',
    glow: 'bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.28),transparent_42%),radial-gradient(circle_at_22%_32%,rgba(251,191,36,0.12),transparent_24%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.06),transparent_18%)]',
    panel: 'border-amber-300/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),rgba(14,10,4,0.88)]',
    statusBox: 'border-amber-300/22 bg-[linear-gradient(180deg,rgba(245,158,11,0.14),rgba(251,191,36,0.05)),rgba(255,255,255,0.02)]',
    iconTile: 'border-amber-300/24 bg-[linear-gradient(180deg,rgba(245,158,11,0.18),rgba(251,191,36,0.08)),rgba(255,255,255,0.04)] text-amber-50',
    pill: 'border-amber-300/24 bg-amber-300/12 text-amber-50',
    activeStep: 'border-amber-300/24 bg-amber-300/10 text-amber-50',
    completeStep: 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100',
    errorStep: 'border-amber-300/24 bg-amber-300/10 text-amber-50',
  },
  danger: {
    eyebrow: 'border-rose-300/24 bg-rose-300/10 text-rose-50',
    glow: 'bg-[radial-gradient(circle_at_50%_0%,rgba(244,63,94,0.28),transparent_42%),radial-gradient(circle_at_24%_32%,rgba(251,113,133,0.12),transparent_24%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.06),transparent_18%)]',
    panel: 'border-rose-300/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),rgba(14,5,9,0.88)]',
    statusBox: 'border-rose-300/22 bg-[linear-gradient(180deg,rgba(244,63,94,0.14),rgba(251,113,133,0.05)),rgba(255,255,255,0.02)]',
    iconTile: 'border-rose-300/24 bg-[linear-gradient(180deg,rgba(244,63,94,0.18),rgba(251,113,133,0.08)),rgba(255,255,255,0.04)] text-rose-50',
    pill: 'border-rose-300/24 bg-rose-300/12 text-rose-50',
    activeStep: 'border-rose-300/24 bg-rose-300/10 text-rose-50',
    completeStep: 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100',
    errorStep: 'border-rose-300/24 bg-rose-300/10 text-rose-50',
  },
};

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: dashboardEase,
      delay: 0.06,
    },
  },
};

export function DashboardAccessStatusPill({
  label,
  tone = 'brand',
  icon: Icon = Sparkles,
  spin = false,
}: DashboardAccessStatusPillProps) {
  const styles = toneStyles[tone];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-[0_12px_28px_rgba(0,0,0,0.16)]',
        styles.pill,
      )}
    >
      <Icon className={clsx('h-3.5 w-3.5', spin ? 'animate-spin motion-reduce:animate-none' : undefined)} />
      {label}
    </span>
  );
}

function DashboardAccessStepIndicator({
  state,
  shouldReduceMotion,
}: {
  state: DashboardAccessStepState;
  shouldReduceMotion: boolean;
}) {
  if (state === 'complete') {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/24 bg-emerald-400/10 text-emerald-100">
        <Check className="h-4 w-4" />
      </span>
    );
  }

  if (state === 'active') {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/24 bg-indigo-400/10 text-indigo-100">
        <Loader2 className={clsx('h-4 w-4', shouldReduceMotion ? undefined : 'animate-spin motion-reduce:animate-none')} />
      </span>
    );
  }

  if (state === 'error') {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/24 bg-rose-400/10 text-rose-100">
        <AlertTriangle className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400">
      <span className="h-2.5 w-2.5 rounded-full bg-current opacity-75" />
    </span>
  );
}

export default function DashboardAccessStage({
  variant = 'loading',
  tone,
  eyebrow,
  title,
  description,
  statusText,
  progressLabel,
  progressDescription,
  progressSteps = [],
  statusPill,
  actions,
  icon,
  brandLabel = `${config.botName} Dashboard`,
}: DashboardAccessStageProps) {
  const shouldReduceMotion = useReducedMotion();
  const resolvedTone = tone ?? toneByVariant[variant];
  const styles = toneStyles[resolvedTone];
  const Icon = icon ?? variantIcons[variant];

  return (
    <motion.section
      variants={fadeUpVariants}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="show"
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#02030a]"
    >
      {/* Cinematic Background */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(88,101,242,0.15),transparent_42%),radial-gradient(circle_at_18%_14%,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,rgba(2,3,10,0.8)_0%,rgba(0,0,0,0.95)_100%)]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(88,101,242,0.05),transparent_60%)] blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Animated Logo */}
        <motion.div 
          animate={variant === 'loading' && !shouldReduceMotion ? { scale: [0.98, 1.02, 0.98], opacity: [0.8, 1, 0.8] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-[0_0_40px_rgba(88,101,242,0.2)]">
            {variant === 'loading' ? (
              <Logo size="lg" withText={false} frameClassName="bg-transparent border-0 shadow-none" />
            ) : (
              <Icon className={clsx("h-10 w-10", variant === 'error' ? 'text-rose-400' : 'text-amber-400')} />
            )}
          </div>
        </motion.div>

        {/* Dynamic Status Text */}
        <div className="space-y-3">
          <motion.h1 
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            {title}
          </motion.h1>
          
          <motion.p 
            key={statusText || description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[0.95rem] leading-relaxed text-slate-400"
          >
            {statusText || description}
          </motion.p>
        </div>

        {/* Actions (if error/warning) */}
        {actions ? (
          <div className="mt-10 flex flex-col gap-3 w-full sm:w-auto">
            {actions}
          </div>
        ) : variant === 'loading' ? (
          <div className="mt-12 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5865F2]" />
            <span>{eyebrow}</span>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
