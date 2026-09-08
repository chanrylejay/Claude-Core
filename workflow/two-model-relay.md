# Two-model relay — claude.ai (Opus 5) + the hands (Codex primary, Claude Code/DeepSeek secondary)

Chan runs two agents on one project. This file holds the MECHANICS. The
generalisable lesson behind it — the REACHABILITY CHECK — lives in
`../lessons/universal-patterns.md` under Multi-worker governance; it is
referenced here, not duplicated.

NOTE: this protocol is live and in use as of Aug 11 2026. `DEEPSEEK-RELAY.md`, the original claude.ai draft name, is superseded by this file.

## The three parties

- **Chan** — owns every decision. Gives GO. His eyes are the final gate.
- **claude.ai** (browser, Opus 5) — architecture, briefs, hostile review. Can
  see images and hold the whole codebase. Since Aug 2026 it also builds: a
  per-conversation sandbox clones the public repo, runs the kit's own nets, and
  produces tested patches — but it holds no credentials and its disk is
  disposable, so it can never push and never touches the live machine. Has read
  the full kit: global hub, Claude-Core, the project canon, memory. (Superseded
  Aug 24 2026: "cannot run code, write to disk" was falsified by two shipped,
  net-proven batches; step 6 below is now literal, not aspirational.)
- **The hands** — Codex (OpenAI, VS Code extension; the primary hand since Sep 6 2026; can
  inspect an image as evidence and read its own session records) and Claude Code on the
  DeepSeek endpoint (secondary; cannot see images, small context window). Both read the
  repo, write code, run tests, commit, and push on Chan's GO with the token the hand creates on
  Chan's chat GO. Both
  execute and measure.

Neither is "better". One holds context, the other touches the machine. Since Sep 1 2026
the machine seat is TWO hands — Codex (primary since Sep 6 2026) and Claude Code (DeepSeek);
the frozen core holds who does what. The brief-shape ruling below governs briefs to either hand.

## Authority

- **Visual** — layout, colour, position, what a screenshot shows. claude.ai is
  authoritative. The agent is guessing when it describes a screen; it saves the
  screenshot to a file and hands Chan the path. Chan can upload that file to
  claude.ai, which can actually look at it.
- **Runtime** — what a test returned, what a variable held, which file exists,
  what was already tried. The agent is authoritative. If static reading and a
  measurement disagree, the measurement wins.

## The branch-first loop

1. Chan gives a task.
2. claude.ai writes a CODING BRIEF: exact paths, signatures, the gotchas for
   those files, and the command that proves it worked.
3. The agent builds it, runs `npm run build` and `npm run test:selection`.
4. The agent commits in slices by area, whole files only (never `git add -p`),
   so Chan's review stays small.
5. The agent pushes to a BRANCH, never main. Branch push is a Vercel PREVIEW.
   main is the live deploy and is Chan's GO every time.
6. claude.ai clones the branch and does the hostile pass, then gives Chan a
   one-line verdict.
7. Chan decides on the merge to main.

Reviewing after production is not reviewing. That is the point of the loop.

## The brief format

Header carries FROM, TO, branch, and the words NOT A GO. The cover message that carries a
brief between seats is pointer + hash + NOT A GO and nothing else; every rule lives in the
brief, and a changed rule re-issues the brief, never patches it from the cover (Sep 7 2026:
three covers each invented a gate the brief lacked). A brief names its REVIEW SCOPE and never a
shell; shell rules are per hand (see Working rhythm). Steps are numbered,
each marked read-only, local-only, or waits-for-Chan. The brief also carries a
CLARIFY block: every assumption the writer made and every question still open, listed
outright — the agent confirms or challenges each BEFORE building, and an empty block must say
"no open assumptions" so the skip is visible (added Aug 28 2026; the industry converged on the
same step — Spec Kit's clarify phase is "the one most developers skip and later regret" — and
our own precedent is the needsManualPrice field below: 203 drafts for one unchallenged
assumption). The brief lists the exact
prove-it commands and failure handling: report failures with evidence, never fix silently;
the standing rules below govern which reversible work may continue and which failures stop
dependent work.

