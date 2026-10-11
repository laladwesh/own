import { Link } from "react-router-dom";
import { incidentPath } from "../lib/seo.js";
import { notePath, notes } from "../lib/notes.js";
import { incidents, isDraftIncident } from "../lib/incidents.js";
import SectionHeading from "./SectionHeading";
import { useHuman } from "../view/store";
import { plainKind, plainSeverity } from "../constants/explain";

// One log line, as a link to the full report.
export const IncidentLine = ({ incident }) => {
  const everyone = useHuman();
  return (
  <li className="incident">
    <Link to={incidentPath(incident.id)} className="inc-head">
      <span className="inc-sev">
        [{incident.severity}
        {everyone && plainSeverity[incident.severity] ? ` ${plainSeverity[incident.severity]}` : ""}]
      </span>
      <span className="inc-date">{incident.date}</span>
      <span className="inc-id">{incident.id}</span>
      {incident.kind ? <span className="inc-kind">{everyone && plainKind[incident.kind] ? plainKind[incident.kind] : incident.kind}</span> : <span />}
      <span className="inc-title">
        {incident.title}
        {isDraftIncident(incident) && <span className="draft-tag">draft</span>}
      </span>
      <span className="inc-dur">{incident.duration}</span>
    </Link>
  </li>
  );
};

// The homepage teaser: just the log lines. The reports live on their own pages.
const Incidents = () => (
  <section id="incidents" className="section">
    <SectionHeading command="$ journalctl --priority=crit" title="Incidents" explain="incidents" />
    <ul className="incident-list">
      {incidents.map((inc) => (
        <IncidentLine key={inc.id} incident={inc} />
      ))}
    </ul>
    <p className="incident-more">
      <Link to="/incidents">read all postmortems &rarr;</Link>
    </p>
    {notes[0] && (
      <p className="incident-more">
        latest note: <Link to={notePath(notes[0].slug)}>{notes[0].title} &rarr;</Link>
      </p>
    )}
    {notes.length > 0 && (
      <p className="incident-more">
        <Link to="/notes">all notes &rarr;</Link>
      </p>
    )}
  </section>
);

export default Incidents;
