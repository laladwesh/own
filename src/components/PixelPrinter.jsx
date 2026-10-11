import { useRef, useState } from "react";

// The print button: a tiny pixel printer in the site's device style (dark body, a paper slot, a
// 1px mint power LED). Hover: the LED blinks once and the printer shakes 1px. Click: a sheet feeds
// out of the slot (about 600ms, transform only), then the browser's print dialog opens. With
// reduced motion it just prints.
const SHELL = [
  "......PPPPPPPP......",
  "......PPPPPPPP......",
  "......PPPPPPPP......",
  "..BBBBBBBBBBBBBBBB..",
  ".BLLLLLLLLLLLLLLLLB.",
  ".BLLLLLLLLLLLLLMLLB.",
  ".BLLLLLLLLLLLLLLLLB.",
  ".BBBBBBBBBBBBBBBBBB.",
  ".BSSSSSSSSSSSSSSSSB.",
  ".BBBBBBBBBBBBBBBBBB.",
  "..BBBBBBBBBBBBBBBB..",
  "...LL..........LL...",
];
const FILL = { B: "#1A1A1A", L: "#2E2E2E", S: "#050505", P: "#F6F3EC", M: "#5FD38D" };
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PixelPrinter = ({ label = "print / save as PDF" }) => {
  const [feeding, setFeeding] = useState(false);
  const busy = useRef(false);

  const go = () => {
    if (busy.current) return;
    busy.current = true;
    if (reduced()) {
      window.print();
      busy.current = false;
      return;
    }
    setFeeding(true);
    setTimeout(() => {
      setFeeding(false);
      window.print();
      busy.current = false;
    }, 600);
  };

  return (
    <button type="button" className={`printer-btn${feeding ? " printer-btn--feeding" : ""}`} onClick={go}>
      <svg className="printer-svg" viewBox="0 0 20 16" width={60} height={48} aria-hidden="true" shapeRendering="crispEdges">
        {/* the sheet that feeds out: it starts behind the front panel and slides down below it */}
        <g className="printer-sheet">
          <rect x="4" y="8" width="12" height="6" fill="#F6F3EC" stroke="#1A1A1A" strokeWidth="0.5" />
          <rect x="6" y="10" width="6" height="1" fill="#C9C2B3" />
          <rect x="6" y="12" width="8" height="1" fill="#C9C2B3" />
        </g>
        {SHELL.flatMap((row, y) =>
          [...row].map((c, x) =>
            c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={FILL[c]} stroke={c === "P" ? "#C9C2B3" : undefined} strokeWidth={c === "P" ? 0.15 : undefined} />
          )
        )}
        <rect className="printer-led" x="15" y="5" width="1" height="1" fill="#5FD38D" />
      </svg>
      <span className="printer-label">{label}</span>
    </button>
  );
};

export default PixelPrinter;
