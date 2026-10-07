/**
 * GitHub proxy for the portfolio.
 *
 * The browser used to call api.github.com with a token baked into the JS bundle.
 * Now it calls this service instead: the token (GITHUB_TOKEN) lives only in this
 * process' environment, responses are cached (CACHE_TTL_MS, default 15 min) and
 * the last good response is served if GitHub fails.
 *
 *   GET /stats   profile numbers, contribution calendar, languages
 *   GET /prs     pull requests in the repos listed in repos.json
 *   GET /health
 *
 * Env: GITHUB_TOKEN (required), GITHUB_USERNAME, PORT (4002), ALLOWED_ORIGINS
 * (comma separated), CACHE_TTL_MS.
 */
import express from "express";
import cors from "cors";
import { readFileSync } from "node:fs";

// Minimal .env loader. GITHUB_TOKEN can live in server/github-api/.env or, if it is not
// there (or empty), in the project's root .env (e.g. ~/portfolio/.env on the server). Real
// environment variables win over both files. From the root file only GITHUB_TOKEN is read.
const loadEnv = (url, only) => {
  try {
    for (const line of readFileSync(url, "utf-8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq <= 0) continue;
      const key = t.slice(0, eq).trim();
      if ((only && !only.includes(key)) || process.env[key]) continue;
      process.env[key] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* the file is optional */
  }
};
loadEnv(new URL("./.env", import.meta.url));
loadEnv(new URL("../../.env", import.meta.url), ["GITHUB_TOKEN"]);

const PORT = Number(process.env.PORT) || 4002;
const USERNAME = process.env.GITHUB_USERNAME || "laladwesh";
const TOKEN = process.env.GITHUB_TOKEN;
const TTL = Number(process.env.CACHE_TTL_MS) || 15 * 60 * 1000;
const ORIGINS = (process.env.ALLOWED_ORIGINS || "https://avinashgupta.in").split(",").map((s) => s.trim());
const REPOS = JSON.parse(readFileSync(new URL("./repos.json", import.meta.url), "utf-8"));
const PAGE_SIZE = 100;
const MAX_PAGES = 10;

if (!TOKEN) {
  console.error("[github-api] GITHUB_TOKEN is not set. Requests will fail until it is.");
}

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-github-api",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

const STATS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      followers { totalCount }
      publicRepos: repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
      contributionsCollection {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
        nodes {
          stargazerCount
          languages(first: 6, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } }
        }
      }
    }
  }`;

async function fetchStats() {
  const { user } = await gql(STATS_QUERY, { login: USERNAME });
  const c = user.contributionsCollection;
  const totals = {};
  let stars = 0;
  for (const r of user.repositories.nodes) {
    stars += r.stargazerCount || 0;
    for (const { size, node } of r.languages?.edges ?? []) totals[node.name] = (totals[node.name] || 0) + size;
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  const languages = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, size]) => ({ name, pct: sum ? (size / sum) * 100 : 0 }));

  return {
    repos: user.publicRepos.totalCount,
    followers: user.followers.totalCount,
    stars,
    commits: c.totalCommitContributions,
    issues: c.totalIssueContributions,
    prs: c.totalPullRequestContributions,
    totalContributions: c.contributionCalendar.totalContributions,
    weeks: c.contributionCalendar.weeks,
    languages,
    fetchedAt: new Date().toISOString(),
  };
}

const PR_QUERY = `
  query($q: String!, $after: String) {
    search(query: $q, type: ISSUE, first: ${PAGE_SIZE}, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        ... on PullRequest { id title state number createdAt url additions deletions }
      }
    }
  }`;

async function fetchPrs() {
  const q = `is:pr author:${USERNAME} sort:created-desc ${REPOS.map((r) => `repo:${r}`).join(" ")}`;
  const nodes = [];
  let after = null;
  for (let i = 0; i < MAX_PAGES; i++) {
    const { search } = await gql(PR_QUERY, { q, after });
    nodes.push(...search.nodes);
    if (!search.pageInfo.hasNextPage) break;
    after = search.pageInfo.endCursor;
  }
  // Closed-but-unmerged PRs are not contributions.
  return {
    prs: nodes
      .filter((n) => n.state !== "CLOSED")
      .map((n) => {
        const [, org, repo] = new URL(n.url).pathname.split("/");
        return {
          id: n.id,
          organization: org,
          repo,
          status: n.state,
          title: n.title,
          link: n.url,
          number: n.number,
          createdAt: n.createdAt,
          linesAdded: n.additions,
          linesDeleted: n.deletions,
        };
      }),
    fetchedAt: new Date().toISOString(),
  };
}

// ── cache with stale-on-error fallback ───────────────────────────────────
const caches = new Map();
const inflight = new Map();

async function cached(key, loader) {
  const hit = caches.get(key);
  if (hit && Date.now() - hit.at < TTL) return { ...hit.data, stale: false };
  if (!inflight.has(key)) {
    inflight.set(
      key,
      loader()
        .then((data) => {
          caches.set(key, { data, at: Date.now() });
          return data;
        })
        .finally(() => inflight.delete(key))
    );
  }
  try {
    return { ...(await inflight.get(key)), stale: false };
  } catch (err) {
    if (hit) {
      console.error(`[github-api] ${key} failed (${err.message}); serving cache from ${new Date(hit.at).toISOString()}`);
      return { ...hit.data, stale: true };
    }
    throw err;
  }
}

const app = express();
app.use(cors({ origin: ORIGINS }));
app.get("/health", (_req, res) => res.json({ ok: true }));

const route = (path, key, loader) =>
  app.get(path, async (_req, res) => {
    try {
      res.json(await cached(key, loader));
    } catch (err) {
      console.error(`[github-api] ${key}: ${err.message}`);
      res.status(502).json({ error: "github unavailable" });
    }
  });

route("/stats", "stats", fetchStats);
route("/prs", "prs", fetchPrs);

app.listen(PORT, "127.0.0.1", () => console.log(`[github-api] listening on 127.0.0.1:${PORT}`));
