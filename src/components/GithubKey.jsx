import { useId } from "react";
import Invite from "./Invite";
import { ghLink, followersText, useFollowers } from "../lib/follow";

// The navbar's "github" key: a mini device key at the right end. Hover or focus shows the live
// follower count ("42 followers + you?"); with no count it just says what the key does.
const GithubKey = () => {
  const n = useFollowers();
  const tipId = useId();
  const count = followersText(n);
  return (
    <Invite priority={5} className="gh-key-wrap">
      <a className="gh-key" {...ghLink} aria-describedby={tipId}>
        github &#8599;
      </a>
      <span id={tipId} role="tooltip" className="gh-key-tip">
        {count ? `${count} · + you?` : "follow on github"}
      </span>
    </Invite>
  );
};

export default GithubKey;
