# Engineering lessons (from Devoted Care, de-clientized)

## Migrations & data
- **The migrate→cutover trap (bit us for real, Jul 15):** a snapshot data migration is UNSAFE
  while the old write path stays live between the migration and the code deploy. Users kept
  writing old columns in that window; the new reader showed blanks and it looked like data loss.
  Fix: re-run the migration AT deploy time, or have the new read path union-read old columns
  until fully migrated. Corollary: **keep old columns through a migration** (rollback-safe) —
  that's the only reason recovery was possible.
- **Recovery SQL is guarded SQL:** fill only where blank, never overwrite, idempotent, archived
  to a dated file with root cause in the header comment.
- **"Data gone" is usually a display/read-path gap, not data loss.** Diagnose the read path
  before panicking — and before telling the user their data is gone. The guard runs BOTH ways:
  never report the data as fine either until you have queried the rows and seen the values. A
  read-path diagnosis explains the symptom; it is not evidence the stored data survived.
- **Write-here/read-there bugs:** any field written by surface A and read by surface B is a
  standing hazard. Audit those pairs explicitly when refactoring.
- **Audit logs are append-only.** Ruled, never revisited.
- **Manual status flags must reach the logic that matters.** A profile field the engine never
  reads is a trust gap (e.g. someone marked Inactive who still gets recommended).

## Shipping discipline
- **Push = deploy = LIVE.** Full batching and GO law: Chan's hard rules 6-7 (../memory/chan-hard-rules.md).
- **Regression nets pin fixes.** A repeated-churn module gets a small scripted test that locks
  the fix; the net runs before every commit that touches the module. Fix-without-net = not done.
- **Worktree proofs:** test risky changes in an isolated checkout before merging into the batch.
- **Hostile review catches real blockers.** Adversarial self-review (or a reviewer agent)
  BLOCKed shipping ~4 times in one week — each was a real bug. Build it into the cadence.
- **Verify live after deploy.** A green build isn't a verified deploy — sweep the actual
  production screens after pushing.

## Ranking / matching systems (if you build one again)
- **Soft penalties > hard filters:** bury weak candidates, never hide them. The ONLY rules that
  may hide a record outright are ELIGIBILITY rules — the ones that make a match illegal, unsafe,
  or a lie: a missing verified credential, an Inactive or terminated status, a hard availability
  or compliance block. Write that list down per project; anything not on it is a penalty, not a
  filter, and the owner approves additions to it.
  When an eligibility rule would return an EMPTY list, return the empty list and say WHY it is
  empty and which rule emptied it. Never relax an eligibility rule to avoid an empty screen: this
  same file calls "someone marked Inactive who still gets recommended" a trust gap, and relaxing
  is how you produce one. Preference and ranking rules relax freely — that is what
  "never strand the user" means.
- **Trust signals decay.** A "preferred" flag from a stale external system was mostly dead
  records; verify a signal is alive before weighting it.
- **Decouple presentation data from decision data.** Resume/marketing tags describing a person
  ≠ verified credentials that qualify them. Only verified data satisfies hard requirements;
  descriptive data at most nudges ranking — or nothing at all.
- Explain rankings in plain language in the UI ("why is this person ranked here") — trust
  comes from legibility.

## General
- **Display ≠ data.** Removing a UI section is not removing the data; deleting data needs its
  own explicit decision. Keep the distinction sharp when a client says "remove this."
- **Archive, never delete** (pattern 35) — files, columns, features. Everything reversible until proven safe.
- Timezone canon: pick the business's timezone once, apply it in every date computation.
  Server-local dates cause off-by-one bugs that look like logic errors.
- **Pagination needs a unique tiebreaker or it silently repeats and skips rows.** `ORDER BY
  <timestamp> DESC` with `LIMIT/OFFSET` is non-deterministic when the sort key ties — and a
  bulk seed inside one transaction gives every row an identical `now()`, so ties are the
  normal case, not the edge case. Always append the primary key: `ORDER BY updated_at DESC,
  id DESC`. The symptom reaches the user as "I have seen this record already", which costs
  trust disproportionately to the one-line fix.
- **Date-only comparisons need a date-only helper, in one place, in a named timezone.** A
  task due "today" rendered as 1 day late because the due date (stored at midnight) was
  compared against `now()` — a timestamp comparison, not a calendar one. Every view had
  grown its own comparison, so the bug lived in several files at once. Fix: one shared
  `getUrgency(date)` helper comparing calendar dates in the business's canonical timezone
  (documented in a comment), used by every surface; delete all local logic. When fixing,
  report the blast radius — the count of files that had private date math is the measure
  of how overdue the centralization was.
- **A sanity check that writes to a live database must clean up inside the same
  instruction.** "Create a test row and verify it renders" without "then delete it" left a
  TEMP row visible in the product a client was about to be shown — twice in one day, the
  second time as a test-click that marked a real person's real task as completed, which
  would have been the first entry in a brand-new completion feed under the owner's name.
  Before any demo or push: sweep for test artifacts by title pattern AND by
  state-changes-from-today you cannot attribute to a real action.
- **Completion timestamps cannot be backfilled from imported status.** If historical
  records arrive already marked "done," their completion date is unknown — stamping them
  with import time makes a "completed this week" feature announce a hundred fake
  completions on day one. Add `completed_at` set only by the app's own done action, leave
  imports NULL forever, and let recency features count only what the system itself
  witnessed. The number starts small and true and grows with real use — which is exactly
  the story a stakeholder should watch.

## Data archaeology (from archive Doc B, banked Jul 24 2026)

- Empty tables are findings, not dead ends: schema-without-data means scaffolded-but-never-wired; investigate the wiring, not the data.
- AI-built micro-app sprawl mirrors its source boards 1:1 across platforms (Supabase/Netlify/Monday); map the WHOLE sprawl before consolidating anything.

## Reviewing AI-generated code (Bolt-class output, Aug 2026)

A checklist that caught 6 real bugs in generated code:
1. **String-interpolation vs SQL placeholders:** `${i}` where `$${i}` was meant → literal
   `LIMIT 1 OFFSET 2`. Grep every hand-built query string.
2. **Run the full production build** — generated code often passes dev but fails `next build`
   type-checking (= failed deploys).
3. **Data pages need explicit dynamic rendering** or they freeze as build-time snapshots.
4. **Payload audit:** list views that SELECT * including long-text columns for thousands of rows.
5. **Double-writes** when both a helper and its calling route log the same event.
6. **Dead module-level queries** executing at import.
7. **Grep every API route for an auth check before shipping a login wall.** A middleware
   matcher and a set of unprotected route handlers look equally correct in isolation. The
   test is not "does the login page work" but "does an unauthenticated request to the data
   endpoint return 401".
Also verify the golden rule survived: zero invented/hardcoded data; empty query renders an
honest empty state.

## Secret hygiene (the habit, not the incident)

- **Secrets never enter chats, prompts, or commits** — env fields/files only; verify .gitignore
  covers every .env variant BEFORE the first push; strip env files from any zip shared anywhere.
- **The reflex is the point:** "this particular window is probably safe" is how keys end up in
  the wrong window. Rotation after exposure is ten seconds of insurance.
- **When the human declines a security recommendation:** log it once, state it's their call,
  stop nagging. Trust survives; the record exists.
- **Silent fallback secrets.** `process.env.SECRET || 'dev-fallback'` means a missing env var
  downgrades to a constant that is in the repo, and nothing fails visibly. If a sibling module
  already throws on a missing `DATABASE_URL`, the inconsistency is the tell. Session secrets
  throw like database URLs do. (universal-patterns #26, applied to credentials.)
