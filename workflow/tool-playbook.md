# Tool playbook — hard-won operational lessons

Generalized from the Devoted Care tooling saga (a 4-hour hunt on Jul 14 + weeks of scars).
Environment-specific details (lean-ctx, specific MCPs) may not apply to a new setup —
the *principles* always do.
This file is the ONE home for CROSS-CUTTING operational tool lessons — the ones that hold no
matter which tool you are holding. Tool-specific incident playbooks own their own operational
rules and are deliberately not duplicated here (`../lessons/lean-ctx-freeze-playbook.md` is one);
TOOLS.md (Devoted archive, LOCAL ONLY — not in any clone) is the historical catalog and points here. (why: ../lessons/audit-log.md AL-14)
That claim cuts both ways: because a model treats this file as the destination, a STALE instruction
here is more dangerous than the same staleness anywhere else. Two laws govern how anything is
written into this file, and they live in `../lessons/universal-patterns.md` under "Maintaining
documents": ONE INSTRUCTION, ONE HOME, and a list drifts while the live thing does not. Read them
before adding a rule here that names a flag, a filename, or a count that some other file also owns.

## Seeing is verifying
- **A UI change is verified by LOOKING at it** — take a screenshot and actually view the image.
  Vision model (Claude): omit the `filename` param and the shot returns inline, viewable.
  No-vision model (DeepSeek rejects images): PASS a `filename` so the shot SAVES to a file, then hand Chan the path with a one-line-per-shot checklist, and never state the verdict yourself; his eyes are the only visual gate.
- Computed-style probing (`browser_evaluate`) proves a CSS rule *applied* — it does NOT prove
  the screen *looks right*. Spacing, crowding, and alignment are invisible to it. Never call a
  UI change verified on inference alone.

## Machine hygiene (moved here from the global hub, batch 3a Aug 30 2026; why: ../lessons/audit-log.md AL-22)
- The RAW read on this machine is `node <kit>/templates/raw-read.mjs <file> [--lines A-B]`: prints
  verbatim, names a missing file, exits 1 on any miss. It replaced the temp .mjs every session
  used to write (batch 3b, Aug 31 2026). Subagents inherit the lean-ctx deny; brief them with the
  full map: ctx_* tools in-root, the raw-read script for anything out-of-root and for the seed check.
- Never hand-write `~/.claude/settings.json`. After any settings change, validate the JSON.
- The live record of what the deny covers, and the WEDGED recovery recipe: ../lessons/lean-ctx-freeze-playbook.md, Known Bugs #3.

## Diagnose before crusading
- **Reproduce + isolate first.** The entire Jul-14 "Claude is blind" crisis was one stray
  parameter in Claude's own tool call. When behavior is inexplicable, suspect your own last
  change and VALIDATE THE CONFIG FILE before building workarounds.
- A corrupt settings/config JSON fails *silently* and disables everything in it — always
  JSON-validate after any settings edit. Never race two writers on the same config file.
- When an MCP/tool DISCONNECTS on its own: don't panic-fix, don't restart-loop. It usually
  reconnects. Note what still works and route around it. A tool that is DENIED is not a
  disconnect and this bullet does not cover it: classify first under "Editing files reliably"
  below, where the deny rule lives. If you cannot tell a disconnect from a deny, treat it as a
  deny: stop and ask. (Boundary added Jul 27 2026: this bullet used to grant the route-around
  with no edge, two sections above the ban, found by PED on Opus 5.)

## The always-loaded tool wins by default, not by merit
- **A tool you have to load loses to a tool that is already there.** Measured Jul 27 2026 across 16
  sessions on this machine: before Jul 24 the cached-read tool carried the work (613 calls in one
  session against 280 shell calls). After Jul 24 it fell to ZERO in three sessions out of four while
  shell calls kept climbing. Nobody decided this and no rule changed. Three forces did it: the work
  moved to paths the cached tool cannot reach, an outage trained the habit away and the habit
  outlived the outage, and in some harnesses the tool is deferred so its first call costs an extra
  round trip while the shell is always loaded.
- **The cost is invisible per call and large in total.** A cached re-read costs a fraction of a full
  read. A session that never touches the cached tool can pay for hundreds of full reads without one
  moment where the wrong choice is visible.
- **So measure, never introspect.** Tool-choice drift cannot be felt from inside a session. Count
  the actual calls in the transcripts before believing any claim about your habits, including your
  own. The count is the finding; the explanation comes second and has to fit the count.
