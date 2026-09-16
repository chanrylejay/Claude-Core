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

SEP 4 2026 (trial day 10): the day-6-9 banking-gap audit produced two kit fixes; Chan's word
this session exempts them from the freeze and they LANDED in two-model-relay.md ("Brief
shape — both hands are collaborators"): brief shape scales to the seat, and reference
exports carry an owned manifest. The trial canon gained the same-session mirror law in the
same patch. Recorded here so the freeze ledger stays true.

FREEZE EXEMPTION (Chan's word, Sep 1 2026, this session): the Codex doorway and the Codex port (the `codex-doorway` branch: `lessons/platforms/codex.md`, `templates/codex-*`, and the phase-2 slices that follow) are exempt from the Sep 6 freeze. Everything else in the kit stays frozen. The planner missed the freeze at boot and cut the doorway before naming it; the exemption was granted after the fact and is recorded here so the next reader does not have to infer it.

## AL-28 — reference ZIP exports

(Audit Sep 4 2026: a hand-picked Compress-Archive export omitted the tracked documentation and session banks that give a browser-seat reference its project history, while Windows path handling produced backslash entries. Reference ZIPs come from `git archive` on `HEAD`, include tracked documentation by default, and require an entry listing before sharing.)

Corollary: the assistant's own gates (shell choice, scan regexes) get the same read-before-recall law as platform knowledge; claude.ai reached for PowerShell when the kit said Bash, and shipped a regex that fired on task-shared. Read the kit, then write the gate.

## AL-29 — batch 0a: reconciliation, and the canon split by lifespan

(Sep 6-7 2026, the four-auditor program. Four outside audits scored the kit 8.5 / 8.7 / 8.0 / 8.4, then 7.7 and 7.8 once the primary seat's transitive boot was measured. Attribution, precise: Codex's listed plan on the merged base is 39,308 chars; the reads its own instructions make mandatory are 108,838, because drill step 2 still orders "every marked file" while the frontmatter names four, the contract (CLAUDE.md) makes the DeepSeek cost file LAW before CLI work, and the doorway names platforms/codex.md; adding DIRECTORY and REGISTRY, which the audits selected as lookups but no doorway names, gives 129,922. Three seats had three boot definitions and two parsers. The program's sequence, ruled on the four audits: 0a reconcile, 0b truth patch, 0c safety, 1a shared resolver, 1b routing, 2 format split, 3 ledger and calibration.)

Batch 0a. The remote held a diverged branch (`kit-day8-lessons`, 5 ahead, 15 behind) and local main held two more commits; Codex merged all three through an integration branch, preserving commit identities, and fixed the branch's one pointer failure. The merged boot landed at 42,662, over the 40,000 ceiling by 2,662, because the trial canon had grown by two blocks: a dated decision log, and the day 8-9 relay lessons banked there during the AL-27 freeze. Auditor 3's rule that a batch may not land red on main, and auditor 1's rule that a canon should not hold two lifespans in one bucket, were both accepted. The dated log moved verbatim to `projects/trial-aug2026/decision-log.md` (history; trigger: reconstructing why). The relay lessons moved verbatim to `projects/trial-aug2026/relay-lessons-day8-9.md`, labeled BINDING with task triggers (scanning or changing a Monday board, client calls and decks, reference-led design), because Codex's review of the first cut caught that rules which still bind work had been filed as history under a history-only trigger; the same review restored the scope qualifiers ("Applications importer" on the column-id rule, "v2 scope" on the sequence) that the first Locked block had dropped, since a rule under "binding on any work now" without its subject is a broader rule, and its review of the second cut removed "Applications" from the group-vs-status line (the Aug 28 decision names "the importer"; the incident was the Allocation tasks path) and added read-only scans to every trigger, since the scan rule governs audits too. The canon keeps a one-line-each Locked block, each line with its scope. Lossless: every moved line grep-present in its new file; L24 reports zero lost. The relay lessons are due to be re-homed into `lessons/` in batch 2. Main advanced during the pause (Sep 8, `6b7f583`) with a Sales resume anchor in the canon, and the merge went 468 over the ceiling; the anchor, instructions for one task, moved verbatim to `sales-redesign-resume.md` (LOOKUP, trigger: before resuming that build), and the canon's upkeep law now says so: status stays, task instructions go to that task's lookup.

## AL-30 — batch 0b: the truth patch, the policy diff, and the program's charter

(Sep 9 2026. Why this entry exists: AL-27's known limit was that no net checks that two facts in one file agree; the four-auditor program of Sep 6-8 found that no net checks that two FILES agree either, and that the kit's boot had three definitions. This entry banks the program so the reasoning survives the sessions that produced it.)

The program. Four outside audits (auditor 1: content, 8.7; Codex, from its own seat, 8.0; auditor 3: architecture, 8.4 then 7.7; auditor 4: wiring and evidence, 7.8) plus the architect's (8.5) converged on five defects: one shared resolver is missing (three rituals, two parsers, Codex LEAN differing from browser LEAN by ~15K); the drill's step 2 ("every ⭐/🛑 marked file", 11 files) contradicts the frontmatter (4), so the primary seat's mandatory reads are 108,838 chars against a 39,308 listed plan, and every compaction re-buys that; hand-maintained mirrors (index prose vs frontmatter) generate AL-27-class contradictions by design; routing is global (`mode_default`, `active_project`) where the workspace should decide, so ANO_ULAM boots two canons; and three modes sit 42-77% over budget under a green suite because the boot net pins only the default mode. Sequence ruled on the audits: 0a reconcile (done, AL-29), 0b truth (this), 0c safety (Codex authors: matcher and denylist conform to the live tool-name shape captured Sep 7, default-deny for unknown connector writes with a read allowlist, a SessionStart assert of the push row, fixture provenance; then CI on Chan's GO), 1a shared resolver as an extraction with per-seat compatibility fixtures, 1b routing (workspace mode line, unrelated canons out, per-mode and transitive budgets, cost file and codex.md and DIRECTORY and REGISTRY to lookup, drill step 2 pointed at the resolver), 2 format split (manifest, state with expiry dates, catalog) and hand-maintained mirrors deleted, 3 context-notes trial then ledger and calibration, 4 the artifact gate rebuilt. Decisions still Chan's: a hash-proven boot capsule (auditor 3's spec) after batch 3's ledger shows the boot's share of a real task; CI on a public repo; an auditor's scheduled watch on main.

The truth patch. Codex became the primary hand on Sep 6 (Chan's word); the frozen core, the index RUNTIME line, the relay, and the cost file said the DeepSeek CLI was, and the browser ramp still called itself the only agent with vision (Codex has had vision as evidence since Sep 1). The contract's cost mandate was scoped to the DeepSeek seat: Codex read a 10.8K file about a meter that is not its bill. Contradictions fixed at one home each: README's "more than 25%" rewrite trigger (superseded in the drill Aug 2026, the README copy survived AL-22); the drill's "one line in DIRECTORY" for memory files against DIRECTORY's own exemption; the compaction hook's "ctx_read when Claude-Core is the root" against the drill's law that drill reads are never a compressing layer. Two Codex-seat truths from the ESS session of Sep 7: shell rules are per hand, never per task (a DeepSeek-CLI MSYS2 rule copied into a Codex brief stopped Codex at step 0), and the Windows sandbox live-fire FAILED (`git ls-remote` succeeded), so `[windows] sandbox = "elevated"` is marked unproven and Chan's known-gap decision to proceed on the installed pre-push token hook (kit clone) and the DISABLED push URL (ESS clone) is recorded, not promoted to a rule. Two honest labels: the artifact gate checks a PNG signature and a pass/exit regex (auditor 4 satisfied it with an 8-byte header and a typed pass line), so it is a seatbelt until batch 4; the Codex MCP guard lets a bare `neon__run_sql` through (Codex proved it with a synthetic event through the real wiring, Sep 7), so hard rule 10 stands on the hand until 0c. The cover-message rule: pointer, hash, NOT A GO, nothing else; every rule lives in the brief.

The policy diff. L24 proves fact tokens survive a rewrite and is blind to meaning: Codex and auditor 4 both showed "must never push without GO" → "must push without GO" passing it. `templates/_policy_diff.mjs` works at the clause level (modal, negation, scope words per sentence, plus dropped and added policy sentences) and produces a list for a peer to read, never a verdict. Its first real run, on the architect's own 0a-2 canon rewrite, flagged that the Locked auth line had dropped "middleware exempts only login/logout"; Codex's focused review had passed that line. The drill and README now require it on every policy rewrite, before the peer reads.

The rhythm. Codex measured batch 0a-2 v3 from its session records: 2,443,886 tokens, reviews 51%, the reused reviewer carrying ~200K per response, a compaction plus rereads 531,795, an integration against a moved main 1,734,731 with no agents, reasoning output at max effort a few hundred tokens per response. Input context is the bill. The working rhythm (review sizing by change class, the work split by seat authority, the receipt list, one session per batch with effort set at open, the ledger charging retries and reviews and failed integrations to their batch) is banked in `workflow/two-model-relay.md`, one home; this entry is its why. The same measurement is why the plan's token targets are proven on the ledger, never assumed.

## AL-31 — batch group 0 close-out

Sep 12 2026: batch group 0 (0a, 0a-2, 0b, 0c, fix1) is closed with the architect's fresh-context review done today. Fix1 closes literal `--no-verify`, `core.hooksPath`, unreadable git subcommands and `-c`/`-C` binding gaps; script files, `xargs git`, fresh clones without pre-push, backticks, long-option abbreviations and `--exec-path` remain limits. Chan cancelled fix1 v2: no further push-guard hardening unless he asks; Codex keeps the GitHub credential and the script-file path is accepted risk, do not re-raise (standing home: `platforms/codex.md`). GO stays chat GO, Codex creates the token with `go.mjs`, Codex pushes; no added step for Chan. Token limits and burn are his number-one problem; other kit upgrades are welcome, security overengineering for things that will not happen is not. Branch push and main each await Chan's named GO; group 1a's shared resolver starts architect-authored in a fresh browser session and clone.

## AL-32 — batch 1a: the shared resolver, an extraction with per-seat compatibility fixtures

(Sep 12 2026, architect-authored in a fresh browser session and clone at bb9979c, as AL-31 ordered. Why this entry exists: AL-30 named the defect, "one shared resolver is missing (three rituals, two parsers, Codex LEAN differing from browser LEAN by ~15K)"; this entry banks how the extraction was proven so the proof method survives, not just the code.)

The extraction. `templates/boot-resolver.mjs` now holds the one frontmatter parser (the browser's indent parser, moved) and the one read-plan rule (contract, the ramp for the browser seat only, the index, cold_start, the mode set, the active_project canon; LOOKUP from the index's lookup list; the LEAN carve-out of batch 4b; first listing wins). A seat table makes the ramp the only lawful difference between seats: `browser`, `codex`, and `cli`, whose consumer arrives in batch 1b when the drill's step 2 is pointed at the resolver (nothing runs that entry yet; the fixture says so). `boot-claudeai.mjs` only prints now; `codex/session-ritual.mjs` imports the resolver from the kit at run time, so the installed hook needs no second copy and cannot drift from the browser again. The resolver never throws: problems are named in a list and the consumer decides, the browser boot exiting 1 on any, the hook printing them and exiting 0 because a hook may never wedge a session. An unknown mode still resolves everything else and drops only the mode set, so a hook's plan is maximal and honest rather than two files and a shrug.

The proof, in the order it was done. First, before any edit, each seat's own script was run on the live index and its output captured: the browser boot in all five modes (BOOT and LOOKUP, path and why), the Codex ritual's Read plan (TRIAL, the only mode its hook can reach). Second, the rewritten browser printer was diffed against a pristine checkout of HEAD in all five modes, the default, and the unknown-mode failure path: byte-identical, exit codes included. Third, the captures became `templates/fixtures/boot-expected.json` (6 captured entries, 9 derived and labeled so) against `fixtures/boot-index.frozen.md`, the frontmatter frozen verbatim at bb9979c, and `_boot_resolver_test.mjs` pins the resolver to every entry. Fourth, the same net checks LIVE AGREEMENT: the browser boot's printed lists and the Codex ritual's printed plan both equal the resolver's lists on the live index, the two-files-agree check AL-30 said no net had. The old boot net (18 pins) passed unchanged, which is its own compatibility evidence; the Codex net gained four pins for the loud degrade paths.

What changed in meaning, stated rather than hidden. One: Codex under LEAN now plans what the browser plans (contract, index, hard rules); the pre-1a hook had no LEAN carve-out and would have planned all four cold-start files and the canon, 14,238 chars more at bb9979c, the ~15K in AL-30. Unobservable today, since the hook resolves `mode_default` only and that is TRIAL; it becomes real when 1b's workspace mode line lets Codex boot LEAN. Two: the browser boot exits 1 on a missing `active_project` line where it used to omit the canon silently (the silent-miss class this kit exists to kill). Both are for Chan and the reviewer to keep or veto.

Left for 1b, measured here, not fixed: JOB_HUNT, ANO_ULAM, and CLIENT_BUILD resolve to 70,767 / 66,200 / 57,917 chars against the 40,000 ceiling (the "three modes 42-77% over budget under a green suite" line of AL-30); the doorway's prose read plan in `codex-agents-md.md` block A and the DeepSeek hook's "every marked file" instruction are the two prose definitions still standing beside the resolver, and routing them is 1b's charter. Review scope under the working rhythm: resolver, so an independent hostile review by Codex; no challenger proposed, since the failure mode (a file silently dropping out of a plan) is exactly what the fixtures and the live-agreement pins catch. Chan ruled no challenger the same day.

The send-back, same day, and what it taught. Codex's hostile review on Windows ruled KEEP on all three joint items and returned one finding, R1: `modes[resolved]` on a plain object with `mode_default: constructor` returned the inherited Object constructor, passed a truthiness check, and threw where a mode set was expected; the hook called the resolver outside its import catch, so the patched Codex startup report died (exit 1, no JSON) where the old hook still printed a plan. `toString` and `__proto__` reproduced it, and the seat table accepted the same names as valid seats. The "never throws" claim in this very entry and in DIRECTORY was the contract the defect broke, and the policy diff had listed those added claims as the clauses to read. The v2 patch fixes it at the table, not the symptom: parsed tables are null-prototype objects and both lookups are own-entry (`Object.hasOwn`), so an inherited name is "not in the block", named, and an own entry carrying such a name is a real entry; the hook wraps the resolver calls so a throw is a named failed read with a two-anchor plan, exit 0, one JSON object. The new pins were run against the v1 code first and went red in three nets before going green on v2, which is the only proof a regression pin is real. Codex's ruling on CLARIFY 3 also pulled the browser refinement into v2: a broken index still exits 1, but only after every list that still resolves is printed. Two Windows facts from the same review, banked where the evidence is: a Windows checkout materialized CRLF on the LF-pinned fixture and source paths under `git apply`, which the resolver net then doubled into CRCRLF and went red on, so that pin now normalizes before it builds its CRLF variant; and the `pathToFileURL` import of the resolver from the real kit was proven live by a candidate hook against the live router before any installed copy changed.

## AL-33 — batch 1b: routing — the workspace mode line, the canon rule, per-mode budgets, and the two prose read plans retired

(Sep 12 2026, architect-authored in a fresh browser session and clone at 5fbb3b2, the batch AL-30 charted as "1b routing (workspace mode line, unrelated canons out, per-mode and transitive budgets, cost file and codex.md and DIRECTORY and REGISTRY to lookup, drill step 2 pointed at the resolver)". Why this entry exists: AL-32 measured what 1b had to fix and named the two prose read plans still standing beside the resolver; this entry banks how each was routed, the numbers before and after, every sentence retired on the way, and what changed in meaning, so the reasoning survives the session that produced it.)

Measured first, on the live tree at 5fbb3b2, before any edit: JOB_HUNT, ANO_ULAM, and CLIENT_BUILD booted at 70,767 / 66,200 / 57,917 chars on the browser seat (exactly AL-32's numbers) against the 40,000 ceiling; the TRIAL boot sat at 39,929, 71 chars under. The drill's step 2 ("every ⭐/🛑 marked file") named 11 index lines, 47,031 chars, against a frontmatter `cold_start:` naming four. The routing, one home each: the `active_project` canon now boots in its own mode only (`mode_default`, or any mode whose set already lists it) and is parked as the FIRST lookup line in every other known mode, so ANO_ULAM boots one canon instead of two and JOB_HUNT and CLIENT_BUILD stop paying 6,746 chars for a project they are not working in; an unknown mode keeps the canon among its anchors, the 1a v2 ruling that a broken index still leaves a maximal plan. JOB_HUNT's set shrank to the portfolio state and the skills ledger, the mode's irreducible core (the ledger is the ceiling on what gets cited); the career playbook, the sales playbook, and the email prefs park at their own index lines with sharpened triggers, because a memory file's index line IS its lookup pointer by the drill's own mechanics ("the line must carry the hook: what it is + when to read it") and the pointer net verifies it on disk, so a second line in `lookup:` would be a mirror; the Devoted summary, not a memory file, got a `lookup:` line. ANO_ULAM's set drops the cost file (the canon's own "before ANY model, prompt, or cost decision" line is its trigger). CLIENT_BUILD's set drops the gauntlet, already a lookup line at HEAVY, the treatment TRIAL gave it in batch 1. `lessons/platforms/codex.md` and `DIRECTORY.md` joined `lookup:` with triggers (a Codex runtime, push-gate, sandbox, or shell question; before creating a kit file or to locate one); REGISTRY was there already. After routing, browser seat, the widest: TRIAL 39,955, LEAN 23,975, CLIENT_BUILD 36,819 under the default ceiling; JOB_HUNT 46,035 and ANO_ULAM 48,343 over it, so the frontmatter gained `boot.budget_by_mode` (JOB_HUNT 47,000, ANO_ULAM 49,000): measured tripwires against growth, never targets, each with its number on the line. The ladder back to 40,000 is batch 2's mirror deletion (the index prose still restates the frontmatter) and a lifespan split of the 14.6K ano-ulam canon on the AL-29 precedent. The resolver net now pins every seat and mode on the live index against its budget line, the red line AL-30 said only the default mode had.

The workspace decides the mode. One line, `boot_mode: <MODE>`, in a workspace's CLAUDE.md and its AGENTS.md (the same line in both, one commit), read through one parser in the resolver (`readWorkspaceMode`: no file or no line is "" and `mode_default` applies; both files present and agreeing is the mode; disagreeing is drift, named, and the hook boots `mode_default` rather than picking a side; an unknown name degrades exactly like an unknown `mode_default`). The Codex ritual and the DeepSeek ritual pass the workspace's mode to the resolver and say which source decided; the browser sandbox has no workspace, so `--mode=` stays its override and the state block its default. This replaces the hand-copied file list: the project CLAUDE.md template's READ-FIRST paragraph, retired here verbatim — "list the always-load set here with absolute paths — and if this project maps to a MODE in Core memory/MEMORY.md, that mode's file set as well. The always-load set is (the cold-start trio, chan-hard-rules, boss-operating-protocol, both most-violated files, the drill), so every session self-routes without inference. Put the SAME list in this project's own memory/MEMORY.md marked 🔴 READ-FIRST: the session hook scans that index, not this file, so a list written only here is a list the hook never sees — and an empty scan looks identical to 'this project has no mode'" — still named `boss-operating-protocol`, retired Aug 28 2026 (the drill records the retirement), and told a workspace to mirror the kit's lists in two more places, the mirror class AL-30 named as generating contradictions by design. The checklist's step 2 carried the same two-places rule with its Jul 26 audit, retired here verbatim: "(Audit Jul 26 2026: this step named only the CLAUDE.md line and called it 'the workspace it actually reads' while the hook scans the index — so a mode-mapped project lost its routing silently, and an empty scan is indistinguishable from a project that has no mode.)" The hooks now read the workspace file itself, so that finding's mechanism is gone with its rule; the project memory index keeps its own 🔴 READ-FIRST resume point only.

The two prose read plans, routed. The drill's step 2 read "Re-read the READ-FIRST memory files themselves, not their index lines. The marked lines only tell you WHICH files to open ... Open every marked file, plus chan-hard-rules always, whether or not it carries a marker ... The markers are split across two indexes: the ⭐/🛑 markers in the Core memory index Claude-Core/memory/MEMORY.md, and the 🔴 READ-FIRST markers in the project memory index"; it now names the resolver's printed plan for each seat, the by-hand fallback from the frontmatter, and the markers as an importance and hot-state legend, not a read list. The Codex doorway's block A read "read these in this order, in full: 1. CLAUDE.md 2. MEMORY.md 3. Every file its `cold_start:` list names, then the files listed for `mode_default`, then the `active_project` canon" and named `platforms/codex.md` as a runtime read; it now reads the ritual's printed plan, keeps the by-hand list as the fallback, and opens codex.md at its trigger. The DeepSeek ritual (`templates/global/session-ritual.mjs`) is the `cli` seat's consumer, the entry the 1a seat table pinned and nothing ran: it imports the resolver from the kit at run time as the Codex ritual does, prints "READ PLAN (mode X from <source>, the kit's one resolver; paths under <kit>): ..." in both the startup and the compaction message, names an absent or throwing resolver as "READ PLAN unavailable" with the by-hand rule, and no longer orders `DIRECTORY.md` (27K, on the seat billed per cold reload) or "any READ-FIRST files the MEMORY.md index marks" at boot. The browser ramp's step 3 read "the `active_project` canon — 'what Chan is working on right now'; it makes every fresh clone project-aware, on any machine", retired to a pointer at the script and the resolver's header (the index's `active_project` line and the README's active-project canon law carry the fact), and its opening still said "The CLI (DeepSeek, no vision) is the hands on the real machine", six days after AL-30 made Codex the primary hand: fixed to both hands and the frozen core's who-does-what.

The index paid for its own routing. The router rides every mode, and the frontmatter's new lookup lines and budget map grew it by 2,809 chars, which put TRIAL at 42,738. Four trim passes brought the index from 13,503 back to 10,852 (5fbb3b2: 10,694; both the resolver's UTF-16 count, the unit every budget line uses) with L24 zero lost and every dropped clause either a list the frontmatter carries or a fact grep-present in its file or the contract: the MODES line and the COLD START paragraph now carry only what lists cannot (the workspace rule, the canon rule, the JOB HUNT caveat, the LEAN rationale, the mirror law), the RUNTIME line points at the frozen core for who does what and who can see (keeping PERMANENT, its dates, and "Claude access in VS Code is NOT coming back" verbatim), and the PED, priority, Devoted, cost, and email-prefs lines are hooks whose details sit in their files. One lossless move: the career playbook's index line carried "Devoted closure ran Jul-Aug 2026 and is COMPLETE (Chan, Aug 28 2026); the day-1 checklist fired and is done" while the file itself still said "ACTIVE NOW ... run the day-1 checklist"; the ruling now lives in the file and the line keeps the hook. TRIAL headroom after all of it, v2 included: 45 chars (5fbb3b2: 71; the R2 sentence in the ramp cost 24). That number is the honest state, not a fix: the next canon status line trips the ceiling, as AL-29 hit twice, and batch 2 buys real room.

