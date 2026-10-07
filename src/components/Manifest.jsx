import { useState } from "react";

import { yamlLines } from "../lib/yaml";

export { yamlLines };

// ───────────── rendering ─────────────
export const Manifest = ({ lines, label }) => (
  <div className="manifest" role="region" aria-label={label ?? "manifest"} tabIndex={0}>
    {lines.map((line, i) => (
      <div key={i} className="mf-line">
        <span className="mf-no" aria-hidden="true">
          {i + 1}
        </span>
        <span className="mf-body" style={{ paddingLeft: `${line.indent * 2}ch` }}>
          {Array.from({ length: line.indent }, (_, g) => (
            <span key={g} className="mf-guide" style={{ left: `${g * 2}ch` }} aria-hidden="true" />
          ))}
          {line.parts.map((p, j) =>
            p.t === "url" ? (
              <a key={j} href={p.href} target={p.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className="mf-url">
                {p.text}
              </a>
            ) : (
              <span key={j} className={`mf-${p.t}`}>
                {p.text}
              </span>
            )
          )}
        </span>
      </div>
    ))}
  </div>
);

// ───────────── yaml / wide toggle ─────────────
const initialMode = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches ? "yaml" : "wide";

export const ModeToggle = ({ mode, setMode, options = ["yaml", "wide"] }) => (
  <div className="mode-toggle" role="group" aria-label="View">
    {options.map((o) => (
      <button key={o} type="button" aria-pressed={mode === o} className="mode-btn" onClick={() => setMode(o)}>
        [ -o {o} ]
      </button>
    ))}
  </div>
);

// Shows the YAML view or the plain "wide" view of the same data.
export const Switchable = ({ yaml, wide, label }) => {
  const [mode, setMode] = useState(initialMode);
  return (
    <div>
      <ModeToggle mode={mode} setMode={setMode} />
      {mode === "yaml" ? <Manifest lines={yaml} label={label} /> : <div className="wide-view">{wide}</div>}
    </div>
  );
};

// Wide view helper: a plain definition list.
export const Wide = ({ rows }) => (
  <dl className="wide-dl">
    {rows
      .filter(([, v]) => v)
      .map(([k, v]) => (
        <div key={k} className="wide-row">
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
  </dl>
);
