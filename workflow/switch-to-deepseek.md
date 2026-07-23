# Switch Claude Code to DeepSeek — run the day Claude access dies

Verified from DeepSeek's official docs Jul 24 2026 (their Anthropic-compatible endpoint plus
their own Claude Code guide). Do NOT run this while Claude access still works: the switch
takes effect on the next VS Code start.

## The switch (one command + one checkbox)

1. Get the API key from platform.deepseek.com/api_keys (Chan already has a working account).
2. In any terminal:
   `node C:/Users/Chanryle/Claude-Core/templates/apply-deepseek-switch.mjs sk-YOURKEY`
   The script backs up ~/.claude/settings.json, merges the env block, validates the JSON, and
   sets user-level Windows env vars as belt-and-suspenders. Add `--dry-run` to rehearse safely.
3. VS Code: Ctrl+, then search `claudeCode.disableLoginPrompt` and TICK it (documented setting
   for third-party providers; skips the Anthropic sign-in screen).
4. Fully close and reopen VS Code (not just reload).
5. Smoke test in a new chat: "what is rule zero and who am I working with". A good answer means
   the hub + contract loaded and the new model is oriented. A thin answer: hub section 2's
   fallback applies to the new model too.

## What it configures (from DeepSeek's official guide)

- Endpoint: https://api.deepseek.com/anthropic (the plain api.deepseek.com does NOT work here).
- Main model: `deepseek-v4-pro` (their recommended Claude Code main; Opus/Sonnet names route to
  it). Subagents/background: `deepseek-v4-flash`.
- `deepseek-chat` and `deepseek-reasoner` RETIRED Jul 24 2026. Never use those names.
- Pricing per 1M tokens: flash $0.14 in / $0.28 out; pro $0.435 in / $0.87 out (cache hits are
  near-free). Real spend lives on platform.deepseek.com usage; ccusage's dollar numbers will be
  WRONG for DeepSeek models (it prices Claude).

## What still works, what breaks

- WORKS: all local hooks (push gate, session ritual, drill injection), lean-ctx and every local
  MCP server, subagents, web search, the whole kit. The laws are model-independent by design.
- BREAKS: **vision**. The endpoint rejects image and document content. The verify-visually law
  survives with one change: the model still drives Playwright and takes the screenshot, but
  CHAN's eyes do the looking. Never let a blind model claim a screen "looks right".
- Weaker model discipline: no heavy multi-agent fleets; small steps; trust the files over
  memory; the checklists ARE the intelligence now.
- Thinking works (budget knob ignored); tool cache directives ignored (caching is automatic).

## Rollback

Restore ~/.claude/settings.json from the `.bak-before-deepseek` backup the script made, delete
the seven ANTHROPIC_*/CLAUDE_CODE_* user env vars, restart VS Code. Claude returns whenever
there is an account to return to.
