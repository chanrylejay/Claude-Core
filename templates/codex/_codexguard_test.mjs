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
fs.copyFileSync(path.join(ROOT, "templates", "hooks", "push-guard.mjs"), path.join(HOOKS, "push-guard.mjs"));
const GUARD = path.join(HOOKS, "codex-guard.mjs");
const TOKEN = path.join(HOME, ".codex", "PUSH_GO");
const REPO = path.join(HOME, "repo");
const OTHER = path.join(HOME, "other");
for (const p of [REPO, OTHER]) fs.mkdirSync(path.join(p, ".git"), { recursive: true });

let pass = 0, fail = 0;
const ok = (label, condition) => { if (condition) pass++; else { fail++; console.error("FAIL: " + label); } };
const run = (command, cwd = REPO) => spawnSync(process.execPath, [GUARD], {
  input: JSON.stringify({ cwd, tool_name: "Bash", tool_input: { command } }), encoding: "utf8", timeout: 10000,
});
const go = (repo = REPO, extra = {}) => fs.writeFileSync(TOKEN, JSON.stringify({ repo, issuedAt: new Date().toISOString(), ...extra }));
const absent = () => !fs.existsSync(TOKEN);
const denyJson = (r) => {
  try { return JSON.parse(r.stdout).hookSpecificOutput; } catch { return null; }
};
const denied = (r) => r.status === 0 && denyJson(r)?.permissionDecision === "deny" &&
  /BLOCKED/i.test(denyJson(r)?.permissionDecisionReason || "") && /BLOCKED/i.test(r.stderr || "");

for (const [name, command] of [
  ["plain", "git push --dry-run origin HEAD"],
  ["-C", `git -C ${REPO} push --dry-run origin HEAD`],
  ["--git-dir", `git --git-dir=${path.join(REPO, ".git")} push --dry-run origin HEAD`],
  ["PowerShell chain", `Set-Location ${REPO}; git push --dry-run origin HEAD`],
  ["remote set-url", "git remote set-url --push origin DISABLED"],
]) {
  const r = run(command);
  ok("tokenless " + name + " denies through JSON and retains a stderr reason", denied(r));
}

go();
let r = run("git push --dry-run origin HEAD");
ok("matching token allows the first push", r.status === 0 && absent());
r = run("git push --dry-run origin HEAD");
ok("the second push is denied through JSON", denied(r));

go(OTHER);
r = run("git push --dry-run origin HEAD");
ok("another repo's token denies and is consumed", denied(r) && absent());

go();
const old = new Date(Date.now() - 31 * 60 * 1000);
fs.utimesSync(TOKEN, old, old);
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

for (const command of [
  "git config alias.ship push",
  "git -c alias.ship=push status",
  "git config remote.origin.pushurl https://example.invalid/x",
  "git config url.x.pushInsteadOf git@github.com:",
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
ok("PreToolUse wiring turns launcher failures into a structured JSON deny", /powershell -NoProfile/.test(pre) && /\$deny\s*=/.test(pre) && /permissionDecision/.test(pre) && /launcher failed to start or crashed/.test(pre) && /exit 0/.test(pre));
const broken = path.join(HOOKS, "missing-launcher.mjs");
const wrapped = `$deny = '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"[codex-guard] BLOCKED: launcher failed to start or crashed; blocking"}}'; & node '${broken}'; if ($LASTEXITCODE -ne 0) { [Console]::Out.WriteLine($deny); [Console]::Error.WriteLine('[codex-guard] launcher failed to start or crashed; blocking') }; exit 0`;
const wrapper = spawnSync("powershell", ["-NoProfile", "-Command", wrapped], { encoding: "utf8", timeout: 10000 });
ok("PowerShell wrapper turns a missing launcher into JSON deny plus stderr evidence", wrapper.status === 0 && denyJson(wrapper)?.permissionDecision === "deny" && /launcher failed to start or crashed/.test(denyJson(wrapper)?.permissionDecisionReason || "") && /launcher failed to start or crashed/.test(wrapper.stderr || ""));

fs.rmSync(HOME, { recursive: true, force: true });
console.log(`\ncodex-guard: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
