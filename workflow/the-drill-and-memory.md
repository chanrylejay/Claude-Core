# THE DRILL + the memory system (the anti-drift engine)

These two things are why Claude doesn't drift across sessions with Chan. Both were forged on
Devoted Care (Jun–Jul 2026) through real failures. Follow them in every project.

## THE DRILL (rule 0)

After **any** compaction, before the first substantive reply (on a fresh session start, the
global hub's workspace ritual is the entry point and supplies the reading list. That changes WHO
hands you the list, never WHAT you owe: ALL FOUR steps below apply in full, every start, every
branch, with no exception for a ritual start — and step 2 means opening the marked FILES, not
reading their index lines. If the ritual's list does not cover every marked file, read the
remainder yourself. If no hub ritual or reading list is present (a subagent, or a failed
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
2. **Re-read the READ-FIRST memory files themselves, not their index lines.** The marked lines only tell you WHICH files to open; a one-line pointer is a summary, and this whole procedure exists because summaries are not trusted. Open every marked file, plus [[chan-hard-rules]] always, whether or not it carries a marker. Drill reads are RAW reads — Bash-level, never through a compressing layer: the first trigger is exact-wording work, which the read layer itself admits it can mangle (three auditors, Aug 2026; the routing carve-out lives in ../workflow/tool-playbook.md). Read both indexes RAW and IN FULL, not from the auto-loaded copy: auto-load truncates at 200 lines / 25KB and a marker past the cap dies silently — the pointer net (templates/_pointer_test.mjs) pins headroom. The markers are split across two indexes: the ⭐/🛑 markers in the Core memory index Claude-Core/memory/MEMORY.md, and the 🔴 READ-FIRST markers in the project memory index ~/.claude/projects/<key>/memory/MEMORY.md.
3. **Verify actual disk/repo state** — what's committed, what's pushed, what's running —
   instead of believing the summary's claims. Disk wins over summary, always.
4. Only then reply.

## The memory system

**Mechanics:**
- One durable fact per `.md` file, with frontmatter (`name`, `description`, `type:
  user | feedback | project | reference`).
- Every file gets a one-line pointer in the Core memory index (`Claude-Core/memory/MEMORY.md`), which is read on demand during the ritual. A project-scoped fact ALSO gets its own pointer line in the project memory index (`~/.claude/projects/<key>/memory/MEMORY.md`) — that write is mandatory, not optional, because that index is what auto-loads each session and is the only place a 🔴 READ-FIRST marker can live. A fact with no line there is a fact the next session does not know exists.
  so the line must carry the hook (what it is + when to read it).
- Update existing files rather than duplicating. Correcting or superseding a fact in place never needs asking WHEN the change is one of these three and nothing more: fixing an error, adding detail, updating a value. Replacing, emptying, shortening, or rewriting a banked fact so its original substance is gone IS deleting it. If you cannot tell which side of that line you are on, you are deleting: ask first. DELETING a banked fact needs Chan's explicit OK: say what you believe is wrong and why, then delete only on his word.
- Link related memories with `[[name]]`.

**Discipline that makes it work:**
- **Bank BEFORE compaction.** When context runs low, write current state to memory first.
  Chan will say "we're going to hit an auto compact, please pause" — that means bank now.
  Never let the compact be the only record.
- **When unsure whether something is worth banking, bank it — over-banking is the cheap side** (restored to this home, slice 1 audit).
- **Bank decisions the moment they're made** (a client's GO, a reversal, a locked design call) —
  not at end of session.
- **Mark recency and priority in the index line** (🔴 READ FIRST, ⭐ importance, dates) so a
  future session knows what's an anchor vs history. ANCHOR PRECEDENCE, mechanical: at most ONE
  line in a project index carries 🔴 as the current resume point, and writing a new resume anchor
  INCLUDES removing 🔴 from the previous one in the same edit — the removal is part of the write,
  not a follow-up task. A file waiting on Chan's ruling is not a resume point, it is a blocker
  list: mark it 🟡 BLOCKED, never 🔴. Two or more 🔴 lines is a bug in the index, not a choice to
  make: take the newest-dated 🔴 and name the extras in your first reply. (history: ../lessons/audit-log.md AL-3)
- **Session anchors:** for big multi-day pushes, keep one anchor file per effort with a
  top block that's always the current state — newest information at the top.

## Why it matters
A model session is amnesiac; the folder isn't. Continuity lives in these files, not in the
model. If it's not written down, it didn't happen.

## Ruling: banking stays manual (Chan, Jul 24 2026)

No PreCompact auto-bank hook. Chan watches the context meter and signals when we are near auto-compact; Claude banks on that signal, then the compact runs. The mechanical safety net that DOES stay automated is the SessionStart compact hook, which injects THE DRILL right after every compaction. (Tech note if ever revisited: PreCompact hooks reject additionalContext; only systemMessage works there.)
