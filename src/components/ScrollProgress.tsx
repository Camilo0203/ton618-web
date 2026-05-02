import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      <motion.div
        className="fixed left-0 right-0 top-0 z-[200] h-[2px] origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"
        style={{ scaleX: shouldReduceMotion ? scrollYProgress : scaleX }}
        aria-hidden="true"
        role="presentation"
      />
      <motion.div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[200] h-3 origin-left bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-cyan-400/30 blur-md"
        style={{ scaleX: shouldReduceMotion ? scrollYProgress : scaleX }}
        aria-hidden="true"
      />
    </>
  );
}
