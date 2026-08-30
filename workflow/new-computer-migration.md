# New-Computer Migration — moving Claude's brain to a new machine

Written Jul-22, 2026. Everything Claude "knows" on Chan's machine is plain local files.
Moving = copy two folders + one file, reinstall a few tools, fix paths if the username changed.

## What to copy (the brain)

| What | From (old PC) | To (new PC) |
|---|---|---|
| Global Claude config + all project memories | `C:\Users\Chanryle\.claude\` (whole folder) | `C:\Users\<You>\.claude\` |
| MCP server registrations + CLI state | `C:\Users\Chanryle\.claude.json` (single file, sibling of the folder above) | `C:\Users\<You>\.claude.json` |
| Claude-Core (this kit) | `C:\Users\Chanryle\Claude-Core\` | same place, or anywhere — but then update the two path lines in global CLAUDE.md: the root line at the top and the import in section 2 |

Claude-Core lives in a **PUBLIC GitHub repo by Chan's decision** (Aug 11 2026; rationale and the
public-safe writing law: README) — so "copying" is just `git clone`, and it's backed up forever.
(Superseded Aug 24 2026: this line predated the public ruling and said "private".)

A repo backs up only what was PUSHED, and only what is TRACKED. Before the old machine is
retired, in Claude-Core and in every project repo, run `git status --short` and
`git log origin/main..HEAD` and confirm both come back empty. A clone is not a backup until
that check is clean. Then run `git status --ignored --short`: everything it lists is excluded
by .gitignore, exists in no repo anywhere, and must be hand-copied to an offline drive.

**But the repo backs up only the TRACKED, PUSHED part of Claude-Core, and nothing of ~/.claude.** Everything .gitignore excludes lives in no repo at all. Read the LIVE Claude-Core/.gitignore rather than trusting any list written here, because a list drifts and the file does not (as of Jul 25 2026 it excludes archives/, LOCAL-ONLY-*, memory/LOCAL-ONLY-*, .env*, *.pem, *.key, *credential*, *.zip). `git status --ignored --short` prints exactly what must be hand-copied to an offline drive; archives/ and memory/LOCAL-ONLY-security-rulings.md are both in there today, and a tracked file points at that security file as the sole home of six settled rulings. A live-disk migration copies the whole `.claude` folder (global settings.json, the session-ritual hook, ~/.claude.json) as the table above shows. A repo-only or dead-disk recovery gets Claude-Core but must RE-PLANT the global automation: re-create ~/.claude/hooks/session-ritual.mjs, ~/.claude/hooks/push-guard.mjs + its net _pushguard_test.mjs (from `templates/hooks/`; user-level since Aug 24 2026, qa-gauntlet trap 4), and ~/.claude/settings.json from the copies in `templates/global/` (settings.global.skeleton.json is placeholders only; re-add the DeepSeek key via templates/apply-deepseek-switch.mjs), then reinstall the tools below.

The global hub (`~/.claude/CLAUDE.md`) travels inside `.claude`; no repo holds it. After the copy,
`node templates/verify-install.mjs` pins its invariants: the @import to the contract, the fallback
layer, every pointer resolving, and a 45-line ceiling (batch 3a, Aug 30 2026).

## What to reinstall (the tools — these do NOT copy)

1. VS Code + the Claude Code extension (sign into the Claude account — any account works;
   the local files load regardless of account).
2. Git, Node.js.
3. lean-ctx: `npm i -g lean-ctx-bin` — **this FAILS on Windows** (installer tar-vs-`C:\` bug).
   Manual fix: download `lean-ctx-x86_64-pc-windows-msvc.zip` from the GitHub releases page,
   extract with PowerShell `Expand-Archive` (NOT tar), put `lean-ctx.exe` into
   `%APPDATA%\npm\node_modules\lean-ctx-bin\bin\`. Details: `lessons/lean-ctx-freeze-playbook.md`.
4. Projects themselves: `git clone` them (keep each repo's `leanctx-seed.js` — see the freeze playbook).

## Before anything: if this machine was switched to DeepSeek

The copied `~/.claude/settings.json` carries the DeepSeek `env` block AND the API key in
plaintext. On the new machine that means Claude Code points at DeepSeek on first start, against
the account you just signed into, and your key now exists on a second disk.

**THIS IS CHAN'S CALL, NOT THE MODEL'S.** Stop here and ask him: keep the DeepSeek switch, or
migrate back to Claude? Do not decide it, do not infer it from context, do not start either branch
without his answer. That holds even when he said "finish the setup" — a DECIDE point in this file
is always his, and the handoff at the bottom of this file covers path-fixing and verification,
never a choice. (Audit Jul 25 2026: this said "Decide deliberately" and named nobody, in the one
file that ends by handing execution to a model. Every comparable decision in this kit names Chan.)

- **KEEP:** leave settings.json as-is; the key is meant to be on this disk. Still run the sweep
  below, so you know exactly where it landed.
- **BACK TO CLAUDE:** do the HAND ROLLBACK from `workflow/switch-to-deepseek.md` (Rollback
  section) by hand before the first start — THREE objects in settings.json, not two: the `env`
  block, the API key inside it, AND the top-level `"model"` pin if its value starts with
  `deepseek`. The switch script preserves a DeepSeek pin deliberately, so it rides along in the
  copied folder; strip only the first two and the new machine boots pinned to a DeepSeek model
  against the Claude account you just signed into, with nothing to surface it (audit Jul 26
  2026: this branch used to name only the first two). JSON-validate the file, then run the
  sweep.

**KEY SWEEP — a search, never a file list.** More than one file in that folder can hold the key:
`settings.json`, `settings.json.dryrun` (what --dry-run writes), and
`settings.json.bak-before-deepseek`, which the script OVERWRITES on every run, so after any switch
it holds an already-DeepSeek config with the key in it. A future script version will add a fourth.
So do not clean from a list — clean from a search. From PowerShell:

    Get-ChildItem -Path "$env:USERPROFILE\.claude" -Recurse -File |
      Select-String -Pattern 'sk-' -List |
      Select-Object -ExpandProperty Path

Print PATHS ONLY. Never echo the matching line and never paste it into chat: the match IS the key.
Delete or scrub every file it names, then RE-RUN the search and confirm it returns nothing. Not
done until the second run comes back empty.
(Audit Jul 25 2026: this step used to enumerate two files while the script wrote three, so a
migration back to Claude left the API key sitting on the new disk in the .bak-before-deepseek file.)

## The one gotcha: absolute paths

If the new Windows username is NOT `Chanryle`, these files contain hardcoded old paths that
must be find-replaced (`C:/Users/Chanryle` → `C:/Users/<NewName>`, both slash styles):

- `~\.claude\settings.json` (hook commands point at the npm folder) — **JSON-validate after editing!**
- `~\.claude.json` (lean-ctx MCP command path)
- `~\.claude\CLAUDE.md` (the "Claude-Core lives at …" line)

Also: project memory folders inside `.claude\projects\` are named after the OLD project paths
(e.g. `c--Users-Chanryle-Downloads-Projects-Github-teamhubex`). If project paths change on the
new machine, rename those folders to match the new paths (same dash-encoding pattern) or the
memories won't attach.

## Fastest path of all

Copy the folders, open the Claude extension on the new machine, and say:
"I just migrated from my old computer — read Claude-Core/workflow/new-computer-migration.md
and finish the setup." Claude does the path-fixing and verification itself.

## Smoke test after any install, move, or path change
Open a workspace and ask "what is rule zero and who am I working with". A thin answer means the
hub's import of the contract is broken. (Moved here from the global hub, batch 3a Aug 30 2026.)

"Finish the setup" is authority to EXECUTE, never authority to DECIDE. Every DECIDE point in this
file stops and asks Chan, the DeepSeek keep-or-revert branch above most of all. A model that reads
this line as blanket permission will answer a question that was never put to it.
