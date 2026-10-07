import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../style";
import { useSeo } from "../lib/useSeo";

// The terminal says what it always says.
const NotFound = () => {
  const { pathname } = useLocation();
  const seo = useMemo(() => ({ title: "Not found | Avinash Gupta", noindex: true, path: pathname }), [pathname]);
  useSeo(seo);
  const inIncidents = pathname.startsWith("/incidents");

  return (
    <main id="content" tabIndex={-1} className={`${styles.paddingX} flex justify-center pt-[128px] pb-[96px]`}>
      <div className={`${styles.boxWidth} page-body`}>
        <div className="inc-term nf-term" role="group" aria-label={`Command not found: ${pathname}`}>
          <div className="inc-term-bar" aria-hidden="true">
            <span className="inc-term-dot" />
            <span className="inc-term-dot" />
            <span className="inc-term-dot" />
          </div>
          <div className="inc-term-body">
            <p className="inc-term-line">
              <span className="inc-term-prompt">$</span> {pathname}
            </p>
            <p className="inc-term-line inc-term-muted">command not found: {pathname}</p>
          </div>
        </div>
        <p className="nf-links">
          <Link to="/">&larr; back to avinashgupta.in</Link>
          {inIncidents && <Link to="/incidents">all incidents</Link>}
        </p>
      </div>
    </main>
  );
};

export default NotFound;
