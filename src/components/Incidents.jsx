import { Link } from "react-router-dom";
import { incidentPath } from "../lib/seo.js";
import { incidents } from "../lib/incidents.js";
import SectionHeading from "./SectionHeading";

// One log line, as a link to the full report.
export const IncidentLine = ({ incident }) => (
  <li className="incident">
    <Link to={incidentPath(incident.id)} className="inc-head">
      <span className="inc-sev">[{incident.severity}]</span>
      <span className="inc-date">{incident.date}</span>
      <span className="inc-id">{incident.id}</span>
      {incident.kind ? <span className="inc-kind">{incident.kind}</span> : <span />}
      <span className="inc-title">{incident.title}</span>
      <span className="inc-dur">{incident.duration}</span>
    </Link>
  </li>
);

// The homepage teaser: just the log lines. The reports live on their own pages.
const Incidents = () => (
  <section id="incidents" className="section">
    <SectionHeading command="$ journalctl --priority=crit" title="Incidents" />
    <ul className="incident-list">
      {incidents.map((inc) => (
        <IncidentLine key={inc.id} incident={inc} />
      ))}
    </ul>
    <p className="incident-more">
      <Link to="/incidents">read all postmortems &rarr;</Link>
    </p>
  </section>
);

export default Incidents;
