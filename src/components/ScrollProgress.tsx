import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
        style={{ scaleX }}
        aria-hidden="true"
        role="presentation"
      />
      <motion.div
        className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-2 origin-left bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-cyan-400/40 blur-sm"
        style={{ scaleX }}
        aria-hidden="true"
      />
    </>
  );
}
