// Drafts: anything containing "[NEEDS CONFIRMATION" (an incident, a note) is unfinished.
// Drafts show up in `npm run dev` with a banner. They are removed from the production build,
// the sitemap and the terminal (see the strip-drafts plugin in vite.config.js).
export const DRAFT_MARK = "[NEEDS CONFIRMATION";

export const isDraftText = (text) => String(text).includes(DRAFT_MARK);
export const isDraftObject = (obj) => isDraftText(JSON.stringify(obj));

// True only while running the Vite dev server. Node scripts and production builds have no
// import.meta.env.DEV, so they never see drafts.
export const SHOW_DRAFTS = Boolean(import.meta.env?.DEV);

export const DRAFT_BANNER = "DRAFT: unconfirmed details";