The proof, in order. The old fixture went red on the new resolver in exactly the nine JOB_HUNT / ANO_ULAM / CLIENT_BUILD entries (three seats), and the new fixture goes red on the 1a resolver in exactly those nine plus the provenance count; the nine are relabeled `routed`, each the 1a entry with only the canon moved from the BOOT tail to the first LOOKUP line, `routedFrom` keeping the 1a label, TRIAL and LEAN byte-identical. The new pins were run against HEAD's code before the new code: the Codex ritual net's five workspace pins, the boot net's four per-mode pins, and the DeepSeek ritual net's eight READ PLAN pins all red on 5fbb3b2's hooks and printer, all green on 1b; the new resolver net cannot load against the 1a resolver at all (the exports it pins did not exist). Live agreement now covers three seats: the browser printer, the Codex ritual, and the DeepSeek ritual (run under a staged home whose Claude-Core is a junction to the clone, with a workspace CLAUDE.md naming CLIENT_BUILD) each print exactly the resolver's list for their seat. Suite on v3's final tree: 23 nets, 0 failed; the DeepSeek ritual net in TEMPLATE mode, 119 ran (151 LIVE on Codex's machine at v2); resolver net 94, Codex ritual 34, boot net 24. Review scope under the working rhythm: resolver and routing, so an independent hostile review by Codex, meaning on the routing and the prose, Windows and runtime integration on both hooks (the junction import path and the workspace read from `input.cwd`); no challenger, the failure mode being a file silently leaving a plan, which the fixtures and the three-seat live agreement catch.

