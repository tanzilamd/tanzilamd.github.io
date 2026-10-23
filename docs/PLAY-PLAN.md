# Play and corner-surprise implementation plan

## Approved scope

Keep Offscript's identity, owner content and equal activity photos intact. Make the footer's Play invitation a clear, separate card. Give Playground, Drawing pad and Do not press individual static pages, reached by native choice links. Add a fixed corner ✦ button whose small silent surprise happens on the current page. No new packages, accounts, uploads or backend.

## Architecture and experience

- `/play/` contains three illustrated choices; `/play/playground/`, `/play/drawing-pad/` and `/play/do-not-press/` render one activity each. Native back/other-game links support navigation. Preserve old hash bookmarks, including same-document hash changes.
- Keep editable headings/cards/prompts/colors/game and corner messages in `src/data/play.json`, validated during build. Keep public route mapping in `src/lib/play-routes.ts` so editing copy does not change URLs.
- Load game CSS/bootstrap on Play routes only and lazy-import only the current engine. Global corner bootstrap imports its separate effect engine only after a click. Disable controls until initialized; provide retry/unsupported and no-JavaScript messages without breaking navigation.
- Playground: at most 16 shapes; drag/throw, keyboard nudges, gravity, pause, add/reset and Shuffle. Bounded frame steps; stop when settled, offscreen, backgrounded or inactive. Reduced motion supports manual arrangement.
- Drawing: capped high-DPI 4:3 canvas with normalized vectors, colors/brush/eraser/mirror, prompts, keyboard pen, star stamp, Undo/Redo, reversible clear and opaque PNG export. Bound live artwork/history. Validate and recover artwork from the current tab's session on navigation/reload; flush pending saves on exit. Storage restrictions fall back to drawing/export with a reminder. Reload need not preserve full history; PNG is the lasting copy.
- Do not press: stable real button, bounded balloon/flip/confetti/duck/bubble decorations, repeat messages and reset. Replace effects on rapid input, stop them/audio offscreen/backgrounded, and keep sound opt-in. Reduced motion stays static/readable.
- Corner surprise: stable 48px bottom-right control, safe-area spacing, small pointer-transparent decorative stage, polite short feedback and tooltip. Cycle duck/bubbles/stars; at most 12 particles and under three seconds. Never move the actual page, steal focus or make sound. Escape/background/navigation clean up; reduced motion uses static decorations. Hide during gallery/mobile navigation and focused game interaction.
- Footer: identity/copyright, social profiles and Play card in a responsive grid, with reserved lower spacing for the corner control.

## Completion checks

Run check, build, output/content tests, authoring tests and browser tests sequentially where build fixtures are involved. Cover native routes/back/legacy hashes, game controls, touch/keyboard, recovery/blocked/corrupt storage, actual PNG bytes, reduced motion, rapid input, lazy loading, error recovery, dark/light accessibility and 19-route responsive overflow. Inspect real desktop/mobile screenshots in both themes. Sync README, guides, previews and release/verification notes before publishing master, then report actual deployment status. Actual results belong in [verification](VERIFICATION.md).
