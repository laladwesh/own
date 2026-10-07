import { h } from "../h.js";
import { Lines, Run } from "../ui.jsx";
import { now, nowNotes } from "../../constants/now.js";
import { notes } from "../../lib/notes.js";

const row = (label, ...rest) => h("span", { key: label }, `${label.padEnd(9)} \u2192 `, ...rest);

// Link to a note only when it is published (a draft is not linked in production).
const noteLink = (slug, text, ctx) =>
  notes.some((n) => n.slug === slug)
    ? h(Run, { cmd: `open notes/${slug}`, run: ctx.run, title: `open notes/${slug}` }, text)
    : text;

export default {
  name: "now",
  group: "me",
  summary: "what I'm building, learning and looking for",
  usage: "now",
  example: "now",
  description: "A short status: what I'm building, what I'm learning, my current role, and what I'm open to.",
  run(args, ctx) {
    return h(Lines, {
      lines: [
        row("building", noteLink(nowNotes.building, now.building, ctx)),
        row("learning", noteLink(nowNotes.learning, now.learning, ctx)),
        row("working", now.working),
        ...(now.lookingFor ? [row("looking", now.lookingFor)] : []),
        row("contact", "run ", h(Run, { cmd: "hire avinash", run: ctx.run }, "hire avinash"), " or ", h(Run, { cmd: "ssh recruiter@avinash", run: ctx.run }, "ssh recruiter@avinash")),
        row("updated", now.updated),
      ],
    });
  },
};
