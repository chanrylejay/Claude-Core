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
  timeout: 1500,
  maxBuffer: 1024 * 1024,
});
const connector = process.argv.includes("--connector");
if (result.error || result.status !== 0 || (connector && result.stderr.length)) {
  const failure = result.error?.code === "ETIMEDOUT" ? "timed out" : result.error
    ? "could not run (" + result.error.code + ")" : result.status !== 0
      ? "failed (exit " + result.status + ", signal " + (result.signal || "none") + ")" : "returned unexpected stderr";
  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: "PreToolUse", permissionDecision: "deny",
    permissionDecisionReason: "[codex-guard] BLOCKED: codex-guard.mjs " + failure,
  } }) + "\n");
} else if (!connector) {
  // Preserve Bash and the legacy direct SessionStart probe exactly as before batch 0c.
  process.stdout.write(result.stdout);
} else {
  let valid = false;
  try {
    const text = result.stdout.toString("utf8"), output = JSON.parse(text), h = output?.hookSpecificOutput;
    valid = text === "{}\n" || (h?.hookEventName === "PreToolUse" && h.permissionDecision === "deny" &&
      typeof h.permissionDecisionReason === "string" && h.permissionDecisionReason.trim().length > 0 &&
      h.permissionDecisionReason === h.permissionDecisionReason.trim() &&
      text === JSON.stringify({ hookSpecificOutput: {
        hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: h.permissionDecisionReason,
      } }) + "\n");
  } catch {}
  if (valid) process.stdout.write(result.stdout);
  else process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: "PreToolUse", permissionDecision: "deny",
    permissionDecisionReason: "[codex-guard] BLOCKED: codex-guard.mjs returned an invalid decision",
  } }) + "\n");
}
