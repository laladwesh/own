import { extraCurricular } from "../constants";
import SectionHeading from "./SectionHeading";

const Cronjobs = () => (
  <section id="cronjobs" className="section">
    <SectionHeading command="$ kubectl get cronjobs" title="Extra Curricular" />
    <div className="table table--cron" role="table" aria-label="Extra curricular">
      <div className="table-head" role="row">
        <span role="columnheader">NAME</span>
        <span role="columnheader">SCHEDULE</span>
        <span role="columnheader">ORGANISATION</span>
        <span role="columnheader">NOTE</span>
      </div>
      {extraCurricular.map((e) => (
        <div key={e.id} className="table-row" role="row">
          <span role="cell" className="table-strong">{e.title}</span>
          <span role="cell">{e.duration}</span>
          <span role="cell">{e.organisation}</span>
          <span role="cell" className="term-muted">{e.content[0].text}</span>
        </div>
      ))}
    </div>
  </section>
);

export default Cronjobs;
