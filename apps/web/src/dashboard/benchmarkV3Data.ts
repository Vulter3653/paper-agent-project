import deterministicSummary from "../../../../benchmark/validation/v3/benchmark_v3_deterministic_metrics_summary.json";
import baselineSupport from "../../../../benchmark/validation/v3/baseline_support_matrix_v3.json";
import layer5Representativeness from "../../../../benchmark/validation/v3/layer5_representativeness_v3.json";
import layer5Proxy from "../../../../benchmark/validation/v3/layer5_deterministic_semantic_proxy_v3.json";
import promotionGate from "../../../../benchmark/validation/v3/promotion_gate_summary_v3.json";
import controlledComparison from "../../../../benchmark/baseline_comparison_summary_actual_t001_t003_2026-05-30.json";

// Source of truth: generated benchmark/validation/v3 JSON artifacts.
// The controlled T001-T003 table remains a separate, explicitly scoped snapshot.
const metricMap = Object.fromEntries(deterministicSummary.metrics.map((metric) => [metric.metric_name, metric]));
const repositoryArtifactBase = "https://github.com/Vulter3653/paper-agent-project/blob/main/";

export const benchmarkV3 = {
  readiness: promotionGate.readiness_status,
  generatedAt: promotionGate.generated_at,
  scope: {
    tasks: baselineSupport.task_count,
    layers: 6,
    metrics: 30, // metric_spec_v3 count; semantic_coverage_rate remains a separately displayed audit supplement,
    comparableTasks: baselineSupport.comparable_tasks,
    comparableTaskCount: baselineSupport.comparable_task_count,
    baselineParity: baselineSupport.baseline_parity
  },
  layers: [
    ["Layer 1", "Foundation & Reproducibility", "Computed"],
    ["Layer 2", "Schema & Metadata", "Computed"],
    ["Layer 3", "Deterministic Validity", "Computed"],
    ["Layer 4", "Retrieval Accuracy", "Computed"],
    ["Layer 5", "Semantic Quality", "Partial / Proxy"],
    ["Layer 6", "Robustness & Risk", "Computed"]
  ],
  deterministic: [
    ["Schema Normalization", metricMap.schema_normalization_rate.value],
    ["Metadata Completeness", metricMap.metadata_completeness_rate.value],
    ["DOI Format Validity", metricMap.doi_format_validity_rate.value],
    ["DOI Exact Match Rate", metricMap.doi_exact_match_rate.value],
    ["Paper Existence Rate", metricMap.paper_existence_rate.value],
    ["Top Journal Precision", metricMap.top_journal_precision.value]
  ],
  retrieval: [
    ["Precision@5", metricMap.precision_at_5.value],
    ["NDCG@5", metricMap.ndcg_at_5.value],
    ["Recall@20", metricMap.recall_at_20.value],
    ["Gold Hit Rate", metricMap.gold_hit_rate.value],
    ["MRR", metricMap.mrr.value]
  ],
  controlledComparison: [
    ["Precision@5", "0.1333", "0.6667", "0.1333"],
    ["NDCG@5", "0.3579", "0.9949", "0.3579"],
    ["DOI Accuracy", "1.0000", "1.0000", "1.0000"],
    ["Top Journal Precision", "1.0000", "0.9333", "1.0000"]
  ],
  controlledComparisonSource: controlledComparison.summaryOutput,
  semantic: {
    totalInputRows: layer5Representativeness.total_input_rows,
    successfulRows: layer5Representativeness.successful_rows,
    failedRows: layer5Representativeness.failed_or_unevaluated_rows,
    coverageRate: layer5Representativeness.semantic_coverage_rate,
    proposedAgentSuccessfulRows: layer5Representativeness.proposed_agent_successful_rows,
    proposedAgentScore: metricMap.llm_judge_relevance_score.value,
    proxyRows: layer5Proxy.row_count,
    proxyReplacement: layer5Proxy.semantic_evaluation_replacement,
    proxyMetrics: layer5Proxy.metrics
  },
  robustness: [
    ["Hallucination Rate", metricMap.hallucination_rate.value, "Artifact-derived risk proxy"],
    ["Timeout Rate", metricMap.timeout_rate.value, "Recorded jobs"],
    ["Latency per task", `${metricMap.latency_per_task.value}s`, "Recorded jobs with timestamps"]
  ],
  artifacts: [
    ["Promotion Gate Summary", "Presentation readiness and explicit claim boundaries", "PASS WITH CLAIM BOUNDARIES", "benchmark/validation/v3/promotion_gate_summary_v3.json"],
    ["Baseline Support Matrix", "T001-T003 common-support boundary and T004-T020 artifact-level scope", "PARTIAL COMMON-SUPPORT", "benchmark/validation/v3/baseline_support_matrix_v3.json"],
    ["Layer 5A Representativeness", "Quota-limited evaluated subset audit", "22 / 125 rows", "benchmark/validation/v3/layer5_representativeness_v3.json"],
    ["Layer 5B Deterministic Proxy", "Supplementary semantic proxy metrics", "125 rows", "benchmark/validation/v3/layer5_deterministic_semantic_proxy_v3.json"],
    ["Benchmark Result JSON", "Unified generated metrics from available artifacts", "30 metrics", "benchmark/validation/v3/benchmark_v3_deterministic_metrics_summary.json"],
    ["Validation Report", "Deterministic validation interpretation", "GENERATED REPORT", "docs/benchmark-v3-deterministic-validation-report.md"],
    ["QA Report", "Gold and benchmark audit evidence", "AUDIT TRAIL", "benchmark/gold_audit_report.md"]
  ].map(([name, purpose, status, path]) => ({ name, purpose, status, path, href: repositoryArtifactBase + path })),
  demoSteps: [
    "Open dashboard and show PASS WITH CLAIM BOUNDARIES",
    "Show Benchmark v3 structure: 20 tasks / 6 layers / 30 metrics",
    "Show deterministic and retrieval results",
    "Show Baseline Support Matrix and explain T001-T003 limitation",
    "Show Layer 5 semantic boundary and robustness risks"
  ]
} as const;
