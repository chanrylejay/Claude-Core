// Keeps the hook protocol in Node: PowerShell consumed the hook stdin and made valid replies fail.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const raw = Buffer.concat(chunks);
const guard = fileURLToPath(new URL("./codex-guard.mjs", import.meta.url));
const result = spawnSync(process.execPath, [guard, ...process.argv.slice(2)], {
  input: raw,
  encoding: "buffer",
  windowsHide: true,
});
if (result.error || result.status !== 0) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: "PreToolUse", permissionDecision: "deny",
    permissionDecisionReason: "[codex-guard] BLOCKED: launcher failed to start or crashed; blocking",
  } }) + "\n");
} else {
  process.stdout.write(result.stdout);
}
