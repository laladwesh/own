// Reads src/content/case-studies/*.md for the build scripts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../src/lib/frontmatter.js";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "case-studies");

export const loadCaseStudies = () =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(dir, f), "utf8"));
      return { slug: f.replace(/\.md$/, ""), ...meta, body };
    });
