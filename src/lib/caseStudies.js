// Case studies live in src/content/case-studies/<slug>.md (front matter + markdown).
// A draft (any file containing the NEEDS CONFIRMATION marker) shows in `npm run dev` only:
// `virtual:case-studies` is built by the strip-drafts plugin in vite.config.js.
import { parseFrontmatter } from "./frontmatter.js";
import { SHOW_DRAFTS, isDraftText } from "./drafts.js";
import files from "virtual:case-studies";

// The order the case studies appear in; anything not listed goes last.
const ORDER = ["oa-check", "intern-portal", "dday-live-portal", "status-monitor"];
const rank = (slug) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);

// "OA Check: checking hundreds of laptops..." -> "OA Check"
export const shortTitle = (study) => study.title.split(":")[0];

export const caseStudies = Object.fromEntries(
  files
    .map(({ slug, raw }) => {
      const { meta, body } = parseFrontmatter(raw);
      return [slug, { slug, ...meta, body, draft: isDraftText(raw) }];
    })
    .filter(([, s]) => SHOW_DRAFTS || !s.draft)
    .sort((a, b) => rank(a[0]) - rank(b[0]))
);
