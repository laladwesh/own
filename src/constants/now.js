// What I'm doing right now. Shown in the hero terminal's status bar, the `now` command, the
// contact section, `hire avinash` and the homepage meta description.
//
// EDIT ME: lookingFor and lookingForShort. Until they are filled in they carry the draft
// marker, so they show in `npm run dev` and are left out of the production build (the
// "open to" lines simply do not appear).
export const now = {
  building: "Onawie, a self-hosted mini Vercel",
  learning: "Kubernetes, ArgoCD, Terraform",
  working: "Lead Student Coordinator, CCD IIT Guwahati",
  // <roles>, <full-time / internship>, <from when>
  lookingFor: "[NEEDS CONFIRMATION: roles, full-time / internship, from when]",
  // the same, short enough for the status bar: "<roles>, <full-time / internship>"
  lookingForShort: "[NEEDS CONFIRMATION: short version of lookingFor]",
  updated: "2026-10-07",
};

// Slugs of the notes that `now` links to.
export const nowNotes = {
  building: "building-my-own-mini-vercel",
  learning: "what-im-learning-devops",
};
