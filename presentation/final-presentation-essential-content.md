# Paper Agent Final Presentation Essential Content

## 0. Usage Note

- This MD is the authoritative content source for the final presentation.
- PPTX, Canva, and other visual decks should be generated or redesigned from this MD.
- Use [`final-presentation-outline.md`](final-presentation-outline.md) as the official 8-minute speaker-notes source.
- The content preserves the verified claim boundaries.
- This is not a full benchmark validation claim.

## 1. One-Sentence Project Definition

Paper Agent is a traceable multi-agent / tool-use system for verified scholarly paper discovery.

## 2. Core Problem

1. Single LLM paper recommendation is black-box.
2. It can hallucinate DOI, title, author, or metadata.
3. It may ignore journal-policy constraints.
4. It provides weak traceability and weak reproducibility.
5. Scholarly discovery needs verifiable evidence, not only plausible recommendations.

## 3. System Architecture: 12-Step Pipeline

| Stage | Agent | Purpose | Main evidence or output | Tool or infrastructure |
| ---: | --- | --- | --- | --- |
| 1 | Planner | Normalize the research question and runtime constraints. | Search scope and sub-questions. | Request payload and trace. |
| 2 | Journal Selector | Select the applicable internal journal pool. | Field and tier-priority policy. | Internal business-school allowlist. |
| 3 | Search / Retriever | Retrieve candidate scholarly records. | Candidate metadata and provider trace. | Configured scholarly search backend. |
| 4 | Journal Filtering | Apply the selected venue policy. | Included and excluded candidates with reasons. | Internal allowlist. |
| 5 | Verifier | Check DOI and bibliographic metadata. | Verification status and mismatch reasons. | Crossref API. |
| 6 | Open Access | Inspect open-access availability. | OA status, PDF URL, landing-page URL, and license where available. | Unpaywall API. |
| 7 | Storage | Persist runtime evidence and artifacts. | Job, paper, trace, and output-storage records. | Cloudflare D1, R2, optional Google Drive. |
| 8 | Evaluation Prep | Normalize records for scoring and later audit. | Scoring-ready inputs with missing values visible. | Worker pipeline and trace records. |
| 9 | Relevance | Estimate topical relevance. | Relevance components and reason. | Metadata scoring and optional semantic path. |
| 10 | Ranking | Order candidates using documented components. | Ranked list and score-component trace. | Deterministic ranking logic. |
| 11 | Critic | Flag metadata and recommendation risks. | Critic flags and review summaries. | Rule-based default and optional LLM path. |
| 12 | Report / Delivery | Generate inspectable outputs. | Markdown, PDF, CSV, XLSX, and dashboard links. | Report generator, R2, and dashboard. |

## 4. Tools and Infrastructure

- **Crossref API**: DOI / metadata verification.
- **Unpaywall API**: Open Access status.
- **Cloudflare Workers**: execution.
- **Cloudflare D1**: trace / benchmark evidence.
- **R2 / optional Google Drive**: artifact storage.
- **Internal business-school approved journal allowlist**: explicit journal-policy filter.
- **GitHub repository**: code, prompts, documentation, and reproducibility evidence.

## 5. Benchmark Design

### 5.1 Controlled Benchmark Layer

Scope:

- T001-T003 only.

Metrics:

- Precision@5.
- NDCG@5.
- DOI Accuracy.
- Top Journal Precision.
- Hallucination Rate.

Systems compared:

- Rule-Based.
- Single LLM.
- Paper Agent.

### 5.2 Expanded Artifact Evidence Layer

Scope:

- T004-T006.
- T007-T012.

Important:

- This is not controlled benchmark validation.
- This is artifact / execution evidence.

## 6. T001-T003 Controlled Benchmark Results

| Metric                | Rule-Based |        Single LLM | Paper Agent |
| --------------------- | ---------: | ----------------: | ----------: |
| Precision@5           |     0.1333 |            0.6667 |      0.1333 |
| NDCG@5                |     0.3579 |            0.9949 |      0.3579 |
| DOI Accuracy          |     1.0000 |            1.0000 |      1.0000 |
| Top Journal Precision |     1.0000 |            0.9333 |      1.0000 |
| Hallucination Rate    |        0.0 | high / risk noted |         0.0 |

Interpretation:

- Single LLM has higher Precision@5 and NDCG@5.
- Paper Agent is not claimed to globally outperform Single LLM.
- Paper Agent's strength is evidence quality: traceability, DOI integrity, hallucination control, and journal-policy compliance.

## 7. Single LLM Trap

