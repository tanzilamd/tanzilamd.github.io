# Tanzil Ahmed — Offscript

Tanzil Ahmed’s portfolio: projects, open-source work, experience, recognition, community activities and writing. Built with **Astro + TypeScript**, fully static and database-free, with dark/light themes and local fonts/images.

**Live:** https://tanzilahmed.tech/ · **Publishing branch:** `master` · **Deployment:** GitHub Pages Actions

| Dark | Light |
| --- | --- |
| ![Offscript homepage in dark mode](docs/images/home-dark.jpg) | ![Offscript homepage in light mode](docs/images/home-light.jpg) |

## Content update / সহজে edit করুন

GitHub থেকে সরাসরি `master`-এ edit করতে পারেন। প্রতিটি item-এর একটি source file; সেখান থেকে সংশ্লিষ্ট Home/list/detail views তৈরি হয়। Layout edit করতে হয় না।

**[সহজ বাংলা content update manual →](docs/CONTENT-GUIDE.md)**

| Update | Source |
| --- | --- |
| Name, headline, intro, About bio, email, GitHub/LinkedIn, photo caption | [`src/data/profile.json`](src/data/profile.json) |
| Projects and case studies | [`src/content/projects/`](src/content/projects/) |
| Open-source PRs and published website contributions | [`src/content/contributions/`](src/content/contributions/) |
| Original posts/essays and external article links | [`src/content/notes/`](src/content/notes/) |
| Debate, theatre, teaching and volunteering | [`src/content/activities/`](src/content/activities/) |
| Work experience | [`src/content/experience/`](src/content/experience/) |
| Awards, recognition and milestones | [`src/content/milestones/`](src/content/milestones/) |
| Portrait | `src/assets/tanzil.jpg` |
| Article/project images | `public/media/` |

### Add an article

Copy [`templates/post.md.example`](templates/post.md.example) to `src/content/notes/my-article.md`. Fill in the title, summary, publication `date` (`YYYY-MM-DD`) and Markdown body. Set `draft: false`, commit to `master`, and wait for the successful Actions deployment. The article appears at `/notes/my-article/`; Writing, RSS and sitemap update automatically.

For an external publication, use [`templates/note.md.example`](templates/note.md.example): set `kind: "external"`, the real publication date, platform and URL. The Writing filters distinguish **On this site** from **Elsewhere**. Native posts support optional written/updated dates; “Grandma’s Xbox” preserves its 2024 admission context separately from its site publication date.

Draft content is excluded from generated pages, RSS and sitemap. A public Git repository still exposes committed draft source, so keep private drafts outside the repository.

### Choose Home highlights

- Projects: first four published `featured: true` entries, sorted by `order`. Current selection: Tuktak, ScopeProof, EngJatra and Choreseed. Cargotab/Tanzilbot stay under Earlier work.
- Contributions: up to three featured entries. A `spotlight: true` entry also receives a detailed Open source feature; Tabbycat’s published website work links to its source and upstream integration.
- Recognition: up to three featured milestones. All awards and work experience appear on About; Hacktoberfest milestones also appear under Open source.
- Activities: featured entries appear on Home; all published activities appear under Activities. Edit one activity’s summary once to update both views.
- Writing: the first featured entry, or the latest entry when none is featured. About also shows the first featured personal essay. Writing itself sorts by publication date, then `order`.

## UI and project structure

Offscript uses a restrained editorial layout: consistent project cards, readable body text, serif accents, quiet surfaces, and one coral/terracotta accent across dark and light themes. Buttons, filters, navigation and focus states share the same rules. Activities are available in desktop, mobile and no-JavaScript navigation.

| Responsibility | Location |
| --- | --- |
| Color/spacing tokens, typography, components and responsive layouts | `src/styles/global.css` |
| Shared navigation, theme initialization, footer and metadata | `src/layouts/Layout.astro` |
| Shared project, recognition, writing and filter components | `src/components/` |
| Page composition and generated article/project routes | `src/pages/` |
| Content field validation and draft/order rules | `src/content.config.ts`, `src/lib/` |
| Theme/menu/filter/copy interactions | `src/scripts/site.ts` |
| Reusable content examples | `templates/` |
| Production-output, content-authoring and browser checks | `tests/`, `scripts/check-authoring.mjs` |

Read [the UI guide](docs/UI-GUIDE.md) before changing shared components. Keep the implementation, README, content guide and relevant release/verification notes in sync; repository working instructions are in [AGENTS.md](AGENTS.md).

## Local development and checks

Use Node **24.19.0** (`.nvmrc`). Run `npm ci`, then `npm run dev`; the CLI prints the address. `npm run build` writes the static site to `dist/`, and `npm run preview` serves that output.

```sh
npm ci
npm run check
npm run build
npm test
npm run test:authoring
npm run test:browser
```

Run authoring tests before browser tests, not concurrently: authoring checks build temporary content, remove it, then rebuild the original site. Browser checks use `/usr/bin/chromium` when available; otherwise run `npx playwright install chromium` or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. The browser suite starts a production preview on port 4321 when needed. See [verification notes](docs/VERIFICATION.md) for recorded results and limits.

## Publishing and domain

Pushes to `master` run `.github/workflows/pages.yml`: install, type checks, static build, authoring/output/browser checks, then publish `dist/` through GitHub Pages. PRs run checks without deploying. The workflow is **Check and deploy portfolio** under Actions. Pages must use **GitHub Actions** as its source; the current site is already configured.

Canonical origin: **https://tanzilahmed.tech**. See [custom-domain/DNS maintenance](docs/CUSTOM-DOMAIN.md). If the domain changes, update `astro.config.mjs`, `public/robots.txt` and `public/CNAME`; generated-link checks verify they agree. RSS is at `/rss.xml`, sitemap at `/sitemap.xml`.

The public contact email is configured once in `profile.json`; Contact provides email/copy actions, GitHub and LinkedIn. No phone number, source application PDF, private address or application IDs belong in the public build. Publish only `dist/`. The personal essay was supplied for publication by its author. See [release notes](docs/RELEASE-NOTES.md) and [credits](docs/CREDITS.md).
