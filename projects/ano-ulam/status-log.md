# Ano Ulam? — status log (LOOKUP, never at boot)

Open this when resuming the project or verifying its state. The living rules (architecture,
recipe engine, display and database rules, cron law, closed decisions, design canon, the bug
list, the model and cost rules) stay in `project-canon.md`, which ANO_ULAM boots; this file is the
dated history and the resume state behind them, moved verbatim out of the canon on Sep 14 2026
(batch 2a, lossless move on the AL-29 precedent; why: ../../lessons/audit-log.md AL-34). Same
upkeep law as the canon: a dated status or a resume anchor lands here in the session it changes,
newest first. One section BINDS work: the v3 STEP 0 gate below is a gate, not history.

## v3 STEP 0 gate (BINDING: before any v3 or AI-feature work; added Jul 25 2026)

UPDATED Jul 28 2026. The gate stands, but its scope changed and Chan set the timing:

- The PDF-to-CSV extractor prompt is NO LONGER the primary path. lib/da-parser.ts reads the
  sheet in code; that prompt now runs only as a fallback when the DA changes its layout. Its PED
  audit drops to low priority accordingly (it is still a shipping prompt, just a rare one).
- The "Bakit" explainer prompt still ships in the hot path and still needs a PED pass.
  **Chan's call, Jul 28 2026: defer that audit to the actual v3 work, not before it.**

## Model status history (was the canon's "Model status (UPDATED Jul 23-24 2026, supersedes the txt)"; the living rules stayed in the canon)

The txt's "deepseek-chat, migrate before Jul 24 2026" is DONE: ano-ulam migrated to
deepseek-v4-flash Jul 23 2026. **That migration BROKE the site and this canon said it "ran
clean" for five days.** Corrected Jul 28 2026 against live Neon and Vercel data. Prices per day
went 144 (Jul 22, deepseek-chat) → 46 (Jul 23) → 0, 0, 0 (Jul 24-26) → 22 (Jul 27), and the
homepage served ZERO meals throughout. Nobody had verified the OUTPUT; a Jul 26 session checked
that lib/deepseek.ts said "deepseek-v4-flash" and called the migration handled, which is
display-not-data.

ROOT CAUSE, measured: v4-flash is a REASONING model and its hidden reasoning is billed against
max_tokens. At the inherited 8192, reasoning consumed all 8192 and the API returned an EMPTY
string with finish_reason "length" and no error. Reasoning length varies run to run (measured
6018 / 8192 / 10962 / 14221 on identical input), which is why some days produced partial rows
and others nothing. 32000 does produce a correct 204-row extraction, but the call then takes
~82s and Vercel Hobby kills a function at 60s; deepseek-v4-pro is worse at ~95s. The rule this
proved (DeepSeek cannot do the daily extraction on this plan; the PDF is read in code; print the
completion-token usage before theorising when an LLM step goes quiet) stayed in the canon.

## Status snapshot, history (Jun 6 2026 — VERIFY before acting; the project resumes post-Devoted)

Possibly-still-open from the txt + Doc A: Reddit post (account was blocked) and the
dev-project-instructions V2.1→V2.2 fix (superseded for AI sessions by THIS canon; still open for
the repo's own docs). **README: DONE Jul 28 2026** (commit ee174ac, rewritten to match the real
architecture). This project is side-project lane (a) in
../../workflow/devoted-closure-checklist.md's week-1 momentum kit.

V2 ROADMAP, searched Jul 28 2026: there is no unbuilt idea list anywhere. The only roadmap that
ever existed was the viral Facebook comment backlog (cooking instructions, protein filters,
macros/nutrition) and ALL THREE shipped in V2.2. A fresh roadmap has to come from the live FB
thread (350+ comments) or from a new product decision by Chan. Details:
~/.claude/projects/c--Users-Chanryle-Downloads-Projects-Github-ano-ulam/memory/ano-ulam-roadmap-is-empty.md
