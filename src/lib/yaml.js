// ───────────── building YAML-ish lines ─────────────
// A line is { indent, parts: [{ t, text, href? }] } where t is one of
// key | val | comment | kw | punct | url.

const URL_RE = /^(https?:\/\/|mailto:)/;
const MAX = 66; // wrap width for block text
const INLINE_MAX = 100; // longer single-line values become a block

const wrap = (text, width = MAX) => {
  const words = text.split(/\s+/);
  const out = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
};

const scalar = (v) => {
  const text = String(v);
  if (URL_RE.test(text)) return { t: "url", text, href: text };
  return { t: "val", text: /(: |#)/.test(text) ? JSON.stringify(text) : text };
};

const isScalar = (v) => v === null || ["string", "number", "boolean"].includes(typeof v);

// Turn a plain object into numbered YAML lines. Keys starting with "#" become comments.
export const yamlLines = (obj, indent = 0, out = []) => {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("#")) {
      out.push({ indent, parts: [{ t: "comment", text: k }] });
      continue;
    }
    if (v === undefined || v === "" || v === null) continue;
    const key = { t: "key", text: k };
    const colon = { t: "punct", text: ":" };

    if (typeof v === "string" && (v.length > INLINE_MAX || v.includes("\n"))) {
      out.push({ indent, parts: [key, colon, { t: "punct", text: " |" }] });
      v.split("\n").flatMap((l) => wrap(l)).forEach((l) => out.push({ indent: indent + 1, parts: [{ t: "val", text: l }] }));
    } else if (isScalar(v)) {
      out.push({ indent, parts: [key, colon, { t: "punct", text: " " }, scalar(v)] });
    } else if (Array.isArray(v) && v.every(isScalar)) {
      const flat = `[${v.join(", ")}]`;
      if (flat.length <= MAX && !v.some((x) => URL_RE.test(String(x)))) {
        out.push({ indent, parts: [key, colon, { t: "punct", text: " [" }, { t: "val", text: v.join(", ") }, { t: "punct", text: "]" }] });
      } else {
        out.push({ indent, parts: [key, colon] });
        v.forEach((x) => out.push({ indent: indent + 1, parts: [{ t: "punct", text: "- " }, scalar(x)] }));
      }
    } else if (Array.isArray(v)) {
      out.push({ indent, parts: [key, colon] });
      v.forEach((item) => {
        const sub = yamlLines(item, indent + 2, []);
        if (sub.length) {
          sub[0] = { indent: indent + 1, parts: [{ t: "punct", text: "- " }, ...sub[0].parts] };
          out.push(...sub);
        }
      });
    } else {
      out.push({ indent, parts: [key, colon] });
      yamlLines(v, indent + 1, out);
    }
  }
  return out;
};


// Plain-text version of a set of lines (used by the terminal's `cat`).
export const linesToText = (lines) =>
  lines.map((l) => `${"  ".repeat(l.indent)}${l.parts.map((p) => p.text).join("")}`).join("\n");
