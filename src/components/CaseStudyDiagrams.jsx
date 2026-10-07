// Printed schematics for case studies: ink on paper, plain SVG, no colour.
// Same drawing style as the incident diagrams. Picked by the `[DIAGRAM: id]` marker in the markdown.

const INK = "currentColor";

const Arrow = ({ id }) => (
  <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0L10 5L0 10z" fill={INK} />
  </marker>
);

// A labelled box: a bold first line and an optional muted second line.
const Box = ({ x, y, w, h, a, b, dashed, fs = 13 }) => (
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
    <text x={x + w / 2} y={b ? y + h / 2 - 3 : y + h / 2 + 5} textAnchor="middle" fontSize={fs} fontWeight="700" fill={INK}>
      {a}
    </text>
    {b && (
      <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize="11" fill="var(--muted)">
        {b}
      </text>
    )}
  </g>
);

const Line = ({ d, marker }) => <path d={d} fill="none" stroke={INK} strokeWidth="1.5" markerEnd={`url(#${marker})`} />;

const LOOP = ["scan", "fix", "close background apps", "re-scan"];

// Wide: v1 above, then the v2 flow in three rows.
const Wide = () => (
  <svg className="diag-svg diag-wide" viewBox="0 0 800 380" aria-hidden="true">
    <defs>
      <Arrow id="oaa-w" />
    </defs>

    {/* v1 */}
    <Box x={10} y={8} w={350} h={62} dashed a="v1: public script + irm/bash," b="results not tied to an account" />
    <Line d="M125 70 L125 108" marker="oaa-w" />
    <text x="134" y="94" fontSize="11" fill="var(--muted)">
      14 Aug
    </text>

    {/* v2, row 1 */}
    <Box x={10} y={110} w={230} h={52} a="Student logs in" b="portal account" />
    <Box x={285} y={110} w={230} h={52} a="Generate command" b="one-time token" />
    <Box x={560} y={110} w={230} h={52} a="Laptop runs script" b="served compressed, in memory" />
    <Line d="M240 136 L283 136" marker="oaa-w" />
    <Line d="M515 136 L558 136" marker="oaa-w" />
    <Line d="M675 162 L675 188" marker="oaa-w" />

    {/* the script's loop */}
    <rect x="10" y="190" width="780" height="78" fill="none" stroke={INK} strokeWidth="1" strokeDasharray="5 4" />
    <text x="22" y="206" fontSize="11" fill="var(--muted)">
      on the laptop
    </text>
    {LOOP.map((t, i) => (
      <g key={t}>
        <Box x={22 + i * 198} y={214} w={168} h={42} a={t} fs={12} />
        {i < LOOP.length - 1 && <Line d={`M${190 + i * 198} 235 L${218 + i * 198} 235`} marker="oaa-w" />}
      </g>
    ))}
    <Line d="M125 268 L125 308" marker="oaa-w" />

    {/* result and the portal */}
    <Box x={10} y={310} w={230} h={52} a="Result" />
    <Box x={285} y={310} w={270} h={52} a="Portal shows" b="Device clear / Issues detected" />
    <Box x={585} y={310} w={205} h={52} a="Coordinator dashboard" b="+ OA Report" />
    <Line d="M240 336 L283 336" marker="oaa-w" />
    <Line d="M555 336 L583 336" marker="oaa-w" />
  </svg>
);

// Narrow: the same flow, top to bottom.
const Narrow = () => (
  <svg className="diag-svg diag-narrow" viewBox="0 0 340 740" aria-hidden="true">
    <defs>
      <Arrow id="oaa-n" />
    </defs>

    <Box x={20} y={6} w={300} h={64} dashed a="v1: public script + irm/bash," b="results not tied to an account" />
    <Line d="M170 70 L170 106" marker="oaa-n" />
    <text x="180" y="93" fontSize="11" fill="var(--muted)">
      14 Aug
    </text>

    <Box x={45} y={108} w={250} h={46} a="Student logs in" b="portal account" />
    <Line d="M170 154 L170 176" marker="oaa-n" />
    <Box x={45} y={178} w={250} h={46} a="Generate command" b="one-time token" />
    <Line d="M170 224 L170 246" marker="oaa-n" />
    <Box x={45} y={248} w={250} h={46} a="Laptop runs script" b="served compressed, in memory" />
    <Line d="M170 294 L170 314" marker="oaa-n" />

    <rect x="20" y="316" width="300" height="214" fill="none" stroke={INK} strokeWidth="1" strokeDasharray="5 4" />
    <text x="30" y="332" fontSize="11" fill="var(--muted)">
      on the laptop
    </text>
    {LOOP.map((t, i) => (
      <g key={t}>
        <Box x={45} y={342 + i * 48} w={250} h={34} a={t} fs={12} />
        {i < LOOP.length - 1 && <Line d={`M170 ${376 + i * 48} L170 ${390 + i * 48}`} marker="oaa-n" />}
      </g>
    ))}
    <Line d="M170 530 L170 552" marker="oaa-n" />

    <Box x={45} y={554} w={250} h={46} a="Result" />
    <Line d="M170 600 L170 622" marker="oaa-n" />
    <Box x={45} y={624} w={250} h={46} a="Portal shows" b="Device clear / Issues detected" />
    <Line d="M170 670 L170 688" marker="oaa-n" />
    <Box x={45} y={690} w={250} h={46} a="Coordinator dashboard" b="+ OA Report" />
  </svg>
);

const OaCheckFlow = () => (
  <figure
    className="diagram"
    role="img"
    aria-label="OA Check flow. Version 1 was a public script run with irm or bash, with results not tied to an account. On 14 August it moved into the portal: the student logs in and generates a command with a one-time token, the laptop runs the script, which scans, fixes, closes background apps and scans again, the result goes back, the portal shows Device clear or Issues detected, and the coordinator dashboard and OA Report use it."
  >
    <Wide />
    <Narrow />
  </figure>
);

export const CASE_DIAGRAMS = { "oa-check-flow": OaCheckFlow };
