// raw-read.mjs — the RAW read on this machine. Run from any cwd:
//   node <kit>/templates/raw-read.mjs <file> [<file>...] [--lines A-B | --head N | --tail N]
// WHY (batch 3b, Aug 31 2026; ../lessons/audit-log.md AL-23): lean-ctx denies native Read and the
// rewrite hook turns cat/head/tail into ctx reads; the shell allowlist blocks node -e. So every
// session wrote a temp .mjs to read a file raw, and wrote it again when the temp dir was cleaned
// (seen in four sessions running). This is that script, committed once. It prints each file
// VERBATIM between two marker lines, never through a compressing layer, and a missing file prints
// MISSING and exits 1, because the drill says name every read that failed. Net: _rawread_test.mjs.
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i < 0 ? null : args.splice(i, 2)[1]; };
const lines = opt("--lines"), head = opt("--head"), tail = opt("--tail");
const files = args.filter((a) => !a.startsWith("--"));
if (!files.length) { console.error("usage: node raw-read.mjs <file> [<file>...] [--lines A-B | --head N | --tail N]"); process.exit(1); }

let missing = 0;
for (const f of files) {
  const p = path.resolve(f);
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { console.log(`===== MISSING ${f} =====`); missing++; continue; }
  const txt = fs.readFileSync(p, "utf8");
  const all = txt.split("\n"); if (txt.endsWith("\n")) all.pop(); // a final newline is not a line
  let out = all, a = 1, b = all.length;
  if (lines) { const m = lines.match(/^(\d+)-(\d+)$/); if (m) { a = Number(m[1]); b = Math.min(Number(m[2]), all.length); out = all.slice(a - 1, b); } }
  else if (head) { b = Math.min(Number(head), all.length); out = all.slice(0, b); }
  else if (tail) { a = Math.max(1, all.length - Number(tail) + 1); out = all.slice(a - 1); }
  console.log(`===== BEGIN ${f} (lines ${a}-${b} of ${all.length}) =====`);
  process.stdout.write(out.join("\n") + "\n");
  console.log(`===== END ${f} =====`);
}
process.exit(missing ? 1 : 0);
