import { useEffect, useRef, useState } from "react";
import { daemon } from "./state";
import { daemonEvent } from "./state";
import { ghLink } from "../lib/follow";

// The daemon's one sign, once per session: after the visitor has spent 90 seconds on the site (tab
// visible) or read a note or case study to its last line, the daemon holds up a tiny pixel sign
// "follow? ↗" for 4 seconds, then puts it away and never again that session. The sign is a plain
// link to my GitHub profile. It stays where the daemon was, so it can be clicked. Off with reduced
// motion and on touch devices (the same rule as the daemon itself).
const KEY = "follow-sign";
const AFTER_S = 90;
const SHOW_MS = 4000;

const used = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

// A small signboard on a stick, in the daemon's own pixel style (1 px = 2 css px).
const SIGN = [
  "XXXXXXXXXXXXXXXXXX",
  "X................X",
  "X................X",
  "X................X",
  "XXXXXXXXXXXXXXXXXX",
  "........XX........",
  "........XX........",
];

const FollowSign = () => {
  const [at, setAt] = useState(null);
  const pointer = useRef({ x: 0, y: 0, seen: false });
  const fired = useRef(used());
  const hover = useRef(false);

  useEffect(() => {
    if (fired.current) return undefined;
    const media = (q) => window.matchMedia(q).matches;
    const onMove = (e) => {
      pointer.current = { x: e.clientX, y: e.clientY, seen: true };
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let seconds = 0;
    let hideTimer = 0;
    const show = () => {
      if (fired.current || !daemon.available || media("(prefers-reduced-motion: reduce)") || !media("(pointer: fine)")) return;
      fired.current = true;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      const p = pointer.current;
      const w = 148;
      const x = p.seen ? Math.min(Math.max(8, p.x + 22), window.innerWidth - w - 8) : window.innerWidth - w - 24;
      const y = p.seen ? Math.min(Math.max(8, p.y - 70), window.innerHeight - 80) : window.innerHeight - 120;
      setAt({ x, y });
      daemonEvent("hop");
      const away = () => {
        if (hover.current) hideTimer = setTimeout(away, 500);
        else setAt(null);
      };
      hideTimer = setTimeout(away, SHOW_MS);
    };

    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      seconds += 1;
      if (seconds >= AFTER_S) show();
    }, 1000);
    window.addEventListener("read-end", show);
    return () => {
      clearInterval(tick);
      clearTimeout(hideTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("read-end", show);
    };
  }, []);

  if (!at) return null;
  return (
    <a
      className="daemon-sign"
      {...ghLink}
      style={{ left: at.x, top: at.y }}
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
      onClick={() => setAt(null)}
      aria-label="Follow Avinash on GitHub (opens in a new tab)"
    >
      <svg viewBox="0 0 18 7" width="72" height="28" shapeRendering="crispEdges" aria-hidden="true" className="daemon-sign-board">
        {SIGN.flatMap((row, y) => [...row].map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
      </svg>
      <span className="daemon-sign-text" aria-hidden="true">
        follow? &#8599;
      </span>
    </a>
  );
};

export default FollowSign;
