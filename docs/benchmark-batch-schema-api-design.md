# Benchmark Batch Schema & API Extension Design

Updated: 2026-05-31 (Phase 2 Design Phase)

## 1. Purpose
- **Batch Orchestration**: To enable the expansion of quantitative evaluation from 3 tasks (T001-T003) to 20 tasks (T004-T020), we need a structured way to manage independent execution chunks (batches).
- **Isolation of Claims**: Existing controlled benchmark data (T001-T003) must be strictly separated from expanded "Partial Evidence" runs to maintain academic integrity.
- **Resilience and Retries**: Infrastructure limits (Cloudflare CPU, WoS Quota) require a schema that tracks task-level retries and failures without invalidating the entire run.
- **Baseline Protection**: Absolute protection of the `2026-05-30-controlled-t001-t003` production artifacts and D1 records is mandatory.

## 2. Current Schema Review

### 2.1 `benchmark_runs`
- **Current Role**: Stores top-level metadata for a single benchmark execution pass.
- **Controlled T001-T003 State**: Sufficient for single-pass continuous runs.
- **Batch Expansion Gap**: Lacks hierarchy. Cannot group multiple independent batches into a single "Full 20-Task" report. No way to identify if a run is a partial batch or a final merged result.

### 2.2 `benchmark_run_tasks`
- **Current Role**: Tracks the execution status of each task within a run.
- **Controlled T001-T003 State**: Sufficient for simple Success/Fail tracking.
- **Batch Expansion Gap**: No retry tracking. If a task fails due to an infrastructure limit, we cannot record how many times it was attempted or what the specific error was without manual log inspection.

### 2.3 `benchmark_run_metrics` & `benchmark_run_results`
- **Current Role**: Stores calculated macro-averages and row-level evidence.
- **Controlled T001-T003 State**: Sufficient for the current scale.
- **Batch Expansion Gap**: Lacks source attribution for merged runs. When multiple batches are merged, we need to know which batch provided which result row.

### 2.4 `benchmark_run_artifacts`
- **Current Role**: Links to R2-stored files (CSV, JSON).
- **Controlled T001-T003 State**: Sufficient.
- **Batch Expansion Gap**: Needs to distinguish between raw batch artifacts and derived merged artifacts.

## 3. Required Batch Metadata

| Field | Table | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `parent_run_id` | `benchmark_runs` | TEXT | Links a batch run to a master "Virtual Run" (e.g., 'expanded-20-task-v1'). |
| `batch_id` | `benchmark_runs` | TEXT | Human-readable identifier (e.g., 'batch-1-of-4'). |
| `is_derived` | `benchmark_runs` | INTEGER | Flag (0/1) to identify if the run is a calculated merge of other batches. |
| `merge_status` | `benchmark_runs` | TEXT | `none` \| `merged`. |
| `retry_count` | `benchmark_run_tasks` | INTEGER | Tracks implementation stability and infra limits per task. |
| `last_error` | `benchmark_run_tasks` | TEXT | Stores the specific error message (e.g., WoS 429, Worker 503). |
| `last_error_at` | `benchmark_run_tasks` | TEXT | Timestamp of the last failure for retry-delay calculations. |

## 4. Minimal Schema Extension Proposal

### 4.1 Mandatory Fields (Phase 2B)
| Field | Table | Type | Null | Default | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `parent_run_id` | `benchmark_runs` | TEXT | YES | NULL | Required for batch grouping. |
| `is_derived` | `benchmark_runs` | INTEGER | NO | 0 | Distinguishes master reports from raw data. |
| `retry_count` | `benchmark_run_tasks` | INTEGER | NO | 0 | Enables resume-on-failure logic. |

### 4.2 Desirable Fields (Phase 2D)
| Field | Table | Type | Null | Default | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `batch_id` | `benchmark_runs` | TEXT | YES | NULL | Clarity in Ops Dashboard. |
| `last_error` | `benchmark_run_tasks` | TEXT | YES | NULL | Granular failure analysis. |

### 4.3 Deferred Fields
- `approval_status`, `approved_by`: Can be handled via commit messages/PR reviews for now.
- `chunk_range`, `chunk_index`: Can be derived from `batch_id` or `notes`.

## 5. API Extension Design

### 5.1 `GET /api/benchmark-runs` (Update)
- **Purpose**: Support filtering by `is_derived` and `parent_run_id`.
- **Query Params**: `?parent_run_id=...`, `?include_batches=true`.
- **Backward Compatibility**: Fully compatible. Default returns all runs.

