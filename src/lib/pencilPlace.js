// Where a pencil note goes. One helper for every note: a note has a TARGET element, and it goes in the
// nearest free margin beside it (right, then left, then below), a short fixed gap away, with its arrow
// ending exactly on the target's edge. All numbers come from bounding boxes, nothing is hard-coded to a
// page. A note never lands on text, a button or another note; if nothing fits it goes below the target.
export const GAP = 28; // distance between the note and the target's edge (the arrow's length)
const MIN_W = 110; // narrowest a note may be squeezed to beside its target
const MAX_W = 220;
const EDGE = 8; // keep this far from the viewport edge, so a note never causes horizontal scroll
const PAD = 6; // breathing room kept around other content

// Things a note must not cover.
const OBSTACLES =
  "p,h1,h2,h3,h4,h5,h6,li,a,button,pre,code,td,th,img,input,label,dt,dd,summary,.manifest,.table,.stat,.panel,.rack,.follow,.tune-dial,.term-window,.summary-box,.pencil-abs";

export const docRect = (el) => {
  const r = el.getBoundingClientRect();
  return { left: r.left + window.scrollX, top: r.top + window.scrollY, right: r.right + window.scrollX, bottom: r.bottom + window.scrollY, width: r.width, height: r.height };
};

const hit = (a, b) => a.left < b.right + PAD && a.right > b.left - PAD && a.top < b.bottom + PAD && a.bottom > b.top - PAD;

// Rectangles of the things around `target` that a note at `box` could land on.
const obstaclesNear = (target, box, skip) => {
  const out = [];
  for (const el of document.querySelectorAll(OBSTACLES)) {
    if (el === skip || el === target || target.contains(el) || el.contains(target) || el.closest(".bg-layer, .sr-only")) continue;
    const r = docRect(el);
    if (r.width < 2 || r.height < 2 || r.bottom < box.top - 40 || r.top > box.bottom + 40) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
    out.push(r);
  }
  return out;
};

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// opts: { target: Element, anchorY?: number (page y the arrow should end at), belowX?: number (page x the
//   note lines up with when it goes below), prefer: ["right","left","below"], measure(w) -> height,
//   skip: the note's own element, others: rects of the other notes }
// Returns { side, x, y, w, h, arrow: { x, y } } (page coordinates) or null when the target is not showing.
export const placeNote = ({ target, anchorY, belowX, prefer, measure, skip, others = [] }) => {
  const t = docRect(target);
  if (t.width < 2 || t.height < 2) return null;
  const vw = document.documentElement.clientWidth;
  const ay = clamp(anchorY ?? t.top + 36, t.top + 6, Math.max(t.top + 6, t.bottom - 6));

  const sides = {
    right: () => {
      const x = t.right + GAP;
      const w = Math.min(MAX_W, vw - EDGE - x);
      if (w < MIN_W) return null;
      const h = measure(w);
      const y = clamp(ay - h / 2, t.top, Math.max(t.top, t.bottom - h));
      return { side: "right", x, y, w, h, arrow: { x: t.right, y: ay } };
    },
    left: () => {
      const w = Math.min(MAX_W, t.left - GAP - EDGE);
      if (w < MIN_W) return null;
      const h = measure(w);
      const y = clamp(ay - h / 2, t.top, Math.max(t.top, t.bottom - h));
      return { side: "left", x: t.left - GAP - w, y, w, h, arrow: { x: t.left, y: ay } };
    },
    below: () => {
      const x0 = clamp(belowX ?? t.left + 16, EDGE, vw - EDGE - MIN_W);
      const w = Math.min(260, vw - EDGE - x0);
      const h = measure(w);
      return { side: "below", x: x0, y: t.bottom + GAP, w, h, arrow: { x: clamp(x0 + 18, t.left + 6, t.right - 6), y: t.bottom } };
    },
  };

  for (const name of prefer) {
    const c = sides[name]();
    if (!c || name === "below") continue;
    const box = { left: c.x, top: c.y, right: c.x + c.w, bottom: c.y + c.h };
    if (obstaclesNear(target, box, skip).some((o) => hit(box, o))) continue;
    if (others.some((o) => hit(box, o))) continue;
    return c;
  }
  return sides.below();
};
