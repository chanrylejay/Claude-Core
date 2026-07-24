# Switch Claude Code to DeepSeek — run the day Claude access dies

Verified from DeepSeek's official docs Jul 24 2026 (their Anthropic-compatible endpoint plus
their own Claude Code guide). Do NOT run this while Claude access still works: the switch
takes effect on the next VS Code start.

## The switch — EASIEST PATH (staged Jul 24 2026, ready to fire)

Double-click C:/Users/Chanryle/.claude/SWITCH-TO-DEEPSEEK.cmd, paste the API key when it asks,
then fully restart VS Code. That is the whole switch: the VS Code checkbox
(claudeCode.disableLoginPrompt) was already set on Jul 24. The manual path below does the same.

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

## First session on DeepSeek (do once, whichever path you used)

Paste this exact line into Claude-Core/memory/MEMORY.md's NOW block so every future session sees the runtime reality (remove it only if you return to a vision model):

RUNTIME: DeepSeek endpoint, NO vision. The model drives Playwright and SAVES screenshots to a file; CHAN's eyes verify every screen; never claim a screen looks right.

## What it configures (from DeepSeek's official guide)

- Endpoint: https://api.deepseek.com/anthropic (the plain api.deepseek.com does NOT work here).
- Main model: `deepseek-v4-flash` (Chan chose flash Jul 24 2026 for cost/speed; flip ANTHROPIC_MODEL + DEFAULT_OPUS/SONNET to `deepseek-v4-pro` for the smarter, pricier tier). Opus/Sonnet names route to
  it). Subagents/background: `deepseek-v4-flash`.
- `deepseek-chat` and `deepseek-reasoner` RETIRED Jul 24 2026. Never use those names.
- You will SEE `deepseek-v4-flash` in the VS Code status bar (that is the confirmation the switch worked). Flash is the default. Pro is added to the /model picker as a LOCAL custom entry (ANTHROPIC_CUSTOM_MODEL_OPTION), which does NOT depend on DeepSeek serving a model list, so it is the dependable way to click-switch to pro (gateway discovery is also on as a bonus but can fail silently). IMPORTANT: none of the picker behavior can be tested until actually on DeepSeek; docs-confirmed, not live-tested. Guaranteed fallback if pro does not appear: flip ANTHROPIC_MODEL + DEFAULT_OPUS/SONNET to deepseek-v4-pro and restart.
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
- The QA gauntlet on DeepSeek: the CHECKS are mandatory, the subagent FLEET is a strong-Claude optimization. Do NOT spawn the agents; run each check yourself inline and in order (spec-read the ask, hostile self-review of the diff, type/lint + regression, then the UI step), and create a gauntlet token ONLY after you actually ran that step. Token split by what a blind model can honestly self-certify: GATE_OK and the non-visual parts of QA_OK you self-certify after running; UX_OK involves LOOKING, so never self-pass it blind. Capture the Playwright shot to a FILE and create .claude/UX_SHOT; the done-wall UX branch clears on that marker (not on faking UX_OK), and the visual verdict stays owed to Chan (his eyes give CLEAN / POLISH / VIOLATIONS).
- Thinking / effort: Claude Code sends a "thinking" field with the effort setting and DeepSeek can hard-400 on it, so the switch sets CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1. The effort slider does nothing on DeepSeek; it reasons on its own. Tool cache directives ignored (caching is automatic).

## When DeepSeek is down, out of credits, or a model name 404s

- Model-name churn is proven (deepseek-chat and deepseek-reasoner already retired). Before trusting deepseek-v4-pro / deepseek-v4-flash, confirm both names on DeepSeek's official models page. If a call 404s the model, update the ENV names and re-run apply-deepseek-switch.mjs.
- Out of credits (the most likely mid-task failure): the key refills only via the manual $2 Maya minimum recorded in the ano-ulam canon. Chan PRE-APPROVED a $2 top-up as the lifeline exception to the no-new-AI-spend rule (Jul 24 2026); anything above $2 he decides in the moment.
- Provider fallback: do NOT just point ANTHROPIC_BASE_URL at an OpenRouter model. Claude Code needs an Anthropic-Messages endpoint and only DeepSeek's /anthropic path speaks it; OpenRouter is OpenAI-format and needs an adapter.
- STANDING TODO (do while Claude and DeepSeek still work): pre-stage AND smoke-test ONE $0 fallback now, either the local Msty rig on the ThinkPad or free OpenRouter via an adapter, and record the exact working base URL + model name right here. Chan picks which; never improvise an untested endpoint at 2am.

## Rollback

Restore ~/.claude/settings.json from the `.bak-before-deepseek` backup the script made, delete
the seven ANTHROPIC_*/CLAUDE_CODE_* user env vars, restart VS Code. Claude returns whenever
there is an account to return to.
