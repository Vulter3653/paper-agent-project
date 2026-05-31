# Paper Agent Benchmark v3 Enhanced Report

Updated: 2026-06-01

## Executive Summary

Paper Agent is an AI Agent-based literature discovery and evaluation system. Benchmark v3 provides a reproducible automated evaluation framework with six layers and 30 metrics. The current promotion-gate result is **PASS WITH CLAIM BOUNDARIES**.

The defensible claim is limited: the repository provides automated benchmark infrastructure and explicit evidence boundaries. It does not support full T001--T020 comparative superiority claims or full semantic-quality validation claims.

## Benchmark Layer Status

| Layer | Description | Status |
| --- | --- | --- |
| 1 | Foundation & Reproducibility | computed |
| 2 | Schema & Metadata | computed |
| 3 | Deterministic Validity | computed |
| 4 | Retrieval Accuracy | computed with common-support limits |
| 5A | LLM Judge Semantic Audit | quota-limited partial implementation audit |
| 5B | Deterministic Semantic Proxy | supplementary, 125 rows |
| 6 | Robustness & Risk | computed |

## Comparison Boundary

- T001--T003: partial common-support comparison.
- T004--T020: artifact-level validation tasks unless baseline parity is proven.
- T007: `proposed_agent_missing`.
- Full T001--T020 comparative superiority is not supported.

## Layer 5 Boundary

Layer 5A evaluated 22 of 125 rows (17.6%). Its successful subset contains no Proposed Agent rows. The Proposed Agent Layer 5 score is `not_available_in_subset`. Layer 5A is an implementation audit, not a representative semantic-quality estimate.

Layer 5B generated deterministic semantic proxies for 125 rows. The proxy is supplementary and does not replace LLM or human semantic evaluation.

## Key Metrics

| Metric | Value |
| --- | ---: |
| Schema Normalization | 1.0000 |
| Metadata Completeness | 0.9854 |
| DOI Format Validity | 0.9678 |
| DOI Exact Match Rate | 0.6930 |
| Paper Existence Rate | 0.6930 |
| Top Journal Precision | 0.8129 |
| Proposed Agent Precision@5, T001--T003 | 0.1333 |
| Proposed Agent NDCG@5, T001--T003 | 0.3579 |
| Proposed Agent Recall@20, T001--T003 | 0.5000 |
| Hallucination Rate | 0.3070 |
| Timeout Rate | 0.1111 |
| Latency per Task | 204.60 s |

## Submission Summary

The final paper and presentation should report **PASS WITH CLAIM BOUNDARIES**, distinguish common-support comparison from artifact-level validation, and retain Layer 5A and Layer 5B limitations.
