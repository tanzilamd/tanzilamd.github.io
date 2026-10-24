# Games, surprises and footer implementation plan

Current expansion: see [Game Zone implementation plan](GAME-ZONE-PLAN.md) for Snake, Dino Run, Aim Trainer, daily challenges and local progress. The sections below describe the earlier five-activity revision.

## Scope

Add polished Tic-tac-toe and Stack Tower games to the existing Play area, expand silent ✦ effects across the visible screen with no text, and replace the boxed footer card with an open layout. Preserve owner content, media/captions, Offscript themes, existing URLs and the three original activities. No new packages, backend, accounts or uploads.

## Routes and editable content

Five static routes are mapped in `src/lib/play-routes.ts`: Tic-tac-toe, Stack Tower, Playground, Drawing pad and Do not press. Highlight the two new games on `/play/`, render only the selected activity, and keep native back/other-game navigation plus legacy hashes. Keep headings/card copy, drawing palette/prompts, Do not press messages and the corner button's accessible label in validated `src/data/play.json`. Remove corner message/tooltip UI. Load each engine only on its own page; global effects load only after a click.

## Game behavior

- Tic-tac-toe: computer Easy/Hard, same-screen two-player, choose X/O, native accessible board/arrow navigation, clear turns/results, SVG winning line and New round. Hard uses cached minimax, tested against every legal human continuation. Cancel stale timers on settings/new-round/navigation/backgrounding. Record each result once. Keep Easy/Hard/local scores separate; computer win/loss follows the player across side changes. Validate and bound local storage; blocked storage falls back to the visit.
- Stack Tower: tap/click/Space/Enter to drop, accurate overlap trimming and perfect snaps, width recovery after three perfect landings, increasing challenge, per-pace best and pause/restart. Chill/Classic offer timing challenges; Step mode uses Left/Right with no timer and is the reduced-motion default. Keep scores/status/control instructions in DOM; announce manual alignment. Preserve mobile canvas scrolling and reject swipes/canceled pointers. Pause offscreen/backgrounded and wait for explicit resume. Bound high-DPI drawing, camera/history/pieces and frame deltas; stop idle animation. Pure rules make alignment, timing, loss and long-run bounds independently testable.
- Preserve existing Playground, drawing/session recovery/export and Do not press behavior.

## Corner effects and footer

A stable 48px ✦ control creates no visible text or tooltip. A viewport-sized, pointer-transparent overlay spreads three ducks or bounded bubbles/stars for about 5.5 seconds (at most 28 particles, 20 on mobile). Reduced motion uses static decorations. Repeat clicks replace effects; Escape/resize/background/navigation/game/modal focus clears them. Never move the portfolio or intercept input/audio.

Use open contact/Play typography in two columns, followed by a fine separator and compact identity/copyright/social row. Stack invitations cleanly on mobile and reserve lower clearance for the corner control. Contact omits the repeated contact invitation.

## Completion

Run check, build, output/content/rule tests, authoring tests, then browser tests; never run authoring fixtures alongside browsers. Check both themes, 21-route responsive overflow, native/no-JS navigation, touch/keyboard, scoring/replay/settings, stale turns, storage failure, lazy loading, reduced motion and lifecycle cleanup. Review real desktop/mobile screenshots and sync README/guides/previews/release/verification notes before publishing master. Report actual deployment status; actual check results belong in [verification](VERIFICATION.md).
