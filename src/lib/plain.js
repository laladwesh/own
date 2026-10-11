// Three-line summaries for the top of an incident or a case study in "human" view. They are cut
// from the page's own text; nothing is written that the page does not already say.

// The first one or two sentences of a text, cut to at most `max` characters.
export const lead = (text, max = 230, sentences = 2) => {
  const clean = String(text ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [label](link) -> label
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  const parts = clean.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [clean];
  let out = "";
  for (const p of parts.slice(0, sentences)) {
    if ((out + p).length > max && out) break;
    out += p;
  }
  out = out.trim();
  if (out.length > max) out = `${out.slice(0, max - 1).replace(/\s+\S*$/, "")}...`;
  return out;
};

export const incidentSummary = (inc) => {
  // An incident can carry its own plain "What I did" (plainDid); otherwise it is cut from the page.
  if (inc.plainDid) return { happened: lead(inc.impact || inc.summary), did: inc.plainDid, learned: lead(inc.lesson) };
  const did = inc.resolution?.length
    ? `${inc.resolution.join(". ")}.`
    : (inc.actionItems ?? [])
        .filter((a) => a.done)
        .map((a) => a.text)
        .join(". ") || inc.timeline?.[inc.timeline.length - 1]?.event;
  return {
    happened: lead(inc.impact || inc.summary),
    did: lead(did, 230, 3),
    learned: lead(inc.lesson),
  };
};

// The first paragraph under a "## ..." heading whose title matches `title`.
const under = (body, title) => {
  const m = new RegExp(`^##\\s+[^\\n]*${title}[^\\n]*\\n+([\\s\\S]*?)(?=\\n##\\s|$)`, "im").exec(body);
  if (!m) return "";
  const para = m[1]
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("[DIAGRAM") && !p.startsWith("-") && !p.startsWith("```"));
  return para ?? "";
};

export const caseStudySummary = (study) => ({
  happened: lead(under(study.body, "challenge")),
  did: lead(under(study.body, "What I built")),
  learned: lead(under(study.body, "What I learned")),
});
