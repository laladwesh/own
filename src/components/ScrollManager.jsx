import { useEffect } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { MOVED_SECTIONS } from "../lib/sitePages";
import { scrollToSection } from "../lib/helperFunctions";

// On a new route: scroll to the top, or to the section named in the hash (/#pipeline).
// Back/forward keep the browser's own position. Both respect reduced motion.
const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  const type = useNavigationType();
  const navigate = useNavigate();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      // An old homepage link (/#pipeline) goes to where that section lives now (/work#pipeline).
      if (pathname === "/" && MOVED_SECTIONS[id]) {
        navigate({ pathname: MOVED_SECTIONS[id], hash }, { replace: true });
        return undefined;
      }
      let tries = 0;
      let raf = 0;
      const go = () => {
        if (document.getElementById(id)) scrollToSection(id);
        else if (tries++ < 30) raf = requestAnimationFrame(go);
      };
      go();
      return () => cancelAnimationFrame(raf);
    }
    if (type !== "POP") window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash, type, navigate]);

  return null;
};

export default ScrollManager;
