import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BUILD } from "../lib/deploy";
import { COMMIT_LABELS } from "../constants/commits";
import { siteDomain } from "../constants";
import { infraGroups, TITLE } from "./diagrams";
import { useBg } from "./store";

// The page background: faint, printed, completely still, and attached to the page (it scrolls with
// it). Three versions that fade into each other when switched:
//   infra  a blueprint of my real production setup, spread down the page in the gaps between sections
//   git    `git log --graph` lanes in the side margins, with labels from my real commit messages
//   plain  graph paper
// Nothing here reads the mouse, the scroll or the keyboard, and nothing loops. The words on the
// infra map change between technical and plain English with the reading mode (CSS, see guide.css).
const SMALL = 620; // below this width the infra map and the graph use fewer nodes and lanes
const TILE = 560; // height of one repeat of the git graph
const MAX_LABELS = 12;

// ───────────── the infra map ─────────────
const arrow = (pts) => {
  const [x1, y1] = pts[pts.length - 2];
  const [x2, y2] = pts[pts.length - 1];
  return `translate(${x2} ${y2}) rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI})`;
};

const Both = ({ x, y, tech, plain, anchor = "middle", className = "bg-tx" }) => (
  <>
    <text className={`${className} bg-t`} x={x} y={y} textAnchor={anchor}>
      {tech}
    </text>
    <text className={`${className} bg-p`} x={x} y={y} textAnchor={anchor}>
      {plain}
    </text>
  </>
);

const Diagram = memo(({ group, top }) => {
  const { w, h, nodes, edges, side } = group;
  return (
    <svg className={`bg-g bg-g--${side}`} style={{ top }} width={w + 2} height={h + 2} viewBox={`-1 -1 ${w + 2} ${h + 2}`}>
      {edges.map((e, i) => (
        <g key={i}>
          <polyline className="bg-ln" points={e.pts.map((p) => p.join(",")).join(" ")} strokeDasharray={e.dashed ? "3 3" : undefined} />
          {e.arrow && <path className="bg-ln" transform={arrow(e.pts)} d="M-5 -3 L0 0 L-5 3" />}
          {e.label && (
            <Both
              x={(e.pts[0][0] + e.pts[e.pts.length - 1][0]) / 2}
              y={e.pts[0][1] - 6}
              tech={e.label.tech}
              plain={e.label.plain}
              className="bg-tx bg-tx--edge"
            />
          )}
        </g>
      ))}
      {nodes.map((n) => (
        <g key={`${n.x}-${n.y}`}>
          <rect className="bg-ln" x={n.x + 0.5} y={n.y + 0.5} width={n.w - 1} height={n.h - 1} />
          <Both x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} tech={n.tech} plain={n.plain} />
        </g>
      ))}
    </svg>
  );
});

const TitleBlock = () => {
  const rev = (BUILD.date || BUILD.builtAt || "").slice(0, 10);
  return (
    <svg className="bg-title" width={TITLE.w + 2} height={TITLE.h + 2} viewBox={`-1 -1 ${TITLE.w + 2} ${TITLE.h + 2}`}>
      <rect className="bg-ln" x="0.5" y="0.5" width={TITLE.w - 1} height={TITLE.h - 1} />
      <line className="bg-ln" x1="0" x2={TITLE.w} y1="16" y2="16" />
      <text className="bg-tx" x="8" y="12">
        INFRA
      </text>
      <text className="bg-tx" x="8" y="30">
        {siteDomain}
      </text>
      <text className="bg-tx" x="8" y="42">
        {rev ? `REV ${rev}` : "REV"}
      </text>
    </svg>
  );
};

const InfraMap = ({ on, geo }) => {
  const small = geo.w < SMALL;
  const groups = useMemo(() => infraGroups(small), [small]);
  const home = geo.gaps.length > 0;
  return (
    <div className={`bg-mode${on ? " bg-mode--on" : ""}`}>
      {geo.h > 0 &&
        groups.map((g) => {
          let top;
          if (home) {
            const want = g.at * geo.h;
            top = geo.gaps.reduce((best, y) => (Math.abs(y - want) < Math.abs(best - want) ? y : best), geo.gaps[0]);
          } else top = Math.min(Math.max(120, g.at * geo.h), Math.max(120, geo.h - 360));
          return <Diagram key={g.key} group={g} top={Math.round(top)} />;
        })}
      {geo.h > 0 && <TitleBlock />}
    </div>
  );
};

// ───────────── the git graph ─────────────
// One repeat of the graph for one side margin. Lane 0 is `main`; lanes 1 and 2 are short branches that
// fork off and merge back. `x(i)` is the lane's distance from the page edge; the right margin is the same
// drawing (the tile is placed at the right edge and the lanes count from there).
const laneX = (i, small, side, w) => (side === "l" ? 8 + i * (small ? 7 : 12) : w - (8 + i * (small ? 7 : 12)));

