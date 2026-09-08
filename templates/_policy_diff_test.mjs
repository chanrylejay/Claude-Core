// _policy_diff_test.mjs — net for _policy_diff.mjs (batch 0b, Sep 9 2026; why: audit-log AL-30, F18).
// Pins the one thing L24 cannot see: a clause whose modal/negation/scope words changed while its
// fact tokens survived. Exit 1 on any failed pin. Dependency-free.
import { policyDiff } from "./_policy_diff.mjs";
let pass = 0, fail = 0;
const t = (name, ok) => { ok ? pass++ : fail++; console.log(`${ok ? "ok  " : "FAIL"} ${name}`); };

// 1. the negation flip (Codex's mutation, Sep 6): L24 passes it, this net must flag it
let r = policyDiff("Codex must never push without GO.", "Codex must push without GO.");
t("negation flip flagged as CHANGED", r.changed.length === 1 && r.changed[0].lost.includes("never"));
// 2. scope broadening: a subject dropped from a rule is a lost scope word set? (subject words are not modals;
//    the net only promises modal/negation/scope words). Pin what it DOES promise: 'only' removal is flagged.
r = policyDiff("Middleware exempts only login/logout.", "Middleware exempts login/logout.");
t("dropped 'only' flagged", r.changed.length === 1 && r.changed[0].lost.includes("only"));
// 3. a pure relocation: same sentences, different order, extra non-policy prose → nothing to read
const A = "The importer reads the Status column, never the GROUP name. Screenshots are evidence only. Sage green is the only reward colour.";
const B = "Sage green is the only reward colour.\n\nThe importer reads the Status column, never the GROUP name.\n\nSome descriptive sentence about the weather this morning. Screenshots are evidence only.";
r = policyDiff(A, B);
t("relocation reports nothing", r.changed.length === 0 && r.dropped.length === 0 && r.added.length === 0);
// 4. a dropped policy sentence is reported as DROPPED
r = policyDiff("Never delete a banked fact. Rows are sorted by date.", "Rows are sorted by date.");
t("dropped policy sentence reported", r.dropped.length === 1 && /Never delete/.test(r.dropped[0]));
// 5. an added policy sentence is reported as ADDED
r = policyDiff("Rows are sorted by date.", "Rows are sorted by date. Nothing builds until Chan says so.");
t("added policy sentence reported", r.added.length === 1 && /until Chan/.test(r.added[0]));
// 6. rewording that keeps the modal/scope set is silent (the tool is not a diff); note "every"→"each" WOULD flag, by design
r = policyDiff("Every /api path returns 401 without a session.", "Every /api route returns 401 without a session.");
t("modal-preserving rewording is silent", r.changed.length === 0);

// 7. doorway templates carry live instructions inside Markdown fences; never omit those clauses
const fencedOld = "```markdown\nCodex must never push without GO. Screenshots are evidence only.\n```";
const fencedNew = "```markdown\nCodex must push without GO. Screenshots are evidence only.\n```";
r = policyDiff(fencedOld, fencedNew);
t("fenced policy negation flip flagged", r.changed.length === 1 && r.changed[0].lost.includes("never"));
r = policyDiff(fencedOld, fencedOld);
t("unchanged fenced policy is silent", r.changed.length === 0 && r.dropped.length === 0 && r.added.length === 0);

console.log(`policy-diff net: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
