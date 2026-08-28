# Netlify — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- netlify.toml at repo root is authoritative; UI build settings do not hold for Next.js.
- Free tier cannot password-protect: build app-level auth in code. **Gate PII BEFORE the first deploy; a public URL exists the instant a build succeeds.**
- Env vars go to BOTH .env.local AND the host dashboard, then redeploy; env changes only take effect on a rebuild (a rebuild is a deploy-costing action, ask first).
- Middleware and auth matchers MUST exempt platform-internal paths like /.netlify/*, or scheduled functions silently 307 to login forever. Diagnose scheduled-job silence with the platform traffic log.
- Push equals deploy on auto-deploy setups (the GO law: Chan's hard rules 6-7).
