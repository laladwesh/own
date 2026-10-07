import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "../style";
import SectionHeading from "../components/SectionHeading";
import { allTags, notePath, notes } from "../lib/notes";
import { NOTES_INTRO, notesIndexSeo } from "../lib/seo";
import { useSeo } from "../lib/useSeo";

const NotesIndex = () => {
  useSeo(notesIndexSeo);
  const [params, setParams] = useSearchParams();
  const tag = allTags.includes(params.get("tag")) ? params.get("tag") : "all";
  const shown = useMemo(() => (tag === "all" ? notes : notes.filter((n) => n.tags.includes(tag))), [tag]);

  const choose = (t) => setParams(t === "all" ? {} : { tag: t }, { replace: true });

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[128px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body`}>
        <SectionHeading as="h1" command="$ ls notes/" title="Notes" />
        <p className="page-intro">{NOTES_INTRO}</p>

        {allTags.length > 0 && (
          <div className="chips" role="group" aria-label="Filter by tag">
            {["all", ...allTags].map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => choose(t)}>
                {t === "all" ? "--all" : `--tag=${t}`}
              </button>
            ))}
          </div>
        )}

        <p className="section-note inc-count" aria-live="polite">
          {shown.length} {shown.length === 1 ? "note" : "notes"}, newest first.
        </p>

        {shown.length === 0 ? (
          <p className="section-note">No notes yet.</p>
        ) : (
          <ul className="incident-list">
            {shown.map((n) => (
              <li key={n.slug} className="incident">
                <Link to={notePath(n.slug)} className="note-row">
                  <span className="note-meta">
                    {n.date} / {n.minutes} min read
                    {n.draft && <span className="draft-tag">draft</span>}
                  </span>
                  <span className="note-title">{n.title}</span>
                  <span className="note-summary">{n.summary}</span>
                  <span className="note-tags">{n.tags.map((t) => `#${t}`).join("  ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="incident-more">
          <Link to="/">&larr; avinashgupta.in</Link>
        </p>
      </div>
    </main>
  );
};

export default NotesIndex;
