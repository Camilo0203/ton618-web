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

const sizeStyles: Record<LogoSize, { frame: string; title: string; subtitle: string; gap: string; imageScale: string }> = {
  xs: { frame: 'h-11 w-11', title: 'text-sm', subtitle: 'text-[9px]', gap: 'gap-2.5', imageScale: 'scale-[1.72]' },
  sm: { frame: 'h-[3.85rem] w-[3.85rem]', title: 'text-base', subtitle: 'text-[10px]', gap: 'gap-3', imageScale: 'scale-[1.76]' },
  md: { frame: 'h-[4.35rem] w-[4.35rem]', title: 'text-lg', subtitle: 'text-[10px]', gap: 'gap-3.5', imageScale: 'scale-[1.8]' },
  lg: { frame: 'h-[6.5rem] w-[6.5rem]', title: 'text-[1.45rem]', subtitle: 'text-[11px]', gap: 'gap-5', imageScale: 'scale-[1.84]' },
  xl: { frame: 'h-[9.5rem] w-[9.5rem] md:h-[10.75rem] md:w-[10.75rem] lg:h-[11.75rem] lg:w-[11.75rem]', title: 'text-[1.95rem] md:text-[2.15rem]', subtitle: 'text-[11px] md:text-xs', gap: 'gap-6', imageScale: 'scale-[1.88]' },
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
          'relative flex shrink-0 items-center justify-center overflow-visible rounded-full',
          styles.frame,
          frameClassName,
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.22),rgba(56,189,248,0.08)_42%,transparent_72%)] blur-2xl" />
        <div className="relative z-[1] flex h-full w-full items-center justify-center overflow-visible">
          <img
            src={config.brandMarkPath}
            alt={alt ?? `${config.botName} logo`}
            className={clsx(
              'h-full w-full object-contain object-center drop-shadow-[0_18px_38px_rgba(99,102,241,0.18)]',
              styles.imageScale,
              imageClassName,
            )}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
      {withText ? (
        <div className="min-w-0">
          {subtitle ? (
            <p className={clsx('truncate font-semibold uppercase tracking-tight-readable text-indigo-200/90', styles.subtitle)}>
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
