import { motion } from "framer-motion";

/**
 * Consistent scroll-reveal wrapper used across sections.
 * direction: "up" | "down" | "left" | "right" | "scale"
 */
const offsets = {
  up: { y: 28, x: 0 },
  down: { y: -28, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  scale: { x: 0, y: 0 },
};

const Reveal = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  amount = 0.2,
  once = true,
  className = "",
  ...rest
}) => {
  const o = offsets[direction] ?? offsets.up;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...o, scale: direction === "scale" ? 0.92 : 1 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