### 5.2 `GET /api/benchmark-runs/:id/batches` (New)
- **Purpose**: Fetch all individual batches belonging to a master run.
- **Response Shape**: Array of `benchmark_runs` records.
- **Priority**: Medium (Ops Dashboard focus).

### 5.3 `GET /api/benchmark-diagnostics` (New)
- **Purpose**: Health check for the benchmark system (WoS Quota used, CPU limit hits, D1 row counts).
- **Response Shape**: `{ wos: { remaining: 82 }, tasks: { total: 20, verified: 3 } }`.
- **Priority**: High (Risk mitigation).

## 6. Runner Integration Design
- **Batch Creation**: Runner checks if a `parent_run_id` exists in D1. If not, creates a master `is_derived: 1` placeholder.
- **Task Execution**: Runner queries `benchmark_run_tasks` for the current batch. Skips tasks where `status = 'completed'`.
- **Failure Handling**: On error, increments `retry_count` and stores `last_error`.
- **Resume Logic**: Runner can be restarted with the same `batch_id`. It only picks up `pending` or `failed` tasks.
- **Merge Action**: After all batches in a `parent_run_id` reach `completed`, a specialized script aggregates metrics into the master `is_derived: 1` run.

## 7. Verification Gate Design

### 7.1 Pre-Run Approval Gate
- Check: `npm run benchmark:audit-gold` (Zero errors).
- Check: `source_commit` matches current main HEAD.
- Check: WoS Quota > (Task Count * 2).

### 7.2 Per-Batch Verification Gate
- Check: `rowCount === BatchSize` (e.g., 5).
- Check: `taskRange` is strictly within batch definition.
- Check: All `benchmark_run_metrics` entries are non-zero.

### 7.3 Merge Verification Gate
- Check: `total_tasks === 20`.
- Check: No duplicate `task_id` across batches.
- Check: Macro-averages match the sum of batch metrics.

## 8. Dashboard Integration Design

### 8.1 Evaluation Dashboard
- **Category Filter**: Toggle between `Controlled (T001-T003)` and `Expanded (Full 20)`.
- **Claim Boundary Warning**: Automatically displays "Warning: Expanded results include infrastructure-limited tasks" if `retry_count > 0` or tasks are missing.
- **Metric Origin**: Tooltip showing which batch a specific task result came from.

### 8.2 Ops Dashboard
- **Batch Progress Panel**: Progress bars for Batch 1, 2, 3, and 4.
- **Resource limit Warning**: Red indicator if `last_error` contains "CPU Limit" or "Quota Exceeded".

## 9. Backward Compatibility and Baseline Protection
- **Immutable Run ID**: `2026-05-30-controlled-t001-t003` records will never be modified. `is_derived` will remain `0`.
- **Null Safety**: All new fields are nullable or have defaults to prevent breaking existing dashboard code.
- **Artifact Isolation**: Expanded artifacts will use `reports/expanded/...` or timestamped subfolders to avoid collision with production evidence.

## 10. Migration Plan
- **File Name**: `apps/worker/migrations/0005_add_benchmark_batch_columns.sql`.
- **Rollback**: Standard `DROP COLUMN` is not supported in SQLite/D1 via Wrangler, so fallback plan is to ignore fields or restore from D1 backup.
- **Local Test**: `wrangler d1 execute DB --local --file=...` followed by `npm run smoke:worker`.
- **Production Guard**: No `wrangler d1 seed` will be run. Only schema extension.

## 11. Implementation Roadmap
- **Phase 2A**: Schema/API Design Review (CURRENT).
- **Phase 2B**: Migration Draft & Static Validation.
- **Phase 2C**: Local D1 Schema Extension Test.
- **Phase 2D**: Worker API Implementation (Batch grouping logic).
- **Phase 2E**: Dashboard Integration (Batch progress visibility).
- **Phase 3**: Batch Runner Implementation.
- **Phase 4**: T004-T020 Execution (Sequential batches).

## 12. Prohibited Actions
- **NO EXECUTION**: Do not run `benchmark:run-expanded` or `run-proposed`.
- **NO SEED**: Do not re-run D1 seeding.
- **NO OVERWRITE**: Do not modify existing T001-T003 CSV/JSON files.
- **NO MIGRATION CREATION**: This phase is DESIGN ONLY. No `.sql` files allowed.

(gemini)
