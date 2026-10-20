import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { COMMIT_LABELS } from "../constants/commits";
import { useBg } from "./store";

// The page background: still, attached to the page (it scrolls with it), ink on paper. Two versions:
//   git    `git log --graph` lanes in the side margins, with labels from my real commit messages
//   paper  graph paper
// Switching paper -> git draws the lanes that are on screen from top to bottom in about 600ms (the dots
// and labels pop in as the line reaches them); the rest appears at once. git -> paper fades the graph
// out in 250ms. With reduced motion both are instant. After that nothing moves, and nothing here reads
// the mouse, the scroll position or the keyboard.
const TILE = 560; // height of one repeat of the graph
const CHAR = 7.2; // width of one 12px mono character
const MAX_LABELS = 12;

// Width of one side margin, matching the page gutters in guide.css (.page-gutter).
const marginOf = (w) => (w < 768 ? 24 : w < 1200 ? 64 : Math.max(64, (w - 1040) / 2));

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// One repeat of the graph for one side. Lane 0 is `main`; the others are branches that fork off and
// merge back. The right margin is the same drawing upside down, so the two sides do not repeat in step.
const GitTile = memo(({ side, w, label, labelY, head, anim, top }) => {
  const small = w < 64;
  const lanesN = small ? 2 : 4;
  const g = small ? 7 : 11;
  const sgn = side === "l" ? 1 : -1;
  const x = (i) => (side === "l" ? 7 + i * g : w - (7 + i * g));
  const labelX = side === "l" ? 7 + (lanesN - 1) * g + 14 : w - (7 + (lanesN - 1) * g + 14);
  // a branch: leaves lane i at y0, runs down lane i+1 and comes back to lane i at y1
  const branch = (i, y0, y1) =>
    `M${x(i)} ${y0} c0 ${g / 2} ${sgn * g} ${g / 2} ${sgn * g} ${g} V${y1 - g} c0 ${g / 2} ${-sgn * g} ${g / 2} ${-sgn * g} ${g}`;

  const paths = [`M${x(0)} 0 V${TILE}`, branch(0, 90, 230), branch(0, 330, 490)];
  const dots = [40, 110, 180, 250, 320, 390, 460, 530].map((y) => [x(0), y]);
  dots.push([x(1), 140], [x(1), 190], [x(1), 360], [x(1), 470]);
  if (!small) {
    paths.push(branch(1, 372, 452), branch(2, 398, 438)); // a branch off a branch, and another off that
    dots.push([x(2), 392], [x(2), 450 - 6], [x(3), 418]);
  } else {
    dots.push([x(1), 410]);
  }

  const flip = side === "r";
  const fy = (y) => (flip ? TILE - y : y);
  // How far down the part of the page that is on screen a point is (0 to 1), or null when it is off
  // screen (those points just appear).
  const frac = (y) =>
    anim && top + y >= anim.top - 20 && top + y <= anim.bottom + 20 ? clamp((top + y - anim.top) / (anim.bottom - anim.top), 0, 1) : null;
  const cls = (base, f) => (f === null ? base : `${base} ${base}--${anim.id % 2}`);
  const delay = (f, span) => (f === null ? undefined : { animationDelay: `${Math.round(f * span)}ms` });
  const lineF = frac(TILE / 2) ?? frac(10) ?? frac(TILE - 10);

  return (
    <svg className={`bg-gt bg-gt--${side}`} width={w} height={TILE} viewBox={`0 0 ${w} ${TILE}`}>
      <g transform={flip ? `translate(0 ${TILE}) scale(1 -1)` : undefined}>
        {paths.map((d, i) => (
          <path key={i} className={cls("bg-ln", lineF)} pathLength="1" d={d} style={delay(lineF, 120)} />
        ))}
        {dots.map(([cx, cy], i) => {
          const f = frac(fy(cy));
          return <circle key={i} className={cls("bg-dot", f)} cx={cx} cy={cy} r="3.5" style={delay(f, 480)} />;
        })}
      </g>
      {head && (
        <g className={cls("bg-lbl", frac(110))} style={delay(frac(110), 480)}>
          <rect className="bg-box" x={labelX - 0.5} y={110 - 10} width="92" height="20" />
          <text className="bg-tx bg-tx--head" x={labelX + 8} y={110 + 4}>
            HEAD → main
          </text>
        </g>
      )}
      {label && (
        <text
          className={cls("bg-tx", frac(fy(labelY)))}
          style={delay(frac(fy(labelY)), 480)}
          x={labelX}
          y={fy(labelY) + 4}
          textAnchor={side === "l" ? "start" : "end"}
        >
          {label}
        </text>
      )}
    </svg>
  );
});

