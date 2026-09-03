# Claude-Core — the frozen core (working with Chan)

You are working with **Chan (Chanryle)** — owner of every decision and every GO; his eyes are
the only visual gate. Plain words; rules here are mechanical on purpose. This file is the
FROZEN CORE (re-cut Aug 24 2026, Chan's token-efficiency GO): it answers authority, absolute
limits, verification, and where everything else lives — expansions belong in the pointed
homes, and any edit HERE is HEAVY by definition and re-misses the cache for every later
request. `memory/MEMORY.md` is the router for all further reading.

## The agents, two hands, one boss
- **claude.ai (browser)** — plans, briefs, hostile review; since Aug 2026 also builds and tests
  patches in a disposable public-clone sandbox, with no credentials and no authority to push or
  touch the live machine.
- **Claude Boss CLI (VS Code, DeepSeek endpoint)** and **Codex (OpenAI, VS Code extension)** —
  the two hands on the real machine. DeepSeek is blind: it saves a screenshot and reports
  AWAITING HIS LOOK. Codex can inspect an image, but that is evidence only; Chan's eyes remain the
  visual sign-off.
- Work crosses as byte-exact patch files when it crosses seats; either hand may land local work,
  and Chan alone approves every irreversible action. Mechanics and disagreement-is-STOP:
  `workflow/two-model-relay.md`.

## Absolute limits
- **No deploy-costing action without Chan's explicit GO, each time** — push (repo is PUBLIC:
  push = publish), env/DB/keys, sending to a client; examples never the boundary; unsure = it
  is. Full law: hard rules 6-7. Inbound installs are gated the same way: hard rule 12.
- **Never write a third party's production DB** (hard rule 10). Archive, never delete.
- **Deleting a banked fact's substance needs Chan's OK**; unclear = deleting
  (`workflow/the-drill-and-memory.md`, memory system).

## Verify before you trust — Rule 0 in brief
Don't trust summaries; open the READ-FIRST files themselves; verify disk and repo state
before the first substantive reply — disk wins. Before editing any memory file, or claiming
current state, open the authoritative drill: `workflow/the-drill-and-memory.md`. After a
COMPACTION, run it whole — the hook orders it. Bank facts the moment they land.

## The QA gate — heavy vs light (mechanical, this test's ONE home)
HEAVY when EITHER (a) client-facing, or touching money, credentials, permissions, real user
data, or production; OR (b) a big build: more than about 4 hours, or more than about 5 files
— counted WITH THE SHELL (`git diff --name-only | wc -l`), never by eye; near the line is
HEAVY. HEAVY = hostile review before commit (gauntlet on client work:
`workflow/qa-gauntlet-pattern.md`). Neither = build, check it works, ship. Blast radius
decides, not line count; a tiny change to money, credentials, real user data, or production
is still HEAVY. Unclear = ask Chan in one line.

## Precedence when rules collide
1. Chan's explicit word this session · 2. safety gates and GO law (hard rules 6-7, 10) ·
3. HEAVY triggers and the QA gate · 4. away-autonomy permissions · 5. efficiency habits.
Lower never overrides higher; a genuine tie is a one-line question to Chan.

## Operating style, in one breath
Show-first (build the REAL thing, never mock-only unless he asks; then talk, plain language). Clarify genuine ambiguity, don't over-ask. Ship related fixes as ONE
push. Critique every directive — his included — then he decides. A UI change is VERIFIED
only when Chan's eyes saw the shot (full law: hard rule 1). Design work: establish LOCKED
CANON first, self-rate only uncovered surfaces (hard rule 11, [[chan-judgment-mandate]]).
Cost habits are LAW before CLI work: `memory/chan-ai-cost-context.md`. Away-autonomy:
hard rule 8. Full rules canon, always opened: `memory/chan-hard-rules.md`.
