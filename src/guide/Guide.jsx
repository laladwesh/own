import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Tty from "./Tty";
import { setBlockView, useBlockViewOf } from "./blocks";
import { explain } from "../constants/explain";
import { tourEnd, tourSteps } from "../constants/guideTour";
import { getTune, setTune } from "../view/store";
import { getGuide, guide, useGuide } from "./store";
import { ghLink } from "../lib/follow";

// The guide: a speech bubble with tty (a tiny CRT monitor) docked in the top-left corner. The bubble
// text types in, tty "talks" while it does, and a bubble opened from a "?" appears beside it
// (right, then below, then left) so it never covers the block it explains. On touch screens, or
// with reduced motion, the same bubble shows as a bottom sheet.

const OFFER_KEY = "guide-offered"; // localStorage: the offer is made once, ever
const DECLINED_KEY = "guide-declined"; // sessionStorage: "I'm an engineer"
const EDGE = 8;
const TYPE_MS = 15; // per character

const flag = (store, key) => {
  try {
    return window[store].getItem(key) === "1";
  } catch {
    return false;
  }
};
const setFlag = (store, key) => {
  try {
    window[store].setItem(key, "1");
  } catch {
    /* blocked storage: the flag then lasts for this page only */
  }
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// "bubble" (floating beside the thing it explains) on a desktop with a mouse, "sheet" elsewhere.
const useLayout = () => {
  const get = () =>
    window.matchMedia("(pointer: fine) and (hover: hover)").matches &&
    !reducedMotion() &&
    window.matchMedia("(min-width: 600px)").matches
      ? "bubble"
      : "sheet";
  const [layout, setLayout] = useState(get);
  useEffect(() => {
    const qs = ["(pointer: fine) and (hover: hover)", "(prefers-reduced-motion: reduce)", "(min-width: 600px)"].map((q) => window.matchMedia(q));
    const on = () => setLayout(get());
    qs.forEach((q) => q.addEventListener("change", on));
    return () => qs.forEach((q) => q.removeEventListener("change", on));
  }, []);
  return layout;
};

// The text types in quickly; any key or click finishes it. With reduced motion it is just there.
const useTyped = (text) => {
  const [n, setN] = useState(() => (reducedMotion() ? text.length : 0));
  useEffect(() => {
    if (reducedMotion()) {
      setN(text.length);
      return undefined;
    }
    setN(0);
    let i = 0;
    const t0 = performance.now();
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, TYPE_MS);
    const skip = (e) => {
      if (e.timeStamp < t0) return; // the event that opened the bubble
      clearInterval(id);
      setN(text.length);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [text]);
  return { shown: text.slice(0, n), typing: n < text.length };
};

// ───────────── where the bubble goes (page coordinates) ─────────────
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));

// A small thing with a block under it (a "?" button): right of it, then below, then left. On the
// right and left the bubble grows upward from the button, so it stays off the block.
const placeBeside = (r, bw, bh) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sx = window.scrollX;
  const sy = window.scrollY;
  const top = clamp(r.bottom - bh, EDGE, vh - bh - EDGE);
  if (r.right + 12 + bw <= vw - EDGE) return { x: sx + r.right + 12, y: sy + top };
  if (r.bottom + 8 + bh <= vh - EDGE) return { x: sx + clamp(r.left, EDGE, vw - bw - EDGE), y: sy + r.bottom + 8 };
  if (r.left - 12 - bw >= EDGE) return { x: sx + r.left - 12 - bw, y: sy + top };
  return { x: sx + clamp(r.left, EDGE, vw - bw - EDGE), y: sy + r.bottom + 8 };
};

// The dial that is on screen: the big one beside the terminal, or the compact one under it.
const dialEl = () => [...document.querySelectorAll(".tune-dial")].find((el) => el.getBoundingClientRect().width > 0) ?? null;

// Above the big dial, below the compact one: either way clear of the terminal's input line.
const placeDial = (el, bw, bh) => {
  const vw = window.innerWidth;
  const sx = window.scrollX;
  const sy = window.scrollY;
  const r = el.getBoundingClientRect();
  const x = sx + clamp(r.left, EDGE, vw - bw - EDGE);
  if (el.classList.contains("tune-dial--compact")) return { x, y: sy + r.bottom + 8 };
  return { x, y: sy + Math.max(EDGE, r.top - 8 - bh) };
};

