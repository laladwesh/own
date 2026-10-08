import { useLayoutEffect, useMemo, useRef } from "react";
import { scope } from "../scope/scopeStore.js";
import { daemonEvent } from "../daemon/state.js";

// The `neofetch` report, with a short reveal (about 1.5s):
//   logo glyphs lock in from left to right -> header types, divider draws -> one row every 60ms
//   (label, then value; numbers count up) -> eight colour blocks light up -> one blip on the scope
//   trace and one hop from the daemon.
// React renders the finished report once. The reveal then changes the DOM text directly from a
// single requestAnimationFrame loop, so nothing re-renders per frame and nothing shifts: hidden
// text keeps its width, numbers sit in fixed-width boxes. Any key or click jumps to the end. With
// reduced motion the finished report shows at once. Only the newest report animates and ticks.

export const ART = [
  "   █████╗  ██████╗ ",
  "  ██╔══██╗██╔════╝ ",
  "  ███████║██║  ███╗",
  "  ██╔══██║██║   ██║",
  "  ██║  ██║╚██████╔╝",
  "  ╚═╝  ╚═╝ ╚═════╝ ",
];

const HEADER = ["avinash", "@iitg"];
const DIVIDER = "─────────────";
const GLYPHS = "░▒▓█";
const BLOCKS = 8;

const TYPE_MS = 12; // per character, values
const HEAD_START = 300;
const ROWS_START = 500;
const ROW_MS = 60;
const COUNT_MS = 400;
const BLOCKS_START = 1300;
const BLOCK_MS = 40;
const END_MS = 1600;

// Uptime counts from the start of my degree (July 2023).
const SINCE = new Date(2023, 6, 1);

const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

export const uptimeParts = (now = new Date()) => {
  let months = (now.getFullYear() - SINCE.getFullYear()) * 12 + (now.getMonth() - SINCE.getMonth());
  if (addMonths(SINCE, months) > now) months -= 1;
  const rest = now - addMonths(SINCE, months);
  const day = 864e5;
  const d = Math.floor(rest / day);
  const left = rest - d * day;
  const pad = (n) => String(n).padStart(2, "0");
  const h = Math.floor(left / 36e5);
  const m = Math.floor((left % 36e5) / 6e4);
  const s = Math.floor((left % 6e4) / 1e3);
  return { y: Math.floor(months / 12), m: months % 12, d, clock: `${pad(h)}:${pad(m)}:${pad(s)}` };
};

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const easeOut = (t) => 1 - (1 - t) ** 3;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A value is a list of parts: text, a number that counts up (with a suffix), or the live clock.
const buildRows = (info, up) => [
  ["OS", [{ k: "text", text: info.os }]],
  ["Host", [{ k: "text", text: info.host }]],
  ["Shell", [{ k: "text", text: info.shell }]],
  ["Langs", [{ k: "text", text: info.langs }]],
  ["Role", [{ k: "text", text: info.role }]],
  [
    "Uptime",
    [
      { k: "num", n: up.y, s: "y ", id: "y" },
      { k: "num", n: up.m, s: "m ", id: "m" },
      { k: "num", n: up.d, s: "d ", id: "d" },
      { k: "clock", text: up.clock },
    ],
  ],
  ["Projects", [{ k: "num", n: info.projects, s: "" }, { k: "text", text: " deployments" }]],
  ["Incidents", [{ k: "num", n: info.incidents, s: "" }, { k: "text", text: " postmortems" }]],
  [
    "Impact",
    [
      { k: "num", n: 1300, s: "+" },
      { k: "text", text: " students, " },
      { k: "num", n: 200, s: "+" },
      { k: "text", text: " companies" },
    ],
  ],
];

let nextId = 1;
export const newNeofetchId = () => nextId++;
const played = new Set(); // ids that have finished animating (a remount shows the finished report)
let latest = null; // the controller of the newest report: the only one that animates and ticks
let newestId = 0;

