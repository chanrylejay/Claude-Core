// artifact-gauntlet — project-scoped Codex completion wall (Sep 2 2026).
// Install this byte-identically at <project>/.codex/hooks/artifact-gauntlet.mjs and wire the
// three commands in project-hooks.json. It never accepts a bare DONE token: a HEAVY task can
// stop only when its configured evidence files exist, have been refreshed after the last edit,
// and carry a minimal shape appropriate to their class. Default policy: code needs a passing
// test log; UI needs that log plus a real PNG screenshot; docs need a substantive review note.
// `apply_patch` is Codex's native patch tool name; PostToolUse watches that exact name.
// Stop failures fail open after MAX_NAG blocks, recorded visibly in .codex/.artifact-gauntlet-nag,
// so a broken wall cannot imprison a session. The ledger is retained on fail-open for disclosure.

import fs from "node:fs";
import path from "node:path";

const MAX_NAG = 3;
const ROOT = process.cwd();
const DOT = path.join(ROOT, ".codex");
const CONFIG = path.join(DOT, "artifact-gauntlet.json");
const STATE = path.join(DOT, ".artifact-gauntlet-state.json");
const NAG = path.join(DOT, ".artifact-gauntlet-nag");
const emit = (event, extra = {}) => process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, ...extra } }) + "\n");
const pass = (event, context = "") => emit(event, context ? { additionalContext: context } : {});
const block = (event, reason) => emit(event, { permissionDecision: "deny", permissionDecisionReason: "[artifact-gauntlet] BLOCKED: " + reason });
const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } };
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n"); };
const readState = () => readJson(STATE, null);
const config = () => readJson(CONFIG, null);
const fresh = (file, since) => { try { return fs.statSync(file).mtimeMs >= since; } catch { return false; } };
const isPng = (file) => { try { return fs.readFileSync(file).subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])); } catch { return false; } };
const extClass = (files) => files.some((f) => /\.(tsx|jsx|css|scss|html|vue|svelte)$/i.test(f)) ? "ui" : files.some((f) => /\.(md|mdx|txt)$/i.test(f)) ? "docs" : "code";
const pathsFromPatch = (patch) => [...String(patch || "").matchAll(/^(?:\+\+\+ b\/|\*\*\* (?:Update|Add) File: )(.+)$/gm)].map((m) => m[1].trim()).filter((p) => p && p !== "/dev/null");

function policy(c, kind) {
  if (Array.isArray(c?.artifacts?.[kind])) return c.artifacts[kind];
  if (kind === "ui") return [
    { path: ".codex/evidence/test.log", kind: "test-log" },
    { path: ".codex/evidence/ui.png", kind: "png" },
  ];
  if (kind === "docs") return [{ path: ".codex/evidence/review.md", kind: "review" }];
  return [{ path: ".codex/evidence/test.log", kind: "test-log" }];
}
function validate(item, since) {
  const file = path.resolve(ROOT, item.path);
  if (!fresh(file, since)) return `${item.path} is missing or older than the last tracked edit`;
  const text = fs.readFileSync(file, "utf8");
  if (item.kind === "test-log" && !(/\b(pass|passed|success|green)\b/i.test(text) && /\b(exit|status)\s*[:=]\s*0\b/i.test(text))) return `${item.path} is not a passing test log (needs result and exit/status 0)`;
  if (item.kind === "png" && !isPng(file)) return `${item.path} is not a PNG screenshot`;
  if (item.kind === "review" && text.trim().length < 100) return `${item.path} is too short to be a review artifact`;
  return "";
}
function track(payload) {
  const tool = payload?.tool_name;
  if (tool !== "apply_patch") return pass("PostToolUse");
  const c = config();
  if (!c?.enabled) return pass("PostToolUse");
  const paths = pathsFromPatch(payload?.tool_input?.patch ?? payload?.tool_input?.input ?? "");
  const old = readState();
  const files = [...new Set([...(old?.files || []), ...(paths.length ? paths : ["[apply_patch payload path unreadable]"])])];
  const taskClass = c.taskClass || extClass(files);
  writeJson(STATE, { taskClass, files, changedAt: Date.now() });
  try { fs.unlinkSync(NAG); } catch {}
  pass("PostToolUse", `[artifact-gauntlet] tracked ${files.at(-1)} as ${taskClass}. Evidence is due before this HEAVY turn ends.`);
}
function nudge() {
  const c = config();
  const text = "[artifact-gauntlet] For HEAVY work, set .codex/artifact-gauntlet.json before editing: taskClass code, ui, or docs. The done wall will require fresh evidence, never a token.";
  pass("UserPromptSubmit", c?.enabled ? text : text + " This project has not enabled the wall yet.");
}
function wall() {
  const c = config(), state = readState();
  if (!c?.enabled || !state) return pass("Stop");
  const misses = policy(c, state.taskClass).map((x) => validate(x, state.changedAt)).filter(Boolean);
  if (!misses.length) {
    try { fs.unlinkSync(STATE); fs.unlinkSync(NAG); } catch {}
    return pass("Stop", `[artifact-gauntlet] PASS: fresh ${state.taskClass} evidence verified for ${state.files.length} tracked path(s).`);
  }
  const count = Number(fs.existsSync(NAG) ? fs.readFileSync(NAG, "utf8") : 0) + 1;
  fs.mkdirSync(DOT, { recursive: true }); fs.writeFileSync(NAG, String(count));
  if (count > MAX_NAG) return pass("Stop", `[artifact-gauntlet] FAIL-OPEN after ${MAX_NAG} blocks; evidence still missing: ${misses.join("; ")}. Fix the wall or report this debt before calling the work done.`);
  block("Stop", `${misses.join("; ")}. Block ${count}/${MAX_NAG}; add real, fresh evidence or repair the project policy.`);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const payload = readJsonFrom(raw);
function readJsonFrom(input) { try { return JSON.parse(input || "{}"); } catch { return {}; } }
const mode = process.argv[2];
if (mode === "ui-track") track(payload);
else if (mode === "spec-nudge") nudge();
else if (mode === "done-wall") wall();
else pass("Stop", "[artifact-gauntlet] unknown mode; wall left open.");
