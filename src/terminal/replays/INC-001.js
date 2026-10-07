// Replay of INC-001: "I deleted my own home directory on a production server".
// Everything here comes from the incident's own data (src/constants/incidents.js): the
// timeline, the dead ends, the UID trap and the rebuild. No new facts.
import { incidents } from "../../lib/incidents.js";

const LAPTOP = "avinash@laptop:~$";
const RESCUE = "rescue@vm:~$";
const SERVER = "ubuntu@server:~$";

const inc = incidents.find((i) => i.id === "INC-001");

// A step that is one plain command: type it (or something like it) and move on.
const simple = ({ prompt, situation, suggest, match, reply, to, hints }) => ({
  prompt,
  situation,
  suggest,
  hints,
  handlers: [{ match, reply, to }],
});

export default {
  id: "INC-001",
  title: "I deleted my own home directory on a production server",
  prompt: LAPTOP,
  start: "dropped",
  controls: "Type what you would type. `hint` for a nudge, `quit` (or Ctrl+C) to leave. Tab completes the next step.",
  intro: ["INC-001 replay. You are the one who ran the command.", "Everything here follows what actually happened, in order."],

  steps: {
    dropped: {
      prompt: LAPTOP,
      situation: ["You pasted cleanup commands. `ls -a` shows only . and ..", "Your SSH session just dropped."],
      suggest: ["ssh ubuntu@server"],
      hints: ["Try to get back into the server.", "Type: ssh ubuntu@server"],
      handlers: [
        { match: /^ssh\b/, reply: ["Permission denied (publickey).", "authorized_keys is gone."], to: "locked" },
        { match: /^ls\b/, reply: [".  .."] },
      ],
    },

    locked: {
      prompt: LAPTOP,
      situation: ["You are locked out. Four production apps have lost their code and config.", "What do you try?"],
      suggest: ["boot volume rescue", "serial console", "grub init=/bin/bash"],
      hints: [
        "The serial console and GRUB are both ways to get a shell without SSH. Neither is working out.",
        "The disk itself is fine. A second machine could read it.",
        "That is a boot volume rescue. Start by stopping the instance: `stop instance`.",
      ],
      handlers: [
        { match: /serial|console/, wrong: true, reply: ["Login incorrect: the ubuntu user has no password."] },
        {
          match: /grub|init=|single.?user|bin\/bash|boot menu|reboot|recovery/,
          wrong: true,
          reply: ({ tries }) => (tries === 1 ? ["You reboot and mash Esc. The boot window is too short.", "Missed the boot menu."] : ["Missed the boot menu. Again."]),
          tries: { n: 2, then: ["hint: the boot window is too short to catch. Try a different strategy: what if another machine could read the disk?"] },
        },
        {
          match: /^(oci )?(compute )?(instance )?(stop|shut ?down|power off)|stop( the)? instance/,
          reply: ["Switched strategy: boot volume rescue.", "Instance stopped."],
          to: "detach",
        },
        { match: /rescue|boot volume|another (instance|machine|vm)|second (instance|machine|vm)|detach/, reply: ["Switched strategy: boot volume rescue."], to: "stop" },
      ],
    },

    stop: simple({
      prompt: LAPTOP,
      situation: ["Step 1: stop the instance."],
      suggest: ["stop instance"],
      match: /stop|shut ?down|power off/,
      reply: ["Instance stopped."],
      to: "detach",
      hints: ["You cannot move a boot volume while the instance is running.", "Type: stop instance"],
    }),

    detach: simple({
      prompt: LAPTOP,
      situation: ["Step 2: detach the boot volume."],
      suggest: ["detach boot volume"],
      match: /detach/,
      reply: ["Boot volume detached."],
      to: "launch",
      hints: ["Take the disk off the stopped instance.", "Type: detach boot volume"],
    }),

    launch: simple({
      prompt: LAPTOP,
      situation: ["Step 3: you need a machine you can actually log in to."],
      suggest: ["launch rescue instance with my key"],
      match: /launch|create|new (instance|vm|machine)|rescue (instance|vm|machine)|spin up/,
      reply: ["Rescue instance launched, with your key."],
      to: "attach",
      hints: ["A temporary second instance, created with your SSH key.", "Type: launch rescue instance"],
    }),

    attach: simple({
      prompt: LAPTOP,
      situation: ["Step 4: give the rescue instance the old disk."],
      suggest: ["attach old volume"],
      match: /attach/,
      reply: ["Old boot volume attached to the rescue instance as a data volume."],
      to: "mount",
      hints: ["It becomes a data volume on the rescue instance.", "Type: attach old volume"],
    }),

    mount: simple({
      prompt: RESCUE,
      situation: ["Step 5: you are on the rescue instance. Make the old disk readable."],
      suggest: ["sudo mount /dev/sdb1 /mnt"],
      match: /^(sudo )?mount\b/,
      reply: ["Mounted. The old disk is readable. The home directory is empty, and authorized_keys is gone."],
      to: "keys",
      hints: ["Mount the data volume so you can see its files.", "Type: sudo mount /dev/sdb1 /mnt"],
    }),

    keys: simple({
      prompt: RESCUE,
      situation: ["Step 6: put your public key back."],
      suggest: ["recreate .ssh/authorized_keys"],
      match: /authorized_keys|mkdir.*\.ssh|\.ssh|public key|\bkey\b/,
      reply: ["Recreated .ssh/authorized_keys with your key."],
      to: "perms",
      hints: ["The file the server could not find. Create it again with your key in it.", "Type: recreate .ssh/authorized_keys"],
    }),

    perms: {
      prompt: RESCUE,
      situation: ["Step 7: sshd is strict about permissions on .ssh and the key file."],
      suggest: ["chmod 700 .ssh", "chmod 600 .ssh/authorized_keys"],
      hints: ["Two chmods: one for the folder, one for the file.", "700 on .ssh, and 600 on authorized_keys."],
      handlers: [
        {
          match: /chmod\b.*\b(777|775|755|750|664|644|666)\b/,
          wrong: true,
          reply: ["Those permissions are too open. sshd ignores keys that other users could read or write."],
        },
        {
          match: /chmod\b.*\b700\b.*\b600\b|chmod\b.*\b600\b.*\b700\b/,
          set: { chmod700: true, chmod600: true },
          reply: ["Permissions set: 700 on .ssh, 600 on authorized_keys."],
          to: () => "owner",
        },
        {
          match: /chmod\b.*\b700\b/,
          set: { chmod700: true },
          reply: ({ flags }) => (flags.chmod600 ? ["700 on .ssh. Both permissions are set."] : ["700 on .ssh. Still needed: 600 on authorized_keys."]),
          to: (f) => (f.chmod700 && f.chmod600 ? "owner" : undefined),
        },
        {
          match: /chmod\b.*\b600\b/,
          set: { chmod600: true },
          reply: ({ flags }) => (flags.chmod700 ? ["600 on authorized_keys. Both permissions are set."] : ["600 on authorized_keys. Still needed: 700 on .ssh."]),
          to: (f) => (f.chmod700 && f.chmod600 ? "owner" : undefined),
        },
      ],
    },

    owner: {
      prompt: RESCUE,
      situation: ["Step 8: the files you made belong to a user on this rescue machine. sshd cares who owns them."],
      suggest: ["chown -R 1000:1000 .ssh", "chown -R 1001:1001 .ssh"],
      hints: ["Give .ssh and the key file back to the right owner.", "Use the numeric UID and GID, not a name: names resolve against this machine's users."],
      handlers: [
        {
          match: /chown\b.*\b1001\b/,
          set: { uid: "ok" },
          reply: ["Ownership set to 1001:1001."],
          to: "reattach",
        },
        {
          match: /chown\b/,
          set: (text) => ({ uid: "bad", typed: text.replace(/^sudo /, "") }),
          reply: ["Ownership set. Nothing complains."],
          to: "reattach",
        },
      ],
    },

    reattach: {
      prompt: RESCUE,
      situation: ["Step 9: put the old volume back where it belongs."],
      suggest: ["reattach boot volume"],
      hints: ["Unmount if you like, then give the volume back to the original instance as its boot volume.", "Type: reattach boot volume"],
      handlers: [
        { match: /^(sudo )?(umount|unmount)\b/, reply: ["Unmounted."] },
        { match: /reattach|attach|put back|boot volume|original instance/, reply: ["Boot volume reattached to the original instance."], to: "start" },
      ],
    },

    start: simple({
      prompt: LAPTOP,
      situation: ["Step 10: start the instance."],
      suggest: ["start instance"],
      match: /start|power on|boot/,
      reply: ["Instance started."],
      to: "ssh",
      hints: ["The original instance, with its original disk.", "Type: start instance"],
    }),

    ssh: {
      prompt: LAPTOP,
      situation: ["Step 11: try SSH."],
      suggest: ["ssh ubuntu@server"],
      hints: ["The same command that failed at the start.", "Type: ssh ubuntu@server"],
      handlers: [
        {
          match: /^ssh\b/,
          wrong: (flags) => flags.uid !== "ok",
          reply: ({ flags }) =>
            flags.uid === "ok"
              ? ["Connected. SSH restored."]
              : ["Permission denied (publickey).", "SSH still fails. Check the UID on this image."],
          to: (flags) => (flags.uid === "ok" ? "check" : "fixuid"),
        },
      ],
    },

    fixuid: {
      prompt: RESCUE,
      situation: ["sshd refuses key files that belong to the wrong user.", "Back into the volume to fix the ownership."],
      suggest: ["chown -R 1001:1001 .ssh"],
      hints: ["On this image, ubuntu was not UID 1000.", "ubuntu was UID 1001 on this image. Use 1001:1001."],
      handlers: [
        {
          match: /chown\b.*\b1001\b/,
          set: { uid: "ok" },
          reply: ["Back through the rescue instance: ownership fixed to 1001:1001, volume reattached, instance started."],
          to: "ssh",
        },
        {
          match: /chown\b/,
          wrong: true,
          reply: ["Still the wrong owner. ubuntu was UID 1001 on this image, not 1000."],
        },
      ],
    },

    check: simple({
      prompt: SERVER,
      situation: ["You are in. The home directory is empty. What survived?"],
      suggest: ["check mongodb and nginx"],
      match: /mongo|nginx|ssl|systemctl|\/var\/lib|status|check|ls\b/,
      reply: ["MongoDB data is intact in /var/lib/mongodb.", "Nginx and SSL are intact."],
      to: "clone",
      hints: ["The database lived outside the home directory.", "Type: check mongodb and nginx"],
    }),

    clone: simple({
      prompt: SERVER,
      situation: ["The code and the .env files were in the home directory, so they are gone.", "The code is still in Git."],
      suggest: ["git clone the 4 repos"],
      match: /clone|git\b/,
      reply: ["Re-cloned 4 repos."],
      to: "env",
      hints: ["Everything that was in Git can come back from Git.", "Type: git clone the 4 repos"],
    }),

    env: simple({
      prompt: SERVER,
      situation: ["The secrets were never in Git."],
      suggest: ["recreate .env files"],
      match: /env|secret/,
      reply: ["Recreated .env files."],
      to: "build",
      hints: ["The one thing Git could not give back.", "Type: recreate .env files"],
    }),

    build: simple({
      prompt: SERVER,
      situation: ["The React frontends need building again."],
      suggest: ["npm run build"],
      match: /build|npm/,
      reply: ["Rebuilt React frontends."],
      to: "pm2",
      hints: ["Install and build each frontend.", "Type: npm run build"],
    }),

    pm2: {
      prompt: SERVER,
      situation: ["Restart everything under PM2, and make sure it survives a reboot."],
      suggest: ["pm2 start all", "pm2 startup", "pm2 save"],
      hints: ["Three things: start the apps, set up startup, save the list.", "pm2 start, pm2 startup, pm2 save."],
      handlers: [
        { match: /pm2 start( all)?\b(?! ?up)/, set: { started: true }, reply: ["Everything restarted under PM2."], to: (f) => (f.started && f.startup && f.saved ? "ci" : undefined) },
        { match: /pm2 startup/, set: { startup: true }, reply: ["PM2 will start on boot."], to: (f) => (f.started && f.startup && f.saved ? "ci" : undefined) },
        { match: /pm2 save/, set: { saved: true }, reply: ["Process list saved."], to: (f) => (f.started && f.startup && f.saved ? "ci" : undefined) },
      ],
    },

    ci: simple({
      prompt: SERVER,
      situation: ["Last one: CI/CD pushed to this server with a key that no longer exists."],
      suggest: ["restore ci/cd"],
      match: /ci|cd\b|deploy key|secret|actions|github/,
      reply: ["Re-added the deploy key and updated the GitHub Actions secrets."],
      to: "end",
      hints: ["The deploy key and the GitHub Actions secrets.", "Type: restore ci/cd"],
    }),
  },

  link: { text: "Read the full postmortem", cmd: "open incidents/INC-001", path: "/incidents/INC-001" },

  end: (stats) => [
    "Replay finished. The server is back.",
    `moves that got you forward: ${stats.moves}`,
    `hints used: ${stats.hints}`,
    `wrong turns: ${stats.wrong}`,
    " ",
    `Avinash took ${inc?.duration ?? "~3h"}.`,
  ],
};
