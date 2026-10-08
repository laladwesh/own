import { h } from "../h.js";
import { Lines, Muted, Run, Strong, Ext } from "../ui.jsx";
import { commits } from "../fs.js";
import { BUILD } from "../../lib/deploy.js";

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
  summary: "my career as a commit history",
  usage: "git log   |   git log -1   |   git show <hash>   |   git status",
  example: "git log",
  run(args, ctx) {
    const [sub, ...rest] = args;
    if (sub === "log" && rest.some((a) => /^-(n ?)?1$/.test(a) || a === "-n1")) return lastCommit();
    if (sub === "log") return log(ctx);
    if (sub === "show") return show(rest);
    if (sub === "status") return status();
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
  subcommands: ["log", "show", "status"],
};
