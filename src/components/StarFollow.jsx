import Invite from "./Invite";
import { ghLink } from "../lib/follow";

// "star / follow" for a repo that is public: star goes to that repo, follow goes to my profile.
const StarFollow = ({ repo }) =>
  repo ? (
    <Invite priority={2} className="star-follow">
      <a href={repo} target="_blank" rel="noopener noreferrer">
        &#9733; star
      </a>
      {" / "}
      <a {...ghLink}>+ follow</a>
    </Invite>
  ) : null;

export default StarFollow;
