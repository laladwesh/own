import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { glossary, glossaryById } from "../constants/glossary";
import { useHuman } from "../view/store";

// Dotted underlines on technical words in "human" view, with a small popover that explains
// the word. The first use of each word in a section gets the underline; later ones stay plain.

// ───────────── matching ─────────────
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const variants = glossary.flatMap((g) => g.match.map((m) => ({ m, g })));
const LOOKUP = new Map(variants.map(({ m, g }) => [m.toLowerCase(), g]));
const RE = variants.length
  ? new RegExp(
      `(^|[^A-Za-z0-9_-])(${[...new Set(variants.map((v) => v.m))]
        .sort((a, b) => b.length - a.length)
        .map(esc)
        .join("|")})(?![A-Za-z0-9_-])`,
      "gi"
    )
  : null;

// ───────────── the popover (one at a time) ─────────────
let open = null; // { id, el, pinned }
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getOpen = () => open;

const show = (id, el, pinned) => {
  open = { id, el, pinned };
  emit();
};
let quiet = false; // moving focus back to a term must not open it again
const hide = (focusBack) => {
  const el = open?.el;
  open = null;
  emit();
  if (focusBack && el && document.contains(el)) {
    quiet = true;
    el.focus({ preventScroll: true });
    quiet = false;
  }
};

// Hover props for a control that names a glossary word (the "-o yaml" button): they open the same
// popover, in any tuning.
export const glossHover = (id) => ({
  onPointerEnter: (e) => e.pointerType === "mouse" && !open?.pinned && show(id, e.currentTarget, false),
  onPointerLeave: (e) => e.pointerType === "mouse" && open && !open.pinned && hide(false),
});

// ───────────── a term in the text ─────────────
const Term = ({ entry, children }) => {
  const cur = useSyncExternalStore(subscribe, getOpen);
  const ref = useRef(null);
  const isOpen = Boolean(cur) && cur.id === entry.id && cur.el === ref.current;
  return (
    <button
      type="button"
      ref={ref}
      className="gloss"
      aria-expanded={isOpen}
      aria-describedby={isOpen ? "gloss-pop" : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (open?.el === ref.current && open.pinned) hide(false);
        else show(entry.id, ref.current, true);
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && !open?.pinned && show(entry.id, ref.current, false)}
      onPointerLeave={(e) => e.pointerType === "mouse" && open && !open.pinned && hide(false)}
      onFocus={() => !quiet && !open?.pinned && show(entry.id, ref.current, false)}
      onBlur={() => open && !open.pinned && open.el === ref.current && hide(false)}
    >
      {children}
    </button>
  );
};

// The one popover, mounted once in the app.
export const GlossHost = () => {
  const cur = useSyncExternalStore(subscribe, getOpen);
  const box = useRef(null);

  useEffect(() => {
    if (!cur) return undefined;
    const onKey = (e) => e.key === "Escape" && hide(true);
    const onDown = (e) => {
      if (box.current?.contains(e.target) || cur.el?.contains(e.target)) return;
      hide(false);
    };
    const onScroll = () => !cur.pinned && hide(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [cur]);

  if (!cur) return null;
  const entry = glossaryById[cur.id];
  const r = cur.el.getBoundingClientRect();
  const left = Math.min(Math.max(8, r.left), window.innerWidth - 8 - 300);
  const below = r.bottom + 8 + 150 < window.innerHeight;
  return (
    <div
      ref={box}
      id="gloss-pop"
      role="tooltip"
      className="gloss-pop"
      style={{ position: "fixed", left, top: below ? r.bottom + 8 : undefined, bottom: below ? undefined : window.innerHeight - r.top + 8 }}
    >
      <strong>{entry.term}</strong>
      <span>{entry.plain}</span>
      {entry.link && (
        <Link to={entry.link[1]} onClick={() => hide(false)}>
          see: {entry.link[0]} &rarr;
        </Link>
      )}
    </div>
  );
};

// ───────────── scope: "the first use in this section" ─────────────
const ScopeCtx = createContext(null);

// Wrap a section (or a page): each word is underlined in the first piece of text that uses it.
export const GlossScope = ({ children }) => {
  const seen = useRef(new Map()); // word id -> the text that claimed it
  return <ScopeCtx.Provider value={seen.current}>{children}</ScopeCtx.Provider>;
};

const glossify = (text, scope) => {
  if (typeof text !== "string" || !RE || !scope) return text;
  const out = [];
  const usedHere = new Set();
  let last = 0;
  let m;
  RE.lastIndex = 0;
  while ((m = RE.exec(text))) {
    const word = m[2];
    const start = m.index + m[1].length;
    const entry = LOOKUP.get(word.toLowerCase());
    if (!entry || usedHere.has(entry.id)) continue;
    const owner = scope.get(entry.id);
    if (owner !== undefined && owner !== text) continue; // already underlined earlier in this section
    scope.set(entry.id, text);
    usedHere.add(entry.id);
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <Term key={`${entry.id}-${start}`} entry={entry}>
        {word}
      </Term>
    );
    last = start + word.length;
  }
  if (!out.length) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
};

// Returns a function that underlines the technical words in a string (engineer view: unchanged).
export const useGloss = () => {
  const everyone = useHuman();
  const scope = useContext(ScopeCtx);
  return (text) => (everyone ? glossify(text, scope) : text);
};

export const Gloss = ({ text }) => {
  const g = useGloss();
  return <>{g(text)}</>;
};
