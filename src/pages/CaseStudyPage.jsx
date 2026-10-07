import { Fragment, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../style";
import { CASE_DIAGRAMS } from "../components/CaseStudyDiagrams";
import { Md } from "../components/Markdown";
import { caseStudies } from "../lib/caseStudies";
import { caseStudySeo } from "../lib/seo";
import { copyText } from "../lib/clipboard";
import { useSeo } from "../lib/useSeo";
import NotFound from "./NotFound";

// `[DIAGRAM: id]` on its own line in the markdown puts a schematic there.
const Body = ({ text }) => {
  const parts = text.split(/\n?\[DIAGRAM: ([\w-]+)\]\n?/);
  return parts.map((part, i) => {
    if (i % 2 === 0)
      return part.trim() ? (
        <div key={i} className="cs-text">
          <Md text={part} />
        </div>
      ) : null;
    const Diagram = CASE_DIAGRAMS[part];
    return Diagram ? <Diagram key={i} /> : <Fragment key={i} />;
  });
};

const MetaItem = ({ label, children }) => (
  <div className="cs-meta-item">
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

const CaseStudyView = ({ study }) => {
  const seo = useMemo(() => caseStudySeo(study), [study]);
  useSeo(seo);
  const [copied, setCopied] = useState("");
  const timer = useRef(0);

  const onCopy = async () => {
    const ok = await copyText(window.location.href);
    setCopied(ok ? "copied" : "copy failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(""), 2000);
  };

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[112px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body`}>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">~</Link>/<Link to={{ pathname: "/", hash: "#caseStudies" }}>projects</Link>/
          {study.slug}/<span aria-current="page">CASE_STUDY.md</span>
        </nav>

        <div className="report-toolbar">
          <Link to={{ pathname: "/", hash: "#caseStudies" }} className="cs-back">
            &larr; all case studies
          </Link>
          <span className="copy-wrap">
            <span className="copy-status" role="status" aria-live="polite">
              {copied}
            </span>
            <button type="button" className="btn copy-btn" onClick={onCopy}>
              copy link
            </button>
          </span>
        </div>

        <article className="report cs" aria-label={`${study.title} case study`}>
          <dl className="cs-meta">
            <MetaItem label="ROLE">{study.role}</MetaItem>
            <MetaItem label="TEAM">{study.team}</MetaItem>
            <MetaItem label="TIMELINE">{study.timeline}</MetaItem>
            <MetaItem label="STACK">{(study.stack ?? []).join(", ")}</MetaItem>
            <MetaItem label="STATUS">{study.status}</MetaItem>
          </dl>

          <h1 className="cs-title">{study.title}</h1>

          <div className="cs-body">
            <Body text={study.body} />
          </div>
        </article>

        <nav className="incident-nav" aria-label="More">
          <Link to={{ pathname: "/", hash: "#caseStudies" }}>&larr; all case studies</Link>
        </nav>
      </div>
    </main>
  );
};

const CaseStudyPage = () => {
  const { slug = "" } = useParams();
  const study = caseStudies[slug];
  if (!study) return <NotFound />;
  return <CaseStudyView key={study.slug} study={study} />;
};

export default CaseStudyPage;
