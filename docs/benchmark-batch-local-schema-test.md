# Benchmark Batch Local Schema Test Report

Updated: 2026-05-31 (Phase 2C Local Schema Test)

## 1. Test Scope
The goal of this test was to verify that the Phase 2B migration draft (`apps/worker/migrations/0007_add_benchmark_batch_columns.sql`) can be applied to a local D1/SQLite environment without breaking the schema and while correctly adding the required orchestration columns.

## 2. Local-only Commands Executed
- Baseline Schema Application: `npx wrangler d1 execute paper_agent_db --local --file=apps/worker/schema.sql`
- Migration Application: `npx wrangler d1 execute paper_agent_db --local --file=apps/worker/migrations/0007_add_benchmark_batch_columns.sql`
- Schema Verification: `PRAGMA table_info(...)` and `PRAGMA index_list(...)`

## 3. Production D1 Safety Confirmation
- **Production D1 NOT Used**: All commands utilized the `--local` flag.
- **No `--remote` used**: Verified that no remote execution was performed during this test.

## 4. Migration Results

### 4.1 Schema Verification (`benchmark_runs`)
| Column | Existence | Expected Default/Nullable | Status |
| :--- | :--- | :--- | :--- |
| `parent_run_id` | PRESENT | NULL | PASS |
| `batch_id` | PRESENT | NULL | PASS |
| `is_derived` | PRESENT | 0 (NOT NULL) | PASS |
| `merge_status` | PRESENT | 'none' | PASS |

### 4.2 Schema Verification (`benchmark_run_tasks`)
| Column | Existence | Expected Default/Nullable | Status |
| :--- | :--- | :--- | :--- |
| `retry_count` | PRESENT | 0 (NOT NULL) | PASS |
| `last_error` | PRESENT | NULL | PASS |
| `last_error_at` | PRESENT | NULL | PASS |

### 4.3 Index Verification
- `idx_benchmark_runs_parent_run_id`: PRESENT
- `idx_benchmark_runs_batch_id`: PRESENT
- `idx_benchmark_run_tasks_retry_count`: PRESENT

## 5. Controlled Run Check
- **Run ID**: `2026-05-30-controlled-t001-t003`
- **Result**: **Local baseline data not available.** (The local DB was initialized with a fresh schema for this test).
- **Impact**: Non-destructive application was verified via SQL syntax and schema state, but actual row preservation was not empirically tested on this local instance due to lack of seed data.

## 6. Risk Assessment
- **Syntax Compatibility**: PASS. SQLite/D1 successfully executed all `ALTER TABLE` statements.
- **Backward Compatibility**: PASS. Adding nullable columns or columns with defaults does not affect existing query logic that selects specific columns.
- **Rollback Risk**: Rollback is not natively supported by D1 `ALTER TABLE`. Full DB restoration would be required if the schema change needs to be reverted.

## 7. Approval Conditions for Production
Before remote migration:
1. User must approve the Phase 2B/2C documentation.
2. Local backup of Production D1 via `wrangler d1 export`.
3. Confirm that no benchmark processes are running during migration.

**STATUS: LOCAL TEST SUCCESSFUL (Production migration still pending)**

(gemini)
