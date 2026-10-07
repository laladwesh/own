import { h } from "../h.js";
import { Lines, Strong } from "../ui.jsx";
import { aboutMe } from "../../constants/index.js";

export default {
  name: "whoami",
  group: "me",
  summary: "name and role",
  usage: "whoami",
  run() {
    return h(Lines, {
      lines: [h(Strong, null, aboutMe.name), aboutMe.tagLine.split(" | ").join(" / ")],
    });
  },
};
