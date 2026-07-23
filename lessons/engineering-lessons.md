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
  before panicking — and before telling the user their data is gone.
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
- **Soft penalties > hard filters:** bury weak candidates, never hide them — except for a few
  true hard rules. And when a hard rule would return an EMPTY list, relax it and show options
  anyway ("never strand the user").
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

## Data archaeology (from archive Doc B, banked Jul 24 2026)

- Empty tables are findings, not dead ends: schema-without-data means scaffolded-but-never-wired; investigate the wiring, not the data.
- AI-built micro-app sprawl mirrors its source boards 1:1 across platforms (Supabase/Netlify/Monday); map the WHOLE sprawl before consolidating anything.
