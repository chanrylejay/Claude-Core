// Read-only inventory of kit-owned Codex copies. --repo and --scan-root are repeatable.
// Usage: node templates/codex/verify-copies.mjs [--home <user-home>] [--kit <kit>] [--repo <clone>] [--scan-root <parent>]
// No repair happens here. Install by copying the returned expected bytes, never by a text pipeline.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { driftKind } from "./push-state.mjs";

const TPL = path.dirname(fileURLToPath(import.meta.url));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
// One source-to-target inventory, also consumed by installation receipts and the sandbox net.
export const GLOBAL_COPIES = [
  ["templates/codex-agents-md.md", ".codex/AGENTS.md", "A"],
  ["templates/codex-chan-guard.rules", ".codex/rules/chan-guard.rules"],
  ["templates/codex/hooks.json", ".codex/hooks.json"],
  ...["session-ritual.mjs", "push-state.mjs", "codex-guard-launcher.mjs", "codex-guard-runner.mjs", "codex-guard.mjs", "connector-reads.json", "go.mjs"]
    .map((name) => ["templates/codex/" + name, ".codex/hooks/" + name]),
  ["templates/hooks/push-guard.mjs", ".codex/hooks/push-guard.mjs"],
];
export const PROJECT_COPIES = [
  ["templates/codex/project-hooks.json", ".codex/hooks.json"],
  ["templates/codex/artifact-gauntlet.mjs", ".codex/hooks/artifact-gauntlet.mjs"],
  ["templates/codex-agents-md.md", "AGENTS.md", "B"],
];
export function sourceBytes(kit, source, block) {
  const bytes = fs.readFileSync(path.join(kit, source));
  if (!block) return bytes;
  const text = bytes.toString("utf8");
  const section = text.split("## Block " + block + " ")[1]?.split(/\n## Block /)[0];
  const match = section?.match(/```(?:markdown|md)?\r?\n([\s\S]*?\r?\n)```/);
  if (!match) throw new Error("missing doorway block " + block);
  return Buffer.from(match[1], "utf8");
}
export function copyTargets({ kit, home, repos = [], scanRoots = [] }) {
  const clones = new Set([path.resolve(kit), ...repos.map((p) => path.resolve(p))]);
  const configPath = path.join(home, ".codex/config.toml");
  if (fs.existsSync(configPath)) {
    const config = fs.readFileSync(configPath, "utf8");
    for (const m of config.matchAll(/^\[projects\.(?:'([^']+)'|"([^"]+)")\]\s*$/gm)) {
      const candidate = (m[1] || m[2]).replace(/\\\\/g, "\\");
      if (fs.existsSync(candidate)) clones.add(path.resolve(candidate));
    }
  }
  for (const parent of scanRoots) {
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      const candidate = path.join(parent, entry.name);
      if (entry.isDirectory() && fs.existsSync(path.join(candidate, ".git"))) clones.add(path.resolve(candidate));
    }
  }
  const key = (p) => {
    const resolved = fs.existsSync(p) ? fs.realpathSync(p) : path.resolve(p);
    return process.platform === "win32" ? resolved.toLowerCase() : resolved;
  };
  const uniqueClones = [...new Map([...clones].map((p) => [key(p), p])).values()];
  const targets = GLOBAL_COPIES.map(([source, dest, block]) => ({ source, dest: path.join(home, dest), block }));
  for (const repo of uniqueClones) {
    const hook = spawnSync("git", ["rev-parse", "--git-path", "hooks/pre-push"], { cwd: repo, encoding: "utf8", windowsHide: true, timeout: 1500 });
    const dest = hook.status === 0 ? path.resolve(repo, hook.stdout.trim()) : path.join(repo, ".git/hooks/pre-push");
    if (key(repo) === key(kit) || fs.existsSync(dest)) targets.push({ source: "templates/codex/pre-push", dest });
    for (const [source, rel, block] of PROJECT_COPIES) {
      const dest = path.join(repo, rel);
      const wiredArtifact = rel === ".codex/hooks/artifact-gauntlet.mjs" && fs.existsSync(path.join(repo, ".codex/hooks.json"));
      if (fs.existsSync(dest) || wiredArtifact) targets.push({ source, dest, block });
    }
    // Any other installed project hook with a known kit source is a copy too.
    const hooks = path.join(repo, ".codex/hooks");
    if (fs.existsSync(hooks)) for (const name of fs.readdirSync(hooks)) {
      const source = "templates/codex/" + name, dest = path.join(hooks, name);
      if (fs.existsSync(path.join(kit, source)) && !targets.some((row) => row.dest === dest)) targets.push({ source, dest });
    }
  }
  return { clones: uniqueClones, targets: [...new Map(targets.map((row) => [key(row.dest), row])).values()] };
}
export function verifyCopies(options) {
  const { clones, targets } = copyTargets(options);
  const rows = targets.map(({ source, dest, block }) => {
    try {
      const expected = sourceBytes(options.kit, source, block);
      let installed;
      try { installed = fs.readFileSync(dest); }
      catch (error) { return { source, block, dest, expectedSha256: sha(expected), verdict: error.code === "ENOENT" ? "missing" : "unreadable" }; }
      return { source, block, dest, expectedBytes: expected.length, installedBytes: installed.length,
        expectedSha256: sha(expected), installedSha256: sha(installed), verdict: driftKind(expected, installed) };
    } catch (error) { return { source, block, dest, verdict: "source failure: " + error.message }; }
  });
  return { clones, rows, failed: rows.filter((row) => row.verdict !== "identical").length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = { kit: path.resolve(TPL, "../.."), home: process.env.USERPROFILE || os.homedir(), repos: [], scanRoots: [] };
    const args = process.argv.slice(2);
    while (args.length) {
      const flag = args.shift(), value = args.shift();
      if (!value) throw new Error("missing value for " + flag);
      if (flag === "--kit") options.kit = path.resolve(value);
      else if (flag === "--home") options.home = path.resolve(value);
      else if (flag === "--repo") options.repos.push(value);
      else if (flag === "--scan-root") options.scanRoots.push(value);
      else throw new Error("unknown option " + flag);
    }
    const result = verifyCopies(options);
    console.log(JSON.stringify(result, null, 2));
    console.log(`codex copies: ${result.rows.length} checked, ${result.failed} drifted or missing`);
    process.exitCode = result.failed ? 1 : 0;
  } catch (error) { console.error("codex copies: FAILED: " + error.message); process.exitCode = 1; }
}
