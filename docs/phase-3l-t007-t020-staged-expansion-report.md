# Phase 3L T007-T020 Staged Expansion Report

Date: 2026-05-31

## 1. Scope

Phase 3L attempted a safety-gated staged expansion toward T020. The staged wrapper allowed only:

1. `T007-T012`
2. `T013-T018`
3. `T019-T020`

Only Batch 1 (`T007-T012`) was executed. Batch 2 and Batch 3 were not executed because Batch 1 produced a task-level timeout.

This is artifact-only execution evidence. It is not benchmark validation. Full T004-T020 validation remains incomplete. D1 batch-aware persistence is not implemented.

## 2. Why Staged Execution Was Used

The staged approach prevents an uncontrolled broad run and preserves prior evidence:

- controlled T001-T003 artifacts remain protected
- approved T004-T006 artifact-only outputs remain protected
- each new batch writes to an isolated local directory
- a failure stops later batches
- T019-T020 legacy HTTP 503 evidence remains visible

## 3. Wrapper And Gate Behavior

Implemented wrapper:

```text
benchmark/scripts/run-staged-expanded-dry-run.mjs
```

The wrapper supports `plan`, `preflight`, and guarded `execute` modes. It rejects broad scopes such as `T004-T020`, `T001-T020`, `ALL`, and `FULL`. Execute mode requires both explicit acknowledgement flags and the exact approved run ID.

All three staged batch preflights passed before Batch 1 execution:

| Scope | Run ID | Artifact directory | Preflight |
| --- | --- | --- | --- |
| T007-T012 | `2026-05-31-dryrun-t007-t012-batch-002` | `benchmark/runs/2026-05-31-dryrun-t007-t012-batch-002/` | PASS |
| T013-T018 | `2026-05-31-dryrun-t013-t018-batch-003` | `benchmark/runs/2026-05-31-dryrun-t013-t018-batch-003/` | PASS |
| T019-T020 | `2026-05-31-dryrun-t019-t020-batch-004` | `benchmark/runs/2026-05-31-dryrun-t019-t020-batch-004/` | PASS |

## 4. Batch Summaries

| Batch | Scope | Execution status | Result rows | Notes |
| --- | --- | --- | --- | --- |
| Batch 1 | T007-T012 | PARTIAL | 87 | T007 timed out; T008-T012 completed |
| Batch 2 | T013-T018 | NOT EXECUTED | 0 | stopped after Batch 1 timeout |
| Batch 3 | T019-T020 | NOT EXECUTED | 0 | stopped after Batch 1 timeout; legacy HTTP 503 evidence remains visible |

## 5. T007-T012 Results

| Task | Status | Source candidates | Allowed results | Artifact rows | Notes |
| --- | --- | --- | --- | --- | --- |
| T007 | failed | n/a | n/a | 0 | runner timeout after 250250ms and 21 polling attempts |
| T008 | completed | 50 | 20 | 20 | artifact-only evidence |
| T009 | completed | 50 | 20 | 20 | artifact-only evidence |
| T010 | completed | 50 | 20 | 20 | artifact-only evidence |
| T011 | completed | 50 | 7 | 7 | artifact-only evidence |
| T012 | completed | 50 | 20 | 20 | artifact-only evidence |

Batch 1 produced 6 job rows and 87 result rows.

## 6. T013-T018 Results

Not executed. Batch 2 remains pending because Batch 1 recorded a timeout.

## 7. T019-T020 Results

Not executed in Phase 3L. Existing legacy T019-T020 resource-limit / HTTP 503 evidence remains visible in `benchmark/proposed_agent_debug.jsonl`.

## 8. Failure Evidence

New failure evidence:

```text
T007
Timed out waiting for job job-cf6ac39a-cad1-4d39-8061-72708c344dfd after 250250ms [Attempts: 21]
```

The runner appended one `TIMEOUT` JSONL record to `benchmark/proposed_agent_debug.jsonl`. This append is intentionally left unstaged pending a separate preservation decision.

## 9. Artifact Locations

Generated and left untracked:

```text
benchmark/runs/2026-05-31-dryrun-t007-t012-batch-002/proposed_agent_results.csv
benchmark/runs/2026-05-31-dryrun-t007-t012-batch-002/proposed_agent_jobs.csv
```

Checksums:

```text
68146b8b18f98b27cd8ecea5537d74292c53b5f4562b32ae9b471fb09cbd4564  proposed_agent_results.csv
ccdc2b90da533bfdc6440460eca02ac7873a0d09640413b9e18f2901b5ed4220  proposed_agent_jobs.csv
```

## 10. Safety Checks

| Check | Result |
| --- | --- |
| uncontrolled T004-T020 run | NO |
| ALL/FULL run | NO |
| D1 command | NO |
| migration | NO |
| gold label modification | NO |
| controlled T001-T003 overwrite | NO |
| T004-T006 overwrite | NO |
| legacy artifact overwrite | NO |
| execute npm script added | NO |
| Batch 2 / Batch 3 execution after Batch 1 timeout | NO |

## 11. Claim-Safe Summary

An approved staged T007-T020 artifact expansion attempt was started through a gated wrapper. Only Batch 1 (`T007-T012`) was executed. T007 timed out, while T008-T012 produced isolated local artifacts with 87 result rows. Batch 2 (`T013-T018`) and Batch 3 (`T019-T020`) were not executed. This is partial artifact-only execution evidence, not full benchmark validation. Full T004-T020 validation remains incomplete, and D1 batch-aware persistence is not implemented.

## 12. Forbidden Wording Reminder

Do not use:

- Full T004-T020 validation complete
- T004-T020 benchmark validated
- Proposed Agent globally outperforms baseline
- Full 20-task benchmark completed
- D1 batch-aware persistence completed
- T019-T020 issue resolved

## 13. Artifact Preservation Recommendation

Keep generated CSV artifacts untracked for now. Preserve checksums in documentation and decide whether to export or commit artifacts after a separate read-only audit.

## 14. Remaining Gaps

- Diagnose the T007 timeout before approving any further staged execution.
- Decide whether `benchmark/proposed_agent_debug.jsonl` append should be committed as tracked failure evidence.
- Perform a separate read-only audit of Batch 1 artifacts.
- Re-request explicit approval before any T013-T018 or T019-T020 execution.
- Implement D1 batch-aware persistence separately if required.
