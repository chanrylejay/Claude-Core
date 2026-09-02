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
spawnSync("git", ["init", "-q"], { cwd: REPO, encoding: "utf8" });

let pass = 0, fail = 0;
const ok = (label, condition) => { if (condition) pass++; else { fail++; console.error(`FAIL: ${label}`); } };
const run = (source) => spawnSync(process.execPath, [path.join(TPL, "session-ritual.mjs")], {
  input: JSON.stringify({ source, hook_event_name: "SessionStart", cwd: REPO }), encoding: "utf8", timeout: 10000,
  env: { ...process.env, USERPROFILE: HOME, HOME, CLAUDE_CORE: KIT },
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
fs.mkdirSync(path.join(HOME, ".codex"), { recursive: true });
fs.writeFileSync(path.join(HOME, ".codex", "PUSH_GO"), "{}\n");
r = run("startup");
ok("stale token report is folded into the ritual", /Stale PUSH_GO exists/.test(context(r)));
const wiring = JSON.parse(fs.readFileSync(path.join(TPL, "hooks.json"), "utf8"));
const start = wiring.hooks?.SessionStart?.[0]?.hooks || [];
ok("wiring has one ritual reporter and no legacy hello probe", start.length === 1 && /session-ritual\.mjs/.test(start[0].command) && !/hello\.mjs|--session-start/.test(JSON.stringify(start)));
fs.rmSync(HOME, { recursive: true, force: true });
fs.rmSync(KIT, { recursive: true, force: true });
console.log(`\nsession-ritual: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
