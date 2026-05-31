# Phase 3D T004-T006 Dry-Run Plan

Updated: 2026-05-31

## 1. Purpose

Phase 3D prepares a safety-gated limited dry-run plan for T004-T006 after Production D1 migration 0007.

This is not full T004-T020 execution.
This is not a performance claim.
This is a safety-gated dry-run plan.

This document defines the boundaries, naming convention, failure tracking protocol, verification gates, and approval conditions for a future limited dry-run executor. It does not authorize or execute a benchmark runner, D1 write, seed/import, migration, or Production modification.

## 2. Evidence Boundary

The verified live controlled benchmark remains T001-T003 only.

- Controlled `run_id`: `2026-05-30-controlled-t001-t003`
- Controlled comparison row count: `9`
- Production D1 migration `0007_add_benchmark_batch_columns.sql`: applied and verified

Legacy isolated expanded artifacts may mention T001-T018 partial outcomes, but they are not equivalent to a new Production D1 batch orchestration run or final validation.

T001-T018 partial legacy evidence must not be described as completed full validation.

T019-T020 legacy failures or HTTP 503 evidence must not be hidden.

Production D1 batch orchestration for T004-T020 has not been executed.

Full 20-task validation is not complete.

Proposed Agent outperform has not been established.

## 3. Recommended Dry-Run Scope

The recommended first dry-run scope is fixed to:

```text
T004-T006
```

Reasons:

- smaller first batch
- lower quota risk
- easier failure isolation
- enough to test `parent_run_id`, `batch_id`, `retry_count`, `last_error`, `last_error_at`, and `merge_status` behavior

The first dry-run must not include T007-T020.

## 4. Run Naming Convention

Use the following identifiers for the future approved limited dry-run:

```text
parent_run_id:
2026-05-31-expanded-t004-t020-parent

batch_id:
batch-001-t004-t006

dry_run_id:
2026-05-31-dryrun-t004-t006-batch-001
```

Intended `benchmark_runs` values:

```text
benchmark_runs.parent_run_id = 2026-05-31-expanded-t004-t020-parent
benchmark_runs.batch_id = batch-001-t004-t006
benchmark_runs.is_derived = 0 for independent dry-run batch rows
benchmark_runs.merge_status = none or pending before merge
```

Phase 3D must not create a derived aggregate.

Only a separately approved future aggregate may use:

```text
is_derived = 1
merge_status = completed / partial_failed / failed
```

## 5. Failure Tracking Protocol

Use the following `benchmark_run_tasks` fields:

```text
retry_count
last_error
last_error_at
```

Rules:

```text
retry_count starts at 0.
Increment retry_count only for infrastructure/tool failures, not relevance failure.
last_error stores concise failure class and message.
last_error_at stores UTC ISO timestamp.
Do not overwrite gold labels to hide retrieval/ranking failures.
```

Allowed failure classes:

```text
retrieval_failure
api_quota_failure
doi_verification_failure
metadata_mismatch
oa_lookup_failure
runner_timeout
dashboard_api_failure
unexpected_exception
```

Task-level failures must remain visible. A failed task must not be silently removed from the dry-run result and must not be converted into a successful result by modifying gold labels.

## 6. Pre-Dry-Run Gates

A future approved dry-run executor must run:

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

Required pass conditions:

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

These gates are for a future approved executor. They are not executed during this documentation-only Phase 3D planning task.

## 7. Dry-Run Execution Boundary

This document intentionally does not provide an approved execution command.

Any later command proposed for explicit user approval must satisfy all of the following:

```text
- must target only T004-T006
- must write a new run_id
- must not overwrite 2026-05-30-controlled-t001-t003
- must populate parent_run_id and batch_id
- must record task-level status in benchmark_run_tasks
- must not perform seed/import
- must not rerun migration 0007
```

The current `package.json` exposes manual runner candidates. They are recorded for risk containment only.

```text
Candidate command found:
npm run benchmark:run-proposed

Status:
NOT APPROVED FOR EXECUTION DURING THIS PHASE
```

```text
Candidate command found:
npm run benchmark:run-expanded

Status:
NOT APPROVED FOR EXECUTION DURING THIS PHASE
```

```text
Candidate command found:
npm run benchmark:run-expanded-retry

Status:
NOT APPROVED FOR EXECUTION DURING THIS PHASE
```

None of the existing candidates is approved as the Phase 3D limited dry-run command. A future executor must first present an isolated T004-T006 command design for review.

## 8. Post-Dry-Run Verification

After a separately approved limited dry-run execution, inspect the new isolated rows with:

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

The controlled T001-T003 regression gate remains mandatory after any future dry-run.

## 9. Success Criteria

Dry-run success does not mean that performance scores are high.

Dry-run success requires:

```text
- new dry-run run appears in benchmark_runs
- T004-T006 task rows are isolated from T001-T003
- task-level failures, if any, are recorded rather than hidden
- retry_count/last_error/last_error_at behavior is observable
- existing T001-T003 controlled benchmark still passes
- dashboard/API does not crash
- no seed/import occurred
- migration 0007 was not rerun
```

## 10. Failure Criteria

The dry-run must be treated as failed if any of the following occurs:

```text
- T001-T003 controlled data changed or disappeared
- dry-run overwrites old run_id
- full T004-T020 executes accidentally
- D1 seed/import occurs
- migration 0007 is rerun
- benchmark task failures are not recorded
- dashboard/API crashes
- output cannot be traced to run_id/batch_id
```

## 11. Risk Register

| Risk | Level | Mitigation |
| --- | --- | --- |
| Migration `0007` rerun risk | HIGH | Freeze `apps/worker/migrations/0007_add_benchmark_batch_columns.sql`. Do not execute it again. Verify schema state with read-only queries only. |
| `package.json` exposes manual expanded runners | HIGH | Treat all existing runner commands as not approved. Require an explicit user-approved T004-T006-only command before execution. |
| `docs/gemini-session-state.md` stale SHA risk | HIGH | Treat the file as non-authoritative. Verify Git state only with raw `git` commands. Do not update the session-state file during Phase 3D planning. |
| Legacy expanded artifacts can be mistaken for full validation | HIGH | Label T001-T018 legacy outcomes as partial isolated evidence. Keep T019-T020 HTTP 503 failures visible. Separate them from the new Production D1 batch process. |
| `scripts/verify-live-benchmark.mjs` updates docs artifacts | MEDIUM/HIGH | Do not execute it during documentation-only planning. Future executors must expect tracked evidence JSON and report changes and review them before commit. |
| T001-T003 controlled baseline overwrite | HIGH | Preserve `2026-05-30-controlled-t001-t003` as immutable. New dry-run rows require a new `run_id`. |
| Hidden task-level failure | HIGH | Persist `retry_count`, `last_error`, and `last_error_at`; never hide failures by rewriting gold labels. |

## 12. Approval Gate for Phase 3E

Phase 3E expanded or full execution may only be considered after:

1. Phase 3D dry-run plan is reviewed.
2. User explicitly approves a limited T004-T006 dry-run execution.
3. Dry-run result is documented.
4. Failure analysis is completed.
5. T001-T003 integrity remains intact.

Full T004-T020 execution is not approved by this document.
