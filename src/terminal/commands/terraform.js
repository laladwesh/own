import { h } from "../h.js";
import { Lines, Muted, Strong } from "../ui.jsx";
import { aboutSpec } from "../../lib/data.js";

export default {
  name: "terraform",
  group: "devops",
  summary: "plan: one engineer to add",
  usage: "terraform plan",
  example: "terraform plan",
  subcommands: ["plan"],
  run(args) {
    if (args[0] !== "plan") return h(Muted, null, "usage: terraform plan");
    const s = aboutSpec.spec;
    return h(Lines, {
      lines: [
        "Terraform will perform the following actions:",
        " ",
        "  # engineer.avinash will be created",
        `  + resource "engineer" "avinash" {`,
        `      + name      = "${aboutSpec.metadata.name}"`,
        `      + institute = "${s.institute}"`,
        `      + focus     = [${s.focus.map((f) => `"${f}"`).join(", ")}]`,
        "    }",
        " ",
        h(Strong, null, "+ 1 engineer to add, 0 to change, 0 to destroy"),
      ],
    });
  },
};
