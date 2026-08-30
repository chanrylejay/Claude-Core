// _safety_test.mjs — public-safety scan. Run from templates/:  node _safety_test.mjs
// WHY: the repo is public by Chan's decision (Aug 11 2026) and everything tracked is
// world-readable, but the law was prose only. This net is the seatbelt: every TRACKED file
// (git ls-files) is scanned for secret shapes and for contact details outside an allowlist
// kept here WITH reasons (why: ../lessons/audit-log.md AL-21). Push is publish; run it before.
// Client names have no shape a regex can catch; Chan's practice is fake names everywhere, so
// no denylist here: a mechanism for a risk already covered by practice is bloat (AL-21).
// A matched value is never printed in full: file:line, class, first 2 chars, length.
// Self-test runs first, every time, on fixtures built at runtime (no secret literals here).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };
const mask = (s) => s.slice(0, 2) + "\u2026(" + s.length + ")"; // two chars: enough to recognise, never enough to leak

// ---- secret shapes: class -> regex --------------------------------------------------------
const SECRET = {
  api_key_sk: /\bsk-[A-Za-z0-9_-]{20,}/g,
  github_token: /\b(?:gh[oprsu]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,})/g,
  aws_access_key: /\bAKIA[0-9A-Z]{16}\b/g,
  google_api_key: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  slack_token: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  private_key_block: /-----BEGIN (?:RSA |OPENSSH |EC |DSA |PGP )?PRIVATE KEY-----/g,
  jwt: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g,
  credentialed_url: /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s@]+@/gi,
  env_secret_line: /^[ \t]*(?:export[ \t]+)?[A-Z][A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD|PASSWD)[A-Z0-9_]*[ \t]*=[ \t]*["']?([^\s"']{8,})/gm,
};
// an env-style line with a placeholder value is documentation, not a leak
const PLACEHOLDER = /[<>{}$]|your|example|xxx|redacted|placeholder|\.\.\./i;

// ---- contact details: allowlist WITH reasons (public by Chan's choice, already in the tree) --
const ALLOW_EMAIL = new Map([
  ["chanrylecagara@gmail.com", "Chan's own address, public by choice: job-application signatures"],
]);
const RESERVED_DOMAIN = /@(?:[a-z0-9-]+\.)?(?:example\.(?:com|org|net)|test|invalid|local|example)$/i;
const ALLOW_PHONE = new Map([
  ["09560228640", "Chan's own number, ruled PUBLIC-BY-CHOICE (commit 1c962ae, Aug 28 2026)"],
]);
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE = /(?:\+63|\b0)9\d{2}[ -]?\d{3}[ -]?\d{4}\b|\+\d{1,3}[ -]?\d{2,4}[ -]?\d{3,4}[ -]?\d{3,4}\b/g;
const norm = (p) => p.replace(/[ -]/g, "").replace(/^\+63/, "0");

// ---- scan one text; returns [{cls, line, value}] -------------------------------------------
const scan = (txt) => {
  const hits = [];
  const lineOf = (i) => txt.slice(0, i).split("\n").length;
  for (const [cls, rx] of Object.entries(SECRET)) {
    for (const m of txt.matchAll(rx)) {
      if (cls === "env_secret_line" && PLACEHOLDER.test(m[1])) continue;
      hits.push({ cls, line: lineOf(m.index), value: m[0].trim() });
    }
  }
  for (const m of txt.matchAll(EMAIL)) {
    const v = m[0].toLowerCase();
    if (ALLOW_EMAIL.has(v) || RESERVED_DOMAIN.test(v)) continue;
    hits.push({ cls: "email_not_allowlisted", line: lineOf(m.index), value: m[0] });
  }
  for (const m of txt.matchAll(PHONE)) {
    if (ALLOW_PHONE.has(norm(m[0]))) continue;
    hits.push({ cls: "phone_not_allowlisted", line: lineOf(m.index), value: m[0] });
  }
  return hits;
};

// ---- self-test (fixtures built at runtime) --------------------------------------------------
const K = (p, n, c = "A") => p + c.repeat(n);
t("selftest: sk- key shape fires", scan(K("sk-", 24)).some((h) => h.cls === "api_key_sk"));
t("selftest: AWS key shape fires", scan("id " + K("AKIA", 16, "Q")).some((h) => h.cls === "aws_access_key"));
t("selftest: private-key block fires", scan("-----BEGIN " + "PRIVATE KEY-----").some((h) => h.cls === "private_key_block"));
t("selftest: JWT shape fires", scan("eyJ" + K("", 12, "a") + "." + K("", 12, "b") + "." + K("", 8, "c")).some((h) => h.cls === "jwt"));
t("selftest: user:pass@ URL fires", scan("see https://" + "bob:hunter22@db.example.com/x").some((h) => h.cls === "credentialed_url"));
t("selftest: env line with a real-looking value fires; placeholder value does not",
  scan("DEEPSEEK_API_KEY=" + K("", 20, "z")).some((h) => h.cls === "env_secret_line") && !scan("DEEPSEEK_API_KEY=<your-key-here>").length);
t("selftest: allowlisted email passes, foreign email fails, example.com passes",
  !scan("mail chanrylecagara@gmail.com").length && scan("mail someone@" + "corp.com").length === 1 && !scan("mail a@example.com").length);
t("selftest: allowlisted phone passes (both spellings), another 09xx fails",
  !scan("call 09560228640 or +63 956 022 8640").length && scan("call 0917" + "1234567").length === 1);
t("selftest: every allowlist entry carries a reason", [...ALLOW_EMAIL.values(), ...ALLOW_PHONE.values()].every((v) => v && v.length > 10));

// ---- the tree: every tracked file ----------------------------------------------------------
let files = [];
try {
  files = execFileSync("git", ["ls-files"], { cwd: ROOT }).toString().split(/\r?\n/).filter(Boolean);
} catch { t("git ls-files available (this net scans TRACKED files only)", false); }

const byClass = {};
for (const f of files) {
  const txt = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/\r\n/g, "\n");
  for (const h of scan(txt)) (byClass[h.cls] ||= []).push(`${f}:${h.line} ${mask(h.value)}`);
}
for (const cls of [...Object.keys(SECRET), "email_not_allowlisted", "phone_not_allowlisted"]) {
  const hits = byClass[cls] || [];
  t(`tree clean of ${cls}${hits.length ? "  <-- " + hits.join(" | ") : ""}`, hits.length === 0);
}
console.log(`\npublic-safety scan: ${ran - fail} passed, ${fail} failed (${files.length} tracked files)`);
process.exit(fail ? 1 : 0);
