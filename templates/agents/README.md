# Agent templates — the QA gauntlet team

The five **project-agnostic** agents of the QA gauntlet (four genericized from the Devoted Care originals, plus the challenger, Jul 24 2026):
each carries a 🔧 ADAPT PER PROJECT block to fill in when dropping them into a new project's
`.claude/agents/`. How they chain: `../../workflow/qa-gauntlet-pattern.md`.

| Agent | Role |
|---|---|
| `spec-reader.md` | ASK-DON'T-ASSUME gate — turns a raw ask into a numbered spec + verbatim quotes + ambiguity questions. Never answers FOR the client. |
| `reviewer.md` | Hostile code review of a diff — correctness + discipline violations. Verdict + must-fix list, not a rewrite. |
| `net-runner.md` | Anti-churn gate — runs type/lint + regression nets, audits net coverage, raises CHURN ALERTs. Green/red verdict. |
| `recon.md` | Read-only codebase/data-flow tracer — cited conclusions, not file dumps. |
| `challenger.md` | Adversarial filter on the OTHER reviewers' findings — kills false alarms, merges duplicates. A kill is never silent: every killed item stays listed with the evidence that killed it, both counts go in the turn report, and the owner may reinstate any of them. Findings it cannot reach (need a screen, a live probe, or him) route to OWNER-ONLY, never to KILLED. |

**Two roles are deliberately NOT here:** the client-persona agents (`client-qa` acceptance
tester and `client-ux` design-law enforcer). The Devoted versions embodied that client's
specific taste and laws, so they were removed from this kit — **write them fresh per project**
from the new owner's actual requirements and design canon — start from
`client-qa.skeleton.md` / `client-ux.skeleton.md` (five fill-in fields each). Their job descriptions and verdict
formats are in `../../workflow/qa-gauntlet-pattern.md`; the discipline (read-only on live,
screenshots at multiple widths, ACCEPT/SEND-BACK verdicts) carries over even though the persona
doesn't.

## Adaptation checklist per project
1. **Tools list: CHECK IT FIRST, before copying anything.** Confirm this environment's real tool names against the frontmatter — a subagent with tools it cannot use fails silently, and that cost a full day of toolless agents once. The lists ship correct for THIS machine (the lean-ctx `ctx_*` set + Bash, with native Read/Grep/Glob permanently denied and therefore NOT listed). On this machine there is nothing to change. On any other, rewrite them before use:
   **a subagent with tools it can't use fails silently** (learned the hard way — agents ran
   toolless for a day).
2. **Fill every 🔧 ADAPT block** (repo path, client feedback style, locked-canon files,
   high-risk modules, data-source map, net commands), then delete the block.
3. `net-runner` needs the new project's test/lint commands and regression-net locations.
4. **Hooks (`../hooks/`).** Whatever you change here, update `_gauntlet_test.mjs` to match in the SAME edit — the net pins the classifiers, so an adapted classifier makes it fail, and the tempting move is to revert the correct adaptation instead of updating the net. Adapt the net, then re-run it. In `gauntlet-guard.mjs`, rewrite `RISK_PATH` to the new repo's
   high-risk modules, adjust the spec-nudge relay regex to the new client's relay phrases, and
   rename the `client-qa`/`client-ux` role names if the project uses different agent names.
   The regression test nets now SHIP IN THIS KIT at `../hooks/_pushguard_test.mjs` and `../hooks/_gauntlet_test.mjs` (plain `node`, no framework). The switch script has its own at `../_switch_test.mjs`. Re-running the matching net after ANY edit to push-guard.mjs, gauntlet-guard.mjs, or apply-deepseek-switch.mjs is MANDATORY; they pin the documented false-positive fixes, the classifiers, five verified push bypasses, the done-wall behaviours, and the switch script's backup rules.
5. Strip any residual origin-project references from prompt bodies before first use.

## Hooks (`../hooks/`) — wiring only
The concept, the rules, and the never-fake-a-gate law live in ONE home:
`../../workflow/qa-gauntlet-pattern.md`.
- `push-guard.mjs` — PreToolUse on the shell tools; update the GO-file path and matcher per repo. Keep the `|| exit 2` on the command: without it a LOAD-time failure in the hook (syntax error, bad import) exits 1, which Claude Code treats as non-blocking, and every push walks through.
- `gauntlet-guard.mjs` — three modes by argv: `ui-track` (PostToolUse on edit tools),
  `done-wall` (Stop), `spec-nudge` (UserPromptSubmit).

COPY both hooks into the project's `.claude/hooks/` first — never run them from Claude-Core
(full rationale + the lean-ctx matcher rule + day-one order live in the qa-gauntlet home). Copy-paste `.claude/settings.local.json` wiring
(JSON-validate after editing — a corrupt settings file silently disables everything in it):

```json
{
  "hooks": {
    "PreToolUse": [{ "matcher": "Bash|PowerShell|mcp__lean-ctx__ctx_shell|mcp__lean-ctx__shell", "hooks": [{ "type": "command", "command": "node .claude/hooks/push-guard.mjs || exit 2" }] }],
    "PostToolUse": [{ "matcher": "Edit|Write|mcp__lean-ctx__ctx_patch", "hooks": [{ "type": "command", "command": "node .claude/hooks/gauntlet-guard.mjs ui-track" }] }],
    "Stop": [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/gauntlet-guard.mjs done-wall || exit 2" }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/gauntlet-guard.mjs spec-nudge" }] }]
  }
}
```
