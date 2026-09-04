// Regression net for playwright-guard.mjs — plain node, no framework.
// Run: node _playwrightguard_test.mjs  (exit 0 = all pass, 1 = a failure)
// MANDATORY after ANY edit to playwright-guard.mjs. Stages the REAL hook under spawn and feeds the
// net-pinned fixtures plus inline command cases. Deny = exit 2 with a BLOCKED reason on stderr
// (the DeepSeek PreToolUse house style, matching push-guard). Pass = exit 0, silent.
import { pathToFileURL, fileURLToPath as fileURL } from "node:url";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname as dirName, join as joinPath } from "node:path";
import { tmpdir } from "node:os";

const TPL = dirName(fileURL(import.meta.url));
const GUARD = joinPath(TPL, "playwright-guard.mjs");
const { playwrightCliViolation, isPlaywrightCliExecutable } = await import(pathToFileURL(GUARD).href);

let pass = 0, fail = 0;
const ok = (label, cond) => { if (cond) pass++; else { fail++; console.error("FAIL: " + label); } };
const deny = (cmd) => spawnSync(process.execPath, [GUARD], {
  input: JSON.stringify({ tool_name: "Bash", tool_input: { command: cmd } }), encoding: "utf8", timeout: 10000,
});
const runPayload = (payload) => spawnSync(process.execPath, [GUARD], {
  input: JSON.stringify(payload), encoding: "utf8", timeout: 10000,
});
const runTool = (tool_name, tool_input) => spawnSync(process.execPath, [GUARD], {
  input: JSON.stringify({ tool_name, tool_input }), encoding: "utf8", timeout: 10000,
});
const isDenied = (r) => r.status === 2 && /\[playwright-guard\] BLOCKED:/.test(r.stderr || "") && !(r.stdout || "").trim();
const isPass = (r) => r.status === 0 && !(r.stderr || "").trim();

// Unit pins — the parser itself.
ok("unit: executable form is recognised", isPlaywrightCliExecutable("playwright-cli") && isPlaywrightCliExecutable("C:/x/playwright-cli.cmd"));
ok("unit: plain file path is NOT the executable", !isPlaywrightCliExecutable("playwright-cli-notes.txt"));
ok("unit: external open is a violation", playwrightCliViolation("playwright-cli -s=a open https://example.com/") !== null);
ok("unit: external goto is a violation", playwrightCliViolation("playwright-cli -s=a goto https://evil.test/x") !== null);
ok("unit: npx form external is a violation", playwrightCliViolation("npx @playwright/cli -s=a open http://10.0.0.5/") !== null);
ok("unit: upload is always a violation", playwrightCliViolation("playwright-cli -s=a upload C:/x/y.txt") !== null);
ok("unit: drop is always a violation", playwrightCliViolation("playwright-cli -s=a drop") !== null);
ok("unit: localhost open passes", playwrightCliViolation("playwright-cli -s=a open http://127.0.0.1:4173/") === null);
ok("unit: localhost-name open passes", playwrightCliViolation("playwright-cli -s=a open http://localhost:3000/") === null);
ok("unit: non-playwright command passes", playwrightCliViolation("git status") === null);
ok("unit: external open after echo is fail-closed (deny wall, not intent guessing)", playwrightCliViolation("echo reading playwright-cli open https://example.com/") !== null);

// Fixture pins — net-pinned captured payloads must deny with exit 2 + BLOCKED.
for (const name of ["pretooluse-bash-playwright-external-open.json", "pretooluse-bash-playwright-upload.json"]) {
  const payload = JSON.parse(readFileSync(joinPath(TPL, "fixtures", name), "utf8"));
  const r = runPayload(payload);
  ok("fixture " + name + " is denied (exit 2, BLOCKED on stderr)", isDenied(r));
}

// Live-shape spawn pins — the real hook, same input Claude Code would hand it.
ok("spawn: localhost open passes", isPass(deny("playwright-cli -s=a open http://127.0.0.1:4173/")));
ok("spawn: external open denies", isDenied(deny("playwright-cli -s=a open https://example.com/")));
ok("spawn: upload denies", isDenied(deny("playwright-cli -s=a upload C:/x/fixture.txt")));
ok("spawn: second command after a pass still guarded (chain)", isDenied(deny("echo hi; playwright-cli open https://example.com/")));

// Scope pins — only shell carriers are inspected; docs/code payloads never trip it.
ok("pass: Edit payload quoting playwright-cli text", isPass(runTool("Edit", { file_path: "x.md", old_string: "playwright-cli open https://example.com/", new_string: "y" })));
ok("pass: Write payload naming the guard", isPass(runTool("Write", { file_path: "x", content: "playwright-guard denies playwright-cli upload" })));
ok("pass: Read tool", isPass(runTool("Read", { file_path: "x" })));
ok("pass: MCP tool (neon read) carries no shell command", isPass(runPayload({ tool_name: "mcp__neon__run_sql", tool_input: { sql: "select 1" } })));
ok("pass: ctx_shell localhost open", isPass(runTool("mcp__lean-ctx__ctx_shell", { command: "playwright-cli -s=a open http://127.0.0.1:4173/" })));
ok("deny: ctx_shell external open", isDenied(runTool("mcp__lean-ctx__ctx_shell", { command: "playwright-cli -s=a open https://example.com/" })));

console.log("\nplaywright-guard: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
