import { useState } from "react";
import { projects } from "../constants";
import { slug } from "../lib/util.js";
import { describeObject, projectLinks as links, projectStatus } from "../lib/data";
import { Link } from "react-router-dom";
import { notes } from "../lib/notes";
import SectionHeading from "./SectionHeading";
import { Switchable, Wide, yamlLines } from "./Manifest";

const Describe = ({ project }) => (
  <div className="describe">
    <p className="describe-cmd">$ kubectl describe deployment {slug(project.title)}</p>
    <Switchable
      label={`${slug(project.title)}.yaml`}
      yaml={yamlLines(describeObject(project))}
      wide={
        <Wide
          rows={[
            ["Name", project.title],
            ["Status", projectStatus(project)],
            ["Description", project.content],
            ["Stack", project.stack.map((t) => t.name).join(", ")],
            ["Access", project.internal],
            ["Case study", project.caseStudy ? <Link to={`/projects/${project.caseStudy}`}>read case study &rarr;</Link> : null],
            ["Links", links(project).length ? (
              <span className="wide-links">
                {links(project).map(([label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                ))}
              </span>
            ) : null],
          ]}
        />
      }
    />
    {project.caseStudy && (
      <p className="describe-link">
        <Link to={`/projects/${project.caseStudy}`}>read case study &rarr;</Link>
      </p>
    )}
  </div>
);

const Deployments = () => {
  const [open, setOpen] = useState(null);

  return (
    <section id="deployments" className="section">
      <SectionHeading command="$ kubectl get deployments" title="Projects" />
      <div className="table" role="table" aria-label="Projects">
        <div className="table-head" role="row">
          <span role="columnheader">NAME</span>
          <span role="columnheader">STATUS</span>
          <span role="columnheader">STACK</span>
          <span role="columnheader">LINKS</span>
        </div>
        {projects.map((p) => {
          const status = projectStatus(p);
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="table-group" role="rowgroup">
              <div className="table-row" role="row">
                <span role="cell">
                  <button
                    type="button"
                    className="row-name"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : p.id)}
                  >
                    <span aria-hidden="true">{isOpen ? "v" : ">"}</span> {slug(p.title)}
                  </button>
                </span>
                <span role="cell" className={`status status--${status.toLowerCase()}`}>{status}</span>
                <span role="cell" className="row-stack">{p.stack.slice(0, 4).map((t) => t.name).join(", ")}</span>
                <span role="cell" className="row-links">
                  {p.note && notes.some((n) => n.slug === p.note) && (
                    <Link to={`/notes/${p.note}`} className="row-case">
                      read the note &rarr;
                    </Link>
                  )}
                  {p.caseStudy && (
                    <Link to={`/projects/${p.caseStudy}`} className="row-case">
                      read case study &rarr;
                    </Link>
                  )}
                  {links(p).length ? (
                    links(p).map(([label, href]) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                    ))
                  ) : (
                    <span className="term-muted">{p.internal ?? "none"}</span>
                  )}
                </span>
              </div>
              {isOpen && <Describe project={p} />}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Deployments;
