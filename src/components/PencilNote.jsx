import { useEffect, useRef, useState } from "react";
import { notes } from "../constants/explain";
import { useGuide } from "../guide/store";
import { useHuman } from "../view/store";

// A handwritten margin note, in human tuning only. Its arrow is drawn and its words fade in when
// it comes on screen; notes that appear together are staggered about 400ms apart. One note per
// block, and it steps aside while that block's "?" bubble is open.
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

const PencilNote = ({ id, side = false, hero = false }) => {
  const human = useHuman();
  const g = useGuide();
  const ref = useRef(null);
  const [state, setState] = useState(() => (reduced() ? "in" : "out"));
  const text = notes[id];
  const hidden = g.kind === "explain" && g.id === id;

  useEffect(() => {
    if (!human || !text) {
      if (!reduced()) setState("out");
      return undefined;
    }
    if (reduced()) {
      setState("in");
      return undefined;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setState("in");
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
  }, [human, text]);

  if (!human || !text || hidden) return null;
  return (
    <aside ref={ref} className={`pencil${side ? " pencil--side" : ""}${hero ? " pencil--hero" : ""}`} data-state={state} role="note">
      <svg className="pencil-arrow" viewBox="0 0 64 42" aria-hidden="true">
        <path pathLength="1" d="M58 3 C52 8 49 15 41 19 S24 28 12 34 M12 34 L21 33.5 M12 34 L15.5 26" />
      </svg>
      <span className="pencil-text">
        <span className="sr-only">note: </span>
        {text}
      </span>
    </aside>
  );
};

export default PencilNote;
