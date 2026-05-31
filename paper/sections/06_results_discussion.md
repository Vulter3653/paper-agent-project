# 6. Results and Discussion

## 6.1 Controlled Comparison

| Metric | Rule-Based | Single LLM | Paper Agent |
| --- | ---: | ---: | ---: |
| Precision@5 | 0.1333 | 0.6667 | 0.1333 |
| NDCG@5 | 0.3579 | 0.9949 | 0.3579 |
| DOI Accuracy | 1.0000 | 1.0000 | 1.0000 |
| Top Journal Precision | 1.0000 | 0.9333 | 1.0000 |
| Hallucination Rate | 0.0 | high / risk noted | 0.0 |

The Single LLM baseline may appear strong under gold-label overlap metrics, but its recommendation process remains less traceable and less constrained by the explicit journal-policy and metadata-verification pipeline. Paper Agent does not outperform the Single LLM baseline on Precision@5 or NDCG@5 in the controlled scope. Its current contribution is a different tradeoff: DOI integrity, journal-policy compliance, traceability, and preserved failure evidence.

The apparent strength of a Single LLM result can become an interpretive trap if overlap metrics are treated as the only objective. This is a risk to examine, not a proven causal explanation. A broader controlled evaluation is required.

## 6.2 T004-T006 Artifact-Only Summary

| Task | Status | Artifact Rows | Notes |
| --- | --- | ---: | --- |
| T004 | completed | 20 | artifact-only evidence |
| T005 | completed | 12 | artifact-only evidence |
| T006 | completed | 18 | artifact-only evidence |

Total: three job rows and 50 result rows.

## 6.3 Phase 3L Partial Expansion Summary

| Task | Status | Artifact Rows | Notes |
| --- | --- | ---: | --- |
| T007 | timeout / failed | 0 | timeout after 250250ms / 21 attempts |
| T008 | completed | 20 | artifact-only evidence |
| T009 | completed | 20 | artifact-only evidence |
| T010 | completed | 20 | artifact-only evidence |
| T011 | completed | 7 | artifact-only evidence |
| T012 | completed | 20 | artifact-only evidence |

Total: six job rows and 87 result rows. Batch 2 T013-T018 and Batch 3 T019-T020 were not started after the T007 timeout. Legacy T019-T020 resource-limit / HTTP 503 evidence remains visible.

## 6.4 Operational Failure Analysis

The T007 timeout is evidence of an infrastructure boundary. The staged process preserved T008-T012 results and stopped later batches. Legacy T019-T020 HTTP 503 records remain visible.

## 6.5 Threats to Validity

The controlled sample is small, gold labels require continued review, API behavior is time-dependent, and the internal allowlist encodes institutional preferences.
