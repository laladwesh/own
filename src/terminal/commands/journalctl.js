import { h } from "../h.js";
import { Lines, Muted, Run } from "../ui.jsx";
import { incidents, logLine } from "../../lib/incidents.js";

// Shared by `journalctl --priority=crit` and `incidents`.
export const incidentList = (ctx) =>
  h(Lines, {
    lines: [
      ...incidents.map((inc) =>
        h(Run, { key: inc.id, cmd: `cat incidents/${inc.id}.md`, run: ctx.run, title: `cat incidents/${inc.id}.md` }, logLine(inc))
      ),
      h(Muted, { key: "hint" }, "click a line, or: cat incidents/<id>.md"),
    ],
  });

export default {
  name: "journalctl",
  group: "me",
  summary: "read the critical log (postmortems)",
  usage: "journalctl --priority=crit",
  example: "journalctl --priority=crit",
  description: "Lists the incident postmortems, one log line each. Same as `incidents`.",
  subcommands: ["--priority=crit"],
  run(args, ctx) {
    if (!args.length || args.includes("--priority=crit") || args.join(" ").includes("--priority crit")) return incidentList(ctx);
    return h(Muted, null, "usage: journalctl --priority=crit");
  },
};
