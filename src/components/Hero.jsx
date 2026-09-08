import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Lottie from "react-lottie-player";
import animationData from "../lotties/person-coding.json";
import { aboutMe, resumeLink, repoLink, callToAction } from "../constants";
import { scrollToSection } from "../lib/helperFunctions";
import { MagneticButton } from "./ui";
import {
  AiFillGithub,
  AiFillLinkedin,
  AiFillMail,
  AiFillInstagram,
  AiFillFilePdf,
} from "react-icons/ai";
import {
  SiReact,
  SiNodedotjs,
  SiTypescript,
  SiPython,
  SiDocker,
  SiMongodb,
  SiNextdotjs,
  SiTailwindcss,
  SiExpress,
  SiOpenai,
  SiKubernetes,
  SiGraphql,
} from "react-icons/si";

const defaultOptions = {
  loop: true,
  play: true,
  animationData,
  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
};

const roles = [
  "Full-Stack Developer",
  "AI Engineer",
  "Open-Source Contributor",
  "ECE @ IIT Guwahati",
];

const socials = [
  { icon: AiFillLinkedin, link: "https://www.linkedin.com/in/avinash-gupta-58171828a/", label: "LinkedIn" },
  { icon: AiFillGithub, link: repoLink, label: "GitHub" },
  { icon: AiFillMail, link: "mailto:guptaavinash302@gmail.com", label: "Email" },
  { icon: AiFillInstagram, link: "https://www.instagram.com/chholekulche_", label: "Instagram" },
];

const heroStats = [
  { value: "20+", label: "Projects shipped" },
  { value: "8+", label: "Teams & orgs" },
  { value: "1st", label: "Hacktoberfest '24" },
];

// ── Orbiting tech ring ────────────────────────────────────────────────────────
const OrbitRing = ({ radius, duration, icons, reverse = false, size = 40 }) => (
  <div
    className="absolute left-1/2 top-1/2 rounded-full border border-white/5"
    style={{
      width: radius * 2,
      height: radius * 2,
      transform: "translate(-50%, -50%)",
      animation: `spin-slow ${duration}s linear infinite${reverse ? " reverse" : ""}`,
    }}
  >
    {icons.map((Icon, i) => {
      const angle = (i / icons.length) * 360;
      return (
        <div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
          }}
        >
          <div
            className="flex items-center justify-center rounded-xl glass text-violet-200 -translate-x-1/2 -translate-y-1/2 hover:text-white hover:scale-110 transition-transform"
            style={{
              width: size,
              height: size,
              animation: `spin-slow ${duration}s linear infinite${reverse ? "" : " reverse"}`,
            }}
          >
            <Icon size={size * 0.5} />
          </div>
        </div>
      );
    })}
  </div>
);

const OrbitScene = () => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformPerspective: 1000 }}
      className="relative w-[340px] h-[340px] ss:w-[440px] ss:h-[440px] flex items-center justify-center"
    >
      {/* glow */}
      <div className="absolute w-[60%] h-[60%] rounded-full bg-violet-600/30 blur-[80px]" />

      {/* orbital rings (hidden on very small screens to avoid clutter) */}
      {!reduce && (
        <>
          <OrbitRing
            radius={130}
            duration={26}
            size={42}
            icons={[SiReact, SiTypescript, SiNodedotjs, SiMongodb, SiDocker, SiNextdotjs]}
          />
          <OrbitRing
            radius={200}
            duration={42}
            reverse
            size={36}
            icons={[SiPython, SiTailwindcss, SiExpress, SiOpenai, SiKubernetes, SiGraphql, SiReact, SiDocker]}
          />
        </>
      )}

      {/* center disc */}
      <div className="relative w-[200px] h-[200px] ss:w-[240px] ss:h-[240px] rounded-full conic-ring">
        <div className="absolute inset-[3px] rounded-full glass overflow-hidden flex items-center justify-center">
          <div className="w-[88%] h-[88%]">
            <Lottie {...defaultOptions} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Hero = () => {
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setRoleIdx((i) => (i + 1) % roles.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative flex md:flex-row flex-col items-center sm:py-16 py-10 gap-8">
      {/* ── Left: copy ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-start xl:px-0 sm:px-16 px-6 z-10">
        {/* availability pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="font-mono text-[11px] tracking-wide text-emerald-200/90">
            Available for new opportunities
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-mono text-[14px] text-violet-300/80 mb-2"
        >
          Hi there, I&apos;m
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold tracking-tight text-white ss:text-[78px] text-[48px] ss:leading-[1.02] leading-[1.05]"
        >
          {aboutMe.name.split(" ")[0]}
          <br />
          <span className="text-gradient-animated">{aboutMe.name.split(" ").slice(1).join(" ")}</span>
        </motion.h1>

        {/* rotating role */}
        <div className="h-[34px] mt-3 flex items-center gap-2 overflow-hidden">
          <span className="text-violet-400 font-mono text-[15px]">{"<"}</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={roleIdx}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -22, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="font-display font-medium text-[18px] ss:text-[22px] text-white/90"
            >
              {roles[roleIdx]}
            </motion.span>
          </AnimatePresence>
          <span className="text-violet-400 font-mono text-[15px]">{" />"}</span>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="font-poppins font-normal text-dimWhite text-[16px] leading-[28px] max-w-[480px] mt-5"
        >
          {aboutMe.intro}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap items-center gap-3 mt-8"
        >
          <MagneticButton
            onClick={() => scrollToSection("projects")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-poppins font-semibold text-[14px] shine-hover shadow-[0_10px_40px_-12px_rgba(168,85,247,0.7)] transition-colors"
          >
            View My Work
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </MagneticButton>

          <MagneticButton
            href={callToAction}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass text-white font-poppins font-semibold text-[14px] hover:border-violet-400/40"
          >
            Let&apos;s Connect
          </MagneticButton>

          <MagneticButton
            href={resumeLink}
            target="_blank"
            rel="noopener noreferrer"
            strength={0.25}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl glass text-violet-200 hover:text-white"
            aria-label="Resume"
          >
            <AiFillFilePdf size={20} />
          </MagneticButton>
        </motion.div>

        {/* socials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex items-center gap-4 mt-7"
        >
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-dimWhite hover:text-violet-300 hover:-translate-y-0.5 transition-all text-[22px]"
            >
              <s.icon />
            </a>
          ))}
          <span className="h-5 w-px bg-white/10" />
          <span className="font-mono text-[11px] text-gray-500">@laladwesh</span>
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex items-center gap-6 mt-10"
        >
          {heroStats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-6">
              {i > 0 && <span className="h-8 w-px bg-white/10" />}
              <div>
                <p className="font-display font-bold text-[26px] text-white leading-none">{s.value}</p>
                <p className="font-poppins text-[11px] text-gray-500 mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right: 3D orbit scene ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex justify-center items-center md:my-0 my-6 z-10"
      >
        <OrbitScene />
      </motion.div>

      {/* scroll hint */}
      <motion.button
        onClick={() => scrollToSection("skills")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="hidden md:flex absolute bottom-0 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-gray-500 hover:text-violet-300 transition-colors"
        aria-label="Scroll down"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <span className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
          <motion.span
            className="w-1 h-1.5 rounded-full bg-violet-300"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </span>
      </motion.button>
    </section>
  );
};

export default Hero;