## Brief shape — both hands are collaborators (Chan's ruling, Sep 4 2026)

- Both hands are COLLABORATORS, never tools. A brief carries the GOAL, the CONSTRAINTS, and
  WHAT DONE LOOKS LIKE; the hand picks its own mechanics and tools on its own machine.
  Prescribing methods to a capable seat is a defect source: two consecutive Sep 4 briefs
  died on shell commands written from the sandbox before this ruling landed.
- Command lists are allowed only as SUGGESTIONS the hand may replace. They earn their place
  mainly for the blind seat (DeepSeek cannot see screens and benefits from precision), and
  even there a hand that knows a better path takes it and says so.
- This gives the wrong-brief rule below its teeth: a hand handed a wrong path, wrong hash,
  or a method that does not fit its shell CHALLENGES the brief instead of running it.
- Reference exports between seats (zips, digests) carry an OWNED MANIFEST: contents listed
  deliberately, and when private docs are excluded for safety, a sanitized digest ships in
  their place — never silence. (Origin: the Sep 4 ESS zip hand-excluded docs/ and hid the
  day 6-9 session records the browser seat needed.)
- Reference zips FOR the browser seat (Chan's rule, Sep 4 2026): lightweight but COMPLETE.
  Everything tracked goes IN, up to the latest date — docs and session banks included.
  OUT is only junk (node_modules, lockfiles, build output) and secrets (.env, keys — always
  out, no exceptions). The manifest line names the ref, the date, every exclusion, and any
  unmerged branch carrying work-in-progress, so the browser seat knows what the zip cannot
  show. "Important" is never the zipper's judgment call; the default is IN, an exclusion is
  NAMED.

## Standing rules

- **One-writer rule.** claude.ai drafts and proves (sandbox commits are patch
  vehicles, they never reach origin); the agent lands the commit on the real
  repo. Memory writes land only from the machine where the files live.
- **Reachability check.** Before claiming any code is live or any protection is
  active, name the entry point, file and line. If the chain does not trace to a
  route, a script, or an INSTALLED hook, it is not live. The full lesson is in
  universal-patterns.md.
- **A brief that is wrong is the brief-writer's failure.** The agent pushes back
  on a field that does not exist, a wrong signature, or a wrong assumption,
  rather than obeying it. Precedent: `needsManualPrice` cost 203 drafts.
- **The relay file.** Each workspace names its own relay home, newest entry on
  top, each under a `## <date> <who>` heading. A normal project uses
  `data/relay.md`; Claude-Core itself uses `LOCAL-ONLY-relay.md`, which the
  existing `LOCAL-ONLY-*` gitignore rule keeps out of the public repo. Chan
  carries the file; uploads beat pastes for anything large. Chan saves claude.ai's messages into the relay file and the CLI READS them (ctx_read compresses ~79%); pasting into chat rides every turn verbatim and is the expensive path.
- **GO law is unchanged:** hard rule 7 (../memory/chan-hard-rules.md) governs every push in
  the relay, each time; GO once is never GO forever.
- **Every delivery file gets a UNIQUE name; a corrected patch NEVER reuses one.** Browsers
  save a second copy as `name (1).patch` rather than overwriting, so a "refreshed" patch
  under the old name leaves the stale file sitting in Downloads under the name the brief
  told the agent to apply (found live Aug 24 2026: the CLI applied the stale bootstrap patch,
  caught it because the corrected wording was missing, then found the ` (1)` copy and
  reapplied). Corrections ship as `-fix1`, `-fix2`, `-v2`; the brief names the exact file;
  and every brief states one MARKER STRING the applied tree must contain, so an agent can
  prove it applied the intended version before committing. The marker must be a SOURCE
  literal verifiable by grep; a rendered or computed string can never serve (found live
  Aug 2026: a brief named the gauge's rendered "ctx NNK", which no grep of source can ever
  match).
- **A marker string must discriminate.** It must exist in the NEW version and not the old
  one; a grep-able source literal alone is insufficient if both files share it. Ship a
  runnable test with an expected count (for example, `grep -c "<literal>"`), plus a hash
  and line count as backup. Never say a file "starts with" a literal unless it is really
  line 1: a stale and current file can share the same first line while the intended marker
  sits later.
- **A brief states only what its writer verified.** Never assert a person's action to make
  instructions read cleanly. Quote the person, or write it as a check: confirm X; if not,
  stop and report it. This is especially strict for claims that a duplicate was deleted or
  an artefact was downloaded.
- **Freeze artefacts before writing the brief that names them.** Do not edit and re-issue a
  listed file after the brief has named it: the copy in Downloads is stale the instant the
  brief is sent. This is the inverse of the `name (1)` failure; unique names protect a
  correction after delivery, while freezing protects the delivery named by the brief.
- **A receiving hand refusing to proceed is the system working.** Missing files, a
  stale-looking artefact, a duplicate, or an invented correction are stops that prevent a
  wrong commit, not friction to route around. The planner rules on that pushback by name in
  the next message.
- **Reversible work gets latitude; only the irreversible gets a stop-gate.** Exact step
  lists ending in "stop if it fails" turn planner errors into owner round trips, even for
  diagnosis. Reading, diagnosing, testing, and other undoable work belong to the hand to
  iterate on and report. Stop-gates are for pushes, deletes, merges, third-party systems, and
  failures that cannot be undone. This is the Sep 4 collaborator ruling applied to failure
  paths.
- **Never put contradictory instructions in one brief.** "Report only, no edits" cannot
  coexist with a request for a temporary log line and a live push attempt. Re-read the brief
  for internal contradiction before sending; the hand cannot resolve one and should not try.
- **The hand correcting the planner's diagnosis is its highest-value output.** Reading the
  source can kill a planner theory: a supposedly stale installed guard, a path-spelling bug,
  or a Day 9 line that does not exist on the branch. The planner accepts that correction by
  name in its next move; a hand that only obeys would ship the wrong fix.
- **Every patch carries its SHA-256 in the brief; the agent verifies BEFORE applying.**
  `sha256sum <file>` (or `certutil -hashfile <file> SHA256`) must match the brief's line, or
  the run STOPS. The marker-string rule above proves the right version AFTER applying; the
  hash proves it before. A matching hash on a failed apply also localizes the fault: the
  bytes are intended, so the BASE is wrong — re-cut against the true parent (this exact case
  happened Aug 2026). One line in the brief, one command on receipt.
- **Status assertions cite their SOURCE FILE by path — and the planner's receipts see
  tracked files only.** `git grep` is structurally blind to untracked and gitignored files,
  so machine-local state (LOCAL-ONLY-*, archives/) can be proven or refuted ONLY by the
  machine agent's raw read (found live Aug 25: the planner's receipts disproved a "stopped
  batch" claim that a gitignored relay file was accurately making — the fact was right, the
  accusation was wrong, and the file needed correcting, not the reader doubting). When
  receipts conflict, first ask whether the disputed source is untracked.
