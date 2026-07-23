# New-Computer Migration — moving Claude's brain to a new machine

Written Jul-22, 2026. Everything Claude "knows" on Chan's machine is plain local files.
Moving = copy two folders + one file, reinstall a few tools, fix paths if the username changed.

## What to copy (the brain)

| What | From (old PC) | To (new PC) |
|---|---|---|
| Global Claude config + all project memories | `C:\Users\Chanryle\.claude\` (whole folder) | `C:\Users\<You>\.claude\` |
| MCP server registrations + CLI state | `C:\Users\Chanryle\.claude.json` (single file, sibling of the folder above) | `C:\Users\<You>\.claude.json` |
| Claude-Core (this kit) | `C:\Users\Chanryle\Claude-Core\` | same place, or anywhere — but then update the two path lines in global CLAUDE.md: the root line at the top and the import in section 2 |

Best practice: keep Claude-Core in a **private GitHub repo** — then "copying" is just `git clone`,
and it's backed up forever.

## What to reinstall (the tools — these do NOT copy)

1. VS Code + the Claude Code extension (sign into the Claude account — any account works;
   the local files load regardless of account).
2. Git, Node.js.
3. lean-ctx: `npm i -g lean-ctx-bin` — **this FAILS on Windows** (installer tar-vs-`C:\` bug).
   Manual fix: download `lean-ctx-x86_64-pc-windows-msvc.zip` from the GitHub releases page,
   extract with PowerShell `Expand-Archive` (NOT tar), put `lean-ctx.exe` into
   `%APPDATA%\npm\node_modules\lean-ctx-bin\bin\`. Details: `lessons/lean-ctx-freeze-playbook.md`.
4. Projects themselves: `git clone` them (keep each repo's `leanctx-seed.js` — see the freeze playbook).

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
