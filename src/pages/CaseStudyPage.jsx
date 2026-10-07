import { Fragment, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../style";
import { CASE_DIAGRAMS } from "../components/CaseStudyDiagrams";
import { caseStudies } from "../lib/caseStudies";
import { caseStudySeo } from "../lib/seo";
import { copyText } from "../lib/clipboard";
import { useSeo } from "../lib/useSeo";
import NotFound from "./NotFound";

// Code blocks are small dark terminal devices, like the bad command in the incident reports.
const CodeDevice = ({ children }) => {
  const code = children?.props ?? {};
  const lang = (code.className ?? "").replace("language-", "");
  const text = String(code.children ?? "").replace(/\n$/, "");
  return (
    <div className="inc-term cs-code" role="group" aria-label={`${lang || "code"} example`}>
      <div className="inc-term-bar">
        <span className="inc-term-dot" aria-hidden="true" />
        <span className="inc-term-dot" aria-hidden="true" />
        <span className="inc-term-dot" aria-hidden="true" />
        {lang && <span className="cs-code-lang">{lang}</span>}
      </div>
      <div className="inc-term-body">
        <pre className="cs-pre">{text}</pre>
      </div>
    </div>
  );
};

const components = {
  pre: CodeDevice,
  code: ({ className, children }) => <code className={className ?? "inc-code"}>{children}</code>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const Md = ({ text }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {text}
  </ReactMarkdown>
);

// `[DIAGRAM: id]` on its own line in the markdown puts a schematic there.
const Body = ({ text }) => {
  const parts = text.split(/\n?\[DIAGRAM: ([\w-]+)\]\n?/);
  return parts.map((part, i) => {
    if (i % 2 === 0) return part.trim() ? <Md key={i} text={part} /> : null;
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
          <Link to="/">~</Link>/<Link to={{ pathname: "/", hash: "#deployments" }}>projects</Link>/
          {study.slug}/<span aria-current="page">CASE_STUDY.md</span>
        </nav>

        <div className="report-toolbar">
          <Link to={{ pathname: "/", hash: "#deployments" }} className="cs-back">
            &larr; all projects
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
          <Link to={{ pathname: "/", hash: "#deployments" }}>&larr; all projects</Link>
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
