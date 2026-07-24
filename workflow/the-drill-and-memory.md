# THE DRILL + the memory system (the anti-drift engine)

These two things are why Claude doesn't drift across sessions with Chan. Both were forged on
Devoted Care (Jun–Jul 2026) through real failures. Follow them in every project.

## THE DRILL (rule 0)

After **any** compaction, before the first substantive reply (on a fresh session start, the
global hub's workspace ritual is the entry point and supplies the reading list; step 3's
disk/repo verification still applies to every start):

1. **Don't trust the summary.** Compaction summaries drop details — on Jul 14 one silently
   dropped a client's verbatim taxonomy list and it had to be recovered from the raw transcript.
   Chan's verbatim correction: *"the drill should be dont trust the summary, and read the last
   transcript line by line if necessary."*
2. **Re-read the READ-FIRST memory files** (the ⭐/🛑/🔴-marked index lines, split across two indexes: the ⭐/🛑 markers in the Core memory index Claude-Core/memory/MEMORY.md, the 🔴 READ-FIRST markers in the project memory index ~/.claude/projects/<key>/memory/MEMORY.md).
3. **Verify actual disk/repo state** — what's committed, what's pushed, what's running —
   instead of believing the summary's claims. Disk wins over summary, always.
4. Only then reply.

## The memory system

**Mechanics:**
- One durable fact per `.md` file, with frontmatter (`name`, `description`, `type:
  user | feedback | project | reference`).
- Every file gets a one-line pointer in the Core memory index (`Claude-Core/memory/MEMORY.md`), which is read on demand during the ritual; the project memory index (`~/.claude/projects/<key>/memory/MEMORY.md`) is what auto-loads each session,
  so the line must carry the hook (what it is + when to read it).
- Update existing files rather than duplicating; delete what turns out to be wrong.
- Link related memories with `[[name]]`.

**Discipline that makes it work:**
- **Bank BEFORE compaction.** When context runs low, write current state to memory first.
  Chan will say "we're going to hit an auto compact, please pause" — that means bank now.
  Never let the compact be the only record.
- **Bank decisions the moment they're made** (a client's GO, a reversal, a locked design call) —
  not at end of session.
- **Mark recency and priority in the index line** (🔴 READ FIRST, ⭐ importance, dates) so a
  future session knows what's an anchor vs history.
- **Session anchors:** for big multi-day pushes, keep one anchor file per effort with a
  top block that's always the current state — newest information at the top.

## Why it matters
A model session is amnesiac; the folder isn't. Continuity lives in these files, not in the
model. If it's not written down, it didn't happen.

## Ruling: banking stays manual (Chan, Jul 24 2026)

No PreCompact auto-bank hook. Chan watches the context meter and signals when we are near auto-compact; Claude banks on that signal, then the compact runs. The mechanical safety net that DOES stay automated is the SessionStart compact hook, which injects THE DRILL right after every compaction. (Tech note if ever revisited: PreCompact hooks reject additionalContext; only systemMessage works there.)
