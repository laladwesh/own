import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import GitGraph from "./GitGraph";

// The page background: ONE design, always on. Graph paper (CSS, see guide.css) with the real git
// history of this repository drawn down the left margin (GitGraph). Both are still: nothing here reads
// the mouse, the scroll position or the keyboard, and nothing moves.
//
// Width of one side margin, matching the page gutters in guide.css (.page-gutter).
const marginOf = (w) => (w < 768 ? 24 : w < 1200 ? 64 : Math.max(64, (w - 1040) / 2));

const Backdrop = () => {
  const { pathname } = useLocation();
  const ref = useRef(null);
  const [geo, setGeo] = useState({ h: 0, w: 0 });

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return undefined;
    let timer = 0;
    const measure = () => {
      const next = { h: layer.clientHeight, w: layer.clientWidth };
      setGeo((p) => (p.h === next.h && p.w === next.w ? p : next));
    };
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 120);
    };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(soon);
    ro?.observe(layer);
    window.addEventListener("resize", soon);
    // pages load their content a little after the route changes
    const later = [300, 1200, 3000].map((ms) => setTimeout(measure, ms));
    return () => {
      clearTimeout(timer);
      later.forEach(clearTimeout);
      ro?.disconnect();
      window.removeEventListener("resize", soon);
    };
  }, [pathname]);

  const margin = marginOf(geo.w);
  return (
    <>
      <div ref={ref} className="bg-layer bg-grid" aria-hidden="true" />
      {geo.h > 0 && <GitGraph h={geo.h} margin={margin} small={geo.w < 768} />}
    </>
  );
};

export default Backdrop;
