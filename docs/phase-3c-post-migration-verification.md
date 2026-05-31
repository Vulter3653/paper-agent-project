# Phase 3C Post-Migration Verification

## 1. Migration Applied Status
The Production D1 migration `apps/worker/migrations/0007_add_benchmark_batch_columns.sql` has been successfully executed and verified.

## 2. Backup Evidence
D1 backup was successfully created before migration.
- **Backup file**: `../paper-agent-d1-backups/backup_pre_migration_0007_manual_20260531T111148Z.sql`
- **Backup size**: `9.0M`
- **Policy**: The backup file was intentionally moved outside the repository and was not committed to Git.

## 3. Verified Schema Changes
The following columns were added to the production D1 database:

### Table: `benchmark_runs`
- `parent_run_id` (TEXT)
- `batch_id` (TEXT)
- `is_derived` (INTEGER, Default 0)
- `merge_status` (TEXT, Default 'none')

### Table: `benchmark_run_tasks`
- `retry_count` (INTEGER, Default 0)
- `last_error` (TEXT)
- `last_error_at` (TEXT)

## 4. Verified Indexes
The following indexes were successfully created:
- `idx_benchmark_runs_parent_run_id`
- `idx_benchmark_runs_batch_id`
- `idx_benchmark_run_tasks_retry_count`

## 5. T001-T003 Regression Integrity
Strengthened live benchmark verification confirmed the integrity of the controlled baseline.
- **Run ID**: `2026-05-30-controlled-t001-t003`
- **Comparison Row Count**: 9
- **Status**: SUCCESS

## 6. Dashboard/API Compatibility Status
- **Typecheck**: PASS
- **Build:Web**: PASS
- **API Response**: Verified that existing endpoints correctly handle the extended schema with default values for legacy rows.

## 7. Evidence Boundary
- Backup export raw output available: YES
- Migration execution raw output available: YES (Manual execution evidence)
- Post-migration PRAGMA output available: YES
- T004-T020 executed: **NO**

## 8. Claim Boundary
- This confirms Production D1 schema readiness for batch benchmark orchestration.
- This does **not** mean that T004-T020 benchmark has been executed.
- This does **not** establish improved benchmark performance.
- The next step is Phase 3D dry-run planning, not full benchmark execution.

## 9. Next Step
Proceed to **Phase 3D: T004-T020 Dry-Run Planning**.
- Define the orchestration logic for the first batch.
- Verify the derived run merging mechanism in a controlled environment.
