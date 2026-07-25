# Grounded-agent playbook — building LLM features that touch real data

Distilled Jul 23 2026 from Documents A v10 and B v9 session-13 lessons (verbatim in `../archives/`).
Proven in production on the Ask-Devoted agent (a scheduler-facing assistant over live scheduling data). Use this for ANY future feature where an LLM speaks about real records.

**The four terms:** claim cage = the validator rule that blocks any factual claim not backed by a tool result (both cages run INSIDE the post-generation validator; the defense-in-depth list below counts the rules and the validator engine separately on purpose) · name cage = the same for entity names (output may only name resolver-approved entities) · resolver gate = deterministic entity resolution that runs BEFORE the LLM and hands it resolved entities · red-team corpus = the saved full attack suite, re-run in full after every change.

**Build order:** 1 resolver first · 2 tools as the only fact source · 3 cages + validator on the output · 4 severe prompt last (it is the weakest layer) · 5 attack with the red-team corpus, full re-run after each fix · 6 flip it on for the owner EARLY.

## The core architecture
1. **Free to think, caged on facts.** Let the LLM reason and talk naturally, but every FACT in its output must come from a tool result and pass a post-generation validator. Forbidding narration does not work; caging facts does.
2. **A deterministic resolver gates the LLM, not the reverse.** Entity resolution (which client? which date?) happens in deterministic code with certainty tiers; the LLM receives resolved entities. Resolver certainty beats LLM confidence. The LLM passes raw names through; it never silently "fixes" a name.
3. **Defense in depth.** No single safety layer held alone in testing: resolver gate + tool-sourced facts + name cage + claim cage + a severe prompt + a post-generation validator. Layer them.
4. **Deterministic backstops beat prompt pleas.** Where the prompt alone failed (invented shift times), a code-level gate (strip times when the request was vague) succeeded.
5. **Where a check RUNS matters as much as what it checks.** A validator scoped to the wrong turns over-fires or under-fires; place each guard at the exact seam it protects.

## Failure modes that are real (design for them)
- **Blank LLM output happens.** Retry, then a question-aware fallback, then recall-to-named-entity. Never a dead end, never fabrication.
- **Honest declines are a FEATURE.** The list of things the agent honestly says it cannot do IS the tool roadmap, not a bug list.
- **The scariest failures are silent and clean-looking.** Both independent red-teams converged on "clean-but-wrong answer, especially wrong-client" as risk number one; the whole gate design exists for it. Prioritize severity times probability, not test-everything.
- **Internal scoring must never leak into the UI** (no "care-load 2/5", no "v0.9-estimated" labels in user-facing text).

## The testing law
- **Every safety fix can over-correct: re-run the FULL red-team corpus after each change.** A hallucination fix once created a false-denial bug that only the full re-run caught.
- Fix in isolation, THEN attack the seams: combined and stacked attacks break fixes that pass alone.
- Two proofs required: a clean acceptance pass AND a torture pass. Ground acceptance tests in what the customer actually asked for.
- "Looks done" gets verified on MECHANISM (probe the exact coercion sites), not on totals or a green build.
- **Real use finds the seam in one try.** The first live user conversation surfaced three bugs no red-team predicted. Flip new capabilities ON for the owner EARLY; polishing in the dark wastes the hardening.

## Product framing
- AI-draft, human-approve, for anything outward-facing. Always label AI content as AI.
- Sequence everything toward the real user running their real work in the tool; the handoff is the point.
- "Find X for Y" and "show me raw availability" are DIFFERENT needs; do not merge them into one surface.
- Real-time AI calls per user page-visit are BANNED: generate on a schedule into a DB cache and serve every visit from the cache. The cage covers TRUTH, not freshness, so add the freshness rule yourself: any claim about a LIVE record (a time, a status, an availability, a balance) is read at request time or is not served at all. Cached generation is for stable prose and rankings. A cached answer about a moving record is the clean-but-wrong answer this playbook ranks as risk #1, and it passes the validator because it really did come from a tool result — just not a current one. Cost + latency law, production-proven; doubly true now that the API key is Chan's own money.
