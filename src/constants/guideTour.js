// The 60-second tour: each step is a page, the heading to scroll to, and one plain sentence.
// The tour walks the homepage in its current order and visits one case study and one incident.
export const tourSteps = [
  {
    path: "/",
    sel: ".term-window",
    text: "This is a working command line. Engineers use these to control computers. You can type commands or click the underlined ones.",
  },
  { path: "/", sel: "#about .section-heading", text: "This is me: who I am, what I study and what I do." },
  {
    path: "/",
    sel: "#pipeline .section-heading",
    text: "My work history. Each box is an organisation I worked with, and the lines inside are my roles there.",
  },
  {
    path: "/",
    sel: "#deployments .section-heading",
    text: "Projects I have built. Running means a project is live on the internet right now.",
  },
  {
    path: "/projects/oa-check",
    sel: ".cs-title",
    text: "One project told as a story: the problem, what I built and what I learned.",
  },
  {
    path: "/incidents/INC-001",
    sel: ".report-title",
    text: "These are real problems I faced and how I fixed them. This one is about a command that deleted important files on a live server.",
  },
  {
    path: "/",
    sel: "#ships .section-heading",
    text: "How this site is published, with a live check that its parts are running.",
  },
];

export const tourEnd = "That's the tour. Want to get in touch?";
