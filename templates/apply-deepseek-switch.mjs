#!/usr/bin/env node
// apply-deepseek-switch.mjs — one-shot: point Claude Code (CLI + VS Code extension) at DeepSeek.
// Run the DAY Claude access dies, not before: the switch takes effect on the next VS Code start.
// Usage: node apply-deepseek-switch.mjs sk-YOURDEEPSEEKKEY [--dry-run] [--no-env]
// --no-env writes settings.json only and skips the Windows user env vars. Those env vars are
// MACHINE-WIDE: they ignore any USERPROFILE override, so a test that points USERPROFILE at a
// sandbox and then takes the real path still reconfigures the whole machine (that happened,
// Jul 25 2026). THE TEST INVARIANT IS NOT A FLAG: no test may let the settings.json write land on
// a real path. --dry-run guarantees that unconditionally (it redirects the write to
// settings.json.dryrun and implies --no-env), so it is the default, and the ONLY safe choice when
// you cannot control USERPROFILE. --no-env ALONE is NOT safe on a normal machine: it skips only
// the env vars, and the settings write still hits the LIVE file. The one exception is a test that
// redirects USERPROFILE into a sandbox, where that write is already contained — _switch_test.mjs
// does exactly that, which is why it passes --no-env and can still exercise the real-write backup
// logic that --dry-run would skip.
// (audit Jul 25 2026 — twice. First the mandate named the weaker flag and would have written
// DeepSeek config to the live settings file. The correction for THAT was absolute and contradicted
// this kit's own test net, which is correct as written. State the invariant, not the flag.)
// The key is NEVER stored in this repo: it goes only into ~/.claude/settings.json (local) and
// user-level env vars. Playbook: ../workflow/switch-to-deepseek.md
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const key = process.argv[2];
const dry = process.argv.includes("--dry-run");
const noEnv = dry || process.argv.includes("--no-env");
if (!key || !key.startsWith("sk-")) {
  console.error("Usage: node apply-deepseek-switch.mjs sk-YOURDEEPSEEKKEY [--dry-run]");
  process.exit(1);
}

const S = (process.env.USERPROFILE || "C:/Users/Chanryle") + "/.claude/settings.json";
// Verified against DeepSeek's official Claude Code guide, Jul 24 2026.
const ENV = {
  ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
  ANTHROPIC_AUTH_TOKEN: key,
  // Main model: Chan chose flash (Jul 24 2026) for cost/speed. For the smarter (pricier) tier,
  // set ALL FIVE of the model keys below back to "deepseek-v4-pro": ANTHROPIC_MODEL, the three
  // ANTHROPIC_DEFAULT_* keys, and CLAUDE_CODE_SUBAGENT_MODEL. Flipping only the first three
  // leaves every subagent (client-qa, client-ux, the reviewers) running the cheaper model after
  // what was meant to be an upgrade, with nothing to surface it.
  ANTHROPIC_MODEL: "deepseek-v4-flash",
  ANTHROPIC_DEFAULT_OPUS_MODEL: "deepseek-v4-flash",
  ANTHROPIC_DEFAULT_SONNET_MODEL: "deepseek-v4-flash",
  ANTHROPIC_DEFAULT_HAIKU_MODEL: "deepseek-v4-flash",
  CLAUDE_CODE_SUBAGENT_MODEL: "deepseek-v4-flash",
  // Safety: Claude Code sends a "thinking" field with the effort setting; DeepSeek may reject it with a hard 400.
  // Disabling adaptive thinking up front prevents that (DeepSeek reasons on its own regardless).
  CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING: "1",
  // Show BOTH flash and pro in the /model picker so Chan can switch per session with a click
  // (flash stays the default). Claude Code queries DeepSeek /v1/models at startup; if DeepSeek does
  // not serve it, the picker just has no DeepSeek entries and the one-line model flip above is the fallback.
  CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY: "1",
  // RELIABLE way to put pro in the /model picker without depending on DeepSeek serving a model list:
  // a LOCAL custom picker entry. Flash stays the default (ANTHROPIC_MODEL above); this just adds pro as
  // a one-click option. Selecting it sends model=deepseek-v4-pro, which DeepSeek accepts.
  ANTHROPIC_CUSTOM_MODEL_OPTION: "deepseek-v4-pro",
  ANTHROPIC_CUSTOM_MODEL_OPTION_NAME: "DeepSeek V4 Pro",
  ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION: "Smarter, ~3x pricier; pick for hard tasks",
};