What changed in meaning, stated rather than hidden, for Chan and the reviewer to keep or veto. One: JOB_HUNT boots two files where it booted six; a cover letter or a proposal now opens the email prefs or the sales playbook at the trigger on its index line, not at boot. Two: a session in JOB_HUNT, ANO_ULAM, or CLIENT_BUILD no longer reads the trial canon at boot; the NOW line and the trial card's index line still say the trial is the active track, and the canon is the first lookup line. Three: the cost file is a lookup in every resolver plan, including the DeepSeek seat's, where the frozen core says its habits are "LAW before DeepSeek CLI work"; that sentence is the trigger on its index line, and on the DeepSeek seat it fires at every start, so the file stays a mandatory read there outside the plan's budget: the ritual now names it beside the plan with its size (11,137 chars), and the seat's transitive mandatory reads are the plan plus that file: TRIAL 47,798, LEAN 31,818, CLIENT_BUILD 44,662, JOB_HUNT 53,878, ANO_ULAM 56,186 (the "transitive budget" AL-30 asked for, measured, unbudgeted). Exempting it is Chan's policy decision and a contract edit, HEAVY by definition; folding it into the plan is one seat-table line. Neither was made. Four: the index's prose was pointer-ized against the frozen core and its own files; L24 lists 32 relocated tokens and zero lost. Five: `budget_by_mode` lines above 40,000 exist, labeled as measured tripwires with the ladder on the line.

The receipts lesson, Chan's, from 1a (banked in the relay's Working rhythm, its one home; this entry is its why): the 1a report quoted a policy-diff count measured one edit before the last amend, and Codex caught it. Every receipt is re-measured on the FINAL tree after the last amend, and only that run is reported: the hash, the boot line, the suite line, the L24 and policy-diff counts, and the character measurements a budget line quotes. This entry's numbers were measured last, after its own text was written.

Left for batch 2, measured here: the index prose still mirrors the frontmatter (the MODES line, the mode comments) and the ramp's boot section still describes the script; deleting the mirrors is the charter. TRIAL headroom is 45 chars. The ano-ulam canon holds a Jun 6 status snapshot and dated decisions beside its living rules, the two-lifespans shape AL-29 split for the trial. The trial card says the trial ended Fri Sep 4 while the canon carries Day 13 work of Sep 11; whether it extended or converted is Chan's word, and the card's own law says the card and the NOW block update together when he gives it.

Codex review of v1 (Sep 13 2026, on Windows): SEND-BACK, three findings, all reproduced and all mine. R1: the workspace-line regex used `\s*` around the colon, which spans newlines, so an AGENTS.md reading "boot_mode:" followed by a blank line and "LEAN guidance belongs to later prose." selected LEAN silently, with no problem named and the mode set dropped; v2 binds the declaration to its own line (only spaces and tabs inside it), names an empty or comment-only value as a problem that falls back to `mode_default`, and pins Codex's exact input through the parser, the resolver net, and the Codex ritual. R2: block A's by-hand fallback fired on ANY failed read the ritual reported and ordered every `cold_start:` file without LEAN's carve-out, so a correctly routed LEAN workspace whose project memory index was missing (an ordinary condition, the kit's own checkout included) would rebuild a plan 7,492 chars larger than the one the ritual had just printed; the drill's header carried the same trigger and the ramp and the DeepSeek ritual's by-hand strings carried no rules at all. In v2 every fallback fires only when the plan itself is unavailable (the ritual absent, its plan line missing, or the resolver named as the failed read; any other failed read is a file to fetch) and state the resolver's three rules (LEAN parks the `lean:lookup` cold-start files and the canon; an unknown mode adds no set; the canon boots in its own mode only), with the meaning pinned in the resolver net, not merely the words. R3: the v1 brief's install step named the DeepSeek hook and the Codex doorway and forgot the third installed copy the patch changes, `templates/codex/session-ritual.mjs` → `~/.codex/hooks/session-ritual.mjs`; the installed Codex hook still ignored `boot_mode: CLIENT_BUILD` and reported TRIAL against the same payload the candidate routed. The v2 brief carries all three mappings, the byte verification, and the runtime assertions after each. On the CLARIFY answers: C1 flagged (a lookup does not waive the frozen core's LAW read on the DeepSeek seat; v2 reports it, item Three above, instead of counting it gone), C2, C3, C5, C7, C8 kept, C4 kept the spelling and sent back the parser (R1), C6 kept the relocations with the index receipt corrected to the measured count, C9 kept the pointer count with the accounting corrected: the net counts path occurrences, ten removed and three added across the index, the checklist and the drill, not "six paths". Codex's suite on the staged tree: 23 nets, 2 failed, both installed-copy drift the re-plant clears (the copies net and the LIVE ritual net refuse to certify a template that differs from the installed file, by design); resolver 80, browser 24, Codex ritual 32, pointer 368 green; the junction import passed on Windows and both hooks emitted their workspace-mode lines against synthetic SessionStart payloads. The v1 patch was never applied to an installed file or committed; v2 was a new file with a new hash. Codex review of v2 (Sep 13 2026): SEND-BACK again, two findings, both mine. R2 was half closed: the by-hand fallbacks now fired only on an unavailable plan and kept LEAN's carve-out, but said the canon is "a lookup in every other mode", unknown included, where the resolver keeps it as an anchor (6,746 chars apart on the recovery path), and the wording pin held the wrong words in place; Codex named the limit (C10): a wording pin proves the wording survived, not that four restated rules agree with the code. Version 3 states the unknown-mode anchor in every home (block A, the drill, both DeepSeek strings), rewrites the pins to require it and labels them as wording checks, and adds the behavior pin for the unknown-mode recovery path beside LEAN's. R4, new: the per-file parser appended "booting mode_default" to an empty declaration before the second doorway file had been read, so an empty CLAUDE.md beside a valid AGENTS.md announced a fallback that never happened while correctly selecting CLIENT_BUILD; version 3 lets the parser name only the missing value and has readWorkspaceMode claim the fallback once, on the last problem, only when both files leave no usable mode, with Codex's repro pinned whole through the parser and the Codex ritual. Receipts corrected the third time by the same lesson: the index's L24 relocation count was measured one edit before the last amend (the base token "31" of "Aug 31" had sat inside the figure 48319 and left with 48343), so version 3 runs every receipt in one block after the final byte and quotes only that run. Codex's v2 landing on Windows: all three re-plants byte-verified, machine arming 60/60, copies 12 checked with zero drift, 23 nets green including the LIVE DeepSeek ritual at 151 assertions (an earlier ten-pin red was Codex's own fixture under Downloads, which the graph tool refuses to scan; corrected, rerun, kept in the evidence), and the installed hooks emitting the workspace-mode, READ PLAN and contract-mandated lines against synthetic SessionStart payloads.

