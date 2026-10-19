import { GITHUB_URL } from "../lib/follow";

// The last line under a note or a case study. No box, no banner: the command is the link.
const FollowLine = () => (
  <p className="follow-line">
    liked this? &rarr;{" "}
    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
      git follow laladwesh
    </a>
  </p>
);

export default FollowLine;