- **A cross-agent measurement disagreement is itself a STOP.** When the planner's outside
  check (fetched tree, net rerun) disagrees with the agent's runtime report, neither
  authority wins by default (audit Aug 2026: the old authority split named winners per
  QUESTION, not for a dispute between them): both sides paste their evidence, nothing
  further ships, Chan arbitrates.
- **Stand downs are real.** When claude.ai or Chan says nothing starts, nothing
  starts. Verification and discussion are fine; writes to code are not.
- **A stop-gate needs its reason attached, and an answer is part of passing it.** A brief that
  says "report X before building Y" is passed only when X is reported — building Y and not
  mentioning X is a skipped gate even when the work is correct. Pre-declare the artefact, state
  why it gates the next phase, and treat silence on it as a failure to verify rather than an
  implicit pass.
- **The planning half should carry static reads; the machine half carries runtime.** Cloning
  the repo into the planner's sandbox removes whole categories of question from the agent's
  context budget — greps, file contents, line numbers, colour audits all become free. Reserve
  the agent's tokens for what only it can see: live database state, what a test returned, what
  is actually on disk. **Ask it for numbers and verdicts, never for file contents.**
- **Freeze means a ledger, not a feeling.** "Final polish" recurred five times in one
  evening because each round surfaced one more real item. That's fine — late finds are
  cheaper than shipped defects — but each round must be a CONSOLIDATED prompt that
  restates every still-open item and explicitly marks which earlier rulings it supersedes,
  so the agent never has to reconcile contradictory instructions across messages. The
  planner owns the merge; the agent should receive one authoritative list.
