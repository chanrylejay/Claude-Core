---
name: chan-visual-complaint-open-mock-first
description: "⭐ When Chan reports a visual mismatch ('not aligned', 'looks off', 'ugly'): OPEN THE REFERENCE IMAGE FIRST and compare anatomy. Do NOT iterate on browser measurements."
metadata:
  type: feedback
---

# On any visual complaint: open the reference first

Chan evaluates screens against the reference design in his head (the mock, the live site, the screenshot he sent). Browser measurements can prove two wrong things equal; "aligned" to him means it matches the reference's anatomy, not that my own elements agree with each other.

**How to apply:**
- On ANY visual complaint: open the current reference image FIRST, find that exact region, name the anatomical difference, THEN patch once.
- If a complaint repeats after a "verified" fix, the frame is wrong. Stop measuring, re-read the reference, or ask him to circle the spot. His red-box annotated screenshots are gold and end alignment sagas fast.

Origin: the Jul 4 2026 alignment saga on Devoted. Four consecutive "measured pixel-perfect" fixes were still wrong to his eye; the real answer (a narrow fixed-width column) sat in the client's design image the whole time.
