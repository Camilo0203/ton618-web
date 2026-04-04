import type { Transition, Variants } from 'framer-motion';

/* ─── Shared easing (matches landing page motionEase) ─── */
export const dashboardEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Durations (aligned with lib/motion.ts tokens) ─── */
export const dashboardDurations = {
  micro: 0.12,
  fast: 0.2,
  base: 0.28,
  emphasis: 0.38,
  enter: 0.34,
  exit: 0.2,
} as const;

/* ─── Instant (for reduced-motion) ─── */
const instant: Transition = { duration: 0.01 };
export const instantVariants: Variants = {
  hidden: { opacity: 1, y: 0, x: 0, scale: 1 },
  show: { opacity: 1, y: 0, x: 0, scale: 1, transition: instant },
  exit: { opacity: 1, y: 0, x: 0, scale: 1, transition: instant },
};

/* ─── Card fade-up (child of stagger container) ─── */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: dashboardDurations.enter,
      ease: dashboardEase,
    },
  },
};

/* ─── Simple fade-in ─── */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      duration: dashboardDurations.fast,
      ease: dashboardEase,
    },
  },
};

/* ─── Stagger container for card cascades ─── */
export const staggerContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

/* ─── Fast stagger for tight lists (e.g. checklists, KPIs) ─── */
export const staggerFastVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

/* ─── Mobile drawer slide ─── */
export const drawerVariants: Variants = {
  hidden: {
    x: -34,
    opacity: 0,
  },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.32,
      ease: dashboardEase,
    },
  },
  exit: {
    x: -26,
    opacity: 0,
    transition: {
      duration: 0.24,
      ease: dashboardEase,
    },
  },
};

/* ─── Module-to-module route transition (for AnimatePresence) ─── */
export const moduleTransitionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.995,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: dashboardDurations.enter,
      ease: dashboardEase,
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.998,
    transition: {
      duration: dashboardDurations.exit,
      ease: dashboardEase,
    },
  },
};

/* ─── Panel swap (kept for backwards compat) ─── */
export const panelSwapVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: dashboardEase,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.22,
      ease: dashboardEase,
    },
  },
};

/* ─── Scale-in for KPI cards, badges, and pills ─── */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: dashboardDurations.base,
      ease: dashboardEase,
    },
  },
};

/* ─── Skeleton shimmer exit ─── */
export const skeletonExitVariants: Variants = {
  show: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
    transition: {
      duration: dashboardDurations.fast,
      ease: dashboardEase,
    },
  },
};
