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
    ["Layer 1", "기반 및 재현성 (Foundation & Reproducibility)", "Computed"],
    ["Layer 2", "Schema 및 Metadata", "Computed"],
    ["Layer 3", "Deterministic 유효성", "Computed"],
    ["Layer 4", "검색 정확도 (Retrieval Accuracy)", "Computed"],
    ["Layer 5", "의미 품질 (Semantic Quality)", "Partial / Proxy"],
    ["Layer 6", "Robustness & Risk: 운영상 위험", "Computed"]
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
    ["Hallucination Rate", metricMap.hallucination_rate.value, "검증되지 않은 DOI 또는 논문 정보가 포함될 위험"],
    ["Timeout Rate", metricMap.timeout_rate.value, "기록된 실행 작업 기준"],
    ["Latency per task", `${metricMap.latency_per_task.value}s`, "timestamp가 기록된 작업 기준 평균 처리 시간"]
  ],
  artifacts: [
    ["Promotion Gate Summary", "발표 준비 상태와 명시적인 주장 범위", "PASS WITH CLAIM BOUNDARIES", "benchmark/validation/v3/promotion_gate_summary_v3.json"],
    ["Baseline Support Matrix", "T001–T003 공통지원 경계와 T004–T020 산출물 수준 범위", "PARTIAL COMMON-SUPPORT", "benchmark/validation/v3/baseline_support_matrix_v3.json"],
    ["Layer 5A Representativeness", "API quota로 제한된 평가 subset 감사", "22 / 125행", "benchmark/validation/v3/layer5_representativeness_v3.json"],
    ["Layer 5B Deterministic Proxy", "의미 평가를 대체하지 않는 보조 Proxy 지표", "125행", "benchmark/validation/v3/layer5_deterministic_semantic_proxy_v3.json"],
    ["Benchmark Result JSON", "현재 Artifact에서 생성된 통합 지표", "30개 지표", "benchmark/validation/v3/benchmark_v3_deterministic_metrics_summary.json"],
    ["Validation Report", "Deterministic 검증 해석 보고서", "GENERATED REPORT", "docs/benchmark-v3-deterministic-validation-report.md"],
    ["QA Report", "Gold label 및 Benchmark 감사 증거", "AUDIT TRAIL", "benchmark/gold_audit_report.md"]
  ].map(([name, purpose, status, path]) => ({ name, purpose, status, path, href: repositoryArtifactBase + path })),
  demoSteps: [
    "대시보드를 열고 PASS WITH CLAIM BOUNDARIES를 설명",
    "Benchmark v3 구조 설명: 20개 과제 / 6개 Layer / 30개 지표",
    "Deterministic 결과와 검색 성능 결과 확인",
    "Baseline Support Matrix에서 T001–T003 비교 범위 한계 설명",
    "Layer 5 의미 품질 경계와 운영상 위험 지표 설명"
  ]
} as const;
