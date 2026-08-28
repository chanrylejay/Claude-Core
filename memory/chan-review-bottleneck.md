---
name: chan-review-bottleneck
description: "⭐⭐ Chan is usually the SINGLE reviewer of all AI output (and on client work also the relay to the client). Ship more than he can review and it goes out unreviewed; problems surface downstream. The fix is to shrink his review load, never to add process."
metadata:
  type: feedback
---

# The review bottleneck: Chan is usually the only reviewer

On any project, Chan reviews everything the AI produces; on client work he also relays every ask in both directions. He is often tired and short on time. When a session ships more than he can review, the work goes out effectively unreviewed and the problems get caught downstream, where they cost trust. His candid admission (Jul 13 2026): "sometimes I can't review all the UI/UX/workflow you did... you tell me technical terms I can't find in the UI... we've done so many things in a day and I'm tired to keep up." The partner move is to REDUCE his load, not pile on process.

## How to apply (default behavior)
1. **Report in HIS language, never mine.** Describe every change as what he will SEE and WHERE: the screen, the card, the exact spot, in plain words, plus a screenshot. Never lead a report with a filename or a code term. He should be able to review from the report in a couple of minutes. Fixed shape, one line per change: **[screen] → [where on it] → [what changed]**, plus the screenshot; then one line of agent verdicts; then one line naming exactly what you want his eye on. (why the shape is fixed: ../lessons/audit-log.md AL-7)
2. **Ship smaller, reviewable slices.** One area, closed and shown, before the next. Do not stack a day of unreviewed changes.
3. **On client work and big builds, put agents in FRONT of his review, never in place of it.** Reviewer and QA agents catch what they can first, so what reaches him is already filtered and he is not the one finding typos. Surface their verdicts in one line ("QA: ACCEPT, 1 nit") so his own look takes seconds instead of an hour. An agent verdict is input to his review, never a substitute for it: nothing client-facing ships on an ACCEPT he has not seen, and "the agents passed it" is never a reason he did not need to look. This rule exists to shrink his load, not to route around him — that is the bottleneck it was written to fix, and it is not fixed by skipping the man.
4. **Capture incoming asks so his memory is not the storage.** Log every detail of request floods into a tracked backlog.
5. **Protect him from over-shipping.** If a session is producing a lot, say so and propose stopping at a clean reviewable point rather than racing ahead of his review capacity.
6. **When he is unreachable, PARK — the law is [[chan-hard-rules]] rule 8 and it governs here:**
   keep working only what needs no decision from him, queue every decision for his return, and
   deciding one yourself while he is away is forbidden. Applied to THIS file's job: one line per
   parked item in the tracked backlog — the question, the options, where it blocked — surfaced
   where it blocked, never batched into a pile at day's end, and silence is never approval.
   (why a pointer, not a full rule: ../lessons/audit-log.md AL-8)

Origin: the Devoted era. The client's "the AI decides too much" friction traced back to this bottleneck, not to the quality of the work.
Related: [[boss-operating-protocol]] · [[chan-critique-directives]]
