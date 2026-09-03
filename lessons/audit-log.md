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

## AL-20 — templates/boot-claudeai.mjs · BOOT and LOOKUP

(Audit Aug 30 2026, the table of knowledges: four outside audits plus the browser half's own
read, judged against the disk. Three findings landed here. One: the browser entry ramp
`workflow/relay-boot-claudeai.md` said "read this first" and was pointed at by DIRECTORY only,
so a session that booted by the script did the twelve listed reads and never saw it, nor the
patch-delivery rules in `two-model-relay.md`; by the reachability check the browser boot was
not live. Two: the TRIAL boot was 63,225 chars, and 26,192 of those were files whose triggers
already had homes — the contract names the gauntlet at HEAVY, the canon names monday.md at
monday work, the checklist is a day-one ritual on a trial already on day 7. Every audit named
this from a different side, and the kit's own patterns 8, 12 and 14 argue against carrying
scars as boot. Three: nothing pinned the boot's size, so every new lesson could grow it
silently. Fix: the script prints BOOT (read, byte-counted) and LOOKUP (verified present,
opened at the trigger on its line, fail-closed if missing), the frontmatter carries the
`lookup:` and `boot.budget_chars` blocks, LEAN mode boots the core alone, the state block's
age prints STALE past 14 days, and the boot net pins all of it (17 pins). TRIAL boot after:
38,512 chars. Ladder, each step its own batch with the L24 audit: prose pass on the cold-start
set and the index essay toward ~32K; the three ⭐ judgment files to LOOKUP only if the
behavioral boot check shows the contract's own character paragraph carries them, toward ~25K.)

## AL-21 — templates/_prose_test.mjs, templates/_safety_test.mjs, boot count · batch 2

(Audit Aug 30 2026, the table of knowledges, round 2. Prose net: on Aug 24 2026 commit 7b37b96
at 09:17 wrote trap 3 of qa-gauntlet-pattern.md correctly and commit 37e98b4 at 13:46 pasted
the verify-install paragraph into the middle of its parenthetical; 627 assertions across 11
nets stayed green for six days because every net pins structure and none reads a sentence.
Batch 1 repaired the splice; this net keeps the class closed. The first outside design (audit
1) was tested here and failed seven ways, two of them disqualifying: it walked the filesystem,
so the gitignored LOCAL-ONLY-* files on Chan's machine (pasted chat, lawfully lowercase) turned
it red where it was never run; and its splice pin was a proper-noun blacklist that fired on
"for / Linux users" and "the / Anthropic side" and stayed silent on a real splice opening with
"Next" because Next.js was on the list. The rebuild scans git ls-files only, uses a
sentence-opener whitelist (the trade: it misses a splice whose second half opens with an
unlisted word, and it never fires on a new name), keeps file line numbers by blanking stripped
regions instead of deleting them, adds a quote-parity pin, and self-tests on fixtures every
run. The self-test earned its place on the first run: the inherited abbreviation exemption had
no word boundary, so "al" (et al.) exempted every word ending in -al, "St" exempted test, must,
first, and "Ms" exempted items and forms; anchored, it unmasked one real fragment in
universal-patterns.md line 261 ("or LOST. and modal/negation words"), repaired with L24 (326
tokens, 0 lost). Safety scan: the repo is public by decision (Aug 11 2026) and the
world-readable law was prose only; the scan is the seatbelt, with the allowlist holding the
two contact details Chan ruled public (email; phone, commit 1c962ae). A client-name denylist
was built, then removed before landing: Chan's practice is fake names everywhere, and a
mechanism for a risk already covered by practice is bloat (Chan, Aug 30 2026). Boot count: batch 1 counted bytes, so the CLI's
Windows checkout reported 38,935 and the LF sandbox 38,512 for the same tree, 423 bytes of
CRLF; the count is now characters after normalizing line endings, 38,259 on both, and the
boot net's pin 11 uses the same rule. L24 was also run retroactively on every prose file
batch 1 rewrote: all tokens in place or relocated except the state date Chan bumped on his
own word.)

## AL-22 — the global hub · batch 3a

(Audit Aug 30 2026, table of knowledges round 3. Audit 4 named duplication between the hub
and the contract; the inventory the CLI pasted showed more: the hub, ~/.claude/CLAUDE.md, 74
lines, is versioned nowhere, is auto-loaded into every CLI session, and was pointed at by the
kit as a law home eight times, while carrying a stale copy of a superseded law (the L24 trigger
"more than 25%", replaced by "any rewrite" in universal-patterns; the browser half's batch-1
mistake traced to that copy). Chan ruled Aug 30: laws move out of the hub into the kit; the hub
keeps the @import, the path lines, and the ritual wiring. Applied with one carve-out Chan
accepted: the laws that exist FOR the case where the kit fails to load stay in the hub as a
runtime copy, the same reason the agent files carry their own laws: the fallback read, the
presence check, DEGRADED MODE, the seven, the four. Moved into kit homes, each sentence
grep-verified there before its hub line went: orient-and-report and "Where new facts go"
(lossless move, DIRECTORY before any new file, two-strikes, L24 pointer) into the drill; the
subagent deny brief, the settings.json rule and the no-vision screenshot hand-off into the tool
playbook; the 5-line CLAUDE.md and the project memory's opening line into the checklist; the
smoke test and the hub's own travel note into the migration doc. Laws that already had homes
(plain words, show-first, the deny and its coverage record, WEDGED recovery, the VAR= trap, the
seed, bank-before-compaction, the copy list) lost their hub copies and gained a pointer. The
pin is no new file and no new net: verify-install, which already certifies the machine LIVE,
now reads the hub and pins its invariants, with six mutations in the bootstrap net. Hub after:
under 45 non-blank lines from 74.)

## AL-23 — templates/raw-read.mjs, judgment-sample.mjs --log, the ritual's [pulse] line · batch 3b

(Audit Aug 31 2026, table of knowledges round 4. Audit 4 named two ceremony costs and one
blind spot, and four CLI sessions in a row confirmed them. The ceremony: lean-ctx denies native
Read, the rewrite hook turns cat/head/tail into ctx reads, and the shell allowlist blocks node
-e, so every session wrote a temp .mjs to read a file raw and wrote it again when the temp dir
was cleaned. raw-read.mjs is that script committed once; the hub's fallback read and the tool
playbook now name it, and verify-install treats "temp .mjs" in the hub as a returned duplicate.
The blind spot: the judgment sampler, the only measure of the behaviors the kit exists for
(pushback, screenshots, evidenced done-claims), ran only when someone remembered. Now
judgment-sample.mjs --log appends one dated line of counts to ~/.claude/judgment-log.txt, and
the session ritual prints that last line on every boot with its age, plus the working tree's
dirty count; a sample older than seven days says so and names the command. The sampler is never
run from the hook: a hook must return fast, and a reminder that cannot be missed is the lean
version of a scheduler. Baseline logged Aug 30 2026 by the CLI: 16 sessions, 26 screen claims
without a saved shot, 15 zero-pushback sessions, 57 done-claims without counts. Those numbers
moving is what the last point of the 10 is made of.)

## AL-24 — templates/judgment-sample.mjs · detector v2

(Audit Aug 31 2026, batch 4a. The first sample logged under batch 3b read 17 of 17 sessions
with zero recorded pushback, and the last five of those sessions had stopped twice on wrong
checks in a brief, diagnosed both, refused to touch a file until Chan ruled, and written "my
earlier reading was wrong" about their own topology read. All of that is pushback, and the v1
detector saw none of it: it knew eight phrases ("I'd push back", "I disagree", "better
option"...) and the CLI's vocabulary is "STOP", "reads wrong", "your call", "not drift". A
meter that cannot see the behavior it measures tells the boot line the opposite of the truth.
v2 adds the kit's own STOP vocabulary, matches STOP case-sensitively so "stop the dev server"
still counts as nothing, and stamps det=2 on every log line so the count jump at the changeover
is explained by the line itself. Baseline under v1, Aug 30: 17 sessions, 23 screen claims
without a shot, 17 zero-pushback, 40 done-claims without counts.)

## AL-25 — the cold-start set, the index essay, LEAN · batch 4b

(Audit Aug 31 2026, batch 4b, the prose pass. Audit 3 set a target of a cold-start set under
12,000 chars from 13,460. Measured under L24 the four files gave up 192 chars, all of it
restatement (rule 6 carried rule 7's GO gate three times, the review file restated rule 8, the
hard-rules body repeated its own frontmatter), and nothing else: the files are dense, every
sentence carries a rule, and the remaining words are the repetition the index says these files
exist for. The target was a guess and the rules were not cut to meet it. The index essay lost
its restated state values and gained the LEAN sentence, net flat. The lever that paid was
LEAN: the three ⭐ judgment files uniquely hold the fixed report shape, the park mechanics,
"never build the alternative yourself" and the visual-complaint exception, none of which a
trivial task uses, so under LEAN they are LOOKUP with a trigger, tagged `lean:lookup` in the
frontmatter, and every other mode carries them on purpose. TRIAL boot 38,259 to 38,181; LEAN
29,953 to 22,383. The planned experiment, booting without the three files and asking seven
scenario questions, was dropped as a foregone conclusion: the behaviors those files hold exist
nowhere else, so a session without them cannot produce them; whether sessions with them do is
the sampler's question, now asked on every boot line.)

## AL-26 — the GO law's homes · batch 4c

(Audit Aug 31 2026, batch 4c, the last item on the table's ledger. Every audit named the GO
law's duplication; a grep found its substance in 16 tracked files. Classified one by one: two
law homes (the contract's absolute limit, hard rule 7); four runtime copies that must stand
alone (the three agent templates, pinned by lawcheck, and a project canon, which the checklist
requires to carry it); three lessons (one already a pointer, one written out in the platform
index with its reason stated and a pointer to rules 6-7); five applications of the rule in
context (the index line, the sales playbook, the ramp's sandbox limit, the gauntlet's
description of what push-guard encodes, the checklist's scale ruling); and two restatements.
The relay's standing rule now points at rule 7 with a six-word gloss. The portfolio line held
one nuance that lived nowhere else, whose GO counts: only Chan's own, never another person's,
an agent's, or a tool's output. That sentence moved into rule 7, its one home, and the
portfolio line became a pointer. Sixteen files, two edits, one law made whole.)

## AL-27 — the truth patch · the second table, the freeze, the backlog

(Audit Aug 31 2026. Four outside audits at 5c248ad; two found the same live contradiction:
MEMORY.md line 66 called the priority rule "dormant: no active client engagement since Jul 24"
four lines under a state block saying trial_active: true since Aug 24. The rule built to keep a
client sprint ahead of kit work read as switched off during a client sprint, no net can see a
prose line contradicting the state above it (the staleness gate fires only when a dated entry
is NEWER than the block), and the architect read past the line at every boot of a seven-batch
program run on trial days 6 and 7. The program itself was lawful, Chan commissioned and GO'd
every batch, but the rule was never surfaced to him by the model whose critique law says to
surface it. Fixes here, words only: line 66 is now stateless, it points at the state block for
whether a sprint is active, so that class of rot has nothing left to rot; the two headers that
said 42 patterns now say 50, the true top (audit 3's find; its count of 49 was wrong, the
duplicate 1-2-3 the regex caught are a sub-list, and no kit reference points above 42, so
nothing resolved wrong). KNOWN LIMIT, named and deliberately not netted: no net checks that two
facts in one file agree; a semantic-consistency net is the trap audit 2 named, a mechanism for
a risk one stateless line just removed. FREEZE: the kit is frozen until the trial ends Sep 6
2026, Chan's GO on this patch is the ruling; the trial canon and its workspace are exempt, the
kit is not. BACKLOG, surfaced for Chan at sprint end, per the priority rule: verify by hand
that the 50 pattern numbers are unique and the by-number references still land; the README
stranger's ramp, ten lines, only if the job hunt comes forward; audit the Codex guarded-Bash
launcher's `rg` false-positive on quoted read-only text; nothing else. The weekly
practice stands: node templates/judgment-sample.mjs --sessions 18 --log, and the three pulse
numbers.)

BATCH 5 LIVE: merged to main at 51d5047, Aug 31 2026. KIT FROZEN until Sep 6 2026 per AL-27; the backlog lives there; the trial canon and workspace are exempt; the weekly practice is `node templates/judgment-sample.mjs --sessions 18 --log`. RETIRED Sep 2 by Chan's Codex batch: the guarded-Bash launcher's `rg` false-positive on quoted read-only text, now pinned with `rg`, `Select-String`, and echo cases; and the missing evidence-based Codex done wall, now project-scoped with its own net. The manual 50-pattern/reference check and conditional README stranger ramp remain backlog.

FREEZE EXEMPTION (Chan's word, Sep 1 2026, this session): the Codex doorway and the Codex port (the `codex-doorway` branch: `lessons/platforms/codex.md`, `templates/codex-*`, and the phase-2 slices that follow) are exempt from the Sep 6 freeze. Everything else in the kit stays frozen. The planner missed the freeze at boot and cut the doorway before naming it; the exemption was granted after the fact and is recorded here so the next reader does not have to infer it.
