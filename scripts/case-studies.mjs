// Reads src/content/case-studies/*.md for the build scripts. Drafts (anything containing the
// NEEDS CONFIRMATION marker) are left out unless asked for.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../src/lib/frontmatter.js";
import { isDraftText } from "../src/lib/drafts.js";

export const caseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "case-studies");

export const loadCaseStudies = ({ includeDrafts = false } = {}) =>
  fs
    .readdirSync(caseDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(caseDir, f), "utf8");
      const { meta, body } = parseFrontmatter(raw);
      return { slug: f.replace(/\.md$/, ""), ...meta, body, raw, draft: isDraftText(raw) };
    })
    .filter((c) => includeDrafts || !c.draft);
