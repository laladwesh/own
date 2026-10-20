import { useRef, useState } from "react";
import { setTune, useTune } from "../view/store";

// The tuning dial: a small dark device with a round knob and two engraved positions, ENGINEER
// (the raw signal) and HUMAN (the clean one). Click, drag or use the arrow keys; the knob swings
// to the new position with a short spring. It is a proper switch for screen readers.
const ANGLE = { engineer: -42, human: 42 };
const SPRING = "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Knob = ({ size, tune, drag, onPointerDown, onPointerMove, onPointerUp, onKeyDown }) => {
  const human = tune === "human";
  const angle = drag ?? ANGLE[tune];
  return (
    <svg
      className="tune-knob"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="switch"
      aria-checked={human}
      aria-label="Tune the site for humans"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* the engraved scale: ticks at both ends, a dot between */}
      <g stroke="#5A5A5A" strokeWidth="1.4" strokeLinecap="round" fill="none">
        {[-42, -28, -14, 0, 14, 28, 42].map((a) => (
          <path key={a} d="M50 6 V12" transform={`rotate(${a} 50 50)`} stroke={a === ANGLE[tune] ? "#E8A33D" : "#5A5A5A"} />
        ))}
      </g>
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50px 50px", transition: drag === null && !reduced() ? SPRING : "none" }}>
        <circle cx="50" cy="50" r="30" fill="#1B1B1B" stroke="#3A3A3A" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="25" fill="#141414" stroke="#0A0A0A" strokeWidth="1" />
        {/* a knurled rim */}
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} d="M50 21 V25" stroke="#2C2C2C" strokeWidth="1.5" transform={`rotate(${i * 15} 50 50)`} />
        ))}
        <path d="M50 24 V42" stroke="#E8A33D" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
};

const TuneDial = ({ compact = false }) => {
  const tune = useTune();
  const [drag, setDrag] = useState(null);
  const gesture = useRef(null);

  const toggle = () => setTune(tune === "human" ? "engineer" : "human");

  // Drag: the knob follows the pointer's angle (limited to the two ends) and snaps on release.
  const angleOf = (e, el) => {
    const r = el.getBoundingClientRect();
    const deg = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
    return Math.max(-42, Math.min(42, deg));
  };
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { moved: false, x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g) return;
    if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 5) return;
    g.moved = true;
    setDrag(angleOf(e, e.currentTarget));
  };
  const onPointerUp = (e) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.moved) {
      const a = angleOf(e, e.currentTarget);
      setDrag(null);
      setTune(a > 0 ? "human" : "engineer");
    } else toggle();
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") setTune("engineer");
    else if (e.key === "ArrowRight") setTune("human");
    else if (e.key === "Enter" || e.key === " ") toggle();
    else return;
    e.preventDefault();
  };

  const knob = (size) => (
    <Knob size={size} tune={tune} drag={drag} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onKeyDown={onKeyDown} />
  );
  const labels = (
    <span className="tune-pos" aria-hidden="true">
      <span className={tune === "engineer" ? "tune-pos--on" : undefined}>ENGINEER</span>
      <span className={tune === "human" ? "tune-pos--on" : undefined}>HUMAN</span>
    </span>
  );

  if (compact) {
    return (
      <div className="tune-dial tune-dial--compact">
        <span className="tune-plate">SIGNAL / AG-TUNE</span>
        {knob(40)}
        {labels}
      </div>
    );
  }
  return (
    <div className="tune-dial">
      <span className="tune-plate">SIGNAL / AG-TUNE</span>
      {knob(96)}
      {labels}
    </div>
  );
};

export default TuneDial;
