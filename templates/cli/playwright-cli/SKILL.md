---
name: playwright-cli
description: Use Playwright CLI for contained localhost browser checks from the DeepSeek CLI, saving snapshots and screenshots to disk for efficient review and Chan's visual sign-off. Replaces the retired DeepSeek Playwright MCP.
---

# Playwright CLI (DeepSeek CLI)

Use the installed `playwright-cli` (`@playwright/cli`, pinned) rather than the retired DeepSeek
Playwright MCP. The MCP streamed accessibility trees into context at roughly 4x the tokens of the
CLI form and ran on an unpinned `npx -y @latest`; the CLI keeps both costs down and is contained by
the `playwright-guard` PreToolUse hook.

The guard allows browser navigation only to `localhost` and `127.0.0.1`. Never work around a guard
denial. File-chooser actions (`upload`, `drop`) are blocked. If a URL is not local, or an action
needs a file chooser, stop and ask Chan instead of changing the command.

## Disk-first workflow

1. Open a named session: `playwright-cli -s=<name> open http://127.0.0.1:<port>/`.
2. Save a snapshot to disk: `playwright-cli -s=<name> snapshot --filename=<absolute-or-workspace-path>.yaml`.
3. Read that snapshot file with a bounded local read (raw-read / ctx_read); use its refs for
   `click`, `fill`, and other actions. Do not carry full accessibility trees in conversation context.
4. Save a screenshot for Chan: `playwright-cli -s=<name> screenshot --filename=<path>.png --full-page`.
   Every screenshot saves to a file and is reported **AWAITING HIS LOOK**; you never claim visual
   verification. Chan's eyes are the only visual gate; your own inspection is evidence, not sign-off.
5. Close the named session when finished: `playwright-cli -s=<name> close`.

Use a unique session name per check and preserve screenshots/snapshots as artifacts (a gitignored
local path, e.g. `.playwright-cli/` in a checkout). This is the operational home for the DeepSeek
CLI workflow; the kit's tool-playbook is the state pointer.
