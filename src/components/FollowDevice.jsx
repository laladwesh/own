import { useEffect, useRef, useState } from "react";
import Tty from "../guide/Tty";
import { daemonEvent } from "../daemon/state";
import { discover } from "../terminal/discovery";
import { GITHUB_URL, GITHUB_USER, useFollowers } from "../lib/follow";

// AG-FOLLOW: a small dark desk device with a segment display and one key. GitHub cannot be followed
// from here (that needs the visitor's own login), so the key is a plain link that opens the profile
// in a new tab. The display shows the real follower count; hover previews "n -> n+1?", click rolls
// the digits up once while a tty bubble says thanks, then it settles back to the real count so the
// device never shows a follow that did not happen.
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ROLL_MS = 500;
const BUBBLE_MS = 3000;

// Each changed digit is a two-high strip (old over new); rolling slides the strip up by one digit.
const Odometer = ({ from, to, rolled }) => {
  const a = from.padStart(to.length, " ");
  return (
    <span className="follow-digits" aria-hidden="true">
      {[...to].map((c, i) =>
        a[i] === c ? (
          <span key={i} className="follow-digit">
            <span>{c}</span>
          </span>
        ) : (
          <span key={i} className="follow-digit">
            <span className={`follow-roll${rolled ? " follow-roll--up" : ""}`}>
              <span>{a[i]}</span>
              <span>{c}</span>
            </span>
          </span>
        )
      )}
    </span>
  );
};

const FollowDevice = ({ compact = false }) => {
  const count = useFollowers();
  const [peek, setPeek] = useState(false); // hover or keyboard focus on the key
  const [press, setPress] = useState("idle"); // idle | up | settling
  const [bubble, setBubble] = useState(false);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const known = typeof count === "number";
  const live = known ? String(count) : "--";
  const next = known ? String(count + 1) : "--";

  const onClick = () => {
    discover("follow");
    daemonEvent("hop");
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBubble(true);
    later(() => setBubble(false), BUBBLE_MS);
    if (!known) return;
    setPress("up");
    if (reduced()) {
      later(() => setPress("idle"), BUBBLE_MS);
      return;
    }
    later(() => setPress("settling"), BUBBLE_MS);
    later(() => setPress("idle"), BUBBLE_MS + ROLL_MS);
  };

  const still = reduced();
  let view;
  if (press === "up") view = still ? <span aria-hidden="true">{next}</span> : <Odometer from={live} to={next} rolled />;
  else if (press === "settling") view = <Odometer from={next} to={live} rolled />;
  else if (peek && known) view = <span aria-hidden="true">{`${live} → ${next}?`}</span>;
  else view = <span aria-hidden="true">{live}</span>;

  return (
    <div className={`follow${compact ? " follow--compact" : ""}`} role="group" aria-label="GitHub profile">
      <div className="follow-plate">
        <span className="follow-plate-id">AG-FOLLOW / github.com/{GITHUB_USER}</span>
      </div>
      <div className="follow-body">
        <div className="follow-window">
          {view}
          <span className="sr-only">{known ? `${count} followers` : "follower count unavailable"}</span>
        </div>
        <a
          className={`follow-key${press === "up" ? " follow-key--lit" : ""}`}
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Avinash on GitHub (opens in a new tab)"
          onPointerEnter={() => setPeek(true)}
          onPointerLeave={() => setPeek(false)}
          onFocus={() => setPeek(true)}
          onBlur={() => setPeek(false)}
          onClick={onClick}
        >
          <span className="follow-led" aria-hidden="true" />
          <span className="follow-cap" aria-hidden="true">
            + follow
          </span>
        </a>
      </div>
      {bubble && (
        <span className="follow-bubble" role="status">
          <Tty talking />
          <span>would make my day :)</span>
        </span>
      )}
    </div>
  );
};

export default FollowDevice;
