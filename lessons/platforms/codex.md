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
- **Never hand-pin a model name in `config.toml`; the picker's pin is fine.** OpenAI retired the
  ChatGPT-login pins of gpt-5.4 and gpt-5.4-mini on Aug 31 2026 (gpt-5.6-terra and gpt-5.6-luna
  replace them) and the runtime REJECTS a disallowed value. The extension's model picker writes
  `model = "..."` into the file itself; that is the UI managing a current name, not a hand pin
  (Codex's own catch, Sep 1 2026, when the first draft of this rule read as a ban). The law is:
  change the model in the picker, never by editing the line, and when a name retires the picker
  is where it gets fixed. Same law as DeepSeek's name churn otherwise.
- **Vision exists here, and hard rule 1 does not move.** The Codex models are multimodal and the
  CLI takes image files as input (verify with one screenshot on first use). A screen is still
  VERIFIED only when Chan's eyes saw the shot; Codex's look is evidence, like claude.ai's. What
  changes is only the hand-off: a Codex session can look before reporting, while the DeepSeek
  sessions keep the save-to-file, AWAITING HIS LOOK path.
- **A blank login screenshot can be a stale local server, not a visual failure.** Sep 2's audit
  found `127.0.0.1:3000` serving the login shell while its Next assets 404ed, so login could not
  complete and captures appeared blank or half-rendered. The concurrently listening `:3001`
  served the authenticated app correctly. Check the browser console and served asset URLs, then
  use the healthy local port; do not “fix” the screen before isolating the server.
- **Installing Codex is inbound code (hard rule 12).** `npm install -g @openai/codex
  --ignore-scripts` first, and say so if scripts turned out to be needed. The VS Code extension
  and the desktop app are separate installs, each its own GO.
- **The Claude Code config importer is UNTESTED here: do not point it at `~/.claude`.** The
  kit's push-guard is a PreToolUse shell matcher behind a `|| exit 2` fail-closed wrapper, and no
  importer has proven it preserves that. When Codex earns a real port, the hooks move by hand as a
  HEAVY batch with their nets, never by a one-liner.
- **Cost.** Codex is not on the DeepSeek key: the money meter and the peak windows are not its
  bill, and the free month ends on its own. The AGENTS chain is context on every request, and
  `project_doc_max_bytes` is a cap, not a target. Since Sep 3, Codex carries no Lean MCP or skill:
  its reading discipline is skeleton/outline first, then `rg` and bounded line ranges; boot,
  memory, L24, and exact wording stay raw. The removal isolates Codex after the ritual-net
  collision investigation; it does not change the DeepSeek CLI's Lean setup.

## Proven on Chan's machine, Sep 1 2026 (codex-cli 0.151.0-alpha.7.2, VS Code extension, Full access)

- **Hooks config parser is strict at the top level.** Only `description` and `hooks` are
  accepted. An unknown key (including `_comment`) rejects the entire config and every hook in it;
  the thread shows no hook output, so confirm parser acceptance explicitly after every config edit.
- **The doorway works.** A fresh session read the contract, the index, the cold-start set, the
  TRIAL files and the active canon from `~/.codex/AGENTS.md` alone, with no brief in front of
  it. "Restart" in the extension means a NEW thread; AGENTS.md, config.toml and the rules all load
  at thread start, never mid-thread. `config.toml` as the extension writes it: the picker's model
  line, `model_reasoning_effort`, `[windows] sandbox = "elevated"`, and a
  `[projects.'<path>'] trust_level = "trusted"` table per trusted folder.
- **Prefix rules are a speed bump, not a gate.** With `chan-guard.rules` installed, `git push
  --dry-run` was REFUSED with the justification, and `git -C <path> push --dry-run` ran straight
  through (dry-run: nothing moved). Chan runs Codex with Full access on purpose, so no approval
  prompt and no network block stands behind the rule either. The kit's push-guard blocks the
  `-C` form, `--git-dir`, and PowerShell chains (live-fired on the template, same day): the port of
  that hook to Codex's PreToolUse is the real gate, and until it is live-fired, Codex never pushes.
- **The Full-access clone law.** Until the hook port is live, a Full-access agent works on any repo
  with a remote only from a SECOND clone whose push URL is disabled: `git clone <main clone> <k>`,
  `git -C <k> remote set-url origin <the GitHub URL>`, `git -C <k> remote set-url --push origin
  DISABLED`. Live-fire it with the form that bypassed the rule: `git -C <k> push --dry-run origin
  HEAD` must print `fatal: 'DISABLED' does not appear to be a git repository`; `fetch --dry-run`
  must still work. Work lands as branches; the main clone fetches from `<k>` and Chan pushes by his
  own hand. Codex's own caveat, accepted: the default is rewritable by any actor with write access
  to `<k>`'s config, so `chan-guard.rules` also forbids `git remote set-url`, and the port adds a
  remote-guard hook that sees the `-C` spelling too. push-guard itself ALLOWS `remote set-url` by
  design (it inspects pushes only), so the remote guard is a separate, Codex-only hook.
- **PreToolUse cannot be the durable push gate while unified exec is on.** A fresh unified-exec
  command emits the Bash pre-hook, but `write_stdin` intentionally emits none when it continues an
  existing exec session. Sep 1 proof: P1 (fresh command) consumed a matching GO token and reached
  K's DISABLED remote; P2, sent through that existing session with no token, also reached DISABLED
  and showed no hook error. `unified_exec = false` is a stable, default-on feature toggle, but it
  changes shell-tool behavior and needs Chan's decision. The durable layer is K's unversioned
  `.git/hooks/pre-push`, installed byte-identical from `templates/codex/pre-push`; its arming check
  must confirm the per-clone file is present and equal. The launcher remains only the first layer.
- **Unified exec stays ON; the session bypass belongs to the git gate.** Chan reversed the Sep 1
  `unified_exec = false` ruling after the P2 fail-open: that switch moves shell work onto the
  classic handler, which on this build emits no PreToolUse payload. Only `apply_patch`, MCP calls,
  and unified-exec's `exec_command` reach the hook (handler evidence:
  `codex-rs/core/src/tools/handlers/`). With unified exec on, `write_stdin` can reuse an existing
  session without a new PreToolUse event, so the per-clone git-level `pre-push` gate, not the
  launcher, must block that path. Never turn unified exec off to address the reuse bypass.
