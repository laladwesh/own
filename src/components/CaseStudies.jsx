import { Link } from "react-router-dom";
import { caseStudies, shortTitle } from "../lib/caseStudies";
import SectionHeading from "./SectionHeading";

// Homepage section: one card per case study in src/content/case-studies/.
const CaseStudies = () => {
  const all = Object.values(caseStudies);
  if (!all.length) return null;
  const studies = all.slice(0, 1); // the homepage shows the first one; the rest live on /case-studies

  return (
    <section id="caseStudies" className="section">
      <SectionHeading command="$ cat case-studies/README.md" title="Case Studies" />
      <p className="section-note">
        {all.length} {all.length === 1 ? "case study" : "case studies"}: things I built, and how they changed along the way.
      </p>
      <div className="cs-cards cs-cards--one">
        {studies.map((s) => (
          <article key={s.slug} className="cs-card">
            <p className="cs-card-meta">
              {shortTitle(s)} / {s.timeline} / {s.status}
              {s.draft && <span className="draft-tag">draft</span>}
            </p>
            <h3 className="cs-card-title">
              <Link to={`/projects/${s.slug}`}>{s.title}</Link>
            </h3>
            <p className="cs-card-summary">{s.summary}</p>
            <ul className="drawer-stack cs-card-stack" aria-label="Stack">
              {(s.stack ?? []).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="cs-card-role">{s.role}</p>
            <Link to={`/projects/${s.slug}`} className="btn-primary cs-card-link">
              read case study &rarr;
            </Link>
          </article>
        ))}
      </div>
      <p className="incident-more">
        <Link to="/case-studies">
          {all.length > 1 ? `all ${all.length} case studies` : "all case studies"} &rarr;
        </Link>
      </p>
    </section>
  );
};

export default CaseStudies;
