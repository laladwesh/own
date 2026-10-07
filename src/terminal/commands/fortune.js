const FORTUNES = [
  "A green build is just a red build that has not met production data yet.",
  "Every config file is a tiny programming language nobody agreed to learn.",
  "Uptime is a promise; backups are the apology you hope never to send.",
  "The cloud is a computer you cannot kick.",
  "Logs are love letters from your past self, usually unreadable.",
  "Anything that can be automated will be automated at 2 a.m. on a Friday.",
  "A rollback button is the most underrated feature in any system.",
  "Technical debt compounds faster than any savings account.",
  "Nobody reads the runbook until the pager rings.",
  "Naming a variable temp is how permanent things begin.",
  "Latency is just physics sending its regards.",
  "Reproducible builds: because 'it compiled yesterday' is not a proof.",
  "A good alert wakes you once; a bad alert teaches you to sleep through all of them.",
  "Containers do not fix messy code; they ship the mess in a neat box.",
  "The best dashboard is the one you check before the customer does.",
  "Delete the feature flag before the feature flag deletes your weekend.",
  "Idempotent: run it twice, break it once.",
  "Free tier is a loan with interest paid in surprise invoices.",
  "Reading the error message solves eighty percent of problems.",
  "Merge conflicts are just teammates talking at the same time.",
];

export default {
  name: "fortune",
  group: "fun",
  summary: "a short engineering one-liner",
  usage: "fortune",
  description: "Prints one of twenty original DevOps and engineering one-liners, picked at random.",
  example: "fortune",
  run() {
    return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  },
};
