# THE DRILL + the memory system (the anti-drift engine)

These two things are why Claude doesn't drift across sessions with Chan. Both were forged on
Devoted Care (Jun–Jul 2026) through real failures. Follow them in every project.

## THE DRILL (rule 0)

After **any** compaction, before the first substantive reply (on a fresh session start, the
global hub's workspace ritual is the entry point and supplies the reading list. That changes WHO
hands you the list, never WHAT you owe: ALL FOUR steps below apply in full, every start, every
branch, with no exception for a ritual start — and step 2 means opening the FILES on the plan, not
reading their index lines. If the ritual's printed plan is missing, or the plan itself names the
resolver as a failed read, assemble the same plan yourself from the index frontmatter under the
resolver's rules (step 2 says how); a failed read of any other file is a file to fetch, never a
reason to rebuild the plan. If no hub ritual or reading list is present (a subagent, or a failed
import), the four steps are identical; you assemble the list yourself instead of being handed it.
(all-four-steps law hardened twice; history: ../lessons/audit-log.md AL-1)):

1. **Don't trust the summary.** Compaction summaries drop details — on Jul 14 one silently
   dropped a client's verbatim taxonomy list and it had to be recovered from the raw transcript.
   Chan's verbatim correction: *"the drill should be dont trust the summary, and read the last
   transcript line by line if necessary."*

   **What "if necessary" means — mechanical, so the model never decides it.** Read the raw
   transcript back to the last user message you can still see in full if ANY ONE of these is
   true. Check them, do not weigh them.
   - The summary mentions a list, a taxonomy, naming rules, a quote, or an exact wording that is
     not reproduced in full in a file on disk.
   - The summary references a decision, a GO, or a reversal that has no dated line in a memory
     index.
   - You are about to write, edit, or delete anything in a memory file.
   - You cannot name, from a FILE rather than from the summary, the last substantive thing built
     or shipped.

   If you cannot tell whether a trigger fired, it fired. The transcript read is BOUNDED
   (why bounded: ../lessons/audit-log.md AL-2): grep the raw transcript for the
   disputed quote/list, or tail it with a stated line budget — through raw Bash, never a
   compressing reader. Widen the window only if the target is not found, and say the budget
   you used. If none fired, say so in one line in
   your first reply, so the skip is visible rather than silent. Only Chan can waive this. A
   genuinely cold start with no compaction behind it gives the FIRST trigger nothing to test, so
   that one cannot fire — but the other three still can, and they still get checked. Skip a
   trigger that has no subject; never skip the step.
2. **Re-read the BOOT files themselves, not their index lines.** WHICH files: the kit's one resolver decides (`templates/boot-resolver.mjs`, batches 1a-1b; why: ../lessons/audit-log.md AL-32, AL-33) and your seat prints its list — the session hook's READ PLAN for a hand (the Codex ritual's Read plan, the DeepSeek ritual's READ PLAN), `node templates/boot-claudeai.mjs` for the browser. The plan is the contract, the Core index, the `cold_start:` set, the workspace's mode set (its `boot_mode:` line; `mode_default` in the index when there is none), and the active project's canon in its own mode; the index's `lookup:` files open at the trigger on their line, never at boot. Never assemble the list from a marker scan: the ⭐/🛑 markers in the Core index are an importance and hot-state legend, not a read list (the old "every marked file" rule named 11 files, 47K chars, against a frontmatter naming four; AL-33). If no plan was printed, assemble the same list by hand from the index frontmatter under the resolver's rules (its header states them: under LEAN the `lean:lookup`-tagged cold-start files and the canon are lookups; an unknown mode adds no set but keeps the canon as an anchor; in every other known mode that is not its own, the canon is a lookup) and say so. Open every file on it, plus [[chan-hard-rules]] always (it is in every plan). A one-line pointer is a summary, and this whole procedure exists because summaries are not trusted. Drill reads are RAW reads — Bash-level, never through a compressing layer: the first trigger is exact-wording work, which the read layer itself admits it can mangle (three auditors, Aug 2026; the routing carve-out lives in ../workflow/tool-playbook.md). Read both indexes RAW and IN FULL, not from the auto-loaded copy: auto-load truncates at 200 lines / 25KB and a line past the cap dies silently — the pointer net (templates/_pointer_test.mjs) pins headroom. The two indexes: the Core memory index Claude-Core/memory/MEMORY.md (in every plan), and the project memory index ~/.claude/projects/<key>/memory/MEMORY.md, whose 🔴 READ-FIRST markers name that project's own reads and resume point (outside the kit, outside the resolver): open those too.
3. **Verify actual disk/repo state** — what's committed, what's pushed, what's running —
   instead of believing the summary's claims. Disk wins over summary, always.
4. Only then reply.

**Orient and report (moved here from the global hub, batch 3a Aug 30 2026; why: ../lessons/audit-log.md AL-22):**
Orient ONLY from files that actually loaded in this session. If any read in the ritual failed, say
which one failed in that same greeting and never fill the gap from recall or a compaction summary.
Report the ritual in one short line naming what was read plus the git head, and name every read
that FAILED in that same line, every session: a report that lists only what loaded is how a silent
failure stays silent. Never make Chan repeat or re-explain himself; if context feels missing, read
the kit before asking him.

## The memory system

**The orient-first rule (the one line relocated from the retired boss-operating-protocol.md, Aug 28 2026):**
project MEMORY.md, repo CLAUDE.md, and [[chan-hard-rules]] before acting; those files are the
fastest orientation, never proof of current state — disk wins, at a start AND mid-session.

