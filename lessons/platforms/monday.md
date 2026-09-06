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
## Day 8 addendum (2 Sep 2026, kit-day8-lessons)

**Automation builder armor phrases — the headline.** For any status trigger append: `The previous status can be anything. Use the "status changes to" trigger, not the from-to trigger.`
Without it the builder emits whenStatusChangesFromSomethingToSomething with the SAME label in both slots — a recipe that can never fire. For date-offset alerts write: `When a date arrives, with an offset. Offset: N days AFTER the date, fire ONCE (a single time, not every day). Time of day: HH:MM. Timezone: <tz>` (forces whenDateArrivesV2 with offset config). Loose "N days after" phrasing can come back as everyDayIfDateHasPassed with no hour — a daily nag. For BEFORE offsets, the word "before" alone routes to a pushDate action block and returns needs_clarification (no artifact); write `N days earlier than the date, fires N days ahead of <column>` and name the block (`Use the "When date arrives" trigger (whenDateArrivesV2), do NOT use the "Push date" block`). Verified JSON shows offset.count negative. Went 7 for 7 once armored.

- Exclusions in words beat parenthetical ids: a column id in parentheses inside the trigger line polluted matching (bound a sibling status column). Write `the status column titled "X", NOT "Y" and NOT "Z"`.
- Deleting or pausing automations: NO API path exists. CORRECTS the manage_automations bullet above (Automations section) that framed this as a permission ceiling. Public /v2 GraphQL has zero automation/recipe/workflow mutations (194-field Mutation type, introspected, default and 2026-07 API versions): `delete_recipe` and `manage_automations` return "Cannot query field" — a schema absence, not USER_UNAUTHORIZED. The monday MCP connector's manage_automations uses a different channel and returns USER_UNAUTHORIZED even for the creator. Net: every mis-parse is a UI click.
- Conditional row coloring has NO API surface: view settings_str / view_specific_data_str / settings carry only column visibility and order; update_view accepts settings, filter, sort only. UI-only. Do not attempt a guessed payload on a live view.
- View filters: a people column accepts the dynamic token `assigned_to_me`; date columns reject dynamic tokens (pinned dates only). Different columns, different rules.
- Status label slots: the reserved/empty slot is label id 5, not index 5 (a label at index 5 with id 6 renders fine; blanks render blank).
- Notify double-listing: the builder sometimes lists the same recipient twice in a notify slot; cosmetic, one notification is sent.
- Connector timeout mid execute_code: the sandbox usually finishes. Verify board state before re-firing; write migration scripts idempotent.
- The compaction lesson: a workaround that lives only in recipe descriptions is not banked. Bank the phrase, not just the outcome.
## Day 8 addendum, afternoon (2 Sep 2026, kit-day8-lessons)

- Views cannot filter dropdown columns through API-set filters (filter attaches, screen shows everything); status columns filter correctly. Use status columns for anything a view must filter on. Date columns in view filters accept the literal token "TODAY" (rolling); relative tokens like ONE_WEEK_AGO are rejected. People columns accept "assigned_to_me".
- Mirror columns CAN be created via API: settings {"relation_column":{"<relation_id>":true},"displayed_linked_columns":[{"board_id":"<id>","column_ids":["<col>"]}]}; read them via ... on MirrorValue { display_value }. Board-relation values read via ... on BoardRelationValue { linked_item_ids linked_items{name} }, never text.
- Dashboards and widgets CAN be created via API (create_dashboard, create_widget with the widgets schema; delete_widget returns Boolean). Dashboards remain unreadable: get a screenshot before touching an existing one. Widget filters and placement are UI-only. Number widgets can average a formula column. Battery widgets count a label as done only if the label has is_done=true on the column. Chart x-axis group_by supports status ("color"), people, group, board, name, date; not dropdown.
- Notification messages can carry column values by naming the column in the prompt: "{Candidate Name} ... use the value of the column (column id X)"; the builder emits {item.<column_id>}.
- New status/dropdown labels must be sent WITHOUT an id (ids are server-assigned; sending one fails). Existing labels must keep their ids; a pure rename via change_column_title needs no revision.
- AI-powered column recipes (monday_AI_categorized_column) cannot be deleted from the Automations centre; deactivate on the column (three-dot, AI-powered actions, Deactivate AI); only the column creator or a board owner can, account admin cannot. Each trigger spends one AI credit; rename triggers burn on every rename; the pool can run dry mid-month and the extractor then fails silently (run history shows ai_credits quota errors).
- Public /v2 has no view mutations (create_board_view and update_board_view do not exist); the connector's create_view_table and update_view_table do the job. Groups reorder via update_group(group_attribute: relative_position_before, new_value: <group_id>); delete_group reports deleted:false but the group is gone (verify by listing).
- Rows created via API on a board with created-recipes get their stamps overwritten by those recipes (Date Received=today, creator assigned); write the historical values in a second call after creation, or expect to re-set them.
- Condition blocks can come back inverted ("is not" instead of "is"); armor: "This is a positive check: status equals X. Set the condition to is (shouldCheckIfStatusIsNot=false), NOT is not." Read shouldCheckIfStatusIsNot in the JSON every time.
- "before" offsets: say "N days earlier than the date" and name whenDateArrivesV2; JSON offset.count negative. Fire-once requires the date-offset trigger; date-column blank rows never fire (no backlog spam).
- After any cut-off turn ("continue"), list before you create. Verify the connector's UI counter with a live list; the header count lags.
- Template boards: all items created in the same second with stock text = template, not a convention; archive.
- Board views can vanish; re-list views before building on them.
## Day 9 addendum (3 Sep 2026, kit-day8-lessons)

