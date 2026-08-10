# Switch Claude Code to DeepSeek — run the day Claude access dies

Verified from DeepSeek's official docs Jul 24 2026 (their Anthropic-compatible endpoint plus
their own Claude Code guide). Do NOT run this while Claude access still works: the switch
takes effect on the next VS Code start.

## STEP ZERO, before either path: confirm the model names

Model-name churn is proven here (deepseek-chat and deepseek-reasoner are already retired). The
names below were read off DeepSeek's docs on Jul 24 2026, and that reading is NOT a warrant for
any later date. Open DeepSeek's official models page and confirm `deepseek-v4-flash` and
`deepseek-v4-pro` still exist before running anything. A wrong name 404s every call, and you
find out only after Claude access is already gone.

## The switch — EASIEST PATH (staged Jul 24 2026, names re-confirmed at step zero)

Double-click C:/Users/Chanryle/.claude/SWITCH-TO-DEEPSEEK.cmd, paste the API key when it asks,
then fully restart VS Code. That is the whole CONFIG change, not the whole switch: steps 3, 4 and
5 of the manual path below apply to this path too. Confirm claudeCode.disableLoginPrompt is still
ticked (Ctrl+, — it was set on Jul 24, but settings sync, a profile change, or a reinstall can drop
it), then run the step-5 smoke test. Nothing is done until that smoke test answers.

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
- Main model: `deepseek-v4-flash`. Chan chose flash Jul 24 2026 for cost/speed.
- Claude model names ALL route to FLASH, not pro: ANTHROPIC_DEFAULT_OPUS_MODEL,
  ANTHROPIC_DEFAULT_SONNET_MODEL and ANTHROPIC_DEFAULT_HAIKU_MODEL are every one of them set to
  `deepseek-v4-flash`, so a request for Opus, Sonnet or Haiku gets flash at flash prices.
  Subagents/background too (CLAUDE_CODE_SUBAGENT_MODEL). (Audit Jul 26 2026: this bullet carried
  a mangled fragment — "Opus/Sonnet names route to it)" — whose nearest antecedent was PRO, the
  tier priced roughly 3x flash. One audit cleared the fragment as harmless; a later one proved
  the misread. The script is the truth, and both alias keys are flash.)
- The pricier tier: flip ALL FIVE model keys to `deepseek-v4-pro` — ANTHROPIC_MODEL, the three
  ANTHROPIC_DEFAULT_* keys, and CLAUDE_CODE_SUBAGENT_MODEL. Flipping only the first three leaves
  every subagent on flash after what was meant to be an upgrade, with nothing to surface it.
- `deepseek-chat` and `deepseek-reasoner` RETIRED Jul 24 2026. Never use those names.
- You will SEE `deepseek-v4-flash` in the VS Code status bar (that is the confirmation the switch worked). Flash is the default. NONE of the picker behaviour below has been live-tested: it is docs-confirmed only, and it cannot be tested until you are actually on DeepSeek. Report it that way, never as confirmed. On that basis: pro is added to the /model picker as a LOCAL custom entry (ANTHROPIC_CUSTOM_MODEL_OPTION) which does not depend on DeepSeek serving a model list, so it SHOULD be the more reliable of the two routes (gateway discovery is also on, but it can fail silently). Fallback if pro does not appear: flip all five model keys (ANTHROPIC_MODEL, the three ANTHROPIC_DEFAULT_*, CLAUDE_CODE_SUBAGENT_MODEL) to deepseek-v4-pro and restart, using the name you confirmed at step zero.
- Pricing per 1M tokens: flash $0.14 in / $0.28 out; pro $0.435 in / $0.87 out (cache hits are
  near-free). Real spend lives on platform.deepseek.com usage; ccusage's dollar numbers will be
  WRONG for DeepSeek models (it prices Claude).

## What still works, what breaks

- WORKS: all local hooks (push gate, session ritual, drill injection), lean-ctx and every local
  MCP server, subagents, web search, the whole kit. The laws are model-independent by design.
- BREAKS: **vision**. The endpoint rejects image and document content. The verify-visually law
  survives with one change: the model still drives Playwright and takes the screenshot, but
  CHAN's eyes do the looking. Never let a blind model claim a screen "looks right".
- The endpoint's full ignore/reject list (cache_control, image blocks, silent model-name fallback, the context-meter accounting) lives in `../lessons/platform-gotchas.md` under `## DeepSeek API`. This runbook holds the switch facts; that file holds the endpoint facts.
- Weaker model discipline: one subagent at a time, never a parallel fleet and never a Workflow
  fan-out (that is what "heavy" means here, it is not a judgement call); small steps; trust the files over
  memory; the checklists ARE the intelligence now.
