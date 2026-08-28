# monday.com (banked Aug 2026, client-trial sessions; all proven live) — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

**Status columns / labels**
- Label id ≡ color id (0-19, 101-110, 151-160). Default-id labels CANNOT be renamed or
  recolored via API (`update_column` and `update_status_column` both refuse); UI-only. New
  labels: array form `{"labels":[{"label":..,"color":"<name enum>","index":n}]}` — color is a
  NAME enum, never hex (hex silently corrupts: labels stored as `{"label" => ..}` garbage
  strings shown verbatim in the UI).
- The UI label editor can ROTATE values: values follow label ID, not position, so a UI
  recolor/reorder can silently reassign every item's label. ALWAYS re-verify value counts
  after any UI label edit.
- Editing existing status/dropdown labels via API requires resending each label WITH its
  existing id; omitting id creates a duplicate chip and orphans values. Never invent ids.

**Columns**
- `create_column` `defaults:""` (empty string) → 500. Pass None/omit, never "".
- Mirror column CONFIGURATION is UI-only (create exists, config doesn't). Mirror values read
  via `... on MirrorValue { display_value }`.
- board_relation `text` in column_values is EMPTY — idempotence checks against it silently
  fail and re-run everything. Read `... on BoardRelationValue { linked_item_ids }`. Write with
  `{"item_ids":[...]}`; target board in defaults as `{"boardIds":[int]}`.
- NEVER guess column ids from naming patterns — they're per-board random suffixes; a guessed
  id in a view/widget call 500s with no useful error. Read the board's columns first, every
  time. (Cost two failed calls in one session before it stuck.)

**Views**
- ViewKind enum = TABLE, FORM, DASHBOARD, APP only. NO Kanban/Calendar via API — those are
  UI-only. Kanban's key column: UI settings only.
- `create_view_table` supports filter + multi-key sort; status filter compare_value = label
  IDS (read settings_str first). Status sort asc follows label INDEX order — design indexes so
  Unknown sorts last. Where blanks land in a status sort is Monday's call: verify by eye.
- `delete_view` signature: `delete_view(board_id:$b, view_id:$i){id}` — both args + subfield;
  three simpler shapes all fail.
- A FORM view on an existing board = instant native intake form feeding that board. Free —
  forms/automations/dashboards cost NO AI credits (AI credits gate AI features only; a burned
  AI budget does not block normal platform work — a client-side misconception worth
  correcting early).

**Groups (high-leverage visual tool, fully API-driven)**
- `create_group(group_name, group_color:"#hex")` + `move_item_to_group` per item = colored
  band structure that turns a flat table into a workflow (e.g. confirmed / verify / suspect).
  Delete emptied default groups after. Boards sometimes auto-create a placeholder item
  ("Item 1"/"Task 1") — delete it.

**Dashboards / widgets**
- API: `create_dashboard`, `create_widget`, `delete_widget(id)` returns Boolean — and that is
  ALL. No move, no resize, no widget-level filters, no listview board-selection via API.
  Layout follows CREATION ORDER, so delete-and-recreate in narrative order is the only
  layout lever. LISTVIEW widgets default to an arbitrary connected board and can expose row
  names — check before screenshots.
- Chart widgets group only by status/person/date/group/board — text columns can't be an axis.

**Automations (`create_automation` natural-language builder)**
- Phrase triggers as: `changes to the label "X"` + `Details: The previous status can be
  anything` — bare "changes to X" can mis-parse into a from-X-to-X block that NEVER fires.
  Read the returned workflow JSON and check desiredPrevious/desiredNew before trusting it.
- Date triggers REQUIRE an explicit time of day; offsets like "1 day before" alone →
  needs_clarification. Builder defaults timezone to a server TZ — reset to the client's TZ
  before go-live.
- One automation = ONE direction. Status A→group and back requires two recipes.
- NO native recipe writes a status THROUGH a connect-boards column (verified in docs, not
  just failed attempts). Cross-board status sync needs two-way relations + mirrors or a
  paid connector — name it as a limit, don't burn attempts.
- "Stuck in status N days" doesn't exist: duration triggers measure from a DATE column.
  Workaround: stamp a date on status change, trigger off that. Scheduled ("every Monday")
  triggers CANNOT iterate items — no per-item condition+action from a timer.
- `manage_automations` delete/deactivate can return USER_UNAUTHORIZED on workflows the same
  token created — plan for UI cleanup of any mis-built recipe, and TEST destructive-adjacent
  recipes before leaving them live (one mis-parsed recipe was actively harmful and could only
  be removed by hand).
- PROVE automations by live fire-and-poll: change the trigger value via API, poll the expected
  effect (group/status) at ~8s intervals. API-made changes DO fire automations. Never demo a
  recipe you haven't watched fire.

**Sandbox / API mechanics**
- MCP execute-code sandboxes time out ~2min: 95-100s time guards + idempotent resume (read
  existing state, skip done) on any multi-hundred-mutation job. Parallel reads (~6 threads)
  cut a 43-board scan to ~18s. Retry INTERNAL_SERVER_ERROR with backoff; other errors raise.
- Fuzzy dedupe over-merges: similarity ratios conflate distinct short names (ABC≈Acme≈Pacific
  at 0.85) and name-subset rules conflate licence-class variants (HR X vs X are DIFFERENT
  jobs in AU staffing). Always print a keep/absorb log; treat subset-matches as flag-only.

**AI agents & provenance (which records are real)**
- **Every item carries `creator { id name }`.** This is the only reliable way to separate
  human-entered data from records generated by the platform's AI agents. Agent accounts appear
  in the user list with `kind: personal_agent_member`. Query the creator before trusting any
  board as a data source; boards are frequently MIXED.
- Agent-generated scaffolding is recognisable by naming conventions — items called
  `_status_*`, `__label_seed__`, `_label_init_`, `[Label Setup N]` — created in hourly batches
  to instantiate status labels. They inflate `items_count` and look like real records to any
  count-based query.
- `boards(limit:100, page:N)` pages cleanly; `items_count` is cheap and is the fastest way to
  find which boards in a large workspace hold anything at all.
