// Derived data shared by the page sections and the terminal, so both always agree.
import {
  achievements,
  aboutMe,
  educationList,
  experiences,
  extraCurricular,
  projects,
  resumeLink,
  skills,
  socialMedia,
} from "../constants";
import repoData from "../data/github-projects.json";
import { slug, startOf } from "./util.js";

// ───────────── projects ("kubectl get deployments") ─────────────
// A live link = Running, GitHub only = Completed, no links = Private.
export const projectStatus = (p) => (p.link ? "Running" : p.github ? "Completed" : "Private");

export const projectLinks = (p) =>
  [
    p.github && ["repo", p.github],
    p.link && ["live", p.link],
    p.hub && ["hub", p.hub],
    p.playStore && ["play", p.playStore],
    p.appStore && ["app-store", p.appStore],
  ].filter(Boolean);

export const describeObject = (p) => ({
  name: slug(p.title),
  status: projectStatus(p),
  description: p.content,
  stack: p.stack.map((t) => t.name),
  repo: p.github,
  live: p.link,
  hub: p.hub,
  store: p.playStore || p.appStore ? { play: p.playStore, "app-store": p.appStore } : undefined,
});

// ───────────── experience ("gh run view") ─────────────
// Each organisation is a stage, newest first (by its most recent role start).
export const stages = experiences
  .map((org) => ({
    ...org,
    newest: org.positions.reduce((m, p) => (startOf(p.duration) > m ? startOf(p.duration) : m), ""),
  }))
  .sort((a, b) => (a.newest < b.newest ? 1 : a.newest > b.newest ? -1 : 0));

export const isRunning = (position) => /present/i.test(position.duration);

// ───────────── achievements ("gh release list") ─────────────
// Hacktoberfest runs in October, the only month the data lets me state. Items with
// no year in their name carry no date.
export const releaseRows = achievements
  .map((a) => {
    const [event, org] = a.event.split(" | ");
    const year = event.match(/\b(20\d\d)\b/)?.[1] ?? null;
    const month = /hacktoberfest/i.test(event) ? "10" : null;
    return {
      id: a.id,
      tag: year ? `v${year}${month ? `.${month}` : ""}` : "v----",
      key: year ? `${year}${month ?? "00"}` : "",
      event,
      org,
      position: a.position,
      notes: [a.content1, a.content2].filter(Boolean),
      project: a.project,
      top: /winner|gold/i.test(a.position),
    };
  })
  .sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0));

// ───────────── repositories ("docker images") ─────────────
const HIDDEN = ["rockpaperscissors", "meme-generator", "my-app", "proj-tut"];

const LEARNING = new Set(skills.find((g) => g.key === "learning").items.map((i) => i.name.toLowerCase()));
// Tools I only study are not shown as part of a repo's stack.
export const withoutLearning = (stack = []) => stack.filter((t) => !LEARNING.has(t.toLowerCase()));

// Repo names already shown as curated projects.
const curated = new Set(
  projects.map((p) => p.github?.match(/github\.com\/[^/]+\/([^/]+)/)?.[1]?.toLowerCase()).filter(Boolean)
);

export const repos = repoData
  .filter((r) => !HIDDEN.includes(r.name.toLowerCase()) && !curated.has(r.name.toLowerCase()))
  .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  .map((r) => ({ ...r, techStack: withoutLearning(r.techStack) }));

// ───────────── manifests (about, education, service, Dockerfile) ─────────────
const edu = educationList[0];
const role = aboutMe.tagLine.split(" | ")[0];
export const currentPosition = experiences[0].positions[0];

export const aboutSpec = {
  kind: "Engineer",
  metadata: { name: aboutMe.name, labels: { role, batch: "ece-27" } },
  spec: {
    institute: edu.title,
    degree: `${edu.degree}, ${edu.content1.replace("Major: ", "")}`,
    currentRole: `${currentPosition.title}, ${experiences[0].organisation}`,
    focus: ["devops", "full-stack", "ai"],
    about: aboutMe.intro,
  },
};

export const educationSpec = (e) => ({
  kind: "Education",
  metadata: { name: e.title },
  spec: { degree: e.degree, major: e.content1.replace("Major: ", ""), duration: e.duration },
});

const find = (label) => socialMedia.find((s) => s.label === label)?.link;

export const ports = [
  ["email", find("Email (Gmail)")],
  ["email-iitg", find("Email (IITG)")],
  ["linkedin", find("LinkedIn")],
  ["github", find("GitHub")],
  ["leetcode", find("LeetCode")],
  ["instagram", find("Instagram")],
  ["resume", resumeLink],
].filter(([, url]) => url);

export const serviceSpec = {
  kind: "Service",
  metadata: { name: "avinash" },
  spec: { ports: ports.map(([name, url]) => ({ name, url })) },
};

const group = (key) => skills.find((g) => g.key === key);
const names = (key) => group(key).items.map((i) => i.name);
const kw = (text) => ({ t: "kw", text });
const key = (text) => ({ t: "key", text });
const val = (text) => ({ t: "val", text });
const comment = (text) => ({ t: "comment", text });

// "cat Dockerfile": one RUN line per category; tools I only study go in an ARG.
export const dockerfileLines = [
  { indent: 0, parts: [kw("FROM"), val(" iitg/ece:2027")] },
  { indent: 0, parts: [] },
  { indent: 0, parts: [kw("RUN"), key(" install languages:"), val(` ${names("languages").join(", ")}`)] },
  { indent: 0, parts: [kw("RUN"), key(" install frameworks:"), val(` ${names("frameworks").join(", ")}`)] },
  { indent: 0, parts: [] },
  { indent: 0, parts: [comment("# used in production")] },
  { indent: 0, parts: [kw("RUN"), key(" install tools:"), val(` ${names("production").join(", ")}`)] },
  { indent: 0, parts: [kw("RUN"), key(" install also:"), val(` ${names("other").join(", ")}`)] },
  { indent: 0, parts: [] },
  { indent: 0, parts: [comment("# learned, not yet needed at production scale")] },
  {
    indent: 0,
    parts: [kw("ARG"), key(" LEARNING="), val(`"${names("learning").map((n) => n.toLowerCase()).join(" ")}"`)],
  },
];

export const skillGroups = skills;
export { extraCurricular };