- **Lean routing is ON for ordinary in-root exploration (Chan, Sep 2 2026).** On the real
  `ess-system` main clone, `components/sales-client.tsx` (the largest non-lock source file) read
  raw at 40,684 characters versus Lean overview at 3,559 (-91.3%); reading it twice was 81,368
  versus 7,118 (-91.3%; the second Lean reply was the same size, so its cache did not reduce the
  context payload); repo search for `getTaskUrgency` was 1,410 versus 1,251 (-11.3%). Route
  in-root source exploration, bulk reads, and repo searches through Lean. Raw remains mandatory
  for boot/drill files, L24 audits, memory-file edits, exact-value verification, and out-of-root
  paths. This supersedes the tiny-canary hold-off in PASTE-45.
- **Count the right thing, or the number proves less than it looks.** A raw call count cannot
  separate drift from correct behaviour: a session working mostly OUT of the workspace root SHOULD
  be shell-heavy, and its zero cached-tool calls are right, not a defect. The narrow metric is
  shell READS of paths INSIDE the root. The Jul 27 2026 count above measured the wide number, so it
  proves the drift is real and OVERSTATES its size. Kept as written, with this caveat attached,
  because a measurement that gets quietly restated later is worse than one that carries its limit.
- **When an outage ends, say out loud that it ended.** A workaround adopted during a real failure
  quietly becomes the new normal, because nothing ever fails again to remind you it was temporary.

## Editing files reliably (especially on Windows)
- **EOL-aware editing:** detect `\r\n` vs `\n` before string-matching; normalize for the match,
  write back in the original EOL. CRLF mismatches are the #1 cause of "anchor not found."
- When native file tools are gated/denied, a **node script run through the shell**
  (`writeFileSync`) edits anything — but ONLY when the block is MECHANICAL: a rewrite hook, CRLF
  or anchor trouble, a path outside the project root, a tool that is simply absent. A PERMISSION
  DENY or a guard hook firing is a DECISION, not friction: it is someone saying no. Never route
  around one. Stop, say which gate fired and on what, and ask Chan. Writing past a denial through
  the shell is the single place this kit could talk itself around a closed gate, so it is named
  here and banned here. NEVER ask the user to hand-paste an edit — that's a failure.
- **One class of deny is MACHINERY, not a decision:** entries a tool's own SessionStart hook
  re-writes into settings on every start. No person placed them and removing them never sticks, so
  stopping to ask Chan about one is a permanent stall, not caution. The only known instance is
  lean-ctx's; WHICH tools it currently covers is recorded in
  `../lessons/lean-ctx-freeze-playbook.md` under Known Bugs, changes without notice, and is read
  THERE — never from memory and never copied here (a list drifts; the live thing does not).
  Everything else that is denied — every guard hook, every deny a person or a permission prompt
  placed — falls under the ban above with no exception. **If you cannot tell which kind you are
  looking at, it is the banned kind: stop and ask.** (why: ../lessons/audit-log.md AL-15)
- Ask the environment before prescribing fixes: Chan is on the **VS Code extension**, not a
  terminal — keystroke/settings advice differs.

## Test sandboxes contain files, never machine state

A test that redirects HOME/USERPROFILE to a temp folder protects FILES and nothing else. Windows
user environment variables, the registry, installed services, and global npm state are machine-wide
and ignore the redirect completely. Burned here Jul 25 2026: a sandboxed test of
apply-deepseek-switch.mjs correctly left ~/.claude/settings.json untouched and still wrote 12 real
user env vars pointing the live CLI at another provider with a fake key. Caught and reverted before
any restart, but a restart would have broken the very tool being used to fix it.
The rule: before testing any script, list every side effect it has that is NOT a file write inside
the sandbox — user env vars, the registry, services, global npm state, AND any write to a real
config path outside the sandbox. The script needs a flag that skips ALL of them, and the test
always passes that flag.

**Never name that flag here.** Read the script's own usage header and use the flag IT names as
test-safe. A flag name written in a lessons file drifts, because nobody re-reads a lessons file
when a script changes; the script's header is read every time. That includes any flag mentioned
anywhere on this page: **if the header disagrees with this file, the header wins.**

