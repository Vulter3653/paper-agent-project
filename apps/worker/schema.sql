CREATE TABLE IF NOT EXISTS search_jobs (
  id TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  status TEXT NOT NULL,
  current_step TEXT NOT NULL,
  total_steps INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  error_message TEXT,
  source_result_count INTEGER DEFAULT 0,
  allowed_result_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  year INTEGER NOT NULL,
  journal_name TEXT NOT NULL,
  doi TEXT NOT NULL,
  oa_status TEXT NOT NULL,
  openalex_id TEXT,
  abstract TEXT,
  cited_by_count INTEGER DEFAULT 0,
  crossref_id TEXT,
  publisher TEXT,
  issn TEXT,
  publication_type TEXT,
  published_date TEXT,
  verification_status TEXT,
  verification_reason TEXT,
  oa_pdf_url TEXT,
  oa_landing_page_url TEXT,
  oa_license TEXT,
  oa_host_type TEXT,
  oa_repository TEXT,
  unpaywall_status TEXT,
  unpaywall_reason TEXT,
  drive_file_id TEXT,
  drive_web_url TEXT,
  drive_status TEXT,
  drive_reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES search_jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  paper_id TEXT NOT NULL,
  abstract_score REAL NOT NULL,
  relevance_score REAL DEFAULT 0,
  journal_fit_score REAL DEFAULT 0,
  verification_score REAL DEFAULT 0,
  oa_score REAL DEFAULT 0,
  citation_score REAL DEFAULT 0,
  recency_score REAL DEFAULT 0,
  final_score REAL NOT NULL,
  include_status TEXT NOT NULL,
  relevance_reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS critic_flags (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  paper_id TEXT NOT NULL,
  paper_rank INTEGER NOT NULL,
  severity TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  message TEXT NOT NULL,
  evidence TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES search_jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_outputs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  output_type TEXT NOT NULL,
  status TEXT NOT NULL,
  storage TEXT NOT NULL,
  object_key TEXT,
  url_path TEXT,
  content_type TEXT,
  detail TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES search_jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agent_traces (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT,
  input_count INTEGER DEFAULT 0,
  output_count INTEGER DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES search_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_papers_job_id ON papers(job_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_paper_id ON evaluations(paper_id);
CREATE INDEX IF NOT EXISTS idx_critic_flags_job_id ON critic_flags(job_id);
CREATE INDEX IF NOT EXISTS idx_critic_flags_paper_id ON critic_flags(paper_id);
CREATE INDEX IF NOT EXISTS idx_job_outputs_job_id ON job_outputs(job_id);
CREATE INDEX IF NOT EXISTS idx_agent_traces_job_id ON agent_traces(job_id);
CREATE INDEX IF NOT EXISTS idx_agent_traces_job_order ON agent_traces(job_id, step_order);

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
