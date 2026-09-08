import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

/**
 * 3D mouse-tilt card with a cursor-tracking glare highlight.
 * Dependency-free (framer-motion only). Wrap any card content.
 *
 * Props:
 *   max      -> max tilt in degrees (default 10)
 *   glare    -> show moving highlight (default true)
 *   scale    -> hover scale (default 1.02)
 */
const TiltCard = ({
  children,
  className = "",
  max = 10,
  glare = true,
  scale = 1.02,
  style,
  ...rest
}) => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  const rotateX = useTransform(srx, (v) => `${v}deg`);
  const rotateY = useTransform(sry, (v) => `${v}deg`);

  const handleMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set((0.5 - py) * max * 2);
    ref.current.style.setProperty("--mx", `${px * 100}%`);
    ref.current.style.setProperty("--my", `${py * 100}%`);
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={reduce ? undefined : { scale }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 900,
        ...style,
      }}
      className={`group tilt-3d relative ${className}`}
      {...rest}
    >
      {children}
      {glare && <span className="tilt-glare" />}
    </motion.div>
  );
};

export default TiltCard;
