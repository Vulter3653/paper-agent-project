# Benchmark v3 Deterministic Validation Report

## 1. Scope
- T001-T020
- Existing artifacts only
- Layer 1-3 computed
- Layer 4-6 not computed

## 2. Safety Boundary
- No benchmark execution
- No D1 command
- No artifact rewrite
- No LLM judge execution
- No dashboard/paper/presentation edit

## 3. Generated Outputs
- `normalized_results_t001_t020.csv`: 342 normalized result rows from baseline and agent runs.
- `layer1_foundation_metrics.csv`: Foundation and reproducibility gates (Manifest, Parity, Boundary).
- `layer2_schema_metrics.csv`: Schema and metadata readiness (Normalization, Completeness, DOI format).
- `layer3_validity_metrics.csv`: Deterministic validity (DOI match, Existence, Journal pool).
- `layer4_retrieval_metrics_by_task.csv`: Quantitative retrieval performance per task.
- `layer4_retrieval_metrics_by_method.csv`: Aggregated retrieval performance per method.
- `layer6_robustness_metrics.csv`: System stability and risk indicators.
- `benchmark_v3_deterministic_metrics_summary.json`: Unified summary of Layers 1-4 and 6.
- `reproducibility_manifest_t001_t020.json`: Complete manifest for the validation run.

## 4. Claim Boundary
Layer 1-4 and Layer 6 metrics are computed from existing artifacts. This does not constitute full T001-T020 benchmark validation because Layer 5 Semantic Quality remains uncomputed and baseline parity remains partial.

T001-T003 remain the only tasks with "controlled_validation" state. T004-T020 are correctly labeled as "artifact_only" to prevent overclaiming.

## 5. Verification Results
- **Reproducibility Manifest**: PASS
- **Baseline Parity**: PARTIAL (Artifacts for T004-T020 exist for Proposed Agent, but not for all baselines yet)
- **Claim Boundary Compliance**: PASS
- **Schema Normalization**: PASS (1.0000)
- **Metadata Completeness**: 0.9854 (Some baseline rows missing fields)
- **DOI Format Validity**: 0.9678
- **DOI Exact Match Rate**: 0.6930 (Artifact-only rows pending fresh verification)
- **Top Journal Precision**: 0.8129

## 6. Layer 4 Retrieval Accuracy Metrics

- Computed from existing normalized rows.
- Metrics: Precision @5, NDCG @5, Recall @20, Gold Hit Rate, MRR.
- No benchmark rerun was performed.
- No LLM judge was executed.
- Comparative claims are limited if baseline parity remains PARTIAL.
- **Proposed Agent Mean P@5**: 0.1333 (for T001-T003)
- **Proposed Agent Mean NDCG@5**: 0.3579 (for T001-T003)

## 7. Layer 6 Robustness & Risk Metrics

- Computed from existing artifacts and logs.
- Metrics: Negative Distractor False Positive Rate, Hallucination Rate, Timeout Rate, Latency per Task, Cost Proxy.
- No benchmark rerun was performed.
- No LLM judge was executed.
- Some metrics may be artifact-derived proxies where fresh external verification or usage telemetry is unavailable.
- **Artifact-derived Hallucination Risk**: 0.3070 (Rows lacking verified status or gold DOI match).
- **Timeout Rate**: 0.1111 (Based on recorded job artifacts).
- **Latency per Task**: ~204.60s (Average for successfully recorded jobs).

(gemini)
