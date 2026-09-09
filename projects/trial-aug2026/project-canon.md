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

- Day 13: sprint paused for live operator requests. One-click send buttons on two boards now fire a per-person Google Apps Script under the operator's own account, sending from that mailbox with signature, CC, attachment, and Sent/Failed write-back. Chan verified both end to end. Click-to-dial was set up for the recruitment seat. Lead panel v4 was untouched.

- Sep 8 local v10 build: Pipeline v10 is locally complete with option (b) KPI chips. Next is the lead panel and forms so the sales seat can leave the spreadsheet, then views and cutover, then sourcing. This remains unshipped and client/staff/company details stay in the private project materials.

- Day 6-9 records live in the PRIVATE repo's docs/; this canon mirrors them public-safe.
  Mirroring is a same-session step from now on (gap found Sep 4).
- PENDING: `importer-day8` branch needs merge + a DB run to count as live; GO gates both.
- Sales redesign: direction locked day 9; local implementation began Sep 7 on branch
  `sales-redesign-v10` (K clone) and remains unshipped; before resuming it open
  `sales-redesign-resume.md` (LOOKUP). Analytics live since day 6.
- v2 IS LIVE (Aug 28): dashboard, timeline (team + per-person), sales pipeline,
  recruitment, jobs, team, workforce, settings; auth enforced. HEAD 6a9700c, then the
  day-5 ship record (bcaf7ea). Vercel region sin1.
- Production verified: live dashboard numbers, /timeline works, /calendar 404s (not yet
  built), unauthed /api/leads → 401.
- Completion surfaces empty — correct by design.
- Post-v2 (the trial's remaining days are persuasion, not code): record demo video + short
  message to the client, the ops lead's offered call, the boss's 15 minutes, data-quality
  note for the sales team, day-10 ask. Nothing builds until Chan says so.
- Banked future items: bar drag-to-move, group-events row, importer run-stamp, auto-inject
  sales follow-ups.

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
