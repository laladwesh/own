import { Fragment, cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { Cell, Ext, Lines, Muted, Run, Strong } from "./ui.jsx";

// Command output that prints line by line, like a server writing a log. The output is cut at
// line ends, so a line is never half written; its structure (links, bold) stays intact. A short
// "thinking" pause comes first, then a line every few milliseconds: fewer lines print slower (so
// short answers are readable), long ones stream faster, and the whole thing never takes more than
// about 1.5s. Any key skips to the end; with reduced motion the output simply appears.
//
// Components that animate on their own (progress bars, the chai cup, timed lines) are not
// touched: they start once the lines before them are out.

const THINK_MS = 90; // the pause before the first line
const LINE_MAX_MS = 130; // slowest line gap (few lines)
const LINE_MIN_MS = 14; // fastest line gap (very long output)
const TOTAL_MS = 1500; // aim for at most this long for the lines

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BLOCK = new Set(["div", "p", "pre", "ul", "ol", "li"]);
const WRAPPERS = new Set([Muted, Strong, Ext, Cell, Run]);
const typed = new Set(); // entry ids that have finished printing (a remount shows them whole)

// One walk over the output tree. `ctx.left` is how many characters may still be shown
// (Infinity = all). Returns the part of the tree that fits; sets ctx.stop once text was cut.
// While counting (left = Infinity) it also records `ctx.breaks`: the character offsets where a
// line ends, which are the only places the output is ever cut.
const walk = (node, ctx) => {
  if (node === null || node === undefined || typeof node === "boolean") return node;
  if (ctx.stop) return null;

  if (typeof node === "string" || typeof node === "number") {
    const s = String(node);
    const start = ctx.total;
    ctx.total += s.length;
    if (ctx.breaks) for (let i = s.indexOf("\n"); i >= 0; i = s.indexOf("\n", i + 1)) ctx.breaks.push(start + i + 1);
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
    // One row per line.
    const rows = [];
    for (let i = 0; i < props.lines.length; i++) {
      if (ctx.stop || (Number.isFinite(ctx.left) && ctx.left <= 0)) {
        ctx.stop = true; // never start a row that has no room: it would show as a blank line
        break;
      }
      rows.push(
        <div key={i} className="term-out-line">
          {walk(props.lines[i], ctx)}
        </div>
      );
      if (ctx.breaks) ctx.breaks.push(ctx.total);
    }
    return <>{rows}</>;
  }
  if (type === Fragment) return cloneElement(node, undefined, walk(props.children, ctx));
  if (typeof type === "string") {
    const out = cloneElement(node, undefined, walk(props.children, ctx));
    if (ctx.breaks && BLOCK.has(type)) ctx.breaks.push(ctx.total);
    return out;
  }
  if (WRAPPERS.has(type)) {
    const kids = props.children ?? props.cmd ?? props.href;
    return cloneElement(node, { children: walk(kids, ctx) });
  }
  return node; // anything else animates itself
};

export const Typewriter = ({ id, node, onBusy }) => {
  // The line ends (character offsets, ascending, ending at the total) and how long each line waits.
  const plan = useMemo(() => {
    const ctx = { left: Infinity, total: 0, stop: false, breaks: [] };
    walk(node, ctx);
    const ends = [...new Set([...ctx.breaks, ctx.total].filter((b) => b > 0))].sort((a, b) => a - b);
    const gap = ends.length <= 1 ? 0 : Math.min(LINE_MAX_MS, Math.max(LINE_MIN_MS, TOTAL_MS / ends.length));
    return { total: ctx.total, ends, gap };
  }, [node]);
  const { total, ends, gap } = plan;

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
    let lastLine = 0;
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
      const t = now - t0 - THINK_MS;
      const lines = t < 0 ? 0 : Math.min(ends.length, 1 + (gap ? Math.floor(t / gap) : ends.length));
      if (lines !== lastLine) {
        lastLine = lines;
        setN(lines ? ends[lines - 1] : 0);
      }
      if (lines >= ends.length) finish();
      else raf = requestAnimationFrame(frame);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    raf = requestAnimationFrame(frame);
    return stop;
  }, [id, total, ends, gap, onBusy]);

  const ctx = { left: done ? Infinity : n, total: 0, stop: false };
  return <>{walk(node, ctx)}</>;
};
