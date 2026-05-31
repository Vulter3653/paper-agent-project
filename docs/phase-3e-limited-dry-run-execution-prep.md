# Phase 3E Limited T004-T006 Dry-Run Execution Preparation

Updated: 2026-05-31

## 1. Purpose

This document prepares a future limited T004-T006 dry-run execution.
It does not authorize execution.
It does not run benchmarks.
It does not modify D1.
It does not establish performance claims.

This is an execution preparation package only. Evaluation and debugging are deferred to later phases.

## 2. Current Baseline

| Item | Verified state |
| --- | --- |
| Current verified controlled run | `2026-05-30-controlled-t001-t003` |
| Controlled comparison row count | `9` |
| Production D1 migration 0007 | Applied and verified |
| Next allowed execution scope after approval | `T004-T006` only |

Migration `0007_add_benchmark_batch_columns.sql` is frozen. It must not be rerun or modified.

## 3. Evidence Boundary

Legacy T001-T018 partial artifacts are not equivalent to a new Production D1 batch orchestration run.
T019-T020 legacy failures or HTTP 503 evidence must remain visible.
Full T004-T020 validation has not been completed.
Proposed Agent outperform has not been established.

The verified live controlled benchmark remains T001-T003 only. Production D1 batch orchestration for T004-T020 has not been executed.

## 4. Existing Runner / Script Inventory

| Script name | Command | Target scope if known | Executes benchmark? | Writes or generates SQL? | Touches D1? | Risk | Phase 3E status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `benchmark:run-proposed` | `node benchmark/scripts/run-proposed-agent.mjs` | All tasks by default | YES | NO | YES, indirectly through Production Worker API | HIGH | FORBIDDEN for direct execution |
| `benchmark:run-expanded` | `node benchmark/scripts/run-proposed-agent.mjs --output benchmark/proposed_agent_results_expanded.csv --jobs-output benchmark/proposed_agent_jobs_expanded.csv` | All tasks by default | YES | NO | YES, indirectly through Production Worker API | HIGH | FORBIDDEN for direct execution |
| `benchmark:run-expanded-retry` | `node benchmark/scripts/run-proposed-agent.mjs --start 8 --limit 12 --output benchmark/proposed_agent_results_expanded_retry_t009_t020.csv --jobs-output benchmark/proposed_agent_jobs_expanded_retry_t009_t020.csv --poll-ms 10000 --delay-ms 5000 --max-results 10` | T009-T020 by positional slice | YES | NO | YES, indirectly through Production Worker API | HIGH | FORBIDDEN |
| `benchmark:audit-gold` | `node benchmark/scripts/audit-gold-labels.mjs` | Gold fixtures | NO, audit only | NO | NO | MEDIUM | NOT APPROVED during preparation |
| Independent artifact runner | `node benchmark/scripts/run-independent-benchmark.mjs` | T001-T003 by default; configurable fixture scope | YES, local artifact evaluation | YES, generates `insert_run.sql` | NO direct access | HIGH | NOT APPROVED |
| Live verification helper | `node scripts/verify-live-benchmark.mjs` | Controlled Production snapshot | NO, verification only | NO | Reads Production API; rewrites docs artifacts | MEDIUM/HIGH | NOT APPROVED during preparation |

`benchmark/scripts/run-proposed-agent.mjs` accepts positional `--start` and `--limit`, but it does not assert explicit task IDs. It calls the Production Worker `POST /api/search-jobs`, polls job endpoints, writes CSV artifacts, and appends `benchmark/proposed_agent_debug.jsonl`.

The existing runner does not accept an external `run_id`. It does not populate `parent_run_id`, `batch_id`, `retry_count`, `last_error`, or `last_error_at`. The Worker compatibility layer can read migration 0007 fields, but a batch-aware write orchestrator is not implemented.

`benchmark/scripts/run-independent-benchmark.mjs` does not execute D1 SQL, but it generates SQL containing `INSERT OR REPLACE`. Generated SQL is not an approved seed/import path.

## 5. Why Existing Runners Are Not Directly Approved

Existing runners may target broad ranges or legacy expanded evidence.
Existing runners may not enforce T004-T006-only scope.
Existing runners may not populate parent_run_id and batch_id.
Existing runners may not enforce T001-T003 immutability.
Existing runners may generate artifacts that can be mistaken for final evidence.
Therefore, no existing runner is approved for execution without a limited wrapper or explicit execution protocol.

The preparation helper added with this document blocks forbidden scopes and prints a candidate string only. It does not close the missing batch-aware D1 write-orchestration gap.

## 6. Required Limited Dry-Run Contract

A future approved command or wrapper must satisfy all of the following:

```text
scope = T004-T006 only
run_id = 2026-05-31-dryrun-t004-t006-batch-001
parent_run_id = 2026-05-31-expanded-t004-t020-parent
batch_id = batch-001-t004-t006
is_derived = 0
merge_status = none or pending
must not overwrite 2026-05-30-controlled-t001-t003
must not seed/import controlled baseline
must not rerun migration 0007
must not execute full T004-T020
must record task-level failures
must preserve retry_count, last_error, last_error_at
```

