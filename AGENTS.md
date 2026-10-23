# Working on this portfolio

- The publishing branch is `master`. Fetch and inspect `origin/master` before editing or pushing; preserve the owner's direct edits. Never rewrite published history.
- Keep the full project in sync with the change: implementation, README, its UI screenshots when the design changes, relevant content/UI guides, templates, and release/verification notes. State only checks actually run; label older measurements as historical.
- Content belongs in `src/data/profile.json` or the relevant `src/content/` item. Render repeated information from that source rather than duplicating it in page components. Keep existing article/project URLs stable.
- Preserve owner-approved facts, project priorities, the current portrait and original essay text. Never introduce a phone number, private source PDF, address or application IDs.
- UI changes should preserve the Offscript identity while improving clarity. Use shared theme/spacing tokens, consistent interactive states and readable mobile text. Check dark/light, keyboard, no-JavaScript essentials, reduced motion and responsive layouts.
- Run checks appropriate to the change. For shared UI changes: `npm run check`, `npm run build`, `npm test`, `npm run test:authoring`, then `npm run test:browser`. Authoring and browser checks must run sequentially. Review actual desktop/mobile screenshots as well as automated results.
- Keep the GitHub Pages workflow's checks. Report deployment status accurately; a pushed commit is not evidence of a completed deployment.
