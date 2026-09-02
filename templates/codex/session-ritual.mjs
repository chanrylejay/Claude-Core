// Codex SessionStart ritual. It reads the Claude-Core router at run time and
// returns exactly one SessionStart JSON object; diagnostics never use stdout.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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
const listFor = (router, key) => {
  const section = router.match(new RegExp(`^${key}:[ \\t]*(?:#.*)?$([\\s\\S]*?)(?=^[A-Za-z_]+:|(?![\\s\\S]))`, "m"))?.[1] || "";
  return [...section.matchAll(/^\s*-\s+([^#\r\n]+?)(?:\s+#.*)?\s*$/gm)].map((m) => m[1].trim());
};
const modeName = (router) => router.match(/^\s*mode_default:\s*([^#\s]+)/m)?.[1] || "unknown";
const activeProject = (router) => router.match(/^\s*active_project:\s*([^#\r\n]+)/m)?.[1].trim() || "";
const modeFiles = (router, mode) => {
  const modes = router.match(/^modes:[ \t]*(?:#.*)?$([\s\S]*?)(?=^[A-Za-z_]+:|(?![\s\S]))/m)?.[1] || "";
  const section = modes.match(new RegExp(`^\\s{2}${mode}:.*$([\\s\\S]*?)(?=^\\s{2}[A-Z_]+:|(?![\\s\\S]))`, "m"))?.[1] || "";
  return [...section.matchAll(/^\s*-\s+([^#\r\n]+?)(?:\s+#.*)?\s*$/gm)].map((m) => m[1].trim());
};
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
const cold = listFor(router, "cold_start");
const mode = modeName(router);
const modeSet = modeFiles(router, mode);
const active = activeProject(router);
const planned = [contract, routerPath, ...cold.map(resolveListed), ...modeSet.map(resolveListed)];
if (active) planned.push(resolveListed(active)); else failed.push(`${routerPath} (active_project missing)`);
for (const file of [...new Set(planned)].slice(2)) read(file);

const home = process.env.USERPROFILE || process.env.HOME || os.homedir();
const indexKey = path.resolve(input.cwd || process.cwd()).replace(/^([A-Za-z]):/, (_, drive) => `${drive.toLowerCase()}-`).replace(/[\\/]+/g, "-");
read(path.join(home, ".claude", "projects", indexKey, "memory", "MEMORY.md"));
const stale = fs.existsSync(path.join(home, ".codex", "PUSH_GO"));
const names = [...new Set(planned)].map((file) => path.relative(KIT, file).replace(/\\/g, "/")).join(", ");
const ritual = source === "compact"
  ? "THE DRILL now: do not trust the compaction summary; reopen the listed files in full before substantive work."
  : `Session ritual for ${source}: open the listed files in full before substantive work.`;
const report = [
  ritual,
  `Router at runtime: mode ${mode}; active project ${active || "unresolved"}.`,
  `Read plan: ${names || "router unavailable"}.`,
  gitState(path.resolve(input.cwd || process.cwd())),
  stale ? "Stale PUSH_GO exists: report it to Chan and never use it." : "No stale PUSH_GO token.",
  failed.length ? `Failed reads: ${failed.join("; ")}.` : "Failed reads: none.",
].join(" ");
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: report } }) + "\n");
