import type { Variants } from 'framer-motion';
import {
  accordionTransition,
  cardStagger,
  instantReveal,
  modalBackdrop,
  modalPanel,
  motionDurations,
  motionEase,
  motionOffsets,
  motionScales,
  motionViewport,
  revealScale,
  revealSide,
  revealUp,
  withDelay,
  withDuration,
} from './motion';

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: motionDurations.fast, ease: motionEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionDurations.exit, ease: motionEase },
  },
};

export const fadeInUp: Variants = {
  initial: revealUp.hidden,
  animate: revealUp.show,
  exit: revealUp.exit,
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -motionOffsets.md },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDurations.base, ease: motionEase },
  },
  exit: {
    opacity: 0,
    y: -motionOffsets.sm,
    transition: { duration: motionDurations.exit, ease: motionEase },
  },
};

const revealLeft = revealSide('left');
const revealRight = revealSide('right');

export const fadeInLeft: Variants = {
  initial: revealLeft.hidden,
  animate: revealLeft.show,
  exit: revealLeft.exit,
};

export const fadeInRight: Variants = {
  initial: revealRight.hidden,
  animate: revealRight.show,
  exit: revealRight.exit,
};

export const fadeInScale: Variants = {
  initial: revealScale.hidden,
  animate: revealScale.show,
  exit: revealScale.exit,
};

export const scaleIn: Variants = {
  initial: { scale: motionScales.emphasis, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: motionDurations.base, ease: motionEase },
  },
  exit: {
    scale: motionScales.soft,
    opacity: 0,
    transition: { duration: motionDurations.exit, ease: motionEase },
  },
};

export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition:
      cardStagger.show && typeof cardStagger.show === 'object' && 'transition' in cardStagger.show
        ? cardStagger.show.transition
        : undefined,
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, scale: motionScales.soft, y: motionOffsets.md },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: motionDurations.base, ease: motionEase },
  },
  exit: {
    opacity: 0,
    scale: motionScales.subtle,
    y: motionOffsets.sm,
    transition: { duration: motionDurations.exit, ease: motionEase },
  },
};

export const modalContent: Variants = {
  initial: modalPanel.hidden,
  animate: modalPanel.show,
  exit: modalPanel.exit,
};

export const dropdownMenu: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: accordionTransition,
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: motionDurations.exit, ease: motionEase },
  },
};

export { instantReveal, modalBackdrop, withDelay, withDuration };

export const transitions = {
  smooth: { duration: motionDurations.emphasis, ease: motionEase },
  spring: { type: 'spring', damping: 24, stiffness: 340 },
  fast: { duration: motionDurations.fast, ease: motionEase },
  slow: { duration: motionDurations.emphasis, ease: motionEase },
} as const;

export const viewportSettings = motionViewport;
