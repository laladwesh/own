// npm run drafts: every draft (an incident or a note containing the NEEDS CONFIRMATION marker)
// and each line that still needs confirming. Drafts show in `npm run dev` and are left out of
// the production build, the sitemap and the terminal.
import { incidents } from "../src/constants/incidents.js";
import { now } from "../src/constants/now.js";
import { DRAFT_MARK, isDraftObject, isDraftText } from "../src/lib/drafts.js";
import { loadNotes, notesDir } from "./notes.mjs";

// Walk an object and report where the marker appears, e.g. timeline[4].event
const findInObject = (value, trail, out) => {
  if (typeof value === "string") {
    if (isDraftText(value)) out.push([trail, value]);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => findInObject(v, `${trail}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) findInObject(v, trail ? `${trail}.${k}` : k, out);
  }
};

let count = 0;

const nowHits = Object.entries(now).filter(([, v]) => isDraftText(v));
if (nowHits.length) {
  count += 1;
  console.log("\nNOW (src/constants/now.js): the 'open to' lines stay hidden until these are filled in");
  for (const [k, v] of nowHits) console.log(`  ${k}: ${v}`);
}

for (const inc of incidents.filter(isDraftObject)) {
  count += 1;
  console.log(`\nINCIDENT ${inc.id}: ${inc.title}`);
  const hits = [];
  findInObject(inc, "", hits);
  for (const [where, text] of hits) console.log(`  ${where}: ${text}`);
}

for (const note of loadNotes({ includeDrafts: true }).filter((n) => n.draft)) {
  count += 1;
  console.log(`\nNOTE ${note.slug}: ${note.title}`);
  note.raw.split("\n").forEach((line, i) => {
    if (line.includes(DRAFT_MARK)) console.log(`  ${notesDir.split(/[\\/]/).slice(-3).join("/")}/${note.slug}.md:${i + 1}: ${line.trim()}`);
  });
}

console.log(count ? `\n${count} draft${count === 1 ? "" : "s"}. Shown in npm run dev, left out of the build.` : "no drafts");
