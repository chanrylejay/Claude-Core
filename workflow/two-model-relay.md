# Two-model relay — Claude Code (DeepSeek) + claude.ai (Opus 5)

Chan runs two agents on one project. This file holds the MECHANICS. The
generalisable lesson behind it — the REACHABILITY CHECK — lives in
`../lessons/universal-patterns.md` under Multi-worker governance; it is
referenced here, not duplicated.

NOTE: this protocol is live and in use as of Aug 11 2026. `DEEPSEEK-RELAY.md`, the original claude.ai draft name, is superseded by this file.

## The three parties

- **Chan** — owns every decision. Gives GO. His eyes are the final gate.
- **claude.ai** (browser, Opus 5) — architecture, briefs, hostile review. Can
  see images and hold the whole codebase; cannot run code, write to disk, or
  push. Has read the full kit: global hub, Claude-Core, the project canon,
  memory.
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

- **One-writer rule.** claude.ai drafts, the agent commits. Memory writes land
  only from the machine where the files live.
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
- **Stand downs are real.** When claude.ai or Chan says nothing starts, nothing
  starts. Verification and discussion are fine; writes to code are not.

## When to bank

The session anchor, rulings, and open items get banked to the project memory
folder on claude.ai's instruction (it drafts, the agent commits). The reachability
lesson is the one universal rule to date; keep lessons in universal-patterns,
mechanics here, one home each.
