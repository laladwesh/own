// Case studies live in src/content/case-studies/<slug>.md (front matter + markdown).
import { parseFrontmatter } from "./frontmatter.js";

const files = import.meta.glob("../content/case-studies/*.md", { query: "?raw", import: "default", eager: true });

// "OA Check: checking hundreds of laptops..." -> "OA Check"
export const shortTitle = (study) => study.title.split(":")[0];

export const caseStudies = Object.fromEntries(
  Object.entries(files).map(([path, raw]) => {
    const slug = path.split("/").pop().replace(/\.md$/, "");
    const { meta, body } = parseFrontmatter(raw);
    return [slug, { slug, ...meta, body }];
  })
);
