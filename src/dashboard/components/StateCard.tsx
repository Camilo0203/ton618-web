import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { fadeUpVariants } from '../motion';

interface StateCardProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  tone?: 'default' | 'warning' | 'danger';
}

const toneClasses: Record<NonNullable<StateCardProps['tone']>, string> = {
  default: 'border-brand-200/50 bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.2),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,247,255,0.88))] dark:border-brand-900/45 dark:bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.24),transparent_36%),linear-gradient(180deg,rgba(30,32,53,0.92),rgba(21,24,40,0.9))]',
  warning: 'border-amber-200/60 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_32%),linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,247,237,0.9))] dark:border-amber-900/45 dark:bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_34%),linear-gradient(180deg,rgba(51,36,17,0.88),rgba(35,24,14,0.9))]',
  danger: 'border-rose-200/60 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.18),transparent_32%),linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,245,245,0.9))] dark:border-rose-900/45 dark:bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_34%),linear-gradient(180deg,rgba(54,24,34,0.88),rgba(34,18,27,0.9))]',
};

export default function StateCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  tone = 'default',
}: StateCardProps) {
  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="show"
      className={`relative overflow-hidden rounded-[2.2rem] border p-7 shadow-[0_28px_90px_rgba(2,6,23,0.18)] backdrop-blur-2xl lg:p-8 ${toneClasses[tone]}`}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/25" />
      <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/10 blur-3xl dark:bg-white/5" />
      <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700 shadow-sm dark:border-white/10 dark:bg-surface-700/80 dark:text-brand-300">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h2 className="mt-5 break-words text-[2rem] font-bold tracking-[-0.04em] text-slate-950 dark:text-white lg:text-[2.15rem]">
            {title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {actions}
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
