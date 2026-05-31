# Codex Handoff: Phase 3D Dry-Run Planning

## 1. Project Status Summary
- **Project**: Paper Agent — AI Agent 기반 학술논문 탐색 및 문헌검토 자동화 시스템
- **Repository**: Vulter3653/paper-agent-project
- **Current verified main commit**: `20e9192a77c5d87d83e7a43ef217064d0405c504`
- **Latest completed phase**: Phase 3C Post-Migration Verification
- **Current next phase**: Phase 3D T004-T020 Dry-Run Planning

## 2. Completed Phases Flow
- **Phase 3A**: Production D1 Migration Approval Package 작성 및 검수 완료.
- **Phase 3B**: Production D1 migration 수동 실행 완료.
- **Phase 3C**: Post-migration verification 완료.

### Phase 3C Results
- Production D1 schema migration applied.
- Backup was created before migration.
- Backup file was moved outside the repository.
- Backup file was not committed to Git.
- Post-migration PRAGMA checks passed.
- Existing T001-T003 controlled benchmark remained intact.
- verify-live-benchmark passed.
- typecheck passed.
- build:web passed.

## 3. Backup Evidence
- **Backup file**: `../paper-agent-d1-backups/backup_pre_migration_0007_manual_20260531T111148Z.sql`
- **Backup size**: `9.0M`
- **Policy**: The backup file was intentionally moved outside the repository and must not be committed to Git.

## 4. Production D1 Schema Changes (Migration 0007)

### Table: `benchmark_runs` (New Columns)
- `parent_run_id` (TEXT)
- `batch_id` (TEXT)
- `is_derived` (INTEGER, Default 0)
- `merge_status` (TEXT, Default 'none')

### Table: `benchmark_run_tasks` (New Columns)
- `retry_count` (INTEGER, Default 0)
- `last_error` (TEXT)
- `last_error_at` (TEXT)

### Created Indexes
- `idx_benchmark_runs_parent_run_id`
- `idx_benchmark_runs_batch_id`
- `idx_benchmark_run_tasks_retry_count`

## 5. Current Benchmark State & Claim Boundary
- **Current live controlled benchmark**:
  - `run_id` = `2026-05-30-controlled-t001-t003`
  - `comparison row count` = 9
  - `status` = verified after migration

### **STRICT CLAIM BOUNDARY**
- This confirms Production D1 schema readiness for batch benchmark orchestration.
- This does **not** mean that T004-T020 benchmark has been executed.
- This does **not** establish improved benchmark performance.
- Full 20-task validation is **not yet complete**.
- Proposed Agent outperform has **not been established**.
- The next step is **dry-run planning**, not full benchmark execution.

## 6. Codex Next Steps: Phase 3D Dry-Run Planning
Codex should now focus on designing the dry-run protocol and safety gates.

1.  **Define dry-run scope**
    - Recommended initial scope: T004-T006 or T004-T008.
    - **Do not run T004-T020 full benchmark yet.**
2.  **Define run naming convention**
    - `parent_run_id`, `batch_id`, derived run id, `merge_status` convention.
3.  **Define failure tracking behavior**
    - `retry_count`, `last_error`, `last_error_at`.
4.  **Define dry-run safety gates**
    - Pre-run verification, quota check, existing T001-T003 baseline check.
    - No seed/import, no destructive D1 operation.
5.  **Define post-dry-run verification**
    - PRAGMA schema remains stable, T001-T003 still intact.
    - New batch rows are isolated, dashboard/API does not crash.
6.  **Define merge/aggregation plan**
    - How derived runs are linked to parent run.
    - When `merge_status` changes from none/pending/completed/failed.
    - How partial failures are represented.
7.  **Define approval gate before full execution**
    - Full T004-T020 benchmark must not run until dry-run result is reviewed and approved.

## 7. Prohibited Actions
Codex must **not**:
- execute full T004-T020 benchmark without explicit approval.
- overwrite T001-T003 controlled benchmark data.
- seed/import D1 data without explicit approval.
- alter migration 0007 after it has been applied.
- commit backup SQL files.
- claim benchmark completion before metrics are generated and verified.
- claim outperform before baseline comparison supports it.

## 8. Required Reading List
Codex must review the following files before proceeding:
- `docs/phase-3c-post-migration-verification.md`
- `docs/phase-3b-manual-migration-runbook.md`
- `docs/production-d1-migration-approval-package.md`
- `docs/benchmark-batch-protocol.md`
- `docs/benchmark-batch-schema-api-design.md`
- `docs/benchmark-batch-migration-static-review.md`
- `docs/benchmark-batch-local-schema-test.md`
- `docs/final-report-integrity.md`
- `benchmark/gold_audit_report.md`
- `apps/worker/migrations/0007_add_benchmark_batch_columns.sql`
- `scripts/verify-live-benchmark.mjs`

## 9. Codex Start Sentence
> I am taking over the Paper Agent project after Phase 3C Post-Migration Verification. Production D1 schema migration 0007 has been applied and verified. Existing T001-T003 controlled benchmark integrity remains intact. T004-T020 has not been executed. My next task is Phase 3D: design a dry-run plan for limited T004-T006 or T004-T008 batch benchmark execution, including run naming, failure tracking, safety gates, and post-run verification. I must not run the full benchmark until the dry-run protocol is reviewed and approved.
