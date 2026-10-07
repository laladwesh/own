// "ccd-internet-before-after": how the CCD server reached the internet, before and after.
// Printed ink schematic, plain SVG, no colour. The wide layout puts BEFORE above AFTER;
// the narrow layout stacks everything vertically.

const INK = "currentColor";

const Arrow = ({ id }) => (
  <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0L10 5L0 10z" fill={INK} />
  </marker>
);

const Box = ({ x, y, w, h, a, b, dashed }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill="var(--bg)"
      stroke={INK}
      strokeWidth={dashed ? 1 : 1.5}
      strokeDasharray={dashed ? "5 4" : undefined}
    />
    <text x={x + w / 2} y={b ? y + h / 2 - 3 : y + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>
      {a}
    </text>
    {b && (
      <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize="11" fill="var(--muted)">
        {b}
      </text>
    )}
  </g>
);

const Line = ({ d, marker, dashed }) => (
  <path d={d} fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray={dashed ? "5 4" : undefined} markerEnd={marker ? `url(#${marker})` : undefined} />
);

// A circled cross marks the branch where things break.
const Cross = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r="11" fill="var(--bg)" stroke={INK} strokeWidth="1.5" />
    <path d={`M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}`} stroke={INK} strokeWidth="1.8" />
  </g>
);

const Label = ({ x, y, children }) => (
  <text x={x} y={y} fontSize="11" fill="var(--muted)">
    {children}
  </text>
);

const Wide = () => (
  <svg className="diag-svg diag-wide" viewBox="0 0 800 280" aria-hidden="true">
    <defs>
      <Arrow id="cib-w" />
    </defs>

    <Label x={10} y={16}>BEFORE</Label>
    <Box x={10} y={24} w={140} h={50} a="CCD server" />
    <Box x={190} y={24} w={170} h={50} a="login script" b="every ~40s" />
    <Box x={400} y={24} w={190} h={50} a="campus captive portal" />
    <Box x={630} y={24} w={160} h={50} a="internet" />
    <Line d="M150 49 L188 49" marker="cib-w" />
    <Line d="M360 49 L398 49" marker="cib-w" />
    <Line d="M590 49 L628 49" marker="cib-w" />

    {/* the broken branch */}
    <Line d="M275 74 L275 100" dashed marker="cib-w" />
    <Cross x={275} y={87} />
    <Box x={190} y={102} w={400} h={52} dashed a="session drops: apps lose DB / sign-in / email" b="502 on every portal" />

    <line x1="10" x2="790" y1="178" y2="178" stroke="var(--border)" strokeWidth="1" />

    <Label x={10} y={198}>AFTER</Label>
    <Box x={10} y={206} w={140} h={50} a="CCD server" />
    <Box x={190} y={206} w={400} h={50} a="direct access" b="required outbound opened" />
    <Box x={630} y={206} w={160} h={50} a="internet" />
    <Line d="M150 231 L188 231" marker="cib-w" />
    <Line d="M590 231 L628 231" marker="cib-w" />
  </svg>
);

const Narrow = () => (
  <svg className="diag-svg diag-narrow" viewBox="0 0 340 600" aria-hidden="true">
    <defs>
      <Arrow id="cib-n" />
    </defs>

    <Label x={20} y={16}>BEFORE</Label>
    <Box x={55} y={24} w={250} h={44} a="CCD server" />
    <Line d="M180 68 L180 90" marker="cib-n" />
    <Box x={55} y={92} w={250} h={44} a="login script" b="every ~40s" />
    <Line d="M180 136 L180 158" marker="cib-n" />
    <Box x={55} y={160} w={250} h={44} a="campus captive portal" />
    <Line d="M180 204 L180 226" marker="cib-n" />
    <Box x={55} y={228} w={250} h={44} a="internet" />

    {/* the broken branch: leaves the login script on the left */}
    <Line d="M55 114 L30 114 L30 312 L53 312" dashed marker="cib-n" />
    <Cross x={30} y={190} />
    <Box x={55} y={290} w={250} h={78} dashed a="session drops" b="apps lose DB / sign-in / email" />
    <text x={180} y={358} textAnchor="middle" fontSize="11" fill="var(--muted)">
      502 on every portal
    </text>

    <line x1="20" x2="320" y1="378" y2="378" stroke="var(--border)" strokeWidth="1" />

    <Label x={20} y={400}>AFTER</Label>
    <Box x={55} y={408} w={250} h={44} a="CCD server" />
    <Line d="M180 452 L180 474" marker="cib-n" />
    <Box x={55} y={476} w={250} h={50} a="direct access" b="required outbound opened" />
    <Line d="M180 526 L180 548" marker="cib-n" />
    <Box x={55} y={550} w={250} h={44} a="internet" />
  </svg>
);

const CcdInternetBeforeAfter = () => (
  <figure
    className="diagram diagram--wide"
    role="img"
    aria-label="Before: the CCD server logged in through a script every 40 seconds to the campus captive portal to reach the internet. When the session dropped, the apps lost the database, sign-in and email, and every portal returned 502. After: the server has direct access, with the required outbound access opened, to the internet."
  >
    <Wide />
    <Narrow />
    <figcaption className="diag-notes">
      <span>fixed by emails, 5 trips to the network office and paperwork</span>
    </figcaption>
  </figure>
);

export default CcdInternetBeforeAfter;
