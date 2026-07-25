// Sandboxed test of apply-deepseek-switch.mjs. Never touches the real ~/.claude.
// Proves: the pristine backup is written once and survives a re-run, the stale top-level model
// pin is removed, and the env block merges. Skips the PowerShell env-var writes by running --dry-run
// for the merge check and a fake-HOME real run for the backup check.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SB = path.join(__dirname, 'switch-sandbox');
const SCRIPT = 'C:/Users/Chanryle/Claude-Core/templates/apply-deepseek-switch.mjs';
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
  // ALWAYS --no-env. The env-var writes are machine-wide and ignore the USERPROFILE sandbox.
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

fs.rmSync(SB, { recursive: true, force: true });
console.log('\n' + (fail ? fail + ' FAILURES' : 'all switch-script checks pass'));
process.exit(fail ? 1 : 0);
