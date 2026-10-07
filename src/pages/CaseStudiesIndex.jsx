import { Link } from "react-router-dom";
import styles from "../style";
import SectionHeading from "../components/SectionHeading";
import { caseStudies, shortTitle } from "../lib/caseStudies";
import { CASE_INTRO, caseStudiesIndexSeo, caseStudyPath } from "../lib/seo";
import { useSeo } from "../lib/useSeo";

const CaseStudiesIndex = () => {
  useSeo(caseStudiesIndexSeo);
  const studies = Object.values(caseStudies);

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[128px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body`}>
        <SectionHeading as="h1" command="$ ls case-studies/" title="Case studies" />
        <p className="page-intro">{CASE_INTRO}</p>
        <p className="section-note inc-count">
          {studies.length} {studies.length === 1 ? "case study" : "case studies"}.
        </p>

        <div className="cs-cards">
          {studies.map((s) => (
            <article key={s.slug} className="cs-card">
              <p className="cs-card-meta">
                {shortTitle(s)} / {s.timeline} / {s.status}
                {s.draft && <span className="draft-tag">draft</span>}
              </p>
              <h2 className="cs-card-title">
                <Link to={caseStudyPath(s.slug)}>{s.title}</Link>
              </h2>
              <p className="cs-card-summary">{s.summary}</p>
              <ul className="drawer-stack cs-card-stack" aria-label="Stack">
                {(s.stack ?? []).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="cs-card-role">{s.role}</p>
              <Link to={caseStudyPath(s.slug)} className="btn-primary cs-card-link">
                read case study &rarr;
              </Link>
            </article>
          ))}
        </div>

        <p className="incident-more">
          <Link to="/">&larr; avinashgupta.in</Link>
        </p>
      </div>
    </main>
  );
};

export default CaseStudiesIndex;
