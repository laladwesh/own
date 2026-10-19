import { useEffect } from "react";
import Invite from "./Invite";
import { ghLink } from "../lib/follow";

// The last line under a note or a case study. No box, no banner: the command is the link. When it
// scrolls into view the reader has reached the end, which the daemon's sign listens for.
const FollowLine = () => {
  useEffect(() => {
    const el = document.querySelector(".follow-line");
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        window.dispatchEvent(new CustomEvent("read-end"));
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Invite as="p" priority={1} className="follow-line">
      liked this? &rarr; <a {...ghLink}>git follow laladwesh</a>
    </Invite>
  );
};

export default FollowLine;
