# Vercel — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- Cron sends GET, not POST: export both, GET delegates to POST. Auth is `Authorization: Bearer CRON_SECRET`; support the `x-cron-secret` header too for manual tests.
- **Hobby cron has a 1-hour flexible window. NEVER two dependent crons: the window can fire B before A (proven live).** Combine into one sequential endpoint; keep the individual routes for manual tests. The dashboard Cron tab shows invocation history (2XX blue, 4XX yellow) for debugging.
- Edge cache serves stale responses even with `dynamic = "force-dynamic"`. Add `Cache-Control: no-store` plus the CDN and Vercel-CDN variants on dynamic API routes.
- Serverless timeout 60s on free tier; set `maxDuration` on heavy routes; batch DB round-trips (100+ trips US-to-Singapore fails).
- `new Date().toISOString()` is UTC; Manila is UTC+8; prefer latest-date-from-DB over a computed "today".
- Auto-deploy only fires for pushes AFTER the Git connection was made; activating it takes one trivial push — **and that push deploys LIVE. GO required, same as any other push.** (Audit Jul 26 2026: this read as a bare imperative, and every GO constraint sat either further down the file or in a project-scoped file. This is also the push that produces the FIRST public deploy — see the Netlify note that a public URL exists the instant a build succeeds.)
- Analytics: `@vercel/analytics/next` for Next.js, `/react` for Vite, script tag for plain HTML; enable in the dashboard first.
- **Set the function region explicitly** — the default (US East) can be an ocean away from
  your DB and users; put the DB in the same region as the serverless functions.
