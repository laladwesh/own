// Printed schematics for postmortems: ink on paper, plain SVG, no colour.
// A diagram is picked by the incident's `diagram` id.

const ROLES = ["ROLE A", "ROLE B", "ROLE C"];
const CAP = "registered ∩ attended";

const Node = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r="14" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
    <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">
      ∩
    </text>
  </g>
);

const Box = ({ x, y, w, h, children }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
    {children}
  </g>
);

// Wide: the ghost on the left, three roles on the right.
const Wide = () => {
  const rows = [42, 122, 202];
  return (
    <svg className="diag-svg diag-wide" viewBox="0 0 660 250" aria-hidden="true">
      <rect x="4" y="52" width="236" height="140" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 4" />
      <text x="122" y="212" textAnchor="middle" fontSize="11" fill="var(--muted)">
        deleted after distribute
      </text>
      <Box x="15" y="82" w="214" h="80">
        <text x="122" y="116" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
          GHOST OA
        </text>
        <text x="122" y="138" textAnchor="middle" fontSize="10.5" fill="var(--muted)">
          1 candidate list / 1 attendance
        </text>
      </Box>
      {rows.map((cy, i) => (
        <g key={cy}>
          <path d={`M229 122 L356 ${cy} M384 ${cy} L520 ${cy}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
          <Node x={370} y={cy} />
          <text x="452" y={cy - 6} textAnchor="middle" fontSize="10" fill="var(--muted)">
            {CAP}
          </text>
          <Box x="520" y={cy - 22} w="120" h="44">
            <text x="580" y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
              {ROLES[i]}
            </text>
          </Box>
        </g>
      ))}
    </svg>
  );
};

// Narrow: the ghost on top, the roles stacked below it.
const Narrow = () => {
  const rows = [190, 270, 350];
  return (
    <svg className="diag-svg diag-narrow" viewBox="0 0 340 400" aria-hidden="true">
      <rect x="44" y="6" width="252" height="100" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 4" />
      <text x="170" y="126" textAnchor="middle" fontSize="11" fill="var(--muted)">
        deleted after distribute
      </text>
      <Box x="60" y="26" w="220" h="60">
        <text x="170" y="52" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
          GHOST OA
        </text>
        <text x="170" y="72" textAnchor="middle" fontSize="11" fill="var(--muted)">
          1 candidate list / 1 attendance
        </text>
      </Box>
      <path d={`M60 56 H22 V${rows[2]}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
      {rows.map((cy, i) => (
        <g key={cy}>
          <path d={`M22 ${cy} L116 ${cy} M144 ${cy} L210 ${cy}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
          <Node x={130} y={cy} />
          <text x="130" y={cy - 22} textAnchor="middle" fontSize="11" fill="var(--muted)">
            {CAP}
          </text>
          <Box x="210" y={cy - 20} w="120" h="40">
            <text x="270" y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
              {ROLES[i]}
            </text>
          </Box>
        </g>
      ))}
    </svg>
  );
};

const GhostOaFanout = () => (
  <figure
    className="diagram"
    role="img"
    aria-label="Ghost OA fan-out: one ghost OA with one candidate list and one attendance. Each of the three roles, A, B and C, receives the registered-and-attended intersection. The ghost is deleted after distribute."
  >
    <Wide />
    <Narrow />
    <figcaption className="diag-notes">
      <span>A only → appears in A only</span>
      <span>in list, no role → skipped</span>
    </figcaption>
  </figure>
);

export const DIAGRAMS = { "ghost-oa-fanout": GhostOaFanout };
