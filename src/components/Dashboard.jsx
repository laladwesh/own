import { useEffect, useMemo, useState } from "react";
import { getJson } from "../lib/api";
import { aboutMe, leetcodeUrl } from "../constants";
import SectionHeading from "./SectionHeading";

// ───────────── building blocks ─────────────
const Stat = ({ label, value, sub }) => (
  <div className="panel">
    <p className="panel-label">{label}</p>
    <p className="panel-number">{value ?? "-"}</p>
    {sub && <p className="panel-sub">{sub}</p>}
  </div>
);

// Heatmap from a contiguous list of days [{ date, count }]. Four ink levels.
const Heatmap = ({ days, caption }) => {
  const { weeks, max } = useMemo(() => {
    const cols = [];
    let col = [];
    days.forEach((d, i) => {
      const dow = new Date(`${d.date}T00:00:00`).getDay();
      if (i === 0) for (let k = 0; k < dow; k++) col.push(null);
      col.push(d);
      if (col.length === 7) {
        cols.push(col);
        col = [];
      }
    });
    if (col.length) cols.push(col);
    return { weeks: cols, max: Math.max(1, ...days.map((d) => d.count)) };
  }, [days]);

  const level = (c) => (c === 0 ? 0 : Math.min(4, Math.ceil((c / max) * 4)));

  return (
    <figure className="heatmap-wrap">
      <div className="heatmap" role="img" aria-label={caption}>
        {weeks.map((w, i) => (
          <div key={i} className="heat-col">
            {w.map((d, j) => (
              <span key={j} className="heat-cell" data-l={d ? level(d.count) : "x"} title={d ? `${d.date}: ${d.count}` : undefined} />
            ))}
          </div>
        ))}
      </div>
      <figcaption className="panel-sub">
        {caption} / less{" "}
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="heat-cell heat-cell--legend" data-l={l} />
        ))}{" "}
        more
      </figcaption>
    </figure>
  );
};

const streaks = (days) => {
  if (!days.length) return { current: null, longest: null };
  let i = days.length - 1;
  if (days[i].count === 0) i--;
  let current = 0;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return { current, longest };
};

// ───────────── GitHub ─────────────
const GitHubPanels = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    getJson("/api/github/stats")
      .then((d) => live && setData(d))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, []);

  const days = useMemo(
    () => (data?.weeks ?? []).flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))),
    [data]
  );
  const { current, longest } = streaks(days);

  return (
    <div className="dash-group">
      <h3 className="sub-heading">
        <a href={`https://github.com/${aboutMe.githubUsername}`} target="_blank" rel="noopener noreferrer">
          github / {aboutMe.githubUsername}
        </a>
      </h3>
      {error && <p className="section-note">GitHub numbers are unavailable right now (the GitHub proxy did not answer).</p>}
      <div className="panels">
        <Stat label="Public repos" value={data?.repos} />
        <Stat label="Stars earned" value={data?.stars} />
        <Stat label="Commits (YTD)" value={data?.commits} />
        <Stat label="Pull requests" value={data?.prs} />
        <Stat label="Issues opened" value={data?.issues} />
        <Stat label="Followers" value={data?.followers} />
        <Stat label="Current streak" value={current !== null ? `${current}d` : null} />
        <Stat label="Longest streak" value={longest !== null ? `${longest}d` : null} />
      </div>
      {days.length > 0 && (
        <div className="panel panel--wide">
          <p className="panel-label">Contribution heatmap / last 12 months / {data.totalContributions} contributions</p>
          <Heatmap days={days} caption="GitHub contributions" />
        </div>
      )}
      {data?.languages?.length > 0 && (
        <div className="panel panel--wide">
          <p className="panel-label">Language distribution</p>
          <ul className="bars">
            {data.languages.map((l) => (
              <li key={l.name}>
                <span>{l.name}</span>
                <span className="bar">
                  <span className="bar-fill" style={{ width: `${l.pct}%` }} />
                </span>
                <span className="term-muted">{l.pct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ───────────── LeetCode ─────────────
const buildDays = (raw) => {
  const map = {};
  Object.entries(raw || {}).forEach(([ts, count]) => {
    const key = new Date(parseInt(ts, 10) * 1000).toISOString().split("T")[0];
    map[key] = (map[key] || 0) + Number(count);
  });
  const today = new Date();
  const start = new Date(today);
  start.setFullYear(today.getFullYear() - 1);
  start.setDate(start.getDate() + 1);
  const out = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    out.push({ date: key, count: map[key] || 0 });
  }
  return out;
};

const LeetCodePanels = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    getJson("/api/leetcode/stats", { timeout: 5000 })
      .then((d) => live && setData(d))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, []);

  const days = useMemo(() => (data ? buildDays(data.submissionCalendar) : []), [data]);
  const longest = useMemo(() => Math.max(data?.streak ?? 0, streaks(days).longest ?? 0), [data, days]);
  const t = data?.totals;
  const s = data?.solved;

  return (
    <div className="dash-group">
      <h3 className="sub-heading">
        <a href={leetcodeUrl} target="_blank" rel="noopener noreferrer">
          leetcode / {data?.username ?? "profile"}
        </a>
      </h3>
      {error && <p className="section-note">LeetCode numbers are unavailable right now (the LeetCode proxy did not answer).</p>}
      <div className="panels">
        <Stat label="Solved" value={s?.all} sub={t?.all ? `of ${t.all}` : null} />
        <Stat label="Easy" value={s?.easy} sub={t?.easy ? `of ${t.easy}` : null} />
        <Stat label="Medium" value={s?.medium} sub={t?.medium ? `of ${t.medium}` : null} />
        <Stat label="Hard" value={s?.hard} sub={t?.hard ? `of ${t.hard}` : null} />
        <Stat label="Active days" value={data?.totalActiveDays} />
        <Stat label="Global rank" value={data?.ranking ? data.ranking.toLocaleString() : null} />
        <Stat label="Max streak" value={data ? `${longest}d` : null} />
      </div>
      {days.length > 0 && (
        <div className="panel panel--wide">
          <p className="panel-label">Submission heatmap / last 12 months</p>
          <Heatmap days={days} caption="LeetCode submissions" />
        </div>
      )}
    </div>
  );
};

const Dashboard = () => (
  <section id="dashboard" className="section">
    <SectionHeading command="$ open grafana/avinash" title="Dashboard" />
    <GitHubPanels />
    <LeetCodePanels />
  </section>
);

export default Dashboard;
