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
const runPayload = (payload) => spawnSync(process.execPath, [GUARD], {
  input: JSON.stringify(payload), encoding: "utf8", timeout: 10000,
});
const captured = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", "pretooluse-bash.json"), "utf8"));
const mcpFixture = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", "pretooluse-mcp-file-upload.json"), "utf8"));
const neonWriteFixture = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", "pretooluse-mcp-neon-run-sql.json"), "utf8"));
const vercelWriteFixture = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", "pretooluse-mcp-vercel-deploy.json"), "utf8"));
const githubWriteFixture = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", "pretooluse-mcp-github-create-pr.json"), "utf8"));
const playwrightExternalFixture = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", "pretooluse-bash-playwright-external-open.json"), "utf8"));
const playwrightUploadFixture = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", "pretooluse-bash-playwright-upload.json"), "utf8"));
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
for (const command of [
  'rg "git push" README.md',
  'Select-String -Pattern "git push" README.md',
  'echo "git push"',
]) {
  r = run(command);
  passJson = null; try { passJson = JSON.parse(r.stdout); } catch {}
  ok("quoted read-only text passes: " + command, r.status === 0 && passJson && !(r.stderr || "").trim());
}
for (const command of [
  'git push --dry-run origin HEAD',
  '"C:/Program Files/Git/bin/git.exe" push origin main',
  'FOO=bar git push origin main',
  'command git push --dry-run origin HEAD',
  'sudo git push --dry-run origin HEAD',
  'time git push --dry-run origin HEAD',
  'time sudo command git push --dry-run origin HEAD',
  'echo $(git push --dry-run origin HEAD)',
]) {
  r = run(command);
  ok("real executable form remains blocked: " + command, denied(r));
}
r = spawnSync(process.execPath, [GUARD], { input: JSON.stringify(captured), encoding: "utf8", timeout: 10000 });
passJson = null; try { passJson = JSON.parse(r.stdout); } catch {}
ok("captured Codex Bash payload reaches the launcher unchanged enough to pass", r.status === 0 && passJson && !(r.stderr || "").trim());
r = runPayload(mcpFixture);
ok("Playwright upload fixture is denied with exact structured JSON", denied(r));
r = runPayload(playwrightExternalFixture);
ok("Playwright CLI external open fixture is denied with exact structured JSON", denied(r));
r = runPayload(playwrightUploadFixture);
ok("Playwright CLI upload fixture is denied with exact structured JSON", denied(r));
const playwrightLocal = run("playwright-cli -s=guard-proof open http://127.0.0.1:4173");
passJson = null; try { passJson = JSON.parse(playwrightLocal.stdout); } catch {}
ok("Playwright CLI localhost open passes the containment", playwrightLocal.status === 0 && passJson && !(playwrightLocal.stderr || "").trim());
for (const [service, fixture] of [["Neon", neonWriteFixture], ["Vercel", vercelWriteFixture], ["GitHub", githubWriteFixture]]) {
  r = runPayload(fixture);
  ok(service + " captured write fixture is denied with exact structured JSON", denied(r));
}
r = runPayload({ tool_name: "mcp__playwright__browser_fill_form", tool_input: {} });
passJson = null; try { passJson = JSON.parse(r.stdout); } catch {}
ok("Playwright form entry passes under the localhost-only containment", r.status === 0 && passJson && !(r.stderr || "").trim());
r = runPayload({ tool_name: "mcp__playwright__browser_type", tool_input: {} });
passJson = null; try { passJson = JSON.parse(r.stdout); } catch {}
ok("Playwright typing passes under the localhost-only containment", r.status === 0 && passJson && !(r.stderr || "").trim());
r = runPayload({ tool_name: "mcp__playwright__browser_snapshot", tool_input: {} });
passJson = null; try { passJson = JSON.parse(r.stdout); } catch {}
ok("unrecognized MCP tool shapes pass unchanged", r.status === 0 && passJson && !(r.stderr || "").trim());

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
ok("SessionStart reports an earlier-session token in JSON", start.status === 0 && /PUSH_GO from an earlier session/.test(startJson?.hookSpecificOutput?.additionalContext || ""));

const wiring = JSON.parse(fs.readFileSync(path.join(TPL, "hooks.json"), "utf8"));
const pre = wiring.hooks?.PreToolUse?.[0]?.hooks?.[0]?.command || "";
ok("wiring names the required installed parser", /push-guard\.mjs/.test(wiring.description || ""));
ok("PreToolUse wiring uses the stdin-preserving Node runner", /node/.test(pre) && /codex-guard-runner\.mjs/.test(pre) && !/powershell/i.test(pre));

// Hostile-review pins (Sep 1 2026): a GO never authorizes a remote rewrite; --no-verify is never
// Codex's; the cd family binds the repo like Set-Location; go.mjs writes exactly the strict token.
if (fs.existsSync(TOKEN)) fs.unlinkSync(TOKEN);
go();
r = run("git remote set-url --push origin https://x");
ok("remote rewrite is denied even with a valid token, and the token is untouched", denied(r) && fs.existsSync(TOKEN) && !claimed());
r = run("git push --no-verify origin HEAD");
ok("--no-verify is denied even with a valid token, and the token is untouched", denied(r) && fs.existsSync(TOKEN) && !claimed());
fs.unlinkSync(TOKEN);
go(OTHER);
r = run(`cd ${OTHER}; git push --dry-run origin HEAD`);
ok("cd binds the repo: OTHER's token is claimed for a push entered with cd", r.status === 0 && claimed());
fs.unlinkSync(TOKEN);
go(REPO);
r = run(`pushd ${OTHER}; git push --dry-run origin HEAD`);
ok("pushd binds the repo: REPO's token does not authorize a push entered into OTHER", denied(r) && absent());
const GO = path.join(HOOKS, "go.mjs");
fs.copyFileSync(path.join(TPL, "go.mjs"), GO);
const goEnv = { ...process.env, USERPROFILE: HOME, HOME };
let g = spawnSync(process.execPath, [GO, REPO], { encoding: "utf8", env: goEnv });
let tok = null; try { tok = JSON.parse(fs.readFileSync(TOKEN, "utf8")); } catch {}
ok("go.mjs writes the strict two-key token for the canonical repo", g.status === 0 && tok && Object.keys(tok).sort().join(",") === "issuedAt,repo" && !claimed());
g = spawnSync(process.execPath, [GO, REPO], { encoding: "utf8", env: goEnv });
ok("go.mjs refuses to overwrite an existing token", g.status === 2);
r = run("git push --dry-run origin HEAD");
ok("a go.mjs token is claimed by the launcher like any other", r.status === 0 && claimed());
g = spawnSync(process.execPath, [GO, REPO], { encoding: "utf8", env: goEnv });
tok = null; try { tok = JSON.parse(fs.readFileSync(TOKEN, "utf8")); } catch {}
ok("a fresh GO replaces a claimed attempt with a strict unclaimed token", g.status === 0 && tok && Object.keys(tok).sort().join(",") === "issuedAt,repo" && !claimed());
fs.unlinkSync(TOKEN);
g = spawnSync(process.execPath, [GO, path.join(HOME, "nowhere")], { encoding: "utf8", env: goEnv });
ok("go.mjs refuses a path that is not a repository", g.status === 2 && absent());

fs.rmSync(HOME, { recursive: true, force: true });
console.log(`\ncodex-guard: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
