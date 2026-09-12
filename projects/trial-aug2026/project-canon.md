# Trial project canon — Australian labour-hire company (ACTIVE, trial started Aug 24 2026)

**PUBLIC-SAFETY HEADER (this file is world-readable; the law is in the README):** written at
portfolio anonymization level — industry named ("labour-hire", Chan ruled KEEP Aug 28 2026, do not re-raise), company never, roles never names, patterns
never credentials, shapes never business data. The mechanical test for every line: would Chan
post it himself, publicly, today? Unsure = no; it goes in the private project repo or a
LOCAL-ONLY file instead. The private repo is the canon for code; THIS file is the canon for
context — what a fresh session needs to plan, review, and brief without seeing the code.

**Status:** FILLED — public-safety review CLEARED Aug 28 2026 (claude.ai); Chan's GO Aug 28 2026.

## The engagement, in five lines
- Role: AI Specialist, 2-week trial started Aug 24 2026. Clients are Australian (tz: +2/+3 vs Manila).
- Working platform: monday.com (gotchas: ../../lessons/platforms/monday.md).
- Access state: monday.com credentials only; no admin rights yet — track what each grant unblocks.
- Chan builds their internal system on the side in his own PRIVATE repo while access is pending.
- Standing habit: Friday update to the boss — small slices, screenshots, plain language.

## The system's shape
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

## Stack and conventions

- Next.js 13.5 App Router + TypeScript + Tailwind + shadcn/ui (Radix) + Recharts.
- Neon Postgres (@neondatabase/serverless), DeepSeek AI (draft route), Vercel.
- Repo layout: app/ (routes + API), components/ (ui + feature clients), lib/, data/,
  scripts/ (monday.com GraphQL importer), seed/, docs/. Run: npm run dev.
- Design tokens: cream #FAF7F0 bg, charcoal #2B2B2B text, gold accent #C9A24B (links/chips/
  highlights only, never a button bg), Cormorant Garamond for titles + Inter for body, no
  purple, no gradients, no emojis in chrome.
- Timezone canon: Australia/Sydney for all date logic, ONE shared lib/dates.ts helper
  (getTaskUrgency) used by every surface.

## Locked (binding on any work now)  <!-- one line each, WITH its scope; the dated WHY is in decision-log.md -->

- group ≠ status: the importer reads each item's Status column, never the Monday GROUP name.
- The Applications importer maps by STABLE Monday column id, never by title (titles are
  client-editable).
- Fortnight is the ONLY team view (no week/month toggle); the past lives only in the
  per-person late pill; team + company lanes stay removed (inductions belong to Workforce).
- One reward colour only: sage green for completion. No alarm red anywhere; severity uses
  gold/clay/rust.
- Completion surfaces start empty and grow only as real completions happen; imported Done
  rows are never backfilled ("small and true beats big and fake").
- v2 scope order: data integrity first, then the Timeline. Auth: middleware exempts only
  login/logout; every /api path returns 401 without a session.
- Sales redesign LOCKED: the byte-verified Pipeline mock is the design source, not prose
  (the day 9 direction and its words: `decision-log.md`).
- Operator email sends use a per-person Apps Script under that operator's account, never a shared script or the platform native email action. Native email cannot CC and attachment capacity is insufficient.
- Framing: "you already built this, I finished it", never "here's a timeline I designed";
  the system is always an "internal system", additive, never a Monday replacement.
- Dated decisions, newest first: `decision-log.md` (LOOKUP). The day 8-9 relay lessons still
  BIND work: `relay-lessons-day8-9.md` (LOOKUP; open before scanning or changing a Monday
  board, client calls or decks, and reference-led design).

## Current build state

- Applicant report (Sep 11): v4 paused at 19/2,304; resume via `applicant-report-resume.md`.
- Mailbox report (Sep 11): two Inbox/Sent batches scanned, read-only; `mailbox-report-resume.md`.
- Operator sends verified by Chan; Day 13 in `decision-log.md`.
- Sales (Sep 8): Pipeline v10 locally complete, unshipped; resume via `sales-redesign-resume.md`. Analytics live since day 6.
- Trial follow-up and future builds: `trial-follow-up.md`; nothing builds until Chan says so.

- Day 6-9 records live in the PRIVATE repo's docs/; this canon mirrors them public-safe.
  Mirroring is a same-session step from now on (gap found Sep 4).
- PENDING: `importer-day8` branch needs merge + a DB run to count as live; GO gates both.

- v2 IS LIVE (Aug 28): dashboard, timeline (team + per-person), sales pipeline,
  recruitment, jobs, team, workforce, settings; auth enforced. HEAD 6a9700c, then the
  day-5 ship record (bcaf7ea). Vercel region sin1.
- Production verified: live dashboard numbers, /timeline works, /calendar 404s (not yet
  built), unauthed /api/leads → 401.
- Completion surfaces empty — correct by design.

## Blocked on access

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
it later is how canons die. Status stays here, one line per surface; detailed resume
instructions for one task go to that task's LOOKUP file, never into this boot-read canon. When the trial resolves, this file gets the outcome banner and
either graduates to the client project's long-term canon or freezes as history.
