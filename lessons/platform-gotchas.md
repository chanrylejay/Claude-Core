# Platform gotchas — service-level behaviors that cost real debugging time

Distilled Jul 23 2026 from Documents A v10 and B v9 (verbatim originals in `../archives/`).
Scope split: `../TOOLS.md` = the Devoted-era tool catalog (Claude Code, MCPs, integrations). THIS file = per-platform service behaviors for any future build. One home each, no duplication.

## Vercel
- Cron sends GET, not POST: export both, GET delegates to POST. Auth is `Authorization: Bearer CRON_SECRET`; support the `x-cron-secret` header too for manual tests.
- **Hobby cron has a 1-hour flexible window. NEVER two dependent crons: the window can fire B before A (proven live).** Combine into one sequential endpoint; keep the individual routes for manual tests.
- Edge cache serves stale responses even with `dynamic = "force-dynamic"`. Add `Cache-Control: no-store` plus the CDN and Vercel-CDN variants on dynamic API routes.
- Serverless timeout 60s on free tier; set `maxDuration` on heavy routes; batch DB round-trips (100+ trips US-to-Singapore fails).
- `new Date().toISOString()` is UTC; Manila is UTC+8; prefer latest-date-from-DB over a computed "today".
- Auto-deploy only fires for pushes AFTER the Git connection was made; push a trivial change after connecting.
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
- **`npm run build` locally before every deploy push: it is the exact CI command; dev mode skips type checking.** Strict ESLint makes unused vars and `any` hard errors; type API data as Record<string,unknown>.
- next@latest overshoots majors: pin explicitly; `npm audit fix --force` is banned on Next projects. tsconfig target at least es2017 (the TS2802 Set/Map-spread trap).
- One build at a time: racing builds corrupt .next (MODULE_NOT_FOUND deep in webpack-runtime): kill both, rm -rf .next, rebuild once.
- Serverless route handlers must AWAIT audit/log writes; un-awaited promises die when the response returns.
- Write architecture: see universal-patterns pattern 41 (the write-function spine).

## DeepSeek API
- **JSON output hard-caps near 27K characters: use CSV for 100+ item extractions (3-5x more compact).** Remove response_format json_object when requesting CSV.
- Responses may arrive wrapped in markdown code fences regardless of settings: always strip before parsing.
- Model names: deepseek-chat RETIRED Jul 24 2026; deepseek-v4-flash is the current correct model (the old "v4-flash banned for n8n tool calling" lock predates the retirement; retest tool-calling if n8n agents are revived).
- AI generation of structured local-domain data (Filipino recipes) rated 6-7/10: wrong ingredients, bad cost math. Deterministic engine plus LLM explanation is the pattern.

## Bolt.new
- **NEVER connect Bolt to GitHub on a live project: it auto-pushes on any change and triggers auto-deploys (caused a production rollback once).** Bolt is a one-way launchpad: scaffold, download ZIP, VS Code, GitHub Desktop, deploy.
- Verify immediately after scaffold: the DB client (it may swap Neon for Supabase), the schema names, and the full logic flow (it omits critical sections).

## n8n (platform behaviors that survive versions)
- **"Execute Once": chained nodes run once PER INPUT ITEM; a 22-item output upstream multiplies everything downstream (22 x 18 = 396 runs, discovered in a 2-hour production debug).** Enable Execute Once on DB queries, fetches, API calls that must run once.
- JSON import corrupts IF/Switch/SplitInBatches internal mappings: delete and recreate those nodes after import, then test each branch.
- queryReplacement comma-split bug: single-JSON-parameter inserts, ($1::jsonb)->>'field', are the only safe pattern. Postgres errors can route to the SUCCESS output: handle both paths; enable Always Output Data.
- Postgres node output replaces upstream data in multi-branch flows: add a Set node after conditional gates to carry fields forward.
- toolWorkflow wraps agent arguments in one query property as a JSON string: JSON.parse in every tool input Code node. Agent tool output property must be named "output", not "response".
- Error Trigger fires only on PRODUCTION executions and deregisters after any Code-node edit (toggle the workflow off-on). staticData saves on workflow success only. Re-import resets all credentials. Exports strip credentials (safe for GitHub).
- SplitInBatches: never loop a Wait node back upstream; done branch never connects to Wait.
- Windows self-host: crypto and env access need NODE_FUNCTION_ALLOW_BUILTIN and N8N_BLOCK_ENV_ACCESS_IN_NODE; Gmail OAuth can fail via ngrok (reconnect via localhost).

## Data sources and scraping
- Government/institutional PDFs (DA Bantay Presyo pattern): publication times are unreliable, URLs are unpredictable (scrape the listing page for the current link), multiple daily editions exist (pick one and lock it), and re-ingesting yesterday's edition when today's is late is expected behavior guarded by an already-ingested check.
- JS-rendered doc pages (Swagger, ReDoc, Stoplight) return empty shells to fetchers: get the underlying spec JSON/YAML via F12 Network, or have the user upload it. Stoplight YAML exports can carry a parse-breaking stray period after closing quotes.
- **Explore any new API endpoint in Bruno BEFORE coding: confirm envelope shape, exact field names, required params.** One paste of a real response prevents a day of guessing.
