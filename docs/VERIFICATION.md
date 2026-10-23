# Local verification — Offscript

Verified October 23, 2026. The checks below cover the production build; deployment verification is recorded in the Publication section. The publication section retains the earlier launch record; the October 23 content revision has been checked locally as described below.

- Frozen dependency reinstall: `npm ci` passed.
- `npm run check`: 27 files, zero errors, warnings or hints.
- `npm run build`: 15 static HTML pages plus RSS, sitemap and local assets.
- `npm test`: 4 generated-link, metadata, private-data and destination-safety checks passed.
- `npm run test:authoring`: temporary project/image/contribution generation, original and external writing, publication/updated dates, article metadata, XML feed/sitemap, shared activity edits across Home and Activities, and draft exclusion passed; fixtures removed and original site rebuilt.
- `npm run test:browser`: 31 tests passed. Includes both themes, WCAG A/AA automated checks on representative pages, mobile open-menu accessibility, keyboard/Escape navigation, shareable filters, back navigation, theme persistence, blocked storage, no-JavaScript navigation, 404 recovery and overflow checks at 360/390/768/1024/1440 pixels. A published website contribution is checked for live-site/source/integration destinations and absence of a fabricated PR number; personal-fork infrastructure work retains its separate label. New writing checks cover local/external filters, article navigation and dates, plus reading without JavaScript.
- `npm audit --omit=dev --audit-level=moderate`: zero reported production vulnerabilities.
- Manual browser checks: article copy-link returns the canonical URL; desktop/mobile screenshots inspected in dark and light themes. RSS and sitemap parsed as XML.
- `git diff --check`: passed.

## Lighthouse

Earlier mobile lab scores on the production preview, before the profile/recognition content revision (not rerun for that revision):

- performance: 97
- accessibility: 100
- best-practices: 100
- seo: 100

Accessible-name mismatches were corrected and the final Lighthouse report listed no mismatched controls. Lab scores are not field Core Web Vitals. Automated accessibility checks are supplemented by keyboard checks but do not prove full WCAG conformance.

## Publication

Offscript was merged into master and deployed by the GitHub Pages workflow. Build and deploy run 39759013466 succeeded for commit 7d54df1. Live HTTPS requests returned 200 for the homepage, assets, Work, Open source, About, Notes, Contact and the Tuktak story; the old homepage was replaced. Browser interaction tests cover the production preview. External application links were preserved from sources; local portfolio tests do not validate their availability or live AI behavior. The cloud install/start instructions were saved in the environment configuration draft; publishing that environment is separate from website deployment.
