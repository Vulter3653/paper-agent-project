# Phase 3J T004-T006 Artifact-Only Dry-Run Report

Updated: 2026-05-31

## 1. Status

- T004-T006 artifact-only dry-run executed through the approved gated wrapper.
- Execution was limited to the approved T004-T006 scope.
- This is artifact-only execution evidence, not benchmark validation.
- Full T004-T020 validation remains incomplete.
- D1 batch-aware persistence is not implemented.

## 2. Execution Boundary

The following command was already executed after explicit project-owner approval. Do not rerun it without a new explicit approval.

```bash
node benchmark/scripts/run-limited-batch-dry-run.mjs \
  --scope T004-T006 \
  --mode execute \
  --i-understand-this-writes-artifacts \
  --i-understand-this-calls-production-worker \
  --approved-run-id 2026-05-31-dryrun-t004-t006-batch-001
```

The approved wrapper called the Production Worker search-job API and generated isolated local artifacts. It did not execute a direct D1 command or persist batch-aware D1 metadata.

## 3. Artifact Location

```text
benchmark/runs/2026-05-31-dryrun-t004-t006-batch-001/proposed_agent_results.csv
benchmark/runs/2026-05-31-dryrun-t004-t006-batch-001/proposed_agent_jobs.csv
```

## 4. Artifact Structure

### `proposed_agent_results.csv`

- File exists: YES
- Data rows: `50` (`51` lines including header)
- Columns: `22`
- Task IDs present: `T004`, `T005`, `T006`
- Obvious runner error rows: none observed
- SHA-256: `cdbdc93ffddf51873de046d7d9f34adc9b23ab2d935f0e05ba0d09d489dc6c42`

Columns:

```text
task_id, keyword, job_id, result_rank, paper_id, title, authors, year, journal,
journal_field, journal_rank, doi, final_score, abstract_score, include_status,
verification_status, verification_reason, unpaywall_status, oa_pdf_url,
oa_landing_page_url, cited_by_count, relevance_reason
```

Paper-level enrichment fields such as `unpaywall_status` may contain non-success states. Those values are artifact evidence and are not runner failures.

### `proposed_agent_jobs.csv`

- File exists: YES
- Data rows: `3` (`4` lines including header)
- Columns: `12`
- Task IDs present: `T004`, `T005`, `T006`
- Status values present: `completed`
- Obvious error rows: none observed; all `error_message` fields are empty
- SHA-256: `e93e434c946de204c95ea70dc864d671ad436abce417c944cfb115a20061dc31`

Columns:

```text
task_id, keyword, journal_category_id, job_id, status, current_step,
source_result_count, allowed_result_count, paper_count, started_at,
completed_at, error_message
```

## 5. Task Summary

| Task | Status | Source candidates | Allowed results | Artifact rows | Notes |
| --- | --- | ---: | ---: | ---: | --- |
| T004 | completed | 50 | 20 | 20 | artifact-only evidence |
| T005 | completed | 50 | 12 | 12 | artifact-only evidence |
| T006 | completed | 50 | 18 | 18 | artifact-only evidence |

Totals:

```text
tasksRequested: 3
jobRows: 3
resultRows: 50
```

## 6. Safety Checks

| Check | Result |
| --- | --- |
| T004-T020 run | NO |
| Direct D1 command executed | NO |
| Migration executed | NO |
| Benchmark scripts modified | NO |
| Gold labels modified | NO |
| Execute npm script added | NO |
| Controlled T001-T003 artifacts modified | NO |
| Legacy artifacts overwritten | NO |
| `benchmark/proposed_agent_debug.jsonl` appended | NO |

## 7. Claim-Safe PPT Insertion Block

> An approved T004-T006 artifact-only dry-run was executed through the gated wrapper. The run produced isolated local artifacts with 3 job rows and 50 result rows: T004 produced 20 rows, T005 produced 12 rows, and T006 produced 18 rows. This result is artifact-only execution evidence, not full benchmark validation. Full T004-T020 validation remains incomplete, and D1 batch-aware persistence is not implemented.

## 8. Forbidden Wording Reminder

Do not use:

```text
T004-T006 benchmark validated
T004-T020 benchmark completed
Full 20-task validation complete
Proposed Agent globally outperforms baseline
D1 batch-aware persistence completed
```

## 9. Artifact Preservation Recommendation

Recommended current policy: **Keep artifacts untracked and summarize them in documentation.**

Do not commit the generated CSV artifacts yet. Decide whether to commit, export separately, or archive them after Gemini completes a read-only post-run audit.
