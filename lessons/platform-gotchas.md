# Platform gotchas — service-level behaviors that cost real debugging time

Distilled Jul 23 2026 from Documents A v10 and B v9 (verbatim originals in `../archives/`).
Scope split: `../TOOLS.md` = the Devoted-era tool catalog (Claude Code, MCPs, integrations). THIS file = per-platform service behaviors for any future build. One home each, no duplication.

**One exception to no-duplication, and it is deliberate: a rule that gates an IRREVERSIBLE action** — a live deploy, a public commit, a production write, a paid API call — **is restated in full at every site where that action appears.** Single-homing is right for reference facts: miss one and you write a bug and find it in testing. It is wrong for these: miss one and the consequence is already public. For this class the duplication IS the safety mechanism, and a cross-reference is not a substitute. (Audit Jul 26 2026: two sites here carried the dangerous instruction while its gate lived in another section or another file.)

**The GO law, written out once here so the references below resolve to text instead of a pointer:** Chan approves, each time, before any action that reaches production or the public. Push equals deploy on auto-deploy setups. A rebuild is a deploy. A manual cron call hits production and spends real money. A previous GO never carries forward. Full law: `../memory/chan-hard-rules.md` rules 6-7.

## Vercel
- Cron sends GET, not POST: export both, GET delegates to POST. Auth is `Authorization: Bearer CRON_SECRET`; support the `x-cron-secret` header too for manual tests.
- **Hobby cron has a 1-hour flexible window. NEVER two dependent crons: the window can fire B before A (proven live).** Combine into one sequential endpoint; keep the individual routes for manual tests. The dashboard Cron tab shows invocation history (2XX blue, 4XX yellow) for debugging.
- Edge cache serves stale responses even with `dynamic = "force-dynamic"`. Add `Cache-Control: no-store` plus the CDN and Vercel-CDN variants on dynamic API routes.
- Serverless timeout 60s on free tier; set `maxDuration` on heavy routes; batch DB round-trips (100+ trips US-to-Singapore fails).
- `new Date().toISOString()` is UTC; Manila is UTC+8; prefer latest-date-from-DB over a computed "today".
- Auto-deploy only fires for pushes AFTER the Git connection was made; activating it takes one trivial push — **and that push deploys LIVE. GO required, same as any other push.** (Audit Jul 26 2026: this read as a bare imperative, and every GO constraint sat either further down the file or in a project-scoped file. This is also the push that produces the FIRST public deploy — see the Netlify note that a public URL exists the instant a build succeeds.)
- Analytics: `@vercel/analytics/next` for Next.js, `/react` for Vite, script tag for plain HTML; enable in the dashboard first.

## Neon Postgres
- **NUMERIC returns STRINGS in JS: always parseFloat before the frontend.** TEXT-stored JSON needs JSON.parse, and `::jsonb` casts before JSON operators in SQL.
- ON CONFLICT DO UPDATE cannot touch the same row twice in one batch insert: DISTINCT ON in SQL plus a JS Map dedup plus DO NOTHING.
- Multiple rows per date: never LIMIT 1 alone; ORDER BY generated_at DESC NULLS LAST, id DESC.
- Sequence names survive table renames. Free tier: 100 projects; Singapore region for PH.

## Supabase
- **SQL-editor-created tables do NOT auto-grant (42501) and can ship id without a default (23502): bake grants including sequence grants into every CREATE TABLE.** RLS without a grant denies even service_role.
- PostgREST schema cache goes stale (PGRST204): NOTIFY pgrst to reload.
- @supabase/ssr cookies are host-only by default: never set a cookie domain, or auth leaks across preview and prod hosts.
- Provisioning is atomic: auth-create plus profile-row-insert is ONE operation; a missed second step silently breaks that user everywhere.

