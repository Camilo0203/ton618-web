import type { Variants } from 'framer-motion';

export const dashboardEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.46,
      ease: dashboardEase,
    },
  },
};

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      duration: 0.32,
      ease: dashboardEase,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

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
