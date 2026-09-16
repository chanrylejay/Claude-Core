---
name: chan-ai-cost-context
description: The AI cost law and posture. The DeepSeek CLI seat's meter and peak windows are its bill (Chan's own key); Codex, the primary hand, runs on his own account. The session habits are LAW before DeepSeek CLI work; the kit-lean law binds every seat.
metadata:
  type: user
---

# AI cost context (law and posture, Sep 15 2026; history: [[chan-ai-cost-history]])

**Posture, Chan's word.** Codex is the primary hand (Sep 6 2026), the DeepSeek CLI the secondary, never a replacement, until he says otherwise. His free ChatGPT Plus month (Sep 9 2026) ends on its own; he says when it ends and when the primacy changes, nobody infers either. Kit sessions run gpt-6-astra at max, never ultra (confirmed intentional, Sep 14 2026; effort ruling Sep 14-15 2026). His reason, quoted from the relay and labeled as his reason: "Ultra spawns its own parallel subagents; that was the 1b helper waste." The measurement beside that reason, which proves no cause, lives in ../lessons/platforms/codex.md (kit posture), never here. Model names documented Sep 15 2026: ../templates/codex/models-current.json; project sessions such as ESS run luna at xhigh ("its xhigh", Sep 14 2026). Codex runs only under Chan's own account (any other account, or a cutover, needs his ruling first) and is not billed to the DeepSeek key, so the meter and peak windows do not decide its work; the kit-lean law does. The DeepSeek CLI runs deepseek-v4-flash on his own key. Claude access in VS Code is gone for good (PERMANENT, Sep 2 2026): plan around this, never around its return; the switch is DONE, never re-run (../workflow/switch-to-deepseek.md). Aug 24 2026 ruling: fix the workflow, keep the key, do NOT switch APIs; a revisit is a money decision, slow-down review per [[chan-career-playbook]], never mid-sprint. No new AI spend until a client is secured.

**The kit-lean law (every seat, so any model can run the kit):** hooks over prose rules, short high-signal files, checklists over judgment calls, one home per fact. Under a small window any model forgets more midstream: trust the files, follow the checklists, never skip the gates, scale multi-agent patterns to the window at hand. lean-ctx is a COST tool: in-repo reads go through it (../workflow/tool-playbook.md).

**The session habits, LAW before DeepSeek CLI work.** Weight-conditional (they bind in proportion to context size, never against Chan's sleep or schedule; the tripwire informs, he decides), and one is master: keep the context small. The statusline `ctx NNK` gauge is the live size (dim under 150K, yellow to 280K, red past it); red at a task boundary means compact or /clear, and the extension panel's [gauge] hook lines carry the same thresholds, relayed verbatim.
1. Work off-peak. Peak = 09:00-12:00 and 14:00-18:00 Manila at double price; the session hook prints the live peak state at every start; heavy generation waits for off-peak unless Chan says run it now. Full price table, peak windows, and the verified dashboard reconstruction: ../lessons/platforms/deepseek-api.md, one home; read it before any cost reasoning.
2. Keep the context small: cost scales with context x requests even at a 100% cache-hit rate.
3. Compact early, never at the wall: bank first (hard rule 4), then compact small. A model, effort, or mode change mid-session busts the cache: set them at session open or right after a /clear. /rewind beats /compact for a bad tail (it drops end turns for free).
4. One longer session beats several short ones: every fresh start, /clear, and expired cache is a cold reload. Compact BEFORE a break, never after: bank, compact small, then leave.

The scoreboard is the money meter in the VS Code status bar (balance, today's spend, live peak state), real only where templates/global/deepseek-meter.mjs is planted: if the bar shows nothing, say so. Soft cap: a USD number in `~/.claude/deepseek-cap.txt` turns the meter red and the hook's cost note to "stop non-essential work"; it blocks nothing. If Chan ever pays for Claude again, or a client provides access, revisit effort and model choice then.

Related: [[chan-hard-rules]] · [[chan-career-portfolio-state]]
