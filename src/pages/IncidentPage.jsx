import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../style";
import { Manifest, ModeToggle } from "../components/Manifest";
import { Report } from "../components/IncidentReport";
import { incidents, incidentSpec } from "../lib/incidents.js";
import { incidentPath, incidentSeo } from "../lib/seo.js";
import { yamlLines } from "../lib/yaml.js";
import { useSeo } from "../lib/useSeo";
import NotFound from "./NotFound";

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and insecure origins: fall back to a hidden textarea.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
};

const IncidentView = ({ incident, index }) => {
  const seo = useMemo(() => incidentSeo(incident), [incident]);
  useSeo(seo);
  // The printed report is the default view; -o yaml shows the raw object.
  const [mode, setMode] = useState("wide");
  const [copied, setCopied] = useState("");
  const timer = useRef(0);

  const onCopy = async () => {
    const ok = await copyText(window.location.href);
    setCopied(ok ? "copied" : "copy failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(""), 2000);
  };

  const newer = incidents[index - 1];
  const older = incidents[index + 1];

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[112px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body`}>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">~</Link>/<Link to="/incidents">incidents</Link>/<span aria-current="page">{incident.id}.md</span>
        </nav>

        <div className="report-toolbar">
          <ModeToggle mode={mode} setMode={setMode} />
          <span className="copy-wrap">
            <span className="copy-status" role="status" aria-live="polite">
              {copied}
            </span>
            <button type="button" className="btn copy-btn" onClick={onCopy}>
              copy link
            </button>
          </span>
        </div>

        {mode === "yaml" ? (
          <Manifest lines={yamlLines(incidentSpec(incident))} label={`${incident.id}.yaml`} />
        ) : (
          <Report incident={incident} />
        )}

        <nav className="incident-nav" aria-label="More incidents">
          <Link to="/incidents">&larr; all incidents</Link>
          <span className="incident-nav-step">
            {newer ? (
              <Link to={incidentPath(newer.id)} rel="prev">
                &larr; {newer.id} (newer)
              </Link>
            ) : (
              <span className="term-muted">newest</span>
            )}
            {older ? (
              <Link to={incidentPath(older.id)} rel="next">
                {older.id} (older) &rarr;
              </Link>
            ) : (
              <span className="term-muted">oldest</span>
            )}
          </span>
        </nav>
      </div>
    </main>
  );
};

const IncidentPage = () => {
  const { id = "" } = useParams();
  const index = incidents.findIndex((i) => i.id.toLowerCase() === id.toLowerCase());
  if (index < 0) return <NotFound />;
  return <IncidentView key={incidents[index].id} incident={incidents[index]} index={index} />;
};

export default IncidentPage;