// A tour stop: a big thing (the terminal) gets the bubble beside it, a heading gets it to the right
// of the title; with no target (the end card) it sits in the corner.
const placeTour = (el, bw, bh) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sx = window.scrollX;
  const sy = window.scrollY;
  if (!el) return { x: sx + Math.max(EDGE, vw - 16 - bw), y: sy + Math.max(16, vh - 16 - bh) };
  const r = el.getBoundingClientRect();
  if (r.height > 240) {
    if (vw - r.right >= bw + 16) return { x: sx + r.right + 12, y: sy + r.top + 40 };
    if (r.left >= bw + 16) return { x: sx + r.left - bw - 12, y: sy + r.top + 40 };
    return { x: sx + Math.max(EDGE, r.right - bw - 8), y: sy + r.top + 56 };
  }
  return { x: sx + clamp(r.left + 380, EDGE, vw - bw - EDGE), y: sy + Math.max(EDGE, r.top + 4) };
};

const Guide = () => {
  const g = useGuide();
  const layout = useLayout();
  const navigate = useNavigate();
  const loc = useLocation();
  const rootRef = useRef(null);
  const boxRef = useRef(null);
  const btn = useRef(null);
  const [anchor, setAnchor] = useState(null); // the element a tour step points at
  const [pos, setPos] = useState(null);
  const [hop, setHop] = useState(0);
  const blockMode = useBlockViewOf(g.kind === "explain" ? g.id : null);

  const close = useCallback(() => guide.close(), []);

  // ── the first-visit offer: once, about 4 seconds after the homepage opens ──
  useEffect(() => {
    if (loc.pathname !== "/") return undefined;
    // A link that already says how to tune the site (?tune= or ?view=) gets no offer.
    const q = new URLSearchParams(window.location.search);
    if (q.has("tune") || q.has("view")) return undefined;
    if (getTune() === "human" || flag("localStorage", OFFER_KEY) || flag("sessionStorage", DECLINED_KEY)) return undefined;
    const t = setTimeout(() => {
      if (getGuide().kind) return;
      guide.openOffer();
      setFlag("localStorage", OFFER_KEY);
    }, 4000);
    return () => clearTimeout(t);
  }, [loc.pathname]);

  // ── the tour: go to the step's page, scroll to its heading, then point at it ──
  useEffect(() => {
    if (g.kind !== "tour" || g.step >= tourSteps.length) {
      setAnchor(null);
      return undefined;
    }
    const s = tourSteps[g.step];
    let dead = false;
    let tries = 0;
    let timer = 0;
    setAnchor(null);
    if (window.location.pathname !== s.path) navigate(s.path);
    const find = () => {
      if (dead) return;
      const el = document.querySelector(s.sel);
      if (el) {
        const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 140);
        window.scrollTo({ top, behavior: reducedMotion() ? "auto" : "smooth" });
        timer = setTimeout(() => !dead && setAnchor(el), reducedMotion() ? 0 : 650);
      } else if (tries++ < 40) timer = setTimeout(find, 100);
    };
    timer = setTimeout(find, 60);
    return () => {
      dead = true;
      clearTimeout(timer);
    };
  }, [g.kind, g.step, navigate]);

  // ── what it says, and the buttons ──
  let text = "";
  let meta = "";
  let buttons = [];
  if (g.kind === "offer") {
    text = "Can't read YAML? Switch the reading mode to plain English.";
    buttons = [
      ["Plain English, please", () => (setTune("human"), guide.openTourOffer())],
      ["Keep it technical", () => (setFlag("sessionStorage", DECLINED_KEY), close())],
    ];
  } else if (g.kind === "tourOffer") {
    text = "Need a tour?";
    buttons = [
      ["Start the tour", () => guide.startTour()],
      ["Not now", close],
    ];
  } else if (g.kind === "explain") {
    const e = explain[g.id];
    text = e?.text ?? "";
    // The main button follows what the block shows right now, and flips as soon as it is pressed.
    // Blocks with only one form have no toggle.
    if (e?.simple) {
      const simple = blockMode === "wide";
      buttons.push([
        simple ? "Show technical version" : "Show simple view",
        () => {
          setBlockView(g.id, simple ? "yaml" : "wide");
          setHop((h) => h + 1);
        },
      ]);
    }
    buttons.push(["Got it", close]);
  } else if (g.kind === "closing") {
    text = g.text;
    buttons = [["Close", close]];
  } else if (g.kind === "tour") {
    if (g.step >= tourSteps.length) {
      text = tourEnd;
      buttons = [
        ["Contact", () => (close(), navigate({ pathname: "/", hash: "#contact" }))],
        ["Close", close],
      ];
    } else {
      text = tourSteps[g.step].text;
      meta = `${g.step + 1}/${tourSteps.length}`;
      buttons = [
        ...(g.step > 0 ? [["Back", () => guide.tourTo(g.step - 1)]] : []),
        ["Next", () => guide.tourTo(g.step + 1)],
        ["End tour", close],
      ];
    }
  }
  // After the tour and after a replay, one more line: a plain link to my GitHub profile.
  const invite = g.kind === "closing" || (g.kind === "tour" && g.step >= tourSteps.length);
  const { shown, typing } = useTyped(text);

  // ── where the bubble stands, once it has a size ──
  const atDial = g.kind === "offer" || g.kind === "tourOffer";
  const target = g.kind === "explain" ? g.anchor : g.kind === "tour" ? anchor : atDial ? dialEl() : null;
  useLayoutEffect(() => {
    if (!g.kind || layout !== "bubble" || !boxRef.current) return undefined;
    const go = () => {
      const box = boxRef.current;
      if (!box) return;
      const bw = box.offsetWidth;
      const bh = box.offsetHeight;
      // Between two tour steps the bubble stays where it is until the next heading is in view.
      if (g.kind === "tour" && g.step < tourSteps.length && !target) return;
      if (g.kind === "explain" && target) setPos(placeBeside(target.getBoundingClientRect(), bw, bh));
      else if (atDial && target) setPos(placeDial(target, bw, bh));
      else setPos(placeTour(g.kind === "tour" ? target : null, bw, bh));
    };
    go();
    window.addEventListener("resize", go);
    return () => window.removeEventListener("resize", go);
  }, [g.kind, g.id, g.step, layout, target, atDial, text]);

  // ── keys, and a click anywhere else closes the offer and the "?" bubble ──
  useEffect(() => {
    if (!g.kind) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (g.kind === "tour" && !/input|textarea|select/i.test(e.target?.tagName ?? "")) {
        if (e.key === "ArrowRight" && g.step < tourSteps.length) guide.tourTo(g.step + 1);
        if (e.key === "ArrowLeft" && g.step > 0) guide.tourTo(g.step - 1);
      }
    };
    const onDown = (e) => {
      if (g.kind === "tour") return;
      if (rootRef.current?.contains(e.target) || e.target.closest?.(".explain-btn")) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [g.kind, g.step, close]);

  // Explain and tour take focus (so Enter and Tab work at once); the offer never does.
  useEffect(() => {
    if (g.kind === "explain" || g.kind === "tour" || g.kind === "tourOffer") btn.current?.focus({ preventScroll: true });
  }, [g.kind, g.id, g.step, anchor, pos]);

  if (!g.kind) return null;

  const body = (
    <>
      <span className="guide-avatar">
        <Tty talking={typing} boot={hop} />
      </span>
      <div className="guide-main">
        <p className="guide-text" aria-live="polite">
          <span className="sr-only">{text}</span>
          <span className="guide-text-size" aria-hidden="true">
            {text}
          </span>
          <span className="guide-text-typed" aria-hidden="true">
            {shown}
          </span>
        </p>
        {invite && (
          <p className="guide-follow">
            <a {...ghLink}>if you enjoyed that, follow me on GitHub &#8599;</a>
          </p>
        )}
        <div className="guide-actions">
          {meta && <span className="guide-meta">{meta}</span>}
          {buttons.map(([label, fn], i) => (
            <button
              key={label}
              type="button"
              className="guide-btn"
              ref={g.kind !== "offer" && i === (g.kind === "tour" && g.step > 0 ? 1 : 0) ? btn : undefined}
              onClick={fn}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const label = g.kind === "tour" ? "Guided tour" : "Guide";

  if (layout === "sheet") {
    return createPortal(
      <div ref={rootRef} className="guide guide-sheet" role="dialog" aria-label={label}>
        <div className="guide-card">{body}</div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={rootRef}
      className="guide guide-stage"
      role="dialog"
      aria-label={label}
      style={{ transform: pos ? `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px)` : undefined, visibility: pos ? "visible" : "hidden" }}
    >
      <div ref={boxRef} className="guide-bubble guide-card">
        {body}
      </div>
    </div>,
    document.body
  );
};

export default Guide;
