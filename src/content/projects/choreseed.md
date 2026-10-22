---
{
  "title": "Choreseed",
  "summary": "Do the thinking once. Reuse the routine.",
  "category": "Tool",
  "role": "Product direction & development",
  "status": "Limited preview",
  "featured": true,
  "order": 4,
  "cover": "choreseed",
  "tools": [
    "TypeScript",
    "React",
    "Web Workers",
    "Fastify"
  ],
  "links": [
    {
      "label": "Explore the preview",
      "url": "https://choreseed.onrender.com"
    },
    {
      "label": "Source on GitHub",
      "url": "https://github.com/tanzilamd/choreseed"
    }
  ],
  "note": "The free preview supports sample editing, CSV export and routine replay. Public live AI generation is paused."
}
---

## The work you should not have to repeat
Cleaning a similar CSV again should not mean explaining the same task from scratch. Choreseed explores turning instructions into a small routine that a person can inspect, edit, export and run again.

The project focuses on contact CSVs and explicit transformations: selected-field changes, renaming, deduplication and removing completely empty rows. A preview makes the consequences visible before export.

## A routine you can inspect
Instead of hiding the result behind a single AI answer, Choreseed exposes an ordered series of typed steps. Compatible-file replay runs the saved routine without another inference call.

Browser Web Workers handle the actual CSV transformations. Leading zeros, blank deduplication keys and changed header order are details that matter when a useful tool meets real files.

## Preview and live generation are different
The free preview offers a clearly labelled fictional sample, step editing, exports and reusable routines. Public live AI generation is paused pending durable usage accounting. The source documents that boundary rather than presenting sample output as live inference.

## Built as an experiment
Choreseed was developed for the Week 3 Hacktoberfest Open-Source AI Challenge. Development was AI-assisted under my product direction. The project source includes architecture, evaluation and delivery notes; an article draft is not presented here as a published submission.
