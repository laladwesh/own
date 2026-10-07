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
import deployYml from "../../.github/workflows/deploy.yml?raw";
import { slug, startOf, hashOf } from "../lib/util.js";
import { aboutSpec, dockerfileLines, projectLinks, serviceSpec } from "../lib/data.js";
import { linesToText, yamlLines } from "../lib/yaml.js";
import { caseStudies } from "../lib/caseStudies.js";
import { notePath, notes } from "../lib/notes.js";
import { incidentMarkdown, incidents } from "../lib/incidents.js";

export { slug, startOf, hashOf };

const dir = (name, children) => ({ type: "dir", name, children });
const file = (name, content, extra = {}) => ({ type: "file", name, content, ...extra });

// Every role as a commit, newest first.
export const commits = experiences
  .flatMap((org) =>
    org.positions.map((pos) => ({
      org: org.organisation,
      title: pos.title,
      duration: pos.duration,
      date: startOf(pos.duration),
      notes: pos.content.map((c) => c.text),
      hash: hashOf(`${org.organisation}|${pos.title}|${pos.duration}`),
    }))
  )
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

const link = (label) => socialMedia.find((s) => s.label === label)?.link;

const projectDir = (p) => {
  const urls = projectLinks(p).map(([label, url]) => `${label.padEnd(9)}${url}`);
  return dir(slug(p.title), [
    file("README.md", `${p.title}\n\n${p.content}`),
    file("stack.txt", p.stack.map((t) => t.name).join("\n")),
    file("link", urls.length ? urls.join("\n") : p.internal ?? "", { href: p.link || p.hub || p.github, urls: projectLinks(p).map(([, u]) => u) }),
    ...(caseStudies[p.caseStudy]
      ? [
          file(
            "CASE_STUDY.md",
            `${p.title}: case study\n\n${caseStudies[p.caseStudy]?.summary ?? p.content}\n\nRead it: /projects/${p.caseStudy}`,
            { route: `/projects/${p.caseStudy}`, routeLabel: "read the case study" }
          ),
        ]
      : []),
  ]);
};

const role = aboutMe.tagLine.split(" | ").join(" / ");

export const root = dir("~", [
  file("about.txt", `${role}\n\n${aboutMe.intro}`),
  file("avinash.yaml", linesToText(yamlLines(aboutSpec))),
  file("Dockerfile", linesToText(dockerfileLines)),
  file("service.yaml", linesToText(yamlLines(serviceSpec))),
  file("resume.pdf", "Opens in a new tab.", { href: resumeLink }),
  file(".secrets", ["API_KEY=definitely-not-a-real-key", "DB_PASSWORD=hunter2 (just kidding)", "BEST_FRIEND=the daemon", "TODO=sleep, eventually", "LAST_WORDS=it worked on my machine"].join("\n")),
  dir(
    "skills",
    skills.map((g) => file(`${slug(g.title)}.txt`, g.items.map((i) => i.name).join("\n")))
  ),
  dir("projects", projects.map(projectDir)),
  dir(
    "notes",
    notes.map((n) =>
      file(`${n.slug}.md`, `# ${n.title}\n${n.date} / ${n.minutes} min read / ${n.tags.join(", ")}\n\n${n.body}`, {
        route: notePath(n.slug),
        routeLabel: "open the note",
      })
    )
  ),
  dir(
    "case-studies",
    Object.values(caseStudies).map((c) =>
      file(`${c.slug}.md`, `${c.title}\n\n${c.summary}\n\nRead it: /projects/${c.slug}`, {
        route: `/projects/${c.slug}`,
        routeLabel: "read the case study",
      })
    )
  ),
  dir(
    "experience",
    commits.map((c) =>
      file(
        `${c.date}-${slug(c.title)}.log`,
        [`${c.title}`, `${c.org}`, `${c.duration}`, "", ...c.notes].join("\n"),
        { hash: c.hash }
      )
    )
  ),
  dir(
    "incidents",
    incidents.map((i) => file(`${i.id}.md`, incidentMarkdown(i), { route: `/incidents/${i.id}` }))
  ),
  dir(
    "education",
    educationList.map((e) => file("iitg.txt", [e.degree, e.content1.replace("Major: ", ""), e.title, e.duration].join("\n")))
  ),
  dir(
    "achievements",
    achievements.map((a) => file(`${slug(a.event.split(" | ")[0])}.txt`, [a.event, a.position, "", a.content1, a.content2].filter((l) => l !== undefined).join("\n")))
  ),
  dir(
    "extra-curricular",
    extraCurricular.map((e) => file(`${slug(e.organisation.split(",")[0])}.txt`, [e.title, e.organisation, e.duration, "", e.content[0].text].join("\n")))
  ),
  dir("contact", [
    file("email.txt", link("Email (Gmail)")?.replace("mailto:", "") ?? "", { href: link("Email (Gmail)") }),
    file("email-iitg.txt", link("Email (IITG)")?.replace("mailto:", "") ?? "", { href: link("Email (IITG)") }),
    file("linkedin", link("LinkedIn") ?? "", { href: link("LinkedIn") }),
    file("github", link("GitHub") ?? "", { href: link("GitHub") }),
    file("leetcode", link("LeetCode") ?? "", { href: link("LeetCode") }),
  ]),
  dir(".github", [dir("workflows", [file("deploy.yml", deployYml.replace(/\n+$/, ""))])]),
]);

// Where a folder lives on the site. A path with a #hash opens that page at that section;
// a bare section id scrolls the homepage.
export const SECTION_OF = {
  projects: "/work#deployments",
  "case-studies": "/case-studies",
  experience: "/work#pipeline",
  skills: "/background#skills",
  education: "/background#education",
  achievements: "/background#releases",
  "extra-curricular": "/background#cronjobs",
  contact: "contact",
  ".github": "/infra#ships",
};

export const pathString = (cwd) => (cwd.length ? `~/${cwd.join("/")}` : "~");

// Resolve a user path against cwd. Returns { node, path } or null.
export const resolve = (cwd, input = "") => {
  let parts = [...cwd];
  let raw = input.trim();
  if (raw === "~") return { node: root, path: [] };
  if (raw.startsWith("~/")) {
    parts = [];
    raw = raw.slice(2);
  } else if (raw.startsWith("/")) {
    parts = [];
    raw = raw.slice(1);
  }
  for (const seg of raw.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") {
      parts.pop();
      continue;
    }
    parts.push(seg);
  }
  let node = root;
  for (const seg of parts) {
    if (node.type !== "dir") return null;
    node = node.children.find((c) => c.name === seg);
    if (!node) return null;
  }
  return { node, path: parts };
};

export const isDir = (n) => n?.type === "dir";
