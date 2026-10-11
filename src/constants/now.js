// What I'm doing right now. Shown in the hero terminal's status bar, the `now` command, the
// contact section, `hire avinash` and the homepage meta description.
//
// lookingFor and lookingForShort feed the "open to" lines. (An unfinished value carrying the draft
// marker would show in `npm run dev` only and be left out of the production build.)
export const now = {
  building: "Onawie, a self-hosted mini Vercel",
  learning: "Kubernetes, ArgoCD, Terraform",
  working: "Lead Student Coordinator, CCD IIT Guwahati",
  lookingFor: "Full-time roles from 2027 in DevOps / SRE, backend, full-stack, or software engineering in general.",
  // the same, short enough for the status bar
  lookingForShort: "SDE & DevOps roles, full-time 2027",
  updated: "2026-10-11",
};

// Slugs of the notes that `now` links to.
export const nowNotes = {
  building: "building-my-own-mini-vercel",
  learning: "what-im-learning-devops",
};
