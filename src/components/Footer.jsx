import { siteDomain } from "../constants";
import { Fragment } from "react";
import { useLocation } from "react-router-dom";
import { BACKGROUNDS, setBg, useBg } from "../background/store";
import DeployLine from "./DeployLine";
import FollowDevice from "./FollowDevice";
import Invite from "./Invite";
import { ghLink } from "../lib/follow";

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
// The follow device sits with the status rack on the homepage; on every other page a compact one lives here.
const Footer = () => {
  const { pathname } = useLocation();
  const bg = useBg();
  return (
    <footer className="site-footer">
      {pathname !== "/" && <FollowDevice compact />}
      <p>
        <DeployLine /> / {siteDomain}
        <Invite priority={4} className="footer-follow">
          {" "}
          &middot; built in public &middot; <a {...ghLink}>follow along &#8599;</a>
        </Invite>
      </p>
      <p className="footer-credit">
        Made with <Heart /> by Avinash and <ClaudeCodeMark />
      </p>
      <p className="footer-bg">
        background:{" "}
        {BACKGROUNDS.map((b, i) => (
          <Fragment key={b}>
            {i > 0 && " · "}
            {b === bg ? (
              <span className="footer-bg-on" aria-current="true">
                {b}
              </span>
            ) : (
              <button type="button" className="footer-bg-link" onClick={() => setBg(b)}>
                {b}
              </button>
            )}
          </Fragment>
        ))}
      </p>
    </footer>
  );
};

export default Footer;
