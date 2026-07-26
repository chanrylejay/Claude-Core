// _lawcheck_test.mjs — pins each load-bearing runtime law to the agent file that must carry it.
// COMMITTED — no key/network needed. Run: node templates/agents/_lawcheck_test.mjs
// WHY: a subagent loads its own file and nothing else, so a law that drops out of an agent file
// fails SILENTLY — the agent does not error, it just quietly does not have the law. Every other
// load-bearing rule in this kit has a mechanical enforcer; until Jul 26 2026 this one, the kit's
// central law, had only a checklist item asking a human to read two files side by side.
// THE PINNED LIST BELOW IS ITS OWN ONE HOME. The pattern doc points here and deliberately does
// not carry a copy (a list drifts; the live thing does not). Add a law to an agent file and its
// pin here in the SAME edit.
// Matching normalizes whitespace, because these laws wrap differently in different files and a
// net that breaks on a reflow measures the wrong property (that mistake shipped once already, in
// the ritual net's character-distance check, and was replaced the same day).
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const norm = (s) => s.replace(/\s+/g, " ");
let pass = 0, total = 0;
const ok = (label, cond, got) => {
  total++;
  if (cond) pass++;
  console.log((cond ? "  ok  " : "FAIL  ") + label + (cond ? "" : "  :: " + got));
};

const LAWS = [
  // the read-only supremacy clause — all five shipped agents
  ["reviewer.md", "THIS law governs and that line is the bug"],
  ["net-runner.md", "THIS law governs and that line is the bug"],
  ["recon.md", "THIS law governs and that line is the bug"],
  ["challenger.md", "THIS law governs and that line is the bug"],
  ["spec-reader.md", "THIS law governs and that line is the bug"],
  // the write-budget supremacy clause — both client skeletons
  ["client-qa.skeleton.md", "That is the entire write budget"],
  ["client-ux.skeleton.md", "That is the entire write budget"],
  // per-agent load-bearing laws
  ["reviewer.md", "never by running them"], // write paths traced on paper, not executed
  ["net-runner.md", "An empty list must never mean"], // unfilled placeholder fails CLOSED
  ["net-runner.md", "Only he runs anything that touches a live service"],
  ["challenger.md", "is NOT unreproducible"], // the owner-only bucket must survive filtering
  ["client-qa.skeleton.md", "AWAITING HIS LOOK"], // no-vision evidence path
  ["client-ux.skeleton.md", "his eyes give the verdict"], // no-vision evidence path
];

for (const [file, law] of LAWS) {
  let body = "";
  try {
    body = readFileSync(resolve(HERE, file), "utf8");
  } catch (e) {
    // a MISSING agent file fails loudly — passing by absence is the state this net exists to kill
    ok(file + " readable", false, e.code);
    continue;
  }
  ok(file + ' :: "' + law.slice(0, 46) + '"', norm(body).includes(norm(law)), "law text absent from agent file");
}

console.log("\nlawcheck: " + pass + "/" + total + (pass === total ? " — every pinned law is in place" : " — A LAW IS MISSING FROM AN AGENT FILE"));
process.exit(pass === total ? 0 : 1);
