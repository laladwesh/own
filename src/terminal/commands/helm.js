import { h } from "../h.js";
import { Lines, Muted, Reveal, Ext } from "../ui.jsx";
import { socialMedia } from "../../constants/index.js";

const find = (label) => socialMedia.find((s) => s.label === label)?.link;

export default {
  name: "helm",
  group: "devops",
  summary: "fake install: deploy an engineer",
  usage: "helm install avinash --set role=devops",
  example: "helm install avinash --set role=devops",
  subcommands: ["install"],
  run(args) {
    const [sub, name, ...rest] = args;
    if (sub !== "install" || name !== "avinash") return h(Muted, null, "usage: helm install avinash --set role=devops");
    const set = rest.join(" ").match(/role=([\w-]+)/)?.[1] ?? "devops";
    const mail = find("Email (Gmail)");
    return h(Reveal, {
      interval: 220,
      lines: [
        'Release "avinash" does not exist. Installing it now.',
        "NAME: avinash",
        "STATUS: deployed",
        `VALUES: role=${set}`,
        "NOTES: reach the engineer at:",
        h("span", null, "  email     ", h(Ext, { href: mail }, mail.replace("mailto:", ""))),
        h("span", null, "  linkedin  ", h(Ext, { href: find("LinkedIn") }, find("LinkedIn"))),
        h("span", null, "  github    ", h(Ext, { href: find("GitHub") }, find("GitHub"))),
      ],
    });
  },
};
