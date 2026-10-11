import { useEffect, useState } from "react";
import { scrollToSection } from "../lib/helperFunctions";

// A small "next section" button in the corner under the terminal. It stays out of sight while
// the terminal types its intro, then appears once, and scrolls to the first section below.
const NEXT = { id: "about", title: "about.yaml" };

const HeroNav = () => {
  const [ready, setReady] = useState(() => Boolean(window.__termReady));

  useEffect(() => {
    if (ready) return undefined;
    const on = () => setReady(true);
    window.addEventListener("terminal-ready", on);
    return () => window.removeEventListener("terminal-ready", on);
  }, [ready]);

  // The slot keeps its height, so the terminal does not move when the button shows up.
  return (
    <div className="tmux-slot">
      {ready && (
        <button type="button" className="tmux-next" onClick={() => scrollToSection(NEXT.id)} aria-label={`Scroll to the next section: ${NEXT.title}`}>
          next: {NEXT.title} &darr;
        </button>
      )}
    </div>
  );
};

export default HeroNav;
