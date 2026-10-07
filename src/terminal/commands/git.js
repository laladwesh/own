import { h } from "../h.js";
import { Lines, Muted, Run, Strong, Ext } from "../ui.jsx";
import { commits } from "../fs.js";

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
  usage: "git log   |   git show <hash>   |   git status",
  run(args, ctx) {
    const [sub, ...rest] = args;
    if (sub === "log") return log(ctx);
    if (sub === "show") return show(rest);
    if (sub === "status") return status();
    return h(Muted, null, "usage: git log | git show <hash> | git status");
  },
  subcommands: ["log", "show", "status"],
};
