# Audit log — how the load-bearing rules got their current shape

One dated entry per audit finding that used to live INLINE inside a hot-path rule
(core-shrink slice 2, Aug 28 2026, Chan's 10/10 GO). The rules keep a one-line pointer
(`audit-log AL-n`); the full history lives here and loads only when someone asks WHY a rule
reads the way it does. Law: a new audit finding on a hot-path rule gets its entry HERE and a
pointer THERE in the same edit — never a full parenthetical back in the rule. Entries are
moved verbatim; never rewrite one, append a correction entry instead (banked-fact law).

## AL-1 — workflow/the-drill-and-memory.md · THE DRILL header

(Audit Jul 26 2026: this used to enumerate "steps 2, 3 and 4" for a ritual start while the
no-ritual branch said "all four", telling a literal reader that a ritual start skips step 1 — and
a post-compaction start IS a ritual start, so the skip landed exactly where a summary exists to
be distrusted. An earlier audit CLEARED the same enumeration as unreachable on the grounds that a
fresh start has no summary; that read missed that only ONE of step 1's four triggers is about
summaries. The skip is scoped to the TRIGGER now, never the step.)

## AL-2 — workflow/the-drill-and-memory.md · step 1, bounded transcript read

(audit Aug 2026: "line by line if necessary" told a literal reader to cat the whole file
   and refill the context the compaction just emptied)

## AL-3 — workflow/the-drill-and-memory.md · anchor precedence

(Audit Jul 26 2026:
  three 🔴 lines coexisted in one project index, each naming a different immediate next action,
  and DRILL step 2 dutifully opened all three.)

## AL-4 — memory/chan-hard-rules.md · rule 5, ship flow

(Audit Jul 25 2026: the light branch used to stand bare, so a non-tiny personal project touching production credentials read as light. De-duplicated Aug 24 2026: the trigger restatement that lived here moved wholly into the contract's test.)


## AL-5 — memory/chan-hard-rules.md · rule 1, owner's-actual-surface law

(three batches of statuslines played to an empty terminal while Chan lived in the extension
panel (Aug 2026). See workflow/switch-to-deepseek.md.)

## AL-6 — memory/chan-judgment-mandate.md · the visual-complaint exception

(Audit Jul 26 2026: both rules fired on the same event and neither yielded — the model would
patch the named difference and then also "close the gap" on spacing, type and copy before his
eyes ever confirmed the one fix.)

## AL-7 — memory/chan-review-bottleneck.md · point 1, the fixed report shape

(Audit Jul 26 2026: the most-repeated behavior in the system had no shape and was re-invented
every session.)

## AL-8 — memory/chan-review-bottleneck.md · point 6, parked-state behavior

(Audit Jul 26 2026: this file documents the bottleneck and had no parked-state behavior. The
proposed fix wrote the full rule here; rule 8 already IS that rule, so this is a pointer plus
application detail, per the one-home pre-write gate.)
