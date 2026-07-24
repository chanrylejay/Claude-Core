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
| `challenger.md` | Adversarial filter on the OTHER reviewers' findings — kills false alarms, merges duplicates; the owner reads only survivors. |

**Two roles are deliberately NOT here:** the client-persona agents (`client-qa` acceptance
tester and `client-ux` design-law enforcer). The Devoted versions embodied that client's
specific taste and laws, so they were removed from this kit — **write them fresh per project**
from the new owner's actual requirements and design canon — start from
`client-qa.skeleton.md` / `client-ux.skeleton.md` (five fill-in fields each). Their job descriptions and verdict
formats are in `../../workflow/qa-gauntlet-pattern.md`; the discipline (read-only on live,
screenshots at multiple widths, ACCEPT/SEND-BACK verdicts) carries over even though the persona
doesn't.

## Adaptation checklist per project
1. **Tools list: already machine-correct** — they carry the lean-ctx `ctx_*` set + Bash and native Read/Grep/Glob are permanently denied here (NOT listed). Only touch them if a DIFFERENT environment's real tools differ:
   **a subagent with tools it can't use fails silently** (learned the hard way — agents ran
   toolless for a day).
2. **Fill every 🔧 ADAPT block** (repo path, client feedback style, locked-canon files,
   high-risk modules, data-source map, net commands), then delete the block.
3. `net-runner` needs the new project's test/lint commands and regression-net locations.
4. **Hooks (`../hooks/`):** in `gauntlet-guard.mjs`, rewrite `RISK_PATH` to the new repo's
   high-risk modules, adjust the spec-nudge relay regex to the new client's relay phrases, and
   rename the `client-qa`/`client-ux` role names if the project uses different agent names.
   The regression test nets now SHIP IN THIS KIT at `../hooks/_pushguard_test.mjs` and `../hooks/_gauntlet_test.mjs` (plain `node`, no framework). Re-running them after ANY edit to push-guard.mjs or gauntlet-guard.mjs is MANDATORY; they pin the documented false-positive fixes and the classifiers.
5. Strip any residual origin-project references from prompt bodies before first use.

## Hooks (`../hooks/`) — wiring only
The concept, the rules, and the never-fake-a-gate law live in ONE home:
`../../workflow/qa-gauntlet-pattern.md`.
- `push-guard.mjs` — PreToolUse on the shell tools; update the GO-file path and matcher per repo.
- `gauntlet-guard.mjs` — three modes by argv: `ui-track` (PostToolUse on edit tools),
  `done-wall` (Stop), `spec-nudge` (UserPromptSubmit).

COPY both hooks into the project's `.claude/hooks/` first — never run them from Claude-Core
(full rationale + the lean-ctx matcher rule + day-one order live in the qa-gauntlet home). Copy-paste `.claude/settings.local.json` wiring
(JSON-validate after editing — a corrupt settings file silently disables everything in it):

```json
{
  "hooks": {
    "PreToolUse": [{ "matcher": "Bash|PowerShell|mcp__lean-ctx__ctx_shell|mcp__lean-ctx__shell", "hooks": [{ "type": "command", "command": "node .claude/hooks/push-guard.mjs" }] }],
    "PostToolUse": [{ "matcher": "Edit|Write|mcp__lean-ctx__ctx_patch", "hooks": [{ "type": "command", "command": "node .claude/hooks/gauntlet-guard.mjs ui-track" }] }],
    "Stop": [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/gauntlet-guard.mjs done-wall" }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/gauntlet-guard.mjs spec-nudge" }] }]
  }
}
```
