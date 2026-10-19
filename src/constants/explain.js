// What each part of the site is, in plain English. `sub` is the one-line subtitle shown under a
// heading in "human" view; `text` is what the "?" button's bubble says (one to three short
// sentences). `simple` says a "Show simple view" button makes sense for that block.
export const explain = {
  terminal: {
    sub: "A command line you can type into or click.",
    text: "This is a working command line, the kind engineers use to control computers. You can type a command or click the underlined ones. It is a playful way to explore my site.",
  },
  about: {
    sub: "A short introduction to me.",
    text: "This block is written in a format engineers use for settings files. It holds my details: who I am, where I study and what I do. The plain list is one click away.",
    simple: true,
  },
  pipeline: {
    sub: "Where I have worked and what I did there.",
    text: "This is my work history, drawn like the steps of an automatic process that engineers call a pipeline. Each box is an organisation I worked with, and the lines inside are my roles there.",
  },
  skills: {
    sub: "The tools and languages I know.",
    text: "These are the tools I use, written like a recipe file that engineers call a Dockerfile. The learning part lists tools I am studying but have not needed at full scale yet.",
    simple: true,
  },
  deployments: {
    sub: "Projects I have built, and whether they are running.",
    text: "Each row is a project I built. Running means it is live on the internet right now. Completed means it is finished, and private means it is not public.",
  },
  caseStudies: {
    sub: "Longer stories about a project: the problem, what I built, what I learned.",
    text: "A case study tells one project as a story. It says what the problem was, what I built and what I learned along the way.",
  },
  images: {
    sub: "The other code projects I have published.",
    text: "A repository is a folder holding one project's code, kept online. This is the list of the others I published, and you can filter it by type.",
  },
  dashboard: {
    sub: "Live numbers about my coding activity.",
    text: "These numbers come from my GitHub and LeetCode accounts, where I keep code and practise problems. The small squares show how active I was each day over the last year.",
  },
  releases: {
    sub: "Awards and recognition.",
    text: "These are my achievements, listed the way software versions are announced.",
  },
  openSource: {
    sub: "Improvements I proposed to other people's projects.",
    text: "Open source means the code is public and anyone can help improve it. Each entry is a change I proposed to someone else's project, and what happened to it.",
  },
  education: {
    sub: "Where I study.",
    text: "This is written in the same settings-file style as the About block. It says where I study and what I study.",
    simple: true,
  },
  cronjobs: {
    sub: "What I do outside coding.",
    text: "These are my activities outside coding. The command-style heading is just the theme of this site.",
  },
  ships: {
    sub: "How this website gets published.",
    text: "Each time I save a change, an automatic process puts the new version of this site on the internet. This is the real list of its steps.",
  },
  status: {
    sub: "A live check that the parts of this site are running.",
    text: "Each row is a program behind this site. A green light means it answered a test just now. The small bars are recent answer times, and a gap means no answer.",
  },
  contact: {
    sub: "How to reach me.",
    text: "This is written like a settings file. It is just my contact details.",
    simple: true,
  },
  incidents: {
    sub: "Real problems I faced, and how I fixed them.",
    text: "A postmortem is a written look back at something that broke. Each one says what happened, why, and what I changed afterwards. Nobody is blamed.",
  },
  incident: {
    sub: "One problem, told from start to finish.",
    text: "This is one problem, told in order: who was affected, what happened, the real cause and what I changed afterwards. The short box at the top gives the whole story in three lines.",
  },
  notes: {
    sub: "Short write-ups of things I fixed or learned.",
    text: "These are short notes I wrote down while the details were fresh: things I fixed, set up or got wrong.",
  },
};

// Plain names for the labels in an incident report.
export const reportHints = {
  IMPACT: "who or what was affected",
  SUMMARY: "the story in a few sentences",
  SCHEMATIC: "a drawing of how it fits together",
  TIMELINE: "what happened, in order",
  "ROOT CAUSE": "the real reason it happened",
  "WHAT DIDN'T WORK": "things I tried that did not help",
  RESOLUTION: "how it was fixed",
  "ACTION ITEMS": "what I changed or plan to change so it does not happen again",
  LESSON: "what I took from it",
};

// Severity, kind and status in plain words.
export const plainSeverity = { "SEV-1": "critical", "SEV-2": "serious" };
export const plainKind = {
  outage: "something stopped working",
  operational: "a problem in how things were running",
  "near-miss": "caught before anything broke",
};
export const plainStatus = { RESOLVED: "fixed", OPEN: "still open" };

// A short description of the page the visitor is on, for `explain` in the terminal.
export const pageExplain = (path) => {
  if (path === "/") return "This is my portfolio. The terminal at the top is a working command line, and below it are sections about my work, projects, and how to reach me.";
  if (path === "/incidents") return explain.incidents.text;
  if (path.startsWith("/incidents/")) return explain.incident.text;
  if (path === "/case-studies") return explain.caseStudies.text;
  if (path.startsWith("/projects/")) return "This is one project told as a story: the problem, what I built and what I learned. The short box at the top gives the whole story in three lines.";
  if (path === "/notes" || path.startsWith("/notes/")) return explain.notes.text;
  return "This is part of my portfolio. Type glossary to see plain meanings of the technical words.";
};

// Margin notes (pencil, human tuning only): twelve words or fewer, about the block beside them.
export const notes = {
  terminal: "type here, or click a suggestion below",
  about: "just my details, set out as a list",
  pipeline: "each column is a place, each box a role",
  skills: "tools I use. learning means still studying",
  deployments: "running means live on the internet right now",
  caseStudies: "one project told as a story",
  images: "each row is a project's code, kept online",
  dashboard: "numbers from my GitHub and LeetCode accounts",
  releases: "awards, listed like version announcements",
  openSource: "changes I proposed to other people's projects",
  education: "where I study, set out as a list",
  cronjobs: "what I do outside coding",
  ships: "how this site goes live after each change",
  status: "green light means that part answered just now",
  contact: "just my contact details, set out as a list",
  incidents: "things that broke, and how I fixed them",
  incident: "nobody is blamed: it is about what changed",
  notes: "short notes, written while I still remembered",
  follow: "if you like what I build, this is how you keep up with it \u2192",
};

// "How I'd explain this at home": one warm line for the main sections.
export const atHome = {
  terminal: "The terminal is like a front desk: you ask for what you want in a few words, and it answers.",
  deployments: "Each project is like a shop I opened. Running means the lights are on.",
  caseStudies: "A case study is like a diary entry about one job: what went wrong, what I did and what I learned.",
  incidents: "A postmortem is like a pilot's debrief after a flight: what happened, why, and what changes next time.",
  incident: "This is like a pilot's debrief: what happened, why, and what changes next time.",
  status: "This is like the row of lights on a fuse box: green means that part of the site is working.",
};

// The same, one per case study.
export const atHomeBySlug = {
  "oa-check": "OA Check is like a guard checking bags before an exam, except it checks laptops.",
  "intern-portal": "The Intern Portal is like one office window that every student, company and coordinator shares during internship season.",
  "dday-live-portal": "D-Day is like a live scoreboard at a stadium, except it shows placement offers as they happen.",
  "status-monitor": "The Status Monitor is like a smoke alarm for my servers, with a public board that says if something is wrong.",
};
