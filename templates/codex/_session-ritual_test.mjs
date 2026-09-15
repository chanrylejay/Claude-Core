// Regression net for the Codex SessionStart ritual. It stages a kit and home;
// the live home and the live Claude project index are never changed.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TPL = path.dirname(fileURLToPath(import.meta.url));
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), "codex-ritual-home-"));
const KIT = fs.mkdtempSync(path.join(os.tmpdir(), "codex-ritual-kit-"));
const REPO = path.join(HOME, "session-folder");
fs.mkdirSync(path.join(KIT, "memory"), { recursive: true });
fs.mkdirSync(path.join(KIT, "projects", "demo"), { recursive: true });
fs.mkdirSync(REPO, { recursive: true });
fs.writeFileSync(path.join(KIT, "CLAUDE.md"), "contract\n");
fs.writeFileSync(path.join(KIT, "memory", "MEMORY.md"), `---\nstate:\n  mode_default: TRIAL\n  active_project: projects/demo/project-canon.md\ncold_start:\n  - memory/cold.md\nmodes:\n  TRIAL:\n    - memory/mode.md\n---\n`);
fs.writeFileSync(path.join(KIT, "memory", "cold.md"), "cold\n");
fs.writeFileSync(path.join(KIT, "memory", "mode.md"), "mode\n");
fs.writeFileSync(path.join(KIT, "projects", "demo", "project-canon.md"), "canon\n");
// batch 1a: the ritual imports the kit's ONE resolver at run time; stage it the way an install does
fs.mkdirSync(path.join(KIT, "templates"), { recursive: true });
fs.copyFileSync(path.join(TPL, "..", "boot-resolver.mjs"), path.join(KIT, "templates", "boot-resolver.mjs"));
fs.mkdirSync(path.join(KIT, "templates", "codex"), { recursive: true });
// Own the fixture: refreshing the live list must not change this scenario's expected output.
fs.writeFileSync(path.join(KIT, "templates", "codex", "models-current.json"), JSON.stringify({
  checked_on: "2026-09-15",
  models: ["gpt-6-astra", "gpt-5.6-luna"].map(name => ({ name, source: `https://developers.openai.com/api/docs/models/${name}` })),
}));
fs.mkdirSync(path.join(HOME, ".codex"), { recursive: true });
const configPath = path.join(HOME, ".codex", "config.toml");
const configText = 'model = "gpt-6-astra"\nmodel_reasoning_effort = "max"\n';
fs.writeFileSync(configPath, configText);
spawnSync("git", ["init", "-q"], { cwd: REPO, encoding: "utf8" });

