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

export const indexSeo = {
  title: `Incidents | ${NAME}`,
  description: INDEX_INTRO,
  path: "/incidents",
  image: ogImage("incidents"),
  imageAlt: "Incidents: postmortems by Avinash Gupta",
};

// Every route that gets its own prerendered page, with the tags it needs.
export const prerenderRoutes = [indexSeo, ...incidents.map(incidentSeo)];

export const sitemapPaths = ["/", "/incidents", ...incidents.map((i) => incidentPath(i.id))];
