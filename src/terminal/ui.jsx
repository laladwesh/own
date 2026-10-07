import { useEffect, useRef, useState } from "react";

// Building blocks for command output. Everything is a React node (no innerHTML).

export const Lines = ({ lines }) => (
  <>
    {lines.map((l, i) => (
      <div key={i} className="term-out-line">
        {l}
      </div>
    ))}
  </>
);

export const Muted = ({ children }) => <span className="term-muted">{children}</span>;

export const Strong = ({ children }) => <strong className="term-strong">{children}</strong>;

// Clickable text that runs a command, exactly as if it had been typed.
export const Run = ({ cmd, run, children, title }) => (
  <button type="button" className="term-run" title={title ?? cmd} onClick={() => run(cmd)}>
    {children ?? cmd}
  </button>
);

export const Ext = ({ href, children }) => (
  <a href={href} target={href?.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className="term-ext">
    {children ?? href}
  </a>
);

// Reveals lines one by one (used by the fake `rm -rf /`).
export const Reveal = ({ lines, interval = 140 }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= lines.length) return;
    const t = setTimeout(() => setN((v) => v + 1), interval);
    return () => clearTimeout(t);
  }, [n, lines.length, interval]);
  return <Lines lines={lines.slice(0, n)} />;
};

// In-terminal snake. Arrow keys steer, q quits.
const COLS = 28;
const ROWS = 12;

export const Snake = ({ onExit }) => {
  const [, force] = useState(0);
  const game = useRef(null);
  if (!game.current) {
    game.current = {
      snake: [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 },
      food: { x: 20, y: 6 },
      score: 0,
      over: false,
    };
  }

  useEffect(() => {
    const g = game.current;
    const place = () => {
      let p;
      do {
        p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      } while (g.snake.some((s) => s.x === p.x && s.y === p.y));
      g.food = p;
    };
    const tick = () => {
      if (g.over) return;
      g.dir = g.next;
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
      const hit =
        head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || g.snake.some((s) => s.x === head.x && s.y === head.y);
      if (hit) {
        g.over = true;
      } else {
        g.snake.unshift(head);
        if (head.x === g.food.x && head.y === g.food.y) {
          g.score += 1;
          place();
        } else g.snake.pop();
      }
      force((v) => v + 1);
    };
    const id = setInterval(tick, 130);

    const onKey = (e) => {
      const k = e.key;
      const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (map[k]) {
        e.preventDefault();
        const [x, y] = map[k];
        if (x !== -g.dir.x || y !== -g.dir.y) g.next = { x, y };
      } else if (k === "q" || k === "Q" || (k === "c" && e.ctrlKey)) {
        e.preventDefault();
        onExit(g.score);
      } else if ((k === "Enter" || k === " ") && g.over) {
        e.preventDefault();
        onExit(g.score);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [onExit]);

  const g = game.current;
  const rows = [];
  for (let y = 0; y < ROWS; y++) {
    let row = "";
    for (let x = 0; x < COLS; x++) {
      if (g.snake[0].x === x && g.snake[0].y === y) row += "@";
      else if (g.snake.some((s) => s.x === x && s.y === y)) row += "o";
      else if (g.food.x === x && g.food.y === y) row += "*";
      else row += " ";
    }
    rows.push(`|${row}|`);
  }
  const edge = `+${"-".repeat(COLS)}+`;

  return (
    <div className="term-snake">
      <pre>{[edge, ...rows, edge].join("\n")}</pre>
      <div className="term-muted">
        {g.over ? `game over / score ${g.score} / press enter` : `score ${g.score} / arrows to move / q to quit`}
      </div>
    </div>
  );
};

// Fixed-width cell for aligned, clickable table output.
export const Cell = ({ w, children }) => (
  <span style={{ display: "inline-block", minWidth: `${w}ch`, paddingRight: "2ch" }}>{children}</span>
);
