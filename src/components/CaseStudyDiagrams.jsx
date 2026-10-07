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

// ───────────── D-Day: an offer's path to every dashboard ─────────────
const DdayWide = () => (
  <svg className="diag-svg diag-wide" viewBox="0 0 800 300" aria-hidden="true">
    <defs>
      <Arrow id="dd-w" />
    </defs>
    <Box x={10} y={104} w={150} h={56} a="POC" b="creates offer" />
    <Box x={195} y={104} w={150} h={56} a="Admin" b="approves" />
    <Box x={380} y={104} w={190} h={56} a="Server" b="broadcasts over Socket.IO" />
    <Line d="M160 132 L193 132" marker="dd-w" />
    <Line d="M345 132 L378 132" marker="dd-w" />
    <path d="M570 132 L604 132 M604 46 L604 218" fill="none" stroke={INK} strokeWidth="1.5" />
    <Line d="M604 46 L638 46" marker="dd-w" />
    <Line d="M604 132 L638 132" marker="dd-w" />
    <Line d="M604 218 L638 218" marker="dd-w" />
    <Box x={640} y={18} w={150} h={56} a="Student" b="dashboard" />
    <Box x={640} y={104} w={150} h={56} a="Official" b="dashboard" />
    <Box x={640} y={190} w={150} h={56} a="Viewer" b="dashboard" />
    <text x="640" y="272" fontSize="11" fill="var(--muted)">
      dashboards update live
    </text>
    <Box x={195} y={214} w={250} h={56} dashed a="PDF export" b="company-wise status reports" />
  </svg>
);

const DdayNarrow = () => (
  <svg className="diag-svg diag-narrow" viewBox="0 0 340 560" aria-hidden="true">
    <defs>
      <Arrow id="dd-n" />
    </defs>
    <Box x={45} y={8} w={250} h={46} a="POC" b="creates offer" />
    <Line d="M170 54 L170 76" marker="dd-n" />
    <Box x={45} y={78} w={250} h={46} a="Admin" b="approves" />
    <Line d="M170 124 L170 146" marker="dd-n" />
    <Box x={45} y={148} w={250} h={60} a="Server" b="broadcasts over Socket.IO" />
    <Line d="M170 208 L170 230" marker="dd-n" />
    <text x="180" y="224" fontSize="11" fill="var(--muted)">
      live
    </text>
    <Box x={45} y={232} w={250} h={46} a="Student dashboard" />
    <Box x={45} y={294} w={250} h={46} a="Official dashboard" />
    <Box x={45} y={356} w={250} h={46} a="Viewer dashboard" />
    <text x="45" y="424" fontSize="11" fill="var(--muted)">
      dashboards update live
    </text>
    <Box x={45} y={444} w={250} h={56} dashed a="PDF export" b="company-wise status reports" />
  </svg>
);

const DdayFlow = () => (
  <figure
    className="diagram diagram--wide"
    role="img"
    aria-label="D-Day flow. A POC creates an offer, an admin approves it, the server broadcasts it over Socket.IO, and the student, official and viewer dashboards update live. Separately, PDF export produces company-wise status reports."
  >
    <DdayWide />
    <DdayNarrow />
  </figure>
);

// ───────────── Intern Portal: six roles around one system ─────────────
const ROLES6 = ["Student", "Company", "Coordinator", "Verifier", "Logistics", "Top user"];

const InternWide = () => {
  const xs = [30, 300, 570];
  const aim = [330, 400, 470];
  return (
    <svg className="diag-svg diag-wide" viewBox="0 0 800 352" aria-hidden="true">
      <defs>
        <Arrow id="ip-w" />
      </defs>
      {ROLES6.map((r, i) => {
        const top = i < 3;
        const x = xs[i % 3];
        const t = aim[i % 3];
        return (
          <g key={r}>
            <Box x={x} y={top ? 14 : 270} w={200} h={46} a={r} />
            <Line d={top ? `M${x + 100} 60 L${x + 100} 90 L${t} 90 L${t} 110` : `M${x + 100} 270 L${x + 100} 238 L${t} 238 L${t} 204`} marker="ip-w" />
          </g>
        );
      })}
      <Box x={280} y={112} w={240} h={90} a="Intern Portal" />
      <text x="400" y="340" textAnchor="middle" fontSize="11" fill="var(--muted)">
        SSO → RBAC → JAF lifecycle → CV verification → OA rooms/slots → offers
      </text>
    </svg>
  );
};

