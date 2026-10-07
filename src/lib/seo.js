// Page titles, descriptions and share cards. Shared by the app (runtime) and by the build
// scripts (scripts/og.mjs, scripts/prerender.mjs), so both always agree. No browser APIs here.
import { incidents } from "./incidents.js";

export const SITE = "https://avinashgupta.in";
export const NAME = "Avinash Gupta";

export const INDEX_INTRO =
  "Blameless postmortems of the things that broke, or nearly broke, on systems I run. Each one ends with what I changed afterwards.";

// Cut at a word boundary.
export const truncate = (text, max = 200) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 3);
  return `${cut.slice(0, cut.lastIndexOf(" "))}...`;
};

export const incidentPath = (id) => `/incidents/${id}`;
export const ogImage = (name) => `${SITE}/og/${name}.png`;

export const incidentSeo = (inc) => ({
  title: `${inc.id}: ${inc.title} | ${NAME}`,
  description: truncate(inc.summary),
  path: incidentPath(inc.id),
  image: ogImage(inc.id),
  imageAlt: `${inc.id} / ${inc.severity}: ${inc.title}`,
});

// A case study page: /projects/<slug>. `cs` is the front matter plus its slug.
export const caseStudyPath = (slug) => `/projects/${slug}`;
export const caseStudySeo = (cs) => ({
  title: `${cs.title} | ${NAME}`,
  description: truncate(cs.summary),
  path: caseStudyPath(cs.slug),
  image: ogImage(cs.slug),
  imageAlt: `Case study: ${cs.title}`,
});

export const NOTES_INTRO =
  "Things I fixed, set up or got wrong, written down while I still remember the details.";

export const noteSeo = (n) => ({
  title: `${n.title} | ${NAME}`,
  description: truncate(n.summary),
  path: `/notes/${n.slug}`,
  image: ogImage(`note-${n.slug}`),
  imageAlt: `Note: ${n.title}`,
});

export const notesIndexSeo = {
  title: `Notes | ${NAME}`,
  description: NOTES_INTRO,
  path: "/notes",
  image: ogImage("notes"),
  imageAlt: "Notes by Avinash Gupta",
};

export const indexSeo = {
  title: `Incidents | ${NAME}`,
  description: INDEX_INTRO,
  path: "/incidents",
  image: ogImage("incidents"),
  imageAlt: "Incidents: postmortems by Avinash Gupta",
};

// Every route that gets its own prerendered page, with the tags it needs.
export const prerenderRoutes = [indexSeo, notesIndexSeo, ...incidents.map(incidentSeo)];

export const sitemapPaths = ["/", "/incidents", "/notes", ...incidents.map((i) => incidentPath(i.id))];