- Single LLM appears strong on relevance ranking.
- It achieved higher Precision@5 and NDCG@5 in T001-T003.
- But pure relevance ranking is not enough for scholarly discovery.
- Risks:
  - weak traceability;
  - weaker journal-policy control;
  - possible hallucination risk;
  - weaker reproducibility;
  - weaker audit trail.

Single LLM is a useful comparison method. The risk is over-interpreting overlap metrics as the full definition of scholarly-discovery quality.

## 8. Paper Agent's Composite Evidence-Quality Strength

Paper Agent should be evaluated as a traceable scholarly discovery system, not as a relevance-only recommender.

Composite dimensions:

1. Relevance quality.
2. DOI / metadata integrity.
3. Journal-policy compliance.
4. Hallucination control.
5. Trace completeness.
6. Evidence availability.
7. Failure transparency.
8. Claim boundary compliance.

Paper Agent does not dominate pure ranking metrics, but it provides stronger evidence-quality performance for verified scholarly discovery.

## 9. T004-T006 Artifact Evidence

- Phase 3J.
- T004-T006 artifact-only dry-run executed.
- 3 job rows.
- 50 result rows.
- No failed jobs.
- Not benchmark validation.

This is artifact evidence, not controlled benchmark validation.

## 10. T007-T012 Partial Expansion Evidence

- Phase 3L.
- Staged T007-T020 expansion attempted.
- Only Batch 1 T007-T012 executed.
- T007 timed out after approximately 250 seconds and 21 polling attempts.
- T008-T012 produced 87 result rows.
- T013-T018 not started.
- T019-T020 not started.
- Full T004-T020 validation remains incomplete.

This is partial staged artifact-expansion evidence, not full benchmark validation.

## 11. Evidence Boundary Summary

| Scope     | Evidence Level       | What Can Be Claimed                                 | What Cannot Be Claimed |
| --------- | -------------------- | --------------------------------------------------- | ---------------------- |
| T001-T003 | Controlled benchmark | Quantitative comparison                             | Global superiority     |
| T004-T006 | Artifact evidence    | Executed dry-run, 3 jobs, 50 rows                   | Benchmark validated    |
| T007-T012 | Partial expansion    | T008-T012 generated 87 rows, T007 timeout preserved | Full validation        |
| T013-T020 | Not started          | Not executed after timeout                          | Completed validation   |

## 12. Dashboard / Demo Flow

- Dashboard should first show Executive Summary.
- Then show Controlled Benchmark.
- Then show Expanded Artifact Evidence.
- Then show Technical Trace only if needed.
- Demo must distinguish:
  - **VERIFIED BENCHMARK**;
  - **ARTIFACT EVIDENCE**;
  - **PARTIAL EXPANSION**;
  - **INFRA LIMIT**;
  - **NOT STARTED**;
  - **TECHNICAL TRACE**.

## 13. Limitations and Ethics

- T001-T003 is small.
- T004-T020 full validation is incomplete.
- D1 batch-aware persistence is not implemented.
- T007 timeout shows an infrastructure boundary.
- User feedback logs, if added later, must be anonymized and human-audited before becoming gold labels.
- The internal journal allowlist can introduce algorithmic gatekeeping.
- The system must not overclaim performance.

## 14. Final Claim

Paper Agent does not globally outperform a single-LLM baseline on pure relevance-ranking metrics. Instead, it demonstrates stronger evidence-quality performance for scholarly paper discovery by combining DOI verification, journal-policy compliance, hallucination control, traceability, and transparent failure reporting.

## 15. Forbidden Wording

The following phrases may appear only as forbidden examples, never as project claims:

- T004-T006 benchmark validated.
- T007-T020 validation completed.
- T004-T020 benchmark completed.
- Full 20-task validation complete.
- Proposed Agent globally outperforms baseline.
- 18/20 success.
- 90% success.
- 90% validated.
- D1 batch-aware persistence completed.
- System superiority perfectly proven.
- 완벽히 증명.
- 제안 시스템이 전반적으로 우수함이 입증됨.

## 16. Final Slide Checklist

- [ ] Project definition included.
- [ ] Core problem included.
- [ ] 12-step pipeline included.
- [ ] Tools and infrastructure included.
- [ ] T001-T003 controlled benchmark table included.
- [ ] Single LLM advantage acknowledged.
- [ ] Paper Agent composite evidence-quality claim included.
- [ ] T004-T006 artifact evidence included.
- [ ] T007-T012 partial expansion included.
- [ ] T013-T020 not started included.
- [ ] D1 batch-aware persistence not implemented included.
- [ ] No forbidden overclaim included.
