---
title: "Building my own mini Vercel (Onawie)"
date: "2026-10"
summary: "I deploy many apps by hand, so I started building a small platform that does it from a GitHub repo. How it works, what is hard about it, and what is still unfinished."
tags: [paas, docker, nginx, projects]
---

[NEEDS CONFIRMATION: current status of Onawie, and permission to publish the write-up]

## Why I built it

I deploy a lot of apps by hand. The routine is the same every time: SSH into a server, clone the repo, build it, start it under PM2, write an Nginx server block, run certbot, and check that it is up. Every step is simple. Together they are slow.

Vercel and Render do all of this when you click a button. I use them without knowing what they actually do between the push and the URL. So I decided to build a small version of one, mostly to find out.

It is called Onawie. This is a work in progress, and I am describing it as it is, not as I would like it to be.

## How it works today

You sign in with GitHub, pick a repository, set the build options, and the platform gives the project its own address. After that, a push to the repository deploys it.

[DIAGRAM: onawie-flow]

The pieces are a Next.js dashboard, an Express API, and a worker that does the deploys. MongoDB holds the projects, the deployments, the logs and the job queue. The platform's own services run under systemd on a single server.

A deploy goes like this:

1. A job is queued, either from a push webhook or from the dashboard.
2. The worker clones the repository at that commit.
3. If the repo has no Dockerfile, the worker writes one for the framework it detects from `package.json`. Plain HTML sites get a small static server instead. Other languages are rejected for now.
4. It builds the image and starts a container with memory and CPU limits.
5. It polls the container until it answers, and only then writes an Nginx config for the project and reloads Nginx.
6. The old container is removed after the new one has taken over.

Around that there are environment variables per project, deploy logs, rollbacks to an earlier deployment, cancelling a running deploy, preview deployments for pull requests, and status updates back to GitHub. There is also an optional AI summary of a deployment, with a plain rule-based fallback when it is not configured.

## The hard parts

Picking a port. Every container needs a free port on the host. I ask the system for one, which works until two deploys run at the same moment and ask at the same time.

Nginx. Each project gets its own config file, and each deploy tests the config and reloads Nginx. Two deploys finishing together can both be editing and reloading at once, and I do not lock that yet.

Switching without downtime. The new container starts and has to pass its health check before traffic moves. Only then does the old one go. The order is easy to write down and easy to get wrong when a deploy fails halfway.

Other people's builds. A build runs install and build commands from a repository, on my server. I am careful about this one, and it is the part I trust least. Builds get memory and CPU limits, and nothing stronger yet.

Logs. Build output goes into MongoDB line by line, and the dashboard polls for new lines. It works for build logs. It is not a live stream, and it does not follow a running app's logs.

The queue. MongoDB doubles as the job queue. If the worker restarts in the middle of a deploy, the job is marked failed and not resumed.

## Where it stands

Works today:

- GitHub sign-in, repository selection, project settings
- Webhook-triggered deploys, with signature checking
- Docker builds, generated Dockerfiles for Node frameworks and static HTML
- Per-project Nginx routing and a live address
- Environment variables, deploy logs, rollbacks, cancel
- Preview deployments for pull requests

In progress:

- [NEEDS CONFIRMATION: what I am working on right now]

Next, from the gaps I can see in my own code:

- [NEEDS CONFIRMATION: which of these are planned]
- Reserve ports properly so concurrent deploys cannot collide
- Serialise Nginx changes
- Resume or retry jobs after a worker restart
- Stream the logs of a running app
- Isolate builds better

## What it taught me

The platforms I use every day are mostly this: a queue, a builder, a container runtime and a reverse proxy, held together by a lot of careful ordering. The ordering is the product.

A health check before the switch is the difference between a deploy and an outage. A rollback is only possible because the previous image still exists. A preview URL per pull request is just another route to another container.

And it made me less impatient with the "boring" parts of Vercel. Every small feature there is something I have now had to decide how to build.
