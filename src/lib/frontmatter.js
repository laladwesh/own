// Tiny front-matter reader for the case-study markdown files. Pure JS (no browser APIs), so
// the build scripts can use it too. Supports `key: "text"`, `key: plain text` and `key: [a, b]`
// on a single line each, which is all those files use.
export const parseFrontmatter = (source) => {
  const m = source.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: source };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith("[") && v.endsWith("]")) {
      meta[kv[1]] = v
        .slice(1, -1)
        .split(",")
        .map((x) => x.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      meta[kv[1]] = v.replace(/^"(.*)"$/, "$1");
    }
  }
  return { meta, body: m[2].trim() };
};
