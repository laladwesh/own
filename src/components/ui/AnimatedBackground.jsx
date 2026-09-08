import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Full-page ambient background:
 *  - drifting violet aurora blobs
 *  - masked grid
 *  - a soft spotlight that follows the cursor
 * Fixed behind all content (z-0). Pointer-events disabled.
 */
const AnimatedBackground = () => {
  const reduce = useReducedMotion();
  const mx = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const my = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 3 : 0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (reduce) return;
    const onMove = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* base wash */}
      <div className="absolute inset-0 bg-[#050410]" />

      {/* masked grid */}
      <div className="absolute inset-0 bg-grid mask-fade opacity-40" />

      {/* aurora blobs — restrained, monochrome violet */}
      <div
        className={`aurora-blob w-[55vw] h-[55vw] -top-[15vw] -left-[10vw] ${reduce ? "" : "animate-aurora-drift"}`}
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.32), transparent 60%)" }}
      />
      <div
        className={`aurora-blob w-[45vw] h-[45vw] top-[20vh] -right-[10vw] ${reduce ? "" : "animate-aurora-drift"}`}
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.2), transparent 60%)",
          animationDelay: "-6s",
        }}
      />
      <div
        className={`aurora-blob w-[50vw] h-[50vw] bottom-[-20vh] left-[20vw] ${reduce ? "" : "animate-aurora-drift"}`}
        style={{
          background: "radial-gradient(circle, rgba(91,33,182,0.22), transparent 60%)",
          animationDelay: "-12s",
        }}
      />

      {/* cursor spotlight */}
      {ready && !reduce && (
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            x: sx,
            y: sy,
            translateX: "-50%",
            translateY: "-50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.12), transparent 60%)",
          }}
        />
      )}

      {/* vignette so content stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,4,16,0.7)_100%)]" />
    </div>
  );
};

export default AnimatedBackground;
