# Local verification — Offscript

Verified October 23, 2026. The checks below cover the production build; deployment verification is recorded in the Publication section. The publication section retains deployment records; the October 23 UI, activity-gallery and gallery presentation revisions were verified on the local production build as described below.

- Existing locked dependency installation was reused for this UI revision; the earlier frozen reinstall (`npm ci`) passed. No dependencies changed.
- `npm run check`: 30 files, zero errors, warnings or hints.
- `npm run build`: 15 static HTML pages plus RSS, sitemap and local assets.
- `npm test`: 4 generated-link, metadata, private-data and destination-safety checks passed.
- `npm run test:authoring`: temporary project/image/contribution generation, original and external writing, publication/updated dates, article metadata, XML feed/sitemap, shared activity/photo edits across Home and Activities, caption/event/year/role metadata, selected Home photo previews, and draft exclusion passed; fixtures removed and original site rebuilt.
- `npm run test:browser`: 36 tests passed. Includes both themes, WCAG A/AA automated checks on representative pages, mobile open-menu accessibility, keyboard/Escape navigation, shareable filters, back navigation, theme persistence, blocked storage, no-JavaScript navigation, 404 recovery and overflow and clipped-cover-title checks on all 15 HTML routes at 320/360/390/768/800/1024/1440 pixels. A published website contribution is checked for live-site/source/integration destinations and absence of a fabricated PR number; personal-fork infrastructure work retains its separate label. New writing checks cover local/external filters, article navigation and dates, plus reading without JavaScript. Gallery checks cover both-theme modal accessibility, previous/next and arrow-key navigation, forward/reverse Tab containment, Escape, focus restoration, mobile fit/backdrop/close controls, Home-to-gallery navigation and no-JavaScript image links. Gallery tests derive photo counts/destinations from published content so replacing demo images does not require test edits.
- Earlier production dependency audit (`npm audit --omit=dev --audit-level=moderate`): zero reported vulnerabilities. Dependencies were not changed or re-audited for the UI revision.
- Manual browser checks: Activities navigation/active state, email copy and canonical article-link copy, reduced-motion fallback, all six detail-cover titles and desktop/mobile screenshots in both themes. A clipped Tuktak title at 320px was corrected. README includes fresh dark/light Home previews and an activity-gallery preview. The three demo images are local, optimized WebP files (roughly 258 KiB combined), explicitly marked as fictional placeholders. Lazy images were decoded and allowed to paint before screenshot review. Relative documentation links resolve. RSS and sitemap were parsed as XML for the preceding content revision.
- Gallery presentation cleanup: removed the page-wide notice and repeated thumbnail headings/counts; retained accessible group labels, Demo badges, captions and the viewer counter. README gallery image and desktop/mobile previews were refreshed in both themes.
- `git diff --check`: passed.

## Lighthouse

Earlier mobile lab scores on the production preview, before the profile/recognition content revision (not rerun for that revision):

- performance: 97
- accessibility: 100
- best-practices: 100
- seo: 100

Accessible-name mismatches were corrected and the final Lighthouse report listed no mismatched controls. Lab scores are not field Core Web Vitals. Automated accessibility checks are supplemented by keyboard checks but do not prove full WCAG conformance.

## Publication

The UI refinement deployed successfully in run [39990713121](https://github.com/tanzilamd/tanzilamd.github.io/actions/runs/39990713121) for commit `be88f85`. The gallery update subsequently deployed in run [39998247627](https://github.com/tanzilamd/tanzilamd.github.io/actions/runs/39998247627) for commit `72cfb73`. The gallery presentation cleanup uses the same master workflow; consult Actions for its deployment status.

The October 23 writing/content update deployed successfully in run [39986183947](https://github.com/tanzilamd/tanzilamd.github.io/actions/runs/39986183947) for commit `87f4134`. The UI revision uses the same checked `master` deployment workflow; consult Actions for its deployment status.

Offscript was merged into master and deployed by the GitHub Pages workflow. Build and deploy run 39759013466 succeeded for commit 7d54df1. Live HTTPS requests returned 200 for the homepage, assets, Work, Open source, About, Notes, Contact and the Tuktak story; the old homepage was replaced. Browser interaction tests cover the production preview. External application links were preserved from sources; local portfolio tests do not validate their availability or live AI behavior. The cloud install/start instructions were saved in the environment configuration draft; publishing that environment is separate from website deployment.
