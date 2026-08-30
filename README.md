# Claude-Core — Chan's portable Claude continuity kit

AI sessions forget. This kit is the fix.

Every AI chat starts cold. It does not remember you, what you built, what you learned, or
what standards you work under. Chan lived this and built the fix: this repo makes every
session start with full context, your rules, and past lessons, loaded before any work
begins. It is a real working system he uses every day, not a template.

Two AI agents run it in relay: DeepSeek drives the CLI, Claude plans and reviews, Chan is
the boss of both. Mechanics: `workflow/two-model-relay.md`. The full file map is
`DIRECTORY.md` (one line per file).

**What this is:** everything Claude needs to know you and work your way, extracted from the
Devoted Care project (Jun–Jul 2026) and made project-agnostic. This folder is the permanent
brain: memory, lessons, workflow, and templates that survive every session, project, and
machine — no drifting, no re-explaining who you are or how you like to work.

Built Jul 15 2026, during the Devoted Care wind-down.

## What's inside

| Folder | What it holds |
|---|---|
| `memory/` | **Who Chan is** — your profile, hard rules, preferences, career state, operating protocol. `MEMORY.md` is the index; each file is one durable fact. |
| `workflow/` | **How we work together** — THE DRILL, the memory system itself, the QA-gauntlet pattern, the tool playbook. |
| `lessons/` | **What experience taught us** — engineering, platform, AI-agent, and client-collaboration lessons, distilled and de-clientized. |
| `projects/` | **Per-project canons** — one folder per project (Devoted Care's design canon lives here); read only when working that project. |
| `archives/` | **Frozen originals** — Documents A, B, C verbatim with stale-lock warnings; never edited, never committed (see below). |
| `templates/` | **Reusable infrastructure** — the five gauntlet agents (spec-reader, reviewer, net-runner, recon, challenger) and the guard hooks (push-guard, gauntlet-guard). The two client-persona roles (QA/UX) are written fresh per project. |
| `portfolio/` | A confidentiality-safe summary of what you built at Devoted, ready for resume/interview use. |
| `DIRECTORY.md` | One-line index of every file in this kit. New file → new line there, always. |
| `CLAUDE.md` | The operating contract — auto-loads into every session via the @import in the global hub (`~/.claude/CLAUDE.md`). |

## How to use it

**Normal case (this machine): nothing to do.** The global hub auto-imports this kit's
`CLAUDE.md` contract into every session, and the hub's workspace ritual covers per-project
setup (the lean-ctx seed file, orientation reads, and a 5-line repo CLAUDE.md from
`templates/project-claude-md.md`).

**New machine:** follow `workflow/new-computer-migration.md`.

**Fallback (a machine without the hub):** copy this folder anywhere and add one line to the
project's CLAUDE.md: `At session start, read <path>/Claude-Core/CLAUDE.md (the operating
contract, mandatory) and <path>/Claude-Core/memory/MEMORY.md, then follow
workflow/the-drill-and-memory.md.` The contract must be named explicitly here: without the hub
there is no @import, so a fallback line that loads only the index and the drill runs a full
session with no operating contract at all.

## Keep it alive (the upkeep map — pointers, not copies)

- New durable fact → ONE file in `memory/` + an index line in `memory/MEMORY.md`. New universal
  lesson → extend the matching CATEGORY file in `lessons/`; never create a lookalike file.
- Every new file gets a line in `DIRECTORY.md`, always — EXCEPT `memory/` files, which are indexed one line each in `memory/MEMORY.md` and never in DIRECTORY too.
- One home per fact; anti-bloat and where-facts-go rules: workflow/the-drill-and-memory.md, "Where new facts go".
- **Active-project canon law (Aug 28 2026, Chan's GO):** every project Chan is actively working
  has a PUBLIC-SAFE canon in `projects/<name>/project-canon.md`, and the state block in
  `memory/MEMORY.md` names the active one via `active_project` — so any fresh clone, any
  machine, knows what he is working on now. The canon carries context (shape, decisions,
  state, blockers), never code, credentials, client names, or anything failing the
  would-he-post-it test; those live in the private project repo or LOCAL-ONLY files. Canon
  updates ride the same session that changes reality. Switching active projects updates
  `active_project`, the NOW line, and the state block in one edit. The full project map is
  `projects/REGISTRY.md` — every project one line, added the session it first appears.
- Compressing any permanent doc by more than 25% of its characters: run the L24 diff audit first. Measured against the version at the START of the session, not the previous edit — otherwise two 24% passes strip 42% and the audit never fires
  (`lessons/universal-patterns.md`, "Maintaining documents").
- Archive never delete; the frozen originals live in `archives/` (rules in the `DIRECTORY.md`
  header). Memory mechanics and the banking law: `workflow/the-drill-and-memory.md`.

## What was deliberately left out

- Devoted's client internals — credentials, database IDs, live URLs, client/caregiver data,
  and the client-era operational notes. Those stay archived locally in the origin project's
  own memory bank, outside this repo (sealed Jul 24 2026). They're client work —
  confidentiality applies.
- The client-persona agents (the client-qa/client-ux pair of the origin project) — they embodied that client's specific
  taste and laws. The generic gauntlet roles they filled are documented in
  `workflow/qa-gauntlet-pattern.md`; write the persona agents fresh per project.
- What survives from that project here is the *lessons*, not the client's data.

## Why this is public

This repo is public on purpose (Aug 11 2026). The two-agent relay needs a public clone that
the claude.ai half can read, and it doubles as a portfolio piece for Chan. Everything inside
is written public-safe by law: no keys, no client data, nothing Chan would not post himself.
The full law follows in "The GitHub repo (PUBLIC by decision)".

## The GitHub repo (PUBLIC by decision)

This folder IS a **PUBLIC** GitHub repo (github.com/chanrylejay/Claude-Core). Public is Chan's
deliberate choice, Aug 11 2026: a private repo cannot be handed to the claude.ai half of the
relay, and the relay is the workflow. The consequence is a standing law — **everything written
into this kit is world-readable.** Write every memory and lesson file public-safe: no keys, no
client data, no credentials, and nothing about Chan's money, clients, or private life that he
would not post himself. If a fact cannot be written public-safe, it goes in a `LOCAL-ONLY-*`
file, which `.gitignore` already excludes.
`archives/` is excluded via `.gitignore` — the frozen originals hold client names and terms, so
they stay local-only (plus offline backup). Never commit client data or credentials, and keep
the archives exclusion forever. Never connect this repo to Vercel, Netlify, Bolt, or any
importer/deploy service: it is a knowledge base, not an app; connecting it means publishing it.
