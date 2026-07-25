---
name: chan-priority-client-sprint-over-hygiene
description: "Chan finishes the active client-facing sprint before internal KB/tooling hygiene; don't propose doc-refactors mid-build."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 91ef625b-d10c-42b1-8fb7-d88f1c475957
---

Chan redirected a mid-sprint KB-debloat proposal back to finishing the caregiver-profile build (W4a→W5) ahead of the Fri Jun 26 pilot/handoff.

**Why:** P1 is the client-facing deliverable. The KB docs are the build's own resume-truth, and the live tier churns every session during an active sprint — so refactoring the docs mid-build means redoing the work. Doing hygiene *after* a sprint also lets the just-finished work archive in a single clean pass instead of two.

**How to apply:** When an internal-hygiene or refactor idea comes up during an active client sprint, capture it into the Backlog as a placed item. CHAN declares a sprint closed, and CHAN says when a backlog item starts: when the sprint ends, surface the list for him to prioritise rather than beginning any of it. Don't interrupt a client-facing P1 (e.g. a pilot/handoff) to reorganize tooling or docs.
