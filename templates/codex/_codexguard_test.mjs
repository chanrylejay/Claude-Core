// Regression net for the Codex guarded-Bash launcher. It stages the real launcher and parser
// under a throwaway ~/.codex, so no live GO token or hook is read or changed.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TPL = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(TPL, "..", "..");
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), "codexguard-"));
const HOOKS = path.join(HOME, ".codex", "hooks");
fs.mkdirSync(HOOKS, { recursive: true });
fs.copyFileSync(path.join(TPL, "codex-guard.mjs"), path.join(HOOKS, "codex-guard.mjs"));
fs.copyFileSync(path.join(TPL, "codex-guard-runner.mjs"), path.join(HOOKS, "codex-guard-runner.mjs"));
fs.copyFileSync(path.join(ROOT, "templates", "hooks", "push-guard.mjs"), path.join(HOOKS, "push-guard.mjs"));
const GUARD = path.join(HOOKS, "codex-guard-runner.mjs");
const TOKEN = path.join(HOME, ".codex", "PUSH_GO");
const REPO = path.join(HOME, "repo");
const OTHER = path.join(HOME, "other");
for (const p of [REPO, OTHER]) fs.mkdirSync(path.join(p, ".git"), { recursive: true });

let pass = 0, fail = 0;
const ok = (label, condition) => { if (condition) pass++; else { fail++; console.error("FAIL: " + label); } };
const run = (command, cwd = REPO) => spawnSync(process.execPath, [GUARD], {
  input: JSON.stringify({ cwd, tool_name: "Bash", tool_input: { command } }), encoding: "utf8", timeout: 10000,
});
const captured = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", "pretooluse-bash.json"), "utf8"));
const go = (repo = REPO, extra = {}) => fs.writeFileSync(TOKEN, JSON.stringify({ repo, issuedAt: new Date().toISOString(), ...extra }));
const absent = () => !fs.existsSync(TOKEN);
const claimed = () => { try { return typeof JSON.parse(fs.readFileSync(TOKEN, "utf8")).claimedAt === "string"; } catch { return false; } };
const denyJson = (r) => {
  try { return JSON.parse(r.stdout).hookSpecificOutput; } catch { return null; }
};
const strictDeny = (reason) => JSON.stringify({ hookSpecificOutput: {
  hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason,
} }) + "\n";
const denied = (r) => r.status === 0 && r.stdout === strictDeny(denyJson(r)?.permissionDecisionReason) &&
  denyJson(r)?.permissionDecision === "deny" && /\S/.test(denyJson(r)?.permissionDecisionReason || "") && !(r.stderr || "").trim();

for (const [name, command] of [
  ["plain", "git push --dry-run origin HEAD"],
  ["-C", `git -C ${REPO} push --dry-run origin HEAD`],
  ["--git-dir", `git --git-dir=${path.join(REPO, ".git")} push --dry-run origin HEAD`],
  ["PowerShell chain", `Set-Location ${REPO}; git push --dry-run origin HEAD`],
  ["remote set-url", "git remote set-url --push origin DISABLED"],
]) {
  const r = run(command);
  ok("tokenless " + name + " emits only the exact structured JSON deny", denied(r));
}

go();
let r = run("git push --dry-run origin HEAD");
ok("matching token lets the launcher claim, not consume", r.status === 0 && claimed());
r = run("git push --dry-run origin HEAD");
ok("the second launcher call is denied while the token remains claimed", denied(r) && claimed());
fs.unlinkSync(TOKEN);

go(OTHER);
r = run("git push --dry-run origin HEAD");
ok("another repo's token denies and is consumed", denied(r) && absent());

go();
fs.writeFileSync(TOKEN, JSON.stringify({ repo: REPO, issuedAt: new Date(Date.now() - 31 * 60 * 1000).toISOString() }));
r = run("git push --dry-run origin HEAD");
ok("expired token denies and is consumed", denied(r) && absent());

go(REPO, { unwanted: true });
r = run("git push --dry-run origin HEAD");
ok("malformed strict JSON denies and is consumed", denied(r) && absent());

r = run("git status");
let passJson = null; try { passJson = JSON.parse(r.stdout); } catch {}
ok("git status passes with valid JSON and no stderr", r.status === 0 && passJson && !(r.stderr || "").trim());
r = run("npm run build");
passJson = null; try { passJson = JSON.parse(r.stdout); } catch {}
ok("npm run build passes with valid JSON and no stderr", r.status === 0 && passJson && !(r.stderr || "").trim());
r = spawnSync(process.execPath, [GUARD], { input: JSON.stringify(captured), encoding: "utf8", timeout: 10000 });
passJson = null; try { passJson = JSON.parse(r.stdout); } catch {}
ok("captured Codex Bash payload reaches the launcher unchanged enough to pass", r.status === 0 && passJson && !(r.stderr || "").trim());

for (const command of [
  "git config alias.ship push",
  "git -c alias.ship=push status",
  "git config remote.origin.pushurl https://example.invalid/x",
  "git config url.x.pushInsteadOf ssh://example.invalid/",
  "echo x > .git/config",
]) {
  r = run(command);
  ok("protected rewrite denies through JSON: " + command, denied(r));
}

go();
const start = spawnSync(process.execPath, [GUARD, "--session-start"], { input: "{}", encoding: "utf8", timeout: 10000 });
let startJson = null; try { startJson = JSON.parse(start.stdout); } catch {}
ok("SessionStart reports an existing token as stale in JSON", start.status === 0 && /stale PUSH_GO/.test(startJson?.hookSpecificOutput?.additionalContext || ""));

const wiring = JSON.parse(fs.readFileSync(path.join(TPL, "hooks.json"), "utf8"));
const pre = wiring.hooks?.PreToolUse?.[0]?.hooks?.[0]?.command || "";
ok("wiring names the required installed parser", /push-guard\.mjs/.test(wiring.description || ""));
ok("PreToolUse wiring uses the stdin-preserving Node runner", /node/.test(pre) && /codex-guard-runner\.mjs/.test(pre) && !/powershell/i.test(pre));

fs.rmSync(HOME, { recursive: true, force: true });
console.log(`\ncodex-guard: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
