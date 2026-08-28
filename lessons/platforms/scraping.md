# Data sources and scraping — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- Government/institutional PDFs (DA Bantay Presyo pattern): publication times are unreliable, URLs are unpredictable (scrape the listing page for the current link), multiple daily editions exist (pick one and lock it), and re-ingesting yesterday's edition when today's is late is expected behavior guarded by an already-ingested check.
- JS-rendered doc pages (Swagger, ReDoc, Stoplight) return empty shells to fetchers: get the underlying spec JSON/YAML via F12 Network, or have the user upload it. Stoplight YAML exports can carry a parse-breaking stray period after closing quotes.
- **Explore any new API endpoint in Bruno BEFORE coding: confirm envelope shape, exact field names, required params.** One paste of a real response prevents a day of guessing.
