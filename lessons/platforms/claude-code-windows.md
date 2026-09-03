# Claude Code on Windows — MCP setup gotchas

Lessons for adding MCP servers to Claude Code on Windows (VS Code + CLI). See also the
Windows/lean-ctx shell notes under `claude-code-windows`.

## stdio `npx` servers
- Time out on cold start (first run downloads the package). Wrap them: `cmd /c npx -y <pkg>`.
- Under lean-ctx the Bash shell is MSYS2, whose path conversion rewrites a leading-slash
  argument (`/c`) into `C:/`, silently corrupting the wrapper. Fix: run
  `claude mcp add` with `MSYS2_ARG_CONV_EXCL='*'` set, then verify `.claude.json` shows a
  literal `/c`. `claude` itself must be on the lean-ctx allowlist for any `claude mcp`
  command to run at all.

## Scopes and where the files live
- user = global (`~/.claude.json`); project = repo `.mcp.json` (shared/committed); local =
  repo-private. VS Code extensions read the same files as the terminal.

## shadcn MCP (official, free, stdio)
- `npx shadcn@latest mcp init --client claude` writes the repo `.mcp.json`;
  `--client codex` writes `~/.codex/config.toml`. Not installable on claude.ai web (stdio
  only); Claude Desktop can via `claude_desktop_config.json`.

## HTTP servers (auth)
- HTTP MCPs (Vercel, Neon, context7) authenticate by a one-time browser login.
- GitHub official MCP (`https://api.githubcopilot.com/mcp/`) rejects dynamic client
  registration — header auth only. Type the PAT into the terminal yourself, never into a
  chat or CLI prompt. It is optional when `git` + `gh` already cover pushes/PRs; useful for
  repo search and reading. Check licenses before borrowing code from found repos.

## Terms
- Plugin ≠ skill: a plugin bundles MCP servers/commands/hooks/skills.
