# Game Zone implementation reference

October 24, 2026. Implements the approved expansion with a deliberately compact hub. Actual check results and deployment status belong in [VERIFICATION.md](VERIFICATION.md).

## Shipped scope

- Five scored games: Snake, Dino Run, Aim Trainer, Tic-tac-toe and Stack Tower.
- Three creative breaks: Playground, Drawing pad and Do not press.
- Shared native navigation and stable URLs. New game engines load independently; the portfolio and hub do not request them.
- A single Daily Challenge feature, Random Game and an expandable personal-progress panel. Consistent cards in three/two/one columns, dark/light themes, no autoplay previews or login prompts.

## New games and shared shell

Snake uses a fixed 20×20 board, buffered turns, safe food spawning, wall/body collisions and a slower wrapping Chill mode. Desktop Arrow/WASD, mobile direction buttons and board-only swipe input work together.

Dino Run uses original local dinosaur/obstacle art, fixed-step jumping, capped acceleration and reachable obstacle spacing. Tap/Space/Jump, Classic/Chill and seconds-survived scores keep it simple. Flying/ducking mechanics were omitted to keep phone controls clear.

Aim Trainer offers 30-second pointer rounds and untimed keyboard practice. Hits, misses and accuracy are explicit; targets stay clear of edges and have a minimum 52px touch size. Mouse/touch/mixed/practice records are separate.

The shared shell supplies ready/countdown/playing/paused/results states, mode locking, start/replay/reset, same-seed friend sharing and clipboard/manual fallback. Canvas backing stores and frame deltas are bounded. Paused/hidden/offscreen/destroyed games stop drawing; resume is intentional. Reduced motion removes decoration and defaults Snake/Dino to Chill; essential game movement remains user-started.

## Daily challenge and progress

- Rotate only the three new games. Stack retains its existing modes rather than adding another configuration to its UI.
- Browser date calculation uses Asia/Dhaka. The hub updates at the next local midnight and on return to a visible page; no daily build, deployment or manual edit is needed.
- Date, game and rules version define a reproducible seed. Daily mode and goals are fixed. Historical daily links remain playable but do not extend today's streak.
- Repeat completions count once per date. Retain current/longest daily chain independently of the bounded date history. Tic-tac-toe human win streaks are separate by Easy/Hard; a draw/loss breaks consecutive wins.
- Personal records retain bounded recent history and separate game/mode/input/daily buckets. Eight local achievements have plain requirements. Preserve old game stores and expose earlier tower bests.
- Invalid or unavailable storage falls back safely to page memory. No account, upload, cross-device synchronization or verified public ranking is claimed.

## Friend play and future scope

Existing same-screen Tic-tac-toe remains. Finished new-game rounds can share a result and link to the same seed/mode; daily links preserve their date. This is asynchronous friendly play, not realtime multiplayer. Untimed practice has no competitive share action. Random Game chooses among scored games and opens a ready screen, avoiding its previous random choice when possible.

Shared leaderboards and separate-device online rooms remain a later backend project. The frontend can stay on GitHub Pages; a shared service introduces score validation, quota and maintenance decisions. No unfinished controls advertise those deferred features.

## Maintenance and acceptance

Card copy, groups, daily goals and achievement labels live in validated `src/data/play.json`. IDs and actual game/achievement rules are code; changing a label does not change its threshold. Pure rules, seed/date helpers and progress functions support meaningful deterministic tests. The shared shell owns lifecycle/input cleanup, while each engine owns only its game.

Before publication: run check, build, rule/output tests, authoring fixtures and browser tests; keep authoring and browsers sequential. Review actual mobile/desktop screenshots in both themes, all-route overflow, real touch/keyboard play, collisions/timers/replay, storage failures, old-score compatibility, lazy chunks, daily rollover and individual share cards. Sync README, guides and previews with implementation. Publish through the checked master workflow and report deployment status accurately.
