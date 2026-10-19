import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { scrollToSection } from "../lib/helperFunctions";
import { guide } from "../guide/store";
import { useHuman } from "../view/store";
import Invite from "./Invite";
import { ghLink, followersText, useFollowers } from "../lib/follow";

// Under the terminal: the first plain pointers (human tuning), a link to the tour, and a small
// "next section" button. All of it stays out of sight until the terminal has finished its intro.
const NEXT = { id: "about", title: "about.yaml" };

// Plain suggestions that run the right command, so nobody has to type.
const SUGGEST = [
  ["see what I\u2019ve built", "kubectl get deployments"],
  ["how I handle problems", "incidents"],
  ["contact me", "cd contact"],
];

const HeroNav = () => {
  const human = useHuman();
  const followers = useFollowers();
  const [ready, setReady] = useState(() => Boolean(window.__termReady));

  useEffect(() => {
    if (ready) return undefined;
    const on = () => setReady(true);
    window.addEventListener("terminal-ready", on);
    return () => window.removeEventListener("terminal-ready", on);
  }, [ready]);

  const run = (cmd) => window.dispatchEvent(new CustomEvent("terminal-run", { detail: cmd }));

  // The slot keeps its height, so the terminal does not move when the buttons show up.
  return (
    <>
    <div className="tmux-slot">
      {ready && human && (
        <div className="hero-suggest" role="group" aria-label="Where to start">
          {SUGGEST.map(([label, cmd]) => (
            <button key={cmd} type="button" className="suggest-btn" onClick={() => run(cmd)}>
              {label}
            </button>
          ))}
        </div>
      )}
      {ready && (
        <button type="button" className="tmux-tour" onClick={() => guide.startTour()}>
          take a 60s tour
        </button>
      )}
      {ready && human && (
        <Link to="/summary" className="tmux-tour tmux-summary">
          one-page summary
        </Link>
      )}
      {ready && (
        <button type="button" className="tmux-next" onClick={() => scrollToSection(NEXT.id)} aria-label={`Scroll to the next section: ${NEXT.title}`}>
          next: {NEXT.title} &darr;
        </button>
      )}
    </div>
    <Invite as="p" priority={3} className={`hero-gh${ready ? "" : " hero-gh--wait"}`}>
      ~/github &rarr; laladwesh{followersText(followers) && ` (${followersText(followers)})`} [ <a {...ghLink}>follow &#8599;</a> ]
    </Invite>
    </>
  );
};

export default HeroNav;
