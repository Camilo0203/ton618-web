import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeUpVariants } from '../motion';

interface PanelCardProps {
  title?: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  variant?: 'default' | 'highlight' | 'soft' | 'danger' | 'success';
  contentClassName?: string;
  stickyActions?: boolean;
}

const variantClasses: Record<NonNullable<PanelCardProps['variant']>, string> = {
  default: '',
  highlight:
    'border-brand-200/40 bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(242,246,255,0.86))] dark:border-brand-900/45 dark:bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.22),transparent_34%),linear-gradient(180deg,rgba(28,32,54,0.94),rgba(18,24,40,0.92))]',
  soft:
    'bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,255,0.82))] dark:bg-[linear-gradient(180deg,rgba(30,32,53,0.84),rgba(24,27,45,0.82))]',
  danger:
    'border-rose-200/60 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_30%),linear-gradient(180deg,rgba(255,244,246,0.96),rgba(255,248,249,0.9))] dark:border-rose-900/45 dark:bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_34%),linear-gradient(180deg,rgba(55,24,36,0.9),rgba(33,18,25,0.88))]',
  success:
    'border-emerald-200/60 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,rgba(236,253,245,0.96),rgba(244,255,250,0.88))] dark:border-emerald-900/45 dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,rgba(18,54,46,0.9),rgba(14,34,29,0.88))]',
};

export default function PanelCard({
  title,
  description,
  eyebrow,
  children,
  className = '',
  actions,
  variant = 'default',
  contentClassName = '',
  stickyActions = false,
}: PanelCardProps) {
  return (
    <motion.section
      variants={fadeUpVariants}
      initial="hidden"
      animate="show"
      className={`dashboard-surface dashboard-interactive-card p-6 lg:p-8 ${variantClasses[variant]} ${className}`}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/80 to-transparent" />
      <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-brand-400/10 blur-3xl" />

      {title || description || eyebrow || actions ? (
        <div className="relative z-[1] flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 max-w-3xl">
            {eyebrow ? (
              <p className="dashboard-panel-label">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-3 break-words text-[1.75rem] font-bold tracking-[-0.04em] text-slate-950 dark:text-white lg:text-[1.9rem]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className={`relative z-[1] flex flex-wrap items-center gap-3 ${stickyActions ? 'xl:sticky xl:top-0' : ''}`}>
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={`relative z-[1] ${title || description || eyebrow || actions ? 'mt-7 lg:mt-8' : ''} ${contentClassName}`}>
        {children}
      </div>
    </motion.section>
  );
}
