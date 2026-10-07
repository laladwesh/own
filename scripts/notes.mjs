// Reads src/content/notes/*.md for the build scripts. Drafts (anything containing the
// NEEDS CONFIRMATION marker) are left out unless asked for.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../src/lib/frontmatter.js";
import { isDraftText } from "../src/lib/drafts.js";

export const notesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "notes");

export const loadNotes = ({ includeDrafts = false } = {}) =>
  fs
    .readdirSync(notesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(notesDir, f), "utf8");
      const { meta, body } = parseFrontmatter(raw);
      return { slug: f.replace(/\.md$/, ""), ...meta, tags: meta.tags ?? [], body, raw, draft: isDraftText(raw) };
    })
    .filter((n) => includeDrafts || !n.draft);
