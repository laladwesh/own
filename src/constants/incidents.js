// Postmortems. Add a new object to the array and it shows up on the page and in the terminal
// (journalctl --priority=crit, cat incidents/<id>.md).
//
// Fields: id, title, date, severity, duration, impact, summary, timeline[] {time?, event},
// rootCause, whatFailed[], resolution[], actionItems[] {done, text}, lesson, tags[].
// A draft is any incident containing the text NEEDS CONFIRMATION in square brackets: it shows
// in `npm run dev` only (see src/lib/drafts.js and `npm run drafts`).
// Optional: status, kind ("outage" | "operational" | "near-miss"), credits, diagram (id of a schematic),
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
  {
    id: "INC-003",
    kind: "outage",
    status: "RESOLVED",
    title: "Our production server was logging into campus Wi-Fi every 40 seconds",
    date: "2026-03",
    severity: "SEV-1",
    duration: "Intermittent, through the Student Coordinator → Lead Student Coordinator handover",
    impact:
      "CCD's on-campus server had no direct internet. Every time its network session dropped, the apps behind Nginx lost access to everything they depended on, and every CCD portal returned 502 Bad Gateway.",
    summary:
      "The server reached the internet through the campus captive portal (agnigarh), the same login page students use. A shell script logged it in again and again, because each session lasted about 40 seconds. Firewall policies kept changing, and whenever the loop broke, everything went down. The real fix wasn't code: emails, repeated visits to the network office and paperwork got the server direct internet access, and then the ports our portals needed.",
    timeline: [
      { event: "During the Student Coordinator → Lead Student Coordinator handover, I took over a server that reached the internet only through the campus captive portal" },
      { event: "An auto-login shell script (auto-agnigarh.sh) kept logging the server into the gateway; each session stayed valid for about 40 seconds, so it refreshed constantly" },
      { event: "Campus firewall policies changed several times as the network was tightened; each change could break the login loop" },
      { event: "Whenever the loop failed, the apps couldn't reach their database, sign-in or email services, and every portal behind Nginx showed 502 Bad Gateway" },
      { event: "Wrote to the network admins explaining that a production server can't depend on a 40-second human login" },
      { event: "Followed up in person at the network office 4–5 times and completed the required paperwork" },
      { event: "The server was given direct internet access: no captive portal, no login loop" },
      { event: "Requested the outbound access our portals needed (database, OAuth / sign-in and Microsoft services), which had been blocked; it was opened" },
      { event: "Retired the auto-login script" },
    ],
    rootCause:
      "A production server depended on a captive portal designed for people, not machines: 40-second sessions, re-authenticated by a script, on a network whose policies were changing.",
    whatFailed: [
      "An auto-login loop against the captive portal: it kept things up most of the time, but any hiccup took every portal down",
      "Adapting the script to each firewall change as it came",
    ],
    resolution: [
      "Formal request to the network admins, with in-person follow-ups and paperwork",
      "Direct internet access for the server",
      "Outbound access opened for database, OAuth / sign-in and Microsoft services",
      "Login loop retired",
    ],
    actionItems: [
      { done: true, text: "Server no longer depends on the captive portal" },
      { done: false, text: "Keep a written list of every outbound dependency the portals need, so the next request is one email" },
    ],
    lesson:
      "Some infrastructure problems aren't technical. The script kept us alive; the emails, the visits to the network office and the paperwork actually fixed it. And a server should never depend on a login meant for a human.",
    tags: ["networking", "firewall", "nginx", "linux", "campus-infra"],
    diagram: "ccd-internet-before-after",
  },
  {
    id: "INC-004",
    kind: "outage",
    status: "RESOLVED",
    severity: "SEV-1",
    date: "2026-08-14",
    title: "A client's store went dark, and I debugged the wrong thing twice",
    duration: "[NEEDS CONFIRMATION]",
    impact:
      "nufab.store returned Cloudflare 522 errors to many visitors; the client was getting customer calls while it was down.",
    summary:
      "I assumed the backend host was the problem, then a free-tier cold start. Both were wrong. The frontend actually lived on Cloudflare Pages, and a detach/reattach of the custom domain had left it stuck and deleted its DNS record.",
    timeline: [
      { event: "Reports of 522 'host error' on the root domain" },
      { event: "First theory: backend on Render was down / cold-starting" },
      { event: "Ruled out: the Render service was on a paid always-on plan" },
      { event: "Checked DNS: the root domain pointed at Cloudflare Pages, not Render" },
      { event: "Found the custom domain stuck as 'already associated' after an earlier detach/reattach; the root CNAME had been deleted" },
      { event: "Restored the root CNAME to the Pages project (proxied)" },
      { event: "Re-attached the custom domain: Verifying → Active, SSL issued" },
      { event: "Remaining 'still down' reports were stale local DNS caches; flushed and confirmed" },
    ],
    rootCause:
      "Changing a custom-domain attachment removed the DNS record the domain depended on, and I didn't have an up-to-date map of which service served which part of the site.",
    whatFailed: ["Diagnosing the backend host first", "Assuming a free-tier cold start"],
    resolution: ["Restore DNS record", "Re-attach custom domain", "Verify SSL", "Flush stale client DNS caches"],
    actionItems: [
      { done: false, text: "Keep an infra map: domain → DNS → host per service" },
      { done: false, text: "External uptime check on the root domain" },
    ],
    lesson:
      "Before debugging, confirm where the thing actually runs. I spent the first part of the outage fixing a service that was fine.",
    tags: ["cloudflare", "dns", "render", "incident-response"],
  },
  {
    id: "INC-005",
    kind: "outage",
    status: "RESOLVED",
    severity: "SEV-2",
    date: "2026-06",
    title: "Moved a domain's DNS, and the business email quietly stopped",
    duration: "[NEEDS CONFIRMATION]",
    impact:
      "After moving an Australian client's nameservers to a new DNS provider, their business mailboxes (including the one used for customer quotes) stopped receiving mail.",
    summary:
      "The website records came across but MX, SPF and DKIM didn't. I traced it record by record until every mail check passed.",
    timeline: [
      { event: "Nameservers switched from the old host to the new DNS provider" },
      { event: "Mail issues reported; the old host's domain health check showed MX, SPF and DKIM warnings" },
      { event: "Compared zones: the new DNS zone had no MX records at all" },
      { event: "Identified the required MX hosts/priorities and SPF/DKIM values" },
      { event: "Restored the records [NEEDS CONFIRMATION: added manually, or resolved after propagation?]" },
      { event: "All four checks green (MX, SPF, DKIM, DMARC); tested send/receive" },
    ],
    rootCause: "Only web records were recreated in the new DNS zone; mail records were never migrated.",
    resolution: ["Restore MX, SPF, DKIM", "Verify all mail checks", "Test both directions"],
    actionItems: [{ done: true, text: "Export and diff the full DNS zone before any nameserver change" }],
    lesson: "A DNS move isn't 'the website works'. Email is part of the zone too, and it fails silently.",
    tags: ["dns", "email", "mx", "spf", "dkim"],
  },
  {
    id: "INC-006",
    kind: "near-miss",
    status: "[NEEDS CONFIRMATION: RESOLVED or OPEN]",
    title: "The cloud account running a client's production apps wasn't mine",
    date: "2026-07",
    severity: "SEV-2",
    duration: "Caught before impact",
    impact:
      "The Oracle Cloud tenancy hosting a client's production apps was owned by a friend's institutional email. Billing OTPs went to them, and a forgotten block volume was generating recurring charges. If that email had been deactivated or the bill left unpaid, the apps could have gone down with no way for me to fix it.",
    summary:
      "While recovering from INC-001, I checked who actually controlled the account. My own login had Administrator access, but ownership, billing and OTPs were tied to someone else's email. I worked out what I could change, and how to remove the recurring charge.",
    timeline: [
      { event: "During the INC-001 recovery, reviewed the cloud account's users, ownership and billing" },
      { event: "Found the tenancy owner was a friend's institutional email; billing OTPs went there" },
      { event: "Confirmed my own account was an active Administrator user" },
      { event: "Found the recurring charge came from a block volume, not the free-tier VM" },
      { event: "[NEEDS CONFIRMATION: what happened next: block volume deleted? ownership/notification email changed? anything else?]" },
    ],
    rootCause:
      "The account was created by whoever was available at the time, and nobody wrote down who owned what. Ownership, billing and access were three different people's problem.",
    whatFailed: [],
    resolution: ["[NEEDS CONFIRMATION]"],
    actionItems: [
      { done: true, text: "Verified my own Administrator access" },
      { done: false, text: "Ownership and billing contacts that the people running production can actually reach [NEEDS CONFIRMATION]" },
    ],
    lesson:
      "Who owns the account is part of the infrastructure. You can have perfect backups and still lose everything because the billing email belongs to someone who graduated.",
    tags: ["cloud", "oracle-cloud", "billing", "access-control"],
  },
];
