// Notes live in src/content/notes/<slug>.md (front matter: title, date, summary, tags).
// Reading time is worked out from the text. Drafts show in `npm run dev` only.
import { parseFrontmatter } from "./frontmatter.js";
import { SHOW_DRAFTS, isDraftText } from "./drafts.js";

// `virtual:notes` is built by the strip-drafts plugin in vite.config.js: every note in
// src/content/notes/, minus drafts in a production build.
import files from "virtual:notes";

export const readingMinutes = (body) => Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 200));

export const notes = files
  .map(({ slug, raw }) => {
    const { meta, body } = parseFrontmatter(raw);
    return { slug, ...meta, tags: meta.tags ?? [], body, minutes: readingMinutes(body), draft: isDraftText(raw) };
  })
  .filter((n) => SHOW_DRAFTS || !n.draft)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export const notePath = (slug) => `/notes/${slug}`;
export const allTags = [...new Set(notes.flatMap((n) => n.tags))].sort();
