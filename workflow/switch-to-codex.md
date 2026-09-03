# Switch to Codex — second hands, with DeepSeek rollback intact

Use this only on Chan's explicit GO. Codex is a second pair of hands beside the DeepSeek CLI,
not a silent replacement. It uses Chan's own free-month account; never a client account or a
client-funded account unless Chan expressly rules on that cutover first.

## What changes

- The DeepSeek money meter and Manila peak windows are off for Codex; Lean Ctx stays on for
  ordinary exploration and the kit stays lean.
- Codex has image understanding, but Chan still signs off every screen after seeing the shot.
- Claude Code hooks do not follow the agent. Codex uses its guarded-Bash launcher and each clone's
  byte-identical Git `pre-push` gate; project-local completion evidence uses `.codex/` hooks.
- DeepSeek remains available as the rollback hand and stays blind, with screenshot-to-file handoff.

## Cutover

1. Confirm the account condition and that Chan wants Codex as a second hand. Select the model in
   Codex's picker (normally gpt-5.6-terra, medium); do not hand-edit a model pin.
2. Trust the intended project, then start a new Codex thread from its root. Prove that global and
   project `AGENTS.md` instructions both load before any substantive work.
3. Install the guarded-Bash files and the clone's `pre-push` hook byte-for-byte from
   `templates/codex/`; reload/re-trust after any hook wiring change. Live-fire a tokenless
   `git push --dry-run` and confirm the Git hook blocks it.
4. For HEAVY project work, copy `artifact-gauntlet.mjs`, `project-hooks.json`, and the example
   policy into the project's `.codex/` layer. Reload/re-trust, then prove a fake done blocks and
   fresh class-appropriate evidence passes.

## Rollback to DeepSeek

Stop Codex work at a clean local commit; do not push as rollback. Reopen the DeepSeek-backed
Claude Code CLI, keep its existing endpoint settings and hooks, and resume from the same branch.
Its meter and peak-window posture apply again. For UI work, save the screenshot to a file and
report AWAITING HIS LOOK; DeepSeek never self-passes a visual result. Do not delete Codex config,
tokens, or evidence as part of rollback — archive or leave them for Chan's next explicit ruling.
