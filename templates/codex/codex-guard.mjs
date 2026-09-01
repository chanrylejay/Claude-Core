// codex-guard — Codex PreToolUse gate for guarded Bash-tool commands (Sep 1 2026).
// Scope: blocks guarded Bash-tool pushes live unless Chan's one-shot, repo-bound GO token is
// valid. The arming check detects template/install drift; it is not an OS security boundary.
// The trial clone's push URL remains DISABLED until Chan changes it by hand, which is the
// separate OS-level backstop. Codex never creates, restores, or edits PUSH_GO.
//
// The runner continues after a hook spawn/load failure. Wiring therefore turns launcher failures
// into a structured deny. Blocks use the runner's explicit JSON deny channel at exit 0; stderr is
// retained as a diagnostic, never as the channel that makes a denial stick.

import { existsSync, readFileSync, realpathSync, statSync, unlinkSync } from "node:fs";
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
  console.error(reason);
  process.exit(0);
};
const pass = () => { process.stdout.write("{}\n"); process.exit(0); };
const canonical = (p) => realpathSync.native ? realpathSync.native(p) : realpathSync(p);

function tokenFor(repo) {
  if (!existsSync(TOKEN)) return false;
  let raw, token;
  try {
    raw = readFileSync(TOKEN, "utf8");
    token = JSON.parse(raw);
    if (!token || typeof token !== "object" || Array.isArray(token) ||
        Object.keys(token).sort().join(",") !== "issuedAt,repo" ||
        typeof token.repo !== "string" || typeof token.issuedAt !== "string" ||
        !Number.isFinite(Date.parse(token.issuedAt))) throw new Error("not strict PUSH_GO JSON");
    const age = Date.now() - statSync(TOKEN).mtimeMs;
    const tokenRepo = canonical(token.repo);
    unlinkSync(TOKEN); // consume before execution, including mismatches and stale tokens
    if (age > MAX_AGE_MS || age < -60_000) fail("GO token is stale or clock-invalid; it was consumed. Ask Chan for a fresh GO.");
    if (tokenRepo !== repo) fail("GO token names another repository; it was consumed. Ask Chan for a fresh GO.");
    return true;
  } catch (err) {
    try { if (existsSync(TOKEN)) unlinkSync(TOKEN); } catch {}
    fail("invalid GO token was consumed (" + (err?.message ?? err) + "). Ask Chan for a fresh GO.");
  }
}

function repoFrom(payload, command) {
  const cwd = payload?.cwd || payload?.tool_input?.cwd;
  if (typeof cwd !== "string" || !cwd) fail("Bash payload has no cwd; cannot bind a GO to a repository.");
  let base = cwd;
  const c = command.match(/(?:^|[;&|\n])\s*git\s+(?:-C\s+|--git-dir[=\s])([^\s;|&]+)/i) ||
    command.match(/(?:^|[;&|\n])\s*Set-Location\s+['\"]?([^'\";|&\n]+)/i);
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
        process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "[codex-guard] stale PUSH_GO exists at session start. Codex must never use, create, or restore it; Chan should remove it or issue a fresh GO only for the immediate approved push." } }) + "\n");
        process.exit(0);
      }
      pass();
    }
    const command = payload?.tool_input?.command;
    if (typeof command !== "string") fail("Bash payload has no string tool_input.command; refusing an unread command.");
    const protectedCommand = isGitPush(command) || isRemoteRewrite(command);
    if (!protectedCommand) pass();
    const repo = repoFrom(payload, command);
    if (tokenFor(repo)) {
      console.error("[codex-guard] GO token consumed — guarded command allowed once.");
      pass();
    }
    fail("this guarded command requires Chan's explicit, one-shot GO for this repository.");
  } catch (err) {
    fail("internal error (" + (err?.message ?? err) + ") — failing closed.");
  }
}

export { isRemoteRewrite };
