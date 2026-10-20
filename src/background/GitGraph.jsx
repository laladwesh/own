import { useState } from "react";
import { GIT } from "../constants/gitgraph";

// The real git graph of this repository, drawn down the left margin: newest commit (HEAD) at the top,
// older ones further down. Everything comes from src/constants/gitgraph.js, which scripts/commits.mjs
// builds from `git log --all --date-order --parents` (the lanes are laid out like `git log --graph`), so
// nothing here is invented and the terminal's `git log` shows the same commits. It is completely still:
// the only reaction is the small card when a dot is hovered or focused, and the dot is a link to that
// commit on GitHub.
const TOP = 112; // y of the newest commit, just under the navbar
const BOTTOM = 180; // room kept for the footer
const MIN_STEP = 90; // fewest pixels between two commits
const CHAR = 7.2; // width of one 12px mono character
const EVERY = 4; // a label beside every 4th commit

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const short = (d) => {
  const [, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1]}`;
};
const long = (d) => {
  const [y, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`;
};

// A line between two rows: a straight run, or a short sideways step at the dot (a branch leaving) or
// just above the next dot (a branch joining).
const segPath = (xs, xe, y0, y1, atStart) => {
  if (xs === xe) return `M${xs} ${y0} V${y1}`;
  const dx = xe - xs;
  return atStart ? `M${xs} ${y0} c0 12 ${dx} 6 ${dx} 20 V${y1}` : `M${xs} ${y0} V${y1 - 20} c0 12 ${dx} 6 ${dx} 20`;
};

const GitGraph = ({ h, margin, small }) => {
  const [hover, setHover] = useState(null);
  const commits = GIT.commits;
  const lanesN = Math.max(1, ...commits.map((c) => c.c + 1), ...commits.flatMap((c) => c.seg.flat().map((x) => x + 1)));
  const g = Math.max(5, Math.min(small ? 7 : 11, (margin - 24) / lanesN));
  const x = (k) => 9 + k * g;
  const avail = h - TOP - BOTTOM;
  const count = Math.max(1, Math.min(commits.length, Math.floor(avail / MIN_STEP) + 1));
  const step = count > 1 ? avail / (count - 1) : 0;
  const y = (i) => TOP + i * step;
  const shown = commits.slice(0, count);

  const labelX = x(lanesN - 1) + 18;
  const room = Math.floor((margin - labelX - 6) / CHAR);
  const labelled = !small && room >= 12;

  const label = (c) => {
    if (!c.l) return null;
    const date = short(c.d);
    const full = `${c.l} · ${date}`;
    if (full.length <= room) return { text: c.l, date: ` · ${date}` };
    // not enough room for the date: show the subject alone, cut at a word
    if (c.l.length <= room) return { text: c.l, date: "" };
    const cut = c.l.slice(0, room + 1).replace(/\s+\S*$/, "");
    return cut.length >= 10 ? { text: cut, date: "" } : null;
  };

  const repoUrl = GIT.repo ? `https://github.com/${GIT.repo}/commit/` : "";
  const active = hover === null ? null : shown[hover];

  return (
    <div className="git-overlay" style={{ width: margin, height: h }}>
      <svg className="git-svg" width={margin} height={h} viewBox={`0 0 ${margin} ${h}`} aria-label="Real commit history of this website, newest at the top" role="group">
        {shown.slice(0, -1).map((c, i) =>
          c.seg.map(([xs, xe], j) => <path key={`${i}-${j}`} className="bg-ln" d={segPath(x(xs), x(xe), y(i), y(i + 1), xs === c.c)} />)
        )}
        {shown.map((c, i) => {
          const cx = x(c.c);
          const cy = y(i);
          const dot = (
            <>
              <circle cx={cx} cy={cy} r="11" fill="transparent" />
              {c.m ? <circle className="bg-dot bg-dot--merge" cx={cx} cy={cy} r="5" /> : <circle className="bg-dot" cx={cx} cy={cy} r="3.5" />}
            </>
          );
          const aria = `commit ${c.h}${c.s ? `: ${c.s}` : ""}, ${long(c.d)}`;
          const events = { onPointerEnter: () => setHover(i), onPointerLeave: () => setHover(null), onFocus: () => setHover(i), onBlur: () => setHover(null) };
          return repoUrl ? (
            <a key={c.f} className="git-dot" href={repoUrl + c.f} target="_blank" rel="noopener noreferrer" aria-label={aria} {...events}>
              {dot}
            </a>
          ) : (
            <g key={c.f} className="git-dot" tabIndex={0} role="img" aria-label={aria} {...events}>
              {dot}
            </g>
          );
        })}
        {labelled &&
          shown.map((c, i) => {
            const l = i % EVERY === 1 ? label(c) : null;
            return l ? (
              <text key={`l-${c.f}`} className="bg-tx" x={labelX} y={y(i) + 4}>
                {l.text}
                <tspan className="bg-tx--muted">{l.date}</tspan>
              </text>
            ) : null;
          })}
        {labelled &&
          shown.flatMap((c, i) => {
            const tags = [...(i === 0 ? [`HEAD → ${GIT.head}`] : []), ...c.tags.filter((t) => t !== GIT.head)];
            return tags.map((t, k) => {
              const w = Math.ceil(t.length * 6.6 + 16);
              const ty = y(i) - 10 + k * 24;
              return (
                <g key={`t-${i}-${t}`}>
                  <rect className="bg-box" x={labelX - 0.5} y={ty} width={w} height="20" />
                  <text className="bg-tx bg-tx--tag" x={labelX + 8} y={ty + 14}>
                    {t}
                  </text>
                </g>
              );
            });
          })}
      </svg>
      {labelled && (
        <p className="git-note" style={{ left: labelX, top: TOP + 58, width: Math.max(80, margin - labelX - 10) }}>
          each dot is a real saved change to this website&apos;s code. newest at the top.
        </p>
      )}
      {active && (
        <div className="git-card" role="status" style={{ left: x(active.c) + 18, top: y(hover) - 14 }}>
          <span className="git-card-hash">{active.h}</span>
          <span className="git-card-subject">{active.s || "(subject not shown)"}</span>
          <span className="git-card-date">{long(active.d)}</span>
        </div>
      )}
    </div>
  );
};

export default GitGraph;
