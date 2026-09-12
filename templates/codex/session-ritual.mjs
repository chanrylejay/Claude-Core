// Codex SessionStart ritual. It reads the Claude-Core router at run time and
// returns exactly one SessionStart JSON object; diagnostics never use stdout.
// Since batch 1a (Sep 12 2026) the read plan comes from the kit's ONE resolver,
// templates/boot-resolver.mjs, imported from the kit at run time (no installed copy,
// so this hook and the browser boot cannot drift apart again; why: audit-log AL-30/AL-32).
// If the resolver cannot be imported, or throws (R1, Codex review Sep 12 2026: a resolver bug
// once killed this report outright, exit 1 and no JSON), the plan degrades to contract + router
// and the failure is named in the report, never hidden. This hook never wedges a session.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const KIT = path.resolve(process.env.CLAUDE_CORE || "C:/Users/Chanryle/Claude-Core");
let raw = "";
try { for await (const chunk of process.stdin) raw += chunk; } catch {}
let input = {};
try { input = JSON.parse(raw || "{}"); } catch {}

const failed = [];
const read = (file) => {
  try { return fs.readFileSync(file, "utf8"); }
  catch (error) { failed.push(`${file} (${error.code === "ENOENT" ? "missing" : "unreadable"})`); return ""; }
};
const resolveListed = (entry) => path.resolve(KIT, entry.replace(/^\.\.\//, ""));
const gitState = (cwd) => {
  const run = (...args) => spawnSync("git", args, { cwd, encoding: "utf8", timeout: 3000 });
  const branch = run("branch", "--show-current");
  if (branch.status !== 0) return `Git ${cwd}: not a repository`;
  const head = run("rev-parse", "--short", "HEAD");
  const status = run("status", "--porcelain");
  const changes = status.status === 0 ? status.stdout.trim().split(/\r?\n/).filter(Boolean).length : 0;
  return `Git ${cwd}: ${branch.stdout.trim() || "detached"}, ${head.status === 0 ? head.stdout.trim() : "no commits"}, ${changes ? `${changes} changed path${changes === 1 ? "" : "s"}` : "clean"}`;
};

const source = ["startup", "resume", "clear", "compact"].includes(input.source) ? input.source : "compact";
const contract = path.join(KIT, "CLAUDE.md");
const routerPath = path.join(KIT, "memory", "MEMORY.md");
read(contract);
const router = read(routerPath);
const resolverPath = path.join(KIT, "templates", "boot-resolver.mjs");
let resolver = null;
try { resolver = await import(pathToFileURL(resolverPath).href); }
catch (error) { failed.push(`${resolverPath} (${error.code === "ERR_MODULE_NOT_FOUND" ? "missing" : "unreadable: " + (error.code || error.message)})`); }
let index = { state: {} }, plan = { mode: "", boot: [], problems: [] }, resolverRan = false;
if (resolver) {
  try { index = resolver.parseIndex(router); plan = resolver.resolveBoot(index, { seat: "codex" }); resolverRan = true; }
  catch (error) { // R1: a throw inside the resolver is a named failure, never a dead hook
    index = { state: {} }; plan = { mode: "", boot: [], problems: [] };
    failed.push(`${resolverPath} (threw: ${error.message})`);
  }
}
const mode = plan.mode || "unknown";
const active = index.state.active_project || "";
const planned = plan.boot.length ? plan.boot.map(({ path: p }) => resolveListed(p)) : [contract, routerPath]; // no usable resolver: the two anchors, and the failed read says why
if (resolverRan && !active && !plan.problems.some((p) => /active_project/.test(p))) failed.push(`${routerPath} (active_project missing)`);
for (const file of [...new Set(planned)].slice(2)) read(file);

const home = process.env.USERPROFILE || process.env.HOME || os.homedir();
const indexKey = path.resolve(input.cwd || process.cwd()).replace(/^([A-Za-z]):/, (_, drive) => `${drive.toLowerCase()}-`).replace(/[\\/]+/g, "-");
read(path.join(home, ".claude", "projects", indexKey, "memory", "MEMORY.md"));
const stale = fs.existsSync(path.join(home, ".codex", "PUSH_GO"));
const names = [...new Set(planned)].map((file) => path.relative(KIT, file).replace(/\\/g, "/")).join(", ");
const ritual = source === "compact"
  ? "THE DRILL now: do not trust the compaction summary; reopen the listed files in full before substantive work."
  : `Session ritual for ${source}: open the listed files in full before substantive work.`;
let pushReport;
try {
  const { inspectPushState } = await import("./push-state.mjs");
  pushReport = inspectPushState(path.resolve(input.cwd || process.cwd()), KIT).summary;
} catch (error) {
  pushReport = "WARNING: workspace push assertion failed (" + (error.code || error.message) + "); inspect the push rows and effective pre-push hook.";
}
const report = [
  ritual,
  `Router at runtime: mode ${mode}; active project ${active || "unresolved"}.`,
  `Read plan: ${names || "router unavailable"}.`,
  ...(plan.problems.length ? [`Resolver problems: ${plan.problems.join("; ")}.`] : []),
  gitState(path.resolve(input.cwd || process.cwd())),
  pushReport,
  stale ? "Stale PUSH_GO exists: report it to Chan and never use it." : "No stale PUSH_GO token.",
  failed.length ? `Failed reads: ${failed.join("; ")}.` : "Failed reads: none.",
].join(" ");
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: report } }) + "\n");
