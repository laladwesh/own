import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { aboutMe, socialMedia } from "../constants";
import { completeInfo, execute, ghostFor, visible } from "../terminal/engine.js";
import { pathString } from "../terminal/fs.js";
import { Ext, Lines, Run, Snake } from "../terminal/ui.jsx";
import { createSession, promptOf, step as replayStep, suggestions as replaySuggestions } from "../terminal/replay.js";
import { Htop, TypeSpeed, Vim } from "../terminal/modes.jsx";
import { discover as discoverId, getDiscovered, total as discoverTotal } from "../terminal/discovery.js";
import { GROUPS } from "../terminal/groups.js";
import { countLines } from "../terminal/text.js";
import { scrollToSection } from "../lib/helperFunctions";
import { now } from "../constants/now";
import { getPresence, subscribePresence } from "../presence/store";
import { scope } from "../scope/scopeStore";

const role = aboutMe.tagLine.split(" | ").join(" / ");
const HOME = "avinash@iitg:~$";
const MAX_LINES = 500;
const THEME_KEY = "term-theme";
const SPRING = { type: "spring", stiffness: 300, damping: 30 };
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const GHOSTS = ["tour", "help", "now", "ssh recruiter@avinash", "deploy", "neofetch", "achievements"];
const mail = socialMedia.find((s) => s.label === "Email (Gmail)")?.link;

// The guided tour: it types each command itself and scrolls the page to the section.
const TOUR = [
  { cmd: "whoami", scroll: "home", note: "Start here. The terminal is the front door; every section of the page is also a command." },
  { cmd: "cat avinash.yaml", scroll: "about", note: "About me, written as a YAML manifest. The -o wide toggle shows a plain version." },
  { cmd: "gh run view", scroll: "pipeline", note: "Experience as a CI/CD run: each organisation is a stage, each role is a job." },
  { cmd: "cat Dockerfile", scroll: "skills", note: "Skills as a Dockerfile. Tools I only study live in a separate LEARNING argument." },
  { cmd: "kubectl get deployments", scroll: "deployments", note: "Projects as deployments. Running means the project has a live link." },
  { cmd: "docker images", scroll: "images", note: "Every other repository, filterable by category." },
  { cmd: "gh release list", scroll: "releases", note: "Achievements, written as release notes." },
  { cmd: "git log", scroll: "openSource", note: "Open-source pull requests, drawn as a git graph." },
  { cmd: "cat .github/workflows/deploy.yml", scroll: "ships", note: "How this very site ships: the real GitHub Actions workflow." },
  { cmd: "cat service.yaml", scroll: "contact", note: "And how to reach me. Try: ssh recruiter@avinash" },
];

// Each segment is one terminal line of the typed intro. `delay` is ms per character.
const segments = [
  { kind: "cmd", text: "whoami", delay: 30 },
  { kind: "name", text: aboutMe.name, delay: 30 },
  { kind: "cmd", text: "cat about.txt", delay: 30 },
  { kind: "out", text: role, delay: 14 },
  { kind: "out", text: aboutMe.intro, delay: 8 },
  { kind: "cmd", text: "ls", delay: 30 },
  { kind: "ls", text: "x", delay: 200 },
];

const starts = segments.reduce((acc, _, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + segments[i - 1].text.length);
  return acc;
}, []);
const total = segments.reduce((n, s) => n + s.text.length, 0);

const cursor = <span className="term-cursor" aria-hidden="true" />;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// One finished command (or a toast). Memoised, so typing never re-renders the log.
const Entry = memo(function Entry({ en }) {
  if (en.toast) return <p className="term-line term-toast">{en.toast}</p>;
  return (
    <div className="term-entry">
      {(en.prompt || en.cmd) && (
        <p className="term-line term-cmd">
          <span className="term-prompt">{en.prompt}</span> {en.cmd}
        </p>
      )}
      {en.node != null && <div className="term-line term-res">{en.node}</div>}
    </div>
  );
});

// ───────────── command palette (lives inside the terminal window) ─────────────
const rank = (c, q) => {
  const n = c.name.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.includes(q)) return 2;
  if ((c.summary ?? "").toLowerCase().includes(q)) return 3;
  return 9;
};