- **The agent's pushback is a first-class output — rule on it explicitly.** In one session
  the machine half: refused to apply a conditional fix whose condition wasn't met,
  corrected the planner's wrong file location by checking a commit, derived an honest
  smaller number than the brief expected and flagged it instead of complying, and caught a
  spec value that would have worsened what it was meant to improve. Each time, the
  planner's job was to rule (accept/override) in the next message, by name, so the
  behavior is reinforced. A relay where the hands only obey is wasting half the model.

## Working rhythm (Sep 8 2026, ruled on measured numbers; one home for it)

Measured by Codex on batch 0a-2 v3 from its own session records: 2,443,886 tokens, of which
the reviewer, challenger, and their dispatch were 51%; the reused reviewer carried 191-203K of
input per response; a compaction plus the drill's mandatory rereads cost 531,795; an
integration attempt against a moved main cost 1,734,731 with no agents at all; reasoning
output at max effort was a few hundred tokens per response. Input context is the bill, not
thinking. The rules that follow are the architect's and Codex's, agreed the same day
(why: ../lessons/audit-log.md AL-30).

- Review sizing. Pure relocation with meaning and discovery preserved (nets green, L24 zero
  lost, relocation proof): mechanical checks plus the receiving peer's inspection, no review
  agents. Summaries, scope, or routing changes (a Locked block, a lookup trigger, a status
  pointer): one focused semantic review. Frozen core, guards, resolver: independent hostile
  review, a challenger only where the failure modes justify one. End of each batch group: one
  review in a FRESH context on interactions and accumulated change; accepted unchanged content
  keeps its verdict. Every brief names its review scope; silence means the frozen contract's
  HEAVY default, the expensive one.
- Work split. Codex authors the installed guards, matchers, SessionStart assertions, ledger
  readers, and its own runtime settings; the architect reviews behavior and authority
  boundaries. The architect authors content, routing, and resolver changes; Codex reviews
  meaning and verifies Windows and runtime integration. Each side self-certifies with the
  nets; the other reads for meaning.
- Receipts: patch hash; base to resulting commit; one suite line and one boot line; L24 plus a
  relocation proof when banked material moves or is rewritten, and the policy diff for policy
  text; the push row. No heading line numbers as acceptance criteria: check text and behavior.
  One consolidated check, one short report, detail in an artifact. Local checks are cheap;
  repeated model responses to request, interpret, and restate them are the expensive part.
- Sessions (Codex): one fresh session per bounded batch. Effort is set at session open (it cannot
  change inside a turn): medium to apply, high for semantic review, max for hard policy or guard
  reasoning. Revisions inspect the changed material and the affected rules only. The DeepSeek
  seat keeps the cost file's longer-session habit: its meter bills cold reloads, Codex's bills
  context per response, so the two rules are not one rule.
- Shell: rules are per HAND, never per task. Codex uses the shell its runtime provides; the
  DeepSeek CLI has its own; a brief carries no shell mandate.
- Ledger: retries, reviews, and failed integrations are charged to the batch that caused them,
  or "tokens per completed task" hides the most expensive work.

## When to bank

The session anchor, rulings, and open items get banked to the project memory
folder on claude.ai's instruction (it drafts, the agent commits). The reachability
lesson is the one universal rule to date; keep lessons in universal-patterns,
mechanics here, one home each.
