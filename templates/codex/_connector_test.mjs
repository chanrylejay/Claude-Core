// Full offline path: fixture event -> configured matcher -> configured launcher -> runner -> guard -> exact decision.
// Captured reads certify Sep 7 ingress names. Synthetic mutations cover failure directions; no connector runs.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TPL = path.dirname(fileURLToPath(import.meta.url));
const pad = fs.mkdtempSync(path.join(os.tmpdir(), "codex-connector-"));
const hooks = path.join(pad, ".codex/hooks");
fs.mkdirSync(hooks, { recursive: true });
for (const file of ["codex-guard-launcher.mjs", "codex-guard-runner.mjs", "codex-guard.mjs", "connector-reads.json"])
  fs.copyFileSync(path.join(TPL, file), path.join(hooks, file));
fs.copyFileSync(path.join(TPL, "../hooks/push-guard.mjs"), path.join(hooks, "push-guard.mjs"));
const configBytes = fs.readFileSync(path.join(TPL, "hooks.json"));
fs.writeFileSync(path.join(pad, ".codex/hooks.json"), configBytes);
const token = path.join(pad, ".codex/PUSH_GO");
fs.writeFileSync(token, "connector tests must never inspect or consume this token\n");
const sentinel = fs.readFileSync(token);
let pass = 0, fail = 0;
const ok = (label, value) => { if (value) pass++; else { fail++; console.error("FAIL: " + label); } };
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const deny = (r) => {
  try {
    const h = JSON.parse(r.stdout).hookSpecificOutput;
    return r.status === 0 && r.stderr === "" && h.hookEventName === "PreToolUse" && h.permissionDecision === "deny" &&
      typeof h.permissionDecisionReason === "string" && h.permissionDecisionReason.trim().length > 0 &&
      r.stdout === JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: h.permissionDecisionReason } }) + "\n";
  } catch { return false; }
};
function dispatch(event, raw = JSON.stringify(event), config = JSON.parse(configBytes)) {
  const routes = config.hooks.PreToolUse.filter(({ matcher }) => !matcher || matcher === "*" || new RegExp(matcher).test(event.tool_name));
  if (routes.length !== 1) return { routed: false, routes: routes.length };
  const commands = routes[0].hooks;
  if (commands.length !== 1) throw new Error("expected one configured hook");
  const command = commands[0].command.match(/^node "C:\/Users\/Chanryle\/\.codex\/hooks\/([^"/]+)"( --connector)?$/);
  if (!command) throw new Error("unrecognized configured command; update the path adapter explicitly");
  const result = spawnSync(process.execPath, [path.join(hooks, command[1]), ...(command[2] ? ["--connector"] : [])], {
    input: raw, encoding: "utf8", windowsHide: true, timeout: 8000,
    env: { ...process.env, USERPROFILE: pad, HOME: pad },
  });
  return { routed: true, ...result };
}
try {
  const policy = JSON.parse(fs.readFileSync(path.join(TPL, "connector-reads.json")));
  const manifest = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures/manifest.json")));
  const listed = [...manifest.fixtures.map((f) => f.file), manifest.syntheticCases, manifest.syntheticBashCases, "manifest.json"].sort();
  ok("every fixture JSON is registered", JSON.stringify(listed) === JSON.stringify(fs.readdirSync(path.join(TPL, "fixtures")).filter((f) => f.endsWith(".json")).sort()));
  for (const fixture of manifest.fixtures) {
    const raw = fs.readFileSync(path.join(TPL, "fixtures", fixture.file));
    const event = JSON.parse(raw);
    const r = dispatch(event, raw);
    ok(fixture.sourceKind + " fixture routes: " + fixture.file, r.routed);
    ok(fixture.file + " decision " + fixture.expected, r.routed && (fixture.expected === "deny" ? deny(r) : r.status === 0 && r.stderr === "" && r.stdout === "{}\n"));
    if (fixture.sourceKind === "captured") {
      const row = policy.operations.find((p) => p.fixture === "fixtures/" + fixture.file);
      ok(fixture.file + " has exact name/hash/version/date provenance", row && row.toolName === event.tool_name && sha(raw) === row.fixtureSha256 &&
        /^codex-cli \d+\.\d+\.\d+/.test(row.codexVersion) && /^\d{4}-\d\d-\d\dT.*Z$/.test(row.capturedAtUtc) && /^[a-f0-9]{64}$/.test(row.rawSha256));
    } else ok(fixture.file + " is explicitly synthetic", fixture.sourceKind === "synthetic");
  }
  for (const row of policy.operations) ok("every read has a registered captured fixture: " + row.toolName,
    manifest.fixtures.some((f) => f.sourceKind === "captured" && "fixtures/" + f.file === row.fixture));
  const { cases } = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", manifest.syntheticCases)));
  for (const fixture of cases) {
    const r = dispatch(fixture.event, fixture.wireRaw ?? JSON.stringify(fixture.event));
    ok("synthetic routes: " + fixture.id, r.routed);
    ok("synthetic decision: " + fixture.id, r.routed && (fixture.expected === "deny" ? deny(r) : r.status === 0 && r.stderr === "" && r.stdout === "{}\n"));
    if (fixture.expected === "deny" && !fixture.wireRaw) ok("deny names operation and review file: " + fixture.id,
      r.stdout.includes(fixture.event.tool_name.replace(/\n/g, "\\n")) && r.stdout.includes("templates/codex/connector-reads.json"));
  }
  const event = { hook_event_name: "PreToolUse", tool_name: policy.operations[0].toolName, tool_input: {} };
  for (const target of ["codex-guard-runner.mjs", "codex-guard.mjs"]) {
    const file = path.join(hooks, target), original = fs.readFileSync(file);
    for (const [label, source] of [
      ["missing", null], ["syntax error", "not valid JavaScript !!"], ["crash", "throw new Error('fault injection');"],
      ["empty output", ""], ["malformed JSON", "process.stdout.write('{');"],
      ["unrecognized output", "process.stdout.write(JSON.stringify({allowed:true}));"],
      ["invalid allow", "process.stdout.write(JSON.stringify({hookSpecificOutput:{permissionDecision:'allow'}}));"],
      ["extra keys", "process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'deny',permissionDecisionReason:'test',extra:true}}));"],
      ["stderr on success", "process.stderr.write('bad');process.stdout.write('{}\\n');"],
      ["timeout", "setInterval(()=>{}, 1000);"],
    ]) {
      if (source === null) fs.unlinkSync(file); else fs.writeFileSync(file, source);
      const r = dispatch(event);
      ok(target + " " + label + " denies through configured wiring", r.routed && deny(r));
      ok(target + " " + label + " names a failure", /failed|timed out|invalid|unexpected|could not/.test(r.stdout));
      fs.writeFileSync(file, original);
    }
  }
  const file = path.join(hooks, "connector-reads.json"), original = fs.readFileSync(file);
  for (const [label, data] of [["missing", null], ["bad JSON", "{"], ["bad schema", "{}"], ["duplicate", JSON.stringify({ ...policy, operations: [policy.operations[0], policy.operations[0]] })]]) {
    if (data === null) fs.unlinkSync(file); else fs.writeFileSync(file, data);
    const r = dispatch(event);
    ok("policy " + label + " denies a captured read with fix path", deny(r) && r.stdout.includes("connector-reads.json"));
    fs.writeFileSync(file, original);
  }
  const bash = { hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command: "git status" } };
  for (const target of ["codex-guard-runner.mjs", "codex-guard.mjs"]) {
    const file = path.join(hooks, target), original = fs.readFileSync(file);
    fs.writeFileSync(file, "throw new Error('Bash fault injection');");
    const r = dispatch(bash);
    ok("Bash " + target + " preserves its prior failure direction", target === "codex-guard.mjs" ? deny(r) :
      r.status === 0 && r.stderr === "" && !deny(r) && /non-blocking/.test(JSON.parse(r.stdout).hookSpecificOutput.additionalContext));
    fs.writeFileSync(file, original);
  }
  {
    const file = path.join(hooks, "codex-guard.mjs"), original = fs.readFileSync(file);
    fs.writeFileSync(file, "process.stderr.write('diagnostic');process.stdout.write('{}\\n');");
    const r = dispatch(bash);
    ok("Bash successful guard stderr keeps its previous passthrough", r.status === 0 && r.stdout === "{}\n" && r.stderr === "");
    fs.writeFileSync(file, original);
  }
  const narrow = JSON.parse(configBytes);
  narrow.hooks.PreToolUse = [{ ...narrow.hooks.PreToolUse[1], matcher: "Bash|mcp__codex_apps__(neon|vercel|github)__.*" }];
  ok("old matcher is exposed by the bare-name routing fixture", !dispatch({ ...event, tool_name: "neon__run_sql" }, undefined, narrow).routed);
  ok("connector fixtures leave the sandbox GO token byte-identical", fs.readFileSync(token).equals(sentinel));
  // Bash decisions use the same event/matcher/launcher/runner/guard path. Commands are data:
  // never execute git, mutate real configuration, or create a real GO during these checks.
  const repo = path.join(pad, "repo"), other = path.join(pad, "x"), spaced = path.join(pad, "space repo");
  for (const dir of [repo, other, spaced]) fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
  const bashCases = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures", manifest.syntheticBashCases)));
  ok("Bash cases explicitly synthetic", bashCases.sourceKind === "synthetic");
  for (const fixture of bashCases.cases) {
    fs.rmSync(token, { force: true });
    const repos = { repo, other, spaced };
    if (fixture.token === "valid") fs.writeFileSync(token, JSON.stringify({ repo: repos[fixture.tokenRepo ?? "repo"], issuedAt: new Date().toISOString() }));
    const before = fs.existsSync(token) ? fs.readFileSync(token) : null;
    const event = structuredClone(fixture.event);
    event.cwd = repo;
    event.tool_input.command = event.tool_input.command.replace(/@(repo|other|spaced)@/g, (_, key) => repos[key].replace(/\\/g, "/"));
    const r = dispatch(event);
    ok("synthetic Bash routes: " + fixture.id, r.routed);
    const decisionOk = fixture.expected === "deny" ? deny(r) && r.stdout.includes(fixture.reasonIncludes) : r.status === 0 && r.stderr === "" && r.stdout === "{}\n";
    ok("synthetic Bash decision and reason: " + fixture.id, r.routed && decisionOk);
    if (fixture.expectedToken === "claimed") {
      let claimed = false;
      try { claimed = typeof JSON.parse(fs.readFileSync(token)).claimedAt === "string"; } catch {}
      ok("synthetic Bash claims one sandbox token: " + fixture.id, claimed);
    } else ok("synthetic Bash token unchanged: " + fixture.id, before ? fs.existsSync(token) && fs.readFileSync(token).equals(before) : !fs.existsSync(token));
  }
} finally {
  // Only this net's fixed mkdtemp root is removed; no live machine state is touched.
  if (path.dirname(path.resolve(pad)) !== path.resolve(os.tmpdir()) || !path.basename(pad).startsWith("codex-connector-")) throw new Error("unsafe cleanup target");
  fs.rmSync(pad, { recursive: true, force: true });
}
console.log(`codex connectors: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
