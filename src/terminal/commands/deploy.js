import { h } from "../h.js";
import { Sequence } from "../ui.jsx";
import deployYml from "../../../.github/workflows/deploy.yml?raw";
import { siteDomain } from "../../constants/index.js";

// The steps come from the real workflow file: its `- name:` entries and the `echo "..."`
// progress lines inside the SSH script. The timings are made up and always add up to 42s.
const names = [...deployYml.matchAll(/^\s*- name: (.+)$/gm)].map((m) => m[1].trim());
const echoes = [...deployYml.matchAll(/echo "([^"$=]+)"/g)]
  .map((m) => m[1].replace(/\.\.\.$/, "").trim())
  .filter((e) => !/completed successfully/i.test(e));

const labels = [...names, ...echoes, `Routing ${siteDomain} through nginx`];
const WEIGHT = (l) =>
  /install/i.test(l) ? 8 : /build/i.test(l) ? 12 : /leetcode|github-api|proxy/i.test(l) ? 4 : /pm2|restart/i.test(l) ? 3 : /pull|oracle|nginx/i.test(l) ? 2 : 1;

const TOTAL = 42;
const weights = labels.map(WEIGHT);
const sum = weights.reduce((a, b) => a + b, 0);
const secs = weights.map((w) => Math.max(1, Math.round((w / sum) * TOTAL)));
secs[secs.length - 1] += TOTAL - secs.reduce((a, b) => a + b, 0);

const steps = labels.map((label, i) => ({ label, secs: Math.max(1, secs[i]) }));

export default {
  name: "deploy",
  group: "devops",
  summary: "run a pretend version of my real deploy pipeline",
  usage: "deploy",
  description:
    "Replays the steps of .github/workflows/deploy.yml (checkout, SSH to the VM, install, build, PM2, the two API proxies, nginx) with progress bars. The timings are invented and always sum to 42s.",
  example: "deploy",
  run() {
    return h(Sequence, { steps, outro: `deployed to ${siteDomain} in ${TOTAL}s` });
  },
};
