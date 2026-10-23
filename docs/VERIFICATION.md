# Local verification — Offscript

Verified October 23, 2026. The checks below cover the production build; deployment verification is recorded in the Publication section. The publication section retains deployment records; the October 23 UI refinement was verified on the local production build as described below.

- Existing locked dependency installation was reused for this UI revision; the earlier frozen reinstall (`npm ci`) passed. No dependencies changed.
- `npm run check`: 27 files, zero errors, warnings or hints.
- `npm run build`: 15 static HTML pages plus RSS, sitemap and local assets.
- `npm test`: 4 generated-link, metadata, private-data and destination-safety checks passed.
- `npm run test:authoring`: temporary project/image/contribution generation, original and external writing, publication/updated dates, article metadata, XML feed/sitemap, shared activity edits across Home and Activities, and draft exclusion passed; fixtures removed and original site rebuilt.
- `npm run test:browser`: 31 tests passed. Includes both themes, WCAG A/AA automated checks on representative pages, mobile open-menu accessibility, keyboard/Escape navigation, shareable filters, back navigation, theme persistence, blocked storage, no-JavaScript navigation, 404 recovery and overflow and clipped-cover-title checks on all 15 HTML routes at 320/360/390/768/800/1024/1440 pixels. A published website contribution is checked for live-site/source/integration destinations and absence of a fabricated PR number; personal-fork infrastructure work retains its separate label. New writing checks cover local/external filters, article navigation and dates, plus reading without JavaScript.
- Earlier production dependency audit (`npm audit --omit=dev --audit-level=moderate`): zero reported vulnerabilities. Dependencies were not changed or re-audited for the UI revision.
- Manual browser checks: Activities navigation/active state, email copy and canonical article-link copy, reduced-motion fallback, all six detail-cover titles and desktop/mobile screenshots in both themes. A clipped Tuktak title at 320px was corrected. README includes fresh dark/light previews. Relative documentation links resolve. RSS and sitemap were parsed as XML for the preceding content revision.
- `git diff --check`: passed.

## Lighthouse

Earlier mobile lab scores on the production preview, before the profile/recognition content revision (not rerun for that revision):

- performance: 97
- accessibility: 100
- best-practices: 100
- seo: 100

Accessible-name mismatches were corrected and the final Lighthouse report listed no mismatched controls. Lab scores are not field Core Web Vitals. Automated accessibility checks are supplemented by keyboard checks but do not prove full WCAG conformance.

## Publication

The October 23 writing/content update deployed successfully in run [39986183947](https://github.com/tanzilamd/tanzilamd.github.io/actions/runs/39986183947) for commit `87f4134`. The UI revision uses the same checked `master` deployment workflow; consult Actions for its deployment status.

Offscript was merged into master and deployed by the GitHub Pages workflow. Build and deploy run 39759013466 succeeded for commit 7d54df1. Live HTTPS requests returned 200 for the homepage, assets, Work, Open source, About, Notes, Contact and the Tuktak story; the old homepage was replaced. Browser interaction tests cover the production preview. External application links were preserved from sources; local portfolio tests do not validate their availability or live AI behavior. The cloud install/start instructions were saved in the environment configuration draft; publishing that environment is separate from website deployment.
