---
title: "Users said our portal looked AI-generated, so I audited the design"
date: "2026-08"
summary: "The Intern Portal is React with Ant Design and Geist. Users said it looked AI-generated. What gave it away, and the plan for fixing it."
tags: [design, react, ant-design, placements]
---

## The problem

Users told us the Intern Portal looked AI-generated. It is a React app built with Ant Design and the Geist font.

It was not a complaint about a bug. It was a complaint about trust. A portal where students upload documents and companies make decisions should look like someone cared about it.

## What gave it away

I went through the screens looking for what people were reacting to. The tells were specific:

- The default Ant Design blue, used everywhere.
- Components used with no styling at all: `Statistic`, `Steps`, `Table` and `Upload.Dragger`.
- The default ProLayout shell, with its standard sidebar and header, on every page.

None of these is wrong on its own. Together they say "nobody made a decision here", and that is what the word "generated" means to a user.

## The approach

First, an audit of the theme tokens in `ConfigProvider`. Ant Design lets you set colours, radius, font and spacing in one place.

```javascript
<ConfigProvider theme={{ token: { colorPrimary: "<our colour>", borderRadius: "<our radius>" } }}>
```

Second, I did not ask for a "more formal" look. "Formal" is a request that produces the generic enterprise dashboard, which is the thing I was trying to leave. Instead I picked real formal systems to learn from: a passport application, a court e-filing system, a tax portal. I looked at what those systems do that a SaaS template does not, and used that as the reference.

Third, identifiers. Application and reference IDs are the things students quote when something goes wrong. I set them in Geist Mono so they read as identifiers and are easy to copy without mistakes.

## Gotchas

Changing tokens is quick and fixes less than you expect. The default look comes partly from layout choices, which tokens do not touch.

"Make it formal" and "make it professional" are not design briefs. They send you straight to the generic answer.

## What I would do differently

[NEEDS CONFIRMATION: what shipped, and the reaction]
