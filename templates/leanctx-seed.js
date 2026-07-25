// leanctx-seed.js: gives lean-ctx one real parse target so its code graph
// build never deadlocks in an empty workspace. Do not delete this file.
// Full story: Claude-Core/lessons/lean-ctx-freeze-playbook.md
// NOT CANONICAL: the hook that actually plants this carries its own copy of the body, in the
// SEED literal inside templates/global/session-ritual.mjs (and the installed ~/.claude/hooks/
// session-ritual.mjs). Editing this file alone changes nothing that gets planted. Change the
// literal in the hook first, then mirror it here in the same edit.
function leanCtxSeed() {
  return "index target for lean-ctx code graph";
}
module.exports = { leanCtxSeed };