## AL-34 — group 1 close-out banked; batch 2a, the boot diet: the index as a manifest, the mirrors retired, the cost file cut to its law, the ano-ulam canon split by lifespan, the overrides gone

(Sep 14 2026, architect-authored in a fresh browser session and clone at 13f20e0, the batch AL-30 charted as "2 format split (manifest, state with expiry dates, catalog) and hand-maintained mirrors deleted", recut on Sep 14 as 2a, everything that changes what a boot reads on any seat. Why this entry exists: it banks two things nothing else holds. First, the group-1 close-out review of Sep 14 (v4, accepted by Codex the same day, its confirmation under the verdict) was never entered here. Second, the diet retired every prose mirror the index carried, and a retired sentence that is nowhere on the tree is a deletion; this entry is where each one went, the numbers before and after, measured last, and what changed in meaning.)

The group-1 close-out, banked. Verdict: group 1 (1a, 1b v3) CLOSED, ACCEPT, reviewed under the working rhythm's group rule (interactions and accumulated change only; what Codex accepted unchanged on Sep 13 keeps its verdict). Codex confirmed on the machine, review only: all 148 tracked-file hashes and the three installed-copy hashes matched the accepted receipts, the final suite stood at 23 nets green with the DeepSeek ritual at 151 LIVE, local main 13f20e0 clean, nothing landed or pushed. Six findings, none a send-back: G1-1, the resolver header's summary said the canon boots only in its own mode and "every other mode carries it in LOOKUP" while the rule at resolveBoot says every other KNOWN mode and an unknown mode keeps the canon as an anchor (fixed in this batch, the header states both). G1-2, the state block and the trial card were past their dates (updated Aug 30; the card said the trial ran Aug 24 to Fri Sep 4; the canon carried Day 13 work of Sep 11): Chan's word, given Sep 14, is below. G1-3, the DeepSeek seat's cost read was measured and unbudgeted (11,137 chars outside every plan; transitive TRIAL 47,798): the diet, chosen with the 2a GO. G1-4, the mirrors still standing by charter: the NOW line (873 chars), RUNTIME (461), the MODES rationale (1,304), COLD START (346), one catalog line per memory file restating its own description, and the "one durable fact per file" law in three homes. G1-5, the pre-1a baseline of plan v5 (F20) never happened: no ledger, benchmark, or baseline file on the tree; dropped (Codex, Sep 14; F36 is usage history, not a comparable baseline), controlled task measurements start in batch 3 against the post-2a boot, the character receipts stand as history. G1-6, Codex's machine: both Temp fixture directories from the 1b v3 helper were removed after Chan's cleanup GO; the missing project memory index under the kit's own projects key stays reported and uncreated, as ruled. Roadmap recut: batch 2 splits by token yield into 2a (this) and 2b (DIRECTORY generated, freeze-parked lessons re-homed, pattern 51, the universal-patterns lookup line, the F30 sandbox ramp step), off the boot path, starting only on Chan's say after 2a's numbers; model tiering, ledger columns, and tool-output compression are 2c and 3. F18 (the policy diff) moved to done, landed in 0b. F14 is 2a's `review_by` metadata; per-field expiry automation is a separately scoped resolver change, deferred, no gate claimed. Settled Sep 14 by Chan's word or Codex's ruling: the trial (extended until Chan says so, about two months), the staleness rule's home (beside the state block, automation deferred), F20 (dropped), the DeepSeek cost read (the diet), Chan's project-session effort (xhigh). Still Chan's: the GO to cut 2a; the GO for Codex to author 2c, which includes the `~/.claude/settings.json` change; CI on the public repo (no workflow exists); auditor 4's scheduled watch, keep or cancel; the boot capsule, after batch 3's ledger; when 2b starts. Charging: the close-out review to group 1; the reconciliation, the brief, and this batch to batch 2.

Measured first, on the live tree at 13f20e0 before any edit, both brief tables reproduced exactly: browser TRIAL 39,955 (45 under the ceiling), LEAN 23,975, CLIENT_BUILD 36,819, JOB_HUNT 46,035, ANO_ULAM 48,343; Codex and CLI plans 36,661 / 20,681 / 33,525 / 42,741 / 45,049; the DeepSeek seat's plan plus its contract-mandated cost read 47,798 / 31,818 / 44,662 / 53,878 / 56,186. The index 10,852 (frontmatter 3,590, prose 7,262), the cost file 11,137, the ano-ulam canon 14,591, the ramp 3,294. Suite 23 nets, 0 failed.

