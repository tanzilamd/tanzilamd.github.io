# Local verification — Offscript

Verified October 22, 2026. These results describe the local production build, not a deployed website or a restored new cloud task.

- Frozen dependency reinstall: `npm ci` passed.
- `npm run check`: 22 files, zero errors, warnings or hints.
- `npm run build`: 14 static HTML pages plus sitemap and local assets.
- `npm test`: 4 generated-link, metadata, private-data and destination-safety checks passed.
- `npm run test:authoring`: temporary project/image/contribution generation, homepage selection, category/status display, sitemap and draft exclusion passed; fixtures removed and original site rebuilt.
- `npm run test:browser`: 26 tests passed. Includes both themes, WCAG A/AA automated checks on representative pages, mobile open-menu accessibility, keyboard/Escape navigation, shareable filters, back navigation, theme persistence, blocked storage, no-JavaScript navigation, 404 recovery and overflow checks at 360/390/768/1024/1440 pixels.
- `npm audit --omit=dev --audit-level=moderate`: zero reported production vulnerabilities.
- `git diff --check`: passed.

## Lighthouse

Mobile lab scores on the production preview:

- performance: 97
- accessibility: 100
- best-practices: 100
- seo: 100

Accessible-name mismatches were corrected and the final Lighthouse report listed no mismatched controls. Lab scores are not field Core Web Vitals. Automated accessibility checks are supplemented by keyboard checks but do not prove full WCAG conformance.

## Publication

No GitHub push, Pages settings change or website deployment was performed. The workflow is prepared for master and documented in README. External application links were preserved from sources; local portfolio tests do not validate their availability or live AI behavior. The cloud install/start instructions were saved in the environment configuration draft; publishing that environment is separate from website deployment.
