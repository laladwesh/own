import { h } from "../h.js";
import { Lines, Muted, Strong } from "../ui.jsx";
import { glossary, glossaryById } from "../../constants/glossary.js";
import { explain as sections, pageExplain } from "../../constants/explain.js";

const find = (q) => {
  const key = q.toLowerCase().replace(/[^a-z0-9/]+/g, "");
  return (
    glossaryById[q.toLowerCase()] ??
    glossary.find((g) => g.id.replace(/-/g, "") === key || g.term.toLowerCase().replace(/[^a-z0-9/]+/g, "") === key || g.match.some((m) => m.toLowerCase().replace(/[^a-z0-9/]+/g, "") === key))
  );
};

export default {
  name: "explain",
  group: "navigate",
  summary: "plain-English meaning of a word, or of this page",
  usage: "explain [term]   (try: explain yaml, explain pipeline)",
  example: "explain yaml",
  description:
    "explain with no word describes the page you are on in a few sentences. explain <term> prints the plain meaning of a technical word. glossary lists every word it knows.",
  run(args, ctx) {
    const q = args.join(" ").trim();
    if (!q) return h(Lines, { lines: [h(Strong, null, "this page"), pageExplain(ctx.pathname?.() ?? "/"), h(Muted, null, "explain <term> for a word, glossary for the full list.")] });
    const entry = find(q);
    if (entry) {
      return h(Lines, {
        lines: [
          h(Strong, null, entry.term),
          entry.plain,
          entry.link ? h(Muted, null, `see: ${entry.link[0]} (${entry.link[1]})`) : null,
        ].filter(Boolean),
      });
    }
    const section = sections[q] ?? sections[q.toLowerCase()];
    if (section) return h(Lines, { lines: [h(Strong, null, q), section.text] });
    return h(Muted, null, `explain: no entry for '${q}'. glossary lists the words I know.`);
  },
};
