# Tanzil Ahmed — Offscript

Static portfolio built with Astro and TypeScript. Database-free, self-hosted fonts, dark/light themes, responsive local images and Markdown content.

## Develop

Use Node 24.19.0 (`.nvmrc`). Run `npm ci`, then `npm run dev`. The CLI prints the development address. `npm run build` generates the public site in `dist/`; `npm run preview` serves that output.

```sh
npm run check
npm run build
npm test
npm run test:browser
npm run test:authoring
```

Browser tests use `/usr/bin/chromium` if available. Otherwise run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Tests start a production preview on port 4321 when needed.

## Update content / নতুন content যোগ করা

GitHub-এর master branch থেকে সরাসরি edit করার ধাপসহ [সহজ বাংলা content guide](docs/CONTENT-GUIDE.md) দেখুন। প্রতিটি item একবার edit করলেই তার Home/list/detail view update হয়; component edit করতে হয় না। নতুন নিজের লেখা: `templates/post.md.example`; বাইরের article link: `templates/note.md.example`।

| Change | Location |
| --- | --- |
| Bio, headline, professional links, optional public email | `src/data/profile.json` |
| Projects and case studies | `src/content/projects/` |
| Open-source PRs | `src/content/contributions/` |
| Original posts/essays and external article links | `src/content/notes/` |
| Debate, theatre, teaching and volunteering | `src/content/activities/` |
| Experience | `src/content/experience/` |
| Recognition and milestones | `src/content/milestones/` |
| Current portrait | `src/assets/tanzil.jpg` |
| Approved screenshots | `public/media/` |
| Theme/layout styling | `src/styles/global.css` |

The first four published projects with `featured: true`, sorted by `order`, appear on Home. Current priority: Tuktak, ScopeProof, EngJatra, Choreseed. Cargotab and Tanzilbot remain in Earlier work. Up to three featured contributions appear on Home. Drafts are excluded from generated pages and sitemap.

The homepage introduces learning and exploration across several interests. Selected recognition uses `featured: true` in `src/content/milestones/`; all recognition and work experience appear on About. Published website contributions can omit a PR number and use the website contribution template. Tabbycat’s website work is featured on Home and explained at the top of Open source.

Writing supports dated native Markdown articles at `/notes/file-name/`, optional updated/written dates, reading time, external publications, filters and RSS at `/rss.xml`. The owner-supplied personal essay “Grandma’s Xbox” is highlighted on Home and About, with its 2024 admission context separated from the site's publication date. Bio, author identity and contact/footer links share `src/data/profile.json`.

## Publish

The GitHub Pages workflow checks PRs and prepares deployment on pushes to `master` or a manual run. Select **GitHub Actions** in repository Settings → Pages first. Offscript is merged into `master`. New content commits to `master` go through the same checks and deployment workflow.

Canonical origin: `https://tanzilahmed.tech`. The custom domain is configured in GitHub Pages. See [the custom-domain guide](docs/CUSTOM-DOMAIN.md) for DNS maintenance.

If the domain changes, update `astro.config.mjs`, `public/robots.txt` and `public/CNAME`; generated-link tests derive the origin from Astro configuration and check these files agree. Publish only `dist/`, not source attachments or research.

The owner-approved public email is configured in `src/data/profile.json`; Contact provides email and copy actions alongside GitHub and LinkedIn. No phone number, original application PDF, private address or application IDs belong in content, metadata or downloads. See [release notes](docs/RELEASE-NOTES.md) for editorial decisions.
