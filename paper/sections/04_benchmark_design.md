# Benchmark Design

Benchmark v3 evaluates Paper Agent through six layers and 30 metrics. Its status is **PASS WITH CLAIM BOUNDARIES**.

| Layer | Name | Purpose | Current status |
| --- | --- | --- | --- |
| 1 | Foundation & Reproducibility | Ensure traceable inputs, scripts, and generated artifacts | computed |
| 2 | Schema & Metadata | Measure normalized and complete scholarly metadata | computed |
| 3 | Deterministic Validity | Check DOI format, existence evidence, and policy fields | computed |
| 4 | Retrieval Accuracy | Measure common-support ranking and retrieval metrics | computed with scope limits |
| 5 | Semantic Quality | Audit semantic fit with Layer 5A and supplementary Layer 5B | quota-limited partial / supplementary |
| 6 | Robustness & Risk | Surface hallucination, timeout, and operational risk | computed |

## Layer 5A: LLM Judge Semantic Audit

Layer 5A is a quota-limited partial implementation audit. It evaluated 22 of 125 judge-input rows (17.6%). The successful evaluated subset contains no Proposed Agent rows; therefore, the Proposed Agent Layer 5 score is `not_available_in_subset`. Layer 5A is not a representative semantic-quality estimate.

## Layer 5B: Deterministic Semantic Proxy

Layer 5B was generated for 125 rows using existing artifact fields. It supplements the partial LLM-judge audit with deterministic overlap, construct, context, and evidence-field signals. It is not a replacement for LLM or human semantic evaluation.

## Comparison Scope

The Baseline Support Matrix limits comparative interpretation to the T001--T003 common-support subset. T004--T020 remain artifact-level validation tasks unless baseline parity is proven. T007 is marked `proposed_agent_missing`.
