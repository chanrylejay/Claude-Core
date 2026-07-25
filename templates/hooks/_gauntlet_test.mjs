// Regression net for gauntlet-guard — plain node, no framework.
// Run:  node _gauntlet_test.mjs   (exit 0 = all pass, 1 = a failure)
// MANDATORY after ANY edit to gauntlet-guard.mjs. Pins CODE_EXT/UI_EXT classification,
// the RISK_PATH "never-match until adapted" default, and the three BEHAVIOURS that were
// broken on Jul 25 2026 (stale token, fail-open erasing the debt, filename entry guard).
import { CODE_EXT, UI_EXT, RISK_PATH } from "./gauntlet-guard.mjs";
import { mkdirSync, writeFileSync, existsSync, rmSync, copyFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
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
// RISK_PATH ships INERT and a project is EXPECTED to adapt it. These pins guard the SHIPPED
// default only. After adapting, run with RISK_PATH_ADAPTED=1 so the MANDATORY suite does not fail
// the very adaptation the hook invites — the adapted pattern is the project's to test.
if (process.env.RISK_PATH_ADAPTED) {
  console.log("  --  RISK_PATH_ADAPTED set: inert-default pins skipped (adapted pattern is project-owned)");
  check("adapted RISK_PATH is still a regex", RISK_PATH instanceof RegExp);
} else {
  check("risk never-matches a real path", !RISK_PATH.test("src/critical/money.ts"));
  check("risk never-matches an api route", !RISK_PATH.test("app/api/deploy/route.ts"));
  check("risk never-matches a bare name", !RISK_PATH.test("anything"));
}

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

// 3b. UX_SHOT defers the visual verdict — it must NOT clear the turn state.
//     Before the Jul 25 2026 fix it cleared the wall through the clean-exit branch, deleting
//     UI_TOUCHED, so Chan's owed verdict was forgotten by the next turn.
reset();
run("ui-track", edit("src/page.html"));
writeFileSync(tok("UX_SHOT"), "saved");
const shotRun = run("done-wall", {});
check("UX_SHOT lets the turn end", shotRun.status === 0);
check("UX_SHOT KEEPS the UI ledger (verdict still owed)", existsSync(join(CD, "UI_TOUCHED")));
check("UX_SHOT survives the turn", existsSync(tok("UX_SHOT")));
check("UX_SHOT says the verdict is owed", /OWED/.test(shotRun.stderr || ""));
check("UX_SHOT re-fires next turn", run("done-wall", {}).status === 0 && existsSync(join(CD, "UI_TOUCHED")));
// and a real UX_OK from Chan DOES close it
reset();
run("ui-track", edit("src/page.html"));
writeFileSync(tok("UX_OK"), "chan said CLEAN");
check("UX_OK closes it properly", run("done-wall", {}).status === 0 && !existsSync(join(CD, "UI_TOUCHED")));

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

// ── 7. The ledger only sees Edit / Write / ctx_patch. A file changed through the SHELL — sed -i,
//    a formatter, codegen, git checkout, an applied patch — never reached uiTrack, so the ledger
//    read empty and the turn ended clean over unreviewed work. Worse, a shell edit made AFTER
//    GATE_OK existed left the token standing, defeating the invalidation fix (audit Jul 25 2026).
//    doneWall now asks git what actually changed. Best-effort: no repo or no git degrades to the
//    old behaviour rather than wedging the turn.
function gitRepo() {
  rmSync(SB, { recursive: true, force: true });
  mkdirSync(join(CD, "hooks"), { recursive: true });
  mkdirSync(join(SB, "src"), { recursive: true });
  copyFileSync(HOOK_SRC, HOOK);
  try {
    execSync("git init -q", { cwd: SB, stdio: "ignore" });
    // commit the baseline so only the change under test appears, as in a real repo
    execSync("git add -A && git -c user.email=t@t -c user.name=t commit -q -m base --allow-empty", { cwd: SB, stdio: "ignore" });
    return true;
  } catch { return false; }
}
if (gitRepo()) {
  writeFileSync(join(SB, "src", "sneaky.ts"), "export const x = 1;\n");
  check("shell-made code change is caught by the done-wall", run("done-wall", {}).status === 2);

  gitRepo();
  writeFileSync(join(SB, "src", "sneaky.ts"), "export const x = 1;\n");
  writeFileSync(tok("GATE_OK"), "net-runner ran");
  // A file discovered through git was never seen by the agent, so a token created BEFORE it is
  // stale and must be invalidated — the same invariant uiTrack already enforces. The old
  // expectation here pinned the opposite (token survives a file the agent never saw), which is
  // exactly the defect T2-F3 reported. The net had been certifying the bug.
  check("a git-discovered file invalidates a pre-existing token", run("done-wall", {}).status === 2);
  check("and that token is actually gone", !existsSync(tok("GATE_OK")));
  // Next turn: the file is already ledgered, so re-running the agent clears it for good and it
  // does NOT re-invalidate every turn — that would be the perpetual-nag mode.
  writeFileSync(tok("GATE_OK"), "net-runner re-ran, now seeing the file");
  check("re-running the agent clears it on the next turn", run("done-wall", {}).status === 0);

  gitRepo();
  writeFileSync(join(SB, "notes.md"), "# hello\n");
  check("a markdown change does not trip the code gate", run("done-wall", {}).status === 0);

  // THE COMMITTED CASE (T2-F2). Commits are free and automatic by design here, so a shell edit
  // that gets committed leaves a CLEAN working tree and git status reported nothing — the turn
  // ended over unreviewed work, which is the exact outcome the backstop was added to stop.
  // Verified Jul 25 2026: exit 0 before the turn-base diff, exit 2 after.
  gitRepo();
  run("spec-nudge", {}); // records the turn base
  writeFileSync(join(SB, "src", "committed.ts"), "export const y = 2;\n");
  try {
    execSync("git add -A && git -c user.email=t@t -c user.name=t commit -q -m shelledit", { cwd: SB, stdio: "ignore" });
    check("a shell edit that was COMMITTED is still caught", run("done-wall", {}).status === 2);
  } catch {
    console.log("  --  commit failed in the sandbox, skipped the committed-case check");
  }
} else {
  console.log("  --  git not available, skipped the git-backed ledger checks");
}

// no git repo must never WEDGE a turn — and must not go quiet either. Without git the shell-edit
// ledger is blind, which is the exact hole the git check was added to close. This file already
// settled the shape one section up ("failing open must DEFER the review, never erase it"), and
// that rule carries no scope limiting it to the nag branch.
reset();
const noGit = run("done-wall", {});
check("no git repo still lets the turn end", noGit.status === 0);
check("no git repo SAYS the shell-edit check was skipped", /skipp|unverified|no git/i.test(noGit.stderr || ""));

rmSync(SB, { recursive: true, force: true });

console.log("\ngauntlet-guard: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
