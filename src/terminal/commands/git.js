import { h } from "../h.js";
import { Lines, Muted, Run, Strong, Ext } from "../ui.jsx";
import { commits } from "../fs.js";
import { BUILD } from "../../lib/deploy.js";
import { GIT } from "../../constants/gitgraph.js";
import { followRun } from "./follow.js";

// The real history of this site's repository, the same data the page background draws (latest 15):
// `git log` is a one-line list, `git log --graph` adds the lanes.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const longDate = (d) => {
  const [y, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`;
};
const lanesOf = (occ, col, mark) => {
  const n = Math.max(occ.length, col + 1);
  return Array.from({ length: n }, (_, k) => (k === col ? mark : occ[k] === "1" ? "|" : " ")).join(" ");
};
const realLog = (graph, ctx) => {
  const rows = GIT.commits.slice(0, 15);
  const lines = [];
  rows.forEach((c) => {
    const tags = [...(c === GIT.commits[0] ? [`HEAD -> ${GIT.head}`] : []), ...c.tags];
    const deco = tags.length ? ` (${tags.join(", ")})` : "";
    const text = h(
      "span",
      null,
      graph ? `${lanesOf(c.b, c.c, "*")}  ` : "",
      h(Run, { cmd: `git show ${c.h}`, run: ctx.run }, c.h),
      deco,
      ` ${c.s || "(subject not shown)"} `,
      h(Muted, null, `(${longDate(c.d)})`)
    );
    lines.push(text);
    if (graph) {
      // a line that leaves or joins a column gets its own connector row, like git does
      c.seg.forEach(([xs, xe]) => {
        if (xs === xe) return;
        const n = Math.max(c.a.length, xs + 1, xe + 1);
        lines.push(Array.from({ length: n }, (_, k) => (k === xe ? (xe > xs ? "\\" : "/") : c.a[k] === "1" || k === xs ? "|" : " ")).join(" "));
      });
    }
  });
  lines.push(
    " ",
    h(Muted, null, `latest ${rows.length} of ${GIT.total} commits on ${GIT.head}. \`git log --career\` is my career as commits.`)
  );
  return h(Lines, { lines });
};

const log = (ctx) =>
  h(Lines, {
    lines: commits.map((c, i) =>
      h(
        "span",
        null,
        h(Run, { cmd: `git show ${c.hash}`, run: ctx.run }, c.hash),
        i === 0 ? h(Strong, null, " (HEAD)") : null,
        ` ${c.date} ${c.title}, ${c.org}`
      )
    ),
  });

// `git log -1`: the real last commit of this site, from the build.
const lastCommit = () =>
  h(Lines, {
    lines: [
      h(Strong, null, `commit ${BUILD.full || BUILD.sha}`),
      "Author: Avinash Gupta",
      `Date:   ${BUILD.date || "unknown"}`,
      " ",
      `    ${BUILD.message || "(no message)"}`,
    ],
  });

const show = (args) => {
  const key = args[0];
  if (!key) return h(Muted, null, "usage: git show <hash>");
  const real = GIT.commits.find((x) => x.f.startsWith(key));
  if (real) {
    return h(Lines, {
      lines: [
        h(Strong, null, `commit ${real.f}`),
        `Date:   ${longDate(real.d)}`,
        " ",
        `    ${real.s || "(subject not shown)"}`,
        ...(GIT.repo ? [" ", h(Muted, null, `    https://github.com/${GIT.repo}/commit/${real.f}`)] : []),
      ],
    });
  }
  const c = commits.find((x) => x.hash.startsWith(key));
  if (!c) return h(Muted, null, `fatal: bad object ${key}`);
  const lines = [
    h(Strong, null, `commit ${c.hash}`),
    `Author: Avinash Gupta`,
    `Date:   ${c.duration}`,
    " ",
    h(Strong, null, `    ${c.title}`),
    `    ${c.org}`,
    " ",
    ...c.notes.map((n) => `    ${n}`),
  ];
  return h(Lines, { lines });
};

const status = () => {
  const current = commits.find((c) => /present/i.test(c.duration)) ?? commits[0];
  return h(Lines, {
    lines: [
      "On branch ece-27",
      `Working on: ${current.title}, ${current.org}`,
      h(Muted, null, "nothing to commit, working tree clean"),
    ],
  });
};

export default {
  name: "git",
  group: "me",
  summary: "this site's real commit history (and my career as commits)",
  usage: "git log   |   git log --graph   |   git log --career   |   git log -1   |   git show <hash>   |   git status",
  example: "git log",
  run(args, ctx) {
    const [sub, ...rest] = args;
    if (sub === "log" && rest.some((a) => /^-(n ?)?1$/.test(a) || a === "-n1")) return lastCommit();
    if (sub === "log" && rest.includes("--career")) return log(ctx);
    if (sub === "log") return realLog(rest.includes("--graph"), ctx);
    if (sub === "show") return show(rest);
    if (sub === "status") return status();
    if (sub === "follow") return followRun(rest, ctx);
    if (sub === "blame") return "100% avinash. Nobody else to blame.";
    if (sub === "push" && rest.some((a) => a === "--force" || a === "-f")) {
      ctx.ask({
        steps: [{ key: "sure", label: "Are you sure? (y/N)" }],
        discover: "forcepush",
        done: () => "Good choice.",
      });
      return null;
    }
    if (sub === "push") return "Everything up-to-date.";
    return h(Muted, null, "usage: git log | git show <hash> | git status");
  },
  subcommands: ["log", "show", "status", "follow"],
};
