---
{
  "title": "PlayPiku",
  "summary": "A browser arcade for a little everyday play.",
  "category": "Product",
  "role": "Product & development",
  "status": "Public project",
  "featured": true,
  "order": 4,
  "cover": "custom",
  "coverImage": "/media/playpiku-cover.png",
  "coverAlt": "PlayPiku project artwork: A little play. A better day., with illustrations of its browser games.",
  "tools": ["JavaScript", "HTML", "CSS", "Canvas", "GitHub Pages"],
  "links": [
    { "label": "Visit PlayPiku", "url": "https://tanzilahmed.tech/playpiku/" },
    { "label": "Source on GitHub", "url": "https://github.com/tanzilamd/playpiku" }
  ]
}
---

## A little room for play
PlayPiku is a collection of browser games for a short break. It brings arcade, puzzle and strategy games together in one place, with an English interface, original game illustrations and layouts for phones and larger screens.

The collection includes games such as Piku Harvest, Piku Moto Trails, Piku Rally, Pocket Tower Defense, Mini Golf and familiar games such as Snake, Minesweeper and 2048. Each game has its own instructions and controls rather than leaving the player to guess how it works.

## Building the experience
The project uses HTML, CSS and JavaScript modules, with Canvas where it suits the game. Game rules and physics are separated from controllers, and games clean up their own listeners and animation when the player moves elsewhere.

Keyboard and touch controls, first-visit tutorials, pause behavior and replay are part of the experience. Independent rule tests and browser interaction checks help cover both the game mechanics and the surrounding interface.

## Small by design
There are no runtime dependencies, embedded third-party games, account requirements, advertisements or analytics. Records and supported game progress stay in the browser rather than being sent to a server. They do not sync between devices; storage restrictions fall back to the current visit.

Game names, descriptions, order and visibility come from one editable configuration file. Static pages give individual games their own links and social previews, while GitHub Pages serves the built site without a running application server.

## Explore the arcade
The live arcade and public source are linked above. The repository documents the current games, controls, editing guide and validation; its catalog can continue to grow without changing this portfolio's selected-project count.
