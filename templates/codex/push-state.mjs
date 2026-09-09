// Read-only workspace push inspection. Presence outside the kit is reported, not certified.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const withoutCRLF = (bytes) => Buffer.from(bytes.filter((byte, i) => byte !== 13 || bytes[i + 1] !== 10));
export function driftKind(expected, installed) {
  if (expected.equals(installed)) return "identical";
  return withoutCRLF(expected).equals(withoutCRLF(installed)) ? "differs, line endings only" : "differs, content";
}

export function inspectPushState(cwd, kit) {
  const git = (...args) => spawnSync("git", args, { cwd, encoding: "utf8", windowsHide: true, timeout: 1500 });
  const top = git("rev-parse", "--show-toplevel");
  if (top.status !== 0) return { root: null, rows: [], hook: null, warnings: [], summary: "Push: not a repository." };
  const root = fs.realpathSync(top.stdout.trim());
  const kitRoot = fs.realpathSync(kit);
  const isKit = process.platform === "win32" ? root.toLowerCase() === kitRoot.toLowerCase() : root === kitRoot;
  const rows = [], warnings = [];
  const remotes = git("remote");
  if (remotes.status !== 0) warnings.push("could not read remotes");
  else for (const remote of remotes.stdout.trim().split(/\r?\n/).filter(Boolean)) {
    const urls = git("remote", "get-url", "--push", "--all", remote);
    if (urls.status !== 0) warnings.push("could not read push URLs for " + remote);
    else for (const url of urls.stdout.trim().split(/\r?\n/).filter(Boolean)) rows.push({ remote, url });
  }
  const disabled = rows.length > 0 && rows.every(({ url }) => url === "DISABLED") && !warnings.length;
  // Resolve from the root: relative core.hooksPath follows Git's hook working directory.
  const hookPathResult = spawnSync("git", ["rev-parse", "--git-path", "hooks/pre-push"], {
    cwd: root, encoding: "utf8", windowsHide: true, timeout: 1500,
  });
  let hook = null;
  if (hookPathResult.status !== 0) warnings.push("could not resolve the effective pre-push path");
  else {
    const hookPath = path.resolve(root, hookPathResult.stdout.trim());
    try {
      const stat = fs.statSync(hookPath);
      if (!stat.isFile() || !stat.size) throw new Error("empty or not a file");
      if (process.platform !== "win32") fs.accessSync(hookPath, fs.constants.X_OK);
      const bytes = fs.readFileSync(hookPath);
      hook = { path: hookPath, bytes: bytes.length, verdict: "installed; content not certified" };
      if (isKit) {
        const template = fs.readFileSync(path.join(kit, "templates/codex/pre-push"));
        hook.verdict = driftKind(template, bytes);
        if (hook.verdict !== "identical") warnings.push("kit pre-push " + hook.verdict + "; expected templates/codex/pre-push (lessons/platforms/codex.md)");
      }
    } catch (error) {
      if (isKit || error.code !== "ENOENT") warnings.push("pre-push missing or unreadable at " + hookPath + " (" + (error.code || error.message) + ")");
    }
  }
  if (isKit && !hook) warnings.push("kit gate is not the installed template named in lessons/platforms/codex.md");
  if (!isKit && !disabled && !hook) warnings.push("neither DISABLED push URLs nor an installed pre-push hook found");
  const summary = [
    "Push rows: " + (rows.map(({ remote, url }) => `${remote} ${url} (push)`).join("; ") || "none") + ".",
    "Push protection: " + (isKit ? "kit template check" : disabled ? "DISABLED push URLs" : "workspace hook check") +
      "; " + (hook ? hook.path + " [" + hook.verdict + "]" : "no installed pre-push hook") + ".",
    ...warnings.map((w) => "WARNING: " + w + "."),
  ].join(" ");
  return { root, isKit, rows, disabled, hook, warnings, summary };
}
