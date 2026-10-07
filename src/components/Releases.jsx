import { releaseRows as rows } from "../lib/data";
import SectionHeading from "./SectionHeading";

const Releases = () => (
  <section id="releases" className="section">
    <SectionHeading command="$ gh release list" title="Achievements" />
    <ol className="releases">
      {rows.map((r, i) => (
        <li key={r.id} className="release">
          <div className="release-line">
            <span className="release-tag">{r.tag}</span>
            <span className="release-title">
              {r.event.replace(/ \d{4}$/, (m) => m)} / <span className={r.top ? "tag-highlight" : "tag-stone"}>{r.position}</span>
            </span>
            {i === 0 && r.key && <span className="release-latest">[latest]</span>}
          </div>
          <p className="release-org">{r.org}</p>
          <ul className="release-notes">
            {r.notes.map((n, j) => (
              <li key={j}>{n}</li>
            ))}
          </ul>
          {r.project && (
            <a href={r.project} target="_blank" rel="noopener noreferrer">
              project
            </a>
          )}
        </li>
      ))}
    </ol>
  </section>
);

export default Releases;
