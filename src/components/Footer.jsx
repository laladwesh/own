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
      Made with <Heart /> by Avinash and Claude Code
    </p>
  </footer>
);

export default Footer;
