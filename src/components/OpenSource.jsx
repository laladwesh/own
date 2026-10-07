import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getJson } from "../lib/api";
import SectionHeading from "./SectionHeading";

const day = (iso) => iso?.slice(0, 10) ?? "";
const state = (s) => (s === "MERGED" ? "merged" : "open");
const n = (v) => v.toLocaleString("en-US");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Everything shown here is counted from the pull requests the proxy returns. Nothing is made up.
const summarize = (prs) => {
  const byRepo = new Map();
  const byMonth = new Map();
  for (const p of prs) {
    const key = `${p.organization}/${p.repo}`;
    if (!byRepo.has(key)) byRepo.set(key, { key, org: p.organization, repo: p.repo, prs: [] });
    byRepo.get(key).prs.push(p);
    const m = p.createdAt.slice(0, 7);
    byMonth.set(m, (byMonth.get(m) ?? 0) + 1);
  }

  const repos = [...byRepo.values()]
    .map((r) => {
      const sorted = [...r.prs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return {
        ...r,
        prs: sorted,
        merged: sorted.filter((p) => p.status === "MERGED").length,
        added: sorted.reduce((s, p) => s + p.linesAdded, 0),
        deleted: sorted.reduce((s, p) => s + p.linesDeleted, 0),
        first: day(sorted[sorted.length - 1].createdAt),
        last: day(sorted[0].createdAt),
      };
    })
    .sort((a, b) => (a.last < b.last ? 1 : -1));

  // Every month from the first PR to the last, so quiet months show as gaps.
  const keys = [...byMonth.keys()].sort();
  const months = [];
  if (keys.length) {
    let [y, m] = keys[0].split("-").map(Number);
    const [ly, lm] = keys[keys.length - 1].split("-").map(Number);
    while (y < ly || (y === ly && m <= lm)) {
      const k = `${y}-${String(m).padStart(2, "0")}`;
      months.push({ key: k, year: y, month: m, count: byMonth.get(k) ?? 0 });
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
  }

  const recent = [...prs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);
  return {
    total: prs.length,
    merged: prs.filter((p) => p.status === "MERGED").length,
    orgs: new Set(prs.map((p) => p.organization)).size,
    repos,
    months,
    recent,
    added: repos.reduce((s, r) => s + r.added, 0),
    deleted: repos.reduce((s, r) => s + r.deleted, 0),
    since: keys[0] ?? "",
  };
};

const Stat = ({ label, value, sub }) => (
  <div className="panel">
    <p className="panel-label">{label}</p>
    <p className="panel-number">{value}</p>
    {sub && <p className="panel-sub">{sub}</p>}
  </div>
);

// Pull requests per month: plain ink bars, each labelled with its count.
const Activity = ({ months }) => {
  const W = 760;
  const H = 150;
  const base = 120;
  const top = 18;
  const step = W / months.length;
  const bar = Math.max(6, step - 6);
  const max = Math.max(...months.map((m) => m.count), 1);
  const peak = months.reduce((a, b) => (b.count > a.count ? b : a), months[0]);
  const label = `Pull requests per month, ${months[0].key} to ${months[months.length - 1].key}. Busiest month: ${peak.key} with ${peak.count}.`;

  return (
    <figure className="os-chart">
      <div className="os-chart-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="os-chart-svg" role="img" aria-label={label}>
          <line x1="0" x2={W} y1={base + 0.5} y2={base + 0.5} stroke="var(--text)" strokeWidth="1" />
          {months.map((m, i) => {
            const h = m.count ? Math.max(2, (m.count / max) * (base - top)) : 0;
            const x = i * step + (step - bar) / 2;
            return (
              <g key={m.key}>
                <title>{`${m.key}: ${m.count} pull request${m.count === 1 ? "" : "s"}`}</title>
                {h > 0 && <rect x={x} y={base - h} width={bar} height={h} fill="var(--text)" />}
                {m.count > 0 && (
                  <text x={x + bar / 2} y={base - h - 5} textAnchor="middle" fontSize="11" fill="var(--muted)">
                    {m.count}
                  </text>
                )}
                {m.month % 3 === 1 && (
                  <text x={x + bar / 2} y={base + 18} textAnchor="middle" fontSize="11" fill="var(--muted)">
                    {`${MONTHS[m.month - 1]} ${String(m.year).slice(2)}`}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="panel-sub">Pull requests per month, counted from the pull requests below.</figcaption>
    </figure>
  );
};

const RepoCard = ({ repo, onOpen }) => {
  const total = repo.added + repo.deleted || 1;
  return (
    <button type="button" className="os-card" onClick={onOpen}>
      <span className="os-card-org">{repo.org}</span>
      <span className="os-card-name">{repo.repo}</span>
      <span className="os-card-meta">
        {repo.merged} merged{repo.prs.length - repo.merged ? `, ${repo.prs.length - repo.merged} open` : ""}
      </span>
      <span className="os-diff" role="img" aria-label={`${n(repo.added)} lines added, ${n(repo.deleted)} removed`}>
        <span className="os-diff-add" style={{ width: `${(repo.added / total) * 100}%` }} />
      </span>
      <span className="os-card-meta">
        +{n(repo.added)} / -{n(repo.deleted)}
      </span>
      <span className="os-card-meta">
        {repo.first === repo.last ? repo.first : `${repo.first} to ${repo.last}`}
      </span>
    </button>
  );
};

// The newest pull requests as a git log: one rail, one node each.
const RecentLog = ({ prs }) => (
  <ol className="os-log">
    {prs.map((p) => (
      <li key={p.id} className="os-log-row">
        <span className="os-log-node" aria-hidden="true" />
        <div className="os-log-body">
          <a href={p.link} target="_blank" rel="noopener noreferrer" className="os-log-title">
            {p.title}
          </a>
          <p className="os-log-meta">
            {p.organization}/{p.repo} #{p.number} / {state(p.status)} / {day(p.createdAt)} / +{n(p.linesAdded)} -{n(p.linesDeleted)}
          </p>
        </div>
      </li>
    ))}
  </ol>
);

const RepoModal = ({ repo, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label={repo.repo}>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal-panel modal-panel--wide">
        <div className="modal-head">
          <p className="describe-cmd">$ git log --oneline {repo.repo}</p>
          <button type="button" className="btn" onClick={onClose} aria-label="Close">
            close
          </button>
        </div>
        <h3 className="sub-heading">
          {repo.org}/{repo.repo}
        </h3>
        <div className="table table--prs" role="table" aria-label="Pull requests">
          <div className="table-head" role="row">
            <span role="columnheader">PR</span>
            <span role="columnheader">TITLE</span>
            <span role="columnheader">STATE</span>
            <span role="columnheader">DATE</span>
            <span role="columnheader">DIFF</span>
          </div>
          {repo.prs.map((p) => (
            <div key={p.id} className="table-row" role="row">
              <span role="cell">#{p.number}</span>
              <span role="cell">
                <a href={p.link} target="_blank" rel="noopener noreferrer">
                  {p.title}
                </a>
              </span>
              <span role="cell">{state(p.status)}</span>
              <span role="cell">{day(p.createdAt)}</span>
              <span role="cell">
                +{p.linesAdded} -{p.linesDeleted}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

const OpenSource = () => {
  const [prs, setPrs] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let live = true;
    setError(false);
    getJson("/api/github/prs")
      .then((d) => live && setPrs(d.prs))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [attempt]);

  const s = useMemo(() => (prs?.length ? summarize(prs) : null), [prs]);

  return (
    <section id="openSource" className="section">
      <SectionHeading command="$ git log --graph --oneline" title="Open Source" />

      {error ? (
        <p className="section-note">
          Could not load pull requests from the GitHub proxy right now.{" "}
          <button type="button" className="term-run" onClick={() => setAttempt((a) => a + 1)}>
            try again
          </button>
        </p>
      ) : prs === null ? (
        <p className="section-note">Loading pull requests…</p>
      ) : !s ? (
        <p className="section-note">No pull requests found.</p>
      ) : (
        <>
          <p className="section-note">
            Pull requests across {s.orgs} organisations, from {s.since} to now.
          </p>

          <div className="panels os-stats">
            <Stat label="Pull requests" value={n(s.total)} sub={`${n(s.merged)} merged`} />
            <Stat label="Repositories" value={s.repos.length} />
            <Stat label="Organisations" value={s.orgs} />
            <Stat label="Lines added" value={n(s.added)} />
            <Stat label="Lines removed" value={n(s.deleted)} />
          </div>

          {s.months.length > 1 && <Activity months={s.months} />}

          <h3 className="sub-heading os-sub">Repositories</h3>
          <div className="os-cards">
            {s.repos.map((r) => (
              <RepoCard key={r.key} repo={r} onOpen={() => setOpen(r)} />
            ))}
          </div>

          <h3 className="sub-heading os-sub">Latest</h3>
          <RecentLog prs={s.recent} />
        </>
      )}

      {open && <RepoModal repo={open} onClose={() => setOpen(null)} />}
    </section>
  );
};

export default OpenSource;
