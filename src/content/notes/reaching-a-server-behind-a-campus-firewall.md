---
title: "Reaching a campus server that has no public IP"
date: "2026-08"
summary: "A campus server I could only reach from inside the network, a VPN that did not help, and how I worked out that the firewall was reading the TLS handshake."
tags: [networking, tailscale, ssh, campus-infra]
---

[NEEDS CONFIRMATION: final outcome + permission to publish]

## The problem

I look after a server on campus. It has no public IP, and I wanted to reach it over SSH from anywhere.

The campus VPN looked like the obvious answer. It connects, but it does not route the internal subnets, so the server was still out of reach.

## What I tried

The server runs Ubuntu 23.10, which is end of life. `apt` returned 404 errors because the package archives for that release had moved. Before installing anything I had to sort out the sources.

I considered two ways around a missing public IP. The first was an SSH reverse tunnel through my own VPS, kept alive with `autossh`. The server dials out to the VPS, and I SSH to the VPS and ride the tunnel back. The second was a Cloudflare Tunnel.

I started with Tailscale because it is the least work when it behaves. The install went fine. Then this hung:

```bash
sudo tailscale up
```

## How I worked out what was blocking it

Plain failure would have been easier. The command did not fail, it waited.

What I could see:

- The TCP connection to the control server opened.
- The TLS handshake that should follow never finished. The connection was dropped without an error.
- Outbound port 22 was blocked.
- Outbound port 443 to my own VPS was open.

A silent drop after the TCP handshake, on a port that is otherwise allowed, points at inspection of the handshake itself. The firewall appeared to be reading the SNI, the server name a client sends at the start of TLS, and dropping connections to names it did not like. A rule that blocks by IP or port would have refused the TCP connection.

[NEEDS CONFIRMATION: which test proved it was SNI filtering]

## The plan

If port 443 to my VPS is open, then the VPS can answer on 443 for both SSH and HTTPS. `sslh` does that: it listens on 443, looks at the first bytes of each connection, and passes SSH to the SSH daemon and TLS to the web server.

Then the reverse tunnel from the campus server can ride on 443 like ordinary HTTPS traffic to a host the firewall already allows.

## Gotchas

An end-of-life Ubuntu release makes every step slower, because even installing a tool means fixing the package sources first.

A hang is not a failure. Check which layer stalls (DNS, TCP, TLS) before you decide what to try next.

## What I would do differently

[NEEDS CONFIRMATION: final outcome]
