---
name: trial-indeed-jobadder-reporting
description: Open before any job-board scraping, applicant import, or weekly applications reporting work on the trial.
metadata:
  type: reference
---

# Applications reporting — Indeed and JobAdder (LOOKUP, never at boot)

Banked Sep 14 2026, the session that built it. Public-safe: no client name, no board ids, no
applicant data. Open this BEFORE scraping either job board, importing applications, or
touching the weekly report.

## The shape that was built

Three linked boards on the client platform, all reconciling to each other:

1. **Postings** — one row per live ad, both job boards. Position, location, status, all-time
   applicant counter, new-this-week snapshot, hire type (client labour hire vs the agency
   hiring for itself).
2. **Applications ledger** — one row per application, linked to its ad. Carries the job's
   position and location, the application date, its reporting week, and a date-confidence
   label.
3. **Weekly report** — the operator's actual deliverable: one row per role and site, per-day
   columns Mon-Sun, week total, all-time total, ads running. Two groups: got applications
   this week, got none.

**The grain came from her own words, not from a design instinct.** She asked for "just the
summary, how many new applicants in a day", per role and site. The first design was a
per-application board with a history dashboard; it was wrong and was rebuilt. Ask for the
requester's own sentences before designing a report.

## Stable keys: the thing that makes a weekly refresh safe

Every row carries a key, and the loader skips keys already present, so a re-run adds only
what is new. Proven by running the same import five times.

- **One board gives a permanent per-application reference.** Use it as-is.
- **The other gives none at row level, BUT publishes its own candidate id and job id.**
  Compose `<candidateId>-<jobId>-<date>` rather than hashing names. Check this first: an
  export that looks key-less at the top level often carries real ids in its columns.
- Where the source itself holds genuine duplicate rows, add a numbered suffix so both
  survive rather than one silently vanishing.
- **Never key on candidate name or job title.** Titles get edited, names repeat.

## Three date defects, all silent, all found by replaying

Relative labels ("applied 3 days ago") have to be resolved against something. Each of these
produced plausible, wrong history with no error:

1. **File modification time as the anchor.** Destroyed by any copy, zip, sync or restore.
   Require an explicit `--scrape-date` and refuse to run without it.
2. **The machine's local calendar.** Same inputs gave different dates on a UTC runner vs a
   UTC+8 laptop: roughly one row in twenty moved a day. Format the date key on an explicit named
   timezone, never the machine's.
3. **A transform missing from the handoff pack.** 19 rows could not be reproduced from any
   supplied script; the real file was in the working clone, an older revision had been
   staged. **Build a reproduction pack from the working tree, never from staging copies.**

The general lesson: a data chain is not reproducible until someone re-runs it from the
supplied files on a different machine and hash-matches. A receipt is not a replay.

Reporting rules live in the Locked block of [project-canon.md](project-canon.md).

Platform limits live in [monday.md](../../lessons/platforms/monday.md).

## The weekly refresh is keyed, not merged (rehearsed 15 Sep 2026)

The browser scraper's front-scan mode loads the previous export into memory first and captures
only candidates it does not already hold, so **its export is already the merged set**. Nobody
merges anything by hand. New rows land at the END of the file while being the NEWEST, so a
reorder step moves them to the front; it takes a count, and a wrong count silently mis-orders
every date derived from it. Derive the count as new-total minus last-total and refuse to guess.

Every board load is keyed and skips what is already present, so a re-run creates nothing. That
was rehearsed as four passes on a scratch board: initial 220, re-run 0, delta 120, delta re-run
0, ending at 340 rows and 340 unique keys with zero duplicates. The chain itself was rehearsed
by rebuilding a simulated weekly file and confirming it landed on the known-good dataset with
zero differences on any field that affects a number.

**Rehearse the second run of anything periodic before the client depends on it.** The mechanics
that had never executed were the weekly rollover and the delta load, not the parts everyone
worried about.

Two operational traps worth keeping: a platform item count LAGS (337 reported against 340 real
rows), so verify by counting keys, never the header; and staged file urls expire after an hour,
so upload and import in one sitting.

## Standing gap

Neither job board exposes an API on the client's current plan, so the capture step stays
manual (browser capture plus a file export, about fifteen minutes). Everything after capture
is automated. Say this plainly rather than describing the result as "automated": the honest
claim is that the reporting is automated and the collection is not.
