import { useEffect, useRef, useState } from "react";

// "tty": the guide's own little character, a small retro CRT monitor. 16x16 pixel art drawn as
// <rect>s and shown at 2x. Its screen changes with what is happening (see guide.css for the
// blinking cursor, the LED flicker and the bounce; transform and opacity only):
//
//   idle     ">_" with a blinking cursor; the power LED flickers every few seconds
//   talking  tiny code lines scroll up while the bubble text types in
//   hover    a quick screen glitch, then a pixel face and a small bounce
//   click    a pixel heart for a second
//   boot     one quick screen flicker (when a toggle is pressed)
//
// With reduced motion it stays on the idle frame.

const BODY = "#141414";
const BEZEL = "#2A2A2A";
const SCREEN = "#0D0D0D";
const AMBER = "#E8A33D";
const MINT = "#5FD38D";

// The monitor: B body, L bezel, S screen (x 3-12, y 3-9), M the power LED.
const SHELL = [
  "................",
  ".LLLLLLLLLLLLLL.",
  ".LBBBBBBBBBBBBL.",
  ".LBSSSSSSSSSSBL.",
  ".LBSSSSSSSSSSBL.",
  ".LBSSSSSSSSSSBL.",
  ".LBSSSSSSSSSSBL.",
  ".LBSSSSSSSSSSBL.",
  ".LBSSSSSSSSSSBL.",
  ".LBSSSSSSSSSSBL.",
  ".LBBBBBBBBBBBBL.",
  ".LBBBBBBBBBMBBL.",
  ".LLLLLLLLLLLLLL.",
  ".....LBBBBBL....",
  "....LLLLLLLLL...",
  "................",
];
const FILL = { B: BODY, L: BEZEL, S: SCREEN, M: MINT };

// Screen content, as [x, y, w, h] pixels.
const PROMPT = [[4, 4, 1, 1], [5, 5, 1, 1], [4, 6, 1, 1]]; // ">"
const FACE = [[5, 4, 1, 2], [10, 4, 1, 2], [5, 7, 1, 1], [6, 8, 4, 1], [10, 7, 1, 1]]; // eyes and a smile
const HEART = [[5, 4, 2, 1], [8, 4, 2, 1], [4, 5, 7, 1], [4, 6, 7, 1], [5, 7, 5, 1], [6, 8, 3, 1], [7, 9, 1, 1]];
const BOOT = [[3, 3, 10, 7]];

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const newLine = () => rnd(3, 8);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Tty = ({ talking = false, boot = 0 }) => {
  const [mode, setMode] = useState("idle"); // idle | glitch | face | heart | boot
  const [shift, setShift] = useState(0); // the glitch: a one-pixel sideways jump
  const [lines, setLines] = useState(() => [newLine(), newLine(), newLine(), newLine()]);
  const [phase, setPhase] = useState(0);
  const [bouncing, setBouncing] = useState(false);
  const timers = useRef([]);
  const still = reduced();

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  // talking: the code lines scroll up one pixel every 100ms
  useEffect(() => {
    if (!talking || still) return undefined;
    const id = setInterval(() => {
      setPhase((p) => {
        if (p === 1) setLines((l) => [...l.slice(1), newLine()]);
        return 1 - p;
      });
    }, 100);
    return () => clearInterval(id);
  }, [talking, still]);

  // a toggle was pressed: one quick boot flicker
  useEffect(() => {
    if (!boot || still) return;
    clear();
    setMode("boot");
    later(() => setMode("idle"), 90);
    later(() => setMode("boot"), 150);
    later(() => setMode("idle"), 230);
  }, [boot]); // eslint-disable-line react-hooks/exhaustive-deps

  const onEnter = (e) => {
    if (still || (e.pointerType && e.pointerType !== "mouse")) return;
    clear();
    setMode("glitch");
    setShift(1);
    later(() => setShift(-1), 60);
    later(() => {
      setShift(0);
      setMode("face");
      setBouncing(true);
    }, 120);
    later(() => setBouncing(false), 430);
  };
  const onLeave = (e) => {
    if (still || (e.pointerType && e.pointerType !== "mouse")) return;
    clear();
    later(() => setMode((m) => (m === "heart" ? m : "idle")), 1500);
  };
  const onClick = () => {
    if (still) return;
    clear();
    setMode("heart");
    later(() => setMode("idle"), 1000);
  };
  // touch: a tap shows the face for a moment
  const onTouch = (e) => {
    if (still || e.pointerType === "mouse") return;
    clear();
    setMode("face");
    later(() => setMode("idle"), 1500);
  };

  // what the screen shows right now
  let screen;
  if (mode === "boot") screen = BOOT;
  else if (mode === "heart") screen = HEART;
  else if (mode === "face") screen = FACE;
  else if (talking && !still && mode === "idle") {
    screen = lines.flatMap((len, i) => {
      const y = 3 + i * 2 - phase;
      return y >= 3 && y <= 9 ? [[4, y, len, 1]] : [];
    });
  } else screen = PROMPT;

  const showCursor = mode === "idle" && !(talking && !still);

  return (
    <span
      className={`tty${bouncing && !still ? " tty--bounce" : ""}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={onClick}
      onPointerDown={onTouch}
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" width={32} height={32} shapeRendering="crispEdges">
        {SHELL.flatMap((row, y) =>
          [...row].map((c, x) =>
            c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={FILL[c]} className={c === "M" ? "tty-led" : undefined} />
          )
        )}
        <g transform={`translate(${shift} 0)`} fill={AMBER}>
          {screen.map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} />
          ))}
          {showCursor && <rect className="tty-cursor" x="7" y="6" width="3" height="1" />}
        </g>
      </svg>
    </span>
  );
};

export default Tty;
