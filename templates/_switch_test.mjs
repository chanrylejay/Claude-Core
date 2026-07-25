// Sandboxed test of apply-deepseek-switch.mjs. Never touches the real ~/.claude.
// Proves: the pristine backup is written once and survives a re-run, the stale top-level model
// pin is removed, and the env block merges. Skips the PowerShell env-var writes by running --dry-run
// for the merge check and a fake-HOME real run for the backup check.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { tmpdir } from "node:os";
const SB = path.join(tmpdir(), "apply-deepseek-switch-test-sandbox");
// Resolve beside this net, like the other three do. A hardcoded absolute path meant every other
// checkout spawned nothing and died on the first read of .dryrun, before any verdict printed.
const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'apply-deepseek-switch.mjs');
if (!fs.existsSync(SCRIPT)) {
  console.error('no apply-deepseek-switch.mjs beside this net: ' + SCRIPT);
  process.exit(1);
}
const KEY = 'sk-FAKEKEYFORTESTONLY';

let fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fail++;
  console.log(`${ok ? '  ok  ' : 'FAIL  '}${name}  want=${JSON.stringify(want)} got=${JSON.stringify(got)}`);
};

function reset(settings) {
  fs.rmSync(SB, { recursive: true, force: true });
  fs.mkdirSync(path.join(SB, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(SB, '.claude', 'settings.json'), JSON.stringify(settings, null, 2));
}
function run(extra = []) {
  // ALWAYS --no-env: the env-var writes are machine-wide and ignore the USERPROFILE sandbox.
  // The settings.json write IS sandboxed here, by USERPROFILE, which is why --dry-run is not
  // forced for every case — the real-run cases exist to exercise the backup logic. On any machine
  // where you cannot redirect USERPROFILE, use --dry-run instead.
  return spawnSync(process.execPath, [SCRIPT, KEY, "--no-env", ...extra], {
    encoding: 'utf8',
    env: { ...process.env, USERPROFILE: SB },
  });
}
const S = () => path.join(SB, '.claude', 'settings.json');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ── 1. dry run: merges env, strips the pin, writes only the .dryrun file
reset({ model: 'opus[1m]', theme: 'dark', env: { EXISTING: '1' } });
const d = run(['--dry-run']);
const dry = read(S() + '.dryrun');
t('dry run leaves the real settings untouched', read(S()).model, 'opus[1m]');
t('dry run strips the stale model pin', dry.model, undefined);
t('dry run keeps unrelated keys', dry.theme, 'dark');
t('dry run keeps existing env', dry.env.EXISTING, '1');
t('dry run sets the DeepSeek base url', dry.env.ANTHROPIC_BASE_URL, 'https://api.deepseek.com/anthropic');
t('dry run warns the key is on disk', /PLAINTEXT/.test(d.stdout || ''), true);

// ── 2. real run: pristine backup written, pin stripped
reset({ model: 'opus[1m]', theme: 'dark', env: {} });
const r1 = run();
t('real run exits clean', r1.status, 0);
t('pristine backup exists', fs.existsSync(S() + '.bak-CLAUDE-ORIGINAL'), true);
t('pristine backup still has the Claude pin', read(S() + '.bak-CLAUDE-ORIGINAL').model, 'opus[1m]');
t('live settings pin removed', read(S()).model, undefined);
t('live settings point at DeepSeek', read(S()).env.ANTHROPIC_MODEL, 'deepseek-v4-flash');

// ── 3. THE BUG: a second run must not clobber the pristine backup
run();
t('pristine backup survives a re-run', read(S() + '.bak-CLAUDE-ORIGINAL').model, 'opus[1m]');
t('pristine backup is NOT a DeepSeek config', read(S() + '.bak-CLAUDE-ORIGINAL').env?.ANTHROPIC_BASE_URL, undefined);

// ── 4. THE SECOND BUG: a contaminated .bak-before-deepseek must NOT be promoted to pristine
reset({ model: 'opus[1m]', env: { ANTHROPIC_BASE_URL: 'https://api.deepseek.com/anthropic' } });
fs.writeFileSync(S() + '.bak-before-deepseek', JSON.stringify({ env: { ANTHROPIC_BASE_URL: 'https://api.deepseek.com/anthropic', ANTHROPIC_AUTH_TOKEN: 'sk-old' } }));
const contaminated = run();
t('contaminated backup is NOT promoted to pristine', fs.existsSync(S() + '.bak-CLAUDE-ORIGINAL'), false);
t('and the script says so out loud', /no pre-switch settings found/.test(contaminated.stdout || ''), true);

// a CLEAN .bak-before-deepseek still gets promoted
reset({ model: 'opus[1m]', env: {} });
fs.writeFileSync(S() + '.bak-before-deepseek', JSON.stringify({ model: 'opus[1m]', theme: 'dark', env: {} }));
run();
t('clean backup IS promoted', read(S() + '.bak-CLAUDE-ORIGINAL').theme, 'dark');

// ── 5. THE THIRD BUG: a deliberately chosen DeepSeek pin must survive a re-run
reset({ model: 'deepseek-v4-pro', env: {} });
run();
t('a DeepSeek pin is NOT deleted', read(S()).model, 'deepseek-v4-pro');
reset({ model: 'opus[1m]', env: {} });
run();
t('a Claude-only pin IS deleted', read(S()).model, undefined);

fs.rmSync(SB, { recursive: true, force: true });
console.log('\n' + (fail ? fail + ' FAILURES' : 'all switch-script checks pass'));
process.exit(fail ? 1 : 0);
