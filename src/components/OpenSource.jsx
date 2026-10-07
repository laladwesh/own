import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getJson } from "../lib/api";
import SectionHeading from "./SectionHeading";

const day = (iso) => iso?.slice(0, 10) ?? "";
const state = (s) => (s === "MERGED" ? "merged" : "open");

const RepoModal = ({ repo, prs, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label={repo}>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal-panel modal-panel--wide">
        <div className="modal-head">
          <p className="describe-cmd">$ git log --oneline {repo}</p>
          <button type="button" className="btn" onClick={onClose} aria-label="Close">
            close
          </button>
        </div>
        <h3 className="sub-heading">{prs[0].organization}/{repo}</h3>
        <div className="table table--prs" role="table" aria-label="Pull requests">
          <div className="table-head" role="row">
            <span role="columnheader">PR</span>
            <span role="columnheader">TITLE</span>
            <span role="columnheader">STATE</span>
            <span role="columnheader">DATE</span>
            <span role="columnheader">DIFF</span>
          </div>
          {prs.map((p) => (
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

// One branch of the graph per repository: newest PRs first.
const Branch = ({ org, repo, prs, onAll }) => {
  const merged = prs.filter((p) => p.status === "MERGED").length;
  const shown = prs.slice(0, 3);
  return (
    <div className="branch">
      <div className="graph-line">
        <span className="graph-glyph" aria-hidden="true">*</span>
        <button type="button" className="row-name" onClick={onAll}>
          {org}/{repo}
        </button>
        <span className="term-muted">
          {merged} merged{prs.length - merged ? `, ${prs.length - merged} open` : ""}
        </span>
      </div>
      {shown.map((p) => (
        <div key={p.id} className="graph-line">
          <span className="graph-glyph" aria-hidden="true">| *</span>
          <a href={p.link} target="_blank" rel="noopener noreferrer" className="graph-title">
            #{p.number} {p.title}
          </a>
          <span className="term-muted">
            [{state(p.status)}] {day(p.createdAt)}
          </span>
        </div>
      ))}
      {prs.length > shown.length && (
        <div className="graph-line">
          <span className="graph-glyph" aria-hidden="true">| </span>
          <button type="button" className="term-run" onClick={onAll}>
            ... {prs.length - shown.length} more
          </button>
        </div>
      )}
      <div className="graph-line" aria-hidden="true">
        <span className="graph-glyph">|/</span>
      </div>
    </div>
  );
};

const OpenSource = () => {
  const [prs, setPrs] = useState(null);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    let live = true;
    getJson("/api/github/prs")
      .then((d) => live && setPrs(d.prs))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, []);

  const grouped = (prs ?? []).reduce((acc, pr) => {
    const k = `${pr.organization}/${pr.repo}`;
    (acc[k] ||= []).push(pr);
    return acc;
  }, {});

  return (
    <section id="openSource" className="section">
      <SectionHeading command="$ git log --graph --oneline" title="Open Source" />
      {error ? (
        <p className="section-note">Could not load pull requests from the GitHub proxy right now. Try again in a minute.</p>
      ) : prs === null ? (
        <p className="section-note">Loading pull requests…</p>
      ) : prs.length === 0 ? (
        <p className="section-note">No pull requests found.</p>
      ) : (
        <div className="graph">
          {Object.entries(grouped).map(([key, list]) => {
            const [org, repo] = key.split("/");
            return <Branch key={key} org={org} repo={repo} prs={list} onAll={() => setModal({ repo, prs: list })} />;
          })}
        </div>
      )}
      {modal && <RepoModal repo={modal.repo} prs={modal.prs} onClose={() => setModal(null)} />}
    </section>
  );
};

export default OpenSource;
