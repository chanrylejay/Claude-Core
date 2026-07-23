// push-guard — PreToolUse hook: HARD-BLOCKS any `git push` unless the one-shot GO token exists.
// ⚠ COPY this file into the project's .claude/hooks/ and run it from THERE. The GO token resolves
// relative to THIS file (../PUSH_GO): run from Claude-Core it guards templates/, not your repo.
// Why: push -> auto-deploy -> LIVE. The house rule ("no push without Chan's explicit
// GO, each time") used to be vigilance-based; this makes it deterministic — a written rule advises,
// a hook blocks.
//
// Protocol: Chan gives the GO -> Claude creates `.claude/PUSH_GO` (any content) -> the very next push
// attempt consumes the token (deleted BEFORE the push runs — single-attempt, even if the push then
// fails or the session is interrupted; a failed push needs a fresh token, which is the safe default).
// Everything that isn't a git push passes through untouched. Fail-closed: if this script ERRORS,
// every matched shell command is blocked (exit 2) until the hook is fixed — loud and safe, never
// a silent allow.
//
// Wired in the project's .claude/settings.local.json (PreToolUse). The matcher MUST cover every
// shell path: "Bash|PowerShell|mcp__lean-ctx__ctx_shell|mcp__lean-ctx__shell" on lean-ctx machines,
// or a push through lean-ctx walks straight past the guard. Exit codes: 0 = allow,
// 2 = block (stderr is shown to Claude). Test: scripts/_pushguard_test.mjs (lives in the origin project, not in this kit).

import { existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TOKEN = join(dirname(fileURLToPath(import.meta.url)), "..", "PUSH_GO");

// Does this shell command contain a git push? Match each chained segment (;, &&, ||, |, newline) so
// `cd repo && git push` is caught but `git log --grep="push"` / `echo push` are not. A segment counts
// when it invokes git (word "git", optionally git.exe / a path to it) AND carries a `push` word arg
// OUTSIDE quoted strings/heredocs — a commit MESSAGE mentioning "push" must never trip the guard
// (live false positive, Jul 13: `git commit -m "... push stays GO-gated ..."` got blocked).
function isGitPush(command) {
  if (typeof command !== "string" || !command) return false;
  // Strip quoted spans from the WHOLE command first: a chain token inside a string ("a | git push")
  // used to break quote-pairing after splitting and false-block (header-truth audit, Jul 24 2026).
  // Then drop heredoc bodies — a real `git push` has `push` before any `<<`.
  const bare = command.replace(/"[^"]*"|'[^']*'/g, " ");
  const preHeredoc = bare.split(/<</)[0];
  return preHeredoc.split(/(?:&&|\|\||[;|\n])/).some((seg) => {
    return (
      /(?:^|[\s"'(`])(?:[\w.\/\\:-]*[\\\/])?git(?:\.exe)?["']?\s/i.test(" " + seg) &&
      /\spush(?:\s|$)/i.test(seg + " ")
    );
  });
}

let raw = "";
try {
  for await (const chunk of process.stdin) raw += chunk;
  const payload = JSON.parse(raw || "{}");
  const command = payload?.tool_input?.command ?? "";
  if (!isGitPush(command)) process.exit(0); // not a push — pass through

  if (existsSync(TOKEN)) {
    unlinkSync(TOKEN); // consume BEFORE the push — single-attempt token
    console.error("[push-guard] GO token consumed — push allowed (one-shot).");
    process.exit(0);
  }
  console.error(
    "[push-guard] BLOCKED: `git push` requires Chan's explicit GO. Pushing deploys straight to the " +
      "live site (auto-deploy from main). If Chan just gave the word, create the one-shot token " +
      "(.claude/PUSH_GO) and retry — it is consumed per attempt. Never create the token without his GO.",
  );
  process.exit(2);
} catch (err) {
  console.error(`[push-guard] hook error (${err?.message ?? err}) — failing CLOSED, push blocked.`);
  process.exit(2);
}
