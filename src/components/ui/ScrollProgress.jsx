import { motion, useScroll, useSpring } from "framer-motion";

/** Slim gradient progress bar pinned to the top of the viewport. */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-violet-500 via-accent to-cyanGlow shadow-[0_0_12px_rgba(168,85,247,0.8)]"
    />
  );
};

export default ScrollProgress;
