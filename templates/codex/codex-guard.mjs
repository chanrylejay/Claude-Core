// codex-guard — Codex PreToolUse gate for guarded Bash-tool commands (Sep 1 2026).
// Scope: blocks recognised executable Bash-tool pushes unless Chan's one-shot, repo-bound GO
// token is valid. The arming check detects template/install drift; this is not a complete shell
// interpreter or an OS security boundary. A script file we cannot read, xargs git, or a push
// from a fresh clone with no pre-push hook can still reach git. Those paths need a DISABLED push
// URL or credential-level lock as their backstop; both remain Chan's decisions.
// The trial clone's push URL remains DISABLED until Chan changes it by hand, which is the
// separate configuration backstop, not an OS lock.
// GO protocol (Chan's ruling, Sep 1 2026, parity with the DeepSeek CLI): Chan says GO in the chat;
// Codex then creates the token with `node ~/.codex/hooks/go.mjs <repo>` and pushes. Never without
// his GO in that same chat, never restored, never edited; one GO is one push attempt.
// Literal --no-verify anywhere in a Bash command is ALWAYS denied before push detection:
// Codex never skips the git gate, for commit or push, token or not, so
// `--no-verify` stays Chan's own escape from his own terminal. A remote rewrite is ALWAYS denied,
// token or not: a GO to push never authorizes changing where pushes go. The same applies to
// core.hooksPath overrides. -n stays subcommand-specific: push dry-run, commit hook bypass;
// it is not blanket-matched here. Passing the hook is never permission to bypass a gate.
//
// The MCP wiring selects --connector independently of stdin. Runner and guard failures deny
// on that route; Bash retains its existing failure directions. Responses contain only JSON.
// Non-string tool_name metadata passes through on the Bash route; the connector route denies it.

import { existsSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isGitPush } from "../hooks/push-guard.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOKEN = join(HERE, "..", "PUSH_GO");
const MAX_AGE_MS = 30 * 60 * 1000;

// batch-0c-captured-connectors: the legacy single-underscore denylist is retired.
// Context7 docs, local shadcn changes, and the existing Playwright containment remain scoped exceptions.
// These are separate tool servers. Every codex_apps connector goes through the read policy.
const connectorException = (name) => /^mcp__(?:playwright|shadcn|context7)__/.test(name);
const READ_POLICY = new URL("./connector-reads.json", import.meta.url);
function connectorAllowed(name) {
  const policy = JSON.parse(readFileSync(READ_POLICY, "utf8"));
  if (policy.schemaVersion !== 1 || !Array.isArray(policy.operations) || !policy.operations.length)
    throw new Error("connector-reads.json has an invalid schema");
  const names = new Set();
  for (const row of policy.operations) {
    if (typeof row.toolName !== "string" || !/^mcp__codex_apps__[a-z0-9]+__[a-z0-9_]+$/.test(row.toolName) ||
        /__run_sql(?:_|$)/.test(row.toolName) || names.has(row.toolName) ||
        typeof row.capturedAtUtc !== "string" || !Number.isFinite(Date.parse(row.capturedAtUtc)) ||
        typeof row.codexVersion !== "string" || !row.codexVersion.trim() ||
        typeof row.fixture !== "string" || !row.fixture.startsWith("fixtures/") ||
        !/^[a-f0-9]{64}$/.test(row.fixtureSha256) || !/^[a-f0-9]{64}$/.test(row.rawSha256) ||
        typeof row.readSemantics !== "string" || !row.readSemantics.trim())
      throw new Error("connector-reads.json has an invalid or duplicate provenance row");
    names.add(row.toolName);
  }
  return names.has(name);
}

const PLAYWRIGHT_CLI_ACTIONS = new Set(["open", "goto", "tab-new", "upload", "drop"]);
const PLAYWRIGHT_CLI_FILE_ACTIONS = new Set(["upload", "drop"]);