## Netlify
- netlify.toml at repo root is authoritative; UI build settings do not hold for Next.js.
- Free tier cannot password-protect: build app-level auth in code. **Gate PII BEFORE the first deploy; a public URL exists the instant a build succeeds.**
- Env vars go to BOTH .env.local AND the host dashboard, then redeploy; env changes only take effect on a rebuild (a rebuild is a deploy-costing action, ask first).
- Middleware and auth matchers MUST exempt platform-internal paths like /.netlify/*, or scheduled functions silently 307 to login forever. Diagnose scheduled-job silence with the platform traffic log.
- Push equals deploy on auto-deploy setups (the GO law: Chan's hard rules 6-7).

## Next.js / npm builds
- **`npm run build` locally before every deploy push: it is the exact CI command; dev mode skips type checking.** A green local build is not clearance: the push itself is the deploy and still needs Chan's GO, each time (audit Jul 26 2026 — found by the irreversible-action sweep, same class as the Vercel first-push line). Strict ESLint makes unused vars and `any` hard errors; type API data as Record<string,unknown>.
- next@latest overshoots majors: pin explicitly; `npm audit fix --force` is banned on Next projects. tsconfig target at least es2017 (the TS2802 Set/Map-spread trap).
- One build at a time: racing builds corrupt .next (MODULE_NOT_FOUND deep in webpack-runtime): kill both, rm -rf .next, rebuild once.
- Serverless route handlers must AWAIT audit/log writes; un-awaited promises die when the response returns.
- Write architecture: see universal-patterns pattern 41 (the write-function spine).

## DeepSeek API
- **JSON output hard-caps near 27K characters: default to CSV at 50+ items — 100+ WILL truncate as JSON (CSV is 3-5x more compact).** Remove response_format json_object when requesting CSV.
- Responses may arrive wrapped in markdown code fences regardless of settings: always strip before parsing.
- Model names (product/API builds): deepseek-chat AND deepseek-reasoner both RETIRED Jul 24 2026, never use those names. deepseek-v4-flash is the current name for product AI features (cheapest tier); deepseek-v4-pro for higher-quality work. This bullet is the PRODUCT-API layer only; configuring the Claude Code harness is separate (there pro is the main model, flash is subagents/background): see ../workflow/switch-to-deepseek.md. (The old v4-flash-banned-for-n8n lock predates the retirement; retest tool-calling if n8n agents are revived.)
- **The `/anthropic` endpoint IGNORES `cache_control` everywhere** — in tools, text blocks, tool_use and tool_result, all four listed Ignored in DeepSeek's own compatibility table. `anthropic-beta` and `anthropic-version` headers are ignored too. Consequence, and it is the important one: **Claude Code's context meter is computed from cache-token accounting this endpoint never returns, so the meter is not occasionally wrong, it has nothing to compute from.** Observed Jul 31 2026: pinned for two turns, then +56% in a single message. Do not use the meter as the bank-before-compaction trigger while pointed at DeepSeek. Bank on events instead — a decision, a correction, a ruling — never on a percentage.
  Automatic prefix caching still happens server-side and is invisible to the meter: measured Aug 10 2026,
  97.97% hit rate (147.0M hit / 3.0M miss); $0.0028/M hit vs $0.14/M miss on v4-flash. The cost model must be
  reasoned about, never read off the endpoint. Two consequences: the 2% of tokens that miss can cost more than
  the 98% that hit, and anything that mutates the early context mid-session re-misses everything after it.
  Reasoning effort is a CONSTANT, never a per-task dial — changing it between turns is a documented
  cache-invalidation cause (lean-ctx proxy.effort notes); at a 98% hit rate a broken prefix costs 50x.
- **Unknown model names fall back to `deepseek-v4-flash` SILENTLY.** DeepSeek maps `claude-opus*` to `deepseek-v4-pro` and `claude-haiku*` / `claude-sonnet*` to `deepseek-v4-flash`, and states that any unsupported model name is auto-mapped to flash. No error, no warning, and the client's model picker keeps showing whatever was chosen. So picking Sonnet in the extension gets you Flash by design, and a typo in `ANTHROPIC_MODEL` gets you Flash by accident, indistinguishably. **The picker is a client-side claim; the only proof of which model served is DeepSeek's own usage log.** Reachability check, applied to config.
- **Images are Not Supported at the API layer** (`content` blocks of `type="image"`). The no-vision caveat in `workflow/switch-to-deepseek.md` is therefore an endpoint property, not a model weakness: the screenshot is dropped before any model sees it. Save-to-file and hand Chan the path stays the only path, permanently, on this endpoint.
- Also ignored or unsupported, worth knowing before designing around them: `mcp_servers`, `code_execution_tool_result`, `mcp_tool_use`, `mcp_tool_result`, `container_upload`, `document` and `search_result` blocks, `top_k`, `service_tier`, and `budget_tokens` inside `thinking` (thinking itself is supported; only the budget is dropped).
- AI generation of structured local-domain data (Filipino recipes) rated 6-7/10: wrong ingredients, bad cost math. Deterministic engine plus LLM explanation is the pattern.

## Bolt.new
- **NEVER connect Bolt to GitHub on a live project: it auto-pushes on any change and triggers auto-deploys (caused a production rollback once).** Bolt is a one-way launchpad: scaffold, download ZIP, VS Code, GitHub Desktop, deploy.
- Verify immediately after scaffold: the DB client (it may swap Neon for Supabase), the schema names, and the full logic flow (it omits critical sections).

## n8n (platform behaviors that survive versions)
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

## Google / Gemini

- **Deleting Gemini activity data wipes ALL chat instances on the account — and the deployed personas (Sentinel, GRT, PED) LIVE in those chats.** Learned the hard way. Back up every system prompt before ANY Gemini platform or settings change.
- **NEVER link billing to Google AI Studio: it kills the free tier PERMANENTLY.** Chan's prompt systems run on the Gemini free tier; this is irreversible. (Standing lock since the pre-Devoted era.)

## Data sources and scraping
- Government/institutional PDFs (DA Bantay Presyo pattern): publication times are unreliable, URLs are unpredictable (scrape the listing page for the current link), multiple daily editions exist (pick one and lock it), and re-ingesting yesterday's edition when today's is late is expected behavior guarded by an already-ingested check.
- JS-rendered doc pages (Swagger, ReDoc, Stoplight) return empty shells to fetchers: get the underlying spec JSON/YAML via F12 Network, or have the user upload it. Stoplight YAML exports can carry a parse-breaking stray period after closing quotes.
- **Explore any new API endpoint in Bruno BEFORE coding: confirm envelope shape, exact field names, required params.** One paste of a real response prevents a day of guessing.
