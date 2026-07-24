# Claude-Core — Chan's portable Claude continuity kit

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
| `TOOLS.md` | Historical catalog of every tool used on the Devoted project; operational rules live in `workflow/tool-playbook.md`. |
| `DIRECTORY.md` | One-line index of every file in this kit. New file → new line there, always. |
| `CLAUDE.md` | The operating contract — auto-loads into every session via the @import in the global hub (`~/.claude/CLAUDE.md`). |

## How to use it

**Normal case (this machine): nothing to do.** The global hub auto-imports this kit's
`CLAUDE.md` contract into every session, and the hub's workspace ritual covers per-project
setup (the lean-ctx seed file, orientation reads, and a 5-line repo CLAUDE.md from
`templates/project-claude-md.md`).

**New machine:** follow `workflow/new-computer-migration.md`.

**Fallback (a machine without the hub):** copy this folder anywhere and add one line to the
project's CLAUDE.md: `At session start, read <path>/Claude-Core/memory/MEMORY.md and follow
workflow/the-drill-and-memory.md.`

## Keep it alive (the upkeep map — pointers, not copies)

- New durable fact → ONE file in `memory/` + an index line in `memory/MEMORY.md`. New universal
  lesson → extend the matching CATEGORY file in `lessons/`; never create a lookalike file.
- Every new file gets a line in `DIRECTORY.md`, always.
- One home per fact; anti-bloat and where-facts-go rules: global hub, section 6.
- Compressing any permanent doc by more than 25%: run the L24 diff audit first
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

## The private GitHub repo

This folder IS a **private** GitHub repo (github.com/chanrylejay/Claude-Core, created Jul 24 2026) for backup and one-command migration.
`archives/` is excluded via `.gitignore` — the frozen originals hold client names and terms, so
they stay local-only (plus offline backup). Never commit client data or credentials, and keep
the archives exclusion forever. Never connect this repo to Vercel, Netlify, Bolt, or any
importer/deploy service: it is a knowledge base, not an app; connecting it means publishing it.
