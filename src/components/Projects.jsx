import React, { useState, useEffect, useRef } from "react";
import { projects } from "../constants";
import { AiFillGithub } from "react-icons/ai";
import { BsLink45Deg } from "react-icons/bs";
import { SiGoogleplay, SiApple } from "react-icons/si";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { LinkPreview } from "./LinkPreview";
import { SectionHeading, TiltCard } from "./ui";

const Project = (props) => {
  return (
    <div className="project-card flex-shrink-0 w-[320px] sm:w-[400px] md:w-[500px] mr-6 sm:mr-8 md:mr-10">
      <TiltCard
        max={9}
        glare
        scale={1.02}
        className="card-ring glass-panel h-full px-7 py-7 sm:px-8 sm:py-8 flex flex-col"
      >
        <div className="flex flex-col items-start">
          {/* Project image in a conic-ring avatar */}
          <div className="conic-ring rounded-full p-[2px]">
            <div className="rounded-full p-[3px] bg-ink-900/80">
              <img
                className="flex-shrink-0 object-cover w-20 h-20 rounded-full"
                src={props.image}
                alt={props.title}
              />
            </div>
          </div>

          <div className="mt-5 w-full">
            <h1 className="font-display text-xl md:text-2xl font-semibold capitalize text-gradient leading-tight">
              {props.title}
            </h1>

            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet-300/70 mt-4 mb-3 flex items-center gap-2">
              <span className="inline-block h-[1px] w-5 bg-gradient-to-r from-accent/70 to-transparent" />
              Tech Stack
            </p>

            <div className="flex flex-wrap gap-2.5">
              {props.stack.map((tech, index) => (
                <div
                  key={tech.id}
                  index={index}
                  className="tooltip glass rounded-lg w-9 h-9 flex items-center justify-center text-[18px] text-dimWhite hover:text-accent transition-colors duration-300 hover:-translate-y-0.5 will-change-transform"
                >
                  {React.createElement(tech.icon)}
                  <span className="tooltiptext">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 font-poppins text-sm leading-relaxed text-dimWhite/90 group-hover:text-gray-200 transition-colors duration-300 flex-1">
          {props.content}
        </p>

        <div className="flex mt-6 pt-5 items-center gap-3 border-t border-white/5">
          {props.github && (
            <a
              href={props.github}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="glass rounded-full w-11 h-11 flex items-center justify-center text-white hover:text-accent hover:shadow-glow-fuchsia transition-all duration-300 hover:-translate-y-0.5"
            >
              <AiFillGithub size="1.4rem" />
            </a>
          )}
          {props.link && (
            <LinkPreview url={props.link}>
              <a
                href={props.link}
                target="_blank"
                rel="noopener noreferrer"
                title="Live Site"
                className="glass rounded-full w-11 h-11 flex items-center justify-center text-white hover:text-accent hover:shadow-glow-fuchsia transition-all duration-300 hover:-translate-y-0.5"
              >
                <BsLink45Deg size="1.5rem" />
              </a>
            </LinkPreview>
          )}
          {props.hub && (
            <LinkPreview url={props.hub}>
              <a
                href={props.hub}
                target="_blank"
                rel="noopener noreferrer"
                title="Project Hub — all sub-projects"
                className="glass rounded-full w-11 h-11 flex items-center justify-center text-white hover:text-accent hover:shadow-glow-fuchsia transition-all duration-300 hover:-translate-y-0.5"
              >
                <HiOutlineSquares2X2 size="1.35rem" />
              </a>
            </LinkPreview>
          )}
          {props.playStore && (
            <a
              href={props.playStore}
              target="_blank"
              rel="noopener noreferrer"
              title="Google Play"
              className="glass rounded-full w-11 h-11 flex items-center justify-center text-white hover:text-accent hover:shadow-glow-fuchsia transition-all duration-300 hover:-translate-y-0.5"
            >
              <SiGoogleplay size="1.2rem" />
            </a>
          )}
          {props.appStore && (
            <a
              href={props.appStore}
              target="_blank"
              rel="noopener noreferrer"
              title="App Store"
              className="glass rounded-full w-11 h-11 flex items-center justify-center text-white hover:text-accent hover:shadow-glow-fuchsia transition-all duration-300 hover:-translate-y-0.5"
            >
              <SiApple size="1.35rem" />
            </a>
          )}
        </div>
      </TiltCard>
    </div>
  );
};

const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // State to track current carousel position
  const [cardTotalWidth, setCardTotalWidth] = useState(0); // State to store total width of each card (width + margin) for scroll calculations
  const containerRef = useRef(null);

  // Calculate card width on mount and window resize for responsive carousel
  useEffect(() => {
    const updateCardWidth = () => {
      if (containerRef.current) {
        const card = containerRef.current.querySelector(".project-card");
        if (card) {
          const cardWidth = card.offsetWidth;
          const cardMargin = parseInt(
            window.getComputedStyle(card).marginRight,
            10
          );
          setCardTotalWidth(cardWidth + cardMargin);
        }
      }
    };
    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => {
      window.removeEventListener("resize", updateCardWidth);
    };
  }, []);

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < projects.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Navigate to previous project card
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const isNextDisabled = currentIndex >= projects.length - 1;
  const isPrevDisabled = currentIndex === 0;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section id="projects" className="overflow-hidden">
      <SectionHeading
        index="06"
        kicker="Selected work"
        title="Featured"
        accent="Projects"
      />

      <div className="container px-2 py-10 mx-auto mb-8">
        <div className="overflow-hidden">
          <div
            ref={containerRef}
            className="flex transition-transform duration-500 ease-in-out mb-8 py-4"
            style={{
              transform: `translateX(-${currentIndex * cardTotalWidth}px)`,
            }}
          >
            {/* Render all project cards */}
            {projects.map((project, index) => (
              <Project key={project.id} index={index} {...project} />
            ))}
          </div>

          {/* Footer: progress indicator + navigation */}
          <div className="flex items-center justify-between gap-4 mb-8">
            {/* Counter + dots progress indicator */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-dimWhite tracking-widest">
                <span className="text-gradient font-semibold">
                  {pad(currentIndex + 1)}
                </span>
                <span className="text-violet-300/50"> / {pad(projects.length)}</span>
              </span>
              <div className="hidden ss:flex items-center gap-1.5">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Go to project ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? "w-6 bg-gradient-to-r from-violet-400 to-accent shadow-glow-fuchsia"
                        : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={isPrevDisabled}
                aria-label="Previous project"
                className="glass group w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 enabled:hover:text-accent enabled:hover:shadow-glow-fuchsia enabled:hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-enabled:group-hover:-translate-x-0.5"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={isNextDisabled}
                aria-label="Next project"
                className="glass group w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 enabled:hover:text-accent enabled:hover:shadow-glow-fuchsia enabled:hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-enabled:group-hover:translate-x-0.5"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
