import { h } from "../h.js";
import { Lines, Muted, Strong } from "../ui.jsx";

export default {
  name: "man",
  group: "navigate",
  summary: "manual page for a command",
  usage: "man <command>",
  example: "man deploy",
  run(args, ctx) {
    const name = args[0];
    if (!name) return h(Muted, null, "usage: man <command>");
    const c = ctx.commands.find((x) => x.name === name && (!x.secret || ctx.unlocked));
    if (!c) return h(Muted, null, `No manual entry for ${name}`);
    return h(Lines, {
      lines: [
        h(Strong, null, "NAME"),
        `    ${c.name} - ${c.summary}`,
        h(Strong, null, "SYNOPSIS"),
        `    ${c.usage}`,
        ...(c.description ? [h(Strong, null, "DESCRIPTION"), `    ${c.description}`] : []),
        ...(c.example && c.example !== c.name ? [h(Strong, null, "EXAMPLE"), `    ${c.example}`] : []),
      ],
    });
  },
};
