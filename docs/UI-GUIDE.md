# Offscript UI guide

The portfolio pairs calm editorial layouts with distinct project artwork. Keep the person and the work easy to understand. Use a clear hierarchy rather than adding more decorative labels, arrows or panels.

## Shared design rules

`src/styles/global.css` owns both themes, typography, spacing, interactive states and responsive layouts. Colors come from shared variables (`--bg`, `--surface`, `--surface-raised`, `--text`, `--muted`, `--quiet`, `--line`, `--accent`). Override theme tokens rather than maintaining separate content or adding hardcoded page colors. Project artwork uses its own deliberate palette.

The content container has a 1160px maximum width. Section spacing uses `--space-section`; mobile reduces it. Manrope is the interface/body font, Georgia is the editorial accent and essay font, and Hind Siliguri supports Bangla project artwork. Fonts are self-hosted.

- Primary and secondary buttons share a minimum 50px height, 8px radius and consistent padding.
- Icon buttons, navigation, filters and action links use comfortable targets; ordinary inline article links remain inline.
- Hover states change color/surface or a small arrow position; avoid layout shifts. Keyboard focus remains visible. Reduced-motion preferences disable transitions and smooth scrolling.
- Project covers share an aspect ratio and one interactive arrow. Portraits have no decorative controls. Illustrations are identified as artwork on detail pages.
- Cards and panels use shared borders/radii. Recognition emphasizes the award wording and explanation. Activities emphasize readable experience descriptions rather than decorative illustration panels.
- Dark is the default. Light uses warm paper surfaces and a terracotta accent; the same content and hierarchy work in both.

## Components and page responsibilities

| Component | Responsibility |
| --- | --- |
| `Layout.astro` | Main/mobile/no-JS navigation, theme setup, shared metadata, footer and bounded Home intro bootstrap. Activities is part of all navigation variants. Contact omits the repeated footer contact invitation. |
| `ProjectCard.astro` | Reusable cover, category, title and summary. Heading level 3 on Home; level 2 in the Work list. |
| `Cover.astro` | Project identity artwork or an owner-supplied image. No fake product screenshot claims. |
| `RecognitionList.astro` | Same award content as a Home grid or About list. |
| `WritingCard.astro` | Shared native/external publication, dates, reading time and destination labels. |
| `Filters.astro` | Accessible button group; `site.ts` handles URL state, count announcements and empty states. Hidden without JS so all content remains visible. |
| `ActivityPhoto.astro`, `ActivityGallery.astro` | Shared activity photos, captions, demo labels and a selected Home preview, driven by each activity's `gallery` data. |
| `PhotoViewer.astro` | One native dialog for the activity photos, with contain-fit images, caption, optional metadata, counter and controls. |
| `site.ts` | Theme persistence, mobile disclosure/Escape/outside click, shareable filters, copy feedback and photo-viewer interactions. |
| `motion.ts` | Once-per-tab Home typing, lightweight desktop heading fades and native-article reading progress. |
| `play.astro`, `play/[activity].astro`, `PlayWorkspace.astro`, `play.css` | Play landing and separate static game pages, responsive toolbars and isolated game surfaces. |
| `scripts/play/` | Page-only bootstrap/legacy hash redirects and lazy playground/drawing/surprise controllers with explicit active/cleanup lifecycles. |
| `PocketSurprise.astro`, `pocket.ts`, `fun/pocket-effects.ts` | Fixed corner control and on-demand, bounded same-page surprises. |
| `lib/play.ts`, `data/play.json` | Build validation and the single editable source for Play copy, palette, prompts and reactions. |

## Play page

The footer uses three clear groups: identity/copyright, social profiles and a bordered **Take a little break** card. Desktop aligns these in a grid; tablet/mobile reflow them without interleaving the card with metadata. Bottom spacing leaves room for the fixed corner button. Contact still omits the repeated contact invitation.

`/play/` is a quiet illustrated choice page. Native links open `/play/playground/`, `/play/drawing-pad/` and `/play/do-not-press/`; each game renders only its own controls, a back link and links to the other two games. Keep Play out of the primary navigation and Home hero. Only Play routes load game CSS/bootstrap, and only the current engine is imported. Old hash bookmarks and same-document hash changes redirect to their corresponding route. Without JavaScript, descriptions, navigation and a clear fallback remain readable; game controls stay disabled until initialization. Unsupported activity initialization offers retry and links to other games.

Physics uses at most 16 DOM shapes, bounded frame steps, batched transforms and sleeping settled objects. The loop stops when paused, offscreen, in a background tab, inactive or motion is reduced. In manual/reduced-motion mode, drag and keyboard positioning remain available. Shuffle redistributes existing shapes and gives them a bounded impulse; manual mode changes the arrangement without animation. Repeated resets remove old listeners and shapes. Drag capture ends on pointer cancellation/deactivation; additional fingers do not terminate the active pointer.

Drawing stores bounded vector strokes in logical 1000×750 coordinates and replays them on a capped, device-scaled 4:3 canvas. Resizing does not distort or clear the artwork. There is no idle rendering loop. Keep the paper light in both themes so ink colors and PNG exports stay consistent. Undo/Redo can reverse strokes and clears. New drawing discards redo history. Snapshots share finished strokes and are bounded by entry/point budgets. Brush, eraser and mirror settings apply to each new stroke. Keyboard users can focus the canvas and use arrows/Space/Escape, or add a star with a native button. Versioned, bounded vector artwork is saved to tab-session storage on completed changes and flushed on deactivation/navigation. Restore validates coordinates, colors, sizes, types and limits before replay. Normal same-tab navigation/reloads recover the drawing; blocked/quota/corrupt storage falls back to working drawing/export with a visible reminder. Reload preserves artwork, not the full undo history; PNG remains the lasting-copy option. PNG exports include an opaque paper background.

