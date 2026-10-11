import { h } from "../h.js";
import { Lines, Muted, Run } from "../ui.jsx";
import { glossary } from "../../constants/glossary.js";

export default {
  name: "glossary",
  group: "navigate",
  summary: "list the technical words explained on this site",
  usage: "glossary",
  example: "glossary",
  description: "Lists every technical word the site can explain in plain English. explain <term> prints one.",
  run(args, ctx) {
    return h(Lines, {
      lines: [
        h(Muted, null, `${glossary.length} words. click one, or type explain <word>.`),
        ...glossary.map((g) =>
          h("span", { key: g.id }, h(Run, { cmd: `explain ${g.id}`, run: ctx.run }, g.term.padEnd(16)), h(Muted, null, g.plain.split(/(?<=[.!?])\s/)[0]))
        ),
      ],
    });
  },
};
