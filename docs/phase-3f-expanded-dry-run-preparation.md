# Phase 3F Expanded Dry-Run Preparation Framework

Updated: 2026-05-31

## 1. Purpose

This document expands the preparation framework from T004-T006 to T004-T018.
It does not approve execution.
It does not run benchmarks.
It does not modify D1.
It does not complete evaluation or debugging.

This phase adds print-only planning metadata. It does not close the runtime implementation gap.

## 2. Scope Matrix

| Scope | Task count | Risk | Run ID | Batch ID | Approved for execution | Recommended use |
| --- | ---: | --- | --- | --- | --- | --- |
| `T004-T006` | 3 | LOWER | `2026-05-31-dryrun-t004-t006-batch-001` | `batch-001-t004-t006` | NO | Smallest first dry-run preparation |
| `T004-T008` | 5 | MEDIUM | `2026-05-31-dryrun-t004-t008-batch-001` | `batch-001-t004-t008` | NO | Small expansion preparation |
| `T004-T012` | 9 | HIGH | `2026-05-31-dryrun-t004-t012-batch-001` | `batch-001-t004-t012` | NO | Medium expansion preparation |
| `T004-T018` | 15 | VERY_HIGH | `2026-05-31-dryrun-t004-t018-batch-001` | `batch-001-t004-t018` | NO | Maximum non-T020 preparation boundary |

Shared parent run ID:

```text
2026-05-31-expanded-t004-t020-parent
```

All scopes are preparation-only metadata. None is approved for execution.

## 3. Why T004-T018 Is Maximum Preparation Boundary

T004-T018 is allowed only as preparation boundary because legacy partial evidence exists up to T018.
T019-T020 had legacy failure/HTTP 503 evidence and must not be hidden.
T004-T018 must not be described as full validation.
T004-T018 still excludes T019-T020 and does not equal T004-T020.

Legacy T001-T018 partial artifacts are not equivalent to a new Production D1 batch orchestration run. Full T004-T020 validation has not been completed. Proposed Agent outperform has not been established.

## 4. Helper Behavior

```text
file: benchmark/scripts/prepare-limited-dry-run-command.mjs
purpose: print non-approved candidate plans for allowed scopes
approvedForExecution: always false
candidateCommandStatus: always NOT_APPROVED_FOR_EXECUTION
```

Allowed scopes:

```text
T004-T006
T004-T008
T004-T012
T004-T018
```

The helper accepts only `--mode plan`, defaults omitted mode to `plan`, prints JSON to stdout, and rejects forbidden scopes or arguments with JSON on stderr and exit code `1`.

It has no external dependency, network call, file write, D1 access, child process, or benchmark execution path.

## 5. Remaining Execution Gap

The helper does not close the batch-aware execution gap.
The existing runner still cannot persist parent_run_id, batch_id, retry_count, last_error, and last_error_at.
A future implementation is required before actual execution.

The existing runner also uses positional `--start` and `--limit`, calls the Production Worker, and writes artifacts. Its printed command remains a non-approved candidate only. The helper does not delegate to it.

## 6. Risks

| Risk | Level | Mitigation |
| --- | --- | --- |
| T004-T018 may be mistaken for full T004-T020 validation | HIGH | Mark every plan as not approved and preserve the explicit non-T020 boundary. |
| Legacy partial artifacts may be confused with new Production D1 batch orchestration | HIGH | Treat legacy evidence as partial only and require new run IDs for any future approved work. |
| Existing runner may write broad artifacts | HIGH | Print candidate strings only. Do not invoke the runner. |
| Existing runner still lacks batch-aware D1 persistence | HIGH | Require a separately reviewed implementation before execution. |
| T019-T020 failures may be hidden | HIGH | Keep HTTP 503 and failure evidence visible. Exclude T019-T020 from all allowed scopes. |
| Migration 0007 may be rerun | HIGH | Keep the applied migration frozen. Do not execute migration commands. |
| T001-T003 controlled evidence may be overwritten | HIGH | Preserve `2026-05-30-controlled-t001-t003` as immutable. |
| Preparation may be misread as performance evidence | HIGH | Prohibit evaluation, outperform, and full-validation claims in this phase. |

## 7. Next Step

Next implementation may design a true batch-aware execution wrapper.
Actual T004-T006/T008/T012/T018 execution remains prohibited.
Full T004-T020 execution remains prohibited.