The surprise button always stays in place. Animate only its face/decorations, never the actual portfolio or readable status message. Effects are bounded and replaced by rapid presses; offscreen/inactive/backgrounded states cancel them. Reduced-motion users get static reactions and messages. Sound is off initially, uses brief synthesized notes after opt-in and is stopped on deactivation. No drawing uploads, accounts, analytics or new dependencies are involved. Editable copy is validated during build; keep activity IDs and supported effect names stable.

The global 48px **✦** corner control imports its effect engine only on demand. A pointer-transparent, viewport-bounded decorative stage cycles duck/bubbles/stars without changing the real page or stealing focus. Rapid clicks replace effects; at most 12 particles run for under three seconds, with Escape/background/navigation cleanup. No audio or idle rendering loop. Reduced-motion changes cancel running effects; reduced motion uses static decorations. Hide the control behind an open gallery/mobile menu and while game controls or the play surface have focus. Tooltips, polite feedback and focus states use shared theme tokens. Pocket copy lives in the same Play JSON source.

Inspect every workspace at mobile widths in both themes, including focus, disabled states, range/checkbox controls, actual touch input, resizing, exported PNGs and rapid repeated actions. README Play previews live in `docs/images/`.

## Motion

- On the first Home visit in a browser tab, a 700ms wordmark underline and portrait entrance accompany a single, roughly one-second typing pass. There is no blocking splash screen, loading counter or repeating deletion loop. `sessionStorage` skips the intro on later visits; unavailable storage skips it safely.
- Both headline strings still come from `profile.json`. Complete text and its accessible heading name are present in the initial HTML. The animation clips letters visually without changing the DOM text or its reserved space. Font measurements preserve proportional kerning. Interaction, scrolling or resize ends the intro immediately; a 2.2-second bootstrap deadline reveals the whole headline if the enhancement script fails.
- On fine-pointer/hover devices, only short section headings and the open-source introduction fade from 70% opacity for 220ms, once when entering view; at most two fades run together. There is no scroll-driven translation or animation on project/photo grids, recognition, full text sections or writing cards. Touch devices keep sections static. Content is never hidden while waiting for an observer or JavaScript. Focus skips/cancels an entrance on the focused heading. Do not add persistent will-change layers or a JavaScript scroll controller.
- Buttons/project artwork move only a few pixels; hover transforms require a fine pointer. The gallery animates decoded images and their captions for 220ms. Rapid navigation retains the latest selection, and closing cancels outstanding animations.
- Reduced-motion preferences suppress CSS motion and typing; changing the preference during an animation cancels the active JavaScript effects too. No-JavaScript navigation, complete headlines, articles and photo links remain usable. Print shows the full text without the caret/progress line.
- Native articles get a fixed, noninteractive 3px progress line based on the prose position and length. It is hidden without JavaScript and excluded from screen-reader announcements. Progress updates use a passive scroll listener and one scheduled animation frame, with cached prose measurements refreshed only on resize, font readiness or prose size changes. Featured writing and article openings share a short accent rule and editorial typography.

## Review shared UI changes

Check every route: Home, Projects, all six project detail pages, Open source, About, Activities, Writing, the native essay, Contact, Play, all three game pages and 404. Inspect desktop and mobile in both themes. The browser suite covers automated accessibility on representative pages and each active Play workspace, plus overflow and clipped project titles across all 19 HTML routes at 320, 360, 390, 768, 800, 1024 and 1440px. README previews live in `docs/images/`; refresh them when the design changes.

Also check the following manually when relevant:

1. Long titles, email wrapping, cover text, column alignment and body readability.
2. Primary/secondary buttons, links, filters, active navigation, keyboard focus and hover states.
3. Mobile menu opening, Escape, outside click and resizing to desktop; no duplicate links.
4. Email/article copy success and failure feedback; canonical article URL, not the preview URL.
5. JavaScript disabled, blocked storage, reduced motion, and browser zoom.
6. README/content guide/template descriptions still match the current implementation.

Activity thumbnails crop to a consistent 3:2 frame; the viewer contains the whole image. Current galleries use owner-supplied WebP photographs, resized to at most 1600px wide; keep future uploads similarly optimized. Photos span the activity section below its title/description. All multi-photo galleries share equal-width, top-aligned 3:2 frames in two columns, including galleries with an odd number of photos. Captions sit below each frame; mobile presents every photo sequentially in one column. One photo has a restrained maximum width, and an empty gallery renders nothing. Array order controls photo order, with no separate layout setting to maintain. Photos have no separate gallery heading, thumbnail count or page-wide notice. Keep the small Demo label while generated placeholders remain; the viewer retains its photo counter. Replace the source, alt text and captions and set `demo: false` only for real event photos. The Home preview links to its activity section; it does not open a separate Home dialog. Native `<dialog>` makes the background inert; explicit Tab/Shift+Tab wrapping keeps keyboard focus on the viewer controls, and closing restores the triggering link. Arrow keys and previous/next controls browse the published photos; plain image links remain functional without JavaScript. Check the single-photo/empty-gallery states when changing gallery data.

Automated accessibility results do not establish complete WCAG conformance. Record actual checks in `docs/VERIFICATION.md`, and keep historical Lighthouse scores explicitly separate from current results.
