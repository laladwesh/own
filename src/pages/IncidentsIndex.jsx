import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "../style";
import SectionHeading from "../components/SectionHeading";
import { IncidentLine } from "../components/Incidents";
import { incidents } from "../lib/incidents.js";
import { INDEX_INTRO, indexSeo } from "../lib/seo.js";
import { useSeo } from "../lib/useSeo";

const KINDS = [...new Set(incidents.map((i) => i.kind).filter(Boolean))];

const IncidentsIndex = () => {
  useSeo(indexSeo);
  const [params, setParams] = useSearchParams();
  const kind = KINDS.includes(params.get("kind")) ? params.get("kind") : "all";
  const shown = useMemo(() => (kind === "all" ? incidents : incidents.filter((i) => i.kind === kind)), [kind]);

  const choose = (k) => setParams(k === "all" ? {} : { kind: k }, { replace: true });

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[128px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body`}>
        <SectionHeading as="h1" command="$ journalctl --priority=crit" title="Incidents" />
        <p className="page-intro">{INDEX_INTRO}</p>

        <div className="chips" role="group" aria-label="Filter by kind">
          {["all", ...KINDS].map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => choose(k)}>
              {k === "all" ? "--all" : `--kind=${k}`}
            </button>
          ))}
        </div>

        <p className="section-note inc-count" aria-live="polite">
          {shown.length} {shown.length === 1 ? "postmortem" : "postmortems"}, newest first.
        </p>
        <ul className="incident-list">
          {shown.map((inc) => (
            <IncidentLine key={inc.id} incident={inc} />
          ))}
        </ul>

        <p className="incident-more">
          <Link to="/">&larr; avinashgupta.in</Link>
        </p>
      </div>
    </main>
  );
};

export default IncidentsIndex;
