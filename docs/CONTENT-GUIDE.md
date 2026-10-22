# Content update guide

এই portfolio database ছাড়াই চলে। প্রতিটি item-এর আলাদা file থাকবে; build-এর সময় page ও list update হবে। Layout code বদলাতে হবে না।

## Projects

1. Copy `templates/project.md.example` to `src/content/projects/my-project.md`.
2. Use a unique lowercase filename with hyphens. It becomes `/work/my-project/`.
3. Fill in title, summary, actual role/status, category, tools and real links.
4. Write the story below `---`: problem, contribution, decisions, current result and learning.
5. Set `draft: false` when ready. Use `featured: true` and `order` to choose up to four Home entries (lowest order first).
6. Run checks, inspect the page, then commit the content.

The templates use JSON inside YAML-compatible frontmatter for predictable quoting. Ordinary YAML also works; the body is normal Markdown, with no JSX needed.

`cover: "custom"` uses your new project's own title in a reusable typographic cover. No component change is needed. For a real screenshot, add the file to `public/media/` and these frontmatter fields:

```json
"coverImage": "/media/my-project.webp",
"coverAlt": "The project interface showing its main workflow"
```

Use optimized images, ideally around 1200×675. Check screenshots for private information. Paths omit `public`. Missing images fail generated-link checks. Omit both fields to use the typographic cover.

Categories: `Product`, `Tool`, `Experiment`, `Earlier work`. Illustration styles: `custom`, `tuktak`, `scopeproof`, `engjatra`, `choreseed`, `cargotab`, `tanzilbot`. Use custom or a screenshot for a new unrelated project. Lifecycle `status` is separate from publication `draft`.

## Contributions

Copy the contribution template into `src/content/contributions/`. Keep one record per PR, with the original URL/number and an accurate summary.

- `type`: `Resources`, `Code`, `Infrastructure`, `Learning`.
- `relationship`: `Upstream`, `Organization`, `Personal fork`.
- `status`: `Merged`, `Open`, `Closed` (closed without merge).
- `mergedAt`: optional `YYYY-MM-DD`, only for a real merge.
- `event`: optional confirmed event/year label.
- `featured` and `order`: select up to three homepage highlights.

A fork merge is not an upstream acceptance. Resource curation is not a core software feature. Do not duplicate PRs to inflate counts.

## Notes, experience and recognition

Copy the matching template into `src/content/notes/`, `experience/` or `milestones/`.

Notes link to the original published article and use a short excerpt, platform, tags and real date (`YYYY-MM` or `YYYY-MM-DD`). Newest dates appear first. Unpublished DEV drafts should stay draft here too; do not copy an entire external article by default.

Experience and milestones appear on About automatically. Milestone filenames starting with `hacktoberfest` also appear on the Open source timeline. Preserve exact award wording: nomination is not a win, participation is not a prize, and stickers are not PR totals. Omit unknown dates. Keep private evidence outside the public content folder.

## Profile and contact

Edit `src/data/profile.json`. Put only the email you want public in `email`; the Contact page then adds email and copy actions. An empty string keeps them hidden. Do not add a phone field.

Replace `src/assets/tanzil.jpg` to update the photo. Astro generates local optimized WebP variants. The current image is the newly attached patterned-shirt portrait; the older picture is not bundled.

Theme choice stays in the visitor's browser. Content exists once for both themes; no database is required.

## Check and publish

```sh
npm run check
npm run build
npm test
npm run test:browser
```

Review phone/desktop and both themes, then commit through a branch/PR. With Pages set to GitHub Actions, merging to `master` runs checks and deployment. Revert a commit and rebuild to restore earlier content.

Drafts are excluded from pages, lists and sitemap but still need valid frontmatter. `npm run test:authoring` adds temporary published/draft items, verifies rendering, images/status and draft exclusion, cleans up, then rebuilds the original site.
