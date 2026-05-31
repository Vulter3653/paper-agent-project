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
- `benchmark_v3_deterministic_metrics_summary.json`: Unified summary of Layers 1-3.
- `reproducibility_manifest_t001_t020.json`: Complete manifest for the validation run.

## 4. Claim Boundary
Layer 1-3 deterministic metrics were computed from existing artifacts. This does not mean full T001-T020 benchmark validation is complete. Layer 4 retrieval accuracy, Layer 5 semantic quality, and Layer 6 robustness/risk must be computed before full v3 validation claims.

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

(gemini)
