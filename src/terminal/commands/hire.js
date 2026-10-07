import { h } from "../h.js";
import { Lines, Muted, Ext } from "../ui.jsx";
import { socialMedia } from "../../constants/index.js";

const find = (label) => socialMedia.find((s) => s.label === label)?.link;

export default {
  name: "hire",
  group: "me",
  summary: "get in touch (opens an email draft)",
  usage: "hire avinash",
  run(args, ctx) {
    if ((args[0] ?? "").toLowerCase() !== "avinash") return h(Muted, null, "usage: hire avinash");
    const mail = find("Email (Gmail)");
    const subject = encodeURIComponent("Let us work together");
    ctx.openMail(`${mail}?subject=${subject}`);
    return h(Lines, {
      lines: [
        "good choice. opening an email draft…",
        h("span", null, "Email     ", h(Ext, { href: mail }, mail.replace("mailto:", ""))),
        h("span", null, "LinkedIn  ", h(Ext, { href: find("LinkedIn") }, find("LinkedIn"))),
        h("span", null, "GitHub    ", h(Ext, { href: find("GitHub") }, find("GitHub"))),
      ],
    });
  },
};
