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
import { SITE, prerenderRoutes, sitemapPaths } from "../src/lib/seo.js";
import { incidents } from "../src/lib/incidents.js";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const headTags = (r) =>
  [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    `<link rel="canonical" href="${SITE}${r.path}" />`,
    `<meta property="og:type" content="article" />`,
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
  ].join("\n    ");

const fallback = (r) =>
  `<main><h1>${esc(r.title)}</h1><p>${esc(r.description)}</p><p><a href="/">avinashgupta.in</a></p></main>`;

for (const r of prerenderRoutes) {
  const html = template
    .replace(/<title>.*?<\/title>/s, "")
    .replace("</head>", `    ${headTags(r)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${fallback(r)}</div>`);
  const dir = path.join(dist, r.path.slice(1));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(`prerender: dist${r.path}/index.html`);
}

const today = new Date().toISOString().slice(0, 10);
const lastmod = (p) => (p.startsWith("/incidents/") ? incidents.find((i) => `/incidents/${i.id}` === p)?.date : null) ?? today;
const urls = sitemapPaths.map((p) => `  <url><loc>${SITE}${p === "/" ? "/" : p}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join("\n");
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log("prerender: dist/sitemap.xml");
