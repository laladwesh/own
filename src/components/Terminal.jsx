import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { aboutMe } from "../constants";
import { complete, execute } from "../terminal/engine.js";
import { pathString } from "../terminal/fs.js";
import { Snake } from "../terminal/ui.jsx";
import { scrollToSection } from "../lib/helperFunctions";
import { scope } from "../scope/scopeStore";

const role = aboutMe.tagLine.split(" | ").join(" / ");
const HOME = "avinash@iitg:~$";
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

// Each segment is one terminal line. `delay` is ms per character.
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

const Terminal = forwardRef(function Terminal(
  { maximized, draggable, dragging, barProps, onClose, onMinimize, onMaximize },
  ref
) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [step, setStep] = useState(reduce ? total : 0);
  const done = step >= total;
  const [cleared, setCleared] = useState(false);
  const [entries, setEntries] = useState([]);
  const [cwd, setCwdState] = useState([]);
  const [mode, setMode] = useState("shell");
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);

  const cwdRef = useRef([]);
  const unlockedRef = useRef(false);
  const histRef = useRef([]);
  const histIdx = useRef(0);
  const idRef = useRef(0);
  const konami = useRef(0);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  const prompt = `avinash@iitg:${pathString(cwd)}$`;

  // Intro typing.
  useEffect(() => {
    if (done) return;
    let i = 0;
    while (i + 1 < starts.length && starts[i + 1] <= step) i++;
    const wait = step === starts[i] ? 350 : segments[i].delay;
    const t = setTimeout(() => setStep((s) => s + 1), wait);
    return () => clearTimeout(t);
  }, [step, done]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [step, entries, value, mode]);

  const skip = useCallback(() => setStep(total), []);

  const push = useCallback((entry) => {
    idRef.current += 1;
    setEntries((prev) => [...prev, { id: idRef.current, ...entry }]);
  }, []);

  const setCwd = useCallback((path) => {
    cwdRef.current = path;
    setCwdState(path);
  }, []);

  const clearScreen = useCallback(() => {
    setCleared(true);
    setEntries([]);
  }, []);

  const run = useCallback(
    (line) => {
      skip();
      const trimmed = line.trim();
      const promptNow = `avinash@iitg:${pathString(cwdRef.current)}$`;
      let didClear = false;
      let node = null;
      if (trimmed) {
        histRef.current.push(trimmed);
        const ctx = {
          cwd: cwdRef.current,
          run,
          setCwd,
          clear: () => {
            didClear = true;
            clearScreen();
          },
          exit: () => setTimeout(onClose, 250),
          history: histRef.current,
          unlocked: unlockedRef.current,
          scrollTo: (id) => document.getElementById(id) && scrollToSection(id),
          openUrl: (u) => window.open(u, "_blank", "noopener,noreferrer"),
          openMail: (u) => {
            window.location.href = u;
          },
          startSnake: () => setMode("snake"),
        };
        try {
          node = execute(trimmed, ctx);
        } catch (err) {
          node = `error: ${err.message}`;
        }
      }
      histIdx.current = histRef.current.length;
      if (!didClear) push({ prompt: promptNow, cmd: trimmed, node });
    },
    [skip, setCwd, clearScreen, onClose, push]
  );

  useImperativeHandle(ref, () => ({ run }), [run]);

  // Konami code unlocks a hidden command.
  useEffect(() => {
    const onKey = (e) => {
      const expected = KONAMI[konami.current];
      if (e.key === expected || e.key.toLowerCase() === expected) {
        konami.current += 1;
        if (konami.current === KONAMI.length) {
          konami.current = 0;
          unlockedRef.current = true;
          push({ prompt: "", cmd: "", node: "konami code accepted. hidden commands unlocked. try 'help --all'." });
        }
      } else {
        konami.current = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [push]);

  // Typing during the intro skips it; the typed characters are kept for the prompt.
  const pending = useRef("");
  useEffect(() => {
    if (done) return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 && e.key !== " ") pending.current += e.key;
      if (e.key.length === 1 || e.key === "Enter") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, skip]);

  // The prompt is focused as soon as the intro ends, so the visitor can just type.
  const touch = useRef(window.matchMedia("(pointer: coarse)").matches);
  useEffect(() => {
    if (!done || mode !== "shell") return;
    if (pending.current) {
      setInput(pending.current);
      pending.current = "";
    }
    if (!touch.current) inputRef.current?.focus({ preventScroll: true });
  }, [done, mode]);

  // Typing anywhere on the page (outside other fields) goes to the prompt.
  useEffect(() => {
    if (!done || touch.current) return;
    const onKey = (e) => {
      const input = inputRef.current;
      if (!input || input.offsetParent === null) return; // terminal closed or minimised
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1 || e.key === " ") return;
      const a = document.activeElement;
      if (a && a !== document.body && (a.matches("input, textarea, select, button, a, [contenteditable]") || a.isContentEditable)) return;
      input.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [done]);

  const onWindowClick = () => {
    if (!done) return skip();
    if (!window.getSelection()?.toString()) inputRef.current?.focus();
  };

  const setInput = (v) => {
    setValue(v);
    setCaret(v.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(v.length, v.length));
  };

  const onKeyDown = (e) => {
    // Every keystroke shows up as a spike on the scope behind the page.
    if (e.key.length === 1 || e.key === "Backspace") scope.spike();
    if (e.key === "Enter") {
      e.preventDefault();
      run(value);
      setValue("");
      setCaret(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx.current > 0) setInput(histRef.current[--histIdx.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx.current < histRef.current.length - 1) setInput(histRef.current[++histIdx.current]);
      else {
        histIdx.current = histRef.current.length;
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      setInput(complete(value, cwdRef.current, unlockedRef.current));
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      clearScreen();
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      push({ prompt, cmd: `${value}^C`, node: null });
      setValue("");
      setCaret(0);
    }
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

  return (
    <div className={`term-window${maximized ? " term-window--max" : ""}`} onClick={onWindowClick}>
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
        {done ? (
          <span />
        ) : (
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
      </div>

      {/* Screen readers get the intro at once; the typed lines are hidden from them. */}
      <div className="sr-only">
        <h1>{aboutMe.name}</h1>
        <p>{role}</p>
        <p>{aboutMe.intro}</p>
      </div>

      <div className="term-body" ref={bodyRef}>
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
                  {execute("ls", { cwd: [], run, commands: [], unlocked: false })}
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

        {done && !cleared && <p className="term-line term-hint">type 'help' to explore</p>}

        <div role="log" aria-live="polite">
          {done &&
            entries.map((en) => (
              <div key={en.id} className="term-entry">
                {(en.prompt || en.cmd) && (
                  <p className="term-line term-cmd">
                    <span className="term-prompt">{en.prompt}</span> {en.cmd}
                  </p>
                )}
                {en.node != null && <div className="term-line term-res">{en.node}</div>}
              </div>
            ))}
        </div>

        {done && mode === "snake" && (
          <Snake
            onExit={(score) => {
              setMode("shell");
              push({ prompt, cmd: "snake", node: `score: ${score}` });
            }}
          />
        )}

        {done && mode === "shell" && (
          <div className="term-line term-cmd term-input-line">
            <span className="term-prompt" aria-hidden="true">
              {prompt}
            </span>{" "}
            <span aria-hidden="true">
              {value.slice(0, caret)}
              {cursor}
              {value.slice(caret)}
            </span>
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
                setValue(e.target.value);
                setCaret(e.target.selectionStart);
              }}
              onSelect={(e) => setCaret(e.target.selectionStart)}
              onKeyDown={onKeyDown}
            />
          </div>
        )}
      </div>

      <div className="term-statusbar" aria-hidden="true">
        <span>~/avinash</span>
        <span>/</span>
        <span>ECE'27</span>
        <span>/</span>
        <span>IIT Guwahati</span>
        <span>/</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
});

export default Terminal;
