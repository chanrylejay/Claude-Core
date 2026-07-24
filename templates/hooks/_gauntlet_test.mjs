// Regression net for gauntlet-guard classifiers — plain node, no framework.
// Run:  node _gauntlet_test.mjs   (exit 0 = all pass, 1 = a failure)
// MANDATORY after ANY edit to gauntlet-guard.mjs. Pins CODE_EXT/UI_EXT classification
// and the RISK_PATH "never-match until adapted" default.
import { CODE_EXT, UI_EXT, RISK_PATH } from "./gauntlet-guard.mjs";

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

console.log("\ngauntlet-guard classifiers: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
