import clsx from 'clsx';
import { config } from '../config';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  size?: LogoSize;
  withText?: boolean;
  className?: string;
  imageClassName?: string;
  frameClassName?: string;
  textClassName?: string;
  subtitle?: string;
  alt?: string;
}

const sizeStyles: Record<LogoSize, { frame: string; title: string; subtitle: string; gap: string }> = {
  xs: { frame: 'h-8 w-8 rounded-xl p-1.5', title: 'text-sm', subtitle: 'text-[9px]', gap: 'gap-2' },
  sm: { frame: 'h-10 w-10 rounded-[1rem] p-2', title: 'text-base', subtitle: 'text-[10px]', gap: 'gap-2.5' },
  md: { frame: 'h-12 w-12 rounded-[1.1rem] p-2.5', title: 'text-lg', subtitle: 'text-[10px]', gap: 'gap-3' },
  lg: { frame: 'h-14 w-14 rounded-[1.25rem] p-3', title: 'text-[1.4rem]', subtitle: 'text-[11px]', gap: 'gap-4' },
  xl: { frame: 'h-20 w-20 rounded-[1.65rem] p-4', title: 'text-[1.9rem] md:text-[2.15rem]', subtitle: 'text-[11px] md:text-xs', gap: 'gap-5' },
};

export default function Logo({
  size = 'md',
  withText = true,
  className,
  imageClassName,
  frameClassName,
  textClassName,
  subtitle,
  alt,
}: LogoProps) {
  const styles = sizeStyles[size];

  return (
    <div className={clsx('flex items-center', styles.gap, className)}>
      <div
        className={clsx(
          'relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)),radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_62%),rgba(5,8,18,0.92)] shadow-[0_18px_45px_rgba(2,6,23,0.38)] backdrop-blur-xl',
          styles.frame,
          frameClassName,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_70%)]" />
        <img
          src="/logo-ton618-transparent.png"
          alt={alt ?? `${config.botName} logo`}
          className={clsx('relative z-[1] h-full w-full object-contain', imageClassName)}
          loading="eager"
          decoding="async"
        />
      </div>
      {withText ? (
        <div className="min-w-0">
          {subtitle ? (
            <p className={clsx('truncate font-semibold uppercase tracking-[0.28em] text-brand-200/90', styles.subtitle)}>
              {subtitle}
            </p>
          ) : null}
          <p className={clsx('truncate font-black uppercase tracking-[-0.05em] text-white', styles.title, textClassName)}>
            {config.botName}
          </p>
        </div>
      ) : null}
    </div>
  );
}
