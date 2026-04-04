import { motion, useReducedMotion } from 'framer-motion';
import { staggerFastVariants, fadeUpVariants, instantVariants } from '../../dashboard/motion';

/* ─── Variant presets for dashboard loading skeletons ─── */

interface DashboardSkeletonProps {
  /** Layout preset matching common module shapes */
  variant?: 'config' | 'overview' | 'inbox' | 'cards' | 'spinner' | 'playbooks' | 'system';
  className?: string;
}

/* Reusable shimmer bar */
function Bar({ className = '' }: { className?: string }) {
  return <div className={`rounded bg-white/[0.06] ${className}`} />;
}

function BarLight({ className = '' }: { className?: string }) {
  return <div className={`rounded bg-white/[0.035] ${className}`} />;
}

function SkeletonPanel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUpVariants}
      className={`dashboard-skeleton rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Config module skeleton (form + sidebar) ─── */
function ConfigSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPanel className="h-52">
        <Bar className="mb-4 h-6 w-48" />
        <BarLight className="h-4 w-full max-w-2xl" />
      </SkeletonPanel>
      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonPanel className="h-80">
          <Bar className="mb-6 h-5 w-32" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <BarLight className="h-3 w-24" />
                <Bar className="h-10 rounded-lg" />
              </div>
            ))}
          </div>
        </SkeletonPanel>
        <SkeletonPanel className="h-80">
          <Bar className="mb-6 h-5 w-32" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <BarLight className="h-3 w-24" />
                <Bar className="h-10 rounded-lg" />
              </div>
            ))}
          </div>
        </SkeletonPanel>
      </div>
    </div>
  );
}

/* ─── Overview module skeleton (hero + cards + sidebar) ─── */
function OverviewSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(23rem,0.95fr)] 2xl:grid-cols-[minmax(0,1.52fr)_minmax(24rem,0.88fr)]">
      <div className="space-y-6">
        <SkeletonPanel className="h-48">
          <Bar className="mb-4 h-7 w-56" />
          <BarLight className="mb-3 h-4 w-full max-w-3xl" />
          <BarLight className="h-4 w-2/3" />
        </SkeletonPanel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonPanel key={index} className="h-36 rounded-[1.6rem] p-5">
              <BarLight className="mb-3 h-4 w-20" />
              <Bar className="mb-2 h-8 w-24" />
              <BarLight className="h-3 w-32" />
            </SkeletonPanel>
          ))}
        </div>
        <SkeletonPanel className="h-72">
          <Bar className="mb-5 h-5 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Bar className="h-3 w-3 rounded-full" />
                <BarLight className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </SkeletonPanel>
      </div>
      <div className="space-y-6">
        <SkeletonPanel className="h-64">
          <Bar className="mb-5 h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Bar className="mt-1 h-4 w-4 rounded" />
                <div className="flex-1 space-y-2">
                  <BarLight className="h-4 w-full" />
                  <BarLight className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonPanel>
        <SkeletonPanel className="h-56">
          <Bar className="mb-5 h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-white/[0.035] p-3">
                <Bar className="mb-2 h-4 w-28" />
                <BarLight className="h-3 w-full" />
              </div>
            ))}
          </div>
        </SkeletonPanel>
      </div>
    </div>
  );
}

/* ─── Inbox skeleton (sidebar + detail) ─── */
function InboxSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPanel className="h-40">
        <Bar className="mb-4 h-6 w-40" />
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bar key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
      </SkeletonPanel>
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <SkeletonPanel className="h-[32rem] p-5">
            <Bar className="mb-4 h-5 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.035] p-3">
                  <Bar className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Bar className="h-4 w-3/4" />
                    <BarLight className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonPanel>
        </div>
        <div className="space-y-6">
          <SkeletonPanel className="h-24 p-5">
            <BarLight className="mb-3 h-4 w-32" />
            <Bar className="h-5 w-48" />
          </SkeletonPanel>
          <SkeletonPanel className="h-[48rem] p-6">
            <Bar className="mb-5 h-5 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-white/[0.035] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Bar className="h-6 w-6 rounded-full" />
                    <Bar className="h-4 w-32" />
                  </div>
                  <BarLight className="h-3 w-full" />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <Bar className="h-10 rounded-lg" />
              <BarLight className="h-9 rounded-lg" />
            </div>
          </SkeletonPanel>
        </div>
      </div>
    </div>
  );
}

/* ─── Generic card grid skeleton ─── */
function CardsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonPanel key={i} className="h-44 rounded-[1.6rem] p-5">
          <Bar className="mb-3 h-5 w-32" />
          <BarLight className="mb-2 h-4 w-full" />
          <BarLight className="h-4 w-2/3" />
          <div className="mt-auto pt-4">
            <Bar className="h-3 w-20" />
          </div>
        </SkeletonPanel>
      ))}
    </div>
  );
}

/* ─── Playbooks skeleton ─── */
function PlaybooksSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPanel className="h-32">
        <Bar className="mb-4 h-6 w-48" />
        <BarLight className="h-4 w-1/3" />
      </SkeletonPanel>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonPanel key={i} className="h-40">
            <Bar className="mb-4 h-5 w-32" />
            <BarLight className="mb-2 h-4 w-full" />
            <BarLight className="h-4 w-4/5" />
          </SkeletonPanel>
        ))}
      </div>
    </div>
  );
}

/* ─── System skeleton ─── */
function SystemSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPanel className="h-40">
        <Bar className="mb-4 h-6 w-56" />
        <div className="flex gap-4">
          <BarLight className="h-4 w-32" />
          <BarLight className="h-4 w-24" />
        </div>
      </SkeletonPanel>
      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonPanel className="h-64">
          <Bar className="mb-6 h-5 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center rounded-lg bg-white/[0.035] p-3">
                <BarLight className="h-4 w-32" />
                <Bar className="h-6 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </SkeletonPanel>
        <SkeletonPanel className="h-64">
          <Bar className="mb-6 h-5 w-40" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <BarLight className="h-4 w-full" />
                <BarLight className="h-3 w-2/3" />
              </div>
            ))}
            <Bar className="mt-4 h-10 w-32 rounded-lg" />
          </div>
        </SkeletonPanel>
      </div>
    </div>
  );
}

/* ─── Centered spinner skeleton ─── */
function SpinnerSkeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex min-h-[400px] items-center justify-center ${className}`}
    >
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/[0.08] border-t-indigo-500" />
        <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-indigo-500/10" />
      </div>
    </motion.div>
  );
}

/* ─── Main component ─── */
export default function DashboardLoadingSkeleton({
  variant = 'config',
  className = '',
}: DashboardSkeletonProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = shouldReduceMotion ? instantVariants : staggerFastVariants;

  if (variant === 'spinner') {
    return <SpinnerSkeleton className={className} />;
  }

  const SkeletonContent = {
    config: ConfigSkeleton,
    overview: OverviewSkeleton,
    inbox: InboxSkeleton,
    cards: CardsSkeleton,
    playbooks: PlaybooksSkeleton,
    system: SystemSkeleton,
  }[variant];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      <SkeletonContent />
    </motion.div>
  );
}