let pass = 0, fail = 0;
const ok = (label, condition) => { if (condition) pass++; else { fail++; console.error(`FAIL: ${label}`); } };
const run = (source, cwd = REPO, ids = {}) => spawnSync(process.execPath, [path.join(TPL, "session-ritual.mjs")], {
  input: JSON.stringify({ source, hook_event_name: "SessionStart", cwd, ...ids }), encoding: "utf8", timeout: 10000,
  env: { ...process.env, USERPROFILE: HOME, HOME, CLAUDE_CORE: KIT, CODEX_THREAD_ID: "" },
});
const parse = (r) => { try { return JSON.parse(r.stdout); } catch { return null; } };
const context = (r) => parse(r)?.hookSpecificOutput?.additionalContext || "";
let r = run("startup");
ok("startup emits one JSON SessionStart object and no stderr", r.status === 0 && !!parse(r) && !(r.stderr || "").trim());
ok("startup resolves router, cold start, mode, active project, and git at runtime", /mode TRIAL/.test(context(r)) && /memory\/cold\.md/.test(context(r)) && /memory\/mode\.md/.test(context(r)) && /projects\/demo\/project-canon\.md/.test(context(r)) && /Git .*session-folder/.test(context(r)));
ok("startup names the absent Claude project index as report-and-skip", /Failed reads: .*\.claude.*memory.*MEMORY\.md .*missing/.test(context(r)));
for (const source of ["resume", "clear"]) { r = run(source); ok(`${source} is source-aware`, new RegExp(`ritual for ${source}`).test(context(r))); }
r = run("compact");
ok("compact injects THE DRILL", /THE DRILL now: do not trust the compaction summary/.test(context(r)));
r = run("unrecognised");
ok("unknown source fails safe to compact ritual", /THE DRILL now/.test(context(r)));
// batch 1a: the shared resolver is the plan; its absence and its problems are named, never silent
ok("clean run prints no resolver problems segment", !/Resolver problems/.test(context(run("startup"))));
const routerText = fs.readFileSync(path.join(KIT, "memory", "MEMORY.md"), "utf8");
fs.writeFileSync(path.join(KIT, "memory", "MEMORY.md"), routerText.replace("mode_default: TRIAL", "mode_default: NO_SUCH_MODE"));
r = run("startup");
ok("unknown mode_default: problem named, plan keeps contract + router + cold start + canon and drops only the mode set, exit 0", r.status === 0 && !!parse(r) && /Resolver problems: mode "NO_SUCH_MODE" not in the modes block \(have: TRIAL\)/.test(context(r)) && /Read plan: CLAUDE\.md, memory\/MEMORY\.md, memory\/cold\.md, projects\/demo\/project-canon\.md\./.test(context(r)) && !/memory\/mode\.md/.test(context(r)));
fs.writeFileSync(path.join(KIT, "memory", "MEMORY.md"), routerText);
// R1 (Codex review, Sep 12 2026): mode_default: constructor once crashed this hook (exit 1, no JSON)
fs.writeFileSync(path.join(KIT, "memory", "MEMORY.md"), routerText.replace("mode_default: TRIAL", "mode_default: constructor"));
r = run("startup");
ok("R1 end-to-end: mode_default constructor → exit 0, one JSON object, empty stderr, named unknown-mode problem, plan keeps contract + router + cold start + canon", r.status === 0 && !!parse(r) && !(r.stderr || "").trim() && /Resolver problems: mode "constructor" not in the modes block \(have: TRIAL\)/.test(context(r)) && /Read plan: CLAUDE\.md, memory\/MEMORY\.md, memory\/cold\.md, projects\/demo\/project-canon\.md\./.test(context(r)) && /Router at runtime: mode constructor;/.test(context(r)));
fs.writeFileSync(path.join(KIT, "memory", "MEMORY.md"), routerText);
const resolverCopy = path.join(KIT, "templates", "boot-resolver.mjs");
fs.writeFileSync(resolverCopy, 'export function parseIndex() { return { state: {} }; }\nexport function resolveBoot() { throw new Error("boom"); }\n');
r = run("startup");
ok("R1: a resolver that throws is a named failed read (threw: boom); plan degrades to contract + router, exit 0, one JSON object, empty stderr", r.status === 0 && !!parse(r) && !(r.stderr || "").trim() && /Failed reads: .*boot-resolver\.mjs \(threw: boom\)/.test(context(r)) && /Read plan: CLAUDE\.md, memory\/MEMORY\.md\./.test(context(r)) && !/active_project missing/.test(context(r)));
fs.copyFileSync(path.join(TPL, "..", "boot-resolver.mjs"), resolverCopy);
fs.rmSync(resolverCopy);
r = run("startup");
ok("missing resolver is a named failed read; plan degrades to contract + router, exit 0, one JSON object", r.status === 0 && !!parse(r) && !(r.stderr || "").trim() && /Failed reads: .*boot-resolver\.mjs \(missing\)/.test(context(r)) && /Read plan: CLAUDE\.md, memory\/MEMORY\.md\./.test(context(r)) && !/memory\/cold\.md/.test(context(r)));
fs.copyFileSync(path.join(TPL, "..", "boot-resolver.mjs"), resolverCopy);
ok("restored resolver resolves the full plan again", /memory\/cold\.md/.test(context(run("startup"))));
// batch 1b: the workspace's boot_mode line decides; mode_default is the fallback and the report says which
ok("no boot_mode line in the workspace: mode_default decides and the report says so", /Router at runtime: mode TRIAL;.*Mode source: mode_default in the router \(no boot_mode line in this workspace\)\./.test(context(run("startup"))));
fs.writeFileSync(path.join(KIT, "memory", "MEMORY.md"), routerText.replace("modes:\n  TRIAL:\n    - memory/mode.md\n", "modes:\n  TRIAL:\n    - memory/mode.md\n  OTHER:\n    - memory/other.md\n"));
fs.writeFileSync(path.join(KIT, "memory", "other.md"), "other\n");
fs.writeFileSync(path.join(REPO, "AGENTS.md"), "# demo\n- boot_mode: OTHER\n");
r = run("startup");
ok("boot_mode: OTHER in the workspace AGENTS.md: mode OTHER from workspace AGENTS.md, its set planned, the canon parked (not its mode), no resolver problems", r.status === 0 && /Router at runtime: mode OTHER;.*Mode source: workspace AGENTS\.md\./.test(context(r)) && /Read plan: CLAUDE\.md, memory\/MEMORY\.md, memory\/cold\.md, memory\/other\.md\. Git /.test(context(r)) && !/Resolver problems/.test(context(r)));
fs.writeFileSync(path.join(REPO, "CLAUDE.md"), "# demo\n- boot_mode: TRIAL\n");
r = run("startup");
ok("CLAUDE.md and AGENTS.md disagreeing: named as a resolver problem, mode_default decides, exit 0, one JSON object", r.status === 0 && !!parse(r) && /Resolver problems: the workspace's boot_mode lines disagree \(CLAUDE\.md: TRIAL, AGENTS\.md: OTHER\)/.test(context(r)) && /Router at runtime: mode TRIAL;.*Mode source: mode_default in the router/.test(context(r)));
// R1 (Codex review of 1b v1, Sep 13 2026): Codex's exact repro — an empty declaration followed by prose
fs.rmSync(path.join(REPO, "CLAUDE.md")); fs.writeFileSync(path.join(REPO, "AGENTS.md"), "boot_mode:\n\nLEAN guidance belongs to later prose.\n");
r = run("startup");
ok("R1: an empty `boot_mode:` followed by prose never selects LEAN: mode_default decides, the empty line is a named resolver problem that says so, the full plan prints, exit 0", r.status === 0 && /Router at runtime: mode TRIAL;.*Mode source: mode_default in the router/.test(context(r)) && /Resolver problems: AGENTS\.md has a boot_mode line with no value \(the mode name goes on that same line; a value on a later line is never read\); booting mode_default\./.test(context(r)) && /Read plan: CLAUDE\.md, memory\/MEMORY\.md, memory\/cold\.md, memory\/mode\.md, projects\/demo\/project-canon\.md\./.test(context(r)) && !/mode LEAN/.test(context(r)));
// R4 (Codex review of 1b v2): an empty CLAUDE.md beside a valid AGENTS.md must not announce a fallback that does not happen
fs.writeFileSync(path.join(REPO, "CLAUDE.md"), "boot_mode:\n"); fs.writeFileSync(path.join(REPO, "AGENTS.md"), "boot_mode: OTHER\n"); // the OTHER router is still staged here
r = run("startup");
ok("R4: empty CLAUDE.md beside a valid AGENTS.md: mode OTHER from workspace AGENTS.md, CLAUDE.md's empty line named, and NO \"booting mode_default\" anywhere in the report", r.status === 0 && /Router at runtime: mode OTHER;.*Mode source: workspace AGENTS\.md\./.test(context(r)) && /Resolver problems: CLAUDE\.md has a boot_mode line with no value \(the mode name goes on that same line; a value on a later line is never read\)\./.test(context(r)) && !/booting mode_default/.test(context(r)));
fs.rmSync(path.join(REPO, "CLAUDE.md")); // the OTHER router stays in place for the unknown-mode pin below, restored after it
fs.writeFileSync(path.join(REPO, "AGENTS.md"), "- boot_mode: NOT_A_MODE\n");
r = run("startup");
ok("an unknown workspace mode degrades like an unknown mode_default: named, plan keeps contract + router + cold start + canon, exit 0", r.status === 0 && /Resolver problems: mode "NOT_A_MODE" not in the modes block \(have: TRIAL, OTHER\)/.test(context(r)) && /Read plan: CLAUDE\.md, memory\/MEMORY\.md, memory\/cold\.md, projects\/demo\/project-canon\.md\./.test(context(r)));
fs.rmSync(path.join(REPO, "AGENTS.md"));
fs.writeFileSync(resolverCopy, 'export function parseIndex() { return { state: { mode_default: "TRIAL", active_project: "projects/demo/project-canon.md" }, coldStart: [{ path: "memory/cold.md", comment: "" }], modes: { TRIAL: ["memory/mode.md"] }, lookup: [], problems: [] }; }\nexport function resolveBoot(index, { mode = "" } = {}) { return { mode: mode || index.state.mode_default, modeSource: "state block", boot: [{ path: "CLAUDE.md" }, { path: "memory/MEMORY.md" }, { path: "memory/cold.md" }], lookup: [], problems: [] }; }\n');
r = run("startup");
ok("a resolver copy that predates 1b (no readWorkspaceMode) still boots mode_default and names why, exit 0", r.status === 0 && !!parse(r) && /Resolver problems: resolver copy predates batch 1b \(no readWorkspaceMode\): booting mode_default/.test(context(r)) && /Router at runtime: mode TRIAL;/.test(context(r)));
fs.copyFileSync(path.join(TPL, "..", "boot-resolver.mjs"), resolverCopy);
fs.writeFileSync(path.join(KIT, "memory", "MEMORY.md"), routerText);
ok("restored router and resolver: the 1a plan again, mode_default", /Read plan: CLAUDE\.md, memory\/MEMORY\.md, memory\/cold\.md, memory\/mode\.md, projects\/demo\/project-canon\.md\. Git /.test(context(run("startup"))));
fs.mkdirSync(path.join(HOME, ".codex"), { recursive: true });
fs.writeFileSync(path.join(HOME, ".codex", "PUSH_GO"), "{}\n");
r = run("startup");
ok("stale token report is folded into the ritual", /Stale PUSH_GO exists/.test(context(r)));
const git = (repo, ...args) => {
  const result = spawnSync("git", args, { cwd: repo, encoding: "utf8", windowsHide: true });
  if (result.status !== 0) throw new Error("fixture git failed: " + result.stderr);
};
ok("an unprotected other clone warns", /neither DISABLED push URLs nor an installed pre-push hook/.test(context(r)));
git(REPO, "remote", "add", "origin", "https://example.invalid/repo.git");
git(REPO, "config", "remote.origin.pushurl", "DISABLED");
r = run("startup");
ok("other clone prints its DISABLED push row", /origin DISABLED \(push\)/.test(context(r)) && !/neither DISABLED/.test(context(r)));
git(REPO, "config", "--add", "remote.origin.pushurl", "https://example.invalid/second.git");
r = run("startup");
ok("a second live push URL defeats the DISABLED assertion", /second.git \(push\)/.test(context(r)) && /neither DISABLED/.test(context(r)));
const custom = path.join(REPO, "custom-hooks");
fs.mkdirSync(custom);
fs.writeFileSync(path.join(custom, "pre-push"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
git(REPO, "config", "core.hooksPath", "custom-hooks");
r = run("startup");
ok("other clone resolves a relative hooksPath without assuming the kit gate", /custom-hooks/.test(context(r)) && /installed; content not certified/.test(context(r)) && !/neither DISABLED/.test(context(r)));
fs.writeFileSync(path.join(custom, "pre-push"), "");
r = run("startup");
ok("empty hook never counts as installed protection", /neither DISABLED/.test(context(r)));
git(KIT, "init", "-q");
git(KIT, "remote", "add", "origin", "https://example.invalid/kit.git");
fs.mkdirSync(path.join(KIT, "templates/codex"), { recursive: true });
const expected = fs.readFileSync(path.join(TPL, "pre-push"));
fs.writeFileSync(path.join(KIT, "templates/codex/pre-push"), expected);
const kitHook = path.join(KIT, ".git/hooks/pre-push");
r = run("startup", KIT);
ok("kit without gate warns with canon path", /kit gate is not/.test(context(r)) && /lessons\/platforms\/codex.md/.test(context(r)));
fs.writeFileSync(kitHook, expected, { mode: 0o755 });
r = run("startup", KIT);
ok("kit prints push row and exact template verdict", /origin https:\/\/example.invalid\/kit.git \(push\)/.test(context(r)) && /\[identical\]/.test(context(r)) && !/WARNING:/.test(context(r)));
const nested = path.join(KIT, "nested"); fs.mkdirSync(nested);
r = run("startup", nested);
ok("kit subdirectory still checks the kit gate", /kit template check/.test(context(r)) && /\[identical\]/.test(context(r)));
fs.writeFileSync(kitHook, expected.toString("utf8").replace(/\n/g, "\r\n"));
r = run("startup", KIT);
ok("kit distinguishes line-ending drift", /WARNING: kit pre-push differs, line endings only/.test(context(r)));
fs.writeFileSync(kitHook, "#!/bin/sh\nexit 0\n");
r = run("startup", KIT);
ok("kit distinguishes content drift", /WARNING: kit pre-push differs, content/.test(context(r)));
git(KIT, "config", "core.hooksPath", "missing-hooks");
r = run("startup", KIT);
ok("kit does not trust a bypassed default hook", /missing-hooks/.test(context(r)) && /kit gate is not/.test(context(r)));
const wiring = JSON.parse(fs.readFileSync(path.join(TPL, "hooks.json"), "utf8"));
const start = wiring.hooks?.SessionStart?.[0]?.hooks || [];
ok("wiring has one ritual reporter and no legacy hello probe", start.length === 1 && /session-ritual\.mjs/.test(start[0].command) && !/hello\.mjs|--session-start/.test(JSON.stringify(start)));
// Batch 2c: current/retired config, effective identity, effort, and unavailable paths.
const posture = result => context(result).split("\n").find(line => line.startsWith("Posture:")) || "";
r = run("startup");
ok("posture is exactly one added line, with documented and configured distinct from effective", context(r).split("\n").length === 2 && /configured \(personal\): gpt-6-astra\/max; effective: not reachable at start; documented \(2026-09-15\): gpt-6-astra, gpt-5.6-luna/.test(posture(r)) && !/accepted/.test(posture(r)));
fs.writeFileSync(configPath, configText.replace("gpt-6-astra", "gpt-5.4"));
r = run("startup");
ok("retired/unknown configured name is loud, never silently replaced or called accepted", /configured \(personal\): gpt-5.4\/max/.test(posture(r)) && /WARNING: configured name not on documented-current list/.test(posture(r)) && !/accepted/.test(posture(r)));
fs.writeFileSync(configPath, configText.replace('"max"', '"ultra"'));
ok("configured ultra is loud", /WARNING: ULTRA violates Chan's kit posture/.test(posture(run("startup"))));
fs.writeFileSync(configPath, configText + '[projects.demo]\nmodel = "gpt-5.4"\nmodel_reasoning_effort = "ultra"\n');
ok("personal root fields are not confused with table fields", /configured \(personal\): gpt-6-astra\/max/.test(posture(run("startup"))) && !/ULTRA/.test(posture(run("startup"))));
fs.writeFileSync(configPath, configText + 'model = "gpt-5.4"\n');
ok("duplicate configured fields are unavailable, not guessed", /configured fields unavailable/.test(posture(run("startup"))));
fs.writeFileSync(configPath, 'developer_instructions = """\n' + configText + '"""\n' + configText);
ok("root multiline text cannot impersonate model settings", /configured fields unavailable/.test(posture(run("startup"))));
fs.writeFileSync(configPath, configText);
const id = "11111111-1111-4111-8111-111111111111";
const sessions = path.join(HOME, ".codex", "sessions", "2026", "09", "15");
fs.mkdirSync(sessions, { recursive: true });
const rollout = path.join(sessions, `rollout-test-${id}.jsonl`);
const writeRecord = (model = "gpt-6-astra", effort = "max", extra = []) => fs.writeFileSync(rollout, [
  { type: "session_meta", payload: { id } },
  { type: "event_msg", payload: { type: "task_started", turn_id: "turn-1" } },
  { type: "turn_context", payload: { model, effort, cwd: REPO, turn_id: "turn-1" } }, ...extra,
].map(row => JSON.stringify(row)).join("\n") + "\n");
writeRecord();
r = run("startup", REPO, { session_id: id });
ok("only this session's record establishes accepted effective fields", /effective: gpt-6-astra\/max \(accepted in record, line 3\)/.test(posture(r)) && !/disagree/.test(posture(r)));
writeRecord("gpt-5.6-luna", "medium");
ok("configured/effective disagreement is loud", /effective: gpt-5.6-luna\/medium/.test(posture(run("startup", REPO, { session_id: id }))) && /WARNING: configured and effective disagree/.test(posture(run("startup", REPO, { session_id: id }))));
writeRecord("gpt-6-astra", "ultra");
ok("effective ultra is loud even with configured max", /WARNING: ULTRA violates Chan's kit posture; configured and effective disagree/.test(posture(run("startup", REPO, { session_id: id }))));
writeRecord("gpt-6-astra", "max", [{ type: "event_msg", payload: { type: "task_started", turn_id: "turn-2" } }]);
ok("previous turn settings are not sold as this turn's effective settings", /effective: not reachable at start/.test(posture(run("startup", REPO, { session_id: id }))));
writeRecord();
fs.appendFileSync(rollout, '{"type":');
ok("a still-writing trailing line does not hide a complete current context", /effective: gpt-6-astra\/max/.test(posture(run("startup", REPO, { session_id: id }))));
writeRecord();
fs.writeFileSync(rollout, fs.readFileSync(rollout, "utf8").replace(`"id":"${id}"`, '"id":"wrong-session"'));
ok("a matching filename with the wrong session_meta id is not proof", /effective: not reachable at start/.test(posture(run("startup", REPO, { session_id: id }))));
writeRecord();
ok("a record from another cwd is not this workspace's effective setting", /effective: not reachable at start/.test(posture(run("startup", KIT, { session_id: id }))));
ok("missing current record never borrows an unrelated rollout", /effective: not reachable at start/.test(posture(run("startup", REPO, { session_id: "22222222-2222-4222-8222-222222222222" }))));
const modelPath = path.join(KIT, "templates", "codex", "models-current.json");
fs.writeFileSync(modelPath, "{");
r = run("startup", REPO, { session_id: id });
ok("broken list still emits one valid JSON and a named warning", r.status === 0 && !!parse(r) && !r.stderr.trim() && /documented-current list unavailable/.test(posture(r)));
fs.rmSync(configPath);
ok("missing personal config is named without wedging the hook", /configured fields unavailable/.test(posture(run("startup"))));
fs.rmSync(HOME, { recursive: true, force: true });
fs.rmSync(KIT, { recursive: true, force: true });
console.log(`\nsession-ritual: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
