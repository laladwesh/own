---
title: "What I'm learning: Kubernetes, ArgoCD and Terraform"
date: "2026-10"
updated: "2026-10-08"
summary: "A learning log. I run production apps on one VM with Docker, PM2 and Nginx. Here is what I am learning next, why, and the plan."
tags: [kubernetes, argocd, terraform, learning]
---

## Where I am

Everything I run in production today sits on a few Oracle Cloud VMs. The tools are Docker, PM2, Nginx and GitHub Actions. That setup has taught me a lot, and it has also hurt me once. [Losing my home directory](/incidents/INC-001) was one VM and one typo. The [OA Check case study](/projects/oa-check) is another piece of work that runs on the same kind of setup.

I have learned Kubernetes, ArgoCD and Terraform, but I have not needed them at production scale yet. Nothing I run has needed a cluster. I am not going to pretend otherwise on this page.

## Why learn them anyway

So that when something outgrows one VM, I already know the path. I do not want to pick up a new platform in the middle of a bad week. Learning it while nothing is on fire is cheaper.

## Done so far

- [x] Grafana + Prometheus monitoring on my VM, including PM2 process metrics (app up/down, CPU, memory, restarts), behind Nginx + SSL

## The plan

- [ ] k3s cluster on an Oracle Cloud ARM VM
- [ ] Terraform to create the VM and network instead of the console
- [ ] Containerise one real app (the LeetCode stats proxy) for k3s
- [ ] ArgoCD deploying it from GitHub (GitOps)
- [ ] Move one of my client apps onto it
- [ ] Write up what broke

## Notes so far

These are a learner's notes. I compare each idea to what I do today. None of it is a production claim.

### Kubernetes

- A Deployment says "keep this many copies of this container running" and replaces them when they die. PM2 does that for one process on one machine. Kubernetes does it across machines.
- A Service gives a set of containers one stable address. The job my Nginx upstream block does for me today.
- An Ingress holds the host and path rules, the part of an Nginx server block that decides where a request goes.
- Config and secrets live in ConfigMaps and Secrets objects, where my `.env` files live now.
- A rolling update replaces containers gradually and waits for the new ones to be healthy. It is the careful version of `pm2 reload`.

### ArgoCD

- Git is the source of truth. The cluster is made to match a repository, which is the opposite of my GitHub Actions deploys that SSH in and push changes.
- It notices drift: when the cluster stops matching Git, it shows the difference.
- A rollback is a revert in Git, not a command typed on a server.
- The deploy happens from inside the cluster, so I would not need to give CI an SSH key to the server.

### Terraform

- Infrastructure is described in files, and `plan` shows what will change before `apply` changes it.
- The state file is how Terraform remembers what exists. It is the part that needs care.
- Clicking through the cloud console leaves no record. Terraform leaves a file, which is closer to what I wanted after rebuilding a server by hand.
- Existing resources can be imported, so I do not have to start from nothing.

I'll update this page as I go.
