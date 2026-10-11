import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { navLinks } from "../constants";
import { scrollToSection } from "../lib/helperFunctions";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The sections and pages as numbered windows, like a tmux status line, hanging under the terminal.
// It tells a visitor there is more below the terminal and lets them jump straight to it. It stays
// empty until the terminal has finished its intro, then fills in one window at a time (once).
const WINDOWS = navLinks.filter((n) => n.primary || n.id === "incidents" || n.id === "notes");

const HeroNav = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(() => Boolean(window.__termReady));
  const [shown, setShown] = useState(() => (window.__termReady || reduced() ? WINDOWS.length + 1 : 0));

  useEffect(() => {
    if (ready) return undefined;
    const on = () => setReady(true);
    window.addEventListener("terminal-ready", on);
    return () => window.removeEventListener("terminal-ready", on);
  }, [ready]);

  // Once ready, the windows appear one after another.
  useEffect(() => {
    if (!ready || shown > WINDOWS.length) return undefined;
    const t = setTimeout(() => setShown((n) => n + 1), reduced() ? 0 : 90);
    return () => clearTimeout(t);
  }, [ready, shown]);

  const go = (n) => {
    if (n.to) navigate(n.to);
    else scrollToSection(n.id);
  };

  return (
    <nav className="tmux" aria-label="Sections below the terminal" data-ready={ready ? "1" : "0"}>
      <span className="tmux-session" style={{ visibility: shown > 0 ? "visible" : "hidden" }}>
        [avinash] 0:home*
      </span>
      <ul className="tmux-windows">
        {WINDOWS.map((n, i) => (
          <li key={n.id} style={{ visibility: shown > i + 1 ? "visible" : "hidden" }}>
            <button type="button" onClick={() => go(n)}>
              {i + 1}:{n.title}
            </button>
          </li>
        ))}
      </ul>
      <span className="tmux-hint" style={{ visibility: shown > WINDOWS.length ? "visible" : "hidden" }}>
        scroll for more &darr;
      </span>
    </nav>
  );
};

export default HeroNav;
