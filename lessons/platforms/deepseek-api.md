# DeepSeek API — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- **JSON output hard-caps near 27K characters: default to CSV at 50+ items — 100+ WILL truncate as JSON (CSV is 3-5x more compact).** Remove response_format json_object when requesting CSV.
- Responses may arrive wrapped in markdown code fences regardless of settings: always strip before parsing.
- Model names (product/API builds): deepseek-chat AND deepseek-reasoner both RETIRED Jul 24 2026, never use those names. deepseek-v4-flash is the current name for product AI features (cheapest tier); deepseek-v4-pro for higher-quality work. This bullet is the PRODUCT-API layer only; configuring the Claude Code harness is separate (there pro is the main model, flash is subagents/background): see ../../workflow/switch-to-deepseek.md. (The old v4-flash-banned-for-n8n lock predates the retirement; retest tool-calling if n8n agents are revived.)
- **The `/anthropic` endpoint IGNORES `cache_control` everywhere** — in tools, text blocks, tool_use and tool_result, all four listed Ignored in DeepSeek's own compatibility table. `anthropic-beta` and `anthropic-version` headers are ignored too. Consequence, and it is the important one: **Claude Code's context meter is computed from cache-token accounting this endpoint never returns, so the meter is not occasionally wrong, it has nothing to compute from.** Observed Jul 31 2026: pinned for two turns, then +56% in a single message. Do not use the meter as the bank-before-compaction trigger while pointed at DeepSeek. Bank on events instead — a decision, a correction, a ruling — never on a percentage.
  Automatic prefix caching still happens server-side and is invisible to the meter: measured Aug 10 2026,
  97.97% hit rate (147.0M hit / 3.0M miss); $0.0028/M hit vs $0.14/M miss on v4-flash. The cost model must be
  reasoned about, never read off the endpoint. Two consequences: the 2% of tokens that miss can cost more than
  the 98% that hit, and anything that mutates the early context mid-session re-misses everything after it.
  Reasoning effort is a CONSTANT, never a per-task dial — changing it between turns is a documented
  cache-invalidation cause (lean-ctx proxy.effort notes); at a 98% hit rate a broken prefix costs 50x.
- **PEAK/OFF-PEAK BILLING since Aug 16 2026 (16:00 UTC) — the flat rate above is HISTORY.** v4-flash
  per 1M tokens: cache hit $0.0028 flat → now $0.007 off-peak / $0.014 peak; cache miss $0.14 flat →
  $0.22 / $0.44; output $0.28 flat → $0.66 / $1.32. Peak windows: **01:00-04:00 and 06:00-10:00 UTC
  = 09:00-12:00 and 14:00-18:00 Manila** — the standard PH workday is the double-price zone.
  Verified against Chan's own dashboard Aug 24 2026: the 8/10 session reprices to $1.05 on the old
  flat table (billed $1.04) and the 8/24 session to $0.77 on the new off-peak table (billed $0.80),
  so the tables are trusted. Boundary rule (inclusive/exclusive) is unpublished; the session-ritual
  hook treats windows as start-inclusive end-exclusive — if DeepSeek publishes the rule, update the
  hook and this bullet in the same edit. Three consequences: (1) cache hits are NO LONGER ~free —
  at $0.007/M a 360K-token context costs $0.0025 per request fully cached, so context size now
  bills on EVERY request, not only on misses; (2) a cold reload (fresh session, /clear, compact, or
  cache expiry — DeepSeek clears unused entries after hours to days) costs context_size x miss_rate:
  ~$0.08 off-peak at 360K, ~$0.02 at 100K, so compacting EARLY is cheap and compacting at the wall
  is the expensive habit; (3) measured Aug 24 2026: a 73-request 1-hour session at 90% hit rate
  billed $0.80 where the 561-request 8/10 all-day session at 98% hit billed $1.04 — miss tokens per
  request went 5.4K → 36K, so session SHAPE (few requests amortizing few cold starts) dominates the
  bill. The dashboard's per-day tooltip (hit/miss/output split) is the ground truth for any cost
  question; reconstruct against the table in force that day before blaming the workflow.
- **Unknown model names fall back to `deepseek-v4-flash` SILENTLY.** DeepSeek maps `claude-opus*` to `deepseek-v4-pro` and `claude-haiku*` / `claude-sonnet*` to `deepseek-v4-flash`, and states that any unsupported model name is auto-mapped to flash. No error, no warning, and the client's model picker keeps showing whatever was chosen. So picking Sonnet in the extension gets you Flash by design, and a typo in `ANTHROPIC_MODEL` gets you Flash by accident, indistinguishably. Chan's Sep 2 ruling: the Claude Code extension chooser can display a `deepseek-v4-pro` pin while Flash actually runs; settings are the liar, this memory and DeepSeek's usage evidence are the authority. **The picker is a client-side claim; the only proof of which model served is DeepSeek's own usage log.** Reachability check, applied to config.
- **`/effort` does NOT bind on the /anthropic endpoint:** the thinking budget is dropped and reasoning_effort is silently ignored (clients ship patches just to forward it); `max` silently downgrades to `high`. Treat /effort as a no-op; set it once at session start, never mid-session (changing it busts the cache anyway).
- **Images are Not Supported at the API layer** (`content` blocks of `type="image"`). The no-vision caveat in `workflow/switch-to-deepseek.md` is therefore an endpoint property, not a model weakness: the screenshot is dropped before any model sees it. Save-to-file and hand Chan the path stays the only path, permanently, on this endpoint.
- Also ignored or unsupported, worth knowing before designing around them: `mcp_servers`, `code_execution_tool_result`, `mcp_tool_use`, `mcp_tool_result`, `container_upload`, `document` and `search_result` blocks, `top_k`, `service_tier`, and `budget_tokens` inside `thinking` (thinking itself is supported; only the budget is dropped).
- **Balance is queryable: `GET api.deepseek.com/user/balance`, `Authorization: Bearer <key>`.** Returns `is_available` plus a `balance_infos` ARRAY (pick by `currency`, amounts are decimal STRINGS); it is a snapshot only — no usage history, no per-day spend, no price table. The money-meter statusline (templates/global/deepseek-meter.mjs) builds "today's spend" from observed balance drops for exactly that reason. Never print or log the key alongside it.
- AI generation of structured local-domain data (Filipino recipes) rated 6-7/10: wrong ingredients, bad cost math. Deterministic engine plus LLM explanation is the pattern.
