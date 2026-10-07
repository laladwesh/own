// Static server for dist/, run by PM2 behind nginx (port 6012). It replaces `pm2 serve --spa`,
// which cannot serve prerendered pages: it only ever reads one file per URL, so a request
// for /incidents (a folder holding index.html) answers 500.
//
// Lookup order for a URL path:
//   1. the exact file                      /assets/app.js, /og/INC-001.png, /sitemap.xml
//   2. <path>/index.html                   /incidents, /incidents/INC-001 (prerendered)
//   3. <path>.html
//   4. anything that looks like a file     404
//   5. everything else: the app shell (index.html) so the client router can take over.
//      Under /incidents/ that answer is a real 404 status (the page still renders its own
//      "command not found").
// No dependencies.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.env.STATIC_ROOT || path.join(here, "..", "..", "dist"));
const port = Number(process.env.PORT) || 6012;
const host = process.env.HOST || "0.0.0.0";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".pdf": "application/pdf",
  ".map": "application/json",
};

const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

const resolveFile = (pathname) => {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const candidates = clean === "/" ? ["index.html"] : [clean.slice(1), `${clean.slice(1)}/index.html`, `${clean.slice(1)}.html`];
  for (const rel of candidates) {
    const abs = path.resolve(root, rel);
    if (abs.startsWith(root + path.sep) || abs === root) {
      if (isFile(abs)) return abs;
    }
  }
  return null;
};

const cacheControl = (file) => {
  if (file.includes(`${path.sep}assets${path.sep}`)) return "public, max-age=31536000, immutable"; // fingerprinted by Vite
  if (file.includes(`${path.sep}fonts${path.sep}`)) return "public, max-age=2592000";
  if (file.includes(`${path.sep}og${path.sep}`)) return "public, max-age=3600";
  return "no-cache"; // html, sitemap, robots: always revalidate
};

const send = (req, res, file, status = 200) => {
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  res.writeHead(status, { "Content-Type": type, "Cache-Control": cacheControl(file), "X-Content-Type-Options": "nosniff" });
  if (req.method === "HEAD") return res.end();
  return fs.createReadStream(file).pipe(res);
};

http
  .createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      return res.end();
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400);
      return res.end("bad request");
    }
    if (pathname.includes("\0")) {
      res.writeHead(400);
      return res.end("bad request");
    }

    const file = resolveFile(pathname);
    if (file) return send(req, res, file);

    if (path.extname(pathname)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 Not Found");
    }
    const shell = path.join(root, "index.html");
    if (!isFile(shell)) {
      res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("not built yet");
    }
    return send(req, res, shell, /^\/(incidents|projects|notes)\//.test(pathname) ? 404 : 200);
  })
  .listen(port, host, () => console.log(`static: ${root} on ${host}:${port}`));
