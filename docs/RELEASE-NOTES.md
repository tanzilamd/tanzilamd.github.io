# Offscript implementation notes

## Included

Responsive dark/light portfolio; new owner-supplied portrait; four selected projects and two earlier-work stories; eleven selected open-source records; About, Activities, Writing, Contact and 404; content templates; sitemap/metadata; self-hosted fonts; optimized images; GitHub Pages workflow; build, authoring, privacy/link and browser/accessibility checks.

## October 24 activity photo optimization

- Replaced the seven large gallery JPG/JPEG files with proportionally resized WebP images, at most 1600px wide. Combined image payload fell from 28.89 MB to 1.01 MB (96.5% smaller); the Home stage image fell from 13.49 MB to 104 KB. Updated gallery references so Home, thumbnails and the full-image viewer share the optimized assets.
- Preserved all existing captions and gallery ordering. Added descriptive alternative text based on the photos.
- Removed the unused `n2.jpg`. Original uploads remain in Git history; no article/project routes or gallery ordering changed.
- Updated README, photo instructions, credits and gallery previews to reflect the owner-supplied photographs rather than the earlier demos.

## October 23 gallery presentation cleanup

- Removed the page-wide demo preview notice, repeated “Selected photos” headings and thumbnail counts at the owner’s request. Photos now follow each activity’s description directly; captions, small Demo labels and the viewer counter remain.
- Preserved accessible gallery group labels, full-image navigation and the content-only photo update workflow. Refreshed the README gallery preview and related guides.

## October 23 activity galleries

- Added data-driven activity galleries with captions, optional event/year/role, and a single selected Home preview. Activity information and images still share one content record.
- Added a native full-image dialog with previous/next controls, arrow keys, Escape, backdrop closing, focus restoration and mobile layouts. Without JavaScript, thumbnails remain direct image links.
- Used three local, optimized AI-generated demo scenes for debate, theatre and community learning at the owner's request. Every thumbnail and viewer image is explicitly labelled Demo. No event dates or participation claims were invented.
- Updated the activity template, Bengali photo-replacement instructions, README previews, UI guide and credits together.

## October 23 UI refinement

- Rebuilt shared spacing, type scales, surfaces, borders and responsive rules; retained dark teal/coral and warm light/terracotta themes. Removed obsolete styles and decorative controls.
- Unified project-card proportions and heading hierarchy; simplified illustrative covers and added matching primary/secondary buttons.
- Made Activities discoverable in desktop/mobile/no-JavaScript navigation. Replaced its large decorative panels with readable title/body layouts.
- Simplified contribution previews, recognition cards, writing metadata, contact cards and footer hierarchy. Contact no longer repeats the footer contact invitation.
- Updated README, the content guide, UI documentation and repository working instructions together. Content files and existing article/project URLs are preserved.

## October 23 content and writing update

- Added native Markdown posts alongside external publications, with publication/written/updated dates, reading time, article metadata, RSS, filters and a responsive long-form reader in both themes.
- Published the owner-provided “Grandma’s Xbox” with 2024 university-admission context and a separate site publication date. Historical statements remain in the essay; they were not converted into new profile claims.
- Moved About bio and social/contact identity into the shared profile file, preserving the owner’s latest master-branch bio edit. Activities now use one content record for Home and Activities.
- Updated the Peace Prize nomination to children’s technology education. Volunteering now includes more than five years with Bangladesh Scouts and blood donation campaigns. Learn with Tanzil now says more than 25 videos. Removed the organization and contribution requested by the owner.
- Contact/footer social links are limited to GitHub and LinkedIn; external DEV publications remain available under Writing.
- Added a Bengali GitHub editing manual and native-post/activity templates. Direct master edits continue to run the existing deployment checks.

## Editorial decisions

- No phone, original application PDF, exact address or application IDs is public. The owner explicitly supplied and authorized publication of the personal essay “Grandma’s Xbox”; its childhood and family narrative is preserved within that historical essay.
- The owner-approved public contact email is tanzilahmed.mail@gmail.com. Contact provides a mail link and copy action alongside GitHub and LinkedIn. No pretend contact form or unapproved CV is shown.
- Experience is historical and no unconfirmed current dates/title were added.
- The owner confirmed Completionist / three milestones. A public badge URL can be added later. The sticker collection is not displayed without a confirmed platform/source.
- The introduction presents learning and exploration across several interests. Plain section headings and specific experience replace the earlier metaphor-heavy copy.
- Awards and nomination are listed separately from open-source completion/participation milestones. Debate results, volunteer recognition and activity details come from the owner-supplied background document; missing years are omitted. No original source document is published.
- The owner corrected Phulkuri recognition to 2021 / 300+ volunteers and theatre experience to five stage performances, with no choreography claim. The A+ Peitho team count is omitted.
- Tabbycat website authorship is now supported by `tanzilamd/tc`, its integrated page’s “Designed by Tanzil Ahmed” credit, and upstream commit `aff7c01965bc775d38e0575b5176753b2e812624` adding that repository at `/tabbycat/`. It is featured as published website work, without inventing a merged PR. Translation work remains unverified and is not claimed. The separate container workflow retains its personal-fork label.
- Project covers are illustrations, not product screenshots. External app uptime and live AI operation are not certified by portfolio tests.
- ScopeProof links to the exact DEV article found in its source. Choreseed's unpublished article is excluded and its paused public live AI state is stated. AI assistance is credited in the relevant project stories.
- LinkedIn/Facebook page content was blocked during research; links are retained where appropriate without inventing extra profile facts.

The site uses the GitHub Pages Actions workflow on `master`. See the final task report for checks actually executed; automated checks alone do not prove complete WCAG conformance.
