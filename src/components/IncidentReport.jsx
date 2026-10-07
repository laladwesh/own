import { isDraftIncident, mergedCommand } from "../lib/incidents.js";
import { DRAFT_BANNER } from "../lib/drafts.js";
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

export const Report = ({ incident: inc, titleAs: Title = "h1" }) => {
  const Diagram = DIAGRAMS[inc.diagram];
  return (
  <article className="report" aria-label={`${inc.id} postmortem`}>
    {isDraftIncident(inc) && (
      <p className="draft-banner" role="note">
        {DRAFT_BANNER}
      </p>
    )}
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
    <Title className="sub-heading report-title">{inc.title}</Title>

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

    {inc.whatFailed?.length > 0 && (
      <section className="report-sec">
        <Label>WHAT DIDN&apos;T WORK</Label>
        <ul className="report-failed">
          {inc.whatFailed.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>
    )}

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
