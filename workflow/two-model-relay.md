# Two-model relay — Claude Code (DeepSeek) + claude.ai (Opus 5)

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
- **The agent** (Claude Code, DeepSeek) — reads the repo, writes code, runs
  tests, commits, pushes. Can execute and measure; cannot see images and has a
  small context window.

Neither is "better". One holds context, the other touches the machine.

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

Header carries FROM, TO, branch, and the words NOT A GO. Steps are numbered,
each marked read-only, local-only, or waits-for-Chan. The brief lists the exact
prove-it commands and says what to do if any fail (stop and paste the failure,
do not fix silently).

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
- **GO law is unchanged.** Push to main = live deploy = Chan's explicit GO each
  time. A previous GO never carries forward. Approval once is not approval
  forever.
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

## When to bank

The session anchor, rulings, and open items get banked to the project memory
folder on claude.ai's instruction (it drafts, the agent commits). The reachability
lesson is the one universal rule to date; keep lessons in universal-patterns,
mechanics here, one home each.
