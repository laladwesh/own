import { useEffect, useRef, useState } from "react";
import { agoText, loadStatus } from "../lib/status";

const POLL_MS = 60_000;
const LABEL = { up: "up", degraded: "degraded", down: "down" };

// A small dark rack: one 1U row per service. Steady LEDs only: mint up, amber degraded, red
// down, grey when monitoring itself is unreachable. If /api/status fails the rack says so; it
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

  return (
    <div className="status-rack" ref={ref} role="region" aria-label="Live service status">
      <div className="status-plate">STATUS / {offline ? "monitoring offline" : "live"}</div>
      <ul className="status-units" aria-live="polite">
        {offline && (
          <li className="status-unit">
            <span className="st-led st-led--off" aria-hidden="true" />
            <span className="status-name status-name--off">monitoring offline</span>
            <span className="status-ago">try again in a minute</span>
          </li>
        )}
        {loading && (
          <li className="status-unit">
            <span className="st-led st-led--off" aria-hidden="true" />
            <span className="status-name status-name--off">checking…</span>
          </li>
        )}
        {services?.map((s) => (
          <li key={s.name} className="status-unit">
            <span className={`st-led st-led--${s.status}`} aria-hidden="true" />
            <span className="status-name">{s.name}</span>
            <span className="status-state">{LABEL[s.status]}</span>
            <span className="status-latency">{s.latencyMs === null ? "no answer" : `${s.latencyMs} ms`}</span>
            <span className="status-ago">checked {agoText(s.checkedAt, now)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusRack;
