---
title: "OA Check: checking hundreds of laptops before every online assessment"
summary: "How a one-line script grew into a placement-portal feature that tracks 600+ apps and clears students' laptops before every OA."
role: "Lead Student Coordinator, CCD IIT Guwahati — design, scripts, portal integration"
team: "CCD technical team"
timeline: "Jul 2026 – present"
stack: [PowerShell, Bash, Node.js, Express, MongoDB, React, Docker]
status: "In use, still improving"
---

## The challenge

During internship season, most online assessments are taken from hostel rooms on students' own laptops. The test platform watches the browser, but a remote-control or screen-sharing app running in the background lets someone else see or drive the screen. We needed every laptop clean before the test started, on Windows and macOS, for every student sitting that OA.

## Version 1: a script and a one-liner

We started simple. We hosted a check script on our server and gave students one line to paste into PowerShell or Terminal:

```powershell
irm https://<our-server>/check | iex
```

```bash
curl -fsSL https://<our-server>/check | bash
```

`irm` is short for Invoke-RestMethod. It fetches whatever the URL serves, and `iex` runs it straight away. The script scanned the machine and reported back with the student's roll number to a small dashboard.

It worked, but the result wasn't tied to the student's portal account. We were trusting whatever got sent. I only properly understood how the irm flow worked, and what that meant for us, partway through the season. By then half the internship season had already gone by on version 1.

## Version 2: inside the portal

So I moved the whole thing into the placement portal. A student opens the OA Check page, clicks "Generate check command", and gets a command that carries a one-time token:

- it belongs to their logged-in account
- it expires after 30 minutes
- it can be used once; after the result comes back, it's dead

The script is served compressed and runs in memory. The student's page updates every few seconds and flips to "Device clear" or "Issues detected", which they show to their invigilator. The terminal never prints a pass or fail. The only verdict that counts is the one in the portal.

[DIAGRAM: oa-check-flow]

## What the script does

Both the Windows and macOS scripts follow the same shape: scan, fix, close everything else, scan again, report.

- It tracks 600+ apps: remote control and remote desktop tools, screen sharing and meeting apps, screen recorders, tunnels and VPNs, remote terminals, software KVMs, cloud gaming and streaming clients, and virtual machine tools.
- On Windows it also checks remote desktop and remote assistance settings, remote login services, and anything listening on remote desktop ports.
- On macOS it checks the Sharing settings, and flags any non-Apple app that holds both Screen Recording and Accessibility permissions, whatever its name.
- When it finds something, it tries to close or uninstall it, up to three passes, then closes every background app except the browser and scans again.
- A pass means zero findings. There's no "warning" state, and if the script can't read the process list, that counts as a failure, not a pass.

## The coordinators' side

The dashboard lists every check with filters and search, and it's virtualised because the list runs into thousands of rows. The OA Report screen takes a specific company's OA, lines up the students marked present against passing checks around the test's start time, flags anyone without one, and can email them or export the list to Excel.

## Built from feedback

None of this was designed in one go. After every OA, feedback came in and the script changed:

- 14 Aug: the check moves into the portal, with tokens
- 20 Sep: the dashboard moves to the admin side
- 23 Sep: better feedback while the script runs, pacing tuned
- 29 Sep: OA Report with email alerts and Excel export
- 30 Sep: a live clock in the script, clearer report timing
- 6 Oct: search, pagination and virtualisation for the dashboard

The app list kept growing with it. Every OA turned up something new, and today it covers 600+ apps. One check we added caused blue screens on some laptops' graphics drivers, so we pulled it. A check that crashes a student's laptop before their test is worse than no check.

We're still updating it.

## What I learned

Start with identity. The first version checked laptops; the second checked students' laptops, and that difference mattered more than any app on the list. Understand exactly how a delivery method like `irm | iex` behaves before handing it to hundreds of people. And test on the oldest, cheapest laptops you can find before every release.
