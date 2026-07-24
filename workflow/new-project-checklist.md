# New-project checklist — the product-side ritual

Distilled Jul 23 2026 from Document A v10 section 2B-F (verbatim in `../archives/`).
Scope split: the global CLAUDE.md workspace ritual covers TOOLING (seed file, orientation reads, repo CLAUDE.md, memory index). THIS checklist covers the PRODUCT side when a real build starts. Run both.
Scale (Chan's ruling, Jul 2026): the full ceremony in steps 1 and 4 is for client work and big builds; personal projects run steps 2, 3, 5, and 6 in light form.

1. **Folder skeleton plus master index.** Create the docs home with "00 - DOCUMENT DIRECTORY.md" (what every file is, which is canon, when to read it) and folders: canon/ (frozen reference) · mocks/ (design truth) · working/ (living trackers) · reports-sent/ · _archive/. Rules: archive never delete · one canon per file family, supersede means same-day archive · screenshots go to scratchpad, not the docs folder · every new doc gets a home on creation.
2. **Seed the project memory:** who the client/user is, the hard rules, the goal, the stack, plus a RESUME-HERE note. One topic per file, indexed.
3. **Verify the data model against LIVE data before architecting.** Spec read plus a live sample. Never architect on an assumed model; never trust a tool's claim about live data without a probe. (The one time this was skipped it caused two public walk-backs in a day.)
4. **Mock and design first; approval before building; define Definition-of-Done per feature.** Mock scope and limits: pattern 31 in ../lessons/universal-patterns.md; approvals map 1:1 to build items.
5. **Set the write-safety posture on day one:** what is read-only forever · where app writes go · separate write-scoped credentials · fail-closed kill switches · dummy-prove the first write against any external system on disposable data · audit logging as a Definition-of-Done line. (The standing law: hard rule 10; credential mechanics: pattern 39.)
6. **Establish the ship cadence:** batches and GO gates per Chan's hard rules 6-7 (../memory/chan-hard-rules.md) · the banking ritual per the-drill-and-memory.md (same folder) (bank decisions the moment they land; bank before any compaction).
7. **Install the gauntlet (client work / big builds only).** COPY `../templates/agents/` into the project's `.claude/agents/` and `../templates/hooks/` into `.claude/hooks/` (never run them from Claude-Core), fill every 🔧 ADAPT block, write client-qa / client-ux fresh from the skeletons, wire per `../templates/agents/README.md`. Day-one order: push-guard immediately; the done-wall only after client-qa/client-ux exist. On a no-vision DeepSeek runtime, run the gauntlet checks inline instead of spawning the fleet (see ../workflow/switch-to-deepseek.md).

Extras that earn their keep from day one:
- Capture the client's words VERBATIM into a backlog; requests are captured, never built-on-receipt.
- Investigation discipline: before any discovery query ask "does knowing this change what we build first?" No means do not run it.
- Brand and design truth comes from the client's LIVE artifacts (their site, their newest mock), never inferred from memory.
- If the project gets an LLM feature touching real data, start from `../lessons/grounded-agent-playbook.md`.
