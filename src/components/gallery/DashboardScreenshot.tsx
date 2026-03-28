import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { getCTALinks, getGradient, getIcon, type ScreenshotType } from './galleryHelpers';
import { instantReveal, motionViewport, revealUp, withDelay, withDuration } from '../../lib/motion';

interface DashboardScreenshotProps {
  title: string;
  description: string;
  delay: number;
  type: ScreenshotType;
  image: string;
  onClick: () => void;
}

export default function DashboardScreenshot({
  title,
  description,
  delay,
  type,
  image,
  onClick,
}: DashboardScreenshotProps) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const Icon = getIcon(type);
  const gradient = getGradient(type);
  const cardReveal = shouldReduceMotion ? instantReveal : withDelay(withDuration(revealUp, 0.28), delay);
  const links = getCTALinks(type);
  const actions = [
    links.primary
      ? { href: links.primary, label: t(`gallery.ctas.${type}.primary`) }
      : null,
    links.secondary
      ? { href: links.secondary, label: t(`gallery.ctas.${type}.secondary`) }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <motion.div
      ref={ref}
      variants={cardReveal}
      initial="hidden"
      whileInView="show"
      viewport={motionViewport}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 text-left backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 hover:scale-[1.01] hover:border-white/20 hover:shadow-[0_18px_54px_rgba(99,102,241,0.18)] motion-reduce:hover:scale-100">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300">{title}</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 transition-colors duration-200 group-hover:text-white" />
        </div>

        <button type="button" onClick={onClick} aria-label={`View ${title} in detail`} className={`block w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br ${gradient}`}>
          <img src={image} alt={title} loading="lazy" decoding="async" className={`aspect-[16/10] w-full object-cover transition-transform duration-300 ${isInView && !shouldReduceMotion ? 'scale-[1.01]' : ''}`} />
        </button>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm font-medium leading-relaxed text-slate-400">{description}</p>
        </div>

        {actions.length > 0 ? (
          <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
            {actions.map((action, index) => {
              const className = `${
                index === 0
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/50'
                  : 'border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10'
              } ${actions.length === 1 ? 'w-full' : 'flex-1'} rounded-lg px-4 py-2 text-center text-xs font-semibold transition-[background-color,border-color,color,box-shadow] duration-200`;

              if (action.href.startsWith('/')) {
                return (
                  <Link
                    key={action.href}
                    to={action.href}
                    onClick={(event) => event.stopPropagation()}
                    className={className}
                  >
                    {action.label}
                  </Link>
                );
              }

              return (
                <a
                  key={action.href}
                  href={action.href}
                  onClick={(event) => event.stopPropagation()}
                  className={className}
                >
                  {action.label}
                </a>
              );
            })}
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className={`absolute inset-0 rounded-[1.5rem] bg-gradient-to-br ${gradient} blur-xl`} />
        </div>
      </div>
    </motion.div>
  );
}
