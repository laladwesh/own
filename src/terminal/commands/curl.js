import { h } from "../h.js";
import { Ext, Muted } from "../ui.jsx";
import { aboutMe, repoLink, resumeLink, siteDomain, socialMedia } from "../../constants/index.js";

const name = aboutMe.name.toUpperCase().split("").join(" ");
const BANNER = [`+${"-".repeat(name.length + 4)}+`, `|  ${name}  |`, `+${"-".repeat(name.length + 4)}+`];

const link = (label) => socialMedia.find((s) => s.label === label)?.link;

export default {
  name: "curl",
  group: "me",
  summary: "fetch the site as a text banner",
  usage: "curl avinashgupta.in",
  description: "Prints a small ASCII banner with my name and links, the way a terminal would see the site.",
  example: "curl avinashgupta.in",
  run(args) {
    const target = (args[0] ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (target !== siteDomain && target !== `www.${siteDomain}`) {
      return h(Muted, null, `curl: (6) could not resolve host: ${args[0] ?? ""}. try: curl ${siteDomain}`);
    }
    return h(
      "div",
      null,
      h("pre", { className: "term-pre" }, `${BANNER.join("\n")}\n${aboutMe.name}  /  ${aboutMe.tagLine.split(" | ").join(" / ")}`),
      h("div", null, "site      ", h(Ext, { href: `https://${siteDomain}` }, siteDomain)),
      h("div", null, "github    ", h(Ext, { href: repoLink }, repoLink)),
      h("div", null, "linkedin  ", h(Ext, { href: link("LinkedIn") }, link("LinkedIn"))),
      h("div", null, "email     ", h(Ext, { href: link("Email (Gmail)") }, link("Email (Gmail)").replace("mailto:", ""))),
      h("div", null, "resume    ", h(Ext, { href: resumeLink }, "resume.pdf"))
    );
  },
};