- **One GO crosses both layers by claim, then consumption.** `PUSH_GO` begins as strict
  `{repo, issuedAt}` JSON. The launcher validates and marks it with `claimedAt` without deleting
  it; a second launcher call denies that claimed token. The per-clone pre-push gate accepts either
  an unclaimed token (the unified-exec bypass) or a claim no older than five minutes, and it alone
  deletes the token before deciding whether Git proceeds. Expiry always uses `issuedAt`, so a
  claim cannot extend the 30-minute GO. Wrong-repo, stale, and malformed tokens are consumed by
  the first layer that sees them. The cross-layer net pins launcherâ†’pre-push once, bypass once,
  second-push denial, and stale-claim denial (Sep 1 2026, P5 repair).
- **PreToolUse deny wire is byte-strict.** The only modern deny is exactly
  `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"<trimmed non-empty reason>"}}`; keys are camelCase and unknown keys fail the runner's strict parse. The legacy `{"decision":"block","reason":"..."}` also parses, but never mix shapes. The runner parses combined hook output, so modern JSON must be the entire output: no diagnostic stderr after it. Pin both the launcher deny and PowerShell failure wrapper as exact stdout bytes with empty stderr (Sep 1 2026, P2 repair).
- **`templates/_all.mjs` under a command tool.** The LIVE run took about 51 s on the box, and the
  runner used to print nothing until every net had finished, so a command tool with a 30 s limit
  reported "no output" and a false FAIL. Since Sep 1 2026 the runner prints a header at once and
  each net's line as it finishes; the fallback for any harness that still cuts it off is to detach
  it (`Start-Process` with redirected output) and poll the file for the `runner:` line.
- The installed gate file is a template: `../../templates/codex-chan-guard.rules`, copied to
  `~/.codex/rules/chan-guard.rules` byte-for-byte; the static check is `codex execpolicy check
  --rules <file> -- git push origin main` (expect `forbidden`), and the runtime proof is the
  dry-run pair above, re-fired after every change or Codex update.
- **The GO protocol is the DeepSeek CLI's, not stricter (Chan's ruling, Sep 1 2026, late).** The first
  Codex gate had Chan typing the token by hand with a PowerShell line, a stricter rule than the kit
  already runs on DeepSeek (where the hands create `PUSH_GO` on his chat GO). The planner accepted
  that from the hands' CLARIFY without checking it against the kit's own protocol and without naming
  the change to Chan; he found it at midnight, one PowerShell line per push. Reversed: Codex creates
  the token with `go.mjs` on Chan's chat GO, same as DeepSeek. Two laws for the planner from it: the
  hands get the protocol the kit already has, never a stricter one by default; and anything that
  changes how Chan experiences a GO is named to him before it is built. Hostile-review findings
  fixed in the same patch: a GO never authorizes a remote rewrite (it did); the cd family (`cd`,
  `pushd`, `Push-Location`) binds the repo like `Set-Location` (it did not); `--no-verify` is
  denied to Codex token or not, which makes it Chan's private escape from his own terminal, since
  the per-clone git gate otherwise applies to any pusher in the clone, Chan included.
