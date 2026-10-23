# Play page implementation plan

## Scope and presentation

Add `/play/` as an optional, self-contained break from the portfolio, reached by a footer link. Keep the existing navigation, identity, project priorities, equal activity frames and content intact. Three illustrated choice cards open one workspace at a time; shareable hashes and browser back/forward work. Keep the page within Offscript's dark/light tokens. Controls remain usable at 320px and with keyboard focus.

## Activities

1. **Playground:** bounded, dependency-free 2D shapes; drag/throw, keyboard nudges, gravity, pause/resume, add and reset. Limit shape count. Pause animation when hidden, offscreen, inactive or motion is reduced; let settled shapes sleep. Reduced-motion users can arrange shapes manually.
2. **Drawing pad:** responsive, high-resolution paper canvas; brush palette/size, eraser, undo, reversible clear, mirrored strokes, drawing prompts, keyboard pen controls and a star stamp, PNG download with paper background. Preserve normalized artwork through resizing and activity changes. Bound history/point counts; do not run an idle rendering loop. Drawing stays in memory in the current page; leaving/reloading does not save it.
3. **Do not press:** a stable native button with bounded balloon, upside-down decoration, confetti and duck reactions. Keep the real message readable and announce it politely. Rapid presses replace the previous effect. Reset restores the initial state. Sound is off by default and uses short synthesized notes only after explicit opt-in. Reduced motion shows static reactions and messages.

## Architecture and lifecycle

- Store editable page copy, prompts, palette and reaction messages in `src/data/play.json`.
- Use a route-specific controller and lazy activity imports; never include activity engines in the shared site entry.
- Native links provide discoverable descriptions without JavaScript. Disable game controls until initialization and provide honest no-JavaScript/unsupported-browser messaging.
- Keep activity state while switching, but run only the selected activity. Cancel pointer capture, frames, effects and audio on deactivation, backgrounding or navigation. No backend, tracking, uploads, external assets, persistent drawings or new packages.
- Use canvas only where useful (drawing). Physics uses bounded DOM shapes; surprise effects stay inside their workspace. Never animate or rewrite the actual portfolio.

## Completion checks

Run repository check/build/output/authoring checks, then the browser suite. Add meaningful checks for all three journeys: deep links/back navigation, physics pause/reduced motion, touch dragging, drawing/undo/mirror/resize/export, rapid surprise presses/reset/sound opt-in, keyboard accessibility, no-JavaScript fallback and dark/light/mobile overflow. Verify page-only script loading and inspect real desktop/mobile screenshots. Keep README previews, UI/content documentation, release and verification records in sync before publishing to master; report the actual deployment state.

## Completion record

Implemented and checked on the production preview. The current build has 16 static HTML pages; type checks, six output/content checks, authoring checks and all 62 browser checks passed. Desktop/mobile previews and maintenance instructions are included. See [verification](VERIFICATION.md) for scope and publication status.
