# Trial project canon — Australian services company (ACTIVE, trial started Aug 24 2026)

**PUBLIC-SAFETY HEADER (this file is world-readable; the law is in the README):** written at
portfolio anonymization level — "an Australian services company", roles never names, patterns
never credentials, shapes never business data. The mechanical test for every line: would Chan
post it himself, publicly, today? Unsure = no; it goes in the private project repo or a
LOCAL-ONLY file instead. The private repo is the canon for code; THIS file is the canon for
context — what a fresh session needs to plan, review, and brief without seeing the code.

**Status:** FILLED — public-safety review CLEARED Aug 28 2026 (claude.ai); Chan's GO Aug 28 2026.

## The engagement, in five lines
- Role: AI Specialist, 2-week trial started Aug 24 2026. Clients are Australian (tz: +2/+3 vs Manila).
- Working platform: monday.com (gotchas: ../../lessons/platform-gotchas.md, monday.com section).
- Access state: monday.com credentials only; no admin rights yet — track what each grant unblocks.
- Chan builds their internal system on the side in his own PRIVATE repo while access is pending.
- Standing habit: Friday update to the boss — small slices, screenshots, plain language.

## The system's shape        <!-- CLI: modules, what talks to what, data flow. Diagrams in words. -->
An internal operating system for an Australian labour-hire agency, built during the trial
(the "OS"). Whole-business scaffold with the Sales module deepest; the flagship surface is
the Timeline. All data is real (client data), never sample.

- Modules (each an app route): Dashboard (KPIs), Sales (leads pipeline with stages,
  contact/rates tracking, AI-drafted outreach copy), Recruitment (applications +
  candidates), Jobs (job orders), Team (workers on file), Workforce (inductions),
  Timeline (fortnight team view + per-person view), Settings.
- Data flow: monday.com is the seed source and backend engine — a live importer pulls
  boards (leads, allocations/tasks) into Neon Postgres; the app reads Postgres; DeepSeek
  drafts copy through one API route; auth is cookie-session based (HttpOnly, signed);
  middleware guards pages and /api returns 401 JSON without a session.

## Stack and conventions     <!-- CLI: languages, frameworks, hosting, repo layout, run commands. -->

- Next.js 13.5 App Router + TypeScript + Tailwind + shadcn/ui (Radix) + Recharts.
- Neon Postgres (@neondatabase/serverless), DeepSeek AI (draft route), Vercel.
- Repo layout: app/ (routes + API), components/ (ui + feature clients), lib/, data/,
  scripts/ (monday.com GraphQL importer), seed/, docs/. Run: npm run dev.
- Design tokens: cream #FAF7F0 bg, charcoal #2B2B2B text, gold accent #C9A24B (links/chips/
  highlights only, never a button bg), Cormorant Garamond for titles + Inter for body, no
  purple, no gradients, no emojis in chrome.
- Timezone canon: Australia/Sydney for all date logic, ONE shared lib/dates.ts helper
  (getTaskUrgency) used by every surface.

## Decisions made (dated)    <!-- CLI: one line each — what was decided, why, newest first. -->

- Aug 28 (day 5): v2 shipped; Timeline is the flagship. Fortnight is the ONLY team view (no
  week/month toggle); the past lives only in the per-person late pill; team + company lanes
  removed (inductions belong to Workforce).
- Aug 28: group ≠ status — the importer reads each item's Status column, never the Monday
  GROUP name (a majority of rows imported wrong); fixed at the source, re-imported to 0
  mismatches.
- Aug 28: completion surfaces — tasks.completed_at set on Mark-done, imported Done rows
  never backfilled; surfaces start empty and grow only as real completions happen ("small
  and true beats big and fake").
- Aug 28: one reward colour only: sage green for completion. No alarm red anywhere;
  severity uses gold/clay/rust.
- Aug 28: date bug root-caused — due-at-midnight vs now() timestamp comparison; fixed with
  ONE shared date helper used everywhere.
- Aug 27 (day 4): v2 scope LOCKED: data integrity first (drop fabricated worker rows,
  filter agent-created rows at import, re-audit mixed boards), then the Timeline.
- Aug 27: auth hardened — middleware exempts only login/logout; every /api path returns
  401 without a session.
- Aug 26 (day 3, the pivot): build a web app, NOT a generic PM app — one killer thing
  shippable by day 14. monday.com becomes seed data / backend engine, never discarded.
- Aug 26: build = lead-management + AI outreach (lead-gen rejected: paywalled, ToS risk,
  paid ads).
- Aug 26: the Timeline is the client's own revealed preference — their one real board is a
  project timeline wearing a Monday board; v2 finishes it. Framing: "you already built this,
  I finished it", never "here's a timeline I designed".
- Aug 26: positioning — the system is always an "internal system", additive, never a Monday
  replacement (the client hasn't decided on Monday).

## Current build state       <!-- CLI: what works, what is half-built, what is next. Newest first. -->

- v2 IS LIVE (Aug 28): dashboard, timeline (team + per-person), sales pipeline,
  recruitment, jobs, team, workforce, settings; auth enforced. HEAD 6a9700c, then the
  day-5 ship record (bcaf7ea). Vercel region sin1.
- Production verified: live dashboard numbers, /timeline works, /calendar 404s (not yet
  built), unauthed /api/leads → 401.
- Completion surfaces empty — correct by design.
- Post-v2 (the trial's remaining days are persuasion, not code): record demo video + short
  message to the client, the ops lead's offered call, the boss's 15 minutes, data-quality
  note for the sales team, day-14 ask. Nothing builds until Chan says so.
- Banked future items: bar drag-to-move, group-events row, importer run-stamp, auto-inject
  sales follow-ups.

## Blocked on access         <!-- CLI: each missing permission and the concrete thing it unblocks. -->

- monday.com credentials only; no admin rights yet — admin would unlock full-board
  reads/writes beyond the current grant (and the AI-created board audit).
- Privacy review of an intake form with the client BEFORE building it.

## Open questions for the boss/clients

- Whether the client keeps monday.com — undecided; the trial must convince.
- Remaining compliance records: who verifies.
- Meaning of "Done" on the ops lead's board.
- External research pending: JobAdder, Connecteam plan/API.

**Upkeep law (same as every canon):** update this file in the SAME session that changes the
reality it describes — a decision, a milestone, an access grant, a direction change. Banking
it later is how canons die. When the trial resolves, this file gets the outcome banner and
either graduates to the client project's long-term canon or freezes as history.
