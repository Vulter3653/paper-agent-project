# Results and Discussion

Benchmark v3 reports **PASS WITH CLAIM BOUNDARIES**. Layers 1--4 and Layer 6 are computed. Layer 5A remains quota-limited and partial.

| Metric | Value | Interpretation boundary |
| --- | ---: | --- |
| Schema Normalization | 1.0000 | deterministic metadata layer |
| Metadata Completeness | 0.9854 | deterministic metadata layer |
| DOI Format Validity | 0.9678 | deterministic validity layer |
| DOI Exact Match Rate | 0.6930 | artifact evidence |
| Paper Existence Rate | 0.6930 | artifact evidence |
| Top Journal Precision | 0.8129 | journal-policy evidence |
| Proposed Agent Precision@5 | 0.1333 | T001--T003 common-support only |
| Proposed Agent NDCG@5 | 0.3579 | T001--T003 common-support only |
| Proposed Agent Recall@20 | 0.5000 | T001--T003 common-support only |
| Hallucination Rate | 0.3070 | material risk remains |
| Timeout Rate | 0.1111 | material operational risk remains |
| Latency per Task | 204.60 s | operational observation |

The result should not be read as full T001--T020 comparative superiority. Baseline comparison is limited to the T001--T003 common-support subset. T004--T020 are artifact-level validation tasks, and T007 is marked `proposed_agent_missing`.

Layer 5A evaluated 22 of 125 rows (17.6%). The successful evaluated subset contains no Proposed Agent rows, so a Proposed Agent semantic-quality score is unavailable in that subset. Layer 5B covers 125 rows with deterministic semantic proxies, but these signals supplement rather than replace LLM or human judgment.
