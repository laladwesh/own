// After `vite build`: writes a static HTML file for /incidents and every /incidents/:id, so a
// crawler that doesn't run JavaScript (LinkedIn, Slack, X) still sees the right title and
// share tags. Each file is dist/index.html with the head tags swapped in and a plain-text
// fallback inside #root (React replaces it as soon as the app starts). Also writes
// dist/sitemap.xml.
//
// No headless browser and no extra dependency: this is a small string transform.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, caseStudyPath, caseStudySeo, homeJsonLd, homeSeo, jsonLdFor, noteSeo, ogImage, prerenderRoutes, sitemapPaths } from "../src/lib/seo.js";
import { loadNotes } from "./notes.mjs";
import { loadCaseStudies } from "./case-studies.mjs";
import { incidents, incidentMarkdown } from "../src/lib/incidents.js";
import { mdToHtml } from "./mdlite.mjs";
import { aboutMe } from "../src/constants/profile.js";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Sitemap and feed dates must be YYYY-MM-DD; some incident/note dates are only year-month.
const fullDate = (d) => (/^\d{4}-\d{2}$/.test(d ?? "") ? `${d}-01` : /^\d{4}-\d{2}-\d{2}$/.test(d ?? "") ? d : null);

const headTags = (r) =>
  [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    `<link rel="canonical" href="${SITE}${r.path}" />`,
    `<meta property="og:type" content="${r.type ?? "website"}" />`,
    `<meta property="og:site_name" content="Avinash Gupta" />`,
    `<meta property="og:locale" content="en_US" />`,
    ...(r.published && fullDate(r.published) ? [`<meta property="article:published_time" content="${fullDate(r.published)}" />`, `<meta property="article:author" content="${SITE}/" />`] : []),
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${SITE}${r.path}" />`,
    `<meta property="og:image" content="${r.image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(r.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(r.title)}" />`,
    `<meta name="twitter:description" content="${esc(r.description)}" />`,
    `<meta name="twitter:image" content="${r.image}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="alternate" type="application/rss+xml" title="Avinash Gupta: notes and incident postmortems" href="${SITE}/rss.xml" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLdFor(r)).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");

const studies = loadCaseStudies();
const published = loadNotes();

// The text a crawler without JavaScript reads. Detail pages carry their full text; index pages
// carry a list of links.
const links = (items) => `<ul>${items.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ul>`;
const bodyFor = (r) => {
  const inc = incidents.find((i) => `/incidents/${i.id}` === r.path);
  if (inc) return mdToHtml(incidentMarkdown(inc).split("\n").slice(1).join("\n"));
  const note = published.find((n) => `/notes/${n.slug}` === r.path);
  if (note) return mdToHtml(note.body);
  const study = studies.find((s) => caseStudyPath(s.slug) === r.path);
  if (study) return mdToHtml(study.body);
  if (r.path === "/incidents") return links(incidents.map((i) => [`/incidents/${i.id}`, `${i.id}: ${i.title}`]));
  if (r.path === "/notes") return links(published.map((n) => [`/notes/${n.slug}`, n.title]));
  if (r.path === "/case-studies") return links(studies.map((s) => [caseStudyPath(s.slug), s.title]));
  return "";
};

const nav = `<nav><a href="/">Home</a> <a href="/case-studies">Case studies</a> <a href="/incidents">Incidents</a> <a href="/notes">Notes</a></nav>`;
const fallback = (r) =>
  `<main><h1>${esc(r.title.split(" | ")[0])}</h1><p>${esc(r.description)}</p>${bodyFor(r)}${nav}</main>`;

const homeFallback = `<main><h1>${esc(aboutMe.name)}</h1><p>${esc(aboutMe.tagLine)}</p><p>${esc(aboutMe.intro)}</p>${nav}<h2>Case studies</h2>${links(studies.map((s) => [caseStudyPath(s.slug), s.title]))}<h2>Incidents</h2>${links(incidents.map((i) => [`/incidents/${i.id}`, `${i.id}: ${i.title}`]))}<h2>Notes</h2>${links(published.map((n) => [`/notes/${n.slug}`, n.title]))}<p><a href="https://github.com/laladwesh">GitHub</a> <a href="https://www.linkedin.com/in/avinash-gupta-58171828a/">LinkedIn</a></p></main>`;
const allRoutes = [...prerenderRoutes, ...studies.map(caseStudySeo), ...published.map(noteSeo)];
const allPaths = [...sitemapPaths, ...studies.map((s) => caseStudyPath(s.slug)), ...published.map((n) => `/notes/${n.slug}`)];

for (const r of allRoutes) {
  const html = template
    .replace(/<title>.*?<\/title>/s, "")
    .replace("</head>", `    ${headTags(r)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${fallback(r)}</div>`);
  const dir = path.join(dist, r.path.slice(1));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(`prerender: dist${r.path}/index.html`);
}

// The homepage gains a title, description, share tags and Person/WebSite data.
const homeTitle = "Avinash Gupta | Software developer";
const homeImage = ogImage("home");
const homeTags = [
  `<meta name="description" content="${esc(homeSeo.description)}" />`,
  `<link rel="canonical" href="${SITE}/" />`,
  `<meta property="og:type" content="website" />`,
  `<meta property="og:site_name" content="Avinash Gupta" />`,
  `<meta property="og:title" content="${esc(homeTitle)}" />`,
  `<meta property="og:description" content="${esc(homeSeo.description)}" />`,
  `<meta property="og:url" content="${SITE}/" />`,
  `<meta property="og:image" content="${homeImage}" />`,
  `<meta property="og:image:width" content="1200" />`,
  `<meta property="og:image:height" content="630" />`,
  `<meta property="og:image:alt" content="Avinash Gupta: software developer" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:title" content="${esc(homeTitle)}" />`,
  `<meta name="twitter:description" content="${esc(homeSeo.description)}" />`,
  `<meta name="twitter:image" content="${homeImage}" />`,
  `<meta name="robots" content="index, follow, max-image-preview:large" />`,
  `<link rel="me" href="https://github.com/laladwesh" />`,
  `<link rel="alternate" type="application/rss+xml" title="Avinash Gupta: notes and incident postmortems" href="${SITE}/rss.xml" />`,
  `<meta name="author" content="Avinash Gupta" />`,
  `<meta property="og:locale" content="en_US" />`,
  `<script type="application/ld+json">${JSON.stringify(homeJsonLd).replace(/</g, "\\u003c")}</script>`,
].join("\n    ");
fs.writeFileSync(
  path.join(dist, "index.html"),
  template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(homeTitle)}</title>`)
    .replace("</head>", `    ${homeTags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${homeFallback}</div>`)
);
console.log("prerender: dist/index.html (title, share tags, JSON-LD)");

const today = new Date().toISOString().slice(0, 10);
const noteDate = (p) => published.find((n) => `/notes/${n.slug}` === p)?.date;
const lastmod = (p) =>
  fullDate(p.startsWith("/incidents/") ? incidents.find((i) => `/incidents/${i.id}` === p)?.date : noteDate(p)) ?? today;
const urls = allPaths.map((p) => `  <url><loc>${SITE}${p === "/" ? "/" : p}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join("\n");
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log("prerender: dist/sitemap.xml");

// RSS feed: notes and incidents, newest first (case studies carry no date).
const feedItems = [
  ...published.map((n) => ({ path: `/notes/${n.slug}`, title: n.title, summary: n.summary, date: fullDate(n.date) })),
  ...incidents.map((i) => ({ path: `/incidents/${i.id}`, title: `${i.id}: ${i.title}`, summary: i.summary, date: fullDate(i.date) })),
].sort((a, b) => (a.date < b.date ? 1 : -1));
const rssItem = (i) =>
  `    <item><title>${esc(i.title)}</title><link>${SITE}${i.path}</link><guid>${SITE}${i.path}</guid><pubDate>${new Date(i.date ?? today).toUTCString()}</pubDate><description>${esc(i.summary ?? "")}</description></item>`;
fs.writeFileSync(
  path.join(dist, "rss.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Avinash Gupta</title>\n    <link>${SITE}/</link>\n    <description>Notes and incident postmortems by Avinash Gupta.</description>\n    <language>en</language>\n${feedItems.map(rssItem).join("\n")}\n  </channel>\n</rss>\n`
);
console.log("prerender: dist/rss.xml");
