// The pages that hold what used to be homepage sections. Plain data (no browser APIs), shared by
// the app, the terminal and the build scripts.
export const SITE_PAGES = {
  work: {
    path: "/work",
    title: "Work",
    command: "$ ls work/",
    intro: "Where I have worked, what I have shipped, every other repository, and my open-source pull requests.",
    sections: ["pipeline", "deployments", "images", "openSource"],
    blurb: "experience, projects, repositories, open source",
  },
  background: {
    path: "/background",
    title: "Background",
    command: "$ ls background/",
    intro: "Skills, education, achievements and what I do outside of coding.",
    sections: ["skills", "education", "releases", "cronjobs"],
    blurb: "skills, education, achievements, extra curricular",
  },
  infra: {
    path: "/infra",
    title: "Infrastructure",
    command: "$ ls infra/",
    intro: "How this site is built and shipped, the live status of the services behind it, and my GitHub activity.",
    sections: ["ships", "dashboard"],
    blurb: "how this site ships, live status, GitHub activity",
  },
};

// Homepage anchors that moved: /#pipeline now lives at /work#pipeline.
export const MOVED_SECTIONS = Object.fromEntries(
  Object.values(SITE_PAGES).flatMap((p) => p.sections.map((id) => [id, p.path]))
);
