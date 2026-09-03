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

// Exact names only: this is a deny wall, not intent guessing. Context7 is documentation-only
// and shadcn writes only the local project, so neither belongs here.
const MCP_WRITE_TOOLS = new Set([
  "mcp__codex_apps__neon_add_auth_oauth_provider", "mcp__codex_apps__neon_add_auth_trusted_domain",
  "mcp__codex_apps__neon_complete_database_migration", "mcp__codex_apps__neon_complete_query_tuning",
  "mcp__codex_apps__neon_create_auth_user", "mcp__codex_apps__neon_create_branch",
  "mcp__codex_apps__neon_create_postgres_database", "mcp__codex_apps__neon_create_postgres_endpoint",
  "mcp__codex_apps__neon_create_postgres_role", "mcp__codex_apps__neon_create_project",
  "mcp__codex_apps__neon_create_snapshot", "mcp__codex_apps__neon_create_storage_bucket",
  "mcp__codex_apps__neon_delete_auth_oauth_provider", "mcp__codex_apps__neon_delete_auth_trusted_domain",
  "mcp__codex_apps__neon_delete_auth_user", "mcp__codex_apps__neon_delete_branch",
  "mcp__codex_apps__neon_delete_data_api", "mcp__codex_apps__neon_delete_function",
  "mcp__codex_apps__neon_delete_postgres_database", "mcp__codex_apps__neon_delete_postgres_endpoint",
  "mcp__codex_apps__neon_delete_postgres_role", "mcp__codex_apps__neon_delete_project",
  "mcp__codex_apps__neon_delete_snapshot", "mcp__codex_apps__neon_delete_storage_bucket",
  "mcp__codex_apps__neon_delete_storage_object", "mcp__codex_apps__neon_delete_storage_objects_by_prefix",
  "mcp__codex_apps__neon_deploy_function", "mcp__codex_apps__neon_disable_auth",
  "mcp__codex_apps__neon_finalize_branch_restore", "mcp__codex_apps__neon_prepare_database_migration",
  "mcp__codex_apps__neon_prepare_query_tuning", "mcp__codex_apps__neon_provision_neon_auth",
  "mcp__codex_apps__neon_provision_neon_data_api", "mcp__codex_apps__neon_reset_from_parent",
  "mcp__codex_apps__neon_reset_postgres_role_password", "mcp__codex_apps__neon_restart_postgres_endpoint",
  "mcp__codex_apps__neon_restore_snapshot", "mcp__codex_apps__neon_run_sql",
  "mcp__codex_apps__neon_run_sql_transaction", "mcp__codex_apps__neon_set_default_branch",
  "mcp__codex_apps__neon_set_snapshot_schedule", "mcp__codex_apps__neon_start_postgres_endpoint",
  "mcp__codex_apps__neon_suspend_postgres_endpoint", "mcp__codex_apps__neon_update_auth_config",
  "mcp__codex_apps__neon_update_auth_oauth_provider", "mcp__codex_apps__neon_update_auth_user_role",
  "mcp__codex_apps__neon_update_branch", "mcp__codex_apps__neon_update_data_api",
  "mcp__codex_apps__neon_update_function", "mcp__codex_apps__neon_update_postgres_database",
  "mcp__codex_apps__neon_update_postgres_endpoint", "mcp__codex_apps__neon_update_project",
  "mcp__codex_apps__neon_update_snapshot",
  "mcp__codex_apps__vercel_add_toolbar_reaction", "mcp__codex_apps__vercel_change_toolbar_thread_resolve_status",
  "mcp__codex_apps__vercel_deploy_to_vercel", "mcp__codex_apps__vercel_edit_toolbar_message",
  "mcp__codex_apps__vercel_import_claude_design_from_url", "mcp__codex_apps__vercel_reply_to_toolbar_thread",
  "mcp__codex_apps__github_add_comment_to_issue", "mcp__codex_apps__github_add_issue_assignees",
  "mcp__codex_apps__github_add_issue_labels", "mcp__codex_apps__github_add_reaction_to_issue_comment",
  "mcp__codex_apps__github_add_reaction_to_pr", "mcp__codex_apps__github_add_reaction_to_pr_review_comment",
  "mcp__codex_apps__github_add_review_to_pr", "mcp__codex_apps__github_convert_pull_request_to_draft",
  "mcp__codex_apps__github_create_blob", "mcp__codex_apps__github_create_branch",
  "mcp__codex_apps__github_create_commit", "mcp__codex_apps__github_create_file",
  "mcp__codex_apps__github_create_issue", "mcp__codex_apps__github_create_pull_request",
  "mcp__codex_apps__github_create_tree", "mcp__codex_apps__github_delete_file",
  "mcp__codex_apps__github_dismiss_pull_request_review", "mcp__codex_apps__github_enable_auto_merge",
  "mcp__codex_apps__github_label_pr", "mcp__codex_apps__github_lock_issue_conversation",
  "mcp__codex_apps__github_mark_pull_request_ready_for_review", "mcp__codex_apps__github_merge_pull_request",
  "mcp__codex_apps__github_remove_issue_assignees", "mcp__codex_apps__github_remove_issue_label",
  "mcp__codex_apps__github_remove_pull_request_reviewers", "mcp__codex_apps__github_remove_reaction_from_issue_comment",
  "mcp__codex_apps__github_remove_reaction_from_pr", "mcp__codex_apps__github_remove_reaction_from_pr_review_comment",
  "mcp__codex_apps__github_reply_to_review_comment", "mcp__codex_apps__github_request_pull_request_reviewers",
  "mcp__codex_apps__github_rerun_failed_workflow_run_jobs", "mcp__codex_apps__github_rerun_workflow_job",
  "mcp__codex_apps__github_resolve_review_thread", "mcp__codex_apps__github_unlock_issue_conversation",
  "mcp__codex_apps__github_unresolve_review_thread", "mcp__codex_apps__github_update_file",
  "mcp__codex_apps__github_update_issue", "mcp__codex_apps__github_update_issue_comment",
  "mcp__codex_apps__github_update_pull_request", "mcp__codex_apps__github_update_ref",
  "mcp__codex_apps__github_update_review_comment",
]);

// Connector hooks expose the live service and action as separate segments (for example
// mcp__codex_apps__neon__create_branch). Match those service/action prefixes rather than one
// brittle full name; read tools do not carry any of these action prefixes.
const MCP_WRITE_PREFIXES = [
  /^mcp__codex_apps__neon__(?:add|complete|create|delete|deploy|disable|finalize|prepare|provision|reset|restart|restore|run_sql|set|start|suspend|update)_/,
  /^mcp__codex_apps__vercel__(?:add|change|deploy|edit|import|reply)_/,
  /^mcp__codex_apps__github__(?:add|convert|create|delete|dismiss|enable|label|lock|mark|merge|remove|rerun|reply|request|resolve|unlock|unresolve|update)_/,
];

const isMcpWrite = (toolName) => MCP_WRITE_TOOLS.has(toolName) || MCP_WRITE_PREFIXES.some((prefix) => prefix.test(toolName));

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
    if (isMcpWrite(toolName)) {
      fail("This MCP write or publish tool is disabled: " + toolName + ". Chan's external-action gate applies.");
    }
    if (toolName !== "Bash") pass();
    const command = payload?.tool_input?.command;
    if (typeof command !== "string") fail("Bash payload has no string tool_input.command; refusing an unread command.");
    const playwrightBlock = playwrightCliViolation(command);
    if (playwrightBlock) fail(playwrightBlock);
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
