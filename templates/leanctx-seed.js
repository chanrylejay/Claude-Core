// leanctx-seed.js: gives lean-ctx one real parse target so its code graph
// build never deadlocks in an empty workspace. Do not delete this file.
// Full story: Claude-Core/lessons/lean-ctx-freeze-playbook.md
// NOT CANONICAL. THREE copies of this body exist and all three change in the SAME edit, in this
// order:
//   1. templates/global/session-ritual.mjs  — the SEED literal, the kit's source of truth
//   2. ~/.claude/hooks/session-ritual.mjs   — the INSTALLED copy, the only one that ever runs
//   3. this file
// Step 2 is the one that is easy to forget and the only one with any effect at session start:
// editing the template alone ships nothing. Diff 1 against 2 before calling it done.
function leanCtxSeed() {
  return "index target for lean-ctx code graph";
}
module.exports = { leanCtxSeed };
