import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { caseStudies, shortTitle } from "../lib/caseStudies";
import { isRunning, stages } from "../lib/data";
import { startOf } from "../lib/util.js";
import { placeicon } from "../assets";
import SectionHeading from "./SectionHeading";

const Job = ({ position, open, onToggle }) => {
  const running = isRunning(position);
  const date = startOf(position.duration);
  return (
    <li className="job">
      <button type="button" className="job-head" aria-expanded={open} onClick={onToggle}>
        <span className={running ? "job-status job-status--running" : "job-status"}>{running ? "running" : "[ok]"}</span>
        <span className="job-title">{position.title}</span>
        <span className="job-dates">{position.duration}</span>
      </button>
      {open && (
        <div className="job-log">
          {position.content.map((c, i) => (
            <p key={i}>
              <span className="job-log-date">[{date}]</span> {c.text}
              {c.link && (
                <>
                  {" "}
                  <a href={c.link} target="_blank" rel="noopener noreferrer">
                    link
                  </a>
                </>
              )}
            </p>
          ))}
          {position.relatedProjects?.map((s) => {
            const study = caseStudies[s];
            return study ? (
              <p key={s} className="job-related">
                <Link to={`/projects/${s}`}>&rarr; case study: {shortTitle(study)}</Link>
              </p>
            ) : null;
          })}
        </div>
      )}
    </li>
  );
};

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points={dir === "right" ? "5,2 11,8 5,14" : "11,2 5,8 11,14"} />
  </svg>
);

const Pipeline = () => {
  const [open, setOpen] = useState(() => new Set());
  const trackRef = useRef(null);
  const [edge, setEdge] = useState({ left: false, right: true });

  // Chevrons replace the scrollbar; each one shows only while there is more to scroll to.
  useEffect(() => {
    const el = trackRef.current;
    const update = () => {
      const next = { left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 };
      setEdge((prev) => (prev.left === next.left && prev.right === next.right ? prev : next));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollStages = (dir) => trackRef.current.scrollBy({ left: dir * 380, behavior: "smooth" });
  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <section id="pipeline" className="section">
      <SectionHeading command="$ gh run view --log" title="Experience" />
      <p className="section-note">
        {stages.length} stages / {stages.reduce((n, s) => n + s.positions.length, 0)} jobs. Click a job to read its log.
      </p>
      <div className="pipeline-wrap">
      {edge.left && (
        <button type="button" className="pipe-chev pipe-chev--left" aria-label="Scroll to earlier stages" onClick={() => scrollStages(-1)}>
          <Chevron dir="left" />
        </button>
      )}
      {edge.right && (
        <button type="button" className="pipe-chev pipe-chev--right" aria-label="Scroll to more stages" onClick={() => scrollStages(1)}>
          <Chevron dir="right" />
        </button>
      )}
      <ol className="pipeline" ref={trackRef}>
        {stages.map((org) => (
          <li key={org.organisation} className="stage">
            <div className="stage-head">
              {org.logo !== placeicon && (
                <img src={org.logo} alt="" width={36} height={36} className="stage-logo" />
              )}
              <h3 className="sub-heading">
                {org.link ? (
                  <a href={org.link} target="_blank" rel="noopener noreferrer">
                    {org.organisation}
                  </a>
                ) : (
                  org.organisation
                )}
              </h3>
            </div>
            <ul className="jobs">
              {org.positions.map((p) => {
                const key = `${org.organisation}|${p.title}|${p.duration}`;
                return <Job key={key} position={p} open={open.has(key)} onToggle={() => toggle(key)} />;
              })}
            </ul>
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
};

export default Pipeline;
