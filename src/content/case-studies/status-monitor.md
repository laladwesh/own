---
title: "Status & Infra Monitor: watching my own production servers"
summary: "A public status page and admin dashboard for the apps I run on one cloud VM: health checks, SSL expiry, metrics, audit logs and automated database backups."
role: "Solo — design, full stack, deployment"
team: "Just me"
timeline: "Feb 2026 – present (still upgrading)"
stack: [React, Node.js, Express, MongoDB, WebSockets, Tailwind, prom-client, Google Drive API, node-cron, Nginx, PM2, Oracle Cloud]
status: "In production"
---

## The challenge

I run several production apps for a client on one Oracle Cloud VM: an exam evaluation platform, a leave management app and an elective registration portal. When something broke, I usually found out from a user. I wanted to know first, and I wanted the people using those apps to see whether something was down without having to ask me.

## What I built

A public status page plus an admin dashboard, running on the same VM as the apps it watches.

[DIAGRAM: status-monitor]

- **Health checks** for each app and the database, with live updates over WebSockets
- **SSL certificate expiry tracking**: each domain marked ok, warning under 30 days, critical under 14, or expired
- **Metrics**: services up/down, CPU, memory, disk and database ping, exposed for Prometheus
- **Incidents**: a public list of ongoing issues and anything resolved in the last 7 days
- **Audit logs** for every admin action
- **Daily MongoDB backups** to Google Drive at 7:30 AM
- **Grafana dashboard** (grafana.avinashgupta.in) on top of the Prometheus metrics

## The hard parts

**Monitoring that can't hurt what it monitors.** The monitor runs next to the apps it watches. Its deploy pipeline only ever reloads the status dashboard itself; the other apps are never touched by its deploys.

**Backups that actually leave the server.** After INC-001, I didn't want backups living only on the machine they protect. The daily job dumps MongoDB, compresses it and uploads it to Google Drive using a refresh token, so a dead VM doesn't take the backups with it.

**Knowing about expiry before visitors do.** Certificates expire quietly. The monitor checks each certificate's expiry date directly and flags it weeks ahead.

## Shipping and running it

GitHub Actions deploys it over SSH on every push: pull, install, build, then a reload of the status dashboard's PM2 process only. Health checks, SSL expiry tracking, metrics, the incidents page, audit logs and daily backups are all live. The backup now runs every morning at 7:30. I also built a Grafana dashboard on top of the Prometheus metrics, at grafana.avinashgupta.in.

## What I learned

Monitoring isn't a feature you add at the end. It's how you find out your assumptions are wrong before your users do. And a backup that lives on the same disk as the data isn't a backup.

Related: [INC-001 → /incidents/INC-001](/incidents/INC-001) · [MongoDB backups note → /notes/mongodb-7-upgrade-and-free-backups](/notes/mongodb-7-upgrade-and-free-backups)