const Palette = ({ commands, onRun, onClose }) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const listRef = useRef(null);
  const touch = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      return GROUPS.flatMap(([key, title]) => {
        const items = commands.filter((c) => c.group === key);
        return items.length ? [{ header: title }, ...items.map((c) => ({ c }))] : [];
      });
    }
    return commands
      .map((c) => ({ c, r: rank(c, query) }))
      .filter((x) => x.r < 9)
      .sort((a, b) => a.r - b.r || a.c.name.localeCompare(b.c.name))
      .map(({ c }) => ({ c }));
  }, [commands, q]);

  const items = rows.filter((r) => r.c);
  const safeSel = Math.min(sel, Math.max(items.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [safeSel, q]);

  const onKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = items[safeSel]?.c;
      if (c) onRun(c.example ?? c.name);
    }
  };

  let index = -1;
  return (
    <motion.div
      className="term-palette"
      role="dialog"
      aria-label="Command palette"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={SPRING}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        className="term-palette-input"
        name="palette-search"
        aria-label="Search commands"
        placeholder="search commands"
        autoComplete="off"
        spellCheck={false}
        autoFocus={!touch}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setSel(0);
        }}
        onKeyDown={onKey}
      />
      <div className="term-palette-list" role="listbox" ref={listRef}>
        {rows.map((r) => {
          if (r.header) return <div key={`h-${r.header}`} className="term-palette-group">{r.header}</div>;
          index += 1;
          const i = index;
          return (
            <button
              key={r.c.name}
              type="button"
              role="option"
              aria-selected={i === safeSel}
              className="term-palette-row"
              onMouseMove={() => setSel(i)}
              onClick={() => onRun(r.c.example ?? r.c.name)}
            >
              <span className="term-palette-cmd">{r.c.name}</span>
              <span className="term-palette-desc">{r.c.summary}</span>
            </button>
          );
        })}
        {!items.length && <div className="term-palette-empty">no command matches "{q}"</div>}
      </div>
    </motion.div>
  );
};

