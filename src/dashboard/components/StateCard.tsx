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
  default: 'border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.18),transparent_36%),linear-gradient(180deg,rgba(5,6,15,0.88),rgba(5,6,15,0.72))]',
  warning: 'border-amber-500/20 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_34%),linear-gradient(180deg,rgba(51,36,17,0.85),rgba(35,24,14,0.75))]',
  danger: 'border-rose-500/20 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.14),transparent_34%),linear-gradient(180deg,rgba(54,24,34,0.85),rgba(34,18,27,0.75))]',
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
      className={`relative overflow-hidden rounded-[2.2rem] border p-7 shadow-[0_28px_90px_rgba(2,6,23,0.36),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl lg:p-8 ${toneClasses[tone]}`}
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/[0.04] blur-3xl" />
      <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300 shadow-sm">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h2 className="mt-5 break-words text-[2rem] font-bold tracking-[-0.04em] text-white lg:text-[2.15rem]">
            {title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-300">
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
