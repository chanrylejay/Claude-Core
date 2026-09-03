// codex-guard — Codex PreToolUse gate for guarded Bash-tool commands (Sep 1 2026).
// Scope: blocks guarded Bash-tool pushes live unless Chan's one-shot, repo-bound GO token is
// valid. The arming check detects template/install drift; it is not an OS security boundary.
// The trial clone's push URL remains DISABLED until Chan changes it by hand, which is the
// separate OS-level backstop.
// GO protocol (Chan's ruling, Sep 1 2026, parity with the DeepSeek CLI): Chan says GO in the chat;
// Codex then creates the token with `node ~/.codex/hooks/go.mjs <repo>` and pushes. Never without
// his GO in that same chat, never restored, never edited; one GO is one push attempt.
// A push carrying --no-verify is ALWAYS denied, token or not: Codex never skips the git gate, so
// `--no-verify` stays Chan's own escape from his own terminal. A remote rewrite is ALWAYS denied,
// token or not: a GO to push never authorizes changing where pushes go.
//
// The runner continues after a hook spawn/load failure. Wiring therefore turns launcher failures
// into a structured deny. The runner parses combined hook output strictly, so a deny or allow
// path must emit its JSON response and NOTHING else (including stderr).
// A non-string `tool_name` passes through unchanged: Codex only asks this launcher to inspect
// its Bash shape, and unknown host metadata must not be reinterpreted as a shell command.

import { existsSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isGitPush } from "../hooks/push-guard.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOKEN = join(HERE, "..", "PUSH_GO");
const MAX_AGE_MS = 30 * 60 * 1000;

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
// calls it first, then releases only reader-text false positives by requiring an executable git
// position here. The boundary also covers command substitution, shell wrappers, quoted git paths,
// leading parentheses, assignments, and command/time/sudo wrappers.
function codexExecutableGitPush(command) {
  const executable = /(?:^|[;&|\n(`])\s*(?:[('"]\s*)*(?:(?:[A-Za-z_]\w*=\S+|command|sudo|time|env(?:\s+[A-Za-z_]\w*=\S+)*)\s+)*(?:"[^"]*git(?:\.exe)?"|'[^']*git(?:\.exe)?'|(?:[\w.\/\\:-]*[\\/])?git(?:\.exe)?)\s+(?:(?:-C\s+\S+|--git-dir(?:=|\s+)\S+)\s+)*["']?push["']?(?=$|[^\w-])/i;
  if (executable.test(command)) return true;
  // The shared matcher recurses into these executing forms before stripping their quoted payload.
  const runners = /(?:^|[;&|\n(\x60])\s*(?:[\w.\/\\:-]*[\\/])?(?:bash|sh|zsh|dash|ksh|pwsh|powershell|cmd)(?:\.exe)?\s+(?:-c|-Command|-command|\/c|\/C)\s+(['"])([\s\S]*?)\1/gi;
  const evals = /(?:^|[;&|\n(\x60])\s*(?:eval|exec|source)\s+(['"])([\s\S]*?)\1/gi;
  const substitutions = [/\$\(([\s\S]*?)\)/g, /`([^`]*)`/g];
  for (const re of [runners, evals, ...substitutions]) for (const hit of command.matchAll(re)) {
    if (codexExecutableGitPush(hit[2] ?? hit[1])) return true;
  }
  return false;
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

function repoFrom(payload, command) {
  const cwd = payload?.cwd || payload?.tool_input?.cwd;
  if (typeof cwd !== "string" || !cwd) fail("Bash payload has no cwd; cannot bind a GO to a repository.");
  let base = cwd;
  const c = command.match(/(?:^|[;&|\n])\s*git\s+(?:-C\s+|--git-dir[=\s])([^\s;|&]+)/i) ||
    command.match(/(?:^|[;&|\n])\s*Set-Location\s+['\"]?([^'\";|&\n]+)/i);
  const cd = command.match(/(?:^|[;&|\n])\s*(?:cd|chdir|sl|pushd|Set-Location|Push-Location)\s+(?:-Path\s+|-LiteralPath\s+)?['\"]?([^'\";|&\n]+)/i);
  if (!c && cd) base = cd[1].trim();
  if (c) base = c[1].replace(/^['\"]|['\"]$/g, "");
  if (!isAbsolute(base)) base = resolve(cwd, base);
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
    if (typeof toolName !== "string") pass();
    if (toolName === "mcp__playwright__browser_file_upload") {
      fail("Playwright file uploads are disabled. External interaction needs Chan's explicit review.");
    }
    if (toolName !== "Bash") pass();
    const command = payload?.tool_input?.command;
    if (typeof command !== "string") fail("Bash payload has no string tool_input.command; refusing an unread command.");
    if (isRemoteRewrite(command)) fail("a remote rewrite is never authorized, even with a GO token. Chan edits remotes by his own hand.");
    // Retain the shared gate as the first detector. Its deliberately fail-closed false positives
    // are released only when this caller cannot find an executable git position; the position
    // detector also catches quoted executable paths that the legacy matcher cannot tokenize.
    const sharedPush = isGitPush(command);
    const executablePush = codexExecutableGitPush(command);
    if (!sharedPush && !executablePush) pass();
    if (sharedPush && !executablePush) pass();
    if (/--no-verify\b/i.test(command)) fail("--no-verify skips the git gate; Codex never uses it, token or not. It is Chan's own escape from his own terminal.");
    const repo = repoFrom(payload, command);
    if (tokenFor(repo)) {
      pass();
    }
    fail("this guarded command requires Chan's explicit, one-shot GO for this repository.");
  } catch (err) {
    fail("internal error (" + (err?.message ?? err) + ") — failing closed.");
  }
}

export { isRemoteRewrite, codexExecutableGitPush };
