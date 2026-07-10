# MCP Tools — Usage Rules

Binding reference for calling the MCP servers agent-smith configures. Skills and commands
assume these exact tool names and signatures. **Only call tools that exist here.**

## Execution structure

Every automated task follows this chain:

```
slash command → main skill → sub-skill → MCP tool
```

**Prefer wired MCP servers over ad-hoc shell/Read when an MCP can answer.** For example:
use `mcp__gitnexus__impact` to check blast radius instead of grepping manually; use
`mcp__playwright__browser_snapshot` to inspect a live page instead of reading HTML from disk.

## Code discovery & editing (native tools)

Use the built-in tools for navigating and changing code: `Grep`/`Glob`/`Read` to locate
symbols and call sites, and `Edit`/`Write` to make changes. Cross-check blast radius with
gitnexus (below) before editing public symbols.

## gitnexus (code graph)

Impact analysis, callers, route maps, blast radius. Use before/after changing public symbols.
**Call the full `mcp__gitnexus__<tool>` names — never `gitnexus_query(...)`; the underscore form is
not an invokable tool and is silently ignored.**
- `mcp__gitnexus__query(concept)` — execution flows + related symbols.
- `mcp__gitnexus__impact(symbol)` — callers/callees blast radius (d=1/2/3).
- `mcp__gitnexus__context(path)` — 360° module view: callers, callees, processes.
- `mcp__gitnexus__detect_changes()` — map the current git diff to affected flows.
- `mcp__gitnexus__api_impact()` — HTTP endpoints affected by the change.
- `mcp__gitnexus__route_map()` — full verb + path + handler index.
- `mcp__gitnexus__rename(...)` — graph-aware rename across references.
If the index is stale, run `npx gitnexus analyze`.

Key tools: `mcp__gitnexus__impact`, `mcp__gitnexus__context`, `mcp__gitnexus__query`,
`mcp__gitnexus__route_map`, `mcp__gitnexus__api_impact`.

## git-memory (history)

Why code changed: commit history, bug-fix history, file timelines.
**Call the full `mcp__git-memory__<tool>` names — never a bare `commits_touching_file(...)`.**
- `mcp__git-memory__commits_touching_file(path, limit)` — all prior changes to a file.
- `mcp__git-memory__search_git_history(query, limit)` — semantic search over commits.
- `mcp__git-memory__bug_fix_history(component, limit)` — fix/security commits for an area.
- `mcp__git-memory__architecture_decisions(topic, limit)` — why a design was chosen.
- `mcp__git-memory__latest_commits(n)` — the most recent commits.

Key tools: `mcp__git-memory__search_git_history`, `mcp__git-memory__commits_touching_file`,
`mcp__git-memory__bug_fix_history`, `mcp__git-memory__latest_commits`.

## sentrux (architectural quality gate)

`sentrux check .` (rule violations) and `sentrux gate .` (regression vs baseline) before committing.

Key tools: `mcp__sentrux__check_rules`, `mcp__sentrux__scan`, `mcp__sentrux__health`,
`mcp__sentrux__test_gaps`.

## obsidian (documentation vault)

Read and write documentation notes in the project vault. Used by docs skills to record
architecture decisions, ADRs, and human-readable guides.

Key tools: `mcp__obsidian__read_notes`, `mcp__obsidian__search_notes`.

## playwright (frontend verification & docs screenshots)

Drive a real browser to verify frontend flows and capture screenshots for documentation.
Prefer over static HTML reads when behaviour depends on JS, routing, or auth state.

Key tools and when to use them:

- `mcp__playwright__browser_navigate` — load a URL before any interaction.
- `mcp__playwright__browser_snapshot` — get the current DOM/accessibility tree; use to
  locate elements before clicking or filling.
- `mcp__playwright__browser_take_screenshot` — capture a screenshot for docs or to confirm
  visual correctness after a change.
- `mcp__playwright__browser_fill_form` — fill multiple form fields in one call; pair with
  `mcp__playwright__browser_click` to submit.
- `mcp__playwright__browser_click` — click a button, link, or interactive element.
- `mcp__playwright__browser_wait_for` — wait for a selector or network idle before asserting.
- `mcp__playwright__browser_console_messages` — read browser console output to catch JS errors
  during a flow.
- `mcp__playwright__browser_network_requests` — inspect outbound requests/responses made during
  a flow; useful for verifying API calls from the frontend.

Typical docs-screenshot workflow:
1. `browser_navigate` → page under test.
2. `browser_snapshot` → confirm structure / locate elements.
3. Log in / navigate to the target view.
4. `browser_take_screenshot` → save to the gitignored screenshots dir.
5. Reference the screenshot path in the Obsidian note.

## chrome-devtools (debugging & performance profiling)

Deep page inspection: console errors, network traffic, and performance traces. Use when
playwright's higher-level view is insufficient or when profiling a specific interaction.

Key tools and when to use them:

- `mcp__chrome-devtools__list_console_messages` — list all console output (errors, warnings,
  logs) for a page; first stop when debugging a JS runtime error.
- `mcp__chrome-devtools__get_console_message` — fetch a single console message by index.
- `mcp__chrome-devtools__list_network_requests` — list all network requests made by the page;
  use to verify that the frontend calls the correct endpoints with the right payloads.
- `mcp__chrome-devtools__get_network_request` — inspect a specific request/response in detail
  (headers, body, status code).
- `mcp__chrome-devtools__performance_start_trace` / `mcp__chrome-devtools__performance_stop_trace`
  — bracket a user interaction to record a performance trace.
- `mcp__chrome-devtools__performance_analyze_insight` — analyse a recorded trace for bottlenecks
  (long tasks, layout thrash, paint delays).
- `mcp__chrome-devtools__take_screenshot` — capture the current page state mid-debug.
- `mcp__chrome-devtools__evaluate_script` — run arbitrary JS in the page context; use sparingly
  and only for diagnostic reads (not mutations).
- `mcp__chrome-devtools__navigate_page` — navigate the controlled page to a URL.
