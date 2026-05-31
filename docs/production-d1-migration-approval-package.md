# Phase 3A Production D1 Migration Approval Package

Updated: 2026-05-31

## 1. Executive Summary
This document serves as the formal approval package for the Production D1 database migration (`apps/worker/migrations/0007_add_benchmark_batch_columns.sql`). 

- **Purpose**: To enable the expansion of quantitative evaluation to T004-T020 tasks by adding orchestration and failure-tracking columns to the benchmark tables.
- **Status**: This is an **approval request document** only. No migration has been executed against the Production D1 instance.
- **Environment**: All pre-requisite local tests and compatibility implementations have been completed and verified.

## 2. Migration Target
- **Migration File**: `apps/worker/migrations/0007_add_benchmark_batch_columns.sql`
- **Target Database**: `paper_agent_db` (Production D1)
- **Environment**: Cloudflare D1 Production

## 3. Migration Contents

### 3.1 Added Columns
The following columns are added using non-destructive `ALTER TABLE ... ADD COLUMN` statements:

- **Table: `benchmark_runs`**
  - `parent_run_id` (TEXT, NULL): Links batches to a master run.
  - `batch_id` (TEXT, NULL): Identifies specific execution chunks.
  - `is_derived` (INTEGER, Default 0): Flags merged/derived reports.
  - `merge_status` (TEXT, Default 'none'): Tracks aggregation state.

- **Table: `benchmark_run_tasks`**
  - `retry_count` (INTEGER, Default 0): Tracks infrastructure-related retries.
  - `last_error` (TEXT, NULL): Stores granular failure messages.
  - `last_error_at` (TEXT, NULL): Timestamp of the last failure.

### 3.2 Added Indexes
- `idx_benchmark_runs_parent_run_id`: For master run grouping.
- `idx_benchmark_runs_batch_id`: For chunk identification.
- `idx_benchmark_run_tasks_retry_count`: For stability analysis.

## 4. Evidence Already Completed

| Evidence Source | Key Proof Provided |
| :--- | :--- |
| `docs/benchmark-batch-schema-api-design.md` | Defined the minimal, backward-compatible orchestration schema. |
| `docs/benchmark-batch-migration-static-review.md` | Verified that the SQL script is non-destructive and safe for production. |
| `docs/benchmark-batch-local-schema-test.md` | Successfully applied the migration to a fresh local D1 instance. |
| `docs/final-report-integrity.md` | Established strict provenance and integrity checks for this operation. |
| `scripts/verify-live-benchmark.mjs` | Confirmed 100% pass rate for current production T001-T003 data before migration. |

## 5. Pre-Migration Required Checks
The following items must be verified immediately before executing the production command:

- [ ] `node scripts/verify-live-benchmark.mjs`: PASS (Confirm production health).
- [ ] `npm run benchmark:audit-gold`: PASS (Confirm gold label integrity).
- [ ] `npm run typecheck`: PASS (Confirm code integrity).
- [ ] `npm run build:web`: PASS (Confirm dashboard build).
- [ ] **D1 Backup**: Run `npx wrangler d1 export paper_agent_db --remote --output=backup_pre_migration_0007.sql`.
- [ ] **Runner Status**: Confirm no `benchmark:run-proposed` or `run-expanded` processes are active.
- [ ] **Seeding Status**: Confirm no D1 seeding is currently in progress.
- [ ] **Data Retrieval**: Confirm `2026-05-30-controlled-t001-t003` is correctly returned by `/api/benchmark-runs`.
- [ ] **Dashboard Source**: Confirm Evaluation Dashboard reports `source: d1_benchmark_run`.

## 6. Exact Production Command — DO NOT RUN YET
The following command will be used to apply the migration.

```bash
npx wrangler d1 execute paper_agent_db --remote --file=apps/worker/migrations/0007_add_benchmark_batch_columns.sql
```

> [!CAUTION]
> **Do not run this command until explicit user approval is given.**

## 7. Post-Migration Verification Plan
Immediately after migration, the following steps must be taken to verify integrity:

1.  **Schema Check**: Run `npx wrangler d1 execute paper_agent_db --remote --command="PRAGMA table_info(benchmark_runs);"` and verify new columns exist.
2.  **Index Check**: Run `npx wrangler d1 execute paper_agent_db --remote --command="PRAGMA index_list(benchmark_runs);"` and verify orchestration indexes exist.
3.  **Baseline Check**: Run `node scripts/verify-live-benchmark.mjs` and confirm the `2026-05-30-controlled-t001-t003` metrics still match the baseline.
4.  **API Check**: Fetch `/api/benchmark-runs` and verify the existing run is returned with the new fields populated as NULL/Default.
5.  **Dashboard Check**: Refresh Evaluation and Ops Dashboards; verify no rendering crashes occur.

## 8. Rollback / Recovery Plan
- **D1 Limitation**: SQLite/D1 does not support `DROP COLUMN`.
- **Strategy**:
  - **Option A (Minor Issue)**: If fields are simply unused, keep them. The Worker API handles their absence gracefully.
  - **Option B (Critical Issue)**: Restore from the pre-migration export (`backup_pre_migration_0007.sql`) into a fresh D1 instance or replace the existing one if necessary.
- **Safety Net**: The implementation of `mapBenchmarkRunCompatibility` ensures that the application layer is indifferent to the presence or absence of these columns in the result set.

## 9. Risk Assessment

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Command Mistake | Data Loss | Strict copy-paste from this document; mandatory pre-migration backup. |
| D1 Unavailability | System Downtime | Migration takes < 1 second on current row count; performed during off-peak hours. |
| Retrieval Failure | Broken Dashboard | Backward compatibility helpers (`mapBenchmarkRunCompatibility`) already deployed. |
| Accidental Rerun | Inconsistent State | Runner processes are manually triggered; audit gates prevent unauthorized runs. |

## 10. Approval Gate

> [!IMPORTANT]
> **APPROVAL REQUIRED: Production D1 migration must not be executed until the user explicitly approves this package.**

(gemini)
