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

During internship season, every online assessment takes place in rooms we allocate, under our invigilation, on students' own laptops. The test platform watches the browser, but students were using remote-access apps on those laptops, and a remote-control or screen-sharing app running in the background lets someone else see or drive the screen. We needed every laptop clean before the test started, on Windows and macOS, for every student sitting that OA.

## Version 1: a script and a one-liner

We started simple. We hosted a check script on our server and gave students one line to paste into PowerShell or Terminal:

```powershell
irm https://iitg.ac.in/oa-check | iex
```

```bash
curl -fsSL https://iitg.ac.in/oa-check | bash
```

`irm` is short for Invoke-RestMethod. It fetches whatever the URL serves, and `iex` runs it straight away. The script scanned the machine and showed a green flag or a red flag.

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
- It also looks back two hours for signs that a prohibited app was used or removed just before the check. Recent evidence fails the check; older evidence is recorded as a note for admins to review, never as a fail.
- A pass means zero findings. There's no "warning" state, and if the script can't read the process list, that counts as a failure, not a pass.

## The admin side

All of this lives in a separate Admin Desk with its own login, apart from the regular coordinator accounts. It has two views.

**OA Checks** lists every check ever run, with filters for result, date and platform, and search across students and findings. Each check shows what failed it and any history notes, kept separate.

**OA Report** works per OA. Pick a company's assessment and switch between two phases:

- Start of OA: every student marked present, matched against checks inside the 10-minute window. Anyone without a passing check there is flagged, and admins can send all flagged students a warning email in one go.
- During the OA: the spot-check window. Only checks that actually failed are flagged; not being spot-checked is never held against anyone. These are reviewed by hand, not emailed.

Both phases filter by all / failed / passed / flagged and export to Excel.

## Built from feedback

None of this was designed in one go. After every OA, feedback came in and the script changed:

- 14 Aug: the check moves into the portal, with tokens
- 20 Sep: everything moves into its own Admin Desk
- 23 Sep: better feedback while the script runs, pacing tuned
- 29 Sep: OA Report with email alerts and Excel export
- 30 Sep: a live clock in the script, clearer report timing
- 6 Oct: search, pagination and virtualisation for the dashboard
- 10 Oct: warning emails for flagged students
- 12 Oct: the check starts looking back two hours; older findings become history notes for admins
- 15 Oct: platform filter in the Admin Desk
- 19 Oct: two phases per OA: start of OA and during the OA
- 20 Oct: result filters in the OA Report

The app list kept growing with it. Every OA turned up something new, and today it covers 600+ apps. One check we added caused blue screens on some laptops' graphics drivers, so we pulled it. A check that crashes a student's laptop before their test is worse than no check.

We're still updating it.

## Closing the gap

[DIAGRAM: oa-gap-human]

The check had a blind spot: it only knew what was on the laptop at the moment it ran. Some students passed the check, then installed an app before or during the test, used it, and deleted it before anyone looked. A clean result at 2:00 said nothing about 2:30.

So I closed the gap in three ways.

**The check looks back.** Besides what's running or installed right now, it looks for signs that a prohibited app was used or removed in the last two hours. That fails the check. Anything older becomes a history note: admins can see it and review it, but it never fails a student on its own.

**The check has to happen at the right time.** A check only counts at the start of an OA if it's run inside a 10-minute window: five minutes either side of when the test actually begins.

**And it happens again during the test.** Admins run spot-checks between roughly 1.5 and 3 hours into the OA, while students are still sitting it.

## By the numbers

[DIAGRAM: oa-check-numbers]

## What I learned

Start with identity. The first version checked laptops; the second checked students' laptops, and that difference mattered more than any app on the list. Understand exactly how a delivery method like `irm | iex` behaves before handing it to hundreds of people. And test on the oldest, cheapest laptops you can find before every release.

A check only proves the moment it runs. To make it mean something, I had to add time: look back before it, fix when it has to happen, and check again during the test.
