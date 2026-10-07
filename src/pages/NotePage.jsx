import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../style";
import { Md } from "../components/Markdown";
import { notePath, notes } from "../lib/notes";
import { noteSeo } from "../lib/seo";
import { copyText } from "../lib/clipboard";
import { DRAFT_BANNER } from "../lib/drafts";
import { useSeo } from "../lib/useSeo";
import NotFound from "./NotFound";

const MetaItem = ({ label, children }) => (
  <div className="cs-meta-item">
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

const NoteView = ({ note, index }) => {
  const seo = useMemo(() => noteSeo(note), [note]);
  useSeo(seo);
  const [copied, setCopied] = useState("");
  const timer = useRef(0);

  const onCopy = async () => {
    const ok = await copyText(window.location.href);
    setCopied(ok ? "copied" : "copy failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(""), 2000);
  };

  const newer = notes[index - 1];
  const older = notes[index + 1];

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[112px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body`}>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">~</Link>/<Link to="/notes">notes</Link>/<span aria-current="page">{note.slug}.md</span>
        </nav>

        <div className="report-toolbar">
          <Link to="/notes" className="cs-back">
            &larr; all notes
          </Link>
          <span className="copy-wrap">
            <span className="copy-status" role="status" aria-live="polite">
              {copied}
            </span>
            <button type="button" className="btn copy-btn" onClick={onCopy}>
              copy link
            </button>
          </span>
        </div>

        <article className="report cs" aria-label={note.title}>
          {note.draft && (
            <p className="draft-banner" role="note">
              {DRAFT_BANNER}
            </p>
          )}
          <dl className="cs-meta cs-meta--note">
            <MetaItem label="DATE">{note.date}</MetaItem>
            <MetaItem label="READING TIME">{note.minutes} min</MetaItem>
            <MetaItem label="TAGS">{note.tags.join(", ")}</MetaItem>
          </dl>

          <h1 className="cs-title">{note.title}</h1>

          <div className="cs-body">
            <div className="cs-text">
              <Md text={note.body} />
            </div>
          </div>
        </article>

        <nav className="incident-nav" aria-label="More notes">
          <Link to="/notes">&larr; all notes</Link>
          <span className="incident-nav-step">
            {newer ? (
              <Link to={notePath(newer.slug)} rel="prev">
                &larr; {newer.title} (newer)
              </Link>
            ) : (
              <span className="term-muted">newest</span>
            )}
            {older ? (
              <Link to={notePath(older.slug)} rel="next">
                {older.title} (older) &rarr;
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

const NotePage = () => {
  const { slug = "" } = useParams();
  const index = notes.findIndex((n) => n.slug === slug);
  if (index < 0) return <NotFound />;
  return <NoteView key={notes[index].slug} note={notes[index]} index={index} />;
};

export default NotePage;
