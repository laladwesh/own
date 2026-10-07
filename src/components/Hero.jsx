import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import ScopeHud from "../scope/ScopeHud";
import Terminal from "./Terminal";

const SPRING = { type: "spring", stiffness: 300, damping: 30 };
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The window states. Only transform and opacity animate.
const VARIANTS = {
  open: { opacity: 1, scale: 1, y: 0 },
  closing: { opacity: 0, scale: 0.6, y: 0 },
  minimizing: { opacity: 0, scale: 0.4, y: 260 },
  closed: { opacity: 0, scale: 0.6, y: 0 },
  min: { opacity: 0, scale: 0.4, y: 260 },
};

const Hero = () => {
  const heroRef = useRef(null);
  const wrapRef = useRef(null);
  const flipRef = useRef(null);
  const drag = useRef(null);
  const rectBefore = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // open | closing | minimizing | closed | min
  const [win, setWin] = useState("open");
  const [maximized, setMaximized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [sized, setSized] = useState(false);
  const resizing = useRef(null);
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Maximise / restore: FLIP from the old rectangle with a spring (transform only).
  const toggleMax = () => {
    rectBefore.current = flipRef.current?.getBoundingClientRect() ?? null;
    setMaximized((m) => !m);
  };

  useLayoutEffect(() => {
    const before = rectBefore.current;
    rectBefore.current = null;
    const el = flipRef.current;
    if (!before || !el || reduced()) return;
    const after = el.getBoundingClientRect();
    if (!after.width || !after.height) return;
    animate(
      el,
      {
        x: [before.left - after.left, 0],
        y: [before.top - after.top, 0],
        scaleX: [before.width / after.width, 1],
        scaleY: [before.height / after.height, 1],
      },
      SPRING
    );
  }, [maximized]);

  const canDrag = desktop && !maximized;

  const barProps = {
    onPointerDown: (e) => {
      if (!canDrag || e.button > 0 || e.target.closest("button")) return;
      const r = wrapRef.current.getBoundingClientRect();
      const h = heroRef.current.getBoundingClientRect();
      const baseLeft = r.left - x.get();
      const baseTop = r.top - y.get();
      drag.current = {
        sx: e.clientX,
        sy: e.clientY,
        ox: x.get(),
        oy: y.get(),
        minX: h.left - baseLeft,
        maxX: h.right - (baseLeft + r.width),
        minY: h.top - baseTop,
        maxY: h.bottom - (baseTop + r.height),
      };
      wrapRef.current.style.willChange = "transform";
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    },
    onPointerMove: (e) => {
      const d = drag.current;
      if (!d) return;
      // Past the edge it resists (rubber band); on release it springs back inside.
      const rx = d.ox + e.clientX - d.sx;
      const ry = d.oy + e.clientY - d.sy;
      const cx = clamp(rx, d.minX, d.maxX);
      const cy = clamp(ry, d.minY, d.maxY);
      x.set(cx + (rx - cx) * 0.25);
      y.set(cy + (ry - cy) * 0.25);
    },
    onPointerUp: () => endDrag(),
    onPointerCancel: () => endDrag(),
    onDoubleClick: (e) => {
      if (canDrag && !e.target.closest("button")) {
        animate(x, 0, SPRING);
        animate(y, 0, SPRING);
      }
    },
  };

  function endDrag() {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    animate(x, clamp(x.get(), d.minX, d.maxX), SPRING);
    animate(y, clamp(y.get(), d.minY, d.maxY), SPRING);
    if (wrapRef.current) wrapRef.current.style.willChange = "";
  }

  // Resize like a desktop window: drag the bottom edge, the right edge or the corner.
  const canResize = desktop && !maximized;

  const startResize = (edge) => (e) => {
    if (!canResize || e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    const r = wrapRef.current.getBoundingClientRect();
    resizing.current = { edge, x: e.clientX, y: e.clientY, w: r.width, h: r.height, left: r.left };
    e.currentTarget.setPointerCapture(e.pointerId);
    wrapRef.current.classList.add("term-wrap--resizing");
  };

  const moveResize = (e) => {
    const d = resizing.current;
    if (!d) return;
    const el = wrapRef.current;
    if (d.edge.includes("e")) el.style.width = `${clamp(d.w + e.clientX - d.x, 480, window.innerWidth - d.left - 8)}px`;
    if (d.edge.includes("s")) el.style.height = `${clamp(d.h + e.clientY - d.y, 280, window.innerHeight - 100)}px`;
    if (!sized) setSized(true);
  };

  const endResize = () => {
    resizing.current = null;
    wrapRef.current?.classList.remove("term-wrap--resizing");
  };

  const resetSize = () => {
    wrapRef.current.style.width = "";
    wrapRef.current.style.height = "";
    setSized(false);
  };

  const handle = (edge) => ({
    className: `term-resize term-resize--${edge}`,
    "aria-hidden": true,
    onPointerDown: startResize(edge),
    onPointerMove: moveResize,
    onPointerUp: endResize,
    onPointerCancel: endResize,
    onDoubleClick: resetSize,
  });

  const hidden = win === "closed" || win === "min";
  const transition = reduced() ? { duration: 0 } : SPRING;

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

        <motion.div
          ref={wrapRef}
          className={`term-wrap${maximized ? " term-wrap--max" : ""}${hidden ? " term-wrap--hidden" : ""}${sized ? " term-wrap--sized" : ""}`}
          style={maximized ? undefined : { x, y }}
        >
          <motion.div
            className="term-anim"
            initial={{ opacity: 0, scale: 0.92, y: 0 }}
            animate={VARIANTS[win]}
            transition={transition}
            onAnimationComplete={() => {
              if (win === "closing") setWin("closed");
              else if (win === "minimizing") setWin("min");
            }}
          >
            <div ref={flipRef} className="term-flip">
              <Terminal
                maximized={maximized}
                draggable={canDrag}
                dragging={dragging}
                barProps={barProps}
                onClose={() => setWin("closing")}
                onMinimize={() => setWin("minimizing")}
                onMaximize={toggleMax}
              />
            </div>
          </motion.div>
          {canResize && (
            <>
              <div {...handle("s")} />
              <div {...handle("e")} />
              <div {...handle("se")} />
            </>
          )}
        </motion.div>
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
