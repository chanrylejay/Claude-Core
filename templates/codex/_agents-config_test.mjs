// Batch 2c: owned helper configuration and evidence labels. No model calls.
// --root <dir> checks a pre-2c tree with this same net (expected red).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootArg = process.argv.indexOf("--root");
const ROOT = rootArg < 0 ? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..") : path.resolve(process.argv[rootArg + 1]);
let passed = 0, failed = 0;
const ok = (name, condition) => { if (condition) passed++; else { failed++; console.error("FAIL: " + name); } };
const read = file => { try { return fs.readFileSync(path.join(ROOT, file), "utf8").replace(/\r\n?/g, "\n"); } catch { return ""; } };
// These owned files deliberately use only single-line keys; comments are evidence, not values.
const assignments = text => text.split("\n").map(line => line.match(/^([a-z_]+)\s*=\s*("[^"\n]*"|\d+)\s*(?:#.*)?$/)).filter(Boolean);
const config = read(".codex/config.toml");
const keys = assignments(config);
const key = (name, value) => keys.filter(m => m[1] === name).length === 1 && keys.some(m => m[1] === name && m[2] === value);
ok("one agents table, with no parent model or other config tables", config.split("\n").filter(l => /^\s*\[/.test(l)).join("\n") === "[agents]" && keys.length === 3);
ok("two-child configured cap", key("max_concurrent_threads_per_session", "2"));
ok("no-role configured model is luna", key("default_subagent_model", '"gpt-5.6-luna"'));
ok("no-role configured effort is high", key("default_subagent_reasoning_effort", '"high"'));
ok("defaults and cap carry an evidence label", /# Evidence: configured, not proven operational\./.test(config));
ok("max_depth is not configured", !/^\s*max_depth\s*=/m.test(config));
ok("project hook layers stay absent", !fs.existsSync(path.join(ROOT, ".codex/hooks.json")) && !fs.existsSync(path.join(ROOT, ".codex/hooks")));
for (const [role, model, instruction] of [
  ["kit_check", "gpt-5.6-luna", "Inspect only the receipts, line counts, exit codes, and logs the session already produced. Never run the nets."],
  ["kit_review", "gpt-6-astra", "Review only the named files for meaning against the brief's review scope. Do not edit files or run the nets."],
]) {
  const text = read(`.codex/agents/${role}.toml`);
  const fields = assignments(text);
  const has = (name, value) => fields.filter(m => m[1] === name).length === 1 && fields.some(m => m[1] === name && m[2] === JSON.stringify(value));
  ok(`${role}: required schema and name`, has("name", role) && fields.some(m => m[1] === "description") && fields.some(m => m[1] === "developer_instructions"));
  ok(`${role}: model and medium allowance`, has("model", model) && has("model_reasoning_effort", "medium"));
  ok(`${role}: read-only config and bounded instructions`, has("sandbox_mode", "read-only") && text.includes(instruction));
  ok(`${role}: C2 label, no stronger loading claim`, text.includes("# Role-file loading: configured, not proven operational.") && !/^#.*(?:loading proven|pins honored|pins ignored)/mi.test(text));
  ok(`${role}: all three settings distinguish text from observation`, ["model", "model_reasoning_effort", "sandbox_mode"].every(k => new RegExp(`^${k} = .*# Configured, not proven operational`).test(text.split("\n").find(l => l.startsWith(k + " = ")) || "")));
  ok(`${role}: sandbox is not certified by model metadata`, text.includes("a denied write has not been observed"));
}
const doc = read("lessons/platforms/codex.md");
for (const sentence of [
  "Pin a documented current name in kit config; the picker's personal line stays the picker's.",
  "A pin is operational only when the child's own record shows the pinned model and effort; otherwise configured, not proven operational.",
  "Both role files remain configured, not proven operational: C2 for each role.",
  "Helpers are absent by default; a brief that wants one names it.",
  "A role's instructions also ride in the spawn message; a task name is not a role selector.",
  "The explicit per-spawn form is proven for kit_check at gpt-5.6-luna/medium and kit_review at gpt-6-astra/medium on 0.154.0-alpha.6.2.",
  "The check program form is proven at gpt-5.6-luna/medium on the standalone v1 runtime; exec under v2 is untested.",
]) ok("runtime rule: " + sentence, doc.includes(sentence));
let models;
try { models = JSON.parse(read("templates/codex/models-current.json")); } catch {}
ok("documented-current list is dated and source-backed", /^\d{4}-\d{2}-\d{2}$/.test(models?.checked_on)
  && Array.isArray(models?.models)
  && models.models.every(m => typeof m?.name === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/.test(m.name)
    && m.source === `https://developers.openai.com/api/docs/models/${m.name}`)
  && ["gpt-6-astra", "gpt-5.6-luna"].every(name => models.models.some(m => m.name === name)));
const skeleton = read("templates/global/settings.global.skeleton.json");
let settings; try { settings = JSON.parse(skeleton); } catch {}
ok("recovery skeleton disables auto memory", settings?.autoMemoryEnabled === false);
console.log(`agents config: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
