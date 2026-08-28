# n8n (platform behaviors that survive versions) — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- **"Execute Once": chained nodes run once PER INPUT ITEM; a 22-item output upstream multiplies everything downstream (22 x 18 = 396 runs, discovered in a 2-hour production debug).** Enable Execute Once on DB queries, fetches, API calls that must run once.
- JSON import corrupts IF/Switch/SplitInBatches internal mappings: delete and recreate those nodes after import, then test each branch. Import method: Ctrl+V pastes workflow JSON straight onto the canvas. UI label notes for client guides: the Set node displays as "Edit Fields (Set)".
- Form Trigger serializes submissions: a second simultaneous submit stalls at the button but creates NO duplicate row; the risk is user confusion, not data.
- queryReplacement comma-split bug: single-JSON-parameter inserts, ($1::jsonb)->>'field', are the only safe pattern. Postgres errors can route to the SUCCESS output: handle both paths; enable Always Output Data.
- Postgres node output replaces upstream data in multi-branch flows: add a Set node after conditional gates to carry fields forward.
- toolWorkflow wraps agent arguments in one query property as a JSON string: JSON.parse in every tool input Code node. Agent tool output property must be named "output", not "response".
- Error Trigger fires only on PRODUCTION executions and deregisters after any Code-node edit (toggle the workflow off-on). staticData saves on workflow success only, and is PER-WORKFLOW scoped: cross-workflow cache sharing is impossible without a DB. Re-import resets all credentials. Exports strip the STORED credentials — but not secrets typed directly into node bodies, which is exactly where they end up when `N8N_BLOCK_ENV_ACCESS_IN_NODE` blocks env access in Code nodes (see the Windows self-host line below). **Grep an export for keys before any public commit: stripped is not clean.** (Audit Jul 26 2026: this said "safe for GitHub", an affirmative safety certificate. A reader told the artifact is clean never forms the doubt that would send them looking for a guard, so no ban elsewhere could cure it — and a public commit cannot be recalled.)
- SplitInBatches: never loop a Wait node back upstream; done branch never connects to Wait.
- Healthchecks.io dead-man-switch on a sleeping-laptop host needs a grace period longer than the sleep cycles (30 min proved right; 5-min ping cadence).
- Windows self-host: crypto and env access need NODE_FUNCTION_ALLOW_BUILTIN and N8N_BLOCK_ENV_ACCESS_IN_NODE; Gmail OAuth can fail via ngrok (reconnect via localhost).
- Circuit-breaker recipe (proven, supervisor repo + archive Doc B §2): breaker state in an atomic SQL CTE (FOR UPDATE + INSERT ON CONFLICT); 5 errors → OPEN, OPEN → HALF_OPEN after 5min, HALF_OPEN → CLOSED after 10min; every transition logged.
