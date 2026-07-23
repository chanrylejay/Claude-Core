#!/usr/bin/env node
// apply-deepseek-switch.mjs — one-shot: point Claude Code (CLI + VS Code extension) at DeepSeek.
// Run the DAY Claude access dies, not before: the switch takes effect on the next VS Code start.
// Usage: node apply-deepseek-switch.mjs sk-YOURDEEPSEEKKEY [--dry-run]
// The key is NEVER stored in this repo: it goes only into ~/.claude/settings.json (local) and
// user-level env vars. Playbook: ../workflow/switch-to-deepseek.md
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

const key = process.argv[2];
const dry = process.argv.includes("--dry-run");
if (!key || !key.startsWith("sk-")) {
  console.error("Usage: node apply-deepseek-switch.mjs sk-YOURDEEPSEEKKEY [--dry-run]");
  process.exit(1);
}

const S = (process.env.USERPROFILE || "C:/Users/Chanryle") + "/.claude/settings.json";
// Verified against DeepSeek's official Claude Code guide, Jul 24 2026.
const ENV = {
  ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
  ANTHROPIC_AUTH_TOKEN: key,
  ANTHROPIC_MODEL: "deepseek-v4-pro",
  ANTHROPIC_DEFAULT_OPUS_MODEL: "deepseek-v4-pro",
  ANTHROPIC_DEFAULT_SONNET_MODEL: "deepseek-v4-pro",
  ANTHROPIC_DEFAULT_HAIKU_MODEL: "deepseek-v4-flash",
  CLAUDE_CODE_SUBAGENT_MODEL: "deepseek-v4-flash",
};

const target = dry ? S + ".dryrun" : S;
copyFileSync(S, dry ? target : S + ".bak-before-deepseek");
const settings = JSON.parse(readFileSync(target, "utf8"));
settings.env = { ...(settings.env || {}), ...ENV };
writeFileSync(target, JSON.stringify(settings, null, 2) + "\n", "utf8");
JSON.parse(readFileSync(target, "utf8")); // validate or throw
console.log(
  (dry ? "[dry-run] " : "") +
    "settings env merged + JSON validated " +
    (dry ? "(wrote " + target + ", real file untouched)" : "(backup: settings.json.bak-before-deepseek)"),
);

if (!dry) {
  for (const [k, v] of Object.entries(ENV)) {
    execSync(
      'powershell -NoProfile -Command "[Environment]::SetEnvironmentVariable(\'' +
        k + "','" + v.replace(/'/g, "''") + "','User')\"",
    );
  }
  console.log("user-level env vars set (covers the GUI-launch edge case)");
}

console.log(`
NEXT STEPS:
1. VS Code: Ctrl+, -> search claudeCode.disableLoginPrompt -> TICK it.
2. Fully close and reopen VS Code (not just reload).
3. Smoke test a new chat: "what is rule zero and who am I working with".
4. Rollback: restore settings.json from the .bak-before-deepseek copy, delete the 7 user env vars.
NOTE: ccusage dollar figures are wrong for DeepSeek; real spend: platform.deepseek.com usage page.
NOTE: NO VISION on this endpoint — Chan's eyes verify all screenshots from now on.
`);
