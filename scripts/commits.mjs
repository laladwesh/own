// Reads this repository's REAL git history and writes src/constants/gitgraph.js, which the page
// background (a git graph down the side margin) and the terminal's `git log` both draw from. It runs as
// the first step of `npm run build`.
//
//   git log --all --date-order --parents   the latest ~60 commits, with their real parents and branch tips
//
// The lane layout is worked out the way `git log --graph` does it: every commit sits in the column that
// is waiting for it, its first parent keeps that column, any further parent (a merge) gets a column of
// its own, and a column that is waiting for a commit that shows up in another column joins it. Nothing is
// invented: a linear history gives one straight line.
//
// If git or the history is not available (a shallow clone in CI, no .git), the file that is already
// there is kept (it is committed to the repo) and a warning is printed, so the build never fails here.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src", "constants", "gitgraph.js");
const LIMIT = 60;
const SEP = "\x1f";

const git = (args, opts = {}) => execFileSync("git", args, { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], ...opts }).trim();

// A subject that could carry a secret, a private address or an identity is never shown (the dot stays).
const SENSITIVE = /(token|secret|passw(or)?d|passwd|api[_ -]?key|private|credential|bearer|\.env\b|ssh[_ -]?key|ghp_|sk-[a-z0-9]|AKIA[0-9A-Z]{8})/i;
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const IPV4 = /\b\d{1,3}(\.\d{1,3}){3}\b/;
const BLOB = /[A-Za-z0-9+/=_-]{28,}/;
const safe = (s) => (s && !SENSITIVE.test(s) && !EMAIL.test(s) && !IPV4.test(s) && !BLOB.test(s) ? s : "");

// "feat(x): add a thing" -> "add a thing"
const plain = (s) => s.replace(/^\w+(\([^)]*\))?!?:\s*/, "").replace(/\s+/g, " ").trim();

const warn = (msg) => console.warn(`commits.mjs: WARNING: ${msg}`);

const existingTotal = () => {
  try {
    return Number(/total: (\d+)/.exec(fs.readFileSync(OUT, "utf-8"))?.[1] ?? 0);
  } catch {
    return 0;
  }
};

const build = () => {
  if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
    try {
      git(["fetch", "--unshallow", "--quiet"], { timeout: 60000 });
    } catch {
      warn("this is a shallow clone and the full history could not be fetched");
    }
  }
  const raw = git(["log", "--all", "--date-order", "--parents", `-n${LIMIT}`, "--date=short", `--format=%H${SEP}%P${SEP}%s${SEP}%ad${SEP}%D`]);
  const log = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [h, p, s, d, refs] = line.split(SEP);
      return { h, parents: p ? p.split(" ") : [], s, d, refs: refs ? refs.split(", ").filter(Boolean) : [] };
    });
  if (!log.length) throw new Error("no commits");

  // ── lanes ──
  const lanes = []; // the hash each column is waiting for (null = free)
  const free = () => {
    const i = lanes.indexOf(null);
    return i === -1 ? lanes.length : i;
  };
  const rows = [];
  for (const c of log) {
    const before = lanes.map(Boolean);
    let col = lanes.indexOf(c.h);
    if (col === -1) {
      col = free();
      lanes[col] = c.h; // a branch tip: nothing above it was waiting
    }
    const from = new Map(); // column -> the column of the commit that fed it (for the line leaving the dot)
    lanes[col] = null;
    c.parents.forEach((ph, i) => {
      const waiting = lanes.indexOf(ph);
      if (waiting !== -1) from.set(waiting, col);
      else if (i === 0) {
        lanes[col] = ph;
        from.set(col, col);
      } else {
        const j = free();
        lanes[j] = ph;
        from.set(j, col);
      }
    });
    rows.push({ c, col, before, after: lanes.slice(), from, merge: c.parents.length > 1 });
    while (lanes.length && lanes[lanes.length - 1] === null) lanes.pop();
  }

  // ── the lines between one row and the next ──
  const commits = rows.map((r, i) => {
    const next = rows[i + 1];
    const seg = [];
    if (next) {
      r.after.forEach((hash, k) => {
        if (!hash) return;
        const xs = r.from.has(k) ? r.from.get(k) : k;
        const xe = next.c.h === hash ? next.col : k;
        seg.push([xs, xe]);
      });
    }
    const tags = r.c.refs
      .filter((x) => !x.startsWith("HEAD ->") && x !== "HEAD" && !x.startsWith("tag:"))
      .map((x) => x.replace(/^origin\//, "origin/"));
    return {
      h: r.c.h.slice(0, 7),
      f: r.c.h,
      s: safe(r.c.s),
      l: safe(plain(r.c.s)),
      d: r.c.d,
      c: r.col,
      m: r.merge ? 1 : 0,
      b: r.before.map((x) => (x ? 1 : 0)).join(""),
      a: r.after.map((x) => (x ? 1 : 0)).join(""),
      seg,
      tags,
    };
  });

  const head = log.flatMap((c) => c.refs).find((x) => x.startsWith("HEAD -> "))?.slice(8) ?? (git(["rev-parse", "--abbrev-ref", "HEAD"]) || "master");
  const total = Number(git(["rev-list", "--all", "--count"]));
  const merges = Number(git(["rev-list", "--all", "--merges", "--count"]));
  const branches = git(["branch", "-a", "--format=%(refname:short)"]).split("\n").filter(Boolean);
  let repo = "";
  try {
    repo = /github\.com[:/]([^/]+\/[^/.]+)/.exec(git(["remote", "get-url", "origin"]))?.[1] ?? "";
  } catch {
    /* no remote */
  }
  return { head, repo, total, merges, branches, shown: commits.length, commits };
};

try {
  const data = build();
  if (data.total < existingTotal() && existingTotal() > 0) {
    warn(`this history has ${data.total} commits but the committed graph has ${existingTotal()}; keeping the committed file`);
  } else {
    const lines = data.commits.map((c) => `    ${JSON.stringify(c)}`).join(",\n");
    fs.writeFileSync(
      OUT,
      `// GENERATED by scripts/commits.mjs (the first step of \`npm run build\`). Do not edit by hand; commit it.\n` +
        `// The real git history of this repository, with each commit's lane laid out like \`git log --graph\`.\n` +
        `// total: ${data.total}\n` +
        `export const GIT = {\n  head: ${JSON.stringify(data.head)},\n  repo: ${JSON.stringify(data.repo)},\n  total: ${data.total},\n  merges: ${data.merges},\n  branches: ${JSON.stringify(data.branches)},\n  commits: [\n${lines},\n  ],\n};\n`
    );
    console.log(`commits.mjs: ${data.shown} of ${data.total} commits, ${data.branches.length} branch refs, ${data.merges} merges`);
  }
} catch (e) {
  warn(`could not read the git history (${e.message}); keeping the committed src/constants/gitgraph.js`);
}
