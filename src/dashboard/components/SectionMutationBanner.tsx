import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { fadeInVariants } from '../motion';
import type { GuildConfigMutation, GuildSyncStatus } from '../types';
import { formatDateTime, summarizeMutationPayload } from '../utils';

interface SectionMutationBannerProps {
  mutation: GuildConfigMutation | null;
  syncStatus: GuildSyncStatus | null;
}

function BannerShell({
  className,
  icon,
  badge,
  title,
  children,
}: {
  className: string;
  icon: ReactNode;
  badge: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="show"
      className={`rounded-[1.55rem] border p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-current/15 bg-white/20 dark:bg-white/5">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            <span className="dashboard-status-pill-compact border-current/15 bg-white/35 text-current dark:bg-white/8">
              {badge}
            </span>
            <span className="break-words">{title}</span>
          </p>
          <div className="mt-2 text-sm text-current/80">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SectionMutationBanner({
  mutation,
  syncStatus,
}: SectionMutationBannerProps) {
  if (!mutation) {
    return (
      <motion.div
        variants={fadeInVariants}
        initial="hidden"
        animate="show"
        className="dashboard-surface-soft rounded-[1.45rem] p-4 text-sm text-slate-600 dark:text-slate-300"
      >
        Sin cambios pendientes para esta seccion. El bot sigue mostrando el ultimo estado aplicado.
      </motion.div>
    );
  }

  const summary = summarizeMutationPayload(mutation.requestedPayload);
  const requestedAt = formatDateTime(mutation.requestedAt);

  if (mutation.status === 'pending') {
    return (
      <BannerShell
        className="dashboard-skeleton border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,247,237,0.92))] text-amber-900 dark:border-amber-900/40 dark:bg-[linear-gradient(135deg,rgba(69,39,14,0.74),rgba(43,26,14,0.66))] dark:text-amber-100"
        icon={<Clock3 className="h-5 w-5" />}
        badge="Pendiente"
        title="Pendiente de aplicar"
      >
        <p>{summary}. Solicitud creada el {requestedAt}.</p>
        <p className="mt-2">
          El bridge del bot la procesara en el siguiente ciclo. Estado del bridge: {syncStatus?.bridgeStatus ?? 'unknown'}.
        </p>
      </BannerShell>
    );
  }

  if (mutation.status === 'failed') {
    return (
      <BannerShell
        className="border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,245,245,0.92))] text-rose-900 dark:border-rose-900/40 dark:bg-[linear-gradient(135deg,rgba(72,22,38,0.76),rgba(46,18,28,0.68))] dark:text-rose-100"
        icon={<XCircle className="h-5 w-5" />}
        badge="Fallo"
        title="La ultima solicitud fallo"
      >
        <p>{summary}. Solicitud creada el {requestedAt}.</p>
        <p className="mt-2">
          {mutation.errorMessage || 'El bot reporto un error al intentar aplicar la mutacion.'}
        </p>
      </BannerShell>
    );
  }

  if (mutation.status === 'superseded') {
    return (
      <BannerShell
        className="dashboard-surface-soft text-slate-700 dark:text-slate-200"
        icon={<AlertTriangle className="h-5 w-5" />}
        badge="Reemplazada"
        title="La ultima solicitud fue reemplazada"
      >
        <p>{summary}. Solicitud creada el {requestedAt}.</p>
      </BannerShell>
    );
  }

  return (
    <BannerShell
      className="border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(240,253,250,0.92))] text-emerald-900 dark:border-emerald-900/40 dark:bg-[linear-gradient(135deg,rgba(10,61,46,0.72),rgba(12,43,37,0.66))] dark:text-emerald-100"
      icon={<CheckCircle2 className="h-5 w-5" />}
      badge="Aplicado"
      title="Aplicado por el bot"
    >
      <p>{summary}. Solicitud creada el {requestedAt}.</p>
      <p className="mt-2">
        Confirmado el {formatDateTime(mutation.appliedAt ?? mutation.updatedAt)}.
      </p>
    </BannerShell>
  );
}
