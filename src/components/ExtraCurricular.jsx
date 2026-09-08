import React from "react";
import { extraCurricular } from "../constants";
import { BsLink45Deg } from "react-icons/bs";
import { LuSparkles } from "react-icons/lu";
import { SectionHeading, TiltCard, Reveal } from "./ui";

const Content = ({ text, link }) => {
  return (
    <li className="flex items-start gap-3 my-4">
      <span
        aria-hidden="true"
        className="mt-[10px] shrink-0 inline-block h-[6px] w-[6px] rounded-full bg-gradient-to-br from-violet-400 to-accent shadow-glow"
      />
      <p className="font-poppins font-normal text-[14px] text-dimWhite leading-[28px]">
        {text}
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center align-middle ml-1 text-violet-300 hover:text-accent transition-colors"
          >
            <BsLink45Deg size="1.05rem" className="inline" />
          </a>
        ) : null}
      </p>
    </li>
  );
};

const ExtraCurricularCard = (props) => {
  return (
    <TiltCard
      className="glass-panel h-full flex flex-col px-7 py-8"
      max={9}
      glare
      scale={1.02}
    >
      {/* corner accent */}
      <span className="pointer-events-none absolute right-5 top-5 text-violet-400/40 group-hover:text-accent/70 transition-colors">
        <LuSparkles size="1.1rem" />
      </span>

      <div className="flex flex-row items-center">
        {/* conic-ring avatar */}
        <div className="conic-ring rounded-full p-[2px] shrink-0">
          <div className="rounded-full bg-ink-900/80 p-[3px]">
            <img
              src={props.logo}
              alt={props.organisation}
              className="w-[52px] h-[52px] rounded-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col ml-4 min-w-0">
          <h4 className="font-display font-semibold text-[19px] leading-[26px] text-gradient truncate">
            {props.organisation}
          </h4>
          <p className="font-poppins font-medium text-[15px] text-white mt-1 leading-[22px]">
            {props.title}
          </p>
        </div>
      </div>

      {/* duration pill */}
      <div className="mt-5">
        <span className="inline-flex items-center gap-2 glass font-mono text-[11px] tracking-wide text-violet-200/90 px-3 py-1.5 rounded-full">
          <span className="inline-block h-[5px] w-[5px] rounded-full bg-accent animate-pulse-glow" />
          {props.duration}
        </span>
      </div>

      {/* divider */}
      <div className="mt-6 mb-1 h-px w-full bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

      <ul className="flex flex-col">
        {props.content.map((info, index) => (
          <Content key={index} {...info} />
        ))}
      </ul>
    </TiltCard>
  );
};

const ExtraCurricular = () => {
  return (
    <section id="extraCurricular">
      <SectionHeading
        index="09"
        kicker="Beyond code"
        title="Extra"
        accent="Curricular"
      />

      <div className="flex flex-col relative mb-4 mt-8">
        <div className="absolute z-[0] w-[60%] h-[60%] -right-[50%] rounded-full blue__gradient bottom-40" />

        <div className="relative z-[1] grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8 md:mt-16 md:grid-cols-3">
          {extraCurricular.map((card, i) => (
            <Reveal key={card.id} direction="up" delay={i * 0.12} className="h-full">
              <ExtraCurricularCard index={card.id} {...card} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExtraCurricular;
