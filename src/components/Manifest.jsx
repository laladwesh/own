import ExplainButton from "./ExplainButton";
import { Gloss, glossHover } from "./Gloss";
import { useBlockView } from "../guide/blocks";
import { useHuman } from "../view/store";

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
              <a key={j} href={p.href} target={p.href.startsWith("mailto:") || p.href.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer" className="mf-url">
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

// Engineer tuning: [ -o yaml ] [ -o wide ]. Human tuning: the same toggle with friendlier names.
const FRIENDLY = { yaml: "technical view", wide: "simple view", diagram: "simple view" };

export const ModeToggle = ({ mode, setMode, options = ["yaml", "wide"] }) => {
  const human = useHuman();
  return (
    <div className="mode-toggle" role="group" aria-label="View">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={mode === o}
          className="mode-btn"
          onClick={() => setMode(o)}
          {...(!human && o === "yaml" ? glossHover("yaml") : {})}
        >
          {human ? `[ ${FRIENDLY[o] ?? o} ]` : `[ -o ${o} ]`}
        </button>
      ))}
    </div>
  );
};

// Shows the YAML view or the plain "wide" view of the same data.
export const Switchable = ({ yaml, wide, label, explain }) => {
  const everyone = useHuman();
  // One shared state per block (see guide/blocks.js): the dial sets the default, a click on this
  // block's toggle, on its "?" bubble or on the link below overrides it until the dial turns again.
  const [mode, setMode] = useBlockView(explain ?? label ?? "block", { engineer: initialMode(), human: "wide" });
  return (
    <div>
      <div className="mode-row">
        <ModeToggle mode={mode} setMode={setMode} />
        {explain && <ExplainButton id={explain} />}
      </div>
      <div key={mode} className="tune-fade">
        {mode === "yaml" ? <Manifest lines={yaml} label={label} /> : <div className="wide-view">{wide}</div>}
      </div>
      {everyone && (
        <button type="button" className="engineer-link" onClick={() => setMode(mode === "wide" ? "yaml" : "wide")}>
          {mode === "wide" ? "show the technical version" : "show the simple version"}
        </button>
      )}
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
          <dd>{typeof v === "string" ? <Gloss text={v} /> : v}</dd>
        </div>
      ))}
  </dl>
);
