# Next.js / npm builds — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- **`npm run build` locally before every deploy push: it is the exact CI command; dev mode skips type checking.** A green local build is not clearance: the push itself is the deploy and still needs Chan's GO, each time (audit Jul 26 2026 — found by the irreversible-action sweep, same class as the Vercel first-push line). Strict ESLint makes unused vars and `any` hard errors; type API data as Record<string,unknown>.
- next@latest overshoots majors: pin explicitly; `npm audit fix --force` is banned on Next projects. tsconfig target at least es2017 (the TS2802 Set/Map-spread trap).
- One build at a time: racing builds corrupt .next (MODULE_NOT_FOUND deep in webpack-runtime): kill both, rm -rf .next, rebuild once.
- Serverless route handlers must AWAIT audit/log writes; un-awaited promises die when the response returns.
- Write architecture: see universal-patterns pattern 41 (the write-function spine).
- **Middleware runs on the edge:** no Node `crypto` — use Web Crypto HMAC. Exempt the login
  and logout ROUTES, never the `/api` prefix — exempting all of `/api` removes authentication
  from every data route under it. A login POST that redirects to itself needs `api/login` and
  `api/logout` exempted. Return 401 JSON for `/api` paths instead of redirecting, so client
  fetches get an error rather than a login page. (universal-patterns #28 in its other
  direction: both failures come from reaching for a prefix instead of a literal route.)
- **Google-font fetching happens at build time** (offline/walled builds fail there — not a
  code bug).
- **Don't run `npm run build` while the dev server is up** — it clobbers the build dir and
  kills dev.
