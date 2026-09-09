// Byte-copy and checkout regressions. Mutations stay under this net's mkdtemp root.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { GLOBAL_COPIES, PROJECT_COPIES, copyTargets, sourceBytes, verifyCopies } from "./verify-copies.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pad = fs.mkdtempSync(path.join(os.tmpdir(), "codex-copies-"));
const kit = path.join(pad, "kit"), home = path.join(pad, "home"), other = path.join(pad, "other");
const options = { kit, home, repos: [other] };
let pass = 0, fail = 0;
const ok = (label, value) => { if (value) pass++; else { fail++; console.error("FAIL: " + label); } };
const put = (p, bytes) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, bytes); };
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", windowsHide: true });
  if (r.status !== 0) throw new Error("fixture git failed: " + r.stderr);
  return r;
};
try {
  for (const repo of [kit, other]) { fs.mkdirSync(repo, { recursive: true }); git(repo, "init", "-q"); }
  const fixtures = fs.readdirSync(path.join(root, "templates/codex/fixtures")).filter((f) => f.endsWith(".json")).map((f) => "templates/codex/fixtures/" + f);
  const sources = [...new Set([...GLOBAL_COPIES, ...PROJECT_COPIES].map(([source]) => source).concat("templates/codex/pre-push", ".gitattributes", ...fixtures))];
  for (const source of sources) put(path.join(kit, source), fs.readFileSync(path.join(root, source)));
  put(path.join(other, ".git/hooks/pre-push"), sourceBytes(kit, "templates/codex/pre-push"));
  const { targets } = copyTargets(options);
  for (const row of targets) put(row.dest, sourceBytes(kit, row.source, row.block));
  ok("every expected copy is byte-identical", verifyCopies(options).failed === 0);
  for (const row of targets) {
    const expected = fs.readFileSync(row.dest);
    fs.writeFileSync(row.dest, expected.toString("utf8").replace(/\n/g, "\r\n"));
    let result = verifyCopies(options);
    ok(row.dest + " CRLF is classified and fails", result.failed === 1 && result.rows.find((r) => r.dest === row.dest).verdict === "differs, line endings only");
    fs.writeFileSync(row.dest, Buffer.concat([expected, Buffer.from("!")]));
    result = verifyCopies(options);
    ok(row.dest + " content drift fails", result.failed === 1 && result.rows.find((r) => r.dest === row.dest).verdict === "differs, content");
    fs.writeFileSync(row.dest, expected);
  }
  const doorway = path.join(home, ".codex/AGENTS.md"), expected = fs.readFileSync(doorway);
  fs.writeFileSync(doorway, expected.toString("utf8").replace(/\u2014/g, "\u00e2\u20ac\u201d"));
  ok("garbled doorway dashes fail as content", verifyCopies(options).rows.find((r) => r.dest === doorway).verdict === "differs, content");
  fs.writeFileSync(doorway, expected.toString("utf8"), "utf16le");
  ok("PowerShell UTF-16 rewrite fails as content", verifyCopies(options).failed === 1);
  fs.unlinkSync(doorway);
  ok("missing required copy fails", verifyCopies(options).rows.find((r) => r.dest === doorway).verdict === "missing");
  fs.writeFileSync(doorway, expected);
  const projectConfig = path.join(other, ".codex/hooks.json");
  put(projectConfig, sourceBytes(kit, "templates/codex/project-hooks.json"));
  ok("a wired but missing project hook fails", verifyCopies(options).rows.some((r) => r.dest === path.join(other, ".codex/hooks/artifact-gauntlet.mjs") && r.verdict === "missing"));
  put(path.join(other, ".codex/hooks/artifact-gauntlet.mjs"), sourceBytes(kit, "templates/codex/artifact-gauntlet.mjs"));
  ok("project copies are included once installed", verifyCopies(options).failed === 0);
  if (process.platform === "win32") ok("Windows path casing never double-counts copies", copyTargets({ ...options, repos: [other, other.toUpperCase(), kit.toLowerCase()] }).targets.length === copyTargets(options).targets.length);
  // Index and checkout only, with no commit or remote. Proves eol=lf defeats core.autocrlf=true.
  git(kit, "-c", "core.autocrlf=true", "add", "--", ...sources);
  const checkout = path.join(pad, "checkout"); fs.mkdirSync(checkout);
  git(kit, "-c", "core.autocrlf=true", "checkout-index", "--all", "--prefix=" + checkout.replace(/\\/g, "/") + "/");
  for (const source of sources.filter((s) => s !== ".gitattributes")) ok("autocrlf checkout preserves " + source,
    fs.readFileSync(path.join(checkout, source)).equals(fs.readFileSync(path.join(kit, source))));
  // A template-only run never certifies an installed machine.
  const liveHome = process.env.USERPROFILE || os.homedir();
  if (!process.argv.includes("--template-only") && fs.existsSync(path.join(liveHome, ".codex/hooks.json"))) {
    const live = verifyCopies({ kit: root, home: liveHome });
    ok("LIVE installed copies match (" + live.rows.length + " checked)", live.failed === 0);
    if (live.failed) for (const row of live.rows.filter((r) => r.verdict !== "identical")) console.error(row.dest + ": " + row.verdict);
  } else console.log("TEMPLATE MODE: Codex installation absent or --template-only requested; no machine certification.");
} finally {
  if (path.dirname(path.resolve(pad)) !== path.resolve(os.tmpdir()) || !path.basename(pad).startsWith("codex-copies-")) throw new Error("unsafe cleanup target");
  fs.rmSync(pad, { recursive: true, force: true });
}
console.log(`codex copies: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
