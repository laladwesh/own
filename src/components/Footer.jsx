import React from "react";
import { socialMedia, aboutMe } from "../constants";
import { resumeLink, repoLink } from "../constants";
import { AiFillGithub, AiFillFilePdf } from "react-icons/ai";
import { SiLeetcode } from "react-icons/si";
import { LuExternalLink } from "react-icons/lu";
import { profilePic } from "../assets";
import { SectionHeading, Reveal, MagneticButton } from "./ui";

const ctaButtons = [
  {
    id: "cta-resume",
    text: "Resume",
    href: resumeLink,
    icon: AiFillFilePdf,
  },
  {
    id: "cta-github",
    text: "GitHub",
    href: repoLink,
    icon: AiFillGithub,
  },
  {
    id: "cta-leetcode",
    text: "LeetCode",
    href: "https://leetcode.com/u/ibXDVQOY8i/",
    icon: SiLeetcode,
  },
];

const Footer = () => (
  <footer id="contactMe" className="relative sm:px-16 px-6 pt-24 pb-10 overflow-hidden">
    {/* top divider */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
    {/* faint grid backdrop */}
    <div className="pointer-events-none absolute inset-0 bg-grid mask-fade opacity-[0.25]" />
    {/* ambient glows */}
    <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />
    <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[130px]" />

    <div className="relative xl:max-w-[1280px] w-full mx-auto">
      <Reveal direction="up">
        <SectionHeading
          index="07"
          kicker="Let's connect"
          title="Let's build something"
          accent="together"
          subtitle="Got an idea, a role, or just want to say hi? My inbox and DMs are always open."
          align="center"
          className="mb-12"
        />
      </Reveal>

      {/* watermark name */}
      <h2
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 font-display font-bold uppercase tracking-tighter text-[18vw] leading-none text-white/[0.025] whitespace-nowrap"
      >
        {aboutMe.name}
      </h2>

      <Reveal direction="scale" delay={0.05}>
        <div className="relative glass-panel px-6 py-10 sm:px-12 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-14">
            {/* Avatar — conic ring glow */}
            <div className="flex justify-center md:justify-start shrink-0">
              <div className="conic-ring rounded-full p-[3px] shadow-glow-lg">
                <div className="rounded-full bg-ink-900 p-[5px]">
                  <div className="w-[160px] h-[160px] ss:w-[190px] ss:h-[190px] rounded-full overflow-hidden ring-1 ring-white/10">
                    <img
                      src={profilePic}
                      alt={aboutMe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Text + socials */}
            <div className="flex-1 text-center md:text-left">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent/80">
                Available for work
              </span>
              <h3 className="mt-3 font-display text-3xl ss:text-4xl font-bold text-white">
                {aboutMe.name}
              </h3>
              <p className="mt-4 font-poppins text-dimWhite text-[15px] leading-[28px] max-w-[480px] mx-auto md:mx-0">
                {aboutMe.tagLine}
              </p>

              {/* socials */}
              <div className="mt-6 flex flex-row justify-center md:justify-start gap-3">
                {socialMedia.map((social) => (
                  <a
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={social.id}
                    aria-label="Social profile"
                    className="group grid place-items-center w-11 h-11 rounded-xl glass text-dimWhite text-[20px] transition-all duration-300 hover:text-white hover:-translate-y-1 hover:shadow-glow-fuchsia"
                  >
                    {React.createElement(social.icon)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-10 grid grid-cols-1 ss:grid-cols-3 gap-3">
            {ctaButtons.map((btn) => (
              <MagneticButton
                key={btn.id}
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                strength={0.25}
                className="shine-hover card-ring group relative inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 font-mono text-[13px] tracking-wide text-white"
              >
                <span className="text-[17px] text-accent transition-colors duration-300 group-hover:text-white">
                  {React.createElement(btn.icon)}
                </span>
                <span>{btn.text}</span>
                <LuExternalLink className="text-[13px] opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
              </MagneticButton>
            ))}
          </div>
        </div>
      </Reveal>

      {/* bottom credit row */}
      <div className="mt-12 flex flex-col ss:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dimWhite/70">
          © {new Date().getFullYear()} {aboutMe.name}
        </p>
        <p className="font-mono text-[12px] text-dimWhite flex items-center gap-1.5">
          Made with
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline-block w-3.5 h-3.5 text-accent animate-pulse-glow"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          by <span className="text-gradient font-semibold">Avinash Gupta</span>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
