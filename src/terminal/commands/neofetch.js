import { h } from "../h.js";
import { aboutMe, skills } from "../../constants/index.js";

const ART = [
  "   █████╗  ██████╗ ",
  "  ██╔══██╗██╔════╝ ",
  "  ███████║██║  ███╗",
  "  ██╔══██║██║   ██║",
  "  ██║  ██║╚██████╔╝",
  "  ╚═╝  ╚═╝ ╚═════╝ ",
].join("\n");

export default {
  name: "neofetch",
  group: "me",
  summary: "who I am, in the shape of a system report",
  usage: "neofetch",
  run() {
    const langs = skills[0].items.slice(0, 3).map((i) => i.name).join(", ");
    const rows = [
      ["OS", "ECE'27"],
      ["Host", "IIT Guwahati"],
      ["Shell", "full-stack"],
      ["Langs", langs],
      ["Role", aboutMe.tagLine.split(" | ")[0]],
    ];
    return h(
      "div",
      { className: "term-neofetch" },
      h("pre", { className: "term-neofetch-art" }, ART),
      h(
        "div",
        null,
        h("div", null, h("strong", { className: "term-strong" }, "avinash"), "@iitg"),
        h("div", { className: "term-muted" }, "-------------"),
        ...rows.map(([k, v]) =>
          h("div", { key: k }, h("strong", { className: "term-strong" }, `${k}: `), v)
        )
      )
    );
  },
};
