# Codex CLI (OpenAI) — platform gotchas

(One platform, one file — same law as every sibling here. The parent `../platform-gotchas.md`
holds the two standing laws that govern every entry — the irreversible-action duplication law
and the written-out GO law — read them once per session before acting on anything below.
Opened Sep 1 2026: Chan holds a free month of ChatGPT Plus, and Codex is being tried as a
SECOND pair of hands next to the DeepSeek CLI, never as a replacement for it. Every fact below
was read off OpenAI's own docs on Sep 1 2026; that reading is not a warrant for any later date.
Marker: codex-doorway-2026-09-01.)

- **A doorway, not a port, and never a duplicate.** Codex reads neither `CLAUDE.md` nor the
  hub's `@import`. It builds one instruction chain per session: `~/.codex/AGENTS.md` (global;
  `AGENTS.override.md` wins when present, one file only at that level), then an `AGENTS.md`
  per directory from the project root (the git root) down to the working directory, joined
  root-first and cut at `project_doc_max_bytes`. So the kit stays ONE folder on disk and Codex
  gets a pointer file into it; both blocks live in `../../templates/codex-agents-md.md`. A second
  copy of the kit is two brains that drift, and the drill's disk-wins rule dies with it. The chain
  is read once at start: an edited `AGENTS.md` takes effect in the NEXT session, never the current one.
- **The trust gate fails silent.** Since the Aug 26 2026 build an UNTRUSTED project gets no
  project-level `AGENTS.md` and no project `.codex/` layer (config, hooks, rules), and nothing
  says so; it looks exactly like a project with no rules. First run in any repo: answer the trust
  prompt, then prove the chain from the repo root with
  `codex --ask-for-approval never "Summarize the current instructions."`: the answer must echo
  the global file first and the project file second. No echo means no rules loaded: stop there.
- **The sandbox is the push gate, and only a live-fire makes it one.** Defaults are
  `sandbox_mode = "workspace-write"`, `approval_policy = "on-request"`, and
  `[sandbox_workspace_write] network_access = false`, so a push should fail at the network.
  Should is not is: the kit's push-guard is a Claude Code hook and does not run inside Codex, so
  hard rules 6-7 have no hook behind them there. Before Codex touches any repo with a remote,
  run `git ls-remote origin` INSIDE a Codex session: it must fail or stop at an approval prompt
  that Chan declines. If it succeeds, the network is open and Codex is not a safe pair of hands
  for a repo with a remote until the config is fixed. On native Windows the sandbox needs
  `[windows] sandbox = "elevated"` (admin), and the live-fire is the only proof it is on.
  Re-fire after any config change or Codex update, the way verify-install re-fires push-guard.
- **The proxy guards only the command sandbox.** Web search, MCP servers, Codex cloud tasks,
  and the browser or Computer Use surfaces ride separate connections that the sandbox does not
  filter. Never connect Codex to an MCP that can write a third party's system (hard rule 10 has
  no hook here either). A cloud task ships the repo to OpenAI's machines: that is sending code
  out, not a local run, and on client code it needs Chan's GO first, each time.
- **Memories stay OFF.** `~/.codex/memories/` is off by default and stays off: the kit is the one
  memory, and a second generated store is the duplicate-brain problem in disguise. OpenAI's own
  guidance says required rules belong in `AGENTS.md` and memories are a recall layer. Chronicle
  (screen capture feeding memory) stays off too: client screens sit on this machine.
- **Never pin a model name in `config.toml`.** OpenAI retired the ChatGPT-login pins of gpt-5.4
  and gpt-5.4-mini on Aug 31 2026 (gpt-5.6-terra and gpt-5.6-luna replace them) and the runtime
  REJECTS a disallowed value. Same law as DeepSeek's name churn: ride the default, and confirm any
  name on the docs page the day it is needed.
- **Vision exists here, and hard rule 1 does not move.** The Codex models are multimodal and the
  CLI takes image files as input (verify with one screenshot on first use). A screen is still
  VERIFIED only when Chan's eyes saw the shot; Codex's look is evidence, like claude.ai's. What
  changes is only the hand-off: a Codex session can look before reporting, while the DeepSeek
  sessions keep the save-to-file, AWAITING HIS LOOK path.
- **Installing Codex is inbound code (hard rule 12).** `npm install -g @openai/codex
  --ignore-scripts` first, and say so if scripts turned out to be needed. The VS Code extension
  and the desktop app are separate installs, each its own GO.
- **The Claude Code config importer is UNTESTED here: do not point it at `~/.claude`.** The
  kit's push-guard is a PreToolUse shell matcher behind a `|| exit 2` fail-closed wrapper, and no
  importer has proven it preserves that. When Codex earns a real port, the hooks move by hand as a
  HEAVY batch with their nets, never by a one-liner.
- **Cost.** Codex is not on the DeepSeek key: the money meter and the peak windows are not its
  bill, and the free month ends on its own. The kit-lean law still binds: the AGENTS chain is
  context on every request, and `project_doc_max_bytes` is a cap, not a target.
