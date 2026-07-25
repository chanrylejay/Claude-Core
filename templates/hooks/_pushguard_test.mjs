// Regression net for push-guard.isGitPush — plain node, no framework.
// Run:  node _pushguard_test.mjs   (exit 0 = all pass, 1 = a failure)
// Optional arg: a path to a candidate push-guard.mjs to test instead of the sibling one.
// MANDATORY after ANY edit to push-guard.mjs. Pins the documented false-positive fixes AND the
// five bypasses found on Jul 25 2026 — every one of them was a verified silent ALLOW of a live push.
import { pathToFileURL } from "node:url";
const target = process.argv[2] ? pathToFileURL(process.argv[2]).href : "./push-guard.mjs";
const { isGitPush } = await import(target);

let pass = 0, fail = 0;
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
check("empty command", "", false);

console.log("\npush-guard isGitPush: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
