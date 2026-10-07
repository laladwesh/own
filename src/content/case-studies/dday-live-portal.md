---
title: "D-Day: a live placement dashboard for the one day that matters"
summary: "A real-time dashboard that kept 150+ company POCs and 1500+ students in sync on placement day, built with Socket.IO and deployed on institute servers."
role: "Student Coordinator, CCD IIT Guwahati — design, full stack, deployment"
team: "CCD technical team"
timeline: "Nov 2025 – Dec 2025"
stack: [React, Node.js, Express, Socket.IO, MongoDB, Docker, jsPDF]
status: "Used on placement day"
---

## The challenge

Placement day at IIT Guwahati is the busiest day of the year for CCD. Dozens of companies interview in parallel, offers are made and confirmed through the day, and every student wants to know their status the moment it changes. Before this, that information moved through calls, messages and spreadsheets. We needed one live source of truth that 150+ company POCs and 1500+ students could all trust at the same time.

## What I built

A real-time placement dashboard. POCs create offers live as decisions are made. Admins confirm them. Everyone else sees the update without refreshing.

[DIAGRAM: dday-flow]

It has five roles, each seeing only what it should:

- **Student**: their own status
- **POC**: creates offers for their company
- **Admin**: approves and confirms offers
- **Official**: oversight across companies
- **Viewer**: read-only live view

## The hard parts

**Everyone sees the same thing, instantly.** A placement dashboard is only useful if nobody is looking at stale data. Updates go out over Socket.IO WebSockets the moment an offer changes, instead of each client polling the server.

**Nothing is final until an admin says so.** On a day this busy, mistakes happen. Offers created by POCs go through admin approval before they count, so one wrong click doesn't become a wrong result in front of 1500 students.

**Reports on the spot.** Officials needed company-wise status reports during the day, not after it. PDF export runs in the browser with jsPDF, so generating a report never adds load to the server at the busiest moment.

## Shipping and running it

The app was Dockerised and deployed on IIT Guwahati's own servers over SSH. Placement day went smoothly overall. There was one real issue: live updates over the socket didn't come through properly on iPhones, while Android, Windows and Mac browsers updated live as expected. I fixed the iPhone issue in January 2026, after placement day.

## Impact

150+ POCs and 1500+ students used one live dashboard instead of calls and spreadsheets on placement day.

## What I learned

Real-time is the easy part. The hard part is deciding who is allowed to change what, and making sure a mistake can be caught before everyone sees it. The approval step mattered more than the WebSockets.

Test real-time features on iOS Safari early. "Works on every device I tried" isn't the same as "works on every device students use".