const target = dry ? S + ".dryrun" : S;
// Back up ONCE. This used to be unconditional, so a second run copied the already-DeepSeek
// settings over the only pristine-Claude backup and the documented rollback restored DeepSeek
// (audit Jul 25 2026). The first backup is the one worth keeping, so never overwrite it.
if (dry) {
  copyFileSync(S, target);
} else {
  const BAK = S + ".bak-before-deepseek";
  const ORIG = S + ".bak-CLAUDE-ORIGINAL";
  // Only promote a candidate that is actually PRE-switch. An older .bak-before-deepseek can
  // already hold a DeepSeek config (older versions of this script overwrote it on every run), and
  // promoting that would put contaminated settings in the file the runbook calls pristine
  // (audit Jul 25 2026 — the defect my own first fix moved one file downstream instead of ending).
  const isPreSwitch = (f) => {
    try {
      const j = JSON.parse(readFileSync(f, "utf8"));
      return !(j.env && (j.env.ANTHROPIC_BASE_URL || j.env.ANTHROPIC_AUTH_TOKEN));
    } catch {
      return false;
    }
  };
  if (!existsSync(ORIG)) {
    const candidate = existsSync(BAK) && isPreSwitch(BAK) ? BAK : isPreSwitch(S) ? S : null;
    if (candidate) copyFileSync(candidate, ORIG);
    else console.log("  ⚠ no pre-switch settings found — NO pristine backup written. Rollback must be done by hand: strip the env block and the API key out of settings.json.");
  }
  if (!existsSync(BAK)) copyFileSync(S, BAK);
}
const settings = JSON.parse(readFileSync(target, "utf8"));
settings.env = { ...(settings.env || {}), ...ENV };
// The /model picker writes a top-level "model" pin (e.g. "opus[1m]"), a Claude-only id that this
// script used to leave in place. If that pin wins over ANTHROPIC_MODEL, every request asks DeepSeek
// for a Claude model and 404s, and nothing in the runbook would surface it (audit Jul 25 2026).
// Delete ONLY a non-DeepSeek pin. This script also installs a picker entry that writes a
// legitimate "deepseek-v4-pro" pin, and second runs happen, so an unconditional delete would
// silently drop Chan back to flash after he deliberately chose pro (audit Jul 25 2026).
if (settings.model && !/^deepseek/i.test(String(settings.model))) {
  console.log("  removed stale top-level model pin: " + JSON.stringify(settings.model));
  delete settings.model;
}
writeFileSync(target, JSON.stringify(settings, null, 2) + "\n", "utf8");
JSON.parse(readFileSync(target, "utf8")); // validate or throw
console.log(
  (dry ? "[dry-run] " : "") +
    "settings env merged + JSON validated " +
    (dry
      ? "(wrote " + target + ", real file untouched)"
      : "(pristine backup: settings.json.bak-CLAUDE-ORIGINAL, written once and never overwritten)"),
);
if (dry) {
  console.log(
    "  ⚠ " + target + " contains your API key in PLAINTEXT. Delete it as soon as you have read it.",
  );
}

if (!noEnv) {
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
4. Rollback: restore settings.json from settings.json.bak-CLAUDE-ORIGINAL (the pristine pre-DeepSeek
   copy, written once and never overwritten), then delete every ANTHROPIC_* and CLAUDE_CODE_* user
   env var this script set, and UNTICK claudeCode.disableLoginPrompt in VS Code or the Anthropic
   sign-in screen never appears and you cannot log back in.
NOTE: ccusage dollar figures are wrong for DeepSeek; real spend: platform.deepseek.com usage page.
NOTE: NO VISION on this endpoint — Chan's eyes verify all screenshots from now on.
`);
