# Phase 3G Batch-Aware Limited Dry-Run Wrapper Implementation

Updated: 2026-05-31

## 1. Purpose

This document records the implementation of an execution-capable but strongly gated limited T004-T006 dry-run wrapper.
It does not approve execution.
It does not run benchmarks during implementation.
It does not modify D1 during implementation.

## 2. Implemented Wrapper

```text
file: benchmark/scripts/run-limited-batch-dry-run.mjs
supported modes: plan, preflight, execute
execute mode: implemented but not tested or run
default mode: plan
```

The wrapper isolates artifact paths by run ID and prints structured JSON for successful and failed operations.

## 3. Scope Policy

```text
T004-T006: plan, preflight, execute-capable after explicit approval
T004-T008: plan-only
T004-T012: plan-only
T004-T018: plan-only
T004-T020: forbidden
T019-T020: forbidden
```

T001-T003 controlled evidence remains immutable. T004-T018 preparation must not be described as full validation. T019-T020 legacy failure or HTTP 503 evidence must remain visible.

## 4. Safety Gates

Execute mode requires all of the following:

```text
--mode execute
--scope T004-T006
--i-understand-this-writes-artifacts
--i-understand-this-calls-production-worker
--approved-run-id 2026-05-31-dryrun-t004-t006-batch-001
```

Additional guards:

```text
execute mode refuses broad scopes
execute mode refuses forbidden fragments
artifact path is isolated by run_id
controlled T001-T003 run_id is protected
existing artifact directory requires an explicit override
```

## 5. Remaining Gap

The wrapper can prepare and gate a limited artifact dry-run.
However, current runner output does not yet persist parent_run_id, batch_id, retry_count, last_error, and last_error_at into Production D1.
True batch-aware D1 persistence remains a future implementation step.

Execute mode is therefore artifact-only until a separately reviewed D1 persistence implementation exists.

## 6. Allowed Commands

```bash
npm run benchmark:limited-dry-run:plan
npm run benchmark:limited-dry-run:preflight
```

## 7. Forbidden During This Phase

```text
No execute command was run.
No benchmark runner was run.
No D1 command was run.
No migration was run.
No seed/import was run.
```

## 8. Future Explicit Execution Command

Example only:

```bash
node benchmark/scripts/run-limited-batch-dry-run.mjs \
  --scope T004-T006 \
  --mode execute \
  --i-understand-this-writes-artifacts \
  --i-understand-this-calls-production-worker \
  --approved-run-id 2026-05-31-dryrun-t004-t006-batch-001
```

Status:

```text
NOT APPROVED YET
```

The command calls the Production Worker and writes isolated artifacts. It does not yet persist batch metadata to D1.

## 9. Next Step

Next step is user review of the wrapper.
Actual T004-T006 execution requires explicit approval.
Full T004-T020 remains prohibited.
