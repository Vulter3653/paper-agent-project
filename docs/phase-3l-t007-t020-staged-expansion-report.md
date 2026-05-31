# Phase 3L T007-T020 Staged Expansion Report

Date: 2026-05-31

## 1. Scope

Phase 3L performed a safety-gated staged expansion toward T020. The staged wrapper allowed only:

1. `T007-T012` (Batch 1)
2. `T013-T018` (Batch 2)
3. `T019-T020` (Batch 3)

All three batches have been executed.

This is artifact-only execution evidence. It is not benchmark validation. Full T004-T020 validation remains incomplete. D1 batch-aware persistence is not implemented.

## 2. Why Staged Execution Was Used

The staged approach prevents an uncontrolled broad run and preserves prior evidence:

- controlled T001-T003 artifacts remain protected
- approved T004-T006 artifact-only outputs remain protected
- each new batch writes to an isolated local directory
- T019-T020 legacy HTTP 503 evidence was investigated and followed by a successful artifact-only run

## 3. Wrapper And Gate Behavior

Implemented wrapper:

```text
benchmark/scripts/run-staged-expanded-dry-run.mjs
```

The wrapper supports `plan`, `preflight`, and guarded `execute` modes. It rejects broad scopes such as `T004-T020`, `T001-T020`, `ALL`, and `FULL`. Execute mode requires both explicit acknowledgement flags and the exact approved run ID.

All staged batch preflights passed:

| Scope | Run ID | Artifact directory | Preflight |
| --- | --- | --- | --- |
| T007-T012 | `2026-05-31-dryrun-t007-t012-batch-002` | `benchmark/runs/2026-05-31-dryrun-t007-t012-batch-002/` | PASS |
| T013-T018 | `2026-05-31-dryrun-t013-t018-batch-003` | `benchmark/runs/2026-05-31-dryrun-t013-t018-batch-003/` | PASS |
| T019-T020 | `2026-05-31-dryrun-t019-t020-batch-004` | `benchmark/runs/2026-05-31-dryrun-t019-t020-batch-004/` | PASS |

## 4. Batch Summaries

| Batch | Scope | Execution status | Result rows | Notes |
| --- | --- | --- | --- | --- |
| Batch 1 | T007-T012 | PARTIAL | 87 | T007 timed out; T008-T012 completed |
| Batch 2 | T013-T018 | COMPLETED | 120 | 6 tasks completed successfully |
| Batch 3 | T019-T020 | COMPLETED | 40 | 2 tasks completed successfully; no HTTP 503 was observed in this isolated staged run |

## 5. T007-T012 Results (Batch 1)

| Task | Status | Source candidates | Allowed results | Artifact rows | Notes |
| --- | --- | --- | --- | --- | --- |
| T007 | failed | n/a | n/a | 0 | runner timeout after 250250ms and 21 polling attempts |
| T008 | completed | 50 | 20 | 20 | artifact-only evidence |
| T009 | completed | 50 | 20 | 20 | artifact-only evidence |
| T010 | completed | 50 | 20 | 20 | artifact-only evidence |
| T011 | completed | 50 | 7 | 7 | artifact-only evidence |
| T012 | completed | 50 | 20 | 20 | artifact-only evidence |

## 6. T013-T018 Results (Batch 2)

| Task | Status | Source candidates | Allowed results | Artifact rows | Notes |
| --- | --- | --- | --- | --- | --- |
| T013 | completed | 36 | 20 | 20 | artifact-only evidence |
| T014 | completed | 50 | 20 | 20 | artifact-only evidence |
| T015 | completed | 50 | 20 | 20 | artifact-only evidence |
| T016 | completed | 50 | 20 | 20 | artifact-only evidence |
| T017 | completed | 50 | 20 | 20 | artifact-only evidence |
| T018 | completed | 50 | 20 | 20 | artifact-only evidence |

## 7. T019-T020 Results (Batch 3)

| Task | Status | Source candidates | Allowed results | Artifact rows | Notes |
| --- | --- | --- | --- | --- | --- |
| T019 | completed | 50 | 20 | 20 | artifact-only evidence |
| T020 | completed | 50 | 20 | 20 | artifact-only evidence |

## 8. Failure Evidence

Legacy and current failure evidence:

```text
T007
Timed out waiting for job job-cf6ac39a-cad1-4d39-8061-72708c344dfd after 250250ms [Attempts: 21]

(Legacy T019/T020)
Worker exceeded resource limits | 503
```

## 9. Artifact Locations

Generated and left untracked:

**Batch 1 (T007-T012)**
- `benchmark/runs/2026-05-31-dryrun-t007-t012-batch-002/proposed_agent_results.csv`
- `benchmark/runs/2026-05-31-dryrun-t007-t012-batch-002/proposed_agent_jobs.csv`

Checksums:
- `68146b8b18f98b27cd8ecea5537d74292c53b5f4562b32ae9b471fb09cbd4564  proposed_agent_results.csv`
- `ccdc2b90da533bfdc6440460eca02ac7873a0d09640413b9e18f2901b5ed4220  proposed_agent_jobs.csv`

**Batch 2 (T013-T018)**
- `benchmark/runs/2026-05-31-dryrun-t013-t018-batch-003/proposed_agent_results.csv`
- `benchmark/runs/2026-05-31-dryrun-t013-t018-batch-003/proposed_agent_jobs.csv`

Checksums:
- `a3157c33736d7db2d32c14c6dea20c12e3815d5bcc69e827aa691a32c5c5a9bf  proposed_agent_results.csv`
- `d37ef3bf3d94193bad2fdae3e435cc1cf1920b227ef7f2ec2d8019e8c3938e1e  proposed_agent_jobs.csv`

**Batch 3 (T019-T020)**
- `benchmark/runs/2026-05-31-dryrun-t019-t020-batch-004/proposed_agent_results.csv`
- `benchmark/runs/2026-05-31-dryrun-t019-t020-batch-004/proposed_agent_jobs.csv`

Checksums:
- `333f6eb82c4d77632f7c2b56c84d48d1f84eb448eb206bb967685006b61878b9  proposed_agent_results.csv`
- `2e71f53b8a4a4c8be397cc150019de8e1b66e3daff7813e8b5893b6a33c19608  proposed_agent_jobs.csv`

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

## 11. Claim-Safe Summary

An approved staged T007-T020 artifact expansion was completed through a gated wrapper. All batches (Batch 1, 2, 3) were executed, resulting in artifact coverage for tasks T008-T020, while task T007 recorded an infrastructure timeout. This produces artifact-only execution evidence, not full benchmark validation. Full T004-T020 validation remains incomplete as metrics were not merged into the controlled quantitative layer (T001-T003). D1 batch-aware persistence remains unimplemented.

## 12. Forbidden Wording Reminder

Do not use:

- Full T004-T020 validation complete
- T004-T020 benchmark validated
- Proposed Agent globally outperforms baseline
- Full 20-task benchmark completed
- D1 batch-aware persistence completed
- T019-T020 issue resolved

## 13. Artifact Preservation Recommendation

Keep generated CSV artifacts untracked. These provide the necessary artifact evidence for the submission package without polluting the tracked benchmark repository.

## 14. Remaining Gaps

- Controlled quantitative comparison remains limited to T001-T003.
- D1 batch-aware persistence remains incomplete.
- Human-in-the-loop evaluation of artifact rows for future gold-label creation.
