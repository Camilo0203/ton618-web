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
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  eyebrowClassName?: string;
}

const variantClasses: Record<NonNullable<PanelCardProps['variant']>, string> = {
  default: '',
  highlight: 'dashboard-panel-highlight',
  soft: 'dashboard-panel-soft',
  danger: 'dashboard-panel-danger',
  success: 'dashboard-panel-success',
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
  headerClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  eyebrowClassName = '',
}: PanelCardProps) {
  return (
    <motion.section
      variants={fadeUpVariants}
      className={`dashboard-surface dashboard-interactive-card p-5 sm:p-6 lg:p-7 ${variantClasses[variant]} ${className}`}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute -right-10 top-0 h-24 w-24 rounded-full bg-indigo-500/[0.06] blur-3xl" />

      {title || description || eyebrow || actions ? (
        <div className={`relative z-[1] flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between ${headerClassName}`}>
          <div className="min-w-0 max-w-3xl">
            {eyebrow ? (
              <p className={`dashboard-panel-label ${eyebrowClassName}`}>
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className={`mt-2 break-words text-[1.35rem] font-bold tracking-[-0.04em] text-white lg:text-[1.55rem] ${titleClassName}`}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className={`mt-2 max-w-3xl text-[0.96rem] leading-6 text-slate-300 ${descriptionClassName}`}>
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className={`relative z-[1] flex max-w-full flex-wrap items-center gap-3 ${stickyActions ? 'xl:sticky xl:top-0' : ''}`}>
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={`relative z-[1] ${title || description || eyebrow || actions ? 'mt-5 lg:mt-6' : ''} ${contentClassName}`}>
        {children}
      </div>
    </motion.section>
  );
}
