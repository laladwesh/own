import { h } from "../h.js";
import Neofetch, { newNeofetchId } from "../Neofetch.jsx";
import { aboutMe, projects, skills } from "../../constants/index.js";
import { incidents } from "../../lib/incidents.js";

export default {
  name: "neofetch",
  group: "me",
  summary: "who I am, in the shape of a system report",
  usage: "neofetch",
  run() {
    const info = {
      os: "ECE'27",
      host: "IIT Guwahati",
      shell: "full-stack",
      langs: skills[0].items.slice(0, 3).map((i) => i.name).join(", "),
      role: aboutMe.tagLine.split(" | ")[0],
      projects: projects.length,
      incidents: incidents.length,
    };
    return h(Neofetch, { id: newNeofetchId(), info });
  },
};
