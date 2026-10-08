import { useEffect, useRef, useState } from "react";
import { barText } from "./ui.jsx";

// Output for the joke commands. Every one of these is skippable with any key, and shows its final
// text at once when the visitor prefers reduced motion.

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useSkip = (onSkip) => {
  useEffect(() => {
    window.addEventListener("keydown", onSkip);
    return () => window.removeEventListener("keydown", onSkip);
  }, [onSkip]);
};

// Lines that appear at set times: [{ at: ms, node }]. `kill -9 bugs`, `ping google.com`, ...
export const Timeline = ({ items }) => {
  const [shown, setShown] = useState(() => (reducedMotion() ? items.length : 0));

  useEffect(() => {
    if (shown >= items.length) return undefined;
    const timers = items.map((it, i) => setTimeout(() => setShown((n) => Math.max(n, i + 1)), it.at));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useSkip(() => setShown(items.length));

  return (
    <>
      {items.slice(0, shown).map((it, i) => (
        <div key={i} className="term-out-line">
          {it.node}
        </div>
      ))}
    </>
  );
};

// A drawing that crosses the terminal from left to right in `ms`, then gives way to `after`.
export const Mover = ({ art, ms = 2000, after }) => {
  const [done, setDone] = useState(reducedMotion);
  const lane = useRef(null);
  const sprite = useRef(null);

  useEffect(() => {
    if (done || !lane.current || !sprite.current) return undefined;
    const from = -sprite.current.offsetWidth;
    const to = lane.current.clientWidth;
    const t0 = performance.now();
    let raf = 0;
    const frame = (now) => {
      const t = Math.min((now - t0) / ms, 1);
      sprite.current.style.transform = `translateX(${Math.round(from + (to - from) * t)}px)`;
      if (t < 1) raf = requestAnimationFrame(frame);
      else setDone(true);
    };
    sprite.current.style.transform = `translateX(${from}px)`;
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [done, ms]);

  useSkip(() => setDone(true));

  if (done) return <div className="term-out-line">{after}</div>;
  return (
    <div>
      <div className="fun-lane" ref={lane} aria-hidden="true">
        <pre className="fun-sprite" ref={sprite}>
          {art}
        </pre>
      </div>
    </div>
  );
};

// ───────────── make chai ─────────────
const STEPS = ["boiling water", "adding patti", "adding adrak", "adding milk"];
const TOTAL_MS = 2000;
const WIDTH = 10;

const cup = (fill, ready) => {
  const liquid = "~".repeat(WIDTH);
  const empty = " ".repeat(WIDTH);
  const row = (i, tail) => `  |${fill > 2 - i ? liquid : empty}|${tail}`;
  return [
    ready ? "     ) ) )" : "           ",
    ready ? "    ( ( (" : "           ",
    `  .${"-".repeat(WIDTH)}.`,
    row(0, "-."),
    row(1, " |"),
    row(2, "-'"),
    `  '${"-".repeat(WIDTH)}'`,
    ` \\${"_".repeat(WIDTH + 2)}/`,
  ].join("\n");
};

// A small cup that fills while the steps tick by. About 2s; any key finishes it.
export const Chai = () => {
  const [p, setP] = useState(() => (reducedMotion() ? 1 : 0));

  useEffect(() => {
    if (p >= 1) return undefined;
    const id = setInterval(() => setP((v) => Math.min(1, v + 40 / TOTAL_MS)), 40);
    return () => clearInterval(id);
  }, [p >= 1]); // eslint-disable-line react-hooks/exhaustive-deps

  useSkip(() => setP(1));

  const ready = p >= 1;
  const step = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
  const within = (p * STEPS.length - step) * 100;
  const fill = Math.min(3, Math.floor(p * 3.6));

  return (
    <div>
      <pre className="fun-cup">{cup(fill, ready)}</pre>
      {STEPS.slice(0, ready ? STEPS.length : step).map((s) => (
        <div key={s} className="term-out-line">
          [ok] {s}
        </div>
      ))}
      {!ready && (
        <div className="term-out-line">
          {barText(within)}  {STEPS[step]}...
        </div>
      )}
      {ready && (
        <div className="term-out-line">
          <strong className="term-strong">chai ready.</strong>
        </div>
      )}
    </div>
  );
};

export const SL_ART = [
  "      o",
  "     o   ___",
  "   _____|___|______  ____________",
  "  |  []   [] []    ||  [] [] [] |",
  "  |_______________ ||___________|=>",
  "   (o)(o)(o)       (o)(o)(o)(o)",
].join("\n");

export const CAR_ART = ["   vroom", "     ____", "  __/_||_\\__", " '-(o)----(o)-'"].join("\n");
