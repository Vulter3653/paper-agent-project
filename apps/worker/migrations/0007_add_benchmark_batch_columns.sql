-- Migration: Add batch orchestration columns to benchmark tables
-- Purpose: Enable T004-T020 expansion via chunks while maintaining T001-T003 integrity.

-- 1. Extend benchmark_runs for batch hierarchy
ALTER TABLE benchmark_runs ADD COLUMN parent_run_id TEXT;
ALTER TABLE benchmark_runs ADD COLUMN batch_id TEXT;
ALTER TABLE benchmark_runs ADD COLUMN is_derived INTEGER NOT NULL DEFAULT 0;
ALTER TABLE benchmark_runs ADD COLUMN merge_status TEXT DEFAULT 'none';

-- 2. Extend benchmark_run_tasks for failure resilience
ALTER TABLE benchmark_run_tasks ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE benchmark_run_tasks ADD COLUMN last_error TEXT;
ALTER TABLE benchmark_run_tasks ADD COLUMN last_error_at TEXT;

-- 3. Create supportive indexes (Proposed for D1 compatibility)
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_parent_run_id ON benchmark_runs(parent_run_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_batch_id ON benchmark_runs(batch_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_run_tasks_retry_count ON benchmark_run_tasks(retry_count);
