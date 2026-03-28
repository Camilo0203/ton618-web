import type { Transition, Variants } from 'framer-motion';

export const motionDurations = {
  micro: 0.14,
  fast: 0.2,
  base: 0.28,
  emphasis: 0.38,
  enter: 0.22,
  exit: 0.18,
  modal: 0.24,
} as const;

export const motionStagger = {
  tight: 0.03,
  base: 0.05,
} as const;

export const motionOffsets = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const motionScales = {
  subtle: 0.992,
  soft: 0.988,
  emphasis: 0.985,
} as const;

export const motionEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const motionViewport = {
  once: true,
  amount: 0.18,
} as const;

export const instantTransition: Transition = {
  duration: 0.01,
};

type RevealAxis = 'x' | 'y';

interface RevealOptions {
  axis?: RevealAxis;
  distance?: number;
  direction?: 1 | -1;
  duration?: number;
  delay?: number;
  scale?: number;
  exitDistance?: number;
  exitDuration?: number;
}

function createRevealVariants({
  axis = 'y',
  distance = motionOffsets.md,
  direction = 1,
  duration = motionDurations.base,
  delay = 0,
  scale,
  exitDistance = motionOffsets.sm,
  exitDuration = motionDurations.exit,
}: RevealOptions = {}): Variants {
  const hiddenTransform = axis === 'x' ? { x: distance * direction } : { y: distance * direction };
  const exitTransform = axis === 'x' ? { x: exitDistance * direction } : { y: exitDistance * direction };

  return {
    hidden: {
      opacity: 0,
      ...(scale ? { scale } : null),
      ...hiddenTransform,
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: motionEase,
      },
    },
    exit: {
      opacity: 0,
      ...(scale ? { scale: motionScales.subtle } : null),
      ...exitTransform,
      transition: {
        duration: exitDuration,
        ease: motionEase,
      },
    },
  };
}

export const instantReveal: Variants = {
  hidden: { opacity: 1, x: 0, y: 0, scale: 1 },
  show: { opacity: 1, x: 0, y: 0, scale: 1, transition: instantTransition },
  exit: { opacity: 1, x: 0, y: 0, scale: 1, transition: instantTransition },
};

export const revealUp = createRevealVariants();

export const revealScale = createRevealVariants({
  distance: motionOffsets.sm,
  duration: motionDurations.emphasis,
  scale: motionScales.emphasis,
});

export const revealSide = (
  direction: 'left' | 'right' = 'right',
  overrides: Omit<RevealOptions, 'axis' | 'direction'> = {},
): Variants =>
  createRevealVariants({
    axis: 'x',
    direction: direction === 'left' ? -1 : 1,
    distance: motionOffsets.md,
    ...overrides,
  });

export const sectionIntro = createRevealVariants({
  distance: motionOffsets.lg,
  duration: motionDurations.base,
});

export const cardStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: motionStagger.base,
      delayChildren: motionStagger.tight,
    },
  },
};

export const accordionTransition: Transition = {
  duration: motionDurations.enter,
  ease: motionEase,
};

export const tabPanelTransition: Transition = {
  duration: motionDurations.enter,
  ease: motionEase,
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: motionDurations.enter,
      ease: motionEase,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: motionDurations.exit,
      ease: motionEase,
    },
  },
};

export const modalPanel: Variants = createRevealVariants({
  distance: motionOffsets.md,
  duration: motionDurations.modal,
  scale: motionScales.emphasis,
  exitDistance: motionOffsets.sm,
});

function mergeShowTransition(variants: Variants, transition: Partial<Transition>): Variants {
  const show = variants.show;
  if (!show || typeof show !== 'object') {
    return variants;
  }

  const currentTransition =
    'transition' in show && show.transition && typeof show.transition === 'object' ? show.transition : {};

  return {
    ...variants,
    show: {
      ...show,
      transition: {
        ...currentTransition,
        ...transition,
      },
    },
  };
}

export function withDelay(variants: Variants, delay = 0): Variants {
  return mergeShowTransition(variants, { delay });
}

export function withDuration(variants: Variants, duration: number): Variants {
  return mergeShowTransition(variants, { duration });
}