**Mechanics:**
- ONE RETRIEVAL UNIT PER `.md` FILE, the law's one home (F25, batch 2a; README and DIRECTORY
  point here): one durable fact, or one coherent set that a single trigger opens, with frontmatter
  (`name`, `description`, `type: user | feedback | project | reference`). The `description:` is
  the one home of WHAT the file is; nothing restates it.
- Every file gets exactly ONE manifest line in the Core memory index's frontmatter (`Claude-Core/memory/MEMORY.md`, read in full on every boot): `cold_start:` for the always-read set, else `lookup:` with its trigger, the hook that says WHEN to open it (the pointer net pins one line per tracked memory file; the machine-only `LOCAL-ONLY-*` class keeps a prose pointer with its clone-absence disclosure instead, since a missing lookup is a boot error on a clean clone). A project-scoped fact ALSO gets its own pointer line in the project memory index (`~/.claude/projects/<key>/memory/MEMORY.md`) — that write is mandatory, not optional, because that index is what auto-loads each session and is the only place a 🔴 READ-FIRST marker can live. A fact with no line there is a fact the next session does not know exists.
  so that line must carry the hook (what it is + when to read it).
- Update existing files rather than duplicating. Correcting or superseding a fact in place never needs asking WHEN the change is one of these three and nothing more: fixing an error, adding detail, updating a value. Replacing, emptying, shortening, or rewriting a banked fact so its original substance is gone IS deleting it. If you cannot tell which side of that line you are on, you are deleting: ask first. DELETING a banked fact needs Chan's explicit OK: say what you believe is wrong and why, then delete only on his word.
- Link related memories with `[[name]]`.

**Discipline that makes it work:**
- **Bank BEFORE compaction.** When context runs low, write current state to memory first.
  Chan will say "we're going to hit an auto compact, please pause" — that means bank now.
  Never let the compact be the only record.
- **A project Chan mentions or creates, however small, gets its projects/REGISTRY.md line the
  same session** — an unregistered project does not exist to the next session (proven by
  counterexample: Sonneto, Aug 2026).
- **When unsure whether something is worth banking, bank it — over-banking is the cheap side** (restored to this home, slice 1 audit).
- **Bank decisions the moment they're made** (a client's GO, a reversal, a locked design call) —
  not at end of session.
- **Mark recency and priority in the index line** (🔴 READ FIRST, ⭐ importance, dates) so a
  future session knows what's an anchor vs history. The legend (moved here from the Core index
  in batch 2a, where the markers now live in each file's `description:` and a lookup trigger may
  carry 🛑): ⭐ core · ⭐⭐ most-violated, read twice · 🛑 hot state, check before acting · 🔒 hard gate. ANCHOR PRECEDENCE, mechanical: at most ONE
  line in a project index carries 🔴 as the current resume point, and writing a new resume anchor
  INCLUDES removing 🔴 from the previous one in the same edit — the removal is part of the write,
  not a follow-up task. A file waiting on Chan's ruling is not a resume point, it is a blocker
  list: mark it 🟡 BLOCKED, never 🔴. Two or more 🔴 lines is a bug in the index, not a choice to
  make: take the newest-dated 🔴 and name the extras in your first reply. (history: ../lessons/audit-log.md AL-3)
- **Session anchors:** for big multi-day pushes, keep one anchor file per effort with a
  top block that's always the current state — newest information at the top.

### Where new facts go (one home each, never two)
Moved here from the global hub, batch 3a Aug 30 2026 (why: ../lessons/audit-log.md AL-22).
- About Chan, or how we work in any project: Claude-Core `memory/` or `lessons/`, plus one index
  line in `memory/MEMORY.md` (a memory/ file gets NO `DIRECTORY.md` line: that index exempts
  memory/, one home for their listing) and, for a lessons/ file, one entry in `templates/directory-catalog.json`, then `node templates/directory-gen.mjs --write`.
- About one project only: that project's memory folder. Never into Claude-Core and never into the hub.
- When a fact moves homes, verify the substance actually sits in the NEW home (grep it there), then
  delete the old copy in the same edit: a LOSSLESS move is the one-home law at work, not a deletion.
  If any substance would be lost, it IS a deletion and takes Chan's OK per the contract's memory rule.
- Before creating ANY new Claude-Core file, check `DIRECTORY.md` for an existing category file and
  extend it instead.
- Rewriting any permanent doc, by any amount, runs the L24 fact-token diff audit first, and
  policy text also runs the clause-level policy diff (`templates/_policy_diff.mjs`: modal,
  negation, and scope words per sentence, which L24 cannot see) before a peer reads it
  (`node templates/_l24_audit.mjs <file>`); the law's home is ../lessons/universal-patterns.md,
  "Maintaining documents". The hub used to say "more than 25%"; that trigger was superseded and its
  stale copy is exactly why the law now has one home.
- Two-strikes rule, scoped: preference and style rules wait for the same mistake twice. ONE strike
  writes the rule when the mistake wedged a session, wrote machine state outside a sandbox, took or
  risked a deploy-costing action, or printed a green verdict over work that did not run.
- On long sessions, bank new durable facts to the right home above before compaction.

## Why it matters
A model session is amnesiac; the folder isn't. Continuity lives in these files, not in the
model. If it's not written down, it didn't happen.

## Ruling: banking stays manual (Chan, Jul 24 2026)

No PreCompact auto-bank hook. Chan watches the context meter and signals when we are near auto-compact; Claude banks on that signal, then the compact runs. The mechanical safety net that DOES stay automated is the SessionStart compact hook, which injects THE DRILL right after every compaction. (Tech note if ever revisited: PreCompact hooks reject additionalContext; only systemMessage works there.)
