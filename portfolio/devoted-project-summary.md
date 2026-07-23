# Devoted Care — project summary (portfolio-safe)

**Role:** Solo architect/developer (AI-assisted), Jun–Jul 2026, for a US home-care agency.
Built and operated the agency's internal operations dashboard end-to-end: product decisions
relayed from the operations manager, implementation, QA, deploys, and incident response.
No credentials, client data, or internal identifiers appear in this file.

## What was built

**Caregiver–client matching engine.** Scoring system that ranks an entire caregiver roster for
any client shift: availability grading (12+ states from clean-fit to vacation), client history
(continuity), distance, skill/experience fit, and soft risk penalties (gender preference,
clinical credential gaps, driver requirement, prior declines) — designed to *bury, never hide*
weak options, with hard exclusions relaxing automatically rather than ever returning an empty
list. Included a plain-language "why is this person ranked here" explainer in the UI, and a
deliberate decoupling of resume/marketing tags from matching decisions (only verified
credentials satisfy clinical requirements).

**Scheduling operations suite.** Coverage command center (find a replacement for any shift),
Today board (call-offs, no-shows, yesterday's care notes), open-shift tracking, caregiver
profiles with per-field edit history and append-only audit trail, availability calendar,
one-page caregiver resume generator with a 6-category skills taxonomy.

**AI features.** LLM-powered care-note scanning (auto-scan cron), scheduler shift summaries,
and communication-log summarization — with a review-queue rule so AI output is always
human-approved before it reaches a family.

**Integrations.** Read-only sync from the agency's scheduling system (AxisCare), monday.com
availability pipeline, and two-way SMS via OpenPhone (auto-offer texts + inbound webhook)
on an approved 10DLC number.

**Data work.** Field-coverage audits (which profile fields actually reach the engines),
a 9-bug write-here/read-there data-sync audit, guarded schema migrations with archive-first
discipline, and a same-day recovery of a migration-window data-loss incident (root-caused,
recovered with idempotent fill-only SQL, zero data lost).

**Engineering infrastructure.** A hook-enforced QA "gauntlet" of specialized review agents
(spec clarifier, hostile code reviewer, regression-net runner, UX-law enforcer,
product-owner-proxy acceptance tester), scripted regression nets that pin every fix,
a push-guard making production deploys require an explicit human GO, and visual verification
via screenshot-driven review at multiple viewport widths.

## Stack
Next.js 14 (App Router) · Supabase (Postgres) · Netlify · Playwright · LLM APIs (care-note and
summary features) · Windows/PowerShell dev environment.

## Numbers that are safe to cite
~50-caregiver roster matched per shift · 15/19 client match-spec fields mapped and overlaid
across engines · 36-test taxonomy regression net + 17-test push-guard net · 16-commit reviewed
production batches · same-day incident-to-recovery on the migration data loss.

## The story to tell in interviews
Solo-built a production ops platform for a real business at high velocity **with AI as the
build partner and a human-designed QA system keeping it honest** — the interesting part isn't
that AI wrote code, it's the *harness*: verbatim spec capture, adversarial review, regression
nets, deploy guards, and show-first client approval. Resigned Jul 15 2026 and continued
delivering through a professional, fully documented wind-down (update this when fully closed).
