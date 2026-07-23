# Ano Ulam? — project canon (Chan's own product; he plans to continue it)

Absorbed Jul 24 2026 from ANO_ULAM_CLAUDE_BOSS_CONTEXT.txt v2.1 (Jun 6 2026, frozen verbatim
in ../../archives/). That txt stays the frozen original; THIS file is the
living canon. Read this before ANY ano-ulam bug fix, feature, or design decision.
Live: ma-anoulam.vercel.app · Repo: github.com/chanrylejay/ano-ulam (PUBLIC) · V2.2, 9.5/10.
Local working copy: C:/Users/Chanryle/Downloads/Projects/Github/ano-ulam (holds the synced
.env — never re-clone over it). Push = LIVE deploy (Vercel auto-deploys main): GO required.

## What it is

Filipino meal-suggestion app: recommends affordable home-cooked meals from real palengke
prices (DA Bantay Presyo daily PDF). Stack: Next.js 14 + TypeScript + Tailwind, Neon Postgres
(project "anoulam", Singapore, PG17), DeepSeek API, Vercel Hobby (serverless + cron),
pdf-parse v2, Vercel Analytics. Cost ~$0/month.

## The pipeline (one combined cron, 10 AM Manila = 0 2 * * * UTC)

/api/cron/daily runs ingest THEN suggest sequentially (two separate crons RETIRED: Hobby's
1-hour window fired them out of order, Jun 4 2026; never split them again).
- INGEST: scrape da.gov.ph/price-monitoring for the Daily Price Index PDF link (URLs change
  daily, never hardcode; pick Daily Price Index ~380KB, NOT Daily Retail Price Range ~1.5MB)
  → pdf-parse → first 16,000 chars to DeepSeek → CSV out (JSON banned: ~27K cap; default CSV at
  50+ items, 100+ WILL truncate) → JS Map dedup → batch upsert via ($1::jsonb) jsonb_array_elements
  (2 queries total, never 100+ round trips) → already-ingested check (DA re-publishing
  yesterday's PDF is EXPECTED, not a bug).
- SUGGEST: today's prices → PriceMap → yesterday's prices for trends → yesterday's meal IDs
  as excludeIds (rotation) → findCheapestMeals(47 recipes, ..., 8, excludeIds) → DeepSeek
  writes "Bakit?" reasoning ONLY → cache in daily_suggestions.
- USER VISIT: cached reads only, ZERO AI calls per visit.

## The recipe engine (lib/recipes.ts) — the crown jewel, 47 hardcoded recipes

AI recipe generation is PERMANENTLY BANNED (DeepSeek scored 6-7/10: wrong ingredients, bad
cost math; the hardcoded engine is 10/10). DeepSeek's ONLY roles: PDF-to-CSV extraction and
"Bakit?" prose. This is universal-patterns pattern 18 — this project is where it was proven.
- Required ingredients count toward cost; optional ones display (rose) but never rank.
- Palengke overrides for small buys (DA per-kg distorts them; NOT optional, never remove):
  Bawang ₱175/kg → 1 ulo ≈ ₱7 · Sibuyas ₱80/kg → 1 pc ≈ ₱8 · Luya ₱125/kg → 1 piraso ≈ ₱5
  (apply when qty <= 0.20 kg).
- Main chicken/fish normalize to 3/4 kg family portions, EXCEPT Sopas and mixed ginisa.
- A required ingredient with no price for the day EXCLUDES the whole recipe (the Galunggong
  ₱0 bug: missing price once ranked it cheapest; hasRequiredPrices() guards this).
- Non-DA fallback prices: Kangkong ₱100/kg · Malunggay ₱250/kg · Gabi ₱50/kg · Okra ₱90/kg ·
  Upo ₱50/kg · Atay ng baboy ₱225/kg · Mais ₱18/pc.
- Balanced selection, 3 passes (pure cheapest-sort gives 4-5 fish in a row; variety is law):
  Pass 1 strict caps (2 fish, 2 chicken, 2 pork, 1 beef, 1 egg, 1 veggie, no duplicate main);
  Pass 2 relaxes duplicate-main only; Pass 3 emergency fill with DOUBLED caps still ENFORCED
  (the V2.1 overflow bug: capless Pass 3 flooded results; never remove).
- Rotation: yesterday's 8 IDs excluded; if fewer than 6 remain, rerun without excludeIds.

## Display rules (lib/commodity-names.ts, 3 layers + naming convention, permanent)

Layer 1 hide brands (Magnolia, Bounty Fresh, Unbranded Fresh, Fully Dressed) · Layer 2 auto-strip " Imported"/" Local"
(Chan never wants those words visible) · Layer 3 explicit map for special cases.
Naming: meat cuts English (Chicken Breast) · vegetables/spices Filipino (Kamatis, Bawang) ·
fish Filipino (Bangus, Galunggong) · traditional dishes Filipino (Adobo, Sinigang) · simple
preps English (Fried Chicken). ₱0 optionals are HIDDEN (₱0 reads as "free" = misleading).
/prices is a receipt-style list, never a card grid (pattern 19; green ≤₱100, amber ≤₱250,
red >₱250). DA Bantay Presyo attribution is a STANDING requirement (homepage + Footer).
Price trend indicators use native emoji dots 🟢🔴, never colored CSS arrows (invisible on the
orange/red frosted homepage). DA holds 98+ items; the 3 layers filter to ~55-60 shown.
Nutrition (V2.2): lib/nutrition.ts USDA per-100g table, name-first lookup
(pattern 23), all 5 macros per serving (total ÷ 2), served client-side from RECIPES
(pattern 22, zero backend changes). MealCard V2.2: 3 accordions (Buong Sangkap / Paano
Magluto? / Nutrition Facts), all closed by default; filter tabs Lahat/Isda/Manok/Baboy/Beef/
Itlog/Gulay; pantry items labeled "hindi kasama sa DA price monitoring".

## Database rules (Neon "anoulam")

- prices.price_prevailing NUMERIC returns STRINGS: parseFloat in the API route, always.
- daily_suggestions.meals is TEXT not JSONB: (meals::jsonb)->0->>'name', never uncast.
- Multiple rows per date exist: ORDER BY generated_at DESC NULLS LAST, id DESC LIMIT 1,
  never LIMIT 1 alone.
- Batch inserts: dedup in JS first + ON CONFLICT DO NOTHING (same-row-twice crash).
- Sequence names survive table renames (daily_prices_id_seq is historical, expected).

## Cron route law

Every cron route: export GET delegating to POST (Vercel Cron sends GET) + dual auth
(x-cron-secret header OR Authorization Bearer) + all three no-store headers
(Cache-Control, CDN-Cache-Control, Vercel-CDN-Cache-Control; edge cache ignores
force-dynamic without them). maxDuration 60 on heavy routes. CRON_SECRET lives in Vercel
env vars (Production AND Preview); the value is NOT written in the committed kit (it does sit
inside the frozen archives txt, which is gitignored, and rotation was DECLINED Jul 23 2026 —
settled, do not re-raise). Manual test:
curl.exe -X POST the /api/cron/daily URL with the x-cron-secret header. A 504 at exactly
02:00-02:01 UTC = collision with the scheduled run, not a failure. Site prices lag one day
by design (DA posts late; the 10AM run usually ingests yesterday's edition).

## Model status (UPDATED Jul 23-24 2026, supersedes the txt)

The txt's "deepseek-chat, migrate before Jul 24 2026" is DONE: ano-ulam migrated to
deepseek-v4-flash Jul 23 2026 and the 10AM cron ran clean on it. The txt's "v4-flash breaks
tool calling" note is stale (predates the V4 retirement; ano-ulam uses no tool calling).
DeepSeek account: Maya Visa top-up, $2 minimum, PH email-only registration, NO free credits.

## Closed decisions (final; never revisit)

AI recipes BANNED · CSV over JSON for extraction · one combined cron · receipt list over
card grid · no Imported/Local labels · no brand variants · no ₱0 optionals · never link
billing to Google AI Studio (kills the free tier) · no dish photos on cards (OG images
later, maybe) · all 5 macros shown · nutrition client-side, never an API.

## Do-not-reintroduce bug list

Galunggong ₱0 · optional-₱0 display · stale-suggestions LIMIT 1 · Vercel edge cache stale ·
two-cron race · Pass 3 overflow · batch-insert duplicates · Neon string numbers · 100+ DB
round-trip timeout. (Mechanisms above; generic platform versions live in
../../lessons/platform-gotchas.md — that file descends from THIS project's scars.)

## Working with Chan on this project (updated for the Claude Code era)

The txt's chat-era rules (full file replacements, no patches) are OBSOLETE under Claude
Code. Still alive: explain root cause in plain language (an analogy helps) BEFORE the fix;
only Chan's real test outputs are valid data; ask instead of fabricating history; AI is for
"Bakit?" reasoning only, never data. Open-source policy: the repo is public BY STRATEGY
(infrastructure transparency); the DeepSeek prompt text, methodology, keys stay private.

## Status snapshot (Jun 6 2026 — VERIFY before acting; the project resumes post-Devoted)

Possibly-still-open from the txt + Doc A: Reddit post (account was blocked), README update to
V2.2, and the dev-project-instructions V2.1→V2.2 fix (superseded for AI sessions by THIS canon;
still open for the repo's own docs). This project is side-project lane (a) in
../../workflow/devoted-closure-checklist.md's week-1 momentum kit.

Related reading before a work session: ../../memory/chan-ai-cost-context.md (the model/tool
reality after Jul 25 2026) and LOCAL-ONLY-security-rulings items 3 and 5 (env + migration
facts, machine-only file).
