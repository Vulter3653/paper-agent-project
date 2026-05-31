# Paper Agent Final Presentation Outline

Format: 14 slides / 8 minutes, followed by a 2--3 minute live demo.

## Slide 1. Title

**Paper Agent: A Traceable Multi-Agent System for Verified Scholarly Paper Discovery**

- AI Agent-based literature discovery and evaluation system.
- Team project final presentation.

**Speaker notes (0:20):** Paper Agent treats literature discovery as an evidence workflow, not only a ranking task.

## Slide 2. Why Scholarly Discovery Needs Verification

- Researchers need relevant papers, reliable DOI metadata, journal-policy compliance, and reproducible traces.
- Plausible recommendations without evidence create citation risk.

**Speaker notes (0:30):** The business-school workflow requires both relevance and verification.

## Slide 3. Limits of a Single Opaque Request

- Metadata may be wrong or unverifiable.
- Journal rules may be inconsistently applied.
- Traceability and reproducibility are weak.
- Failures can be hidden by fluent output.

**Speaker notes (0:30):** A single LLM is useful, but a paper-discovery workflow needs explicit evidence stages.

## Slide 4. Paper Agent Overview

- Traceable multi-agent and tool-use workflow.
- Multi-Agent decomposition, retrieval augmentation, metadata APIs, storage traces, and reporting.
- Goal: inspectable scholarly discovery.

**Speaker notes (0:30):** The system separates responsibilities and retains intermediate evidence.

## Slide 5. 12-Stage Pipeline

1. Planner
2. Journal Selector
3. Search / Retriever
4. Journal Filtering
5. Verifier
6. Open Access
7. Storage
8. Evaluation Prep
9. Relevance
10. Ranking
11. Critic
12. Report / Delivery

**Speaker notes (0:45):** Briefly connect retrieval, Crossref DOI verification, Unpaywall, D1 traces, and the dashboard.

## Slide 6. Benchmark v3: Six Layers, 30 Metrics

| Layer | Focus |
| ---: | --- |
| 1 | Foundation & Reproducibility |
| 2 | Schema & Metadata |
| 3 | Deterministic Validity |
| 4 | Retrieval Accuracy |
| 5 | Semantic Quality: Layer 5A judge + Layer 5B proxy |
| 6 | Robustness & Risk |

**Speaker notes (0:40):** The benchmark is intentionally layered so incomplete evidence remains visible.

## Slide 7. Promotion Gate Result

**PASS WITH CLAIM BOUNDARIES**

- Layers 1--4 computed.
- Layer 6 computed.
- Layer 5A remains quota-limited and partial.
- Layer 5B is supplementary.

**Speaker notes (0:30):** The qualifier is mandatory. It prevents a partial audit from becoming a broad claim.

## Slide 8. Baseline Support Boundary

- T001--T003: partial common-support comparison.
- T004--T020: artifact-level validation unless baseline parity is proven.
- T007: `proposed_agent_missing`.

**Speaker notes (0:35):** The support matrix limits which tasks can be used for comparative interpretation.

## Slide 9. T001--T003 Three-Way Results

| Metric | Rule-Based | Single LLM | Paper Agent |
| --- | ---: | ---: | ---: |
| Precision@5 | 0.1333 | 0.6667 | 0.1333 |
| NDCG@5 | 0.3579 | 0.9949 | 0.3579 |
| DOI Accuracy | 1.0000 | 1.0000 | 1.0000 |
| Top Journal Precision | 1.0000 | 0.9333 | 1.0000 |

**Speaker notes (0:45):** Single LLM has higher overlap-based ranking metrics in the common-support subset. We do not claim global outperform.

## Slide 10. Benchmark v3 Key Results

- Schema Normalization: 1.0000
- Metadata Completeness: 0.9854
- DOI Format Validity: 0.9678
- DOI Exact Match Rate: 0.6930
- Top Journal Precision: 0.8129
- Proposed Agent Recall@20, T001--T003: 0.5000

**Speaker notes (0:35):** These metrics show where the pipeline is reliable and where improvement is still required.

## Slide 11. Layer 5A: Quota-Limited Partial Audit

- 22/125 successful rows = 17.6%.
- No Proposed Agent rows in the successful evaluated subset.
- Proposed Agent Layer 5 score: `not_available_in_subset`.
- This is an implementation audit, not a representative semantic-quality estimate.

**Speaker notes (0:40):** We disclose the quota limit directly instead of extrapolating from an incomplete subset.

## Slide 12. Layer 5B and Risk Signals

- Deterministic semantic proxy generated for 125 rows.
- Supplementary only; not a replacement for LLM or human semantic evaluation.
- Hallucination rate: 0.3070.
- Timeout rate: 0.1111.
- Latency per task: 204.60 seconds.

**Speaker notes (0:40):** Proxy signals expand observability but do not close the semantic-evaluation gap.

## Slide 13. Limitations and Ethics

- Baseline parity is partial.
- Semantic judge coverage is incomplete.
- Missing evidence remains visible.
- Journal filtering can reinforce disciplinary gatekeeping.
- Human scholarly review remains the final authority.

**Speaker notes (0:35):** Trustworthy research assistance requires visible limits and human accountability.

## Slide 14. Demo and Next Steps

**Demo path**
1. Pipeline overview.
2. Benchmark v3 readiness qualifier.
3. Baseline support matrix.
4. Layer 5A and Layer 5B boundaries.
5. Technical trace if asked.

**Next steps**
- Expand baseline parity.
- Obtain full approved judge coverage or human evaluation.
- Improve timeout and hallucination handling.

**Speaker notes (0:35):** Close with the defensible claim: reproducible automated benchmark infrastructure with explicit claim boundaries.
