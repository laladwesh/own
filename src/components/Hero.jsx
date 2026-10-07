import { useEffect, useRef, useState } from "react";
import ScopeHud from "../scope/ScopeHud";
import Terminal from "./Terminal";

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
const ANIM_MS = 220;
const CHIPS = ["help", "neofetch", "git log", "kubectl get deployments", "ls projects", "scope wave square"];

const Hero = () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroRef = useRef(null);
  const wrapRef = useRef(null);
  const drag = useRef(null);
  const termRef = useRef(null);

  // open | closing | minimizing | closed | min
  const [win, setWin] = useState("open");
  const [maximized, setMaximized] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const leave = (anim) => {
    const final = anim === "closing" ? "closed" : "min";
    if (reduce) return setWin(final);
    setWin(anim);
    setTimeout(() => setWin(final), ANIM_MS);
  };

  const canDrag = desktop && !maximized;

  const barProps = {
    onPointerDown: (e) => {
      if (!canDrag || e.button > 0 || e.target.closest("button")) return;
      const r = wrapRef.current.getBoundingClientRect();
      const h = heroRef.current.getBoundingClientRect();
      const baseLeft = r.left - offset.x;
      const baseTop = r.top - offset.y;
      drag.current = {
        sx: e.clientX,
        sy: e.clientY,
        ox: offset.x,
        oy: offset.y,
        minX: h.left - baseLeft,
        maxX: h.right - (baseLeft + r.width),
        minY: h.top - baseTop,
        maxY: h.bottom - (baseTop + r.height),
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    },
    onPointerMove: (e) => {
      const d = drag.current;
      if (!d) return;
      setOffset({
        x: clamp(d.ox + e.clientX - d.sx, d.minX, d.maxX),
        y: clamp(d.oy + e.clientY - d.sy, d.minY, d.maxY),
      });
    },
    onPointerUp: () => {
      drag.current = null;
      setDragging(false);
    },
    onPointerCancel: () => {
      drag.current = null;
      setDragging(false);
    },
    onDoubleClick: (e) => {
      if (canDrag && !e.target.closest("button")) setOffset({ x: 0, y: 0 });
    },
  };

  const hidden = win === "closed" || win === "min";

  return (
    <section
      id="home"
      ref={heroRef}
      className="term-hero sm:px-16 px-4 flex flex-col items-center justify-center"
    >
      <ScopeHud />

      <div className="term-col w-full">
        {win === "closed" && (
          <button type="button" className="term-pill" onClick={() => setWin("open")}>
            open terminal
          </button>
        )}

        <div
          ref={wrapRef}
          className={`term-wrap${maximized ? " term-wrap--max" : ""}${hidden ? " term-wrap--hidden" : ""}`}
          style={maximized ? undefined : { transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
          <div className={`term-anim${win === "closing" || win === "minimizing" ? ` term-anim--${win}` : ""}`}>
            <Terminal
              ref={termRef}
              maximized={maximized}
              draggable={canDrag}
              dragging={dragging}
              barProps={barProps}
              onClose={() => leave("closing")}
              onMinimize={() => leave("minimizing")}
              onMaximize={() => setMaximized((m) => !m)}
            />
          </div>
          <div className="term-chips">
            {CHIPS.map((c) => (
              <button key={c} type="button" className="term-chip" onClick={() => termRef.current?.run(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {win === "min" && (
        <button type="button" className="term-minbar" onClick={() => setWin("open")}>
          <span className="term-prompt">$</span> avinash@iitg: ~ <span className="term-muted">— restore</span>
        </button>
      )}
    </section>
  );
};

export default Hero;