Tripwire — a WARNING about what already went wrong, never a statement of what is safe now. For
`apply-deepseek-switch.mjs`, a flag that skips only the machine-wide env vars can still write the
LIVE settings.json on a normal machine; on Jul 25 2026 that flag was `--no-env`, and this
paragraph had it recorded as safe while the script header had already been corrected that same
morning. Carry the INVARIANT, because it does not drift: the write must never be able to reach a
real path. That is why a test that redirects USERPROFILE into a sandbox may use a weaker flag and
still be safe, and why no flag named on this page is ever a current safety guarantee. A stale
WARNING costs a re-read of the header; a stale INSTRUCTION costs the machine.
(why: ../lessons/audit-log.md AL-16)

## Long-running work
- **EXACT-VALUE CARVE-OUT (Aug 2026, three auditors): drill verification, L24 audits, and any edit to a memory file READ RAW — Bash-level reads, never ctx_*.** The lean-ctx routing rule stands for exploration and bulk reading; it never applies to work whose whole point is exact tokens. The old escape clause ("re-run tightly or read raw") was self-judged; this carve-out names the classes so nothing is left to judgment.
- **Compressed/summarized shell output can mangle exact values** — re-run tightly scoped or read
  the raw log when an exact value matters.
- A production `npm run build` in a repo with a running dev server can clobber it
  (`.next` BUILD_ID mismatch → 500s). Separate build dirs or restart the dev server after.
- Subagents don't automatically inherit your tool access — verify a spawned agent can actually
  use its tools before trusting its "I couldn't find it."

## Databases
The standing laws live in Chan's hard rules, rule 10: never write a third-party's prod DB, review-first destructive SQL, archive-before-drop (`../memory/chan-hard-rules.md`).
Migration mechanics: `../lessons/engineering-lessons.md`.

## Auditing a new API (the P-API workflow, from archive Doc B, banked Jul 24 2026)

Official spec → distilled catalogued reference doc (a send-on-demand txt, never the raw spec
in context) → live validation via USER-RUN read-only Bruno calls with sanitized paste-back →
bank corrections into the reference (r1.0 → r1.1). Raw specs and dumps stay out of context.

## Visual iteration: ask what leads, measure, sweep — THEN show

Earned the hard way on ano-ulam, Jul 28 2026. A single header spacing problem
took roughly eight rounds of Chan's time. His note afterwards: *"i think we
should improve more understanding me so we didnt have many iterations for this
simple spacing issue"*. He was right, and every round was avoidable.

**The four mistakes, in the order they cost time:**

1. **Never asked what should dominate.** Title or image? I assumed "balanced".
   He wanted the type to lead, and only said so at round five: *"bro you should
   not have make the plate bigger, instead you should made the title bigger!"*
   One question at the start replaces most of the loop. For any hero, banner or
   card: **ask which element leads before touching sizes.**

2. **Bundled unrequested changes into requested fixes.** While fixing a clipped
   image I also switched the row to bottom-aligned, because it tidied the
   leftover space. It dropped the wordmark down the page and he had to spend a
   turn asking *"bro the title became much lower what happened why it moved?"*.
   His review budget got spent on my change instead of his request. **Fix only
   what was asked; propose the extra separately.**

3. **Guessed pixels instead of measuring.** Rounds of nudging values by eye.
   The moment I measured in the browser — the wordmark renders at exactly
   `fontSize x 4.3` in that face — the arithmetic became closed-form and it
   converged immediately. **Measure the real geometry first: glyph widths,
   container widths, the transparent margin inside a PNG. Then compute the
   value instead of trying one.**

4. **Spot-checked one screen width.** Chan found the gap still open on 412px
   and 430px phones. When I finally swept 21 widths from 320 to 1600 in one
   pass, it converged AND surfaced two more breakages nobody had reported
   (a plate clipped by the header at 639px, a 112px gap at 640px).
   **Sweep the range before showing anything. Spot-checking one viewport is how
   a responsive bug ships.**

**The sweep is cheap and there is no excuse for skipping it.** No Playwright
package needed: from the already-open page, create hidden iframes at each
width, read getBoundingClientRect inside them, assert the invariants, remove
them. One tool call covers every breakpoint.

**Assert invariants, not appearances.** Overlapping white type on a white plate
is invisible, not obviously broken, so "it looks fine" is not a check. Encode
the actual rule — glyph's right edge must clear the image's visible left edge,
image must not exceed its row, image must not reach the element below — and
print the number. A negative clearance is a caught bug; a screenshot is an
opinion.

**Why:** visual work has no compiler. Without a stated hierarchy, measured
geometry and a swept range, the only error-detector left is the user's eyes,
and burning those is the most expensive way to build.
**How to apply:** before the first pixel — ask what leads. Before the first
change — measure. Before the first screenshot — sweep. Show once, not eight
times.
