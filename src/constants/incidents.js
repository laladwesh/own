// Postmortems. Add a new object to the array and it shows up on the page and in the terminal
// (journalctl --priority=crit, cat incidents/<id>.md).
//
// Fields: id, title, date, severity, status, duration, impact, summary, timeline[] {time?, event},
// rootCause, badCommand? { pasted[] }, whatFailed[], resolution[], actionItems[] {done, text},
// lesson, tags[].
export const incidents = [
  {
    id: "INC-001",
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
];
