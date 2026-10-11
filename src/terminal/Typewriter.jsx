import { Fragment, cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { Cell, Ext, Lines, Muted, Run, Strong } from "./ui.jsx";

// Command output that types itself out, like a server printing as it works. The text of the output
// is revealed from the top, character by character, with its structure (lines, links, bold) intact.
// The whole thing takes longer for more text but never more than MAX_MS, so `help` streams fast and
// a one-liner is typed slowly enough to read. Any key skips to the end; with reduced motion the
// output simply appears.
//
// Components that animate on their own (progress bars, the chai cup, timed lines) are not typed:
// they start once the text before them is out.

const MS_PER_CHAR = 12;
const MIN_MS = 220;
const MAX_MS = 1600;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const WRAPPERS = new Set([Muted, Strong, Ext, Cell, Run]);
const typed = new Set(); // entry ids that have finished typing (a remount shows them whole)

// One walk over the output tree. `ctx.left` is how many characters may still be shown
// (Infinity = all). Returns the part of the tree that fits; sets ctx.stop once text was cut.
const walk = (node, ctx) => {
  if (node === null || node === undefined || typeof node === "boolean") return node;
  if (ctx.stop) return null;

  if (typeof node === "string" || typeof node === "number") {
    const s = String(node);
    ctx.total += s.length;
    const take = Math.min(s.length, ctx.left);
    ctx.left -= take;
    if (take < s.length) ctx.stop = true;
    return s.slice(0, take);
  }

  if (Array.isArray(node)) {
    const out = [];
    for (const child of node) {
      const part = walk(child, ctx);
      if (part !== null && part !== undefined) out.push(part);
      if (ctx.stop) break;
    }
    return out;
  }

  if (typeof node !== "object" || !node.type) return null;
  if (Number.isFinite(ctx.left) && ctx.left <= 0) {
    ctx.stop = true;
    return null;
  }

  const { type, props } = node;
  if (type === Lines) {
    // Typed line by line, instead of the component's own streaming.
    const rows = [];
    for (let i = 0; i < props.lines.length; i++) {
      if (ctx.stop) break;
      rows.push(
        <div key={i} className="term-out-line">
          {walk(props.lines[i], ctx)}
        </div>
      );
    }
    return <>{rows}</>;
  }
  if (type === Fragment) return cloneElement(node, undefined, walk(props.children, ctx));
  if (typeof type === "string") return cloneElement(node, undefined, walk(props.children, ctx));
  if (WRAPPERS.has(type)) {
    const kids = props.children ?? props.cmd ?? props.href;
    return cloneElement(node, { children: walk(kids, ctx) });
  }
  return node; // anything else animates itself
};

export const Typewriter = ({ id, node, onBusy }) => {
  const total = useMemo(() => {
    const ctx = { left: Infinity, total: 0, stop: false };
    walk(node, ctx);
    return ctx.total;
  }, [node]);

  const [n, setN] = useState(() => (typed.has(id) || reducedMotion() || total === 0 ? total : 0));
  const done = n >= total;
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    if (doneRef.current) {
      typed.add(id);
      return undefined;
    }
    onBusy?.(1);
    let busy = true;
    let raf = 0;
    const t0 = performance.now();
    const dur = Math.min(MAX_MS, Math.max(MIN_MS, total * MS_PER_CHAR));
    let last = -1;
    const stop = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      if (busy) {
        busy = false;
        onBusy?.(-1);
      }
    };
    const finish = () => {
      typed.add(id);
      setN(total);
      stop();
    };
    // The Enter that ran the command (or the click on a link) is older than this effect: ignore it.
    const skip = (e) => {
      if (e.timeStamp >= t0) finish();
    };
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const k = Math.floor(total * t);
      if (k !== last) {
        last = k;
        setN(k);
      }
      if (t >= 1) finish();
      else raf = requestAnimationFrame(frame);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    raf = requestAnimationFrame(frame);
    return stop;
  }, [id, total, onBusy]);

  const ctx = { left: done ? Infinity : n, total: 0, stop: false };
  return <>{walk(node, ctx)}</>;
};
