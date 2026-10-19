import { useEffect, useState } from "react";
import { getJson } from "./api";
import { repoLink } from "../constants";

// "Follow me on GitHub" cannot happen on this site: following needs the visitor's own GitHub login.
// Everything here only opens the profile in a new tab, and the follower count is read from the
// existing GitHub proxy (/api/github/stats, cached on the server). Nothing here says anyone followed.
export const GITHUB_URL = repoLink;
export const GITHUB_USER = "laladwesh";

const KEY = "gh-followers";
const TTL = 15 * 60 * 1000;
let pending = null;

// A whole number, or null when the proxy did not answer. One request per tab: the answer is kept
// in memory and in sessionStorage for 15 minutes, like the other GitHub numbers.
export const loadFollowers = () => {
  try {
    const hit = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (hit && Number.isInteger(hit.n) && Date.now() - hit.at < TTL) return Promise.resolve(hit.n);
  } catch {
    /* sessionStorage can be blocked */
  }
  if (!pending) {
    pending = getJson("/api/github/stats")
      .then((d) => {
        if (!Number.isInteger(d?.followers)) throw new Error("no followers");
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ n: d.followers, at: Date.now() }));
        } catch {
          /* ignore */
        }
        return d.followers;
      })
      .catch(() => null)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

// undefined while loading, null if it failed, otherwise the count.
export const useFollowers = () => {
  const [n, setN] = useState(undefined);
  useEffect(() => {
    let live = true;
    loadFollowers().then((v) => live && setN(v));
    return () => {
      live = false;
    };
  }, []);
  return n;
};