The index is a manifest. The frontmatter is now the one home of every list and of the live state; the prose is a title, Chan's one-line basics, and one paragraph saying so, plus the LOCAL-ONLY pointer. Where each retired line's substance went, one home each. The NOW line: its facts are the state block's values, and its staleness test sits beside the block as a comment with the SAME two conditions (a dated STATUS entry in the boot newer than `updated` AND about engagement status, the active track, or portfolio/demo state), the comparison set now named on the line (a state value, a lookup trigger whose hook is a date, the header of a BOOT-read file such as the trial card or the canon) and `review_by` dates excluded by name, since a look date is not a status. The RUNTIME line: who does what and who can see was already the frozen core's; "Claude access in VS Code is NOT coming back, plan around this, never around its return" and its PERMANENT ruling (Chan, Sep 2 2026) now live in the cost file's posture, the one home the line itself named for the Codex posture, with the mechanics pointer (`../workflow/two-model-relay.md`) and the Sep 6 primacy inversion recorded in the cost history. The legend (⭐ core, ⭐⭐ most-violated, 🛑 hot state, 🔒 hard gate) moved to the drill's "mark recency and priority" bullet; the markers live in each file's description, and a lookup trigger may carry 🛑 (the trial card's does). The MODES line and the COLD START paragraph: the lists were already the frontmatter's; the workspace rule, the canon rule, and LEAN's carve-out were already the resolver header's, the home the ramp and the drill point a scriptless session at, so the index restating them was a mirror of the header; the two rationales the header lacked moved into it (the judgment files ride every boot ON PURPOSE because no hook can enforce a judgment behavior, so repetition is its only mechanism; LEAN parks them because a trivial task writes no UI report and parks no decision); the JOB HUNT caveat became the skills ledger's lookup trigger, since the clause is the trigger. The catalog: every tracked memory file outside `cold_start` now has exactly one `lookup:` line whose comment is the trigger (WHEN to open it); WHAT it is lives in the file's own `description:` and nowhere else, the accepted trade being one targeted read when a description is needed. Two catalog clauses existed nowhere but on their index line and were re-homed into their files before the line left: the priority file now says the state block's `trial_active` line decides whether a sprint is active, never the file (why: AL-27), and that a kit idea goes to this log's newest AL entry until Chan says it starts; the PED log now carries its gate (gate any prompt that gets reused, leaves this machine, or touches career or client data; unsure = gate it or ask). The `budget_by_mode` lines (JOB_HUNT 47000, measured 46035 on the browser seat; ANO_ULAM 49000, measured 48343) are gone: every plan measures under the one ceiling, an override permits growth, and the live net compares against whatever line exists, so none is retained as protection; thin headroom is a number in the receipts, never a looser line. `review_by 2026-11-14` sits as a comment beside `trial_active`, `job_hunt`, and `mode_default`, labeled Chan's estimate, never a fixed end; no consumer parses it and no expiry gate is claimed (the browser boot script's 14-day age warning on `updated` stays the only automated check). The retargeted pointer net proves the shape: rule 1 now reads the frontmatter raw and requires each tracked memory file in `cold_start` once with no lookup line, or in `lookup:` exactly once with a trigger; the machine-only LOCAL-ONLY class stays out of both lists (a missing lookup is a boot error on a clean clone) and keeps its prose link with the clone-absence disclosure pin 2 already checks.

Retired verbatim, so the L24 audit finds every token of the old index alive here rather than in a file no clone gets: the six mode comments ("# mirror of the MODES prose line below, edited together, always; ADDITIVE (cold_start always loads); the workspace's `boot_mode:` line picks the mode (batch 1b)", "# the rest parks at its index line (batch 1b)", "# the cost file parks at its index line (batch 1b)", "# the gauntlet is LOOKUP below, at HEAVY (batch 1b)", "# = trial card + canon (batch 1, Aug 30 2026); the CLIENT_BUILD set + monday.md are LOOKUP below", "# trivial tasks: contract + index + hard rules; the canon and the lean:lookup files park in LOOKUP"), the budget comments ("# ceiling for every seat and mode unless budget_by_mode names a higher one; the resolver net goes red above it (ladder: AL-20)", "# measured tripwires, never targets (batch 1b; AL-33)", "# measured 46035, browser seat", "# measured 48343"), and the prose of 13f20e0 in full:

```
# Memory Index — Chan (portable)

- Person basics: Chan (Chanryle Cagara), chanrylecagara@gmail.com, Quezon City PH. Builds fast with AI help, reviews as the boss. Plain words, no em dashes.
- NOW (Aug 30 2026), mirroring the frontmatter state block, the live-state source: 2-week CLIENT TRIAL ACTIVE (Australian clients, monday.com platform; see chan-trial-aug2026) is the track; job hunt backgrounded behind it; Devoted ENDED Jul 24 2026, closure checklist ALL DONE; portfolio demo v2 live. Edit the block and this line together when any of it stops being true. Staleness test, mechanical, BOTH conditions required: a dated entry elsewhere in this index is NEWER than the block's date AND is about engagement status, active track, or portfolio/demo state; a newer date on any other subject says nothing about this block. When both hold, the dated entry wins: say so and confirm the current state with Chan before this block decides anything (client-active, QA path, mode routing). (why two conditions: ../lessons/universal-patterns.md, "Gates that always fire").
- RUNTIME (PERMANENT, Chan Sep 2 2026; primacy inverted by Chan Sep 6 2026): two hands are live on the real machine, Codex PRIMARY and Claude Code on the DeepSeek endpoint secondary; who does what and who can see: the frozen core. Claude access in VS Code is NOT coming back — plan around this, never around its return. Codex's account limits, free month, model, and effort posture: [[chan-ai-cost-context]], one home; mechanics: ../workflow/two-model-relay.md.
- Legend: ⭐ core · ⭐⭐ most-violated, read twice · 🛑 hot state, check before acting · 🔒 hard gate.
- MODES, additive (the cold-start set always loads too), read before working: the lists live in the frontmatter `modes:` block, the kit's one resolver expands them (why: ../lessons/audit-log.md AL-20, AL-32, AL-33); this prose carries only what lists cannot. JOB HUNT caveat: engagement numbers are SOURCE MATERIAL; the skills ledger is the ceiling on what gets cited. LEAN: the three ⭐ judgment files tagged `lean:lookup` park in LOOKUP, since a trivial task writes no UI report and parks no decision; every other mode carries them on purpose (batch 4b). A file routed out of a mode set parks at its trigger: a memory file at its index line here (the pointer net verifies it), any other file in `lookup:`. THE WORKSPACE DECIDES THE MODE (batch 1b): a project mapped to a mode carries ONE line, `boot_mode: <MODE>`, in its CLAUDE.md and AGENTS.md (same line, one commit); the session hooks expand it, so a workspace never hand-copies these lists; `mode_default` is the fallback (no line, the kit folder, the browser sandbox). The `active_project` canon boots in its own mode only; every other mode parks it as the first LOOKUP line. Prose and frontmatter are mirrors: a mode-set change edits BOTH in one edit; the resolver net pins every listed file present and every seat and mode under its budget line.

Read top-down. COLD START: OPEN the resolver's BOOT plan (contract, this index, the `cold_start:` set, the mode set, the canon in its own mode), all RAW (Bash, never ctx_*; the law is the drill, a LOOKUP above). The ⭐⭐ files ride every boot ON PURPOSE, LEAN excepted: judgment behaviors no hook can enforce, so repetition is their only mechanism.

- [⭐ Chan's HARD rules](chan-hard-rules.md) — rule-0 THE DRILL · show-first · 🔒 ship in batches (no push/deploy without explicit GO) · DB safety · judgment mandate.
- [⭐ Chan's judgment mandate](chan-judgment-mandate.md) — don't just execute edit lists; self-rate every surface 1-10 and close the gap.
- [⭐ Career/portfolio state](chan-career-portfolio-state.md) — career track state (trial active Aug 2026, job hunt backgrounded); portfolio/resume/LinkedIn state + confidentiality canon.
- [⭐⭐ Directives are NOT absolute](chan-critique-directives.md) — critique every directive (client's OR Chan's) + propose better; the owner decides.
- [⭐⭐ The review-bottleneck lesson](chan-review-bottleneck.md) — Chan is often the single reviewer: plain language, screenshots, small slices.
- [⭐ Visual complaint → open the reference first](chan-visual-complaint-open-mock-first.md) — compare anatomy vs the reference image before measuring.
- [Priority: client sprint over hygiene](chan-priority-client-sprint-over-hygiene.md) — WHEN a client sprint is active (the state block's `trial_active` line decides, never this line; why: AL-27), it beats internal cleanup: kit ideas go to the backlog (lessons/audit-log.md, newest AL entry) and Chan says when they start.
- [Chan-voice writing + job email prefs](chan-job-application-email-prefs.md) — open before drafting any Chan-voice text: no em dashes in ANY Chan-voice text; the cover-letter and job-email laws (links, legal name, honest fit first, AI-assisted dev + flexible hours) and contact info inside.
- [🛑 Client trial ACTIVE](chan-trial-aug2026.md) — 2-week trial, Australian clients, monday.com platform; the current track (banked Aug 28 2026). Check before routing modes or promising availability.
- [🛑 Devoted Care — ENDED Jul 24 2026](chan-resigned-devoted-jul15.md) — resigned Jul 15, handoff complete Jul 24 (the dates inside). Fully hands-off: no client-system actions, ever.
- [Pre-Devoted assets (Apr-Jun 2026)](chan-pre-devoted-assets.md) — live apps, portfolio numbers, the private prompt vault (DO NOT TOUCH), security rulings SETTLED, do not re-raise.
- [⭐ Skills ledger + origin story](chan-skills-ledger.md) — THE canonical source for anything career-facing: skills, tools, metrics, the origin arc.
- [⭐ Career Resilience Playbook](chan-career-playbook.md) — open at a career decision or an engagement ending: standing posture, day-1-if-engagement-ends checklist (fired for Devoted, closure COMPLETE Aug 28 2026), side-project flywheel.
- [⭐ Freelance sales playbook](chan-freelance-sales-playbook.md) — open at an Upwork proposal, a rate question, or an interview frame: Upwork laws, Zero-Call strategy, rate tiers ($35/hr display, flat T1-T4), no-benefits +₱3-5K rule, interview frames, employment history.
- [LOCAL-ONLY security rulings](LOCAL-ONLY-security-rulings.md) — the six settled rulings with site names and paths; gitignored, THIS MACHINE ONLY (absent in a fresh clone). Do not re-raise them.
- [Personal facts](chan-personal-facts.md) — married (the MSI is his wife's), cat named Khaku, hardware notes.
- [PED = validated prompt auditor](ped-prompt-auditor.md) — TWO production builds split by runtime: v7.0.2 on claude.ai (validated 10/10 Jul 25 2026) and v6.4.3 on DeepSeek web (the free daily driver). Chan is the courier; bare "audit" works on both; the fallback invocation for older builds is inside.
- [PED audit log](ped-log.md) — one line per PED audit (regression memory, case-study raw material); gate any prompt that gets reused, leaves this machine, or touches career/client data; unsure = gate it or ask.
- [AI cost context](chan-ai-cost-context.md) — open before DeepSeek CLI work or any AI cost or model decision: Chan runs on his own DeepSeek key since the engagement ended (switch runbook in workflow/); DeepSeek peak pricing since Aug 16 2026 (the session hook prints the windows); the four session habits inside are LAW before any CLI work; the kit-lean law inside binds every seat.
```

The cost file, cut to its law: 11,137 to 3,782 chars. What stayed is what the contract and the index trigger name as LAW: the posture in Chan's words (Codex primary since Sep 6, the DeepSeek CLI secondary until he says otherwise; his free ChatGPT Plus month and that he says when it ends; kit sessions on gpt-6-astra, confirmed intentional Sep 14; project sessions such as ESS on luna at xhigh, his verbatim "its xhigh" of Sep 14 2026; Codex only under his own account and never billed to the DeepSeek key, so the kit-lean law decides its work; the Aug 24 ruling to keep the key; no new AI spend until a client is secured), the kit-lean law (every seat), the master habit with the gauge thresholds, the four session habits with the cache mechanics that bind inside them (settings changes bust the cache, rewind before compact, compact before a break), the scoreboard's installed-hook check, and the soft cap. Everything dated moved verbatim to `memory/chan-ai-cost-history.md`, a lookup: the arc, the first-contact proof of Jul 29, the measured session costs, the audit that re-ranked the habits, the gauge verification, the cache-mechanics source, the market note, the free-tier toolbelt. The DeepSeek ritual reports the new size live (its C1 pin reads the file). The contract is unchanged; the seat's mandatory read is counted separately below.

The trial card and the state block, edited together on Chan's word of Sep 14 2026, verbatim: "extended until i say so estimated 2 months". `trial_active: true` stays, TRIAL stays `mode_default`, the 🛑 stays; the card's dates line keeps the original ten weekdays and adds the extension with `review_by: 2026-11-14` as his estimate, never an expiry, and its expiry law now names the state block instead of the NOW block. C7 held: nothing inferred beyond his sentence.

The ano-ulam canon, split by lifespan on the AL-29 precedent: 14,591 to 12,120 chars. The dated narrative of the Jul 23-28 migration (the broken site, the measured root cause) and the Jun 6 status snapshot moved verbatim to `projects/ano-ulam/status-log.md` (a lookup: resuming the project or verifying its state; a DIRECTORY line). The living rules inside those sections stayed in the canon under "Model and cost rules": the cost-file-first rule (the trigger AL-33 relies on), that DeepSeek cannot do the daily extraction on this plan and the PDF is read in code, the completion-token check before theorising, the stale tool-calling note, the account facts, and the standing PED rule for any shipping AI prompt; the log's copy of the root-cause paragraph ends where the rule begins rather than restating the two sentences. The v3 STEP 0 gate moved with the history but is labeled BINDING with its trigger (before any v3 or AI-feature work), and the canon says so, because a rule that still binds work filed under a history-only trigger is the exact mistake Codex caught in 0a (AL-29); the trial canon's own upkeep law (task instructions go to that task's lookup, never into the boot-read canon) is the same ruling applied.

F25, the retrieval-unit law: the drill's memory-system mechanics are its one home ("one retrieval unit per file: one durable fact, or one coherent set a single trigger opens"); README's upkeep map and DIRECTORY's memory section point there instead of restating "one durable fact per file", and DIRECTORY no longer calls the index "the only home for memory descriptions", since the file's own description is. The drill's pointer mechanics now describe the manifest line (cold_start or lookup with a trigger) instead of "a one-line pointer ... read on demand". README's active-project law no longer names the NOW line, and the DeepSeek switch runbook's "paste this into the NOW block" step is marked DONE with the fact's real home, the frozen core. The ramp's boot section is the command plus the report line (3,294 to 2,586 chars), its fallback sentence kept verbatim for the R2 pin; the two-hands-and-who-sees sentence and the hostile-review bullet were restated frozen-core and cold-start content and left.

The nets. The pointer net's rule 1 retargeted as above, with two new pins (no LOCAL-ONLY path in the lists; the prose links only the LOCAL-ONLY class). The boot net's mutation pin 23 plants a `budget_by_mode` line on its temp copy when the live index carries none, so the override mechanism stays proven instead of the pin silently ceasing to run; pin 24 requires no live override. The resolver net's routed-reads pin now checks the cost file's `lookup:` trigger instead of grepping its catalog line, and five batch-2a pins were added: no override on the live index with every seat and mode measured against `boot.budget_chars`; the prose is not a catalog and carries no NOW, RUNTIME, or MODES line; every tracked memory file outside `cold_start` has exactly one lookup line with a trigger and the LOCAL-ONLY class none; no path appears twice across BOOT and LOOKUP for any seat in any mode; the resolver header states the KNOWN-mode canon rule with the unknown-mode anchor (G1-1) and the two rationales moved out of the index. Run against a pristine 13f20e0 checkout with the new nets copied in, red first: resolver net 5 failed (the routed-reads pin and four of the five new ones; the dedup pin was already true on the base), boot net 1 failed (pin 24), pointer net 15 failed (fourteen memory files with no manifest line, and the catalog pin); all green on the cut. No parser, resolver, hook, or installed file changed: the resolver's only edit is its header comment, so 2a's review scope stays content and routing.

After, on the final tree, the resolver's counts. Browser: TRIAL 34,023 (5,977 under; 45 before), LEAN 17,572, CLIENT_BUILD 30,416, JOB_HUNT 39,632 (368 under), ANO_ULAM 39,469 (531 under). Codex and CLI plans: 31,437 / 14,986 / 27,830 / 37,046 / 36,883, every one under the one ceiling with no override source. The DeepSeek seat's plan plus its mandatory cost read: TRIAL 35,219, LEAN 18,768, CLIENT_BUILD 31,612, JOB_HUNT 40,828 (828 OVER), ANO_ULAM 40,665 (665 OVER). Files (the resolver's UTF-16 count, the unit every budget line uses): index 5,157, ramp 2,586, cost file 3,782, ano-ulam canon 12,120, trial card 2,213 (the trial canon untouched at 6,746, the R2 pin's number). Suite on the final tree: 23 nets, 0 failed; resolver net 99 (94 before), boot net 25 (24), pointer net 382 (368), prose 241 on 78 tracked files (235 on 76), safety scan 20 on 150 tracked files, Codex ritual 34, copies 59, lawcheck 17/17, the DeepSeek ritual 119 TEMPLATE in the sandbox (the machine cert stays Codex's LIVE run). L24 against 13f20e0, zero lost on every rewritten file: the index 241 tokens (154 in place, 87 relocated), the cost file 180 (68, 112), the ano-ulam canon 263 (216, 47), the ramp 52 (46, 6), the trial card 39 (38, 1), the switch runbook 179 (177, 2), the drill 124, README 91, DIRECTORY 537, the priority file 15, the PED log 212, this log 556, all in place. Policy diff against 13f20e0, the lists Codex reads (flagged clauses): the index 38, the cost file 52 (its DROPPED sentences are the paragraphs that moved verbatim to the history file, which L24 proves), the ano-ulam canon 10, the ramp 11, the drill 4, DIRECTORY 4, the switch runbook 3, the trial card 2, the priority file 2, README 1, the PED log 1. This entry's numbers were measured last, after its own text was written, and re-run once more after these counts were pasted in; both runs agreed.

Four targets the cut did not meet, each a named exception for Chan, none a ruling. One: the index is 5,157, not 4,500. The brief's arithmetic assumed the frontmatter stayed at 3,590 while its own rule 1 adds sixteen lookup lines (about 1,400 chars of paths and triggers); every trigger is already the hook and nothing else. Two: the cost file is 3,782, not 3,500, and its law does not fit 3,000 without dropping a habit or the posture. Three: the ramp is 2,586, not 2,300. Four, the consequence: the DeepSeek seat's transitive totals for JOB_HUNT and ANO_ULAM sit 828 and 665 over 40,000, where the brief projected 111 under; the binding sum is index plus cost file at or under 8,111 for JOB_HUNT, and the cut sits at 8,939. Chan's options, in order of cost: accept the two numbers as reported (the backgrounded mode and the parked project, on the secondary seat), exempt the DeepSeek cost read by contract (HEAVY), let the trial's six task-file lookup lines fall back to the canon's own pointers with a resolving pin (about 560 chars off every boot, a routing change outside this brief), or trim JOB_HUNT's two files, which were off the block. The browser seat's JOB_HUNT and ANO_ULAM headroom, 368 and 531, is thin and reported, not protected.

What changed in meaning, stated rather than hidden, for Chan and the reviewer to keep or veto. One: the index no longer tells a session what a file is; it tells it when to open the file, and the description inside answers what. Two: the mirror law inverted: the frontmatter is the one home and the prose restates nothing, where AL-33's line said prose and frontmatter were mirrors edited together. Three: the staleness test's comparison set is defined by the cut (state values, date-hooked triggers, BOOT-read file headers; never a `review_by`), where the old line said "a dated entry elsewhere in this index". Four: the trial is extended on Chan's word with no fixed end. Five: the ano-ulam v3 gate is a lookup, binding, opened when resuming the project, not a boot read. Six: the Codex project-session posture is luna at xhigh, Chan's word, replacing terra at medium. Seven: `LOCAL-ONLY-*` is by rule outside the manifest's lists, a prose pointer only.

The send-back of 2a v1, same day, and what it taught. Codex's review on Windows (every mechanical check green: 23 nets with the DeepSeek ritual LIVE at 151, 12 installed copies with zero drift, ARMED 60/60, L24 zero lost with every quoted relocation count matched, the base reds reproduced, the applied tree a84259a6): SEND-BACK, two findings, both mine, both of the class no net sees. One: the canon's living block had dropped "PED audits them locally" in a trim pass, and no tracked home kept it, so it was a deletion of substance. Restored in v2 verbatim, on the same line as the prompts-stay-private rule it belongs to. What "locally" means is the canon's and the PED file's to say (PED runs in a chat window, claude.ai by default or DeepSeek web, with Chan as the courier, never in the CLI); this entry adds no reading of it. Two: the cost file's required read, "read it before any cost reasoning" on the price table and peak windows, had left with the Aug 24 paragraph for the history file, whose header says nothing there binds a session, so a required read had become a reference. Restored in v2 as law; the history's copy is now a pointer, one home. The policy diff had listed that sentence as DROPPED, which is exactly the list the review reads; L24 could not see either loss, since neither clause carries a fact token. The cost file grew by 107 chars for it, the canon by 28, and the two DeepSeek transitive overs above are v2's numbers. Third, a correction Codex made to the brief: v1 quoted the two new lookup files in bytes where the resolver counts characters, the unit every budget line uses; on v2 the cost history is 11,483 characters and the status log 3,755 (v1's history file measured 11,442 before the pointer sentence). Codex's review of v2 (same day, every mechanical check green again, the v2 tree 26817839): SEND-BACK, R3 on v2, mine: this entry's explanation of the restored clause had glossed "locally" as "a prompt never leaves this machine", an absolute the canon never stated and the PED file contradicts, presented inside an accepted finding where a future session could take it for a ruling. Struck in v3; the paragraph above now describes the literal restoration and leaves the word to its homes. Two stale receipt lines Codex caught are corrected here and in the brief: the ANO_ULAM browser headroom is 531 (v1's 559 had survived into one exception paragraph), and the cost file's exception number is 3,782 everywhere. Two limits Codex named, banked and not fixed here: the missing project memory index under the kit's own projects key is still reported at startup and still uncreated, as ruled (G1-6); and the pointer net's rule 1 and the resolver net's memory-file pin enumerate `memory/*.md` from disk, LOCAL-ONLY-* excluded, not from `git ls-files`, so an ordinary untracked memory file is inspected too, the behavior the pointer net has had since it was written. Review scope under the working rhythm: content and routing, one focused semantic review by Codex on the policy-diff lists and the resolver-printed plans; the relocations (cost history, ano-ulam status log) are mechanical checks plus inspection; no challenger; no installed file changed.

## AL-35 — live canon-size assertion deferred

(Sep 14 2026, Codex follow-up to the applications-reporting bank at `90a9698`, local only.)

The bank updates `templates/_boot_resolver_test.mjs`'s unknown-mode canon-size pin from
`6746` to `8175`. On the clean post-bank tree, the resolver's `charsOf` measurement for
`projects/trial-aug2026/project-canon.md` is `8175` (CRLF-normalized), so the pin is true.
The bank also raises `boot.budget_chars` to `43000`; the browser TRIAL plan measures `41975`,
leaving `1025` characters of headroom, so trimming the canon is not warranted.

The literal size pin remains intentionally unchanged for now: it catches an accidental canon
change, while a self-comparison such as `charsOf(ROOT, c) === charsOf(ROOT, c)` would be
tautological. Follow-up: replace the literal with a non-tautological semantic or structural
invariant (or an independently versioned fixture/receipt) while retaining the live budget
measurement. This is deferred pending Chan's ordering decision; no push or merge is implied.

## AL-36 — batch 2c: helper configuration and observable posture

(Sep 15 2026, Codex authoring from v10. DRAFT for the architect's hostile review; not an
ACCEPT and not permission to publish this batch.)

Authority and base. Chan authorized steps 2-3 in a fresh authoring session, then said in the
same chat: "GO push main, Claude-Core, commit 4e0a272. Then step 5. On the two cap children,
pass no model or effort, so their records show whether the [agents] defaults reach a child."
The one-shot gate consumed that GO and remote main advanced from 8eb2aab to 4e0a272. This
batch branches as `kit-2c-helpers-config` from that pushed tip. AL-35 belongs to the preceding
audit-log note, not this batch; the separate applications-reporting bank at 90a9698 remains
on `kit-bank-applications-reporting`, waiting on Chan's separate say.

The probe and corrections. The Sep 15 morning probe at 0.154.0-alpha.6.2 spawned no child:
the interface had no role selector, so it proved no pin behavior. V8's six SEND-BACK findings
and v9's three were accepted in v10: role verdicts are per file; null roles leave loading
unproven; both fixtures and their final files exist in every outcome; the default four slots
cannot prove a two-child cap; AL-35 and the applications branch are separate; the memories
ruling follows Chan's actual switch-off; and measured token totals establish no causal claim
about ultra. Superseded text was corrected in place in the brief.

Tests first. Main's 23-net baseline passed. C-check and C-review each recorded astra/max with
null role metadata: C2 for each file. A-check recorded luna/medium and A-review astra/medium:
A1 for each explicit partial-history spawn. B recorded luna/medium, read-only policy, and v1,
with the SessionStart ritual: B1. Five one-word responses processed 80,948 tokens, including
80,736 input (31,744 cached) and 212 output (181 reasoning). This excludes parent work and is
not a price or a quota percentage. No denied-write proof exists. Detailed source lines, IDs,
hashes and raw snapshots were delivered as the local step-2/3 receipt, outside the public kit.

What changes in meaning. Model names may now be hand-pinned in the kit's project config and
roles when documented and dated; the picker's personal line remains the picker's. Defaults
are luna/high for an unnamed role, while named roles keep medium. Role-file contents and
their C2 labels are pinned together; explicit model/effort dispatch and the read-only program
form are the observed paths, not a claim that custom files loaded. The ritual gains one line
that separates personal config, this session's effective record, and a dated local documented
list; unavailable fields, unlisted configured names, ultra, and disagreements are named.
The cost file gains Chan's max/never-ultra posture and his reason labeled as his reason, with
the 7,848,042-token 1b measurement stated separately. The Codex memories OFF rule is retained
beside Sep 15's on/off history and the fresh record's absent generated-memory block. The
Claude Code recovery skeleton now explicitly disables auto memory; verify-install checks
the installed boolean and does not equate it with observed behavior. Its installed file
belongs to the DeepSeek CLI seat, on Chan's GO; Codex never writes under `~/.claude`.

Batch 3 ledger charter, additional columns: model, effort and explicit role per response and
spawn, preserving thread, turn and response identifiers and visibly null roles; the parent's
own effective effort; and any retrospective task-based classification labeled as such. The
red line compares a response with its ROLE's allowance (kit_check luna/medium, kit_review
astra/medium), never with the parent, which would pass an astra/max helper under an astra/max
parent. Retries and failed work remain charged to the originating batch under the relay's law.

Cap/default receipts: both initial children omitted model and effort, on Chan's explicit word,
and each recorded astra/max, null role metadata and four available slots in its fresh runtime
message. This already-open parent did not demonstrate the luna/high defaults; a new parent's
loading remains untested. The first child finished before list_agents returned, leaving only
the second running. With no two-live precondition, no third attempt was made and no refusal
was claimed. The block stays configured, not proven operational. These two responses processed
32,317 tokens (32,134 input, 15,872 cached; 183 output, 169 reasoning), excluding parent work.
Final-tree measurements: 24 nets green (new agents-config 28 checks, Codex ritual 50,
bootstrap 20); 12 installed-copy rows identical, zero drift. L24 preserved all 237 codex.md,
65 cost-file, 547 DIRECTORY and 837 prior audit-log fact tokens, zero lost. Policy reports:
codex.md 34 clauses (2 changed, 32 added), cost 2 (1 changed, 1 added), DIRECTORY 4 added;
none dropped. The cost file is 4,183 normalized characters, up 401 from 3,782. DeepSeek
transitive listed-boot-plus-cost totals: TRIAL 35,620; JOB_HUNT 41,229 (1,229 over 40,000);
ANO_ULAM 41,066 (1,066 over). These use the resolver's CRLF-normalized character method;
the existing overages remain reported, not a raised budget. Doorway block A stays 5,134 bytes.
The fresh installed-ritual proof, thread `01a0a2e8-a262-7191-8df7-37fb082d2ae5`, recorded
luna/medium, v1, read-only at line 6. Its startup line 7 reports personal astra/max, effective
luna/medium and the Sep 15 documented list, with the expected disagreement warning from the
explicit override. The added line measures 205 characters, 206 including its newline. This
one-word startup check made two model responses, processing 37,187 tokens (36,670 input,
23,040 cached; 517 output, 244 reasoning). Step 5's model proofs total 69,504 processed tokens,
excluding parent work. The ritual source and installed copy are byte-identical. Personal
Codex config is unchanged. Verify-install reports 1 failure of 62: the installed
`autoMemoryEnabled` key is absent. That expected red remains for the owning DeepSeek seat;
effective Claude Code memory behavior was not observed.
Role loading, denied-write enforcement, ultra fan-out, child-of-child spawning and exec under
v2 remain untested unless a named receipt here says otherwise.

Backlog: the first fresh kit session after landing quotes its `<multi_agent_role>` slot count (4 on Sep 15); a change is the cheapest evidence the `[agents]` block loads, short of the refusal.
Chan says when each starts: batch 3's ledger and matched luna/xhigh versus terra/medium
tasks; only then any RTK trial (failure detail, stderr, exit status and exceptions must survive;
vendor savings are not measurements). Boot, drill, memory and L24 reads stay raw; ordinary
checks use the nets' short output with local logs retained. Advisor tooling on Anthropic's
API is unavailable to these two seats, so no action. The applications-reporting branch lands
on Chan's separate say. Batch 2b never runs in parallel with 2c. Path-scoped `.claude/rules/`
remain an option for a future project. The missing kit project-memory index stays reported,
as ruled in AL-34. No new connector, package, service or compression tool was installed.

## AL-37 — batch 2b: generated DIRECTORY, the parked lessons and F30 closed

(16 Sep 2026, Codex authoring from main `8c57af7`, branch `kit-2b-catalog`.
Local review candidate; architect semantic review pending. No push authorized or attempted.)

Chan's two rulings in this authoring chat: "Allow grouped paths and two new lines" and
"Hold ramp work for a revised brief". The v2 brief could not preserve existing multi-file
DIRECTORY blocks with a single path per entry, or list its two new files under its allowed
diff. The catalog therefore uses `path` for one file, `paths` for an existing grouped block,
and `path: null` for prose. Its two new DIRECTORY lines name the catalog and generator.
The v2 proposed ramp step was 348 characters, 349 with its newline; with the +111 index
swap, browser JOB_HUNT would have been 40,233 and ANO_ULAM 40,070. At 452e618 the ramp
remained byte-identical to the base and F30 was HELD for a revised brief. Chan supplied v4
on Sep 16, explicitly releasing the ramp through step 5 after that step was read. F30 closes
in this batch: the byte-exact architect-authored ramp records Chan's Sep 15 2026 standing GO
on its Install line, with the two names, versions and Sep 7 measurement. Its 2,582 characters
are four fewer than the original ramp; no install was performed on this machine.

The delivery-transients clause also moves from the ramp to workflow/two-model-relay.md,
beside the unique-delivery-name rule. The ramp's boot-report parenthetical is redundant with
the script's printed report instruction; its critique sentence is governed by the cold-start
read memory/chan-critique-directives.md. The retired originals are quoted below.

The twelve day 8-9 bullets moved to these homes. Two merge into existing rules, with their
missing clauses preserved; no second home remains in the retired project file.

| Source topic | New home and placement |
|---|---|
| Contradictory authority in a brief | workflow/two-model-relay.md, Standing rules; MERGED into the existing contradiction rule, preserving the origin example, reversible local edits, step coverage and whose GO counts |
| Two exemplary refusals | workflow/two-model-relay.md, the receiving-hand refusal rule |
| Retesting old planner caution | workflow/two-model-relay.md, Standing rules; the automation wording points to monday.md |
| Human board activity before scanning | lessons/platforms/monday.md, Day 8 afternoon |
| Existing dashboard and view screenshots | lessons/platforms/monday.md; MERGED into the dashboard rule, adding view sets and API blindness |
| Credit accounting before renames | lessons/platforms/monday.md, Day 8 afternoon |
| API feasibility in briefs | workflow/two-model-relay.md, Brief shape |
| Stable identifiers for human clicks | workflow/two-model-relay.md, Brief shape |
| First-call preparation | lessons/client-collaboration-lessons.md, Client calls and proposal decks |
| Proposal content and the VA framing limit | lessons/client-collaboration-lessons.md, same block |
| Two kinds of design reference | lessons/universal-patterns.md, unnumbered Reference-led design block after Day 10 |
| Reconstructing the speaker's deck | lessons/client-collaboration-lessons.md, same block |

The generator checks an ordered dependency-free JSON catalog against exact `git ls-files`
paths, with only memory/*.md and lessons/platforms/* exempted because their manifests own
them; duplicate owners, untracked paths, absent coverage and missing tracked files fail.
Its default `--check` compares the generated header and text against DIRECTORY, reporting
the first differing line; `--write` writes only after coverage passes, and CRLF checkouts
compare in git's LF text form. Without git, it uses the pointer net's degraded-strict disk
inventory, retaining that net's machine-file exclusions and making ordinary strays fail.

The pointer net replaces basename substring coverage with the generator, exact catalog
ownership and a line-1 marker. Delivery-transient and indexed-pending-addition notes remain;
certification requires catalog paths to be staged/tracked. Mutation tests cover grouped
text, duplicates, basename collisions, missing/untracked paths, exceptions, malformed text,
CRLF, missing markers, first-line diagnostics, fallback strictness and refused invalid writes.
The pattern pin covers the two numbered-pattern sections, since the later fan-out lesson has
its own local 1-3 list; it checks contiguous unique numbers, the H1, CLI-era heading and
DIRECTORY count, plus every tracked by-number reference. Its base-tree reference check was
already red on AL-34's citation of the then-absent pattern 51; duplicate, gap, stale count and
out-of-range mutations also fail. The catalog and generator subjects were absent on the base.

Meaning changed: the day 8-9 lessons bind through the manifest's task triggers, with Monday
work still reaching its existing platform home; DIRECTORY is authored through the catalog
and cannot pass its check while drifting from it or losing tracked coverage; pattern numbers
are mechanically checked. F21 closes for universal-patterns and F31 lands as pattern 51, one
line. AL-35's follow-up closes: the unknown-mode recovery pin keeps the exact BOOT-list
structure, canon presence and lookup exclusion, requires a positive canon size, and prints
that size instead of asserting a brittle literal. The measured canon here is 7,611 chars.

The verbatim retired preamble exposed one pointer-net limit: a quoted relative link was
resolved from its new file instead of its original location. An explicit retired-source
fence now records that location; the net still requires each target to exist, rejects an
escaping source path or unclosed fence, and resumes the current file's base after the quote.

Measurements use the resolver's CRLF-normalized UTF-16 characters, against base 8c57af7.

Accepted intermediate receipt at 452e618 (ramp held): browser TRIAL / LEAN / CLIENT_BUILD /
JOB_HUNT / ANO_ULAM = 35140 / 17824 / 30668 / 39884 / 39721; corresponding headroom =
4860 / 22176 / 9332 / 116 / 279. The following tables describe the final v4 tree.

| File | Base | Candidate |
|---|---:|---:|
| DIRECTORY.md | 31,751 | 31,936 |
| templates/directory-catalog.json | absent | 41,229 |
| memory/MEMORY.md | 5,298 | 5,409 (+111; ceiling +150) |
| projects/trial-aug2026/project-canon.md | 7,792 | 7,611 |
| workflow/relay-boot-claudeai.md | 2,586 | 2,582 |

| Mode | Browser base → candidate | Browser headroom | Codex/CLI plan base → candidate | CLI plus cost base → candidate |
|---|---:|---:|---:|---:|
| TRIAL | 35210 → 35136 | 4864 | 32624 → 32554 | 36807 → 36737 |
| LEAN | 17713 → 17820 | 22180 | 15127 → 15238 | 19310 → 19421 |
| CLIENT_BUILD | 30557 → 30664 | 9336 | 27971 → 28082 | 32154 → 32265 |
| JOB_HUNT | 39773 → 39880 | 120 | 37187 → 37298 | 41370 → 41481 |
| ANO_ULAM | 39610 → 39717 | 283 | 37024 → 37135 | 41207 → 41318 |

The budget stays 40,000 for every seat and mode. The contract-mandated DeepSeek cost read
is 4,183 characters outside the resolver plan; its existing transitive overages are reported,
not repaired by raising the ceiling: JOB_HUNT 1,481 over, ANO_ULAM 1,318 over.

L24 against 8c57af7 (tokens / in place / relocated / LOST), re-measured after the ramp rewrite:

| File | Tokens | In place | Relocated | LOST | Policy clauses |
|---|---:|---:|---:|---:|---:|
| workflow/two-model-relay.md | 162 | 162 | 0 | 0 | 8 |
| lessons/platforms/monday.md | 275 | 275 | 0 | 0 | 4 |
| lessons/client-collaboration-lessons.md | 106 | 106 | 0 | 0 | 5 |
| lessons/universal-patterns.md | 339 | 338 | 1 | 0 | 3 |
| workflow/the-drill-and-memory.md | 134 | 134 | 0 | 0 | 0 |
| README.md | 93 | 93 | 0 | 0 | 0 |
| DIRECTORY.md | 563 | 555 | 8 | 0 | 2 |
| projects/trial-aug2026/project-canon.md | 103 | 97 | 6 | 0 | 1 |
| memory/MEMORY.md | 157 | 154 | 3 | 0 | 1 |
| workflow/relay-boot-claudeai.md | 46 | 40 | 6 | 0 | 4 |
| lessons/audit-log.md | 912 | 912 | 0 | 0 | 30 |

The policy list has four DROPPED clauses: DIRECTORY's two retired routing sentences
survive verbatim below, the canon's retired binding pointer is replaced by the manifest
triggers, and the ramp's critique sentence retains its named cold-start home. The twelve
rules remain in their target homes. The ramp policy list is 2 changed (the clone line and
Build and prove), 1 dropped (critique), 1 added (Install); v4 expected only 1 changed, but
the real-base tool also flags the clone-line restriction, retained in What you never do.
This measured discrepancy is reported for the architect's review; the ramp text is byte-exact.
Two-model-relay adds one transients clause against
452e618, eight added clauses across the whole batch against 8c57af7. The dashboard clause gains
the view-set scope from the source; remaining flagged clauses are additions or relocations.
The source-text proof covers each complete parked bullet (the dashboard sentence merges with
its initial letter lowercased; the caution sentence gains its platform-home pointer) and the
verbatim H1/preamble. One distinctive phrase per bullet resolves to exactly one new home.

Final verification: 24 nets, 0 failed; pointer 296, resolver 99, browser 25, prose 241 on
78 tracked Markdown files, public-safety 20 on 157 tracked files, Codex copies net 61, and
DeepSeek ritual LIVE 151. Installed copies: 13 checked, 0 drifted or missing. Marker counts
are 1 in DIRECTORY and 1 in the generator header. The 17 changed paths were counted by git.
Receipts are re-measured on the final tree; the local artifact carries the commit/tree hashes,
complete DIRECTORY diff, policy lists, relocation hits and push row. Nothing was pushed.

Retired verbatim: the parked file's H1 and preamble (original location:
`projects/trial-aug2026/relay-lessons-day8-9.md`):

```md retired-source=projects/trial-aug2026/relay-lessons-day8-9.md
# Trial Aug 2026 — relay lessons, day 8-9 (LOOKUP; BINDING, not history)

These lessons still bind work. They are not decisions and not history; they were banked into
the canon during the AL-27 freeze and moved here verbatim on Sep 7 2026 (batch 0a, why:
../../lessons/audit-log.md AL-29) so the canon carries only what every trial boot needs.
Open this BEFORE: scanning or changing anything on a Monday board, read-only audits included
(the scan and AI-credit rules);
preparing a client call or a deck; reference-led design of a product screen. Due to be
re-homed into `lessons/` (relay, monday, client-collaboration) in batch 2; until then this
file is their one home.
```

DIRECTORY's former upkeep sentence, verbatim:

```md
Keep this current: **any new file added to the kit gets a
line here** (same rule as a memory index).
```

Its replacement: Keep this current: **any new file added to the kit gets one entry in `templates/directory-catalog.json`, then `node templates/directory-gen.mjs --write`** (same rule as a memory index).

The retired DIRECTORY row, verbatim (including its former routing and temporary-home wording):

```md
- `trial-aug2026/relay-lessons-day8-9.md` — LOOKUP, BINDING: the day 8-9 relay lessons (board scans and changes with the AI-credit checks, client-call and deck preparation, reference-led design) banked during the AL-27 freeze; open before scanning or changing a board, a client call or deck, or reference-led design. Their one home until batch 2 re-homes them into lessons/.
```

The ramp's retired boot-report parenthetical, critique sentence, and transients clause,
verbatim. Their current homes are the script's report instruction,
`memory/chan-critique-directives.md`, and `workflow/two-model-relay.md`, respectively:

```text
(the BOOT reads done, the CLONE HEAD date, the BOOT SET count)
Critique every directive, his included; he decides.
delivery transients (`CODING-BRIEF-*`, `FIX-*`, `*.patch`) at root only.
```

The old pattern headers, verbatim:

```md
# Universal Patterns — the numbered patterns (1–50) + how Chan tests AI systems
## CLI-era patterns (26-50)
```

Follow-ups: the eleven mirrored frontmatter descriptions' one-home migration (the twelfth,
boot-index.frozen.md, is captured history and keeps its line); the DIRECTORY diet; the
platform-gotchas general trigger, which is outside this batch. The revised F30 ramp brief
follow-up is closed by v4 in this batch.
Review scope remains mechanical relocation checks and the receiving peer's inspection, plus
the architect's focused semantic review of routing, the two triggers, the canon line, the
ramp and pattern 51, on the exported whole-branch patch in a fresh browser session.
No helper or challenger was used,
as scoped by the brief; no frozen core, resolver implementation, fixture or installed copy
was changed.