function shellWords(value) {
  return value.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map((word) => word.replace(/^(?:"|')|(?:"|')$/g, "")) ?? [];
}

function isPlaywrightCliExecutable(word) {
  return /(?:^|[\\/])playwright-cli(?:\.(?:cmd|exe))?$/i.test(word) || /^playwright-cli(?:\.(?:cmd|exe))?$/i.test(word);
}

function isNpxPlaywrightCli(words, index) {
  if (!/^(?:npx|npx\.cmd)$/i.test(words[index] ?? "")) return false;
  let next = index + 1;
  while (/^--(?:no-install|yes|quiet)$/.test(words[next] ?? "")) next++;
  return /^(?:@playwright\/cli|playwright-cli)$/.test(words[next] ?? "");
}

// The CLI is deliberately contained to the local app. It is not a general browser for Codex:
// navigation accepts only localhost / 127.0.0.1, and its two file-chooser actions are never run.
// Parse every shell segment so a later CLI invocation cannot hide behind an earlier command.
function playwrightCliViolation(command) {
  for (const segment of command.split(/[;&|\n]/)) {
    const words = shellWords(segment);
    for (let i = 0; i < words.length; i++) {
      let firstArg;
      if (isPlaywrightCliExecutable(words[i])) firstArg = i + 1;
      else if (isNpxPlaywrightCli(words, i)) {
        firstArg = i + 1;
        while (/^--(?:no-install|yes|quiet)$/.test(words[firstArg] ?? "")) firstArg++;
        firstArg++;
      } else continue;
      const actionIndex = words.findIndex((word, index) => index >= firstArg && PLAYWRIGHT_CLI_ACTIONS.has(word.toLowerCase()));
      if (actionIndex < 0) continue;
      const action = words[actionIndex].toLowerCase();
      if (PLAYWRIGHT_CLI_FILE_ACTIONS.has(action)) return "Playwright CLI " + action + " is disabled; file-chooser actions are never authorized.";
      const target = words.slice(actionIndex + 1).find((word) => /^https?:\/\//i.test(word));
      if (!target) continue;
      try {
        const url = new URL(target);
        if (url.hostname.toLowerCase() === "localhost" || url.hostname === "127.0.0.1") continue;
      } catch {}
      return "Playwright CLI navigation is localhost-only; refusing " + target + ".";
    }
  }
  return null;
}

const fail = (message) => {
  const reason = "[codex-guard] BLOCKED: " + message;
  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason,
  } }) + "\n");
  process.exit(0);
};
const pass = () => { process.stdout.write("{}\n"); process.exit(0); };
const canonical = (p) => realpathSync.native ? realpathSync.native(p) : realpathSync(p);

