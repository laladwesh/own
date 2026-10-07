// Command registry: one file per command, collected here.
import help from "./help.js";
import man from "./man.js";
import ls from "./ls.js";
import cd from "./cd.js";
import pwd from "./pwd.js";
import cat from "./cat.js";
import tree from "./tree.js";
import open from "./open.js";
import history from "./history.js";
import clear from "./clear.js";
import exit from "./exit.js";
import whoami from "./whoami.js";
import neofetch from "./neofetch.js";
import git from "./git.js";
import hire from "./hire.js";
import scope from "./scope.js";
import resistor from "./resistor.js";
import bin from "./bin.js";
import hex from "./hex.js";
import ohm from "./ohm.js";
import snake from "./snake.js";
import sudo from "./sudo.js";
import rm from "./rm.js";
import date from "./date.js";
import overdrive from "./overdrive.js";
import kubectl from "./kubectl.js";
import docker from "./docker.js";
import gh from "./gh.js";
import systemctl from "./systemctl.js";
import helm from "./helm.js";
import terraform from "./terraform.js";
import uptime from "./uptime.js";
import top from "./top.js";
import daemonCmd from "./daemon.js";

export const commands = [
  help, man, ls, cd, pwd, cat, tree, open, history, clear, exit,
  whoami, neofetch, git, hire,
  kubectl, docker, gh, systemctl, helm, terraform, uptime, top,
  scope, resistor, bin, hex, ohm,
  snake, sudo, rm, date, daemonCmd, overdrive,
];

export const byName = Object.fromEntries(commands.map((c) => [c.name, c]));
