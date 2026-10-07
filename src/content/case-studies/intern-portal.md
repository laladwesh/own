---
title: "The Intern Portal: running an institute's internship season in one system"
summary: "The portal that runs internship recruitment at IIT Guwahati: six roles, SSO, CV verification, OA logistics and offers, built and shipped with CI/CD."
role: "Software Developer Intern, then Lead Student Coordinator, CCD IIT Guwahati"
team: "CCD technical team"
timeline: "May 2026 – present"
stack: [React, Ant Design, Redux Toolkit, Node.js, Express, MongoDB, Azure Blob Storage, Docker, GitHub Actions, Nginx, Sentry]
status: "In production"
---

## The challenge

Internship recruitment involves a lot of people who need different things from the same data. Students apply and upload CVs. Companies post job forms and see applicants. Coordinators manage each company. Verifiers check CVs. Logistics handles online assessment rooms and slots. Admins oversee everything. All of it has to work during the busiest weeks of the year.

## What I built

[DIAGRAM: intern-portal-roles]

The main workflows:

- **Job forms (JAF) lifecycle**: from a company's job form to shortlists and results
- **CV verification**: verifiers review and flag CVs
- **OA logistics**: room and slot allocation for online assessments
- **Offers desk**: tracking offers through to the end
- **OA Check and Ghost OA**: two systems built during the season, each with its own write-up (links below)

## The hard parts

**Six roles, one codebase.** Every screen and every API call has to respect who's asking. Access is enforced through role-based access control with six levels, so a verifier, a coordinator and a student can use the same system without seeing each other's tools.

**Signing in without new passwords.** Students and staff sign in with OAuth2 single sign-on (Google and Microsoft) instead of another password to forget.

**Files at scale.** CVs and documents go through an upload pipeline (Multer to Azure Blob Storage), and reports come out as PDF and Excel exports for coordinators and companies.

**Portals that talk to each other.** The Intern Portal syncs with other CCD systems over HMAC-signed requests, so each side can verify a message really came from the other. Push notifications keep users informed when something changes.

**When reality doesn't fit the data model.** Mid-season, a company ran one online assessment for three roles. The portal assumed one OA per role. Ghost OA was the fix (see INC-002).

## Shipping and running it

The portal runs in Docker and deploys through a multi-stage GitHub Actions pipeline, behind Nginx, with Sentry catching errors in production.

## Impact

[NEEDS CONFIRMATION: companies, students or applications handled this season, if you can share any numbers]

## What I learned

The data model is a guess about how the world works, and recruitment season tests that guess every day. Ghost OA and OA Check both came from the real world not matching what the system assumed. Building in a way that could change quickly mattered more than getting it perfect up front.

Related: [OA Check case study → /projects/oa-check](/projects/oa-check) · [Ghost OA → /incidents/INC-002](/incidents/INC-002)
