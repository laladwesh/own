import { motion } from "framer-motion";

/**
 * Bespoke section heading:
 *   [index] ── KICKER (mono)
 *   Big display title with gradient accent word
 *   optional subtitle
 *
 * Props:
 *   index    -> "01"
 *   kicker   -> "What I work with"
 *   title    -> "Skills &"  (plain white part)
 *   accent   -> "Experience" (gradient part, optional)
 *   subtitle -> string (optional)
 *   align    -> "left" | "center"
 */
const SectionHeading = ({
  index,
  kicker,
  title,
  accent,
  subtitle,
  align = "left",
  className = "",
}) => {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center mx-auto" : ""} ${className}`}>
      {(index || kicker) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`flex items-center gap-3 mb-4 ${centered ? "justify-center" : ""}`}
        >
          {index && (
            <span className="font-mono text-[12px] text-violet-400/80 tracking-widest">
              {index}
            </span>
          )}
          <span className="h-px w-10 bg-gradient-to-r from-violet-500 to-transparent" />
          {kicker && (
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet-300/70">
              {kicker}
            </span>
          )}
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="font-display font-bold tracking-tight text-white ss:text-[52px] text-[38px] ss:leading-[1.05] leading-[1.1]"
      >
        {title}{" "}
        {accent && <span className="text-gradient">{accent}</span>}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`font-poppins text-dimWhite text-[15px] leading-[28px] mt-4 max-w-[560px] ${centered ? "mx-auto" : ""}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeading;
