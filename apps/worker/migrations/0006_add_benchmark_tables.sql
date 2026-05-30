CREATE TABLE IF NOT EXISTS benchmark_runs (
  id TEXT PRIMARY KEY,
  run_label TEXT NOT NULL,
  benchmark_scope TEXT NOT NULL,
  task_range TEXT NOT NULL,
  status TEXT NOT NULL,
  methods TEXT NOT NULL,
  source_commit TEXT,
  gold_version TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS benchmark_run_tasks (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  keyword TEXT,
  status TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  error_message TEXT,
  FOREIGN KEY (run_id) REFERENCES benchmark_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS benchmark_run_results (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  method TEXT NOT NULL,
  rank INTEGER NOT NULL,
  title TEXT NOT NULL,
  doi TEXT,
  journal TEXT,
  journal_rank TEXT,
  verification_status TEXT,
  verification_reason TEXT,
  result_source TEXT,
  source_job_id TEXT,
  matched_gold_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES benchmark_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS benchmark_run_metrics (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  method TEXT NOT NULL,
  precision_at_5 REAL,
  ndcg_at_5 REAL,
  gold_doi_hit_rate_at_5 REAL,
  doi_presence_rate_at_5 REAL,
  top_journal_precision_at_5 REAL,
  paper_validity_rate_at_5 REAL,
  accepted_exception_count INTEGER,
  matched_gold_ids TEXT,
  matched_dois TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES benchmark_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS benchmark_run_artifacts (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  storage TEXT NOT NULL,
  object_key TEXT,
  url_path TEXT,
  content_type TEXT,
  status TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES benchmark_runs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_benchmark_run_tasks_run_id ON benchmark_run_tasks(run_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_run_results_run_id ON benchmark_run_results(run_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_run_metrics_run_id ON benchmark_run_metrics(run_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_run_artifacts_run_id ON benchmark_run_artifacts(run_id);
