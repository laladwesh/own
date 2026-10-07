---
title: "Making this portfolio not look AI-generated"
date: "2026-10"
summary: "A reel about Claude Code design skills started this site. How it went from a black page that looked like a LinkedIn profile to a paper page with a terminal on it."
tags: [design, claude-code, portfolio]
---

## The problem

I watched a reel about design skills for Claude Code and tried the frontend-design skill on my own portfolio. The first result looked like a LinkedIn profile on a black background.

That is the real problem with a first generated design. Nothing in it is wrong, and nothing in it is mine. Anyone who builds a portfolio this way gets the same page.

## What I tried

The first useful decision was to stop asking for a good-looking page and start from what I actually am: an ECE student who writes software. That became a terminal as the hero, and an oscilloscope trace behind the page that reacts to the mouse and to typing.

Next I removed everything that made it look generated. Pulsing dots went first, then the gradients, the glows, the emojis and the purple. Each one was easy to remove. The page still felt off.

Then I spent a while on colour. I tried orange. I tried a different colour for each channel of the scope. I tried olive, then copper. None of them fixed it, because I was changing the paint on something whose problem was somewhere else.

## What worked

The problem was not the palette. It was the dark-mode default. Almost every developer portfolio is dark, and a dark page with an accent colour is the thing people now read as generated.

So I flipped it. The page is paper and ink, with one text colour and no accent. The terminal stays dark, and so does every other piece of equipment on the page, as a device sitting on the paper. Colour only appears inside devices.

That one rule decided a lot of later questions. A new section does not need a colour. It needs a surface, and the surface is either paper or a device.

## The details that stayed

A few choices came out of that and stuck:

- Two fonts: Clash Display for the name and section headings, JetBrains Mono for everything else.
- Section headings are a shell command in small text, then the title as an inverted ink block.
- The mouse pointer is a small pixel ghost I drew, instead of the arrow.
- The content is arranged like a DevOps setup. The projects table is `kubectl get deployments`, experience is `gh run view`, and the dashboard stands in for monitoring. The terminal at the top understands the same commands.

The last layer came after that. Incidents are written up as postmortems, and bigger pieces of work get case studies. Those pages are the ones I would want to read if I were the person looking at this site.

## Gotchas

Removing effects is harder than adding them. Each effect has a small reason to exist, and you have to decide again every time that it should go.

I also had to keep checking the page on a phone. The scope trace behind the text hurt reading on a small screen until I turned it down there.

## What I would do differently

I would pick the concept before opening the editor. The terminal and the scope came from asking what is specific to me, and I only asked that after the first result disappointed me. The colour experiments were the expensive part, and a clearer idea of the page would have skipped most of them.

One real concept beats any number of effects.