Migration 0007 schema fields exist, but the current runtime runner does not satisfy this contract. Before execution, a separately reviewed implementation or explicit execution protocol is required.

## 7. Preflight Checklist

A future approved executor must run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git ls-remote origin refs/heads/main
node scripts/verify-live-benchmark.mjs
npm run benchmark:audit-gold
npm run typecheck
npm run build:web
```

Required gates:

```text
working tree clean
branch = main
HEAD = origin/main = ls-remote main
verify-live-benchmark PASS
T001-T003 row count = 9
gold audit PASS
typecheck PASS
build:web PASS
```

The benchmark-related commands above are future preflight gates. They were not executed during this documentation-only preparation task.

## 8. Proposed Execution Options

### Option A: Existing runner with strict arguments

- Candidate concept: constrain `run-proposed-agent.mjs` with `--start 3 --limit 3`.
- Status: **NOT APPROVED FOR EXECUTION**.
- Risk: HIGH. It uses positional slicing, calls the Production Worker, writes artifacts, and cannot persist the required batch orchestration fields.

### Option B: New limited wrapper with batch-aware orchestration

- Candidate concept: validate explicit task IDs, persist the required batch contract, delegate only the approved T004-T006 retrieval work, and record task-level failures.
- Status: **PREFERRED DESIGN, NOT APPROVED FOR EXECUTION**.
- Risk: MEDIUM/HIGH until separately implemented and reviewed.

### Option C: Manual D1 seed/import

- Status: **FORBIDDEN UNLESS EXPLICITLY APPROVED**.
- Risk: HIGH. It can overwrite controlled evidence or bypass traceability.

Preparation-only helper usage example:

```bash
node benchmark/scripts/prepare-limited-dry-run-command.mjs --scope T004-T006
```

This example only prints a non-approved candidate command. It does not run a benchmark.

Candidate command found:

```text
node benchmark/scripts/run-proposed-agent.mjs --start 3 --limit 3 --output benchmark/runs/2026-05-31-dryrun-t004-t006-batch-001/proposed_agent_results.csv --jobs-output benchmark/runs/2026-05-31-dryrun-t004-t006-batch-001/proposed_agent_jobs.csv
```

Status:

```text
NOT APPROVED FOR EXECUTION DURING THIS PHASE
```

The candidate does not yet populate the required Production D1 batch fields and must not be executed as-is.

## 9. Post-Execution Verification Plan

After a future explicitly approved dry-run, inspect:

```sql
SELECT id, run_label, benchmark_scope, task_range, status, parent_run_id, batch_id, is_derived, merge_status, created_at
FROM benchmark_runs
WHERE id = '2026-05-31-dryrun-t004-t006-batch-001';

SELECT task_id, status, retry_count, last_error, last_error_at
FROM benchmark_run_tasks
WHERE run_id = '2026-05-31-dryrun-t004-t006-batch-001'
ORDER BY task_id;

SELECT COUNT(*) AS metric_rows
FROM benchmark_run_metrics
WHERE run_id = '2026-05-31-dryrun-t004-t006-batch-001';

SELECT id, task_range, status
FROM benchmark_runs
WHERE id = '2026-05-30-controlled-t001-t003';
```

Then run:

```bash
node scripts/verify-live-benchmark.mjs
npm run typecheck
npm run build:web
```

## 10. Required Final Report for Future Execution

```text
LIMITED T004-T006 DRY-RUN EXECUTION REPORT

1. Final Status
2. Git State
3. Preflight Results
4. Execution Command
5. New Run ID
6. D1 Rows Created
7. Task-Level Status
8. Failure Tracking
9. T001-T003 Regression Check
10. Dashboard/API Check
11. Changed Files
12. Claim Boundary
13. Next Step
```

## 11. Risk Register

| Risk | Level | Mitigation |
| --- | --- | --- |
| Legacy artifact confusion | HIGH | Label legacy T001-T018 evidence as partial only. Keep T019-T020 failures visible. |
| Full T004-T020 accidental run | HIGH | Require explicit `T004-T006` validation and reject broader ranges before any delegation. |
| Migration 0007 rerun | HIGH | Freeze migration 0007. Do not execute migration commands. |
| D1 seed/import | HIGH | Prohibit manual SQL execution and generated SQL import without separate approval. |
| T001-T003 overwrite | HIGH | Require immutable controlled run ID and regression verification. |
| Runner writes broad artifacts | HIGH | Use isolated paths and reject default outputs before any future execution. |
| `verify-live-benchmark` docs update side effect | MEDIUM/HIGH | Run only in an approved verification phase and inspect generated docs changes. |
| Stale `gemini-session-state` | HIGH | Treat it as non-authoritative. Do not update it during this package. |
| Outperform claim before evidence | HIGH | Prohibit performance claims until controlled evidence and approved evaluation exist. |

## 12. Approval Gate

This preparation package does not approve execution.
A future limited T004-T006 dry-run requires explicit user approval.
Full T004-T020 execution remains prohibited.
Evaluation and debugging are deferred to later phases.

