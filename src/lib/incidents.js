// Derived views of the incident data, shared by the page section and the terminal.
import { incidents as raw } from "../constants/incidents.js";

// Newest first, everywhere.
export const incidents = [...raw].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export const stepText = (s) => (s.time ? `${s.time}  ${s.event}` : s.event);

// The command as it actually ran: the pasted lines with their line breaks lost.
export const mergedCommand = (inc) => inc.badCommand?.pasted.join("") ?? "";

// One log line: [SEV-1] 2026-06-10  INC-001  title  ~3h
export const logLine = (inc) => `[${inc.severity}] ${inc.date}  ${inc.id}  ${inc.title}  ${inc.duration}`;

// Plain-text versions of the schematics (the terminal and the markdown file use these).
export const DIAGRAM_ASCII = {
  "ghost-oa-fanout": [
    "  +- - - - - - - - - -+       registered ∩ attended",
    "  :  GHOST OA         :  +--(∩)--> ROLE A",
    "  :  1 candidate list :--+--(∩)--> ROLE B",
    "  :  / 1 attendance   :  +--(∩)--> ROLE C",
    "  +- - - - - - - - - -+",
    "   deleted after distribute",
    "",
    "  A only -> appears in A only",
    "  in list, no role -> skipped",
  ],
  "ccd-internet-before-after": [
    "  BEFORE",
    "  CCD server -> login script (every ~40s) -> campus captive portal -> internet",
    "                  x session drops -> apps lose DB / sign-in / email -> 502 on every portal",
    "",
    "  AFTER",
    "  CCD server -> direct access + required outbound opened -> internet",
    "",
    "  fixed by emails, 5 trips to the network office and paperwork",
  ],
};

// The object behind `-o yaml`.
export const incidentSpec = (inc) => ({
  id: inc.id,
  kind: inc.kind,
  title: inc.title,
  date: inc.date,
  severity: inc.severity,
  status: inc.status,
  duration: inc.duration,
  impact: inc.impact,
  summary: inc.summary,
  timeline: inc.timeline.map(stepText),
  rootCause: inc.rootCause,
  whatFailed: inc.whatFailed,
  resolution: inc.resolution,
  actionItems: inc.actionItems.map((a) => `${a.done ? "[x]" : "[ ]"} ${a.text}`),
  lesson: inc.lesson,
  credits: inc.credits,
  tags: inc.tags,
});

// The postmortem as markdown (the file in ~/incidents/).
export const incidentMarkdown = (inc) =>
  [
    `# ${inc.id}: ${inc.title}`,
    "",
    [
      `severity: ${inc.severity}`,
      inc.kind && `kind: ${inc.kind}`,
      `date: ${inc.date}`,
      `duration: ${inc.duration}`,
      inc.status && `status: ${inc.status}`,
    ]
      .filter(Boolean)
      .join(" | "),
    "",
    "## Impact",
    inc.impact,
    "",
    "## Summary",
    inc.summary,
    ...(DIAGRAM_ASCII[inc.diagram] ? ["", ...DIAGRAM_ASCII[inc.diagram].map((l) => `    ${l}`)] : []),
    "",
    "## Timeline",
    ...inc.timeline.map((s, i) => `${i + 1}. ${stepText(s)}`),
    "",
    "## Root cause",
    inc.rootCause,
    ...(inc.badCommand ? ["", "    " + mergedCommand(inc)] : []),
    "",
    "## What didn't work",
    ...inc.whatFailed.map((f) => `- ~~${f}~~`),
    "",
    "## Resolution",
    ...inc.resolution.map((r) => `- ${r}`),
    "",
    "## Action items",
    ...inc.actionItems.map((a) => `- [${a.done ? "x" : " "}] ${a.text}`),
    "",
    "## Lesson",
    `_${inc.lesson}_`,
    ...(inc.credits ? ["", `credits: ${inc.credits}`] : []),
    "",
    `tags: ${inc.tags.join(", ")}`,
  ].join("\n");
