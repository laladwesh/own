import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { repos } from "../lib/data";
import { slug } from "../lib/util.js";
import SectionHeading from "./SectionHeading";

const PAGE = 10;

const day = (iso) => iso?.slice(0, 10) ?? "";

const Detail = ({ repo, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stack = repo.techStack;

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label={repo.name}>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal-panel">
        <div className="modal-head">
          <p className="describe-cmd">$ docker inspect {repo.name}</p>
          <button type="button" className="btn" onClick={onClose} aria-label="Close">
            close
          </button>
        </div>
        <h3 className="sub-heading">{repo.name}</h3>
        <p className="modal-meta">
          {repo.category} / {repo.language ?? "n/a"} / updated {day(repo.updatedAt)} / {repo.stars} stars / {repo.forks} forks
        </p>
        <p className="modal-text">{repo.summary || repo.description}</p>
        {repo.highlights?.length > 0 && (
          <ul className="modal-list">
            {repo.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
        {stack.length > 0 && <p className="modal-meta">stack: {stack.join(", ")}</p>}
        <p className="modal-links">
          <a href={repo.url} target="_blank" rel="noopener noreferrer">
            repo
          </a>
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
              homepage
            </a>
          )}
        </p>
      </div>
    </div>,
    document.body
  );
};

const Images = () => {
  const categories = useMemo(() => [...new Set(repos.map((r) => r.category))].sort(), []);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  const filtered = filter === "all" ? repos : repos.filter((r) => r.category === filter);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);

  return (
    <section id="images" className="section">
      <SectionHeading command="$ docker images" title="Repositories" />
      <div className="chips" role="group" aria-label="Filter by category">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            className="chip"
            aria-pressed={filter === c}
            onClick={() => {
              setFilter(c);
              setPage(1);
            }}
          >
            {c === "all" ? "--all" : `--filter category=${slug(c)}`}
          </button>
        ))}
      </div>

      <div className="table table--images" role="table" aria-label="Repositories">
        <div className="table-head" role="row">
          <span role="columnheader">REPOSITORY</span>
          <span role="columnheader">LANGUAGE</span>
          <span role="columnheader">CATEGORY</span>
          <span role="columnheader">UPDATED</span>
        </div>
        {slice.map((r) => (
          <div key={r.fullName} className="table-row" role="row">
            <span role="cell">
              <button type="button" className="row-name" onClick={() => setDetail(r)}>
                {r.name}
              </button>
            </span>
            <span role="cell">{r.language ?? "-"}</span>
            <span role="cell">{r.category}</span>
            <span role="cell">{day(r.updatedAt)}</span>
          </div>
        ))}
        {/* Empty rows keep the table the same height on every page and filter. */}
        {Array.from({ length: PAGE - slice.length }, (_, i) => (
          <div key={`pad-${i}`} className="table-row table-row--pad" role="presentation" aria-hidden="true">
            <span>&nbsp;</span>
            <span>&nbsp;</span>
            <span>&nbsp;</span>
            <span>&nbsp;</span>
          </div>
        ))}
      </div>

      <div className="pager">
        <button type="button" className="btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          prev
        </button>
        <span className="term-muted">
          page {page} / {pages} ({filtered.length} repos)
        </span>
        <button type="button" className="btn" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
          next
        </button>
      </div>

      {detail && <Detail repo={detail} onClose={() => setDetail(null)} />}
    </section>
  );
};

export default Images;
