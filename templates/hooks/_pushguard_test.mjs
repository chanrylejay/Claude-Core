// Regression net for push-guard.isGitPush — plain node, no framework.
// Run:  node _pushguard_test.mjs   (exit 0 = all pass, 1 = a failure)
// Optional arg: a path to a candidate push-guard.mjs to test instead of the sibling one.
// MANDATORY after ANY edit to push-guard.mjs. Pins the documented false-positive fixes AND the
// five bypasses found on Jul 25 2026 — every one of them was a verified silent ALLOW of a live push.
import { pathToFileURL, fileURLToPath as fileURL } from "node:url";
import { readFileSync } from "node:fs";
import { dirname as dirName, join as joinPath, resolve as resolvePath } from "node:path";
// ONE source of truth for what is under test. The structural assertions further down must read
// the SAME file the behaviour checks import; they used to read the sibling unconditionally, so
// candidate mode silently certified the sibling (audit Jul 25 2026).
const UNDER_TEST = process.argv[2]
  ? resolvePath(process.argv[2])
  : joinPath(dirName(fileURL(import.meta.url)), "push-guard.mjs");
console.log("testing: " + UNDER_TEST);
const { isGitPush } = await import(pathToFileURL(UNDER_TEST).href);

let pass = 0, fail = 0;
function assertTrue(desc, cond) {
  if (cond) { pass += 1; } else { fail += 1; console.error("FAIL: " + desc); }
}
function check(desc, cmd, expected) {
  const got = isGitPush(cmd);
  if (got === expected) { pass += 1; }
  else { fail += 1; console.error("FAIL: " + desc + "\n  cmd: " + JSON.stringify(cmd) + "\n  expected " + expected + ", got " + got); }
}

// TRUE — real pushes must be caught
check("plain git push", "git push", true);
check("git push origin main", "git push origin main", true);
check("cd repo && git push", "cd /c/repo && git push", true);
check("git.exe push", "git.exe push origin main", true);
check("path-to-git push", "/usr/bin/git push", true);
check("semicolon chain then push", "cd repo; git push --force", true);

// TRUE — the five bypasses (all verified ALLOW before the Jul 25 2026 fix)
check("bash -c wrapper", 'bash -c "git push"', true);
check("sh -c wrapper, single quotes", "sh -c 'git push origin main'", true);
check("powershell -Command wrapper", 'powershell -Command "git push"', true);
check("cmd /c wrapper", 'cmd /c "git push"', true);
check("eval wrapper", 'eval "git push"', true);
check("quoted subcommand", 'git "push" origin main', true);
check("quoted subcommand, single quotes", "git 'push' origin main", true);
check("heredoc then push", "git commit -F - <<EOF\nmsg\nEOF\ngit push", true);
check("heredoc then push, quoted delimiter", "cat > f <<'EOF'\nbody\nEOF\ngit push", true);
check("nested runner", 'bash -c "sh -c \'git push\'"', true);
check("unterminated heredoc fails CLOSED", "git commit -F - <<EOF\nnever closed", true);
// command substitution and subshells — five more verified ALLOWs, found by PED on Jul 25 2026
// AFTER the first round of bypass fixes had already shipped. Cause: the push half required
// whitespace or end-of-string after "push", and the next character here is ) or a backtick.
check("command substitution", "echo $(git push)", true);
check("command substitution, backticks", "echo `git push`", true);
check("assignment from substitution", "x=$(git push) && echo done", true);
check("substitution inside double quotes (it executes)", 'echo "$(git push)"', true);
check("subshell parens", "(cd repo && git push)", true);
check("brace group", "{ git push; }", true);
// a heredoc fed to a SHELL is executed, so its body is not data
check("bash fed by heredoc executes the body", "bash <<EOF\ngit push\nEOF", true);

// FALSE — the documented false positives must pass through
check("commit MESSAGE containing push", 'git commit -m "push stays GO-gated"', false);
check("one-word commit message push", 'git commit -m "push"', false);
check("quoted chain-token with git push inside a string", 'echo "a | git push"', false);
check("git log grep push", 'git log --grep="push"', false);
check("echo push", "echo push", false);
check("git status", "git status", false);
check("heredoc BODY mentioning push is data, not a command", "cat > doc.md <<EOF\nrun git push later\nEOF", false);
// caught live Jul 25 2026: the fix for the runner bypass blocked a commit whose MESSAGE quoted one
check("commit message heredoc quoting a runner example", 'git commit -q -m "$(cat <<\'EOF\'\n  bash -c "git push"   ALLOW -> blocked\nEOF\n)" && git log --oneline -1', false);
check("shift-looking text in a quoted string", 'echo "a << b"', false);
check("real git subcommands that merely start with push are not pushes", "git push-to-checkout", false);
check("empty command", "", false);

// ── PAYLOAD SHAPES. isGitPush only ever sees a string; the ENTRY BLOCK decides which strings
// it gets handed. It used to read tool_input.command and treat a miss as a pass, so a command
// nested anywhere else walked through with no inspection, no block, and no token consumed —
// leaving the GO valid for the rest of its 30-minute window.
// Verified Jul 25 2026: ctx_call({name:"ctx_execute", arguments:{command:"<a push>"}}) exited 0
// on the old hook and exits 2 now. ctx_execute is lean-ctx's own documented shell path and is
// reachable ONLY through ctx_call, so the matcher must list ctx_call as well.
const SRC = readFileSync(UNDER_TEST, "utf8");
assertTrue("entry block walks ALL of tool_input, not one fixed key", /function walk/.test(SRC));
assertTrue("entry block no longer reads only tool_input.command", !/const command = payload\?\.tool_input\?\.command/.test(SRC));
assertTrue("header names ctx_call in the required matcher", /mcp__lean-ctx__ctx_call/.test(SRC));

console.log("\npush-guard isGitPush: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
