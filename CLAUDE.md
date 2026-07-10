<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **gods-favourite-son** (632 symbols, 1069 relationships, 29 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/gods-favourite-son/context` | Codebase overview, check index freshness |
| `gitnexus://repo/gods-favourite-son/clusters` | All functional areas |
| `gitnexus://repo/gods-favourite-son/processes` | All execution flows |
| `gitnexus://repo/gods-favourite-son/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

<!-- agent-smith:start -->
<!-- Managed by agent-smith. Do not edit by hand — re-run `agent-smith init` to refresh. -->

# Agent Smith — Commands, Skills & Tools

This project is set up with agent-smith. The commands, skills, and MCP tools below are
available to every session. For any task spanning multiple files, sources, or sessions, follow
the **smith-mode** execution discipline (`.claude/skills/smith-mode/SKILL.md`): stage map →
delegate → failable verification → self-critique.

## Execution structure

Work flows through a fixed chain — **command → main skill → sub-skill → MCP tool**:

- **Slash commands** (`/as-*`) are thin orchestrators: they detect scope and dispatch to the
  matching **main skill(s)** by reading `.claude/skills/<name>/SKILL.md` and executing them.
- **Main skills** (implementation, testing, pr-review, docs) own the workflow and, where
  applicable, dispatch **sub-skills** — e.g. the pr-review skills run the `pr-critic-*` panel.
- **Skills call MCP tools** for ground truth. Always prefer the wired MCP servers
  (gitnexus, git-memory, playwright, chrome-devtools, sentrux, obsidian) over ad-hoc shell or
  blind file reads whenever an MCP can answer the question.

## Test-driven development (mandatory)

Every implementation and test skill follows **RED-first TDD**: write the failing test(s) first,
run them to confirm they fail for the right reason, then implement until green. Never write
tests after the code. This is the failable-verification stage of smith-mode.

## Slash commands

| Name | Purpose |
|------|---------|
| `/as-backend` | You are the backend implementation entry point. Dispatch the **backend** skill to implement the task in `$ARGUMENTS`. |
| `/as-caveman` | You are in caveman mode — ultra-compressed communication. |
| `/as-documentation` | You are the documentation orchestrator. Detect what changed on the active branch, dispatch matching documentation skills each in a fresh su… |
| `/as-frontend` | You are the frontend implementation entry point. Dispatch the **frontend** skill to implement the task in `$ARGUMENTS`. |
| `/as-handoff` | You are the handoff orchestrator. Produce a structured HANDOFF.md and hand the remaining work to fresh-context subagents, so quality stays… |
| `/as-insights` | You are a project insights analyst. Read the project's architecture docs, decisions, and current agent-smith configuration, then suggest co… |
| `/as-pr-review` | You are the PR review orchestrator. Detect which sides of the stack changed, dispatch the matching **main review skill** for each side in a… |
| `/as-ship` | You are the **ship** workflow — the gated-autonomous path from finished work to a green PR. |
| `/as-test` | You are the test orchestrator. Classify the target, dispatch test skills each in a fresh subagent, and relay results. |

## Skills

| Name | Purpose |
|------|---------|
| `backend` | Implement a backend task end-to-end under strict test-driven design. Use for any backend implementation — service methods, views, repositor… |
| `docs-backend` | Generate or update backend technical documentation — API annotations, endpoint and request/response schema docs, and a technical summary no… |
| `docs-frontend` | Generate human-readable, styled user documentation by driving the running app with Playwright MCP, taking real screenshots per role, and wr… |
| `frontend` | Implement a frontend task end-to-end under strict test-driven design, with a browser-driven visual verification loop. Use for any frontend… |
| `gitnexus-cli` | Use when the user needs to run GitNexus CLI commands like analyze/index a repo, check status, clean the index, generate a wiki, or list ind… |
| `gitnexus-debugging` | Use when the user is debugging a bug, tracing an error, or asking why something fails. Examples: "Why is X failing?", "Where does this erro… |
| `gitnexus-exploring` | Use when the user asks how code works, wants to understand architecture, trace execution flows, or explore unfamiliar parts of the codebase… |
| `gitnexus-guide` | Use when the user asks about GitNexus itself — available tools, how to query the knowledge graph, MCP resources, graph schema, or workflow… |
| `gitnexus-impact-analysis` | Use when the user wants to know what will break if they change something, or needs safety analysis before editing code. Examples: "Is it sa… |
| `gitnexus-refactoring` | Use when the user wants to rename, extract, split, move, or restructure code safely. Examples: "Rename this function", "Extract this into a… |
| `handoff` | Produce a structured HANDOFF.md and hand remaining work to fresh-context subagents. Use when the context window is getting full (~60%+ used… |
| `pr-critic-dx` | Adversarial developer experience critic for PR review. Use as one lens of the /as-pr-review critic panel — tries to REFUTE the change from… |
| `pr-critic-maintainability` | Adversarial maintainability critic for PR review. Use as one lens of the /as-pr-review critic panel — tries to REFUTE the change from a mai… |
| `pr-critic-performance` | Adversarial performance critic for PR review. Use as one lens of the /as-pr-review critic panel — tries to REFUTE the change from a perform… |
| `pr-critic-security` | Adversarial security critic for PR review. Use as one lens of the /as-pr-review critic panel — tries to REFUTE the change from a security s… |
| `pr-critic-simplicity` | Adversarial simplicity critic for PR review. Use as one lens of the /as-pr-review critic panel — tries to REFUTE the change from a simplici… |
| `pr-review-backend` | Review backend changes against architecture rules. Use when a PR or branch diff touches ./ — architecture violations, role enforcement, sec… |
| `pr-review-frontend` | Review frontend changes against architecture rules. Use when a PR or branch diff touches frontend/ — component compliance, i18n parity, sto… |
| `smith-mode` | Enforces staged execution discipline on large tasks: a written stage plan, parallel delegation where the runtime supports it, a failable ve… |
| `smoke-test` | Post-PR verification — launch the app and check health, then walk the migrate/smoke/rollback checklist. Use after a merge or before a relea… |
| `test-backend` | Write or extend backend tests. Use for any backend test work — service methods, views, repositories, permissions, audit, encryption. Enforc… |
| `test-frontend` | Write or extend frontend tests. Use for any frontend test work — components, views, stores, API functions, role-gated rendering, i18n keys.… |

## Available MCP tools

See `docs/architecture/mcp-tools.md` for exact tool names and signatures; `.mcp.json` for the
configured set in this project.

| Name | Purpose |
|------|---------|
| `gitnexus` | Code graph — impact/blast-radius, callers, route maps. Use before editing or renaming a public symbol, and to understand architecture. |
| `git-memory` | Commit history & rationale — why code changed, bug-fix history, file timelines. Use when investigating a regression or a non-obvious design. |
| `playwright` | Drive the running app — navigate, fill, snapshot, screenshot. Use to verify frontend flows and capture real UI for docs. |
| `chrome-devtools` | Deep browser inspection — console messages, network requests, performance traces. Use when a flow misbehaves or to profile the UI. |
| `sentrux` | Architectural quality gate — scan, rules, DSM, test-gaps. Use to check structural health before commit and to find weak spots. |
| `obsidian` | Project knowledge vault — read/write the docs notes. Use to record and retrieve human-readable documentation. |

<!-- agent-smith:end -->
