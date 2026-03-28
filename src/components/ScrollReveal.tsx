import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { instantReveal, motionViewport, revealUp, withDelay } from '../lib/motion';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function ScrollReveal({ children, delay = 0, className = '' }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? instantReveal : withDelay(revealUp, delay);

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={motionViewport}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