- The QA gauntlet on DeepSeek: the CHECKS are mandatory, the subagent FLEET is a strong-Claude optimization. Do NOT spawn the agents; run each check yourself inline and in order (spec-read the ask, hostile self-review of the diff, type/lint + regression, then the UI step), and create a gauntlet token ONLY after you actually ran that step. Token split by what a blind model can honestly self-certify: GATE_OK and the non-visual parts of QA_OK you self-certify after running; UX_OK involves LOOKING, so never self-pass it blind. Capture the Playwright shot to a FILE and create .claude/UX_SHOT; the done-wall UX branch clears on that marker (not on faking UX_OK), and the visual verdict stays owed to Chan (his eyes give CLEAN / POLISH / VIOLATIONS).
- Thinking / effort: Claude Code sends a "thinking" field with the effort setting and DeepSeek can hard-400 on it, so the switch sets CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1. The effort slider does nothing on DeepSeek; it reasons on its own. Tool cache directives ignored (caching is automatic).

## When DeepSeek is down, out of credits, or a model name 404s

- Model-name churn is proven (deepseek-chat and deepseek-reasoner already retired). Before trusting deepseek-v4-pro / deepseek-v4-flash, confirm both names on DeepSeek's official models page. If a call 404s the model, update the ENV names and re-run apply-deepseek-switch.mjs. BEFORE any re-run, check that settings.json.bak-CLAUDE-ORIGINAL exists. If it does NOT, go to HAND ROLLBACK under Rollback first: a missing pristine backup has two causes (the current script writes none on an already-DeepSeek machine with no clean candidate; an older version never wrote one), and re-running the script fixes neither.
- Out of credits (the most likely mid-task failure): the key refills only via the manual $2 Maya minimum recorded in the ano-ulam canon. Chan PRE-APPROVED a $2 top-up as the lifeline exception to the no-new-AI-spend rule (Jul 24 2026); anything above $2 he decides in the moment.
- Provider fallback: do NOT just point ANTHROPIC_BASE_URL at an OpenRouter model. Claude Code needs an Anthropic-Messages endpoint and only DeepSeek's /anthropic path speaks it; OpenRouter is OpenAI-format and needs an adapter.
- STANDING TODO (do while Claude and DeepSeek still work): pre-stage AND smoke-test ONE $0 fallback now, either the local Msty rig on the ThinkPad or free OpenRouter via an adapter, and record the exact working base URL + model name right here. Chan picks which; never improvise an untested endpoint at 2am.

## Rollback

Restore from `settings.json.bak-CLAUDE-ORIGINAL`, never from `.bak-before-deepseek`. The
pristine copy is written once and never overwritten; the other one was overwritten on every
run by older versions of the script, so it can hold an already-DeepSeek config.

If `.bak-CLAUDE-ORIGINAL` is MISSING, do not go hunting for a cause. There are two, and the
remedy is the same for both: (a) the CURRENT script writes NO pristine backup when it first
runs on a machine whose settings.json is already DeepSeek and whose `.bak-before-deepseek` is
absent or itself contaminated — it prints "no pre-switch settings found" on that branch, and
_switch_test.mjs asserts the branch deliberately; (b) an older script version never wrote one.
Either way there is no clean file to restore: do the HAND ROLLBACK below, and do not re-run
apply-deepseek-switch.mjs hoping to produce one. (Audit Jul 26 2026: this used to name only
cause (b), sending Chan after a stale-script problem the current script produces by design.)

HAND ROLLBACK — THREE objects in settings.json, not two:
  a. the `env` block
  b. the API key inside it
  c. the top-level `"model"` pin, if its value starts with `deepseek`

(c) is the one that bites. The script PRESERVES a DeepSeek pin on purpose (it installs the pro
picker entry, and _switch_test.mjs asserts "a DeepSeek pin is NOT deleted"), so a rollback that
strips only (a) and (b) leaves `"model": "deepseek-v4-pro"` pinned against an Anthropic
endpoint: every request asks Anthropic for a DeepSeek model, and nothing else in this runbook
would surface it. The script already cures the mirror case — a stale CLAUDE pin when switching
TO DeepSeek — and this direction was left open (audit Jul 26 2026). JSON-validate the file
after editing.

Then, in this order:
1. Delete every user env var the script set. There are TWELVE, not seven: ANTHROPIC_BASE_URL,
   ANTHROPIC_AUTH_TOKEN, ANTHROPIC_MODEL, ANTHROPIC_DEFAULT_OPUS_MODEL,
   ANTHROPIC_DEFAULT_SONNET_MODEL, ANTHROPIC_DEFAULT_HAIKU_MODEL, CLAUDE_CODE_SUBAGENT_MODEL,
   CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING, CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY,
   ANTHROPIC_CUSTOM_MODEL_OPTION, ANTHROPIC_CUSTOM_MODEL_OPTION_NAME,
   ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION. Leaving ANTHROPIC_BASE_URL or ANTHROPIC_AUTH_TOKEN
   behind keeps every session pointed at DeepSeek with the key still in your environment.
2. VS Code: Ctrl+, and UNTICK claudeCode.disableLoginPrompt. Left ticked, the Anthropic sign-in
   screen never appears and you cannot log back in.
3. Restart VS Code.

Claude returns whenever there is an account to return to.