const Neofetch = ({ id, info }) => {
  const root = useRef(null);
  const art = useRef(null);
  const refs = useRef({ head: [], div: null, rows: [], blocks: [] });
  const first = useRef(null);
  if (!first.current) first.current = new Date();
  const rows = useMemo(() => buildRows(info, uptimeParts(first.current)), [info]);

  useLayoutEffect(() => {
    const R = refs.current;
    const rowNodes = R.rows;
    let raf = 0;
    let timer = 0;
    let done = false;
    let visible = true;
    let ctl = null;

    // --- helpers that edit the DOM text ---
    const numText = (p, n) => `${n}${p.s}`;
    const prep = (el, text) => {
      el.textContent = "";
      const vis = document.createElement("span");
      const hid = document.createElement("span");
      hid.style.visibility = "hidden";
      hid.textContent = text;
      el.append(vis, hid);
      let last = -1;
      return {
        set(n) {
          const k = clamp(Math.floor(n), 0, text.length);
          if (k === last) return;
          last = k;
          vis.textContent = text.slice(0, k);
          hid.textContent = text.slice(k);
        },
        final() {
          el.textContent = text;
        },
      };
    };

    // The finished text for every node (uptime read fresh).
    const finalise = () => {
      const up = uptimeParts();
      art.current.textContent = ART.join("\n");
      R.head.forEach((el, i) => (el.textContent = HEADER[i]));
      R.div.textContent = DIVIDER;
      rowNodes.forEach((row, ri) => {
        row.label.style.visibility = "visible";
        rows[ri][1].forEach((p, pi) => {
          const el = row.parts[pi];
          el.style.visibility = "visible";
          if (p.k === "num") el.textContent = numText(p, p.id ? up[p.id] : p.n);
          else if (p.k === "clock") el.textContent = up.clock;
          else el.textContent = p.text;
        });
      });
      R.blocks.forEach((b) => b.classList.add("nf-block--on"));
    };

    const tick = () => {
      if (!visible || latest !== ctl) return;
      const up = uptimeParts();
      rowNodes.forEach((row, ri) =>
        rows[ri][1].forEach((p, pi) => {
          const el = row.parts[pi];
          if (p.k === "num" && p.id) {
            const t = numText(p, up[p.id]);
            if (el.textContent !== t) {
              el.style.width = `${Math.max(parseFloat(el.style.width) || 0, t.length)}ch`;
              el.textContent = t;
            }
          } else if (p.k === "clock") el.textContent = up.clock;
        })
      );
    };

    const startTicking = () => {
      timer = window.setInterval(tick, 1000);
    };

    let off = () => {};
    const finish = (skip) => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      off();
      finalise();
      played.add(id);
      if (!skip) {
        scope.spike(); // one blip on CH1
        daemonEvent("hop"); // one happy hop
      }
      startTicking();
    };

    ctl = { finish: () => finish(true), stop: () => window.clearInterval(timer) };
    const isNewest = id >= newestId;
    if (isNewest) {
      newestId = id;
      const previous = latest;
      latest = ctl;
      if (previous) {
        previous.finish();
        previous.stop();
      }
    }

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root.current);

    const animate = isNewest && !played.has(id) && !reduced();
    if (!animate) {
      finish(true);
    } else {
      // --- set up the first frame: everything hidden but holding its width ---
      const cols = Math.max(...ART.map((l) => l.length));
      const cells = [];
      ART.forEach((line, r) =>
        [...line].forEach((ch, c) => {
          if (ch === " ") return;
          const k = 3 + Math.floor(Math.random() * 3); // 3-5 flickers
          const settle = 160 + (c / (cols - 1)) * 340;
          cells.push({ r, c, ch, k, settle, g: Array.from({ length: k }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]) });
        })
      );
      const byRow = ART.map((line, r) => ({ line: [...line], cells: cells.filter((x) => x.r === r) }));
      let lastArt = "";
      const drawArt = (ms) => {
        const out = byRow.map(({ line, cells: cs }) => {
          const chars = [...line];
          cs.forEach((cell) => {
            chars[cell.c] = ms >= cell.settle ? cell.ch : cell.g[Math.min(cell.k - 1, Math.floor((ms / cell.settle) * cell.k))];
          });
          return chars.join("");
        });
        const s = out.join("\n");
        if (s !== lastArt) {
          lastArt = s;
          art.current.textContent = s;
        }
      };

      const headTyped = R.head.map((el, i) => prep(el, HEADER[i]));
      const divTyped = prep(R.div, DIVIDER);
      const headLen = HEADER[0].length + HEADER[1].length;

      const plan = rows.map(([, parts], ri) => {
        const row = rowNodes[ri];
        row.label.style.visibility = "hidden";
        let at = ROWS_START + ri * ROW_MS + ROW_MS; // the value starts a row-step after its label
        return parts.map((p, pi) => {
          const el = row.parts[pi];
          const start = at;
          if (p.k === "num") {
            const full = numText(p, p.n);
            el.style.display = "inline-block";
            el.style.width = `${full.length}ch`;
            el.style.visibility = "hidden";
            at += full.length * TYPE_MS;
            return { p, el, start, ri };
          }
          const text = p.text;
          el.style.visibility = "visible";
          at += text.length * TYPE_MS;
          return { p, el, start, typed: prep(el, text), ri };
        });
      });
      R.blocks.forEach((b) => b.classList.remove("nf-block--on"));

      const t0 = performance.now();
      let hopped = false;
      const frame = (now) => {
        const ms = now - t0;
        drawArt(ms);

        const head = clamp((ms - HEAD_START) / TYPE_MS, 0, headLen);
        headTyped[0].set(Math.min(head, HEADER[0].length));
        headTyped[1].set(Math.max(head - HEADER[0].length, 0));
        divTyped.set((ms - (HEAD_START + headLen * TYPE_MS)) / TYPE_MS);

        rowNodes.forEach((row, ri) => {
          if (ms >= ROWS_START + ri * ROW_MS) row.label.style.visibility = "visible";
        });
        plan.flat().forEach((item) => {
          if (ms < item.start) return;
          if (item.p.k === "num") {
            const target = item.p.id ? uptimeParts()[item.p.id] : item.p.n;
            item.el.style.visibility = "visible";
            item.el.textContent = numText(item.p, Math.round(target * easeOut(clamp((ms - item.start) / COUNT_MS, 0, 1))));
          } else item.typed.set((ms - item.start) / TYPE_MS);
        });

        R.blocks.forEach((b, i) => {
          if (ms >= BLOCKS_START + i * BLOCK_MS) b.classList.add("nf-block--on");
        });

        if (ms >= END_MS && !hopped) {
          hopped = true;
          finish(false);
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      drawArt(0);
      raf = requestAnimationFrame(frame);

      // The Enter that ran the command is still travelling up to the window when this mounts;
      // ignore events from before the reveal began.
      const skip = (e) => {
        if (e.timeStamp >= t0) finish(true);
      };
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
      off = () => {
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      off();
      io.disconnect();
      if (latest === ctl) latest = null;
    };
  }, [id, rows]);

  const finalText = useMemo(
    () => ["avinash@iitg", ...rows.map(([k, parts]) => `${k}: ${parts.map((p) => (p.k === "num" ? `${p.n}${p.s}` : p.text)).join("")}`)].join(". "),
    [rows]
  );

  return (
    <div className="term-neofetch" ref={root} role="img" aria-label={`neofetch. ${finalText}`}>
      <pre className="term-neofetch-art" ref={art} aria-hidden="true">
        {ART.join("\n")}
      </pre>
      <div className="nf-info" aria-hidden="true">
        <div>
          <strong className="term-strong" ref={(el) => (refs.current.head[0] = el)}>
            {HEADER[0]}
          </strong>
          <span ref={(el) => (refs.current.head[1] = el)}>{HEADER[1]}</span>
        </div>
        <div className="term-muted" ref={(el) => (refs.current.div = el)}>
          {DIVIDER}
        </div>
        {rows.map(([label, parts], ri) => (
          <div key={label}>
            <strong
              className="term-strong"
              ref={(el) => {
                refs.current.rows[ri] = refs.current.rows[ri] ?? { label: null, parts: [] };
                refs.current.rows[ri].label = el;
              }}
            >{`${label}: `}</strong>
            {parts.map((p, pi) => (
              <span
                key={pi}
                ref={(el) => {
                  refs.current.rows[ri] = refs.current.rows[ri] ?? { label: null, parts: [] };
                  refs.current.rows[ri].parts[pi] = el;
                }}
              >
                {p.k === "num" ? `${p.n}${p.s}` : p.text}
              </span>
            ))}
          </div>
        ))}
        <div className="nf-blocks">
          {Array.from({ length: BLOCKS }, (_, i) => (
            <span key={i} className={`nf-block nf-block--on nf-block--${i}`} ref={(el) => (refs.current.blocks[i] = el)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Neofetch;
