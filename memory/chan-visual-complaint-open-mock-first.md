---
name: chan-visual-complaint-open-mock-first
description: "⭐ When Chan reports a visual mismatch ('not aligned', 'looks off', 'ugly'): OPEN THE REFERENCE IMAGE FIRST and compare anatomy. Do NOT iterate on browser measurements. No-vision model: cannot open the reference, so ask Chan to describe the mismatch in words (see body)."
metadata:
  type: feedback
---

# On any visual complaint: open the reference first

Chan evaluates screens against the reference design in his head (the mock, the live site, the screenshot he sent). Browser measurements can prove two wrong things equal; "aligned" to him means it matches the reference's anatomy, not that my own elements agree with each other.

**How to apply:**
- On ANY visual complaint: open the current reference image FIRST, find that exact region, name the anatomical difference, THEN patch once. Then hand the screen back to Chan's eyes to confirm, on EVERY model, sighted or not. Never claim "aligned" or "looks right" on your own look: this whole file exists because four fixes measured pixel-perfect and were still wrong to him.
- If a complaint repeats after a "verified" fix, the frame is wrong. Stop measuring, re-read the reference, or ask him to circle the spot. His red-box annotated screenshots are gold and end alignment sagas fast.
- On a visual complaint this file OUTRANKS the 10/10 judgment mandate for that pass: one change,
  then back to his eyes. What else you would fix goes in the report; the mandate resumes next
  round. (Audit Jul 26 2026: [[chan-judgment-mandate]] carries the same precedence line from its
  side — the rule is stated at both ends of the seam so either file answers alone.)

**If you cannot see images (no-vision model, e.g. the DeepSeek endpoint):**
You cannot open the reference or read a red-box annotation, so do NOT measure or guess (guessing is what starts the alignment saga). Ask Chan to say the mismatch in WORDS: which screen, which element, what it should look like versus what it does. Combine his words with the code and any TEXT anatomy in the spec or design-lessons, change exactly ONE thing, then hand the screen back to Chan's eyes to confirm. Never claim "aligned" or "looks right." Full runtime context: workflow/switch-to-deepseek.md.

Origin: the Jul 4 2026 alignment saga on Devoted. Four consecutive "measured pixel-perfect" fixes were still wrong to his eye; the real answer (a narrow fixed-width column) sat in the client's design image the whole time.
