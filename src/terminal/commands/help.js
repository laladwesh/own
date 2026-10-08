import { h } from "../h.js";
import { Lines, Muted, Run, Strong } from "../ui.jsx";
import { GROUPS } from "../groups.js";


export default {
  name: "help",
  group: "navigate",
  summary: "list commands, grouped (help --all shows hidden ones)",
  usage: "help [--all]",
  run(args, ctx) {
    const all = args.includes("--all");
    const lines = [];
    // The joke commands are not in the plain `help`; `help --all` lists them under their group.
    const easter = all ? (ctx.allCommands ?? []).filter((c) => c.easter) : [];
    for (const [key, title] of GROUPS) {
      const cmds = [
        ...ctx.commands.filter((c) => c.group === key && !c.hidden && (!c.secret || (all && ctx.unlocked))),
        ...easter.filter((c) => c.group === key),
      ];
      if (!cmds.length) continue;
      lines.push(h(Strong, null, title));
      for (const c of cmds) {
        lines.push(
          h(
            "span",
            null,
            "  ",
            h(Run, { cmd: `man ${c.name}`, run: ctx.run, title: `man ${c.name}` }, c.name.padEnd(12)),
            h(Muted, null, c.secret ? `${c.summary} [secret]` : c.summary)
          )
        );
      }
    }
    lines.push(h(Muted, null, "click a command for its manual. Tab completes, Up/Down walks history."));
    return h(Lines, { lines });
  },
};
