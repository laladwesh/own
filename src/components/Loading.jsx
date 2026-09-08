import { motion } from "framer-motion";
import { avinash } from "../assets";

/**
 * Premium boot screen: a logo inside dual counter-rotating orbital rings,
 * an animated gradient name reveal, and a loading bar.
 */
const Loading = () => {
  return (
    <motion.div
      id="loading"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050410] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      {/* ambient glow */}
      <div className="absolute w-[40vw] h-[40vw] rounded-full bg-violet-700/30 blur-[120px]" />
      <div className="absolute inset-0 bg-grid mask-fade opacity-40" />

      <div className="relative flex items-center justify-center mb-10">
        {/* outer orbital ring */}
        <motion.div
          className="absolute w-[150px] h-[150px] rounded-full border border-violet-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-glow" />
        </motion.div>
        {/* inner orbital ring */}
        <motion.div
          className="absolute w-[110px] h-[110px] rounded-full border border-violet-400/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
        </motion.div>

        {/* pulsing logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: [0.9, 1.05, 0.9], opacity: 1 }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.6 },
          }}
        >
          <img src={avinash} alt="Avinash Gupta" className="w-[72px] h-[72px] drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
        </motion.div>
      </div>

      {/* name */}
      <motion.h1
        initial={{ opacity: 0, y: 10, letterSpacing: "0.5em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="font-display font-semibold text-[18px] uppercase text-gradient-animated"
      >
        Avinash&nbsp;Gupta
      </motion.h1>

      {/* loading bar */}
      <div className="mt-5 w-[160px] h-[3px] rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-violet-500"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="mt-3 font-mono text-[10px] tracking-[0.3em] text-violet-300/50 uppercase">
        Initializing
      </p>
    </motion.div>
  );
};

export default Loading;