const GitTile = memo(({ side, small, flip, label, labelAt }) => {
  const w = small ? 24 : 64;
  const x = (i) => laneX(i, small, side, w);
  const sgn = side === "l" ? 1 : -1;
  const k = small ? 7 : 12;
  const lines = [`M${x(0)} 0 V${TILE}`]; // main, the whole tile
  const dots = [40, 110, 180, 250, 320, 390, 460, 530].map((v) => [x(0), v]);
  // branch A forks off main at 90 and merges back at 230
  lines.push(`M${x(0)} 90 q0 ${k} ${sgn * k} ${k} V${230 - k} q0 ${k} ${-sgn * k} ${k}`);
  dots.push([x(1), 140], [x(1), 190]);
  if (!small) {
    // branch B forks at 330; a second branch forks off it into lane 2; both merge back
    lines.push(`M${x(0)} 330 q0 ${k} ${sgn * k} ${k} V${490 - k} q0 ${k} ${-sgn * k} ${k}`);
    lines.push(`M${x(1)} 380 q0 ${k} ${sgn * k} ${k} V${440 - k} q0 ${k} ${-sgn * k} ${k}`);
    dots.push([x(1), 372], [x(1), 420], [x(2), 412]);
  } else {
    lines.push(`M${x(0)} 360 q0 ${k} ${sgn * k} ${k} V${470 - k} q0 ${k} ${-sgn * k} ${k}`);
    dots.push([x(1), 410], [x(1), 440]);
  }
  // the right margin is the same drawing upside down, so the two sides do not repeat in step
  const drawing = flip ? `translate(0 ${TILE}) scale(1 -1)` : undefined;
  return (
    <svg className={`bg-gt bg-gt--${side}`} width={w} height={TILE} viewBox={`0 0 ${w} ${TILE}`}>
      <g transform={drawing}>
        {lines.map((d, i) => (
          <path key={i} className="bg-ln" d={d} />
        ))}
        {dots.map(([cx, cy], i) => (
          <circle key={i} className="bg-dot" cx={cx} cy={cy} r="2.5" />
        ))}
      </g>
      {label && (
        <text className="bg-tx bg-tx--git" transform={`translate(${side === "l" ? 47 : w - 47} ${labelAt}) rotate(90)`} textAnchor="start">
          {label}
        </text>
      )}
    </svg>
  );
});

const GitGraph = ({ on, geo }) => {
  const small = geo.w < SMALL;
  const count = Math.ceil(geo.h / TILE);
  // labels only where the margin is wide enough to hold them
  const labels = small ? [] : COMMIT_LABELS.slice(0, MAX_LABELS);
  // which tile carries which label: spread over the page, alternating sides, a tile apart at least
  const placed = useMemo(() => {
    const map = new Map();
    const n = Math.min(labels.length, count);
    for (let j = 0; j < n; j++) {
      const t = Math.min(count - 1, Math.floor(((j + 0.5) * count) / n));
      const side = j % 2 ? "r" : "l";
      map.set(`${t}-${side}`, { label: labels[j], at: j % 3 === 0 ? 110 : j % 3 === 1 ? 250 : 390 });
    }
    return map;
  }, [count, labels, small]);
  const sides = small ? ["l"] : ["l", "r"];
  return (
    <div className={`bg-mode${on ? " bg-mode--on" : ""}`}>
      {geo.h > 0 && (
        <>
          <p className="bg-git-note">each dot is a saved change to my code</p>
          {Array.from({ length: count }, (_, t) =>
            sides.map((side) => {
              const p = placed.get(`${t}-${side}`);
              return (
                <div key={`${t}-${side}`} className={`bg-gt-box bg-gt-box--${side}`} style={{ top: t * TILE, height: Math.min(TILE, geo.h - t * TILE) }}>
                  <GitTile side={side} small={small} flip={side === "r"} label={p?.label} labelAt={p?.at ?? 0} />
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

// ───────────── the layer ─────────────
const Backdrop = () => {
  const mode = useBg();
  const { pathname } = useLocation();
  const ref = useRef(null);
  const [geo, setGeo] = useState({ h: 0, w: 0, gaps: [] });

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return undefined;
    let timer = 0;
    const measure = () => {
      const root = layer.parentElement;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const gaps = [...document.querySelectorAll("main section.section")]
        .map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY - top - 100))
        .filter((y) => y > 120)
        .slice(1); // the gap above the first section holds the hero's own "at home" line
      const next = { h: layer.clientHeight, w: layer.clientWidth, gaps };
      setGeo((prev) => (prev.h === next.h && prev.w === next.w && prev.gaps.join() === next.gaps.join() ? prev : next));
    };
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 120);
    };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(soon);
    ro?.observe(layer);
    window.addEventListener("resize", soon);
    // pages load their content a little after the route changes
    const later = [300, 1200, 3000].map((ms) => setTimeout(measure, ms));
    return () => {
      clearTimeout(timer);
      later.forEach(clearTimeout);
      ro?.disconnect();
      window.removeEventListener("resize", soon);
    };
  }, [pathname]);

  return (
    <div ref={ref} className="bg-layer" aria-hidden="true">
      <div className={`bg-mode bg-grid${mode === "plain" ? " bg-mode--on" : ""}`} />
      <InfraMap on={mode === "infra"} geo={geo} />
      <GitGraph on={mode === "git"} geo={geo} />
    </div>
  );
};

export default Backdrop;
