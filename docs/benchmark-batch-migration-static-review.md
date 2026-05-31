# Benchmark Batch Migration Static Review

Updated: 2026-05-31 (Phase 2B Static Review Phase)

## 1. Migration Purpose
This migration (`apps/worker/migrations/0007_add_benchmark_batch_columns.sql`) enables the T004-T020 benchmark expansion by adding orchestration columns. It allows grouping independent execution chunks (batches) and enhances failure resilience through task-level retry tracking.

## 2. Added Columns

### 2.1 Table: `benchmark_runs`
| Column | Type | Nullable | Default | Compatibility |
| :--- | :--- | :--- | :--- | :--- |
| `parent_run_id` | TEXT | YES | NULL | Backward compatible. Existing runs become "standalone" master runs. |
| `batch_id` | TEXT | YES | NULL | Backward compatible. Existing runs have no batch ID. |
| `is_derived` | INTEGER | NO | 0 | Backward compatible. Existing runs are marked as non-derived (raw data). |
| `merge_status` | TEXT | YES | 'none' | Backward compatible. Existing runs remain 'none'. |

### 2.2 Table: `benchmark_run_tasks`
| Column | Type | Nullable | Default | Compatibility |
| :--- | :--- | :--- | :--- | :--- |
| `retry_count` | INTEGER | NO | 0 | Backward compatible. Existing tasks have 0 retries. |
| `last_error` | TEXT | YES | NULL | Backward compatible. |
| `last_error_at` | TEXT | YES | NULL | Backward compatible. |

## 3. Proposed Indexes
- `idx_benchmark_runs_parent_run_id`: Optimized for grouping batches under a master run.
- `idx_benchmark_runs_batch_id`: Optimized for searching specific execution chunks.
- `idx_benchmark_run_tasks_retry_count`: Useful for identifying unstable tasks across large runs.

## 4. Integrity and Baseline Protection
- **Non-Destructive**: Uses `ALTER TABLE ... ADD COLUMN`. No tables or columns are dropped.
- **Controlled Run Safety**: The existing `2026-05-30-controlled-t001-t003` record will remain unchanged except for having NULL/Default values in the new columns, preserving its validity.
- **No Data Mutation**: No `UPDATE` or `DELETE` statements are included in the migration.

## 5. SQLite/D1 Compatibility Notes
- SQLite's `ALTER TABLE` supports adding columns with defaults.
- Column order is not guaranteed after adding columns in some SQLite GUIs, but application code using column names remains unaffected.
- **Rollback Limitation**: D1/SQLite does not support `DROP COLUMN`. If rollback is required, a full table recreation or restoration from D1 backup is necessary.

## 6. Pre-Production Checklist
Before applying this migration to Production D1:
- [ ] Run `npm run benchmark:audit-gold` to ensure gold labels are valid.
- [ ] Run `node scripts/verify-live-benchmark.mjs` to confirm current production health.
- [ ] Perform a local D1 backup or export (`wrangler d1 export`).
- [ ] Verify that no benchmark runner is currently active.
- [ ] Confirm that the controlled T001-T003 run still returns P@5 ~0.1333 after the schema change.
- [ ] Verify dashboard fallback behavior (handling NULL `parent_run_id`).
- [ ] **Mandatory**: Obtain explicit user approval after reviewing the local D1 test results.

## 7. Prohibition and Execution Status
- **NOT EXECUTED**: This migration script was created for review only.
- **DO NOT EXECUTE**: Do not run `wrangler d1 execute` or any migration command during this phase.

(gemini)
