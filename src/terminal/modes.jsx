import { useEffect, useMemo, useRef, useState } from "react";
import { aboutMe, projects } from "../constants";
import { projectStatus } from "../lib/data";

// Full-screen modes that take over the terminal body: vim, htop, typespeed.
// Each one listens on the window (capture phase) while it is mounted.

const useKeys = (handler) => {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const on = (e) => ref.current(e);
    window.addEventListener("keydown", on, true);
    return () => window.removeEventListener("keydown", on, true);
  }, []);
};

// ───────────── vim ─────────────
export const Vim = ({ onExit }) => {
  const [cmd, setCmd] = useState(null); // null = normal mode, string = typing after ":"
  const [insert, setInsert] = useState(false);
  const [msg, setMsg] = useState("");
  const [tries, setTries] = useState(0);

  useKeys((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    e.stopPropagation();
    const k = e.key;
    if (cmd === null) {
      if (k === ":") {
        setCmd("");
        setMsg("");
      } else if (k === "i" || k === "a" || k === "o") setInsert(true);
      else if (k === "Escape") setInsert(false);
      else if (k.length === 1 && !insert) setTries((t) => t + 1);
      return;
    }
    if (k === "Escape") setCmd(null);
    else if (k === "Backspace") setCmd((c) => (c.length ? c.slice(0, -1) : null));
    else if (k === "Enter") {
      const c = cmd.trim();
      if (c === "q" || c === "q!") onExit("you escaped vim.");
      else if (c === "wq" || c === "x" || c === "w") setMsg("E212: Can't open file for writing (there is nothing to write)");
      else setMsg(`E492: Not an editor command: ${c}`);
      setTries((t) => t + 1);
      setCmd(null);
    } else if (k.length === 1) setCmd((c) => c + k);
  });

  const rows = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="term-vim" aria-label="fake vim">
      <div className="term-vim-body">
        {rows.map((i) => (
          <div key={i} className="term-vim-row">
            {i === 4 ? "                 VIM - Vi IMproved (the fake edition)" : i === 6 ? "                  type  :q<Enter>  to exit" : i === 7 && tries > 3 ? "                  (psst: yes, it is :q)" : "~"}
          </div>
        ))}
      </div>
      <div className="term-vim-status">
        {cmd !== null ? `:${cmd}` : msg || (insert ? "-- INSERT --" : "")}
        {cmd !== null && <span className="term-cursor" aria-hidden="true" />}
      </div>
    </div>
  );
};

// ───────────── htop ─────────────
const bar = (pct, width = 18) => {
  const n = Math.round((pct / 100) * width);
  return `[${"|".repeat(n)}${" ".repeat(width - n)}]`;
};

export const Htop = ({ onExit }) => {
  const procs = useMemo(
    () =>
      projects.map((p, i) => ({
        pid: 1000 + i * 7,
        name: p.title,
        state: projectStatus(p) === "Running" ? "R" : projectStatus(p) === "Completed" ? "S" : "Z",
        cpu: projectStatus(p) === "Running" ? 5 + Math.random() * 30 : 0,
        mem: 2 + Math.random() * 18,
      })),
    []
  );
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      for (const p of procs) {
        if (p.state === "R") p.cpu = Math.min(95, Math.max(1, p.cpu + (Math.random() - 0.5) * 14));
        p.mem = Math.min(60, Math.max(1, p.mem + (Math.random() - 0.5) * 2));
      }
      setTick((t) => t + 1);
    }, 800);
    return () => clearInterval(id);
  }, [procs]);

  useKeys((e) => {
    if (e.key === "q" || e.key === "Q" || e.key === "Escape" || (e.ctrlKey && e.key === "c")) {
      e.preventDefault();
      e.stopPropagation();
      onExit(null);
    }
  });

  const cpu = procs.reduce((a, p) => a + p.cpu, 0) / procs.length;
  const mem = procs.reduce((a, p) => a + p.mem, 0) / procs.length;
  const sorted = [...procs].sort((a, b) => b.cpu - a.cpu);

  return (
    <div className="term-htop">
      <div>CPU {bar(cpu * 2.4)} {cpu.toFixed(1)}%</div>
      <div>MEM {bar(mem * 2.4)} {mem.toFixed(1)}%</div>
      <div className="term-htop-head">  PID S   CPU%  MEM%  PROCESS</div>
      {sorted.map((p) => (
        <div key={p.pid}>
          {String(p.pid).padStart(5)} {p.state} {p.cpu.toFixed(1).padStart(5)} {p.mem.toFixed(1).padStart(5)}  {p.name}
        </div>
      ))}
      <div className="term-muted">simulated numbers  /  q to quit</div>
    </div>
  );
};

// ───────────── typespeed ─────────────
const sentences = () => {
  const pool = [];
  const add = (text) =>
    text
      .split(/(?<=[.!?])\s+/)
      .map((t) => t.replace(/\s+/g, " ").trim())
      .filter((t) => t.length >= 30 && t.length <= 92 && !/[^\x20-\x7E]/.test(t))
      .forEach((t) => pool.push(t));
  add(aboutMe.intro);
  projects.forEach((p) => add(p.content));
  return pool;
};
const SENTENCES = sentences();
const pick = () => SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
const DURATION = 30;
const BEST_KEY = "term-best-wpm";

export const bestWpm = () => {
  try {
    return Number(sessionStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

export const TypeSpeed = ({ onExit }) => {
  const [lines, setLines] = useState(() => [pick(), pick()]);
  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(DURATION);
  const stats = useRef({ total: 0, correct: 0, started: 0 });
  const [started, setStarted] = useState(false);

  useKeys((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onExit({ cancelled: true });
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      e.stopPropagation();
      setTyped((t) => t.slice(0, -1));
      return;
    }
    if (e.key.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    if (!stats.current.started) {
      stats.current.started = performance.now();
      setStarted(true);
    }
    const target = lines[0];
    const next = typed + e.key;
    stats.current.total += 1;
    if (e.key === target[typed.length]) stats.current.correct += 1;
    if (next.length >= target.length) {
      setLines(([, ...rest]) => [...rest, pick()]);
      setTyped("");
    } else setTyped(next);
  });

  useEffect(() => {
    if (!started) return undefined;
    const id = setInterval(() => {
      const elapsed = (performance.now() - stats.current.started) / 1000;
      const remaining = Math.max(0, DURATION - elapsed);
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        const { total, correct } = stats.current;
        const wpm = Math.round(correct / 5 / (DURATION / 60));
        const accuracy = total ? Math.round((correct / total) * 100) : 0;
        const prev = bestWpm();
        const best = Math.max(prev, wpm);
        try {
          sessionStorage.setItem(BEST_KEY, String(best));
        } catch {
          /* ignore */
        }
        onExit({ wpm, accuracy, best, newBest: wpm > prev });
      }
    }, 200);
    return () => clearInterval(id);
  }, [started, onExit]);

  const target = lines[0];
  return (
    <div className="term-type">
      <div className="term-muted">
        typespeed / {started ? `${Math.ceil(left)}s left` : "press any key to start"} / Esc quits
      </div>
      <div className="term-type-line">
        {[...target].map((c, i) => (
          <span key={i} className={i < typed.length ? (typed[i] === c ? "term-type-ok" : "term-type-bad") : i === typed.length ? "term-type-cur" : ""}>
            {c}
          </span>
        ))}
      </div>
      {lines.slice(1).map((l, i) => (
        <div key={i} className="term-muted term-type-next">
          {l}
        </div>
      ))}
    </div>
  );
};
