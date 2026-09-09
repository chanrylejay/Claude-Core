// Outer MCP PreToolUse boundary: runner failures produce a structured deny.
// Bash runner failures retain their prior non-blocking direction with a diagnostic.
// Node itself and this entry point must start; hooks are not an OS security boundary.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const deny = (failure) => JSON.stringify({ hookSpecificOutput: {
  hookEventName: "PreToolUse", permissionDecision: "deny",
  permissionDecisionReason: "[codex-guard] BLOCKED: codex-guard-runner.mjs " + failure,
} }) + "\n";
const connector = process.argv.includes("--connector");

try {
  const raw = readFileSync(0);
  const mode = connector ? ["--connector"] : [];
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("./codex-guard-runner.mjs", import.meta.url)), ...mode], {
    input: raw, encoding: "buffer", windowsHide: true, timeout: 3500, maxBuffer: 1024 * 1024,
  });
  if (result.error) throw new Error(result.error.code === "ETIMEDOUT" ? "timed out" : "could not run (" + result.error.code + ")");
  if (result.status !== 0) throw new Error("failed (exit " + result.status + ", signal " + (result.signal || "none") + ")");
  if (result.stderr.length) throw new Error("returned unexpected stderr");
  // Bash retains the original runner's successful-output behavior, including legacy replies.
  // Its guard crash still denies in the runner; its runner failure was host-level fail-open.
  if (!connector) {
    process.stdout.write(result.stdout);
  } else {
    const text = result.stdout.toString("utf8");
    const output = JSON.parse(text);
    const h = output?.hookSpecificOutput;
    const allowed = text === "{}\n";
    const denied = h?.hookEventName === "PreToolUse" && h.permissionDecision === "deny" &&
      typeof h.permissionDecisionReason === "string" && h.permissionDecisionReason.trim().length > 0 &&
      h.permissionDecisionReason === h.permissionDecisionReason.trim() &&
      text === JSON.stringify({ hookSpecificOutput: {
        hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: h.permissionDecisionReason,
      } }) + "\n";
    if (!allowed && !denied) throw new Error("returned an invalid decision");
    process.stdout.write(result.stdout);
  }
} catch (error) {
  const reason = error instanceof SyntaxError ? "returned invalid JSON" : error.message;
  process.stdout.write(connector ? deny(reason) : JSON.stringify({ hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: "[codex-guard] codex-guard-runner.mjs " + reason + "; Bash runner failure remains non-blocking.",
  } }) + "\n");
}