- View filters set via API may not render in the UI AT ALL on some accounts, regardless of column type (dropdown AND status): the tab opens showing every row with "Filter/1" attached. Day 8 found dropdowns unfilterable but status filtering OK; day 9 hit status failing the same way on one account. Build filtered tabs in the UI, or verify with a screenshot immediately after API creation.
- Formula columns used for conditional coloring or sorting must return a number in every branch; an `""` (empty) branch makes monday treat the whole column as text and only text operators are offered. With zero rows monday cannot infer the type: add one row carrying a date, set the rule, delete the row.
- A new status label is not done until its group mover exists. Users adopt new labels within hours; hand-labelled rows with no mover sit in the old group (e.g. a "Do Not Contact" label added a day earlier left rows in Active until the mover shipped).
- Backfilled dates produce plausible-looking but false KPIs (a "time to fill" of ~3 days computed from board-load/creation dates). Label any metric derived from backfilled dates as unverified until its source dates are real going forward.
- Board-relation columns can be re-pointed via update_column_settings {"boardIds":[...]}. Formula columns cannot be edited after creation (no update_column_settings surface) — delete and recreate; delete_group on the default "topics" group works.

## Day 10 addendum (4 Sep 2026, kit-day8-lessons)

### AI columns are API-configurable from version 2026-10 (supersedes the day-9 conclusion)

The automation builder remains UI-only, but columns are API-configurable. API version `2026-10` ships `configure_*_ai_column` mutations (categorize, summarize, extract, translate, improve_text, open_block, write_me, person_assignment, plus `remove_ai_from_column`), scope `boards:write`. Check the account version with `{ version { value } }` before assuming.

- `source_type`: `item_name` | `thread` | `column` | `emails_and_activities`; `source_column_id` is required when it is `column`.
- `configure_open_block_ai_column` and `configure_write_me_ai_column` take no `source_type`: they parse `{pulse.column_id}` references from prompt text.
- `extra_settings: { run_backfill: true }` is the default and processes up to 200 existing items; larger boards need a second mechanism and the cap is silent.
- Target column type is enforced: categorize needs status/dropdown, summarize needs text/long_text. Errors carry an `extensions.code` such as `INVALID_COLUMN_TYPE` or `MISSING_SOURCE_COLUMN_ID`.
- A platform capability recorded as impossible is a dated observation, not a fact. Re-check live documentation before repeating it to a client, especially when it changes what gets promised.

### AI credit arithmetic, measured not quoted

AI blocks cost 8 credits per item per 24 hours, however many AI columns fire on that item. A ~230-row, two-board pass used 1,248 credits (~5.4 per row); re-running a prompt on the same day cost about zero extra. Configure all AI columns on a board in one sitting and iterate prompts that day. Items and subitems are charged separately.

### Writing prompts for a categorize column

The failure mode is filling a label when the cell should stay empty. State the domain in the first sentence, then give an explicit negative clause: choose label X only when the text literally says the condition; in every other case, including named noise phrases, choose nothing and leave the column empty.

### The automation-builder tool has three reproducible defects. Prompt around them.

1. **Status triggers silently become from-to.** Ask for `monday::whenStatusChangesToSomething`, not the from-to trigger; verify `blockUniqueKey` in the response.
2. **Empty conditions invert.** State `is empty` and `shouldCheckIfColumnIsNotEmpty = false`; check that variable in the response.
3. **Dynamic column tokens bind to the wrong column and instruction text leaks into messages.** When titles collide, `{{Column Name}}` can bind to a deprecated sibling. Keep notifications to `{{item name}}` plus static text and let the recipient open the row.

Every defect activates successfully and looks fine in the list. Read returned `workflowBlocks` and `workflowVariables`, not the status field. Mis-built recipes can only be removed by a board owner; an admin can receive `USER_UNAUTHORIZED`.

### More Day 10 API and workflow limits

- There is no cross-board "change a field on connected items" recipe. Connected-board templates create a new item; marketplace apps only read and aggregate. Use a mirror column for reading plus a notification for action; do not promise state sync.
- `update_board(board_id:, board_attribute: description, new_value: $v)` takes `new_value: String!`, not JSON, and returns a JSON scalar with no sub-selection.
- Board descriptions are the cheapest durable documentation: conventions placed where the team works beat messages that scroll away and documents that are not opened.
