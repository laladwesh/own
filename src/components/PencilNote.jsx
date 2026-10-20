import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { notes } from "../constants/explain";
import { useGuide } from "../guide/store";
import { useHuman } from "../view/store";
import { GAP, docRect, placeNote } from "../lib/pencilPlace";

// A handwritten margin note, in plain-English mode only. It points at a TARGET element: the note is
// placed by one helper (lib/pencilPlace.js) in the nearest free margin beside the target, and its arrow
// ends exactly on the target's edge. It is re-placed whenever the page or the target moves or resizes.
// The note itself is drawn in a layer on the page (a portal), so it never changes the layout around it,
// except for the terminal's note, which reserves its own room when it has to sit below the terminal.
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let batch = 0; // notes that came into view together
let batchTimer = 0;
const nextDelay = () => {
  const d = batch * 400;
  batch += 1;
  clearTimeout(batchTimer);
  batchTimer = setTimeout(() => (batch = 0), 700);
  return d;
};

const placedRects = new Map(); // note id -> where it is now, so notes keep clear of each other

// What each note points at. `marker` is the empty element left where the note is declared.
const TARGETS = {
  terminal: () => ({
    el: document.querySelector(".term-window"),
    // the arrow ends at the input line's height, and below the terminal the note lines up with the input
    line: document.querySelector(".term-input-line"),
    prefer: ["right", "below"],
  }),
  status: (m) => ({ el: m.closest(".rack-wrap")?.querySelector(".rack"), prefer: ["right", "left", "below"] }),
  follow: (m) => ({ el: m.closest(".follow-wrap")?.querySelector(".follow"), prefer: ["right", "left", "below"] }),
  incident: (m) => ({ el: m.closest("article, .report")?.querySelector(".summary-box") ?? m.closest("article, .report"), prefer: ["right", "left", "below"] }),
};

// A section heading's note points at the block right after the heading (the first tall one).
const sectionTarget = (m) => {
  const header = m.closest("header");
  let next = header?.nextElementSibling;
  while (next && (next.classList.contains("at-home") || next.classList.contains("sh-sub") || next.getBoundingClientRect().height < 60)) next = next.nextElementSibling;
  return { el: next ?? header, prefer: ["right", "left", "below"] };
};