// The shared matcher is deliberately paranoid because it protects the DeepSeek side too. Codex
// uses it for push detection, with this caller identifying executable positions. Quote contents
// stay intact: stripping inner quotes or expanding variables would erase the ambiguity we deny.
// batch-0c-fix1-subcommand-token
const unquote = (word) => /^(?:"[\s\S]*"|'[\s\S]*')$/.test(word) ? word.slice(1, -1) : word;
function shellSegments(command) {
  const segments = [], words = [];
  let word = "", quote = "";
  const flushWord = () => { if (word) words.push(word); word = ""; };
  const flushSegment = () => { flushWord(); if (words.length) segments.push(words.splice(0)); };
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    if (c === "\\" && quote !== "'" && i + 1 < command.length) { word += c + command[++i]; continue; }
    if (quote) { word += c; if (c === quote) quote = ""; continue; }
    if (c === '"' || c === "'") { quote = c; word += c; }
    else if (/[;&|\n()`]/.test(c)) flushSegment();
    else if (/\s/.test(c)) flushWord();
    else word += c;
  }
  flushSegment();
  return segments;
}
function executableGitCalls(command, depth = 0) {
  if (depth > 8) throw new Error("shell recursion limit; unread git command");
  const calls = [];
  for (const words of shellSegments(command)) {
    let i = 0;
    while (/^(?:[A-Za-z_]\w*=|(?:command|sudo|time|env|exec)$)/.test(unquote(words[i] ?? ""))) i++;
    const exe = unquote(words[i++] ?? "");
    if (/(?:^|[\\/])git(?:\.exe)?$/i.test(exe)) {
      const options = [];
      while (i < words.length && unquote(words[i]).startsWith("-")) {
        const option = unquote(words[i++]);
        if (option === "--") break;
        if (["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"].includes(option)) {
          if (i === words.length) throw new Error("missing git option value for " + option);
          options.push([option, unquote(words[i++])]);
        } else if (/^(?:-C|-c).+/.test(option)) options.push([option.slice(0, 2), unquote(option.slice(2))]);
        else if (option.includes("=")) {
          const [key, value] = option.split(/=(.*)/s);
          options.push([key, unquote(value)]);
        }
        else options.push([option, null]);
      }
      if (i < words.length) calls.push({ subcommand: unquote(words[i]), options, args: words.slice(i + 1).map(unquote) });
    } else {
      let payload;
      if (/(?:^|[\\/])(?:bash|sh|zsh|dash|ksh|pwsh|powershell|cmd)(?:\.exe)?$/i.test(exe) &&
          /^(?:-c|-command|\/c)$/i.test(unquote(words[i] ?? ""))) payload = words[i + 1];
      else if (/^(?:eval|source)$/.test(exe)) payload = words[i];
      // exec with a quoted payload was supported by the previous detector too.
      else if (i === 2 && unquote(words[0]) === "exec") payload = words[1];
      if (payload && /^(?:"[\s\S]*"|'[\s\S]*')$/.test(payload)) {
        let body = unquote(payload);
        if (payload[0] === '"') body = body.replace(/\\(["\\$`])/g, "$1");
        calls.push(...executableGitCalls(body, depth + 1));
      }
    }
  }
  // Retain the existing conservative substitution treatment, even inside quoted reader text.
  for (const re of [/\$\(([\s\S]*?)\)/g, /`([^`]*)`/g])
    for (const hit of command.matchAll(re)) calls.push(...executableGitCalls(hit[1], depth + 1));
  return calls;
}
function gitCommandViolation(calls) {
  for (const call of calls) {
    if (!/^[a-z][a-z-]*$/.test(call.subcommand))
      return "unreadable git subcommand " + JSON.stringify(call.subcommand) + "; use a plain word with optional wrapping quotes.";
    const protectedKey = (value) => /^core\.hookspath(?:=|$)/i.test(value ?? "");
    if (call.options.some(([option, value]) => ["-c", "--config-env"].includes(option) && protectedKey(value)) ||
        (call.subcommand === "config" && call.args.some(protectedKey)))
      return "core.hooksPath is protected, even with a GO token; Chan changes the git gate by his own hand.";
  }
  return null;
}
function codexExecutableGitPush(command) {
  return executableGitCalls(command).some((call) => call.subcommand === "push");
}

function tokenFor(repo) {
  if (!existsSync(TOKEN)) return false;
  let raw, token;
  try {
    raw = readFileSync(TOKEN, "utf8");
    token = JSON.parse(raw);
    if (!token || typeof token !== "object" || Array.isArray(token) ||
        !["issuedAt,repo", "claimedAt,issuedAt,repo"].includes(Object.keys(token).sort().join(",")) ||
        typeof token.repo !== "string" || typeof token.issuedAt !== "string" ||
        !Number.isFinite(Date.parse(token.issuedAt)) ||
        ("claimedAt" in token && (typeof token.claimedAt !== "string" || !Number.isFinite(Date.parse(token.claimedAt))))) throw new Error("not strict PUSH_GO JSON");
    const age = Date.now() - Date.parse(token.issuedAt);
    const tokenRepo = canonical(token.repo);
    if (age > MAX_AGE_MS || age < -60_000) {
      unlinkSync(TOKEN);
      fail("GO token is stale or clock-invalid; it was consumed. Ask Chan for a fresh GO.");
    }
    if (tokenRepo !== repo) {
      unlinkSync(TOKEN);
      fail("GO token names another repository; it was consumed. Ask Chan for a fresh GO.");
    }
    if (token.claimedAt) fail("GO token was already claimed for its one push attempt. Ask Chan for a fresh GO.");
    // Pre-push alone consumes it. The claim lets this one attempt cross both gates.
    writeFileSync(TOKEN, JSON.stringify({ repo: token.repo, issuedAt: token.issuedAt, claimedAt: new Date().toISOString() }));
    return true;
  } catch (err) {
    // Preserve a valid claim for the pre-push hook; consume invalid states at first sight.
    if (!token?.claimedAt) try { if (existsSync(TOKEN)) unlinkSync(TOKEN); } catch {}
    fail("invalid GO token was consumed (" + (err?.message ?? err) + "). Ask Chan for a fresh GO.");
  }
}

function repoFrom(payload, command, calls) {
  const cwd = payload?.cwd || payload?.tool_input?.cwd;
  if (typeof cwd !== "string" || !cwd) fail("Bash payload has no cwd; cannot bind a GO to a repository.");
  let base = cwd;
  const cd = command.match(/(?:^|[;&|\n])\s*(?:cd|chdir|sl|pushd|Set-Location|Push-Location)\s+(?:-Path\s+|-LiteralPath\s+)?['\"]?([^'\";|&\n]+)/i);
  if (cd) base = cd[1].trim();
  if (!isAbsolute(base)) base = resolve(cwd, base);
  // Git's -C and -c are different options. Only -C changes cwd, sequentially; -c is config.
  let gitDir;
  for (const [option, value] of calls.find((call) => call.subcommand === "push").options) {
    if (option === "-C") base = resolve(base, value);
    if (option === "--git-dir") gitDir = value;
  }
  if (gitDir !== undefined) base = resolve(base, gitDir);
  if (/([\\/])\.git$/i.test(base)) base = dirname(base);
  try { return canonical(base); }
  catch { fail("cannot canonicalize the repository for this guarded command."); }
}

// Conservative on purpose: a protected rewrite that cannot be parsed precisely is blocked.
// Existing aliases in Chan's own config are residual risk; this only forbids creating aliases.
function isRemoteRewrite(command) {
  // `-c` is a git *global option*, before its subcommand. It therefore never appeared in the
  // tail below, which begins after git's options; keep this check separate and pin it in the net.
  const optionKey = "(?:alias\\.|remote\\.|url\\..*(?:insteadOf|pushInsteadOf)|branch\\..*\\.remote|remote\\.pushDefault)";
  const gitOption = new RegExp(
    "(?:^|[;&|\\n(])\\s*(?:[\\w./\\\\:-]*[\\\\/])?git(?:\\.exe)?(?:\\s+(?:-C\\s+\\S+|--git-dir(?:=|\\s+)\\S+))*\\s+-c\\s+" + optionKey,
    "i",
  );
  if (gitOption.test(command)) return true;
  const git = /(?:^|[;&|\n(])\s*(?:[\w./\\:-]+\s+)*git(?:\.exe)?\s+(?:-C\s+\S+\s+|--git-dir(?:=|\s+)\S+\s+)*(.*)/gim;
  for (const m of command.matchAll(git)) {
    const tail = m[1] || "";
    if (/^remote\s+(?:set-url|add|remove|rename)\b/i.test(tail)) return true;
    if (/^config\b/i.test(tail) && (
      /(?:^|\s)(?:--(?:global|system|local|file(?:=|\s+\.git[\\/]config))\s+)*alias\./i.test(tail) ||
      /(?:remote\.|url\..*(?:insteadOf|pushInsteadOf)|branch\..*\.remote|remote\.pushDefault)/i.test(tail)
    )) return true;
  }
  if (/(?:>|>>|tee\s+|Set-Content\s+|Add-Content\s+|Out-File\s+|sed\s+-i\s+)['\"]?[^\n]*\.git[\\/]config\b/i.test(command)) return true;
  return false;
}

async function readPayload() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  try { return JSON.parse(raw || "{}"); } catch { fail("hook input was not JSON."); }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try {
    const payload = await readPayload();
    if (process.argv.includes("--session-start")) {
      if (existsSync(TOKEN)) {
        process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "[codex-guard] a PUSH_GO from an earlier session exists at session start. Do not use it: report it to Chan in one line; he removes it or says GO again for the push he wants now, and only then is a fresh token created." } }) + "\n");
        process.exit(0);
      }
      pass();
    }
    const toolName = payload?.tool_name;
    // The MCP route supplies this flag independently of stdin, so damaged metadata cannot
    // turn an already-routed connector event into the legacy non-string Bash passthrough.
    if (process.argv.includes("--connector") && (typeof toolName !== "string" || !toolName.includes("__") ||
        payload.hook_event_name !== "PreToolUse" || !payload.tool_input ||
        typeof payload.tool_input !== "object" || Array.isArray(payload.tool_input)))
      fail("Malformed connector event for " + String(toolName) + "; denied. Review templates/codex/connector-reads.json.");
    if (typeof toolName !== "string") pass();
    if (toolName === "mcp__playwright__browser_file_upload") {
      fail("Playwright file uploads are disabled. External interaction needs Chan's explicit review.");
    }
    if (toolName.includes("__") && !connectorException(toolName)) {
      const fixPath = "templates/codex/connector-reads.json";
      if (payload.hook_event_name !== "PreToolUse" || !payload.tool_input ||
          typeof payload.tool_input !== "object" || Array.isArray(payload.tool_input))
        fail("Malformed connector event for " + toolName + "; denied. Review " + fixPath + ".");
      try {
        if (!connectorAllowed(toolName))
          fail("Connector operation " + toolName + " is not an approved read; denied. Review " + fixPath + " and add capture provenance before enabling a new read.");
      } catch (error) {
        fail("Connector policy failed for " + toolName + ": " + error.message + "; denied. Review " + fixPath + ".");
      }
      pass();
    }
    if (toolName !== "Bash") pass();
    const command = payload?.tool_input?.command;
    if (typeof command !== "string") fail("Bash payload has no string tool_input.command; refusing an unread command.");
    if (/--no-verify/i.test(command)) fail("--no-verify skips a git gate; Codex never uses it, for commit or push, token or not. It is Chan's own escape from his own terminal.");
    const gitCalls = executableGitCalls(command);
    const gitBlock = gitCommandViolation(gitCalls);
    if (gitBlock) fail(gitBlock);
    const playwrightBlock = playwrightCliViolation(command);
    if (playwrightBlock) fail(playwrightBlock);
    if (isRemoteRewrite(command)) fail("a remote rewrite is never authorized, even with a GO token. Chan edits remotes by his own hand.");
    // Retain the shared gate as the first detector. Its deliberately fail-closed false positives
    // are released only when this caller cannot find an executable git position; the position
    // detector also catches quoted executable paths that the legacy matcher cannot tokenize.
    const sharedPush = isGitPush(command);
    const executablePush = gitCalls.some((call) => call.subcommand === "push");
    if (!sharedPush && !executablePush) pass();
    if (sharedPush && !executablePush) pass();
    const repo = repoFrom(payload, command, gitCalls);
    if (tokenFor(repo)) {
      pass();
    }
    fail("this guarded command requires Chan's explicit, one-shot GO for this repository.");
  } catch (err) {
    fail("internal error (" + (err?.message ?? err) + ") — failing closed.");
  }
}

export { isRemoteRewrite, codexExecutableGitPush };
