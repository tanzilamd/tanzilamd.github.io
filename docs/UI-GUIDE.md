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
| `Layout.astro` | Main/mobile/no-JS navigation, theme setup, shared metadata, footer. Activities is part of all navigation variants. Contact omits the repeated footer contact invitation. |
| `ProjectCard.astro` | Reusable cover, category, title and summary. Heading level 3 on Home; level 2 in the Work list. |
| `Cover.astro` | Project identity artwork or an owner-supplied image. No fake product screenshot claims. |
| `RecognitionList.astro` | Same award content as a Home grid or About list. |
| `WritingCard.astro` | Shared native/external publication, dates, reading time and destination labels. |
| `Filters.astro` | Accessible button group; `site.ts` handles URL state, count announcements and empty states. Hidden without JS so all content remains visible. |
| `site.ts` | Theme persistence, mobile disclosure/Escape/outside click, shareable filters and copy feedback. |

## Review shared UI changes

Check every route: Home, Projects, all six project detail pages, Open source, About, Activities, Writing, the native essay, Contact and 404. Inspect desktop and mobile in both themes. The browser suite covers automated accessibility on representative pages, plus overflow and clipped project titles across all 15 HTML routes at 320, 360, 390, 768, 800, 1024 and 1440px. README previews live in `docs/images/`; refresh them when the design changes.

Also check the following manually when relevant:

1. Long titles, email wrapping, cover text, column alignment and body readability.
2. Primary/secondary buttons, links, filters, active navigation, keyboard focus and hover states.
3. Mobile menu opening, Escape, outside click and resizing to desktop; no duplicate links.
4. Email/article copy success and failure feedback; canonical article URL, not the preview URL.
5. JavaScript disabled, blocked storage, reduced motion, and browser zoom.
6. README/content guide/template descriptions still match the current implementation.

Automated accessibility results do not establish complete WCAG conformance. Record actual checks in `docs/VERIFICATION.md`, and keep historical Lighthouse scores explicitly separate from current results.
