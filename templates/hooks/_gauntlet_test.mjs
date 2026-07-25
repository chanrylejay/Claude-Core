// Regression net for gauntlet-guard — plain node, no framework.
// Run:  node _gauntlet_test.mjs   (exit 0 = all pass, 1 = a failure)
// MANDATORY after ANY edit to gauntlet-guard.mjs. Pins CODE_EXT/UI_EXT classification,
// the RISK_PATH "never-match until adapted" default, and the three BEHAVIOURS that were
// broken on Jul 25 2026 (stale token, fail-open erasing the debt, filename entry guard).
import { CODE_EXT, UI_EXT, RISK_PATH } from "./gauntlet-guard.mjs";
import { mkdirSync, writeFileSync, existsSync, rmSync, copyFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

let pass = 0, fail = 0;
function check(desc, cond) {
  if (cond) { pass += 1; }
  else { fail += 1; console.error("FAIL: " + desc); }
}

// CODE_EXT: code files yes; docs/markup/data no
check("code: src/foo.ts", CODE_EXT.test("src/foo.ts"));
check("code: foo.tsx", CODE_EXT.test("foo.tsx"));
check("code: a/b.js", CODE_EXT.test("a/b.js"));
check("code: x.mjs", CODE_EXT.test("x.mjs"));
check("code: style.scss", CODE_EXT.test("style.scss"));
check("code NOT README.md", !CODE_EXT.test("README.md"));
check("code NOT page.html", !CODE_EXT.test("page.html"));
check("code NOT data.json", !CODE_EXT.test("data.json"));
check("code NOT img.png", !CODE_EXT.test("img.png"));

// UI_EXT: markup/style/components yes; pure logic no
check("ui: foo.tsx", UI_EXT.test("foo.tsx"));
check("ui: page.html", UI_EXT.test("page.html"));
check("ui: comp.vue", UI_EXT.test("comp.vue"));
check("ui: comp.svelte", UI_EXT.test("comp.svelte"));
check("ui: style.css", UI_EXT.test("style.css"));
check("ui NOT logic.ts", !UI_EXT.test("logic.ts"));
check("ui NOT logic.js", !UI_EXT.test("logic.js"));
check("ui NOT script.mjs", !UI_EXT.test("script.mjs"));
check("ui NOT notes.md", !UI_EXT.test("notes.md"));

// RISK_PATH: never matches a real path until a project adapts it
check("risk never-matches a real path", !RISK_PATH.test("src/critical/money.ts"));
check("risk never-matches an api route", !RISK_PATH.test("app/api/deploy/route.ts"));
check("risk never-matches a bare name", !RISK_PATH.test("anything"));

// ── BEHAVIOUR (sandboxed: a throwaway repo, never this one) ──────────────────────────────────
const HOOK_SRC = join(dirname(fileURLToPath(import.meta.url)), "gauntlet-guard.mjs");
const SB = join(tmpdir(), "gauntlet-guard-test-sandbox");
const CD = join(SB, ".claude");
const HOOK = join(CD, "hooks", "gauntlet-guard.mjs");

function reset() {
  rmSync(SB, { recursive: true, force: true });
  mkdirSync(join(CD, "hooks"), { recursive: true });
  mkdirSync(join(SB, "src"), { recursive: true });
  copyFileSync(HOOK_SRC, HOOK);
}
function run(mode, payload, hookPath = HOOK) {
  return spawnSync(process.execPath, [hookPath, mode], {
    input: JSON.stringify(payload), encoding: "utf8",
  });
}
const edit = (rel) => ({ tool_input: { file_path: join(SB, rel) } });
const tok = (n) => join(CD, n);

// 1. a token created mid-turn must NOT cover work done after it
reset();
run("ui-track", edit("src/a.ts"));
writeFileSync(tok("GATE_OK"), "ran");
run("ui-track", edit("src/b.ts"));
check("new code edit invalidates GATE_OK", !existsSync(tok("GATE_OK")));

reset();
run("ui-track", edit("src/a.tsx"));
writeFileSync(tok("UX_OK"), "looked");
writeFileSync(tok("UX_SHOT"), "saved");
run("ui-track", edit("src/b.tsx"));
check("new UI edit invalidates UX_OK", !existsSync(tok("UX_OK")));
check("new UI edit invalidates UX_SHOT", !existsSync(tok("UX_SHOT")));

// 2. the wall must actually block, and clear when the token is present
reset();
run("ui-track", edit("src/a.ts"));
check("done-wall blocks with an untokened edit", run("done-wall", {}).status === 2);
reset();
run("ui-track", edit("src/a.ts"));
writeFileSync(tok("GATE_OK"), "ran");
check("done-wall passes with a valid token", run("done-wall", {}).status === 0);

// 3. failing open must DEFER the review, never erase it
reset();
run("ui-track", edit("src/a.ts"));
writeFileSync(join(CD, ".gauntlet_nag"), "3");
const openRun = run("done-wall", {});
check("fail-open lets the turn end", openRun.status === 0);
check("fail-open KEEPS the touched ledger (debt survives)", existsSync(join(CD, "CODE_TOUCHED")));
check("fail-open says the pass is still owed", /STILL OWED/.test(openRun.stderr || ""));
check("fail-open re-blocks on the next turn", run("done-wall", {}).status === 2);

// 4. a copy saved under another name must still run (it used to silently disable everything)
reset();
const RENAMED = join(CD, "hooks", "gauntlet.hook.mjs");
copyFileSync(HOOK, RENAMED);
run("ui-track", edit("src/a.ts"), RENAMED);
check("renamed copy still ledgers", existsSync(join(CD, "CODE_TOUCHED")));

// 5. GAUNTLET_OFF still disables everything (Chan's escape hatch must keep working)
reset();
writeFileSync(tok("GAUNTLET_OFF"), "off");
run("ui-track", edit("src/a.ts"));
check("GAUNTLET_OFF disables ledgering", !existsSync(join(CD, "CODE_TOUCHED")));

// 6. out-of-scope files are never ledgered (the perpetual-nag failure mode)
reset();
run("ui-track", { tool_input: { file_path: join(tmpdir(), "somewhere-else", "x.ts") } });
check("out-of-repo edit is not ledgered", !existsSync(join(CD, "CODE_TOUCHED")));

rmSync(SB, { recursive: true, force: true });

console.log("\ngauntlet-guard: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
