import React from "react";
import { BsLink45Deg } from "react-icons/bs";
import { AiFillGithub } from "react-icons/ai";
import { FaYoutube, FaTrophy, FaMedal, FaAward } from "react-icons/fa";
import { TiNews } from "react-icons/ti";
import { LinkPreview } from "./LinkPreview";
import { achievements } from "../constants";
import styles from "../style";
import { SectionHeading, TiltCard, Reveal } from "./ui";

// Pick a tasteful trophy/medal/award accent per card (cycles, deterministic by index)
const accentIcons = [FaTrophy, FaMedal, FaAward];

const Achievements = () => {
  return (
    <section className="text-white mt-5 md:mt-10 relative" id="achievements">
      <div className={`${styles.flexCenter} ${styles.paddingX}`}>
        <div className={`${styles.boxWidth}`}>
          <SectionHeading index="03" kicker="Recognition" title="Achievements" />
        </div>
      </div>

      {/* Decorative ambient blob */}
      <div className="absolute z-[0] w-[60%] h-[60%] -left-[50%] rounded-full blue__gradient bottom-40" />

      <div className={`${styles.flexCenter} ${styles.paddingX} relative z-[1]`}>
        <div className={`${styles.boxWidth}`}>
          <div className="container px-2 py-10 mx-auto mb-8">
            <div className="grid grid-cols-1 gap-8 mt-8 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
              {/* Render all achievement cards in scrollable grid */}
              {achievements.map((achievement, index) => (
                <AchievementCard key={index} index={index} {...achievement} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AchievementCard = (props) => {
  const { index = 0 } = props;
  const AccentIcon = accentIcons[index % accentIcons.length];
  const contents = [props.content1, props.content2, props.content3].filter(
    Boolean
  );

  return (
    <Reveal direction="up" delay={index * 0.08} className="h-full">
      <TiltCard
        max={9}
        glare
        scale={1.02}
        className="card-ring h-full flex flex-col justify-between px-6 py-6 rounded-[20px]"
      >
        {/* Top row: org avatar + award accent */}
        <div className="flex items-start justify-between">
          {/* Org logo avatar in conic ring */}
          <div className="conic-ring rounded-full p-[2px] shrink-0">
            <div className="rounded-full bg-ink-900/80 p-[3px]">
              <img
                src={props.icon}
                alt={props.event}
                className="w-[44px] h-[44px] rounded-full object-cover"
              />
            </div>
          </div>

          {/* Trophy / medal / award accent */}
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl glass text-[#fcd34d] shadow-glow group-hover:scale-110 transition-transform duration-300">
            <AccentIcon size="1.25rem" />
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col mt-5 mb-1 flex-1">
          {/* Event name */}
          <h3 className="font-display font-semibold text-xl text-white leading-snug mb-2">
            {props.event}
          </h3>

          {/* Position / award */}
          <p className="font-display italic font-medium text-lg text-gradient mb-4">
            {props.position}
          </p>

          {/* Description bullets */}
          {contents.length > 0 && (
            <ul className="flex flex-col gap-2.5">
              {contents.map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 font-poppins font-normal text-dimWhite text-sm leading-relaxed"
                >
                  {/* SVG bullet marker */}
                  <svg
                    className="mt-[6px] shrink-0 text-accent"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="4" cy="4" r="3" fill="currentColor" />
                    <circle
                      cx="4"
                      cy="4"
                      r="3.5"
                      stroke="currentColor"
                      strokeOpacity="0.35"
                    />
                  </svg>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Social/Project links with hover preview - only render if link exists */}
        <div className="flex flex-row items-center mt-6 pt-4 border-t border-white/5 font-poppins font-normal text-dimWhite gap-3">
          {props.article && (
            <LinkPreview url={props.article}>
              <a
                href={props.article}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg glass hover:text-purple-300 hover:scale-110 transition-all"
                aria-label="Article"
              >
                <TiNews size="1.25rem" className="inline" />
              </a>
            </LinkPreview>
          )}
          {props.youtube && (
            <LinkPreview
              url={props.youtube}
              className="inline-flex items-center hover:text-purple-300 hover:scale-110 transition-all"
            >
              <a
                href={props.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg glass"
                aria-label="YouTube"
              >
                <FaYoutube size="1.25rem" className="inline" />
              </a>
            </LinkPreview>
          )}
          {props.github && (
            <LinkPreview
              url={props.github}
              className="inline-flex items-center hover:text-purple-300 hover:scale-110 transition-all"
            >
              <a
                href={props.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg glass"
                aria-label="GitHub"
              >
                <AiFillGithub size="1.25rem" className="inline" />
              </a>
            </LinkPreview>
          )}
          {props.project && (
            <LinkPreview
              url={props.project}
              className="inline-flex items-center hover:text-purple-300 hover:scale-110 transition-all"
            >
              <a
                href={props.project}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg glass"
                aria-label="Project"
              >
                <BsLink45Deg size="1.25rem" className="inline" />
              </a>
            </LinkPreview>
          )}
        </div>
      </TiltCard>
    </Reveal>
  );
};

export default Achievements;
