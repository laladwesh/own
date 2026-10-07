// Printed schematics for notes: ink on paper, plain SVG, no colour. Picked by a
// `[DIAGRAM: id]` line in the note's markdown.

const INK = "currentColor";

const Arrow = ({ id }) => (
  <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0L10 5L0 10z" fill={INK} />
  </marker>
);

const Box = ({ x, y, w, h, n, a, b }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="var(--bg)" stroke={INK} strokeWidth="1.5" />
    <text x={x + 12} y={y + 20} fontSize="11" fill="var(--muted)">
      {n}
    </text>
    <text x={x + w / 2} y={y + h / 2 - 1} textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>
      {a}
    </text>
    <text x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle" fontSize="11" fill="var(--muted)">
      {b}
    </text>
  </g>
);

const Line = ({ d, marker }) => <path d={d} fill="none" stroke={INK} strokeWidth="1.5" markerEnd={`url(#${marker})`} />;

const STEPS = [
  ["GitHub repo", "push webhook or manual deploy"],
  ["OAuth sign-in", "pick a repo, set build options"],
  ["Build", "clone + Dockerfile + build"],
  ["Container", "limits + health check"],
  ["Route", "Nginx config, then reload"],
  ["Live URL", "https://<slug>.<your domain>"],
];

// Wide: two rows. The first runs left to right, the second right to left.
const Wide = () => {
  const xs = [10, 285, 560];
  return (
    <svg className="diag-svg diag-wide" viewBox="0 0 800 290" aria-hidden="true">
      <defs>
        <Arrow id="onw-w" />
      </defs>
      {STEPS.map(([a, b], i) => {
        const row = i < 3 ? 0 : 1;
        const col = row === 0 ? i : 5 - i;
        return <Box key={a} x={xs[col]} y={row === 0 ? 20 : 190} w={230} h={72} n={i + 1} a={a} b={b} />;
      })}
      <Line d="M240 56 L283 56" marker="onw-w" />
      <Line d="M515 56 L558 56" marker="onw-w" />
      <Line d="M675 92 L675 188" marker="onw-w" />
      <Line d="M560 226 L517 226" marker="onw-w" />
      <Line d="M285 226 L242 226" marker="onw-w" />
    </svg>
  );
};

const Narrow = () => (
  <svg className="diag-svg diag-narrow" viewBox="0 0 340 560" aria-hidden="true">
    <defs>
      <Arrow id="onw-n" />
    </defs>
    {STEPS.map(([a, b], i) => (
      <g key={a}>
        <Box x={30} y={10 + i * 90} w={280} h={64} n={i + 1} a={a} b={b} />
        {i < STEPS.length - 1 && <Line d={`M170 ${74 + i * 90} L170 ${98 + i * 90}`} marker="onw-n" />}
      </g>
    ))}
  </svg>
);

const OnawieFlow = () => (
  <figure
    className="diagram diagram--wide"
    role="img"
    aria-label="Onawie, from repository to live URL: one, the GitHub repo, through a push webhook or a manual deploy; two, OAuth sign-in, where you pick a repo and set build options; three, the build, which clones the repo and builds a Docker image from a Dockerfile; four, the container, with limits and a health check; five, the route, an Nginx config followed by a reload; six, the live URL."
  >
    <Wide />
    <Narrow />
  </figure>
);

export const NOTE_DIAGRAMS = { "onawie-flow": OnawieFlow };
