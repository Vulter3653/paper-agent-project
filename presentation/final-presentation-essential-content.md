# Paper Agent Final Presentation Essential Content

## 0. Usage Note

This Markdown file is the authoritative, claim-bounded source for the final deck, Canva redesign, oral script, and defense checklist. Visual materials should preserve these evidence boundaries. The current benchmark state is **PASS WITH CLAIM BOUNDARIES**; it is not a claim of full comparative superiority or full semantic-quality validation.

## 1. One-Sentence Project Definition

Paper Agent is a traceable multi-agent and tool-use system for verified scholarly paper discovery and reproducible evaluation.

## 2. Core Problem

1. Single-request paper recommendation can be difficult to audit.
2. DOI, title, author, and metadata can be wrong or unverifiable.
3. Journal-policy constraints can be inconsistently applied.
4. Scholarly discovery needs reproducible traces and visible failures.
5. Evaluation must separate supported comparison from incomplete evidence.

## 3. System Architecture: 12-Step Pipeline

| Step | Stage | Purpose | Main evidence or tool |
| ---: | --- | --- | --- |
| 1 | Planner | structure the research request | plan trace |
| 2 | Journal Selector | apply approved-journal policy | allowlist trace |
| 3 | Search / Retriever | retrieve candidate papers | configured scholarly backend |
| 4 | Journal Filtering | exclude out-of-policy candidates | filter decisions |
| 5 | Verifier | normalize metadata and DOI fields | Crossref evidence |
| 6 | Open Access | inspect OA availability | Unpaywall evidence |
| 7 | Storage | persist artifacts and traces | storage / D1 trace |
| 8 | Evaluation Prep | generate reproducible inputs | benchmark rows |
| 9 | Relevance | assess query-candidate fit | relevance evidence |
| 10 | Ranking | produce ordered recommendations | ranked output |
| 11 | Critic | review evidence and failures | critic trace |
| 12 | Report / Delivery | expose results and limits | dashboard / report |

## 4. Tools and Infrastructure

- Crossref API: DOI and metadata verification.
- Unpaywall API: open-access status.
- Cloudflare Workers: workflow execution.
- Cloudflare D1: trace and benchmark evidence.
- R2 / optional Google Drive: artifact storage.
- Internal business-school journal allowlist: explicit policy filter.
- GitHub repository: scripts, artifacts, prompts, and documentation.

## 5. Benchmark v3 Design

Benchmark v3 is an automated framework with six layers and 30 metrics.

| Layer | Name | Current state |
| ---: | --- | --- |
| 1 | Foundation & Reproducibility | computed |
| 2 | Schema & Metadata | computed |
| 3 | Deterministic Validity | computed |
| 4 | Retrieval Accuracy | computed with scope limits |
| 5A | LLM Judge Semantic Audit | quota-limited partial implementation audit |
| 5B | Deterministic Semantic Proxy | supplementary, 125 rows |
| 6 | Robustness & Risk | computed |

## 6. Baseline Support Boundary

- T001--T003: partial common-support comparison.
- T004--T020: artifact-level validation unless baseline parity is proven.
- T007: `proposed_agent_missing`.
- The benchmark does not support full T001--T020 comparative superiority claims.

## 7. T001--T003 Controlled Results

| Metric | Rule-Based | Single LLM | Paper Agent |
| --- | ---: | ---: | ---: |
| Precision@5 | 0.1333 | 0.6667 | 0.1333 |
| NDCG@5 | 0.3579 | 0.9949 | 0.3579 |
| DOI Accuracy | 1.0000 | 1.0000 | 1.0000 |
| Top Journal Precision | 1.0000 | 0.9333 | 1.0000 |
| Hallucination Rate | 0.0 | high / risk noted | 0.0 |

Interpretation: Single LLM has higher Precision@5 and NDCG@5 within this common-support layer. Paper Agent is not claimed to globally outperform Single LLM. Its design emphasizes traceability, DOI integrity, hallucination control, and journal-policy compliance.

## 8. Benchmark v3 Key Metrics

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

## 9. Layer 5 Semantic-Quality Boundary

### Layer 5A: LLM Judge Semantic Audit

- Coverage: 22/125 rows = 17.6%.
- Status: quota-limited partial implementation audit.
- Successful evaluated subset: no Proposed Agent rows.
- Proposed Agent Layer 5 score: `not_available_in_subset`.
- Interpretation: evaluated subset only, not a representative semantic-quality estimate.

### Layer 5B: Deterministic Semantic Proxy

- Generated for 125 rows.
- Uses deterministic artifact-field signals.
- Supplements Layer 5A.
- Does not replace LLM or human semantic evaluation.

## 10. Evidence Boundary Summary

| Scope | Evidence level | Allowed interpretation | Required limit |
| --- | --- | --- | --- |
| T001--T003 | partial common-support comparison | quantitative baseline comparison | do not generalize to every task |
| T004--T020 | artifact-level validation | reproducible artifact inspection | baseline parity not proven |
| T007 | missing Proposed Agent artifact | visible missing-evidence record | do not hide missing evidence |
| Layer 5A | quota-limited subset audit | implementation behavior | not representative semantic coverage |
| Layer 5B | deterministic proxy | supplementary semantic signals | not semantic ground truth |

## 11. Dashboard / Demo Flow

1. Explain Paper Agent and the 12-stage traceable pipeline.
2. Show Benchmark v3: six layers and 30 metrics.
3. Show `PASS WITH CLAIM BOUNDARIES`.
4. Explain T001--T003 common-support comparison and T004--T020 artifact-level validation.
5. Show Layer 5A quota limitation and Layer 5B supplement.
6. Close with remaining risks and next steps.

## 12. Limitations and Ethics

- Baseline parity is partial.
- Layer 5A coverage is 17.6% and contains no successful Proposed Agent rows.
- Layer 5B is supplementary, not a substitute for semantic review.
- Hallucination rate 0.3070 and timeout rate 0.1111 remain material risks.
- Journal filtering can reproduce disciplinary gatekeeping.
- Human scholarly review remains the final authority.

## 13. Final Claim

Paper Agent demonstrates a reproducible automated benchmark framework with explicit claim boundaries. The current evidence supports traceable evaluation infrastructure and visible risk reporting. It does not support full T001--T020 comparative superiority claims or full semantic-quality validation claims.

## 14. Language Guardrail

- Always retain the `PASS WITH CLAIM BOUNDARIES` qualifier.
- Describe Layer 5A as a `quota-limited partial implementation audit`.
- Describe Layer 5B as supplementary.
- Describe baseline comparison as `partial common-support comparison`.
- Describe T004--T020 as `artifact-level validation` unless baseline parity is proven.
- Never convert missing, partial, or proxy evidence into a broad performance claim.

## 15. Final Slide Checklist

- [ ] Project definition included.
- [ ] 12-stage pipeline included.
- [ ] Benchmark v3 six layers and 30 metrics included.
- [ ] T001--T003 common-support boundary included.
- [ ] T004--T020 artifact-level boundary included.
- [ ] T007 `proposed_agent_missing` included.
- [ ] Layer 5A 22/125 and 17.6% included.
- [ ] Layer 5A no-Proposed-Agent-row limit included.
- [ ] Layer 5B supplementary proxy included.
- [ ] Hallucination and timeout risks included.
- [ ] No broad superiority claim included.
