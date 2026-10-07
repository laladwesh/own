// Page titles, descriptions and share cards. Shared by the app (runtime) and by the build
// scripts (scripts/og.mjs, scripts/prerender.mjs), so both always agree. No browser APIs here.
import { incidents } from "./incidents.js";
import { now } from "../constants/now.js";
import { SHOW_DRAFTS, isDraftText } from "./drafts.js";

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
  type: "article",
  published: inc.date,
});

// A case study page: /projects/<slug>. `cs` is the front matter plus its slug.
export const caseStudyPath = (slug) => `/projects/${slug}`;
export const caseStudySeo = (cs) => ({
  title: `${cs.title} | ${NAME}`,
  description: truncate(cs.summary),
  path: caseStudyPath(cs.slug),
  image: ogImage(cs.slug),
  imageAlt: `Case study: ${cs.title}`,
  type: "article",
});

export const CASE_INTRO = "Things I built, how they changed along the way, and what I would do differently.";
export const caseStudiesIndexSeo = {
  title: `Case studies | ${NAME}`,
  description: CASE_INTRO,
  path: "/case-studies",
  image: ogImage("case-studies"),
  imageAlt: "Case studies by Avinash Gupta",
};

// An unfinished "open to" line (still carrying the draft marker) only shows in `npm run dev`.
const openTo = isDraftText(now.lookingForShort) && !SHOW_DRAFTS ? "" : now.lookingForShort;

// The homepage: a description only (the title and the rest stay as they are).
export const homeSeo = {
  title: "Avinash Gupta",
  descriptionOnly: true,
  path: "/",
  description: `${NAME}: ${now.working}. Projects, case studies, incident postmortems and notes.${openTo ? ` Open to ${openTo}.` : ""}`,
};

export const NOTES_INTRO =
  "Things I fixed, set up or got wrong, written down while I still remember the details.";

export const noteSeo = (n) => ({
  title: `${n.title} | ${NAME}`,
  description: truncate(n.summary),
  path: `/notes/${n.slug}`,
  image: ogImage(`note-${n.slug}`),
  imageAlt: `Note: ${n.title}`,
  type: "article",
  published: n.date,
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
export const prerenderRoutes = [indexSeo, notesIndexSeo, caseStudiesIndexSeo, ...incidents.map(incidentSeo)];

export const sitemapPaths = ["/", "/incidents", "/notes", "/case-studies", ...incidents.map((i) => incidentPath(i.id))];

// ---- structured data (JSON-LD) ----
export const PERSON = {
  "@type": "Person",
  "@id": `${SITE}/#person`,
  name: NAME,
  url: SITE,
  jobTitle: "Software developer",
  alumniOf: { "@type": "CollegeOrUniversity", name: "Indian Institute of Technology Guwahati" },
  sameAs: ["https://github.com/laladwesh", "https://www.linkedin.com/in/avinash-gupta-58171828a/"],
};

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    PERSON,
    { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: NAME, inLanguage: "en", publisher: { "@id": `${SITE}/#person` } },
  ],
};

const SECTION_NAMES = { incidents: "Incidents", notes: "Notes", "case-studies": "Case studies", projects: "Case studies" };

// Breadcrumbs plus an Article (detail pages) or CollectionPage (index pages) for one route.
export const jsonLdFor = (r) => {
  const url = `${SITE}${r.path}`;
  const parts = r.path.split("/").filter(Boolean);
  const crumbs = [{ name: NAME, url: SITE }];
  if (parts[0]) {
    const base = parts[0] === "projects" ? "/case-studies" : `/${parts[0]}`;
    crumbs.push({ name: SECTION_NAMES[parts[0]] ?? parts[0], url: `${SITE}${base}` });
    if (parts[1]) crumbs.push({ name: r.title.split(" | ")[0], url });
  }
  const page =
    r.type === "article"
      ? {
          "@type": "Article",
          headline: r.title.split(" | ")[0],
          description: r.description,
          image: r.image,
          mainEntityOfPage: url,
          author: { "@id": `${SITE}/#person` },
          ...(r.published ? { datePublished: r.published } : {}),
        }
      : { "@type": "CollectionPage", name: r.title.split(" | ")[0], description: r.description, url };
  return {
    "@context": "https://schema.org",
    "@graph": [
      { ...page, author: page.author },
      PERSON,
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
      },
    ],
  };
};
