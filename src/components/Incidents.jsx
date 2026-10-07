import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { incidents, incidentSpec, mergedCommand } from "../lib/incidents.js";
import { yamlLines } from "../lib/yaml.js";
import SectionHeading from "./SectionHeading";
import { Manifest, ModeToggle } from "./Manifest";
import { DIAGRAMS } from "./IncidentDiagrams";

// `code` in the data becomes an inline code span.
const Rich = ({ text }) =>
  text.split("`").map((part, i) => (i % 2 ? <code key={i} className="inc-code">{part}</code> : part));

const Label = ({ children }) => <p className="inc-label">{children}</p>;

// The pasted lines, then what actually ran (line breaks lost, so `cd ~` became a second target).
const BadCommand = ({ incident }) => {
  const [first, ...rest] = incident.badCommand.pasted;
  return (
    <div className="inc-term" role="group" aria-label={`The command that ran: ${mergedCommand(incident)}`}>
      <div className="inc-term-bar" aria-hidden="true">
        <span className="inc-term-dot" />
        <span className="inc-term-dot" />
        <span className="inc-term-dot" />
      </div>
      <div className="inc-term-body">
        {incident.badCommand.pasted.map((c) => (
          <p key={c} className="inc-term-line inc-term-muted">
            <span className="inc-term-prompt">$</span> {c}
          </p>
        ))}
        <p className="inc-term-line inc-term-muted"># pasted with the line breaks lost, it ran as:</p>
        <p className="inc-term-line">
          <span className="inc-term-prompt">$</span> {first}
          {rest.map((r) => (
            <span key={r} className="inc-bad">
              {r}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

const Report = ({ incident: inc }) => {
  const Diagram = DIAGRAMS[inc.diagram];
  return (
  <article className="report" aria-label={`${inc.id} postmortem`}>
    <p className="report-meta">
      <strong>{inc.id}</strong>
      <span aria-hidden="true">/</span>
      <span>{inc.severity}</span>
      {inc.kind && (
        <>
          <span aria-hidden="true">/</span>
          <span className="inc-kind">{inc.kind}</span>
        </>
      )}
      <span aria-hidden="true">/</span>
      <span>DURATION {inc.duration}</span>
      {inc.status && (
        <>
          <span aria-hidden="true">/</span>
          <span>STATUS {inc.status}</span>
        </>
      )}
    </p>
    <h3 className="sub-heading report-title">{inc.title}</h3>

    <section className="report-sec">
      <Label>IMPACT</Label>
      <p>{inc.impact}</p>
    </section>

    <section className="report-sec">
      <Label>SUMMARY</Label>
      <p>{inc.summary}</p>
    </section>

    {Diagram && (
      <section className="report-sec report-sec--wide">
        <Label>SCHEMATIC</Label>
        <Diagram />
      </section>
    )}

    <section className="report-sec">
      <Label>TIMELINE</Label>
      <ol className="report-timeline">
        {inc.timeline.map((s, i) => (
          <li key={i}>
            <span className="report-step" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              {s.time && <span className="report-time">{s.time} </span>}
              <Rich text={s.event} />
            </span>
          </li>
        ))}
      </ol>
    </section>

    <section className="report-sec">
      <Label>ROOT CAUSE</Label>
      <p>
        <Rich text={inc.rootCause} />
      </p>
      {inc.badCommand && <BadCommand incident={inc} />}
    </section>

    <section className="report-sec">
      <Label>WHAT DIDN&apos;T WORK</Label>
      <ul className="report-failed">
        {inc.whatFailed.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </section>

    <section className="report-sec">
      <Label>RESOLUTION</Label>
      <ul className="report-list">
        {inc.resolution.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </section>

    <section className="report-sec">
      <Label>ACTION ITEMS</Label>
      <ul className="report-actions">
        {inc.actionItems.map((a) => (
          <li key={a.text}>
            <span className="report-box" aria-hidden="true">
              [{a.done ? "x" : " "}]
            </span>
            <span className="sr-only">{a.done ? "done: " : "open: "}</span>
            <span>{a.text}</span>
          </li>
        ))}
      </ul>
    </section>

    <section className="report-sec">
      <Label>LESSON</Label>
      <p className="report-lesson">{inc.lesson}</p>
    </section>

    {inc.credits && (
      <section className="report-sec">
        <Label>CREDITS</Label>
        <p>{inc.credits}</p>
      </section>
    )}

    <p className="report-tags">{inc.tags.map((t) => `#${t}`).join("  ")}</p>
  </article>
  );
};

const Entry = ({ incident, open, onToggle }) => {
  const reduce = useReducedMotion();
  // The printed report is the default view; -o yaml shows the raw object.
  const [mode, setMode] = useState("wide");
  return (
    <li className="incident">
      <button
        type="button"
        className="inc-head"
        aria-expanded={open}
        aria-controls={`panel-${incident.id}`}
        onClick={onToggle}
      >
        <span className="inc-sev">[{incident.severity}]</span>
        <span className="inc-date">{incident.date}</span>
        <span className="inc-id">{incident.id}</span>
        {incident.kind ? <span className="inc-kind">{incident.kind}</span> : <span />}
        <span className="inc-title">{incident.title}</span>
        <span className="inc-dur">{incident.duration}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`panel-${incident.id}`}
            className="inc-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="inc-panel-inner">
              <ModeToggle mode={mode} setMode={setMode} />
              {mode === "yaml" ? (
                <Manifest lines={yamlLines(incidentSpec(incident))} label={`${incident.id}.yaml`} />
              ) : (
                <Report incident={incident} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

const Incidents = () => {
  const [open, setOpen] = useState(null);
  return (
    <section id="incidents" className="section">
      <SectionHeading command="$ journalctl --priority=crit" title="Incidents" />
      <p className="section-note">
        {incidents.length} {incidents.length === 1 ? "postmortem" : "postmortems"}. Click a line to read the report.
      </p>
      <ul className="incident-list">
        {incidents.map((inc) => (
          <Entry key={inc.id} incident={inc} open={open === inc.id} onToggle={() => setOpen(open === inc.id ? null : inc.id)} />
        ))}
      </ul>
    </section>
  );
};

export default Incidents;
