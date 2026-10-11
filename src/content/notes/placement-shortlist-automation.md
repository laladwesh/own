---
title: "A system I proposed to automate placement shortlists"
date: "2026-05"
summary: "A design I proposed for turning a shortlist spreadsheet into emails and a group chat, and why I would not use an automated WhatsApp number."
tags: [automation, placements, email]
---

This is a proposal and a design write-up. It describes a system I proposed to automate placement shortlists: the idea, the flow and the risks. It is not something I built.

## The problem

After a company shortlists students, someone has to tell them. That means emailing the shortlisted students, emailing the waitlisted ones with different wording, and adding everyone to a group chat for the next step. Done by hand, it is slow and easy to get wrong.

## The idea

Upload the shortlist Excel file. From it, the portal would:

1. Send an email to each shortlisted student, with the link to the group.
2. Send a different email to each waitlisted student.
3. Create the WhatsApp group automatically.

The first two steps are ordinary. Reading a spreadsheet and sending mail is the kind of thing the portal already does for other reports.

## The risk

The third step is the problem. Creating groups and adding people from an automated number is the kind of behaviour WhatsApp can ban an account for. A banned number in the middle of placement season would be worse than doing it by hand.

The alternative is the Telegram Bot API. It is an official way for a program to create and manage chats, so the same flow works without risking the account.
