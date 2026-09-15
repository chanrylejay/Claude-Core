// Codex SessionStart ritual. It reads the Claude-Core router at run time and
// returns exactly one SessionStart JSON object; diagnostics never use stdout.
// Since batch 1a (Sep 12 2026) the read plan comes from the kit's ONE resolver,
// templates/boot-resolver.mjs, imported from the kit at run time (no installed copy,
// so this hook and the browser boot cannot drift apart again; why: audit-log AL-30/AL-32).
// If the resolver cannot be imported, or throws (R1, Codex review Sep 12 2026: a resolver bug
// once killed this report outright, exit 1 and no JSON), the plan degrades to contract + router
// and the failure is named in the report, never hidden. This hook never wedges a session.
// Batch 1b (Sep 12 2026; AL-33): the mode comes from THIS workspace's `boot_mode:` line
// (AGENTS.md or CLAUDE.md beside the session's cwd, read through the resolver's one parser);
// mode_default in the router is the fallback, and the report says which one decided. A resolver
// copy older than 1b has no readWorkspaceMode: the hook boots mode_default and says so.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline";

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
let modeSource = "mode_default in the router (no boot_mode line in this workspace)";
if (resolver) {
  try {
    index = resolver.parseIndex(router);
    const ws = typeof resolver.readWorkspaceMode === "function" ? resolver.readWorkspaceMode(path.resolve(input.cwd || process.cwd())) : { mode: "", source: "", problems: ["resolver copy predates batch 1b (no readWorkspaceMode): booting mode_default"] };
    if (ws.source) modeSource = ws.source;
    plan = resolver.resolveBoot(index, { seat: "codex", mode: ws.mode, modeSource: ws.source });
    plan.problems = [...ws.problems, ...plan.problems];
    resolverRan = true;
  } catch (error) { // R1: a throw inside the resolver is a named failure, never a dead hook
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
// Batch 2c: report observations only. Never edit config, select a fallback, or call a model.
const atom = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/.test(value) ? value : "unavailable";
const configuredPosture = () => {
  const values = {};
  try {
    const text = fs.readFileSync(path.join(home, ".codex", "config.toml"), "utf8");
    // Deliberately narrow: personal root-level scalar strings, not resolved profiles/project config.
    // Reject unsupported root multiline syntax rather than mistaking text inside it for settings.
    for (const line of text.split(/\r?\n/)) {
      if (/^\s*(?:#|$)/.test(line)) continue;
      if (/^\s*\[/.test(line)) break;
      if (/^[^#]*=(?:[^#]*"""|[^#]*''')/.test(line)) throw new Error("unsupported root multiline syntax");
      const key = line.match(/^\s*(model|model_reasoning_effort)\s*=/)?.[1];
      if (!key) continue;
      const value = line.match(/^\s*(?:model|model_reasoning_effort)\s*=\s*(?:"([A-Za-z0-9._-]+)"|'([A-Za-z0-9._-]+)')\s*(?:#.*)?$/);
      if (!value || Object.hasOwn(values, key)) throw new Error("ambiguous or unsupported configured field");
      values[key] = atom(value[1] || value[2]);
    }
    return { model: values.model || "unavailable", effort: values.model_reasoning_effort || "unavailable" };
  } catch { return { model: "unavailable", effort: "unavailable" }; }
};
const effectivePosture = async () => {
  const id = input.session_id || input.thread_id || process.env.CODEX_THREAD_ID;
  if (typeof id !== "string" || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) return null;
  const sessionRoot = path.join(home, ".codex", "sessions");
  try {
    // Locate THIS id, never the newest unrelated rollout. No symlink traversal.
    const matches = [];
    const walk = (dir, depth = 0) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory() && depth < 3 && /^\d{2,4}$/.test(entry.name)) walk(path.join(dir, entry.name), depth + 1);
        else if (entry.isFile() && entry.name.endsWith(`-${id}.jsonl`)) matches.push(path.join(dir, entry.name));
      }
    };
    walk(sessionRoot);
    if (matches.length !== 1) return null;
    let metaId, context, startedTurn, line = 0;
    const stream = fs.createReadStream(matches[0], { encoding: "utf8" });
    const reader = createInterface({ input: stream, crlfDelay: Infinity });
    // Stream errors are forwarded explicitly so a removed/unreadable record cannot wedge the hook.
    stream.on("error", error => reader.emit("error", error));
    try {
      for await (const text of reader) {
        line++;
        let row; try { row = JSON.parse(text); } catch { continue; } // an unfinished trailing line is normal
        if (row.type === "session_meta") metaId = row.payload?.id;
        if (row.type === "event_msg" && row.payload?.type === "task_started") startedTurn = row.payload.turn_id;
        if (row.type === "turn_context") context = { ...row.payload, line };
      }
    } finally { reader.close(); stream.destroy(); }
    const sameCwd = value => typeof value === "string" && (process.platform === "win32"
      ? path.resolve(value).toLowerCase() === path.resolve(input.cwd || process.cwd()).toLowerCase()
      : path.resolve(value) === path.resolve(input.cwd || process.cwd()));
    if (metaId !== id || !context || !sameCwd(context.cwd) || (startedTurn && startedTurn !== context.turn_id)) return null;
    const model = atom(context.model), effort = atom(context.effort);
    if (model === "unavailable" || effort === "unavailable") return null;
    return { model, effort, line: context.line };
  } catch { return null; }
};
const postureReport = async () => {
  const configured = configuredPosture();
  const effective = await effectivePosture();
  let documented = null;
  try {
    const list = JSON.parse(fs.readFileSync(path.join(KIT, "templates", "codex", "models-current.json"), "utf8"));
    if (/^\d{4}-\d{2}-\d{2}$/.test(list.checked_on) && Array.isArray(list.models) && list.models.length > 0
      && list.models.every(row => atom(row.name) !== "unavailable" && row.source === `https://developers.openai.com/api/docs/models/${row.name}`)
      && new Set(list.models.map(row => row.name)).size === list.models.length) documented = list;
  } catch {}
  const warnings = [];
  if (configured.model === "unavailable" || configured.effort === "unavailable") warnings.push("configured fields unavailable; inspect personal config");
  if (!documented) warnings.push("documented-current list unavailable; refresh it");
  else if (configured.model !== "unavailable" && !documented.models.some(row => row.name === configured.model)) warnings.push("configured name not on documented-current list; inspect it, no fallback selected");
  if (configured.effort === "ultra" || effective?.effort === "ultra") warnings.push("ULTRA violates Chan's kit posture");
  if (effective && ((configured.model !== "unavailable" && configured.model !== effective.model)
    || (configured.effort !== "unavailable" && configured.effort !== effective.effort))) warnings.push("configured and effective disagree");
  return `Posture: configured (personal): ${configured.model}/${configured.effort}; `
    + (effective ? `effective: ${effective.model}/${effective.effort} (accepted in record, line ${effective.line}); ` : "effective: not reachable at start; ")
    + (documented ? `documented (${documented.checked_on}): ${documented.models.map(row => row.name).join(", ")}.` : "documented: unavailable.")
    + (warnings.length ? " WARNING: " + warnings.join("; ") + "." : "");
};
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
  `Router at runtime: mode ${mode}; active project ${active || "unresolved"}. Mode source: ${modeSource}.`,
  `Read plan: ${names || "router unavailable"}.`,
  ...(plan.problems.length ? [`Resolver problems: ${plan.problems.join("; ")}.`] : []),
  gitState(path.resolve(input.cwd || process.cwd())),
  pushReport,
  stale ? "Stale PUSH_GO exists: report it to Chan and never use it." : "No stale PUSH_GO token.",
  failed.length ? `Failed reads: ${failed.join("; ")}.` : "Failed reads: none.",
].join(" ");
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: report + "\n" + await postureReport() } }) + "\n");
