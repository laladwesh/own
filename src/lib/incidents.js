// Derived views of the incident data, shared by the page section and the terminal.
import { incidents } from "../constants/incidents.js";

export { incidents };

export const stepText = (s) => (s.time ? `${s.time}  ${s.event}` : s.event);

// The command as it actually ran: the pasted lines with their line breaks lost.
export const mergedCommand = (inc) => inc.badCommand?.pasted.join("") ?? "";

// One log line: [SEV-1] 2026-06  INC-001  title  ~3h
export const logLine = (inc) => `[${inc.severity}] ${inc.date}  ${inc.id}  ${inc.title}  ${inc.duration}`;

// The object behind `-o yaml`.
export const incidentSpec = (inc) => ({
  id: inc.id,
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
  tags: inc.tags,
});

// The postmortem as markdown (the file in ~/incidents/).
export const incidentMarkdown = (inc) =>
  [
    `# ${inc.id}: ${inc.title}`,
    "",
    `severity: ${inc.severity} | date: ${inc.date} | duration: ${inc.duration} | status: ${inc.status}`,
    "",
    "## Impact",
    inc.impact,
    "",
    "## Summary",
    inc.summary,
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
    "",
    `tags: ${inc.tags.join(", ")}`,
  ].join("\n");