const InternNarrow = () => (
  <svg className="diag-svg diag-narrow" viewBox="0 0 340 380" aria-hidden="true">
    <defs>
      <Arrow id="ip-n" />
    </defs>
    <Box x={45} y={8} w={250} h={60} a="Intern Portal" />
    <Line d="M170 68 L170 92" marker="ip-n" />
    <rect x="6" y="94" width="328" height="212" fill="none" stroke={INK} strokeWidth="1" strokeDasharray="5 4" />
    <text x="16" y="110" fontSize="11" fill="var(--muted)">
      six roles
    </text>
    {ROLES6.map((r, i) => (
      <Box key={r} x={i % 2 === 0 ? 16 : 174} y={122 + Math.floor(i / 2) * 60} w={150} h={44} a={r} />
    ))}
    <text x="14" y="332" fontSize="11" fill="var(--muted)">
      SSO → RBAC → JAF lifecycle → CV verification
    </text>
    <text x="14" y="350" fontSize="11" fill="var(--muted)">
      → OA rooms/slots → offers
    </text>
  </svg>
);

const InternPortalRoles = () => (
  <figure
    className="diagram diagram--wide"
    role="img"
    aria-label="The Intern Portal serves six roles: student, company, coordinator, verifier, logistics and top user. Its workflow runs from SSO to role-based access control, the JAF lifecycle, CV verification, OA rooms and slots, and offers."
  >
    <InternWide />
    <InternNarrow />
  </figure>
);

// ───────────── Status monitor: what it watches and what it feeds ─────────────
const MonitorWide = () => (
  <svg className="diag-svg diag-wide" viewBox="0 0 800 340" aria-hidden="true">
    <defs>
      <Arrow id="sm-w" />
    </defs>
    <text x="10" y="14" fontSize="11" fill="var(--muted)">
      PM2
    </text>
    <Box x={10} y={22} w={200} h={46} a="exam evaluation" />
    <Box x={10} y={88} w={200} h={46} a="leave management" />
    <Box x={10} y={154} w={200} h={46} a="elective registration" />
    <Box x={280} y={64} w={240} h={110} a="status monitor" b="health · SSL · metrics · backups" />
    <Line d="M210 45 L245 45 L245 100 L278 100" marker="sm-w" />
    <Line d="M210 111 L278 111" marker="sm-w" />
    <Line d="M210 177 L245 177 L245 130 L278 130" marker="sm-w" />
    <Box x={590} y={22} w={200} h={46} a="public status page" />
    <Box x={590} y={88} w={200} h={46} a="admin dashboard" />
    <Box x={590} y={154} w={200} h={46} a="/metrics → Prometheus" fs={12} />
    <Line d="M520 100 L555 100 L555 45 L588 45" marker="sm-w" />
    <Line d="M520 119 L588 111" marker="sm-w" />
    <Line d="M520 138 L555 138 L555 177 L588 177" marker="sm-w" />
    <Box x={150} y={268} w={150} h={46} a="MongoDB" />
    <Box x={350} y={268} w={160} h={46} a="nightly backup" />
    <Box x={560} y={268} w={160} h={46} a="Google Drive" />
    <Line d="M300 291 L348 291" marker="sm-w" />
    <Line d="M510 291 L558 291" marker="sm-w" />
  </svg>
);

const MonitorNarrow = () => (
  <svg className="diag-svg diag-narrow" viewBox="0 0 340 700" aria-hidden="true">
    <defs>
      <Arrow id="sm-n" />
    </defs>
    <text x="45" y="14" fontSize="11" fill="var(--muted)">
      PM2
    </text>
    <Box x={45} y={22} w={250} h={44} a="exam evaluation" />
    <Box x={45} y={80} w={250} h={44} a="leave management" />
    <Box x={45} y={138} w={250} h={44} a="elective registration" />
    <Line d="M170 182 L170 208" marker="sm-n" />
    <Box x={45} y={210} w={250} h={64} a="status monitor" b="health · SSL · metrics · backups" />
    <Line d="M170 274 L170 300" marker="sm-n" />
    <Box x={45} y={302} w={250} h={44} a="public status page" />
    <Box x={45} y={360} w={250} h={44} a="admin dashboard" />
    <Box x={45} y={418} w={250} h={44} a="/metrics → Prometheus" fs={12} />
    <line x1="20" x2="320" y1="486" y2="486" stroke="var(--border)" strokeWidth="1" />
    <Box x={45} y={506} w={250} h={44} a="MongoDB" />
    <Line d="M170 550 L170 570" marker="sm-n" />
    <Box x={45} y={572} w={250} h={44} a="nightly backup" />
    <Line d="M170 616 L170 636" marker="sm-n" />
    <Box x={45} y={638} w={250} h={44} a="Google Drive" />
  </svg>
);

const StatusMonitor = () => (
  <figure
    className="diagram diagram--wide"
    role="img"
    aria-label="Status monitor. It watches three apps run under PM2: exam evaluation, leave management and elective registration. It covers health, SSL, metrics and backups, and feeds a public status page, an admin dashboard and a metrics endpoint for Prometheus. Separately, MongoDB is backed up nightly to Google Drive."
  >
    <MonitorWide />
    <MonitorNarrow />
  </figure>
);

export const CASE_DIAGRAMS = {
  "oa-check-flow": OaCheckFlow,
  "dday-flow": DdayFlow,
  "intern-portal-roles": InternPortalRoles,
  "status-monitor": StatusMonitor,
};
