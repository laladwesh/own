import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import PencilNote from "./PencilNote";
import { asOfLong, asOfShort, cleanOfHundred, failPct, fmtNum, oaCheckStats as S, passPct } from "../constants/oaCheck";

// "By the numbers" for the OA Check case study: a tally counter that rolls up to the real total, a
// 10x10 grid of pixel laptops (clean vs flagged, out of every 100 checks) and a printed test report.
// The numbers all come from src/constants/oaCheck.js. Each part plays once, when the section first
// comes on screen, and is still after that; with reduced motion everything shows at once.
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const WHEELS = String(S.total).length; // 30000 -> 5 wheels
const ROLL_MS = 1200;

// ───────────── the tally counter ─────────────
// Each wheel is a strip of 0-9 and a 0 again; wheel k shows (value / 10^k) mod 10, so the units wheel
// spins fastest, like an odometer. The wheels are moved straight on the page (transform only, from one
// animation loop), so React does not re-render anything while they roll.
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const setWheels = (strips, value) => {
  strips.forEach((el, i) => {
    if (!el) return;
    const place = 10 ** (WHEELS - 1 - i);
    const pos = (value / place) % 10;
    el.style.transform = `translate3d(0, ${((-pos * 100) / 11).toFixed(3)}%, 0)`;
  });
};

const Tally = memo(({ strips }) => (
  <div className="tally" role="group" aria-label={`${fmtNum(S.total)} OA checks run`}>
    <div className="tally-plate">AG-COUNT / OA CHECKS RUN</div>
    <div className="tally-wheels" aria-hidden="true">
      {Array.from({ length: WHEELS }, (_, i) => (
        <span key={i} className="tally-wheel">
          <span className="tally-strip" ref={(el) => (strips.current[i] = el)}>
            {STRIP.map((d, j) => (
              <span key={j}>{d}</span>
            ))}
          </span>
        </span>
      ))}
    </div>
    <p className="tally-asof">as of {asOfShort()}</p>
  </div>
));

// ───────────── the pixel laptops ─────────────
// A laptop is 12x8 pixels: a lid with a screen, and a base. Clean: a ">_" prompt on the screen.
// Flagged: a hatched screen with a "!".
const LAPTOP = ["..XXXXXXXX..", "..X......X..", "..X......X..", "..X......X..", "..X......X..", "..XXXXXXXX..", ".XXXXXXXXXX.", "XXXXXXXXXXXX"];
const PROMPT = [[3, 1], [4, 2], [3, 3], [6, 3], [7, 3]];
const BANG = [[5, 1], [5, 2], [5, 4]];
const HATCH = [[3, 1], [5, 1], [7, 1], [4, 2], [6, 2], [3, 3], [5, 3], [7, 3], [4, 4], [6, 4]];