const GitGraph = ({ on, geo, anim }) => {
  const w = marginOf(geo.w);
  const roomForLabels = w >= 150;
  const count = Math.ceil(geo.h / TILE);
  // which tile carries which label: spread down the page, alternating sides. Labels are cut at a
  // word to fit the margin; one that would not fit is left out, so none ever runs under the text.
  const placed = useMemo(() => {
    const map = new Map();
    if (!roomForLabels) return map;
    const room = Math.floor((w - 7 - 3 * 11 - 14 - 10) / CHAR);
    const fit = (s) => {
      if (s.length <= room) return s;
      const cut = s.slice(0, room + 1).replace(/\s+\S*$/, "");
      return cut.length >= 8 ? cut : "";
    };
    const labels = COMMIT_LABELS.slice(0, MAX_LABELS).map(fit).filter(Boolean);
    const n = Math.min(labels.length, count);
    for (let j = 0; j < n; j++) {
      const t = Math.min(count - 1, Math.floor(((j + 0.5) * count) / n));
      map.set(`${t}-${j % 2 ? "r" : "l"}`, { label: labels[j], y: j % 3 === 0 ? 250 : j % 3 === 1 ? 390 : 530 });
    }
    return map;
  }, [count, w, roomForLabels]);
  return (
    <div className={`bg-mode bg-mode--git${on ? " bg-mode--on" : ""}`}>
      {geo.h > 0 &&
        Array.from({ length: count }, (_, t) =>
          ["l", "r"].map((side) => {
            const p = placed.get(`${t}-${side}`);
            return (
              <div key={`${t}-${side}`} className={`bg-gt-box bg-gt-box--${side}`} style={{ top: t * TILE, width: w, height: Math.min(TILE, geo.h - t * TILE) }}>
                <GitTile side={side} w={w} top={t * TILE} anim={anim} label={p?.label} labelY={p?.y ?? 0} head={t === 0 && side === "l" && roomForLabels} />
              </div>
            );
          })
        )}
    </div>
  );
};

const Backdrop = () => {
  const mode = useBg();
  const { pathname } = useLocation();
  const ref = useRef(null);
  const [geo, setGeo] = useState({ h: 0, w: 0 });
  const [anim, setAnim] = useState(null);
  const first = useRef(true);
  const prev = useRef(mode);

  // paper -> git: remember what is on screen right now, so only that part draws itself
  useEffect(() => {
    if (first.current) {
      first.current = false;
      prev.current = mode;
      return;
    }
    if (mode === "git" && prev.current !== "git" && !reduced()) {
      setAnim((a) => ({ id: (a?.id ?? 0) + 1, top: window.scrollY, bottom: window.scrollY + window.innerHeight }));
    } else if (mode !== "git") setAnim(null);
    prev.current = mode;
  }, [mode]);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return undefined;
    let timer = 0;
    const measure = () => {
      const next = { h: layer.clientHeight, w: layer.clientWidth };
      setGeo((p) => (p.h === next.h && p.w === next.w ? p : next));
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
      <div className={`bg-mode bg-grid${mode === "paper" ? " bg-mode--on" : ""}`} />
      <GitGraph on={mode === "git"} geo={geo} anim={anim} />
    </div>
  );
};

export default Backdrop;
