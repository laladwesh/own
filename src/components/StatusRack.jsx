import { useEffect, useRef, useState } from "react";
import { agoText, loadStatus } from "../lib/status";
import { siteDomain } from "../constants";

const POLL_MS = 60_000;
const VENTS = 7;
const BEAT_H = 18; // tallest tick, px
const LED = { up: "up", degraded: "degraded", down: "down" };

// "leetcode proxy" -> "LEETCODE-PROXY" (the CSS upper-cases it)
const label = (name) => name.trim().replace(/\s+/g, "-");

// "  8ms" in a fixed-width window; "----" when the service did not answer.
const readout = (ms) => (ms === null ? "----" : `${ms}ms`);

const Vents = () => (
  <span className="rack-vents" aria-hidden="true">
    {Array.from({ length: VENTS }, (_, i) => (
      <i key={i} />
    ))}
  </span>
);

// The last checks as ticks: height is latency (scaled to this unit's own slowest answer), amber is
// degraded, and a gap is a check with no answer. Only results that exist are drawn.
const Heartbeat = ({ history }) => {
  const max = Math.max(1, ...history.map((h) => h.latencyMs ?? 0));
  const count = (s) => history.filter((h) => h.status === s).length;
  const text = history.length
    ? `last ${history.length} checks: ${count("up")} up, ${count("degraded")} degraded, ${count("down")} down`
    : "no checks yet";
  return (
    <span className="rack-beat" role="img" aria-label={text}>
      {history.map((h, i) =>
        h.status === "down" || h.latencyMs === null ? (
          <i key={i} className="rack-tick--gap" />
        ) : (
          <i
            key={i}
            className={h.status === "degraded" ? "rack-tick--degraded" : undefined}
            style={{ height: `${Math.max(3, Math.round((h.latencyMs / max) * BEAT_H))}px` }}
          />
        )
      )}
    </span>
  );
};

// A small dark 19-inch rack: one 1U unit per service. Steady LEDs only: mint up, amber degraded,
// red down, grey when monitoring itself is unreachable. If /api/status fails the rack says so; it
// never shows a green it has not seen.
const StatusRack = () => {
  const ref = useRef(null);
  const [services, setServices] = useState(null);
  const [offline, setOffline] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState === "visible");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Fetch when the rack is on screen, then every 60s. Nothing runs while the tab is hidden.
  useEffect(() => {
    if (!inView || !tabVisible) return undefined;
    let live = true;
    const pull = (force) =>
      loadStatus({ force })
        .then((s) => {
          if (!live) return;
          setServices(s);
          setOffline(false);
          setNow(Date.now());
        })
        .catch(() => {
          if (!live) return;
          setServices(null);
          setOffline(true);
        });
    pull(false);
    const poll = setInterval(() => pull(true), POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 10_000);
    return () => {
      live = false;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [inView, tabVisible]);

  const loading = !services && !offline;
  const checkedAt = services?.[0]?.checkedAt;

  return (
    <div className="rack" ref={ref} role="region" aria-label="Live service status">
      <div className="rack-main">
        <div className="rack-plate">
          <span className="rack-plate-id">RACK-00 / {siteDomain}</span>
          <span className="rack-plate-ago" role="status">
            {offline ? "monitoring offline" : loading ? "checking…" : `checked ${agoText(checkedAt, now)}`}
          </span>
        </div>
        <ul className="rack-units">
          {offline && (
            <li className="rack-unit" aria-label="monitoring offline, try again in a minute">
              <span className="rack-bezel" aria-hidden="true">
                <span className="rack-led rack-led--off" />
              </span>
              <span className="rack-name rack-name--off" aria-hidden="true">
                monitoring-offline
              </span>
              <Vents />
              <span className="rack-beat" aria-hidden="true" />
              <span className="rack-readout rack-readout--off" aria-hidden="true">
                ----
              </span>
            </li>
          )}
          {loading && (
            <li className="rack-unit" aria-label="checking services">
              <span className="rack-bezel" aria-hidden="true">
                <span className="rack-led rack-led--off" />
              </span>
              <span className="rack-name rack-name--off" aria-hidden="true">
                checking
              </span>
              <Vents />
              <span className="rack-beat" aria-hidden="true" />
              <span className="rack-readout rack-readout--off" aria-hidden="true">
                ----
              </span>
            </li>
          )}
          {services?.map((s) => (
            <li
              key={s.name}
              className="rack-unit"
              aria-label={`${s.name}: ${s.status}${s.latencyMs === null ? ", no answer" : `, ${s.latencyMs} milliseconds`}`}
            >
              <span className="rack-bezel" aria-hidden="true">
                <span className={`rack-led rack-led--${LED[s.status]}`} />
              </span>
              <span className="rack-name" aria-hidden="true">
                {label(s.name)}
              </span>
              <Vents />
              <Heartbeat history={s.history} />
              <span className={`rack-readout rack-readout--${s.status}`} aria-hidden="true">
                <span>{readout(s.latencyMs)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StatusRack;