const Symbols = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
    <defs>
      <symbol id="oa-lap-base" viewBox="0 0 12 8">
        {LAPTOP.flatMap((row, y) => [...row].map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null)))}
      </symbol>
      <symbol id="oa-lap-ok" viewBox="0 0 12 8">
        <use href="#oa-lap-base" />
        {PROMPT.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
        ))}
      </symbol>
      <symbol id="oa-lap-flag" viewBox="0 0 12 8">
        <use href="#oa-lap-base" />
        {HATCH.map(([x, y]) => (
          <rect key={`h${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" opacity="0.35" />
        ))}
        {BANG.map(([x, y]) => (
          <rect key={`b${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
        ))}
      </symbol>
    </defs>
  </svg>
);

// Which of the 100 laptops are flagged: spread over the grid, the same every time.
const flaggedSlots = (count) => {
  let seed = 31;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const pool = Array.from({ length: 100 }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return new Set(pool.slice(0, count));
};

const Laptops = ({ on }) => {
  const clean = cleanOfHundred();
  const flagged = useMemo(() => flaggedSlots(100 - clean), [clean]);
  return (
    <div className="laptops">
      <Symbols />
      <div className="laptop-grid" role="group" aria-label={`Out of every 100 checks, ${clean} laptops were clean on the first try and ${100 - clean} were flagged`}>
        {Array.from({ length: 100 }, (_, i) =>
          flagged.has(i) ? (
            <button key={i} type="button" className="lap lap--flag" style={{ "--i": i }} aria-label="flagged: something was found and cleaned up, then re-checked">
              <svg viewBox="0 0 12 8" width="20" height="13" aria-hidden="true">
                <use href="#oa-lap-flag" />
              </svg>
              <span className="lap-tip" role="tooltip">
                flagged: something was found and cleaned up, then re-checked
              </span>
            </button>
          ) : (
            <span key={i} className="lap" style={{ "--i": i }} aria-hidden="true">
              <svg viewBox="0 0 12 8" width="20" height="13">
                <use href="#oa-lap-ok" />
              </svg>
            </span>
          )
        )}
      </div>
      <p className="laptop-cap">Out of every 100 checks, about {clean} laptops were clean on the first try.</p>
    </div>
  );
};

// ───────────── the printed test report ─────────────
const BAR = 20;
const bar = (p) => {
  const n = Math.round((p / 100) * BAR);
  return "█".repeat(n) + "░".repeat(BAR - n);
};

const Receipt = () => (
  <div className="receipt" role="group" aria-label="Printed test report">
    <p className="receipt-head">
      AG-OACHECK / TEST REPORT
      <br />
      AS OF {asOfShort().toUpperCase()}
    </p>
    <hr className="receipt-rule" />
    <p className="receipt-row">
      <span>CHECKS RUN</span>
      <span>{fmtNum(S.total)}</span>
    </p>
    <p className="receipt-row">
      <span>PASS</span>
      <span>{fmtNum(S.passed)}</span>
    </p>
    <p className="receipt-bar" aria-hidden="true">
      {bar(passPct())} {passPct().toFixed(1)}%
    </p>
    <p className="receipt-row">
      <span>FLAGGED</span>
      <span>{fmtNum(S.failed)}</span>
    </p>
    <p className="receipt-bar" aria-hidden="true">
      {bar(failPct())} {failPct().toFixed(1)}%
    </p>
    <hr className="receipt-rule" />
    <p className="receipt-note">FLAGGED = something was found and cleaned up, not proof of cheating.</p>
  </div>
);

// ───────────── the section ─────────────
const OaCheckNumbers = () => {
  const ref = useRef(null);
  const strips = useRef([]);
  const [on, setOn] = useState(() => reduced());

  // before anything shows, the wheels read 00000 (or the total, with reduced motion)
  useLayoutEffect(() => {
    setWheels(strips.current, reduced() ? S.total : 0);
  }, []);

  useEffect(() => {
    if (on || typeof IntersectionObserver === "undefined") {
      setOn(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        setOn(true);
      }
    }, { threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // the wheels roll once, ease-out, then stop. It starts a moment after the laptops begin to boot so the
  // two do not compete for the first frames.
  useEffect(() => {
    if (!on) return undefined;
    if (reduced()) {
      setWheels(strips.current, S.total);
      return undefined;
    }
    let raf = 0;
    let t0 = 0;
    const delay = setTimeout(() => {
      const step = (now) => {
        if (!t0) t0 = now;
        const t = Math.min(1, (now - t0) / ROLL_MS);
        setWheels(strips.current, S.total * (1 - (1 - t) ** 4));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, 120);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [on]);

  return (
    <figure ref={ref} className={`oa-nums${on ? " oa-nums--on" : ""}`}>
      <p className="oa-nums-text">
        By {asOfLong()} the check had run {fmtNum(S.total)} times. {fmtNum(S.passed)} came back clean. The other {fmtNum(S.failed)} found something, usually an app that had to be closed or removed. A flagged check isn&apos;t an accusation; it&apos;s the check doing its job before the test, not after.
      </p>
      <div className="oa-top">
        <div className="oa-tally-wrap">
          <PencilNote id="oaCounter" />
          <Tally strips={strips} />
        </div>
        <Receipt />
      </div>
      <Laptops on={on} />
    </figure>
  );
};

export default OaCheckNumbers;
