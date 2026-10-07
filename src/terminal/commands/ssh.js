import { h } from "../h.js";
import { Lines, Muted, Strong } from "../ui.jsx";
import { socialMedia } from "../../constants/index.js";

const mail = socialMedia.find((s) => s.label === "Email (Gmail)")?.link;

export default {
  name: "ssh",
  group: "me",
  summary: "log in as a recruiter and leave a message",
  usage: "ssh recruiter@avinash",
  description:
    "A tiny interactive chat: it asks for your name, company, the role you are hiring for and a message, shows a summary, then opens a pre-filled email draft. Ctrl+C cancels at any step.",
  example: "ssh recruiter@avinash",
  run(args, ctx) {
    if (args[0] !== "recruiter@avinash") return h(Muted, null, "usage: ssh recruiter@avinash");
    ctx.ask({
      steps: [
        { key: "name", label: "name?" },
        { key: "company", label: "company?" },
        { key: "role", label: "role you're hiring for?" },
        { key: "message", label: "message?" },
      ],
      done: (a) => {
        const subject = `Hiring: ${a.role || "a role"} at ${a.company || "your company"}`;
        const body = `Hi Avinash,\n\nI'm ${a.name || "a recruiter"} from ${a.company || "a company"}. We're hiring for ${a.role || "a role"}.\n\n${a.message || ""}\n`;
        ctx.openMail(`${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        return h(Lines, {
          lines: [
            h(Strong, null, "summary"),
            `  name     ${a.name || "-"}`,
            `  company  ${a.company || "-"}`,
            `  role     ${a.role || "-"}`,
            `  message  ${a.message || "-"}`,
            " ",
            "opening a pre-filled email to avinash...",
          ],
        });
      },
    });
    return h(Lines, { lines: ["Connecting to avinash...", "Connected. Four questions. Ctrl+C cancels."] });
  },
};
