import React from "react";
import { experiences, skills } from "../constants";
import { BsLink45Deg } from "react-icons/bs";
import { LinkPreview } from "./LinkPreview";
import { SectionHeading, Reveal, TiltCard, Marquee } from "./ui";

/* Exported skill icon — restyled chip-friendly icon + label */
export const SkillIcon = ({ icon, name }) => {
  return (
    <span className="group/chip shine-hover relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-violet-500/10 hover:shadow-glow">
      <span className="text-[18px] text-violet-200 transition-colors duration-300 group-hover/chip:text-accent">
        {React.createElement(icon)}
      </span>
      <span className="font-mono text-[12px] tracking-tight text-dimWhite transition-colors duration-300 group-hover/chip:text-white">
        {name}
      </span>
    </span>
  );
};

/* A glass category card with a flex-wrap of skill chips */
const SkillCard = ({ title, items, delay = 0 }) => {
  return (
    <Reveal direction="up" delay={delay}>
      <TiltCard className="card-ring glass-panel p-6 md:p-7" max={6} glare scale={1.01}>
        <div className="mb-5 flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-400 to-accent shadow-glow-fuchsia animate-pulse-glow" />
          <h4 className="font-display text-[20px] font-semibold leading-tight text-gradient">
            {title}
          </h4>
          <span className="ml-auto font-mono text-[11px] text-violet-300/50">
            {String(items.length).padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {items.map((item) => (
            <SkillIcon key={item.id} {...item} />
          ))}
        </div>
      </TiltCard>
    </Reveal>
  );
};

/* A single content paragraph, preserving exact LinkPreview link behaviour */
const Content = ({ text, link }) => {
  return (
    <p className="font-poppins text-[14px] font-normal leading-[24px] text-dimWhite">
      {text}{" "}
      {link ? (
        <LinkPreview url={link}>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <BsLink45Deg
              size="1rem"
              className="inline align-text-bottom text-violet-300 transition-colors hover:text-accent"
            />
          </a>
        </LinkPreview>
      ) : (
        ""
      )}
    </p>
  );
};

/* One organisation node on the premium vertical timeline */
const ExperienceCard = ({ organisation, logo, link, positions, delay = 0 }) => {
  const OrgHeading = (
    <h4 className="font-display text-[20px] font-semibold leading-tight text-gradient transition-opacity group-hover/org:opacity-80">
      {organisation}
    </h4>
  );

  return (
    <Reveal direction="up" delay={delay} className="relative pl-16">
      {/* conic-ring avatar node sitting on the timeline */}
      <div className="absolute left-0 top-0 z-[2]">
        <div className="conic-ring h-[56px] w-[56px] rounded-full p-[2px]">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-ink-900">
            <img
              src={logo}
              alt={organisation}
              className="h-[48px] w-[48px] rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* org name */}
      <div className="mb-5 flex min-h-[56px] items-center">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group/org inline-flex items-center gap-2"
          >
            {OrgHeading}
            <BsLink45Deg className="text-[16px] text-violet-300 transition-colors group-hover/org:text-accent" />
          </a>
        ) : (
          <span className="group/org">{OrgHeading}</span>
        )}
      </div>

      {/* positions */}
      <ol className="flex flex-col gap-4">
        {positions.map((position, index) => (
          <li key={index} className="relative">
            {/* glowing dot connecting the card to the line */}
            <span className="absolute -left-[42px] top-5 h-3 w-3 -translate-x-1/2 rounded-full border border-white/20 bg-gradient-to-br from-violet-400 to-accent shadow-glow-fuchsia animate-pulse-glow" />
            <TiltCard className="glass p-5" max={5} glare scale={1.01}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-[16px] font-semibold text-white">
                  {position.title}
                </h3>
                <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 font-mono text-[11px] tracking-tight text-violet-200">
                  {position.duration}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {position.content.map((info, idx) => (
                  <Content key={idx} {...info} />
                ))}
              </div>
            </TiltCard>
          </li>
        ))}
      </ol>
    </Reveal>
  );
};

const SkillsAndExperience = () => {
  // flatten all tech icons for the marquee flair strip
  const allTech = skills.flatMap((s) => s.items);

  return (
    <section id="skills" className="mb-12">
      <SectionHeading
        index="01"
        kicker="What I work with"
        title="Skills &"
        accent="Experience"
      />

      {/* tasteful marquee strip of all tech icons */}
      <Reveal direction="up" delay={0.05}>
        <Marquee speed={42} className="mt-8 glass-panel py-4">
          {allTech.map((item) => (
            <span
              key={`mq-${item.id}`}
              className="flex items-center gap-2 px-2 text-violet-200/80"
              title={item.name}
            >
              <span className="text-[22px]">{React.createElement(item.icon)}</span>
              <span className="font-mono text-[12px] text-dimWhite">{item.name}</span>
            </span>
          ))}
        </Marquee>
      </Reveal>

      {/* two-column: skills + experience, collapses to one on mobile */}
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10">
        {/* Skills column */}
        <div className="flex flex-col gap-6">
          <Reveal direction="left">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet-300/60">
              // toolbox
            </p>
          </Reveal>
          {skills.map((skill, index) => (
            <SkillCard key={index} delay={index * 0.08} {...skill} />
          ))}
        </div>

        {/* Experience column — premium vertical timeline */}
        <div className="flex flex-col">
          <Reveal direction="right">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-violet-300/60">
              // journey
            </p>
          </Reveal>
          <div className="relative">
            {/* gradient vertical line */}
            <span className="pointer-events-none absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/0 via-violet-400/60 to-accent/0" />
            <div className="flex flex-col gap-12">
              {experiences.map((exp, index) => (
                <ExperienceCard key={index} delay={index * 0.1} {...exp} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsAndExperience;
