# Benchmark v3 Deterministic Validation Report

## 1. Scope
- T001-T020
- Existing artifacts only
- Layer 1-4 and 6 computed
- Layer 5: Quota-limited partial audit (Implementation Audit)

## 2. Readiness Status: PASS WITH CLAIM BOUNDARIES
Benchmark v3 is ready for presentation as a reproducible automated benchmark framework with clear claim boundaries. Layers 1–4 and Layer 6 are computed, while Layer 5 is reported as a quota-limited partial semantic audit (22/125 rows evaluated). The benchmark supports artifact-level validation and controlled retrieval evaluation, but not full semantic-quality validation or full T001–T020 comparative superiority claims.

## 3. Safety Boundary
- No benchmark execution
- No D1 command
- No artifact rewrite (appends only to logs)
- Fixed LLM judge execution (Quota-bounded)
- No score fabrication

## 4. Generated Outputs
- `normalized_results_t001_t020.csv`: 342 normalized result rows from baseline and agent runs.
- `layer1_foundation_metrics.csv`: Foundation and reproducibility gates (Manifest, Parity, Boundary).
- `layer2_schema_metrics.csv`: Schema and metadata readiness (Normalization, Completeness, DOI format).
- `layer3_validity_metrics.csv`: Deterministic validity (DOI match, Existence, Journal pool).
- `layer4_retrieval_metrics_by_task.csv`: Quantitative retrieval performance per task.
- `layer4_retrieval_metrics_by_method.csv`: Aggregated retrieval performance per method.
- `layer6_robustness_metrics.csv`: System stability and risk indicators.
- `layer5_semantic_metrics_summary.json`: Partial semantic audit results.
- `benchmark_v3_deterministic_metrics_summary.json`: Unified summary of Layers 1-4, 6, and partial 5.
- `promotion_gate_summary_v3.json`: Formal promotion gate metadata.
- `reproducibility_manifest_t001_t020.json`: Complete manifest for the validation run.

## 5. Claim Boundary
Layer 1-4 and Layer 6 metrics are computed from existing artifacts. Layer 5 is a quota-limited partial semantic audit (22/125 rows evaluated). Full semantic coverage claim is disabled. This does not constitute full T001-T020 benchmark validation because Layer 5 remains partial and baseline parity remains partial.

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
- No LLM judge was executed for Layer 4 quantitative matching.
- Comparative claims are limited if baseline parity remains PARTIAL.
- **Proposed Agent Mean P@5**: 0.1333 (for T001-T003)
- **Proposed Agent Mean NDCG@5**: 0.3579 (for T001-T003)

## 7. Layer 6 Robustness & Risk Metrics

- Computed from existing artifacts and logs.
- Metrics: Negative Distractor False Positive Rate, Hallucination Rate, Timeout Rate, Latency per Task, Cost Proxy.
- No benchmark rerun was performed.
- Some metrics may be artifact-derived proxies where fresh external verification or usage telemetry is unavailable.
- **Artifact-derived Hallucination Risk**: 0.3070 (Rows lacking verified status or gold DOI match).
- **Timeout Rate**: 0.1111 (Based on recorded job artifacts).
- **Latency per Task**: ~204.60s (Average for successfully recorded jobs).

## 8. Layer 5 Semantic Quality Metrics

- Uses fixed LLM-as-a-judge scoring.
- Evaluation scope: top-5 rows per method-task pair.
- **Status**: quota_limited_partial (Implementation Audit)
- **Semantic Coverage Rate**: 0.1760 (22/125 rows)
- **Reason**: Gemini free-tier quota exceeded; audit depth capped for time-bounded delivery.
- **Successful Subset Method Distribution**: Rule-based: 15, Single-LLM: 7, Proposed Agent: 0.
- **Note**: No representative semantic quality estimate is available for the Proposed Agent. Layer 5 results are for implementation audit of the evaluation subset only.

(gemini)
