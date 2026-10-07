import { useState } from "react";
import deployYml from "../../.github/workflows/deploy.yml?raw";
import { siteDomain } from "../constants";
import SectionHeading from "./SectionHeading";
import { Manifest, ModeToggle } from "./Manifest";
import StatusRack from "./StatusRack";
import DeployLine from "./DeployLine";

// Each step is taken from .github/workflows/deploy.yml and nginx.conf.
const STEPS = [
  ["push", "master"],
  ["GitHub Actions", "deploy.yml"],
  ["SSH", "appleboy/ssh-action"],
  ["Oracle VM", "git reset --hard origin/master"],
  ["npm build", "npm install, npm run build"],
  ["PM2", "portfolio-static :6012"],
  ["Nginx", "proxy_pass localhost:6012"],
  [siteDomain, "live"],
];

const SERVICES = [
  ["leetcode-api", ":4001", "/api/leetcode/"],
  ["github-api", ":4002", "/api/github/"],
  ["status-api", ":4003", "/api/status"],
  ["presence-api", ":4004", "/socket.io/"],
];

// Turn the raw YAML text into Manifest lines.
const toLines = (text) =>
  text
    .replace(/\n+$/, "")
    .split("\n")
    .map((raw) => {
      const lead = raw.match(/^ */)[0].length;
      const body = raw.slice(lead);
      const indent = Math.floor(lead / 2);
      if (!body) return { indent: 0, parts: [] };
      if (body.startsWith("#")) return { indent, parts: [{ t: "comment", text: body }] };
      const m = body.match(/^(- )?([\w.\- ]+?):(.*)$/);
      if (m) {
        const parts = [];
        if (m[1]) parts.push({ t: "punct", text: "- " });
        parts.push({ t: "key", text: m[2] }, { t: "punct", text: ":" });
        if (m[3]) parts.push({ t: "val", text: m[3] });
        return { indent, parts };
      }
      return { indent, parts: [{ t: "val", text: body }] };
    });

const Ships = () => {
  const [mode, setMode] = useState("diagram");
  return (
    <section id="ships" className="section">
      <SectionHeading command="$ cat .github/workflows/deploy.yml" title="How this site ships" />
      <ModeToggle mode={mode} setMode={setMode} options={["diagram", "yaml"]} />
      {mode === "yaml" ? (
        <Manifest lines={toLines(deployYml)} label="deploy.yml" />
      ) : (
        <div className="wide-view">
          <ol className="flow">
            {STEPS.map(([name, note], i) => (
              <li key={name} className="flow-step">
                <span className="flow-name">{name}</span>
                <span className="flow-note">{note}</span>
                {i < STEPS.length - 1 && (
                  <span className="flow-arrow" aria-hidden="true">
                    {"->"}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="flow-side">
            Also started by the same workflow (PM2, behind Nginx):{" "}
            {SERVICES.map(([name, port, route], i) => (
              <span key={name}>
                {i > 0 && ", "}
                {name} {port} via {route}
              </span>
            ))}
            .
          </p>
        </div>
      )}
      <p className="ships-live">
        <DeployLine />
      </p>
      <StatusRack />
    </section>
  );
};

export default Ships;
