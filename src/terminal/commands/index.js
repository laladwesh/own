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
import grep from "./grep.js";
import wc from "./wc.js";
import head from "./head.js";
import sort from "./sort.js";
import fortune from "./fortune.js";
import daemonsay from "./daemonsay.js";
import curl from "./curl.js";
import deploy from "./deploy.js";
import ssh from "./ssh.js";
import tour from "./tour.js";
import ping from "./ping.js";
import vim from "./vim.js";
import typespeed from "./typespeed.js";
import htop from "./htop.js";
import theme from "./theme.js";
import hi from "./hi.js";
import achievements from "./achievements.js";
import journalctl from "./journalctl.js";
import incidents from "./incidents.js";
import ghostOa from "./ghost-oa.js";
import oaCheck from "./oa-check.js";
import agnigarh from "./agnigarh.js";

export const commands = [
  help, man, ls, cd, pwd, cat, tree, open, history, clear, exit,
  whoami, neofetch, git, hire, journalctl, incidents, ghostOa, oaCheck, agnigarh,
  kubectl, docker, gh, systemctl, helm, terraform, uptime, top,
  scope, resistor, bin, hex, ohm,
  grep, wc, head, sort, theme,
  deploy, htop, ssh, tour, ping, curl, hi,
  snake, typespeed, achievements,
  sudo, rm, date, daemonCmd, daemonsay, fortune, vim, overdrive,
];

export const byName = Object.fromEntries(commands.flatMap((c) => [c.name, ...(c.aliases ?? [])].map((n) => [n, c])));
