import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { getCTALinks, getGradient, getIcon, type ScreenshotType } from './galleryHelpers';

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : delay }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 text-left backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_20px_60px_rgba(99,102,241,0.2)]">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300">{title}</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-white" />
        </div>

        <button type="button" onClick={onClick} aria-label={`View ${title} in detail`} className={`block w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br ${gradient}`}>
          <img src={image} alt={title} loading="lazy" decoding="async" className={`aspect-[16/10] w-full object-cover transition-transform duration-700 ${isInView && !shouldReduceMotion ? 'scale-[1.015]' : ''}`} />
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
              } ${actions.length === 1 ? 'w-full' : 'flex-1'} rounded-lg px-4 py-2 text-center text-xs font-semibold transition-all`;

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

        <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className={`absolute inset-0 rounded-[1.5rem] bg-gradient-to-br ${gradient} blur-xl`} />
        </div>
      </div>
    </motion.div>
  );
}
