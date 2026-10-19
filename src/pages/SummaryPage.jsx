import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import styles from "../style";
import PixelPrinter from "../components/PixelPrinter";
import { aboutMe, experiences, socialMedia } from "../constants";
import { now } from "../constants/now";
import { atHomeBySlug } from "../constants/explain";
import { QR_PATH, QR_SIZE } from "../constants/qr";
import { caseStudies, shortTitle } from "../lib/caseStudies";
import { SHOW_DRAFTS, isDraftText } from "../lib/drafts";
import { skillGroups } from "../lib/data";
import { incidents } from "../lib/incidents";
import { lead } from "../lib/plain";
import { summarySeo } from "../lib/seo";
import { useSeo } from "../lib/useSeo";

// The one-page summary, built as an engineering datasheet: it is shown as an A4 sheet on the
// desk, and the same markup is what prints (see the print rules in guide.css). Every fact is
// already on the site; this page only chooses and arranges. The numbers are the Intern Portal's.
const STATS = [
  ["1300+", "students"],
  ["200+", "companies"],
  ["400+", "internships"],
];

// The three most relevant roles, by title.
const ROLES = ["Lead Student Coordinator", "Software Developer Intern (Summer)", "AI Engineer Intern"];
const INCIDENTS = ["INC-001", "INC-002", "INC-003"];

const link = (label) => socialMedia.find((s) => s.label === label)?.link;
const lookingFor = now.lookingFor && (SHOW_DRAFTS || !isDraftText(now.lookingFor)) ? now.lookingFor : "";
const names = (key) => skillGroups.find((g) => g.key === key)?.items.map((i) => i.name).join(", ");
const today = () => new Date().toISOString().slice(0, 10);

const roleLines = () =>
  ROLES.map((title) => {
    for (const org of experiences) {
      const p = org.positions.find((x) => x.title === title);
      if (p) return { title, duration: p.duration, org: org.organisation };
    }
    return null;
  }).filter(Boolean);

const DataSheet = () => {
  const mail = link("Email (Gmail)")?.replace("mailto:", "");
  const linkedin = link("LinkedIn");
  const github = link("GitHub");
  const built = Object.values(caseStudies);
  const problems = INCIDENTS.map((id) => incidents.find((i) => i.id === id)).filter(Boolean);

  return (
    <div className="ds">
      <div className="ds-top">
        <span>AG-2027 / ONE-PAGE SUMMARY</span>
        <span>REV {today()}</span>
      </div>

      <h1 className="ds-name">{aboutMe.name}</h1>
      <p className="ds-role">Lead Student Coordinator, CCD · IIT Guwahati · ECE&apos;27</p>

      {lookingFor && (
        <p className="ds-open">
          <span className="ds-tag">OPEN TO</span> {lookingFor}
        </p>
      )}

      <ul className="ds-stats" aria-label="Intern Portal, this season">
        {STATS.map(([n, label]) => (
          <li key={n}>
            <strong>{n}</strong>
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <p className="ds-note">Intern Portal, this season</p>

      <section className="ds-sec">
        <h2 className="ds-label">01 WHO I AM</h2>
        <p>{aboutMe.intro}</p>
      </section>

      <section className="ds-sec">
        <h2 className="ds-label">02 WHAT I&apos;VE BUILT</h2>
        <ol className="ds-built">
          {built.map((s) => (
            <li key={s.slug}>
              <p>
                <strong>{shortTitle(s)}.</strong> {s.summary}
              </p>
              <p className="ds-home">{atHomeBySlug[s.slug]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ds-sec">
        <h2 className="ds-label">03 HOW I HANDLE PROBLEMS</h2>
        <ul className="ds-problems">
          {problems.map((inc) => (
            <li key={inc.id}>
              <strong>{inc.id}</strong> {inc.title}. <span className="ds-home">{lead(inc.lesson, 110, 1)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="ds-cols">
        <section className="ds-sec">
          <h2 className="ds-label">04 EXPERIENCE</h2>
          <ul className="ds-roles">
            {roleLines().map((r) => (
              <li key={r.title}>
                <span>{r.duration}</span> <strong>{r.title}</strong>, {r.org}
              </li>
            ))}
          </ul>
        </section>
        <section className="ds-sec">
          <h2 className="ds-label">05 SKILLS</h2>
          <p>
            <strong>In production:</strong> {names("production")}
          </p>
          <p>
            <strong>Learning:</strong> {names("learning")}
          </p>
        </section>
      </div>

      <div className="ds-foot">
        <p className="ds-contact">
          {mail && <a href={`mailto:${mail}`}>{mail}</a>} · <a href={linkedin}>linkedin.com/in/avinash-gupta-58171828a</a> ·{" "}
          <a href={github}>github.com/laladwesh</a>
        </p>
        <div className="ds-qr">
          <p className="ds-follow">
            <a href="https://github.com/laladwesh">github.com/laladwesh</a>: follow for updates
          </p>
          <div className="ds-qr-box">
          <svg viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} role="img" aria-label="QR code for avinashgupta.in" shapeRendering="crispEdges">
            <rect x="-1" y="-1" width={QR_SIZE + 2} height={QR_SIZE + 2} fill="#fff" />
            <path d={QR_PATH} fill="#1A1A1A" />
          </svg>
          <span>full site · 1 / 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryPage = () => {
  useSeo(summarySeo);
  return (
    <>
      <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[112px] pb-[96px]`}>
        <div className={`${styles.boxWidth} sheet-desk`}>
          <div className="sheet-toolbar">
            <PixelPrinter />
            <Link to="/" className="mono-link">
              &larr; the full site
            </Link>
          </div>
          <article className="sheet-paper" aria-label="One-page summary">
            <DataSheet />
          </article>
        </div>
      </main>
      {/* What the browser prints: this root, and nothing else (see guide.css). */}
      {createPortal(
        <div id="print-root" aria-hidden="true">
          <DataSheet />
        </div>,
        document.body
      )}
    </>
  );
};

export default SummaryPage;
