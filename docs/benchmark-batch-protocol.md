# Benchmark Batch Protocol

## A. Purpose
The **Benchmark Batch Protocol** is designed to safely extend our quantitative evaluation from the initial controlled set (T001-T003) to the full 20-task scope (T004-T020). This protocol addresses the following critical constraints:
- **Cloudflare Worker CPU Limits**: Complex agent pipelines involving multiple tool calls (WoS, Crossref, Unpaywall, Drive) often exceed the 50ms CPU time limit on standard plans if run concurrently or at high volume.
- **Web of Science (WoS) Quota**: Our starter tier has strict rate limits and daily query caps (~100 queries/day). Continuous full-run execution risks depleting this quota prematurely.
- **External API Latency**: High latency from scholarly APIs can cause polling timeouts at the dashboard or script level.
- **Partial Failure Risk**: In a 20-task run, a single infrastructure failure (e.g., HTTP 503 from a provider) should not invalidate the entire multi-hour run.

## B. Current Baseline
- **Run ID**: `2026-05-30-controlled-t001-t003`
- **Scope**: Controlled evaluation of tasks T001, T002, and T003.
- **Infrastructure**: Backed by Production D1 and R2.
- **Evidence**: Verified Precision@5 (~0.1333) and NDCG (~0.3579).
- **Claim Boundary**: **Current quantitative accuracy claims are strictly limited to the T001-T003 controlled layer.** Any data for T004-T020 is currently labeled as "Partial Evidence" or "Planned".

## C. Target Scope
- **Target Tasks**: T004 through T020 (17 additional tasks).
- **Goal**: Achieve full 20-task validation with the Proposed Multi-Agent architecture.
- **Success Criteria**: 100% task completion rate across the expanded set with zero data corruption of the T001-T003 baseline.

## D. Batch Design (Task Chunking)
To minimize risk, tasks will be divided into the following independent batches:
- **Batch 1**: T004 - T008 (5 tasks)
- **Batch 2**: T009 - T013 (5 tasks)
- **Batch 3**: T014 - T018 (5 tasks)
- **Batch 4**: T019 - T020 (2 tasks - known infra limit edge cases)

**Execution Rules**:
- Each batch must be executable as a standalone command.
- Each batch generates its own timestamped artifacts in `benchmark/runs/<timestamp>-batch-<id>/`.
- D1 records must be distinct for each batch to prevent ID collisions.

## E. Retry / Resume Strategy
- **Task-Level Granularity**: The runner must detect which tasks in a batch failed and allow re-execution of only those specific tasks.
- **Avoid Duplication**: Completed tasks (status: `completed` in D1 or verified in local CSV) must be skipped during a retry.
- **Metadata Tracking**: For every retry, the following must be recorded in the `benchmark_run_tasks` or a new `benchmark_run_retries` table:
  - `retry_count`
  - `error_reason` (HTTP status, error message)
  - `retry_timestamp`

## F. Partial Result Merge
- **Merge Process**: Individual batch summaries will be merged into a single `expanded_benchmark_summary.json`.
- **Artifact Preservation**: Raw artifacts from individual batches (CSV, JSON) must be preserved in their original folders.
- **Derived Labeling**: The final merged result must be explicitly tagged as a `derived_merged_artifact` to distinguish it from a single-pass continuous run.

## G. D1 Schema / Artifact Strategy (Proposed)
We propose extending the current schema to support batch orchestration:
- `benchmark_runs` table:
  - `batch_id`: Optional identifier for the specific chunk.
  - `parent_run_id`: Link to the master "Full 20-Task" run ID.
  - `merge_status`: `none` | `merged`.
- `benchmark_run_tasks` table:
  - `retry_count`: Track implementation stability.
  - `last_error`: Store detailed failure logs for infrastructure analysis.

## H. Verification Gates
- **Pre-Execution Gate**: Mandatory `npm run benchmark:audit-gold` to ensure target task gold labels are verified.
- **Post-Batch Gate**: Immediate execution of a batch-specific verification script to confirm `rowCount` (e.g., 5/5) and data integrity.
- **Final Regression Gate**: Run `scripts/verify-live-benchmark.mjs` against the merged D1 state to ensure top-level macro-averages remain consistent.

## I. Dashboard Integration
- **Evaluation Dashboard**:
  - Add a "Run Category" filter: `Controlled` vs `Expanded`.
  - Display the "Claim Boundary" dynamically based on the selected run's `benchmark_scope` field.
- **Ops Dashboard**:
  - Add a "Batch Progress" panel showing the status of the 4 active chunks.
  - Highlight "Resource Limit" failures (e.g., T019-T020) with specific infrastructure alerts.

## J. Prohibited Actions
- **No Premature Execution**: Do not run `benchmark:run-expanded` or `benchmark:run-proposed` until this protocol is formally approved.
- **Gold Integrity**: Absolute prohibition on modifying Gold label CSVs during the expansion run.
- **Baseline Protection**: Never overwrite `benchmark/runs/2026-05-30-controlled-t001-t003/` or its associated D1 records.

## K. Implementation Roadmap
1. **Phase 1**: Protocol review and user approval.
2. **Phase 2**: Minimal D1 schema extension (add `parent_run_id` and `retry_count`).
3. **Phase 3**: Batch runner implementation (`scripts/run-batch-benchmark.mjs`).
4. **Phase 4**: Dry-run with Batch 4 (T019-T020) to test failure handling.
5. **Phase 5**: Sequential execution of Batch 1, 2, and 3.
6. **Phase 6**: Merging, verification, and dashboard integration of the full 20-task result.

(gemini)
