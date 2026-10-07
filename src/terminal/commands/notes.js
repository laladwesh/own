import { h } from "../h.js";
import { Lines, Muted, Run } from "../ui.jsx";
import { notes } from "../../lib/notes.js";

export default {
  name: "notes",
  group: "me",
  summary: "list my notes (write-ups)",
  usage: "notes",
  example: "notes",
  description: "Lists the notes, newest first. Read one with cat notes/<slug>.md, or open the page with cd notes.",
  run(args, ctx) {
    if (!notes.length) return h(Muted, null, "no notes yet");
    return h(Lines, {
      lines: [
        ...notes.map((n) =>
          h(
            "span",
            { key: n.slug },
            h(Muted, null, `${n.date}  `),
            h(Run, { cmd: `cat notes/${n.slug}.md`, run: ctx.run, title: `cat notes/${n.slug}.md` }, n.slug)
          )
        ),
        h(Muted, { key: "hint" }, "cat notes/<slug>.md to read, cd notes to open the page"),
      ],
    });
  },
};