// ───────────── the terminal ─────────────
const Terminal = forwardRef(function Terminal(
  { maximized, draggable, dragging, barProps, onClose, onMinimize, onMaximize },
  ref
) {
  const [step, setStep] = useState(() => (reduced() ? total : 0));
  const done = step >= total;
  const [cleared, setCleared] = useState(false);
  const [entries, setEntries] = useState([]);
  const [cwd, setCwdState] = useState([]);
  const [mode, setMode] = useState(null); // snake | vim | htop | typespeed
  const [ask, setAsk] = useState(null); // { spec, i, answers }
  const presence = useSyncExternalStore(subscribePresence, getPresence);
  const [replay, setReplay] = useState(null); // an incident replay in progress (see terminal/replay.js)
  const replayRef = useRef(null);
  replayRef.current = replay;
  const [tour, setTour] = useState(null); // { i }
  const [search, setSearch] = useState(null); // { q, idx }
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);
  const [tabList, setTabList] = useState(null);
  const [palette, setPalette] = useState(false);
  const [ghostIdx, setGhostIdx] = useState(0);
  const [newOutput, setNewOutput] = useState(false);
  const [theme, setThemeState] = useState(() => {
    try {
      return sessionStorage.getItem(THEME_KEY) || "amber";
    } catch {
      return "amber";
    }
  });
  const [histVersion, setHistVersion] = useState(0);

  const cwdRef = useRef([]);
  const unlockedRef = useRef(false);
  const histRef = useRef([]);
  const histIdx = useRef(0);
  const idRef = useRef(0);
  const konami = useRef(0);
  const hasTyped = useRef(false);
  const stick = useRef(true);
  const toasts = useRef([]);
  const tourToken = useRef({ cancel: false });
  const typingTimer = useRef(0);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const contentRef = useRef(null);
  const lineRef = useRef(null);
  const themeRef = useRef(theme);
  const paletteRef = useRef(false);
  const touch = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);

  themeRef.current = theme;
  paletteRef.current = palette;
  const prompt = `avinash@iitg:${pathString(cwd)}$`;

  // ── intro typing ──
  useEffect(() => {
    if (done) return undefined;
    let i = 0;
    while (i + 1 < starts.length && starts[i + 1] <= step) i++;
    const wait = step === starts[i] ? 350 : segments[i].delay;
    const t = setTimeout(() => setStep((s) => s + 1), wait);
    return () => clearTimeout(t);
  }, [step, done]);

  const skip = useCallback(() => setStep(total), []);

  // ── log helpers ──
  const push = useCallback((entry) => {
    idRef.current += 1;
    const lines = (entry.node != null ? countLines(entry.node) : 0) + (entry.cmd || entry.prompt || entry.toast ? 1 : 0);
    setEntries((prev) => {
      const next = [...prev, { id: idRef.current, lines, ...entry }];
      let sum = next.reduce((a, e) => a + e.lines, 0);
      while (sum > MAX_LINES && next.length > 1) sum -= next.shift().lines;
      return next;
    });
  }, []);

  const flushToasts = useCallback(() => {
    const list = toasts.current;
    toasts.current = [];
    list.forEach((t) => push(t));
  }, [push]);

  const discover = useCallback((id) => {
    const found = discoverId(id);
    if (!found) return;
    toasts.current.push({ toast: `[unlocked] ${found.label}` });
    if (getDiscovered().size === discoverTotal) {
      toasts.current.push({
        node: (
          <div>
            <div>[unlocked] everything. {discoverTotal} / {discoverTotal} discovered.</div>
            <div>
              You found it all. Say hello: <Ext href={mail}>{mail.replace("mailto:", "")}</Ext>
            </div>
          </div>
        ),
      });
    }
  }, []);

  const setCwd = useCallback((path) => {
    cwdRef.current = path;
    setCwdState(path);
  }, []);

  const clearScreen = useCallback(() => {
    setCleared(true);
    setEntries([]);
  }, []);

  const setTheme = useCallback((name) => {
    setThemeState(name);
    try {
      sessionStorage.setItem(THEME_KEY, name);
    } catch {
      /* ignore */
    }
  }, []);

  const setInput = useCallback((v, pos) => {
    setValue(v);
    const p = pos ?? v.length;
    setCaret(p);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(p, p));
  }, []);

  // ── running a line ──
  const runRef = useRef(null);

  // While a replay is running, every line goes to the replay engine instead of the shell.
  const runReplay = useCallback(
    (input) => {
      const cur = replayRef.current;
      if (!cur) return;
      const res = replayStep(cur, input);
      stick.current = true;
      const lines = [...res.lines];
      if (res.completed && res.link) {
        lines.push(
          <span key="postmortem">
            {res.link.text} &rarr;{" "}
            <Run cmd={res.link.cmd} run={(c) => runRef.current(c)}>
              {res.link.path}
            </Run>
          </span>
        );
      }
      push({ prompt: promptOf(cur), cmd: input, node: lines.length ? <Lines lines={lines} /> : null });
      replayRef.current = res.ended ? null : res.session;
      setReplay(replayRef.current);
      if (res.completed) discover("replay");
      flushToasts();
    },
    [push, discover, flushToasts]
  );
  const run = useCallback(
    (line) => {
      skip();
      setPalette(false);
      setTabList(null);
      const trimmed = line.trim();
      if (replayRef.current) {
        runReplay(trimmed);
        return;
      }
      const promptNow = `avinash@iitg:${pathString(cwdRef.current)}$`;
      let didClear = false;
      let node = null;
      if (trimmed) {
        histRef.current.push(trimmed);
        setHistVersion((v) => v + 1);
        const ctx = {
          cwd: cwdRef.current,
          run: (cmd) => runRef.current(cmd),
          setCwd,
          clear: () => {
            didClear = true;
            clearScreen();
          },
          exit: () => setTimeout(onClose, 250),
          history: histRef.current,
          unlocked: unlockedRef.current,
          theme: themeRef.current,
          setTheme,
          discover,
          scrollTo: (id) => document.getElementById(id) && scrollToSection(id),
          navigate: (path) => navigateRef.current(path),
          openUrl: (u) => window.open(u, "_blank", "noopener,noreferrer"),
          openMail: (u) => {
            window.location.href = u;
          },
          startSnake: () => setMode("snake"),
          startMode: (m) => setMode(m),
          startTour: () => startTourRef.current(),
          ask: (spec) => setAsk({ spec, i: 0, answers: {} }),
          startReplay: (script) => {
            const s = createSession(script);
            replayRef.current = s;
            setReplay(s);
            return s;
          },
        };
        try {
          node = execute(trimmed, ctx);
        } catch (err) {
          node = `error: ${err.message}`;
        }
      }
      histIdx.current = histRef.current.length;
      stick.current = true;
      if (!didClear) push({ prompt: promptNow, cmd: trimmed, node });
      flushToasts();
    },
    [skip, setCwd, clearScreen, onClose, push, discover, flushToasts, setTheme, runReplay]
  );
  runRef.current = run;
  useImperativeHandle(ref, () => ({ run }), [run]);

  // ── guided tour ──
  const startTourRef = useRef(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // /?replay=INC-001 (the link on an incident report) starts that replay in this terminal.
  const location = useLocation();
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("replay");
    if (!id) return undefined;
    const t = setTimeout(() => {
      runRef.current(`replay ${id}`);
      navigateRef.current({ pathname: "/", search: "" }, { replace: true });
    }, 400);
    return () => clearTimeout(t);
  }, [location.search]);
  startTourRef.current = () => {
    const token = { cancel: false };
    tourToken.current = token;
    (async () => {
      const fast = reduced();
      await sleep(fast ? 0 : 400);
      for (let i = 0; i < TOUR.length; i++) {
        if (token.cancel) return;
        const s = TOUR[i];
        setTour({ i });
        scrollToSection(s.scroll);
        await sleep(fast ? 0 : 900);
        for (let c = 1; c <= s.cmd.length && !fast; c++) {
          if (token.cancel) return;
          setInput(s.cmd.slice(0, c));
          await sleep(32);
        }
        if (token.cancel) return;
        await sleep(fast ? 0 : 250);
        setInput("");
        runRef.current(s.cmd);
        await sleep(fast ? 0 : 2800);
      }
      if (!token.cancel) {
        scrollToSection("home");
        setTour(null);
        push({ node: "tour finished. try: help, achievements, or ssh recruiter@avinash" });
      }
    })();
  };

  const stopTour = useCallback(() => {
    tourToken.current.cancel = true;
    setTour(null);
    setInput("");
    scrollToSection("home");
  }, [setInput]);

  useEffect(() => {
    if (!tour) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        stopTour();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tour, stopTour]);

  // ── mode exits ──
  const exitMode = useCallback(
    (name, result) => {
      setMode(null);
      if (name === "snake") push({ prompt, cmd: "snake", node: `score: ${result}` });
      else if (name === "vim") {
        push({ prompt, cmd: "vim", node: result });
        discover("vim");
      } else if (name === "typespeed") {
        if (result?.cancelled) push({ prompt, cmd: "typespeed", node: "cancelled." });
        else {
          push({
            prompt,
            cmd: "typespeed",
            node: `${result.wpm} WPM  /  accuracy ${result.accuracy}%  /  best this session ${result.best} WPM${result.newBest ? "  (new best)" : ""}`,
          });
          discover("typespeed");
        }
      } else push({ prompt, cmd: name, node: null });
      flushToasts();
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    },
    [push, prompt, discover, flushToasts]
  );

  // ── konami code, and typing during the intro skips it ──
  useEffect(() => {
    const onKey = (e) => {
      const expected = KONAMI[konami.current];
      if (e.key === expected || e.key.toLowerCase() === expected) {
        konami.current += 1;
        if (konami.current === KONAMI.length) {
          konami.current = 0;
          unlockedRef.current = true;
          push({ toast: "[unlocked] a hidden command. try 'help --all'" });
        }
      } else konami.current = e.key === KONAMI[0] ? 1 : 0;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [push]);

  const pending = useRef("");
  useEffect(() => {
    if (done) return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 && e.key !== " ") pending.current += e.key;
      if (e.key.length === 1 || e.key === "Enter") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, skip]);

  // The prompt is focused as soon as the intro ends.
  useEffect(() => {
    if (!done || mode) return;
    if (pending.current) {
      setInput(pending.current);
      pending.current = "";
    }
    if (!touch) inputRef.current?.focus({ preventScroll: true });
  }, [done, mode, touch, setInput]);

  // Typing anywhere on the page goes to the prompt; Ctrl/Cmd+K opens the palette.
  useEffect(() => {
    if (!done) return undefined;
    const onKey = (e) => {
      const input = inputRef.current;
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        if (input || paletteRef.current) {
          e.preventDefault();
          setPalette((p) => !p);
        }
        return;
      }
      if (!input || touch || input.offsetParent === null) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1 || e.key === " ") return;
      const a = document.activeElement;
      if (a && a !== document.body && (a.matches("input, textarea, select, button, a, [contenteditable]") || a.isContentEditable)) return;
      input.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [done, touch]);

  // ── auto-scroll: follow the output only while the reader is at the bottom ──
  useEffect(() => {
    const body = bodyRef.current;
    const content = contentRef.current;
    if (!body || !content) return undefined;
    const atBottom = () => body.scrollTop + body.clientHeight >= body.scrollHeight - 24;
    const onScroll = () => {
      stick.current = atBottom();
      if (stick.current) setNewOutput(false);
    };
    const ro = new ResizeObserver(() => {
      if (stick.current) body.scrollTop = body.scrollHeight;
      else setNewOutput(true);
    });
    ro.observe(content);
    body.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      body.removeEventListener("scroll", onScroll);
    };
  }, []);

  const jumpToBottom = () => {
    const body = bodyRef.current;
    stick.current = true;
    setNewOutput(false);
    body.scrollTo({ top: body.scrollHeight, behavior: reduced() ? "auto" : "smooth" });
  };

  // ── ghost suggestion ──
  useEffect(() => {
    if (!done || value || hasTyped.current || mode || ask || search || palette || tour) return undefined;
    const id = setInterval(() => setGhostIdx((i) => (i + 1) % GHOSTS.length), 4000);
    return () => clearInterval(id);
  }, [done, value, mode, ask, search, palette, tour]);

  const interactive = done && !mode && !ask && !search && !palette && !tour;
  const atEnd = caret >= value.length;
  const ghostText = useMemo(() => {
    if (!interactive || !atEnd) return "";
    if (replay) {
      const c = replaySuggestions(replay).find((x) => x.startsWith(value) && x.length > value.length);
      return c ? c.slice(value.length) : "";
    }
    if (!value) return GHOSTS[ghostIdx];
    return ghostFor(value, cwdRef.current, unlockedRef.current, histRef.current);
  }, [interactive, atEnd, value, ghostIdx, cwd, histVersion, replay]); // eslint-disable-line react-hooks/exhaustive-deps

  const acceptGhost = useCallback(
    (andRun) => {
      if (!ghostText) return;
      const full = value + ghostText;
      if (andRun) {
        setInput("");
        run(full);
      } else setInput(full);
    },
    [ghostText, value, run, setInput]
  );

  // ── keyboard ──
  const markTyping = () => {
    const el = lineRef.current;
    if (!el) return;
    el.classList.add("typing");
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => el.classList.remove("typing"), 700);
  };

  const searchMatch = (s) => {
    if (!s || !s.q) return "";
    const hits = [...histRef.current].reverse().filter((h2, i, arr) => h2.includes(s.q) && arr.indexOf(h2) === i);
    return hits.length ? hits[s.idx % hits.length] : "";
  };

  const submit = () => {
    if (ask) {
      const { spec, i, answers } = ask;
      const stepDef = spec.steps[i];
      const val = value.trim();
      push({ prompt: stepDef.label, cmd: val });
      const next = { ...answers, [stepDef.key]: val };
      setInput("");
      stick.current = true;
      if (i + 1 < spec.steps.length) setAsk({ spec, i: i + 1, answers: next });
      else {
        setAsk(null);
        discover("ssh");
        push({ node: spec.done(next) });
        flushToasts();
      }
      return;
    }
    run(value);
    setInput("");
  };

  const onKeyDown = (e) => {
    const mod = e.ctrlKey || e.metaKey;
    markTyping();
    if (e.key.length === 1 || e.key === "Backspace") {
      scope.spike();
      hasTyped.current = true;
    }

    // reverse history search
    if (search) {
      if (e.key === "Escape" || (e.ctrlKey && e.key === "g")) {
        e.preventDefault();
        setSearch(null);
      } else if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        setSearch((s) => ({ ...s, idx: s.idx + 1 }));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const m = searchMatch(search);
        setSearch(null);
        if (m) {
          setInput("");
          run(m);
        }
      } else if (e.key === "Tab" || e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const m = searchMatch(search);
        setSearch(null);
        if (m) setInput(m);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setSearch((s) => ({ q: s.q.slice(0, -1), idx: 0 }));
      } else if (e.key.length === 1 && !mod) {
        e.preventDefault();
        setSearch((s) => ({ q: s.q + e.key, idx: 0 }));
      } else if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        setSearch(null);
      }
      return;
    }

    if (e.key !== "Tab") setTabList(null);

    if (mod && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      setPalette(true);
    } else if (e.key === "?" && value === "" && !ask) {
      e.preventDefault();
      setPalette(true);
    } else if (e.ctrlKey && e.key === "r" && !ask) {
      e.preventDefault();
      setSearch({ q: "", idx: 0 });
    } else if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
      setInput(value, 0);
    } else if (e.ctrlKey && e.key === "e") {
      e.preventDefault();
      setInput(value, value.length);
    } else if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      const dir = e.key === "ArrowLeft" ? -1 : 1;
      let p = caret;
      if (dir < 0) {
        while (p > 0 && value[p - 1] === " ") p--;
        while (p > 0 && value[p - 1] !== " ") p--;
      } else {
        while (p < value.length && value[p] === " ") p++;
        while (p < value.length && value[p] !== " ") p++;
      }
      setInput(value, p);
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp" && !ask && !replay) {
      e.preventDefault();
      if (histIdx.current > 0) setInput(histRef.current[--histIdx.current]);
    } else if (e.key === "ArrowDown" && !ask && !replay) {
      e.preventDefault();
      if (histIdx.current < histRef.current.length - 1) setInput(histRef.current[++histIdx.current]);
      else {
        histIdx.current = histRef.current.length;
        setInput("");
      }
    } else if (e.key === "ArrowRight" && atEnd && ghostText) {
      e.preventDefault();
      acceptGhost(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (ask) return;
      if (replay) {
        // Tab walks through the ideas for this step that start with what you typed.
        const list = replaySuggestions(replay).filter((x) => x.startsWith(value) || x === value);
        if (list.length) {
          const at = list.indexOf(value);
          setInput(list[(at + 1) % list.length]);
        }
        return;
      }
      if (ghostText) {
        acceptGhost(false);
        return;
      }
      const info = completeInfo(value, cwdRef.current, unlockedRef.current);
      if (info.completed !== value) setInput(info.completed);
      else if (info.matches.length > 1) setTabList(info.matches);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      clearScreen();
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      if (ask) {
        push({ prompt: ask.spec.steps[ask.i].label, cmd: `${value}^C` });
        push({ node: "cancelled." });
        setAsk(null);
      } else if (replay) {
        push({ prompt: promptOf(replay), cmd: `${value}^C` });
        push({ node: "replay ended. Nothing was harmed." });
        replayRef.current = null;
        setReplay(null);
      } else push({ prompt, cmd: `${value}^C`, node: null });
      setInput("");
    }
  };

  const onWindowClick = () => {
    if (!done) return skip();
    if (palette) return;
    if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
  };

  const light = (cls, label, symbol, onClick) => (
    <button
      type="button"
      className={`term-light ${cls}`}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span aria-hidden="true">{symbol}</span>
    </button>
  );

  const paletteCommands = useMemo(() => visible(false).filter((c) => !c.secret && !c.hidden), []);
  const closePalette = () => {
    setPalette(false);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };
  const runFromPalette = (cmd) => {
    setPalette(false);
    setInput("");
    run(cmd);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  const promptLabel = ask ? ask.spec.steps[ask.i].label : replay ? promptOf(replay) : prompt;
  const searchHit = search ? searchMatch(search) : "";

  return (
    <div
      className={`term-window${maximized ? " term-window--max" : ""}`}
      data-theme={theme}
      onClick={onWindowClick}
    >
      <div
        className={`term-bar${draggable ? " term-bar--drag" : ""}${dragging ? " term-bar--dragging" : ""}`}
        {...barProps}
      >
        <span className="term-lights">
          {light("term-light--close", "Close terminal", "×", onClose)}
          {light("term-light--min", "Minimize terminal", "−", onMinimize)}
          {light("term-light--max", maximized ? "Restore terminal size" : "Maximize terminal", "+", onMaximize)}
        </span>
        <span className="term-title">avinash@iitg: {pathString(cwd)}</span>
        <span className="term-bar-right">
          {!done && (
            <button
              type="button"
              className="term-skip"
              onClick={(e) => {
                e.stopPropagation();
                skip();
              }}
            >
              skip
            </button>
          )}
          <button
            type="button"
            className="term-close"
            aria-label="Close terminal"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            close ×
          </button>
        </span>
      </div>

      {/* Screen readers get the intro at once; the typed lines are hidden from them. */}
      <div className="sr-only">
        <h1>{aboutMe.name}</h1>
        <p>{role}</p>
        <p>{aboutMe.intro}</p>
      </div>

      <div className="term-body" ref={bodyRef}>
        <div ref={contentRef}>
          {!cleared &&
            segments.map((seg, i) => {
              const shown = step - starts[i];
              if (shown < 0) return null;
              const text = seg.text.slice(0, shown);
              const active = !done && shown < seg.text.length;

              if (seg.kind === "cmd") {
                return (
                  <p key={i} className="term-line term-cmd" aria-hidden="true">
                    <span className="term-prompt">{HOME}</span> {text}
                    {active && cursor}
                  </p>
                );
              }
              if (seg.kind === "name") {
                return (
                  <p key={i} className="term-line term-out term-out--name" aria-hidden="true">
                    <span className="term-name" translate="no">
                      {text}
                    </span>
                    {active && cursor}
                  </p>
                );
              }
              if (seg.kind === "ls") {
                return (
                  <div key={i} className="term-line term-res">
                    {execute("ls", { cwd: [], run: (c) => runRef.current(c), commands: [], unlocked: false })}
                  </div>
                );
              }
              return (
                <p key={i} className="term-line term-out" aria-hidden="true">
                  <span>
                    {text}
                    {active && cursor}
                  </span>
                </p>
              );
            })}

          <div role="log" aria-live="polite">
            {done && entries.map((en) => <Entry key={en.id} en={en} />)}
          </div>

          {done && mode === "snake" && <Snake onExit={(score) => exitMode("snake", score)} />}
          {done && mode === "vim" && <Vim onExit={(msg) => exitMode("vim", msg)} />}
          {done && mode === "htop" && <Htop onExit={() => exitMode("htop")} />}
          {done && mode === "typespeed" && <TypeSpeed onExit={(r) => exitMode("typespeed", r)} />}

          {done && !mode && (
            <div ref={lineRef} className="term-line term-cmd term-input-line">
              {search ? (
                <span aria-hidden="true">
                  <span className="term-prompt">(reverse-i-search)</span>`{search.q}': {searchHit}
                  {cursor}
                </span>
              ) : (
                <>
                  <span className="term-prompt" aria-hidden="true">
                    {promptLabel}
                  </span>{" "}
                  <span aria-hidden="true">
                    {value.slice(0, caret)}
                    {cursor}
                    {value.slice(caret)}
                    <AnimatePresence mode="wait" initial={false}>
                      {ghostText && (
                        <motion.span
                          key={`${ghostIdx}-${value.length === 0 ? "e" : "t"}`}
                          className="term-ghost"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          onPointerUp={touch ? () => acceptGhost(true) : undefined}
                        >
                          {ghostText}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </>
              )}
              <input
                ref={inputRef}
                className="term-input"
                name="command"
                aria-label="Terminal command"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={value}
                onChange={(e) => {
                  if (search) return;
                  setValue(e.target.value);
                  setCaret(e.target.selectionStart);
                }}
                onSelect={(e) => setCaret(e.target.selectionStart)}
                onKeyDown={onKeyDown}
              />
            </div>
          )}

          {tabList && (
            <p className="term-line term-tablist" aria-hidden="true">
              {tabList.join("   ")}
            </p>
          )}
        </div>
      </div>

      {newOutput && (
        <button type="button" className="term-newout" onClick={(e) => { e.stopPropagation(); jumpToBottom(); }}>
          ↓ new output
        </button>
      )}

      <div className="term-statusbar">
        <span aria-hidden="true" className="term-status-left">
          ~/avinash  /  ECE'27  /  IIT Guwahati  /  UTF-8
        </span>
        <span className="term-status-hint">
          <button
            type="button"
            className="term-run"
            onClick={(e) => {
              e.stopPropagation();
              setPalette(true);
            }}
          >
            ? commands
          </button>
          {"  /  tab complete"}
          {presence.connected && presence.online.total > 0 && `  /  ${presence.online.total} online`}
          {now.lookingForShort && `  /  open to: ${now.lookingForShort}`}
        </span>
      </div>

      <AnimatePresence>
        {palette && <Palette commands={paletteCommands} onRun={runFromPalette} onClose={closePalette} />}
      </AnimatePresence>

      {tour &&
        createPortal(
          <div className="tour-caption" role="status">
            <span className="tour-step">
              tour {tour.i + 1}/{TOUR.length}
            </span>{" "}
            {TOUR[tour.i].note} <span className="tour-stop">Esc stops</span>
          </div>,
          document.body
        )}
    </div>
  );
});

export default Terminal;

