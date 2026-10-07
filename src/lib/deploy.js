// "Last deploy": the latest run of the deploy workflow from /api/deploy, with the build-time
// commit as the fallback. Shared by the footer, the "How this site ships" section and the terminal.
import { useEffect, useState } from "react";
import { getJson } from "./api";

// Injected by vite.config.js: { sha, full, message, date, builtAt } for this build.
export const BUILD = typeof __BUILD__ !== "undefined" ? __BUILD__ : { sha: "unknown", full: "", message: "", date: "", builtAt: "" };

export const ago = (iso, now = Date.now()) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "a while ago";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const FRESH_MS = 60_000;
let cache = null; // { at, info }
let inflight = null;

export const loadDeploy = () => {
  if (cache && Date.now() - cache.at < FRESH_MS) return Promise.resolve(cache.info);
  if (inflight) return inflight;
  inflight = getJson("/api/deploy", { timeout: 6000 })
    .then((d) => {
      if (!["success", "failure", "running"].includes(d?.status) || typeof d.sha !== "string") throw new Error("bad response");
      const info = { status: d.status, sha: d.sha, startedAt: d.startedAt, durationSec: d.durationSec, finishedAt: d.finishedAt };
      cache = { at: Date.now(), info };
      return info;
    })
    .catch((err) => {
      cache = null;
      throw err;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

// "last deploy 3h ago / a3f9c21 / 41s / success". While a run is going: "deploying now... / a3f9c21".
// If the API cannot be reached: "built 3h ago / a3f9c21", from the build itself.
export const deployText = (info, now = Date.now()) => {
  if (!info) return `built ${ago(BUILD.builtAt, now)} / ${BUILD.sha}`;
  if (info.status === "running") return `deploying now... / ${info.sha}`;
  const when = ago(info.finishedAt ?? info.startedAt, now);
  return `last deploy ${when} / ${info.sha} / ${info.durationSec ?? "?"}s / ${info.status}`;
};

// The text for the current moment. It re-reads the clock every minute and the API every 5.
export const useDeployText = () => {
  const [info, setInfo] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let live = true;
    const pull = () => {
      if (document.visibilityState === "hidden") return;
      loadDeploy()
        .then((i) => live && setInfo(i))
        .catch(() => live && setInfo(null));
    };
    pull();
    const clock = setInterval(() => setNow(Date.now()), 60_000);
    const poll = setInterval(pull, 5 * 60_000);
    return () => {
      live = false;
      clearInterval(clock);
      clearInterval(poll);
    };
  }, []);

  return deployText(info, now);
};
