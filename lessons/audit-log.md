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

## AL-9 — lessons/universal-patterns.md · 32. **Fewer clicks is a law:**

(Audit Jul 26 2026: the validate-first clause lived only in client-collaboration-lessons.md, which does not call the ordering a law, so a model working from this pattern skipped validation. One home now.)

## AL-10 — lessons/universal-patterns.md · Auditing instruction documents (measured on this kit, Jul 25

(Audit Jul 25 2026: this bullet carried its own rejection figure, which disagreed with the
  receipt row, with no precedence rule between the two files. A distillation must not hold a number
  its receipt also holds — the open reconciliation is recorded on ped-log #3 and settled there.)

## AL-11 — lessons/universal-patterns.md · Auditing instruction documents (measured on this kit, Jul 25

(Audit Jul 26 2026: this rule transcribed a
  five-equals separator while the live builder emits thirty-one with no trailing delimiter, so
  the byte test as written rejected every clean paste it governs.)

## AL-12 — lessons/universal-patterns.md · Auditing instruction documents (measured on this kit, Jul 25

(Audit Jul 25 2026: this used to make "exactly four" an
  automatic FAIL, so a correct four-defect result scored as anchoring and a working prompt would
  have been "fixed".)

## AL-13 — lessons/universal-patterns.md · Maintaining documents (applies to Claude-Core itself)

(Audit Jul 25 2026: the list used to read "numbers, codes, CamelCase, URLs", which cannot see SCREAMING_SNAKE — the exact class of the env vars this rule's own worked example was written from. "codes" was undefined and was carrying the entire rule.)

## AL-14 — workflow/tool-playbook.md · Tool playbook — hard-won operational lessons

(Audit Jul 26 2026: this line used to claim
ONE home for ALL operational tool lessons, which was false as written — freeze rules live in the
freeze playbook — and a model that believed it would stop reading at the wrong file.)

## AL-15 — workflow/tool-playbook.md · Editing files reliably (especially on Windows)

(Audit Jul 26 2026: this file classified
  EVERY permission deny as a decision while the freeze playbook treats the lean-ctx deny as
  permanent machinery and names the shell route past it. Both were right about their own case and
  neither knew about the other.)

## AL-16 — workflow/tool-playbook.md · Test sandboxes contain files, never machine state

(Audit Jul 26 2026: the previous tripwire said a named flag was "safe unconditionally" three
sentences after the ban on naming flags here — the ban's own defect class, installed by the fix
for it, with the header-wins corrective arriving only AFTER the guarantee. Audit Jul 25 2026: the
version before that named `--no-env` as the safe flag while the header had been corrected the
same morning.)

## AL-17 — workflow/qa-gauntlet-pattern.md · The QA Gauntlet — agent team pattern

(Audit Jul 25 2026: this line used to say "personal projects keep QA light", which read
as a sufficient classifier and would have shipped a credentials change with no reviewer at all.)

## AL-18 — workflow/qa-gauntlet-pattern.md · Rules that make it real

(Audit Jul 26 2026: GAUNTLET_OFF carried this
  disclosure duty and BATCH, with the identical persistence property, did not.)

## AL-19 — workflow/qa-gauntlet-pattern.md · 1. **The shell matcher must name EVERY shell-capable tool th

(Audit Jul 26 2026: this paragraph named
   only the first two entries while the README carried all three — the fix for the missing third
   landed in one file and skipped the one the README itself calls the rule's home.)
