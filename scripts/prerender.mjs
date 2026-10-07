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
import { incidents } from "../src/lib/incidents.js";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const headTags = (r) =>
  [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    `<link rel="canonical" href="${SITE}${r.path}" />`,
    `<meta property="og:type" content="${r.type ?? "website"}" />`,
    `<meta property="og:site_name" content="Avinash Gupta" />`,
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
    `<script type="application/ld+json">${JSON.stringify(jsonLdFor(r)).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");

const fallback = (r) =>
  `<main><h1>${esc(r.title)}</h1><p>${esc(r.description)}</p><p><a href="/">avinashgupta.in</a></p></main>`;

const studies = loadCaseStudies();
const published = loadNotes();
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
  `<script type="application/ld+json">${JSON.stringify(homeJsonLd).replace(/</g, "\\u003c")}</script>`,
].join("\n    ");
fs.writeFileSync(
  path.join(dist, "index.html"),
  template.replace(/<title>.*?<\/title>/s, `<title>${esc(homeTitle)}</title>`).replace("</head>", `    ${homeTags}\n  </head>`)
);
console.log("prerender: dist/index.html (title, share tags, JSON-LD)");

const today = new Date().toISOString().slice(0, 10);
const noteDate = (p) => published.find((n) => `/notes/${n.slug}` === p)?.date;
// Sitemap dates must be YYYY-MM-DD; some incident/note dates are only year-month.
const fullDate = (d) => (/^\d{4}-\d{2}$/.test(d ?? "") ? `${d}-01` : /^\d{4}-\d{2}-\d{2}$/.test(d ?? "") ? d : null);
const lastmod = (p) =>
  fullDate(p.startsWith("/incidents/") ? incidents.find((i) => `/incidents/${i.id}` === p)?.date : noteDate(p)) ?? today;
const urls = allPaths.map((p) => `  <url><loc>${SITE}${p === "/" ? "/" : p}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join("\n");
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log("prerender: dist/sitemap.xml");
