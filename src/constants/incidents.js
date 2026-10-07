// Postmortems. Add a new object to the array and it shows up on the page and in the terminal
// (journalctl --priority=crit, cat incidents/<id>.md).
//
// Fields: id, title, date, severity, duration, impact, summary, timeline[] {time?, event},
// rootCause, whatFailed[], resolution[], actionItems[] {done, text}, lesson, tags[].
// Optional: status, kind ("outage" | "operational"), credits, diagram (id of a schematic),
// badCommand { pasted[] }.
export const incidents = [
  {
    id: "INC-001",
    kind: "outage",
    title: "I deleted my own home directory on a production server",
    date: "2026-06-10",
    severity: "SEV-1",
    status: "RESOLVED",
    duration: "~3h",
    impact:
      "4 production apps for Prasad Academic (PIMS Evalu Pro, EaseExit, Elective Registration, Status Dashboard) lost their code and config; SSH access to the server was lost.",
    summary:
      "While removing an old project, a pasted command lost its line breaks and turned into rm -rf on my entire home directory. I recovered SSH access by rescuing the boot volume through a second instance, rebuilt every service, and hardened the server so a single typo can't do this again.",
    timeline: [
      { event: "Removed old ccd-backend from PM2 (stop, delete, save)" },
      { event: "Pasted cleanup commands; `ls -a` showed an empty home directory" },
      { event: "SSH failed: Permission denied (publickey) — authorized_keys gone" },
      { event: "Tried OCI serial console: no password set on the ubuntu user" },
      { event: "Tried GRUB init=/bin/bash: boot window too short, missed repeatedly" },
      { event: "Switched strategy: boot volume rescue" },
      {
        event:
          "Stopped instance, detached boot volume, launched a rescue instance with my key, attached the old boot volume as a data volume",
      },
      {
        event:
          "Mounted it, recreated .ssh/authorized_keys (700/600); hit an ownership trap: ubuntu was UID 1001 on this image, not 1000",
      },
      { event: "Reattached boot volume, started the instance, SSH restored" },
      { event: "Confirmed MongoDB data intact in /var/lib/mongodb; Nginx + SSL intact" },
      {
        event:
          "Re-cloned 4 repos, recreated .env files, rebuilt React frontends, restarted everything under PM2 (startup + save)",
      },
      { event: "Restored CI/CD: re-added deploy key, updated GitHub Actions secrets" },
    ],
    rootCause:
      "Pasting multi-line commands merged `rm -rf ~/CCD-App-Backend` and `cd ~` into `rm -rf ~/CCD-App-Backendcd ~`. The trailing `~` was passed to rm as a second target, deleting everything inside /home/ubuntu — including all app code, .env files and .ssh/authorized_keys. No confirmation, no trash, no backup of home.",
    badCommand: { pasted: ["rm -rf ~/CCD-App-Backend", "cd ~"] },
    whatFailed: ["Serial console login (no password)", "GRUB single-user mode (couldn't catch the boot menu)"],
    resolution: ["Boot volume rescue via a temporary instance", "Full service rebuild from GitHub + recreated secrets"],
    actionItems: [
      { done: true, text: "Daily cron backups of all .env files and the home directory" },
      { done: true, text: "OCI boot volume backup policy enabled" },
      { done: true, text: "trash-cli + rm -i alias: deletes now confirm and are recoverable" },
      { done: true, text: "PM2 startup + save so services survive reboots" },
      { done: true, text: "PM2 log rotation and a swap file to prevent disk/OOM failures" },
      { done: true, text: "SSH keepalive configured; personal and CI keys both authorised" },
    ],
    lesson:
      "Data in the database survived because it lived outside the home directory. Everything else survived because it was in Git. The only things truly lost were the things I never backed up: secrets and keys. Now those are backed up daily.",
    tags: ["oracle-cloud", "linux", "ssh", "pm2", "nginx", "incident-response"],
  },
  {
    id: "INC-002",
    kind: "operational",
    title: "One online assessment, three roles, one portal that couldn't model it",
    date: "2026-07-10",
    severity: "SEV-2",
    duration: "backend same night / UI in 6 days",
    impact:
      "At the start of the internship season, a recruiting company announced a single online assessment covering 3 roles with overlapping shortlists. The portal could only run one OA per role, which meant uploading the same attendance three times and the same students appearing in every role's room sheet.",
    summary:
      "With my co-LSC from the technical team, I designed Ghost OA: a temporary 'conductor' that runs one shared OA and then distributes the results back to each real role. We shipped the backend the same night and ran it through manual API calls, then built a proper UI six days later so coordinators could run it themselves.",
    timeline: [
      { event: "10 Jul: co-LSC from the industry team flags it: one company, one OA, three roles, overlapping shortlisted students" },
      {
        event:
          "The portal's design assumed 1 OA = 1 role; running three separate OA flows would mean duplicate room allocations and three attendance uploads that could drift apart",
      },
      {
        event:
          "Designed Ghost OA: a temporary job record, flagged as a ghost, linked to the real roles, reusing the existing job model so all OA tooling worked on it unchanged",
      },
      { event: "10 Jul, 21:47 IST: backend shipped (create, distribute, delete), no UI yet" },
      { event: "Ran ghost OAs through manual API calls with an admin session in Postman during the first days of the season" },
      {
        event:
          "16 Jul: full coordinator UI shipped and added to the sidebar; coordinators could now run it end to end without a developer",
      },
    ],
    rootCause:
      "A design assumption in the data model: every online assessment belonged to exactly one role. Real recruiters don't work that way.",
    whatFailed: ["Running three independent OA flows (duplicate students across room sheets, attendance uploaded three times)"],
    resolution: [
      "Create: pick the company, select 2+ real roles, set the test date",
      "Upload the shared OA candidate list once: a student registered for ANY linked role is valid",
      "Finalize registration and OA appearing on the ghost",
      "Upload attendance once",
      "Distribute: for each real role, intersect its registered students with the ghost's attendance and write only those results into that role, finalising its OA steps and copying the test date",
      "Delete: the ghost is permanently removed, leaving only clean per-role data",
    ],
    actionItems: [
      { done: true, text: "Edge case: a student registered for Role A but not Role B appears only in Role A's results" },
      { done: true, text: "Edge case: a student in the OA list but registered for no linked role is skipped" },
      { done: true, text: "Coordinator UI so the flow no longer needs a developer mid-season" },
    ],
    lesson:
      "Under a deadline, ship the smallest correct backend first and operate it by hand. Once the flow is proven in real use, build the UI. Reusing the existing model with a flag, instead of inventing a new one, meant every existing OA tool worked on day one.",
    credits: "Built with my co-LSC (technical team); problem flagged by my co-LSC (industry team).",
    tags: ["system-design", "data-modeling", "node", "mongodb", "react", "placements"],
    diagram: "ghost-oa-fanout",
  },
];