const PencilNote = ({ id }) => {
  const human = useHuman();
  const g = useGuide();
  const marker = useRef(null);
  const box = useRef(null);
  const [pos, setPos] = useState(null);
  const [state, setState] = useState(() => (reduced() ? "in" : "out"));
  const text = notes[id];
  const hidden = g.kind === "explain" && g.id === id;
  const on = human && Boolean(text) && !hidden;
  const isTerminal = id === "terminal";

  // ── placing the note, and keeping it placed ──
  useLayoutEffect(() => {
    const m = marker.current;
    if (!on || !m) {
      placedRects.delete(id);
      setPos(null);
      return undefined;
    }
    let raf = 0;
    let last = "";
    // When a note has to sit below its target it makes the room itself: a spacer after the target, so
    // the note never lands on whatever comes next.
    let spacer = null;
    const room = (target, need) => {
      if (need <= 0) {
        if (spacer) spacer.style.height = "0px";
        return;
      }
      if (!spacer) {
        spacer = document.createElement("div");
        spacer.setAttribute("aria-hidden", "true");
        spacer.className = "pencil-spacer";
      }
      if (spacer.previousElementSibling !== target) target.after(spacer);
      spacer.style.height = `${Math.round(need)}px`;
    };
    const measure = (w) => {
      const el = box.current;
      if (!el) return 40;
      el.style.width = `${w}px`;
      return el.offsetHeight;
    };
    const place = () => {
      const t = (TARGETS[id] ?? sectionTarget)(m);
      const el = box.current;
      if (!t.el || !el) {
        placedRects.delete(id);
        return "none";
      }
      const small = window.innerWidth < 640;
      const line = t.line && t.line.getBoundingClientRect().height > 0 ? docRect(t.line) : null;
      const others = [...placedRects.entries()].filter(([k]) => k !== id).map(([, r]) => r);
      const p = placeNote({
        target: t.el,
        anchorY: line ? line.top + line.height / 2 : undefined,
        belowX: line ? line.left : undefined,
        prefer: small ? ["below"] : t.prefer,
        measure,
        skip: el,
        others,
      });
      if (!p) {
        placedRects.delete(id);
        return "none";
      }
      placedRects.set(id, { left: p.x, top: p.y, right: p.x + p.w, bottom: p.y + p.h });
      if (!isTerminal) room(t.el, p.side === "below" ? p.h + GAP + 14 - (parseFloat(getComputedStyle(t.el).marginBottom) || 0) : 0);
      const sig = [p.side, Math.round(p.x), Math.round(p.y), Math.round(p.w), Math.round(p.arrow.x), Math.round(p.arrow.y)].join();
      setPos((old) => (old && old.sig === sig ? old : { ...p, sig }));
      return sig;
    };
    // layout can move for a moment (the terminal opens, a heading's font loads): keep checking until it settles
    const settle = () => {
      cancelAnimationFrame(raf);
      let still = 0;
      const tick = () => {
        const sig = place();
        still = sig === last ? still + 1 : 0;
        last = sig;
        if (still < 12) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    settle();
    window.addEventListener("resize", settle);
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(settle);
    ro?.observe(document.body);
    const t0 = (TARGETS[id] ?? sectionTarget)(m);
    if (t0.el) ro?.observe(t0.el);
    // the terminal is dragged, resized, minimised or closed through inline styles and class changes
    const hero = isTerminal ? m.closest(".term-hero") : null;
    const mo = hero ? new MutationObserver(settle) : null;
    mo?.observe(hero, { attributes: true, attributeFilter: ["style", "class"], childList: true, subtree: true });
    document.fonts?.ready.then(settle);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", settle);
      ro?.disconnect();
      mo?.disconnect();
      spacer?.remove();
      placedRects.delete(id);
    };
  }, [on, id, isTerminal]);

  // ── the pencil strokes: drawn when the target first comes on screen ──
  useEffect(() => {
    if (!on) {
      if (!reduced()) setState("out");
      return undefined;
    }
    if (reduced()) {
      setState("in");
      return undefined;
    }
    const el = marker.current?.parentElement;
    if (!pos || typeof IntersectionObserver === "undefined" || !el) {
      return undefined;
    }
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timer = setTimeout(() => setState("in"), nextDelay());
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [on, Boolean(pos)]); // eslint-disable-line react-hooks/exhaustive-deps

  // where the arrow sits inside the note, and which way it points
  let arrow = null;
  if (pos) {
    const cy = pos.arrow.y - pos.y;
    const cx = pos.arrow.x - pos.x;
    if (pos.side === "right") arrow = { left: -GAP / 2 - GAP / 2, top: cy - 10, rot: "scaleX(-1)" };
    else if (pos.side === "left") arrow = { left: pos.w + GAP / 2 - GAP / 2, top: cy - 10, rot: "none" };
    else arrow = { left: cx - GAP / 2, top: -GAP / 2 - 10, rot: "rotate(-90deg)" };
  }

  // The terminal's note reserves room under the terminal when it has to sit there.
  const reserve = isTerminal && on && pos?.side === "below" ? pos.h + GAP + 6 : 0;

  return (
    <>
      <span ref={marker} className="pencil-anchor" aria-hidden="true" style={{ height: reserve }} />
      {on &&
        createPortal(
          <aside
            ref={box}
            className="pencil pencil-abs"
            data-state={state}
            data-note={id}
            data-side={pos?.side}
            role="note"
            style={pos ? { left: pos.x, top: pos.y, width: pos.w } : { left: 0, top: 0, visibility: "hidden" }}
          >
            {arrow && (
              <svg className="pencil-arrow" viewBox="0 0 28 20" aria-hidden="true" style={{ left: arrow.left, top: arrow.top, transform: arrow.rot }}>
                <path pathLength="1" d="M2 12 C9 3 18 17 26 9 M20 5 L26.5 9 L21 13.5" />
              </svg>
            )}
            <span className="pencil-text">
              <span className="sr-only">note: </span>
              {text}
            </span>
          </aside>,
          document.body
        )}
    </>
  );
};

export default PencilNote;
