// Builds the 1200x630 share cards (public/og/<id>.png): paper background, mono label,
// Clash Display title, site address in the footer. Runs before `vite build`.
//
// satori turns a layout into SVG and resvg turns that into a PNG. satori can't read WOFF2, so
// the self-hosted fonts are unpacked to TTF in memory first. If anything here fails, the
// build carries on with whatever images already exist (they are committed).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import wawoff2 from "wawoff2";
import { incidents } from "../src/lib/incidents.js";
import { loadCaseStudies } from "./case-studies.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "og");

const PAPER = "#ECE8DF";
const INK = "#1A1A1A";
const MUTED = "#666158";

// satori's font parser can't read variable-font tables, so drop them and keep the default
// instance (the glyph outlines are already there).
const VARIATION_TABLES = new Set(["fvar", "gvar", "avar", "STAT", "HVAR", "MVAR", "cvar"]);
const staticInstance = (buf) => {
  const n = buf.readUInt16BE(4);
  const tables = [];
  for (let i = 0; i < n; i++) {
    const rec = 12 + i * 16;
    const tag = buf.toString("latin1", rec, rec + 4);
    if (VARIATION_TABLES.has(tag)) continue;
    const off = buf.readUInt32BE(rec + 8);
    const len = buf.readUInt32BE(rec + 12);
    tables.push({ tag, checksum: buf.readUInt32BE(rec + 4), data: buf.subarray(off, off + len) });
  }
  const headerSize = 12 + tables.length * 16;
  const parts = [Buffer.alloc(headerSize)];
  let offset = headerSize;
  const out = parts[0];
  buf.copy(out, 0, 0, 4);
  out.writeUInt16BE(tables.length, 4);
  const pow = 2 ** Math.floor(Math.log2(tables.length));
  out.writeUInt16BE(pow * 16, 6);
  out.writeUInt16BE(Math.log2(pow), 8);
  out.writeUInt16BE(tables.length * 16 - pow * 16, 10);
  tables.forEach((t, i) => {
    const rec = 12 + i * 16;
    out.write(t.tag, rec, "latin1");
    out.writeUInt32BE(t.checksum, rec + 4);
    out.writeUInt32BE(offset, rec + 8);
    out.writeUInt32BE(t.data.length, rec + 12);
    const padded = Buffer.alloc(Math.ceil(t.data.length / 4) * 4);
    t.data.copy(padded);
    parts.push(padded);
    offset += padded.length;
  });
  return Buffer.concat(parts);
};

const font = async (file) =>
  staticInstance(Buffer.from(await wawoff2.decompress(fs.readFileSync(path.join(root, "public", "fonts", file)))));

const el = (type, style, children) => ({ type, props: { style, children } });

const titleSize = (t) => (t.length <= 36 ? 80 : t.length <= 60 ? 68 : 58);

const card = ({ label, title, footer = "avinashgupta.in/incidents" }) =>
  el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: 1200,
      height: 630,
      padding: 72,
      background: PAPER,
      color: INK,
    },
    [
      el("div", { display: "flex" }, [
        el(
          "div",
          { display: "flex", padding: "6px 20px", background: INK, color: PAPER, fontFamily: "JetBrains Mono", fontSize: 32 },
          label
        ),
      ]),
      el(
        "div",
        {
          display: "flex",
          fontFamily: "Clash Display",
          fontWeight: 700,
          fontSize: titleSize(title),
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          maxWidth: 1056,
        },
        title
      ),
      el(
        "div",
        { display: "flex", paddingTop: 24, borderTop: `2px solid ${INK}`, fontFamily: "JetBrains Mono", fontSize: 28, color: MUTED },
        footer
      ),
    ]
  );

const render = async (spec, fonts) => {
  const svg = await satori(card(spec), { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
};

try {
  const fonts = [
    { name: "Clash Display", data: await font("ClashDisplay-700.woff2"), weight: 700, style: "normal" },
    { name: "JetBrains Mono", data: await font("JetBrainsMono-Variable.woff2"), weight: 500, style: "normal" },
  ];
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = [
    { name: "incidents", label: "$ journalctl --priority=crit", title: "Incidents" },
    ...incidents.map((i) => ({ name: i.id, label: `${i.id} / ${i.severity}`, title: i.title })),
    ...loadCaseStudies().map((c) => ({ name: c.slug, label: "Case study", title: c.title, footer: `avinashgupta.in/projects/${c.slug}` })),
  ];
  for (const job of jobs) {
    fs.writeFileSync(path.join(outDir, `${job.name}.png`), await render(job, fonts));
    console.log(`og: public/og/${job.name}.png`);
  }
} catch (err) {
  console.warn(`og: could not generate share cards (${err.message}). Keeping the existing images.`);
}
