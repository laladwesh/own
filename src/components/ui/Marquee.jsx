/**
 * Infinite horizontal marquee. Duplicates children once and translates -50%,
 * so the loop is seamless. Pauses on hover. CSS-driven (no JS rAF).
 */
const Marquee = ({ children, className = "", reverse = false, speed = 38 }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex w-max items-center gap-6 hover:[animation-play-state:paused]"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex items-center gap-6 shrink-0">{children}</div>
        <div className="flex items-center gap-6 shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050410] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050410] to-transparent" />
    </div>
  );
};

export default Marquee;
