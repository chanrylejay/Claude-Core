// Regression net for push-guard.isGitPush — plain node, no framework.
// Run:  node _pushguard_test.mjs   (exit 0 = all pass, 1 = a failure)
// MANDATORY after ANY edit to push-guard.mjs. Pins the documented false-positive fixes.
import { isGitPush } from "./push-guard.mjs";

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

// FALSE — the documented false positives must pass through
check("commit MESSAGE containing push", 'git commit -m "push stays GO-gated"', false);
check("quoted chain-token with git push inside a string", 'echo "a | git push"', false);
check("git log grep push", 'git log --grep="push"', false);
check("echo push", "echo push", false);
check("git status", "git status", false);
check("empty command", "", false);

console.log("\npush-guard isGitPush: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
