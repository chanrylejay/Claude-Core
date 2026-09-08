# Trial Aug 2026 — decision log (LOOKUP, never at boot)

Open this when reconstructing WHY a trial decision was made. The constraints that still bind
work live in the canon's "Locked" block, one line each, with their scope; this file is the
dated history behind them. Same upkeep law as the canon: a new decision lands here in the
session it is made, newest first, one dated line each. Split out of `project-canon.md` on
Sep 7 2026 (batch 0a, lossless move; why: ../../lessons/audit-log.md AL-29).

## Decisions made (dated) — what was decided, why, newest first


- Sep 3 (day 9): v2 proposal deck banked (private repo); Sales redesign direction LOCKED —
  white/light-gray surfaces and a gold accent. No app code on main.
- Sep 2 (day 8): Applications importer maps by STABLE Monday column id, never title (titles
  are client-editable). On branch `importer-day8` — not merged, not yet run against the DB.
- Sep 1 (day 7): monday cleanup + workflow rebuild on client boards; app untouched.
- Aug 31 (day 6): Vercel Analytics added; app otherwise paused — persuasion phase per day 5.
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
