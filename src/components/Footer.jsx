import { siteDomain } from "../constants";

// A pixel heart in the same style as the daemon, drawn in the ink colour.
const HEART = [
  ".XX...XX.",
  "XXXX.XXXX",
  "XXXXXXXXX",
  "XXXXXXXXX",
  ".XXXXXXX.",
  "..XXXXX..",
  "...XXX...",
  "....X....",
];

// Claude Code is a coding agent that lives in the terminal, so its mark here is a pixel
// terminal window with a prompt.
const TERMINAL = [
  "XXXXXXXXXXXX",
  "X..........X",
  "X.X........X",
  "X..X.......X",
  "X.X........X",
  "X.....XXX..X",
  "X..........X",
  "XXXXXXXXXXXX",
];

const ClaudeCodeMark = () => (
  <svg className="footer-mark" viewBox="0 0 12 8" width="30" height="20" role="img" aria-label="Claude Code" fill="currentColor" shapeRendering="crispEdges">
    <title>Claude Code</title>
    {TERMINAL.flatMap((row, y) =>
      [...row].map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null))
    )}
  </svg>
);

const Heart = () => (
  <svg className="footer-heart" viewBox="0 0 9 8" width="14" height="12" role="img" aria-label="love" fill="currentColor" shapeRendering="crispEdges">
    {HEART.flatMap((row, y) =>
      [...row].map((c, x) => (c === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null))
    )}
  </svg>
);

// Static status line. The deploy date is injected at build time (vite.config.js).
const Footer = () => (
  <footer className="site-footer">
    <p>
      status: running / last deploy {__BUILD_DATE__} / {siteDomain}
    </p>
    <p className="footer-credit">
      Made with <Heart /> by Avinash and <ClaudeCodeMark />
    </p>
  </footer>
);

export default Footer;
