import { useEffect } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { scrollToSection } from "../lib/helperFunctions";

// On a new route: scroll to the top, or to the section named in the hash (/#pipeline).
// Back/forward keep the browser's own position. Both respect reduced motion.
// Old homepage anchors for sections that are pages of their own now.
const MOVED = { incidents: "/incidents", caseStudies: "/case-studies" };

const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  const type = useNavigationType();
  const navigate = useNavigate();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      if (pathname === "/" && MOVED[id]) {
        navigate(MOVED[id], { replace: true });
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
