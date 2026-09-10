#!/usr/bin/env node
/**
 * Live LeetCode stats proxy.
 *
 * The frontend can't call https://leetcode.com/graphql directly — it sends
 * no Access-Control-Allow-Origin header, so browsers block the response.
 * This tiny server does the same GraphQL calls from Node (no CORS there),
 * keeps a short-lived in-memory cache so a burst of visitors doesn't hammer
 * LeetCode, and — if a live fetch ever fails — serves the last good response
 * instead of erroring, so the portfolio never shows a broken section just
 * because LeetCode had a hiccup.
 *
 * Deploy like the other self-hosted projects: PM2 + Nginx reverse proxy.
 *   pm2 start index.js --name leetcode-api
 *   nginx: proxy_pass http://127.0.0.1:<PORT>; on e.g. leetcode-api.avinashgupta.in
 *
 * Env vars (all optional):
 *   PORT               default 4001
 *   LEETCODE_USERNAME  default "ibXDVQOY8i"
 *   ALLOWED_ORIGINS     comma-separated list, default "https://avinashgupta.in"
 *   CACHE_TTL_MS        default 900000 (15 min)
 */

import express from "express";
import cors from "cors";

const PORT              = Number(process.env.PORT) || 4001;
const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || "ibXDVQOY8i";
const CACHE_TTL_MS      = Number(process.env.CACHE_TTL_MS) || 15 * 60 * 1000;
const ALLOWED_ORIGINS   = (process.env.ALLOWED_ORIGINS || "https://avinashgupta.in")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const GQL_HEADERS = {
  "Content-Type": "application/json",
  Referer: "https://leetcode.com",
  "User-Agent": "Mozilla/5.0",
};

async function gql(query, variables) {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: GQL_HEADERS,
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`LeetCode GraphQL ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

const PROFILE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking userAvatar }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
    }
    allQuestionsCount { difficulty count }
  }
`;

const CALENDAR_QUERY = `
  query userProfileCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

async function fetchLiveStats() {
  const profileData = await gql(PROFILE_QUERY, { username: LEETCODE_USERNAME });
  const matched = profileData.matchedUser;
  if (!matched) throw new Error(`LeetCode user "${LEETCODE_USERNAME}" not found`);

  const acByDifficulty = Object.fromEntries(
    matched.submitStatsGlobal.acSubmissionNum.map((d) => [d.difficulty, d.count])
  );
  const totalByDifficulty = Object.fromEntries(
    profileData.allQuestionsCount.map((d) => [d.difficulty, d.count])
  );

  const thisYear = new Date().getFullYear();
  const [curCal, prevCal] = await Promise.all([
    gql(CALENDAR_QUERY, { username: LEETCODE_USERNAME, year: thisYear }).catch(() => null),
    gql(CALENDAR_QUERY, { username: LEETCODE_USERNAME, year: thisYear - 1 }).catch(() => null),
  ]);

  const curCalendar  = curCal?.matchedUser?.userCalendar;
  const prevCalendar = prevCal?.matchedUser?.userCalendar;

  const submissionCalendar = {
    ...(prevCalendar ? JSON.parse(prevCalendar.submissionCalendar) : {}),
    ...(curCalendar ? JSON.parse(curCalendar.submissionCalendar) : {}),
  };

  return {
    username: matched.username,
    ranking: matched.profile.ranking,
    avatar: matched.profile.userAvatar,
    solved: {
      all: acByDifficulty.All ?? 0,
      easy: acByDifficulty.Easy ?? 0,
      medium: acByDifficulty.Medium ?? 0,
      hard: acByDifficulty.Hard ?? 0,
    },
    totals: {
      all: totalByDifficulty.All ?? null,
      easy: totalByDifficulty.Easy ?? null,
      medium: totalByDifficulty.Medium ?? null,
      hard: totalByDifficulty.Hard ?? null,
    },
    streak: curCalendar?.streak ?? 0,
    totalActiveDays: curCalendar?.totalActiveDays ?? null,
    submissionCalendar,
    fetchedAt: new Date().toISOString(),
  };
}

// ── Cache with stale-on-error fallback ─────────────────────────────────────
let cache = { data: null, fetchedAt: 0 };
let inflight = null;

async function getStats() {
  const fresh = cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
  if (fresh) return { ...cache.data, stale: false };

  if (!inflight) {
    inflight = fetchLiveStats()
      .then((data) => {
        cache = { data, fetchedAt: Date.now() };
        return data;
      })
      .finally(() => { inflight = null; });
  }

  try {
    const data = await inflight;
    return { ...data, stale: false };
  } catch (err) {
    if (cache.data) {
      console.error(`[leetcode-api] live fetch failed (${err.message}), serving cached data from ${new Date(cache.fetchedAt).toISOString()}`);
      return { ...cache.data, stale: true };
    }
    throw err;
  }
}

// ── HTTP server ──────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/stats", async (_req, res) => {
  try {
    const data = await getStats();
    res.set("Cache-Control", "public, max-age=60");
    res.json(data);
  } catch (err) {
    res.status(503).json({ error: "LeetCode is unreachable and no cached data is available yet", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ leetcode-api listening on :${PORT} (user=${LEETCODE_USERNAME}, ttl=${CACHE_TTL_MS}ms)`);
  console.log(`  allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
