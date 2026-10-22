# Local verification — Offscript

Verified October 22, 2026. The checks below cover the production build; deployment verification is recorded in the Publication section. A restored new cloud task has not been independently tested.

- Frozen dependency reinstall: `npm ci` passed.
- `npm run check`: 23 files, zero errors, warnings or hints.
- `npm run build`: 14 static HTML pages plus sitemap and local assets.
- `npm test`: 4 generated-link, metadata, private-data and destination-safety checks passed.
- `npm run test:authoring`: temporary project/image/contribution generation, homepage selection, category/status display, sitemap and draft exclusion passed; fixtures removed and original site rebuilt.
- `npm run test:browser`: 27 tests passed. Includes both themes, WCAG A/AA automated checks on representative pages, mobile open-menu accessibility, keyboard/Escape navigation, shareable filters, back navigation, theme persistence, blocked storage, no-JavaScript navigation, 404 recovery and overflow checks at 360/390/768/1024/1440 pixels. A published website contribution is checked for live-site/source/integration destinations and absence of a fabricated PR number; personal-fork infrastructure work retains its separate label.
- `npm audit --omit=dev --audit-level=moderate`: zero reported production vulnerabilities.
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
