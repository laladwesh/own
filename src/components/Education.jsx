import { layout } from "../style";
import { educationList } from "../constants";
import Lottie from "react-lottie-player";
import animationData from "../lotties/quiz-mode-teal-dark.json";
import { SectionHeading, TiltCard, Reveal } from "./ui";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { FaRegCalendarAlt } from "react-icons/fa";

// lottie config
const defaultOptions = {
  loop: true,
  play: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

// small diamond bullet marker
const DiamondMarker = () => (
  <svg
    viewBox="0 0 12 12"
    className="mt-[7px] h-[10px] w-[10px] shrink-0 drop-shadow-[0_0_6px_rgba(232,121,249,0.5)]"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="eduDiamond" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#e879f9" />
      </linearGradient>
    </defs>
    <rect
      x="6"
      y="0.5"
      width="7.7"
      height="7.7"
      rx="1.6"
      transform="rotate(45 6 0.5)"
      fill="url(#eduDiamond)"
    />
  </svg>
);

const FeatureCard = ({
  icon,
  title,
  degree,
  duration,
  content1,
  content2,
  index,
}) => (
  <Reveal direction="up" delay={index * 0.1} className="w-full">
    <TiltCard
      max={8}
      glare
      scale={1.015}
      className={`card-ring relative overflow-hidden p-6 ss:p-7 ${
        index === educationList.length - 1 ? "mb-0" : "mb-6"
      }`}
    >
      {/* decorative academic accent */}
      <HiOutlineAcademicCap className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 text-violet-400/10 transition-colors duration-300 group-hover:text-violet-400/20" />

      <div className="relative flex flex-row items-start gap-5">
        {/* conic-ring avatar holding the iitg logo */}
        <div className="conic-ring h-[68px] w-[68px] shrink-0 rounded-full p-[2px]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-ink-900/90">
            <img
              src={icon}
              alt={title}
              className="h-[78%] w-[78%] rounded-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <h4 className="font-display text-[21px] font-semibold leading-[1.25] text-gradient">
            {title}
          </h4>

          <p className="mt-1 font-poppins text-[16px] font-medium leading-[26px] text-white/90">
            {degree}
          </p>

          {/* duration as a mono pill with calendar icon */}
          <span className="glass mt-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 font-mono text-[12px] tracking-wide text-violet-200">
            <FaRegCalendarAlt className="h-3 w-3 text-accent" />
            {duration}
          </span>

          {/* content bullets with diamond markers */}
          <ul className="mt-4 flex flex-col gap-2.5">
            <li className="flex items-start gap-3 font-poppins text-[15px] leading-[24px] text-dimWhite">
              <DiamondMarker />
              <span>{content1}</span>
            </li>
            {content2 && (
              <li className="flex items-start gap-3 font-poppins text-[15px] leading-[24px] text-dimWhite">
                <DiamondMarker />
                <span>{content2}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </TiltCard>
  </Reveal>
);

const Education = () => {
  return (
    <section id="education">
      <SectionHeading index="02" kicker="Where I study" title="Education" />

      <div className={layout.sectionReverse}>
        <div className={layout.sectionImgReverse}>
          {/* framed lottie inside a soft glass disc with float */}
          <div className="relative z-[5] flex w-[80%] items-center justify-center">
            <div className="glass-panel relative aspect-square w-full animate-float overflow-hidden rounded-full p-4 shadow-glow-lg">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/10 via-transparent to-accent/10" />
              <Lottie {...defaultOptions} />
            </div>
          </div>

          {/* gradient start */}
          <div className="absolute z-[3] -left-1/2 top-0 h-[50%] w-[50%] rounded-full white__gradient" />
          <div className="absolute z-[0] -left-1/2 bottom-0 h-[50%] w-[50%] rounded-full pink__gradient" />
          {/* gradient end */}
        </div>

        <div className={`${layout.sectionInfo} flex-col`}>
          {educationList.map((feature, index) => (
            <FeatureCard key={feature.id} index={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
