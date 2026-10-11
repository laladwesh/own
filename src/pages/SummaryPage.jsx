import { Link } from "react-router-dom";
import styles from "../style";
import { aboutMe, socialMedia } from "../constants";
import { now } from "../constants/now";
import { atHomeBySlug } from "../constants/explain";
import { caseStudies, shortTitle } from "../lib/caseStudies";
import { SHOW_DRAFTS, isDraftText } from "../lib/drafts";
import { lead } from "../lib/plain";
import { summarySeo } from "../lib/seo";
import { useSeo } from "../lib/useSeo";

// A one-page, plain-English summary: who I am, what I am looking for, three things I built, a few
// numbers and how to reach me. Paper style, nothing technical, and it prints cleanly (Save as PDF).
// The numbers are the ones already on the site (the Intern Portal case study).
const NUMBERS = [
  ["1300+", "students used the Intern Portal this season"],
  ["200+", "companies used it"],
  ["400+", "students got internships through it"],
];

const link = (label) => socialMedia.find((s) => s.label === label)?.link;
const lookingFor = now.lookingFor && (SHOW_DRAFTS || !isDraftText(now.lookingFor)) ? now.lookingFor : "";

const SummaryPage = () => {
  useSeo(summarySeo);
  const built = Object.values(caseStudies).slice(0, 3);
  const mail = link("Email (Gmail)")?.replace("mailto:", "");

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[112px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body summary-page`}>
        <p className="sh-cmd">One-page summary</p>
        <h1 className="sh-title">{aboutMe.name}</h1>
        <p className="page-intro">{aboutMe.tagLine.split(" | ").slice(0, 2).join(", ")}</p>

        <div className="summary-toolbar">
          <button type="button" className="btn" onClick={() => window.print()}>
            print or save as PDF
          </button>
          <Link to="/" className="btn">
            &larr; the full site
          </Link>
        </div>

        <h2>Who I am</h2>
        <p>{aboutMe.intro}</p>

        {lookingFor && (
          <>
            <h2>What I am looking for</h2>
            <p>{lookingFor}</p>
          </>
        )}

        <h2>Three things I built</h2>
        <ul>
          {built.map((s) => (
            <li key={s.slug}>
              <strong>{shortTitle(s)}.</strong> {lead(s.summary, 200, 1)} {atHomeBySlug[s.slug]}{" "}
              <Link to={`/projects/${s.slug}`}>read the story</Link>
            </li>
          ))}
        </ul>

        <h2>In numbers</h2>
        <ul className="summary-numbers">
          {NUMBERS.map(([n, label]) => (
            <li key={n}>
              <strong>{n}</strong>
              {label}
            </li>
          ))}
        </ul>

        <h2>Contact</h2>
        <p>
          {mail && (
            <>
              Email: <a href={`mailto:${mail}`}>{mail}</a>
              <br />
            </>
          )}
          LinkedIn: <a href={link("LinkedIn")}>{link("LinkedIn")?.replace(/^https?:\/\/(www\.)?/, "")}</a>
          <br />
          GitHub: <a href={link("GitHub")}>{link("GitHub")?.replace(/^https?:\/\/(www\.)?/, "")}</a>
        </p>
      </div>
    </main>
  );
};

export default SummaryPage;
