# Final Submission Story

Updated: 2026-06-01 (codex)

## One-Sentence Claim

Paper Agent is a traceable multi-agent and tool-use system for scholarly discovery, supported by Benchmark v3, a reproducible six-layer and 30-metric automated evaluation framework with explicit claim boundaries.

## Problem

Business-school literature review requires more than plausible recommendations. Researchers need relevant papers, verifiable DOI metadata, visible journal-policy decisions, reproducible traces, and clear failure evidence. A single opaque model request can make these requirements difficult to audit.

## Architecture

Paper Agent uses a 12-stage workflow: Planner, Journal Selector, Search / Retriever, Journal Filtering, Verifier, Open Access, Storage, Evaluation Prep, Relevance, Ranking, Critic, and Report / Delivery. External tools include the configured scholarly search backend, Crossref, Unpaywall, Cloudflare Workers, D1 traces, storage artifacts, and dashboard reporting.

## Benchmark v3

Benchmark v3 evaluates the workflow through six layers and 30 metrics:

1. Foundation & Reproducibility
2. Schema & Metadata
3. Deterministic Validity
4. Retrieval Accuracy
5. Semantic Quality
6. Robustness & Risk

Current readiness is **PASS WITH CLAIM BOUNDARIES**. Layers 1--4 and Layer 6 are computed. Layer 5A is a quota-limited partial implementation audit with 22/125 successful rows (17.6%). Its successful subset contains no Proposed Agent rows, so the Proposed Agent Layer 5 score is `not_available_in_subset`. Layer 5B provides deterministic semantic proxies for 125 rows and is supplementary only.

## Evidence Boundary

- T001--T003: partial common-support comparison.
- T004--T020: artifact-level validation unless baseline parity is proven.
- T007: `proposed_agent_missing`.
- Single LLM has higher Precision@5 and NDCG@5 in the controlled T001--T003 comparison.
- The current evidence does not support full T001--T020 comparative superiority claims.
- The current evidence does not support full semantic-quality validation claims.
- D1 batch-aware persistence is not implemented end-to-end.

## Professor Evaluation Mapping

| Criterion | Evidence |
| --- | --- |
| Problem definition | Traceability, metadata-integrity, and reproducibility gap in scholarly discovery. |
| Agent design justification | Inspectable 12-stage decomposition with tool-based verification and visible failures. |
| Baseline comparison | T001--T003 common-support comparison only. |
| Benchmark quality | Benchmark v3 six-layer, 30-metric automated framework and generated supplements. |
| Limitations and ethics | Partial baseline parity, Layer 5A quota limit, hallucination and timeout risk, journal-policy gatekeeping. |
| Reproducibility | Tracked scripts, normalized artifacts, support matrix, semantic-audit reports, and claim checklist. |
| Live demo | Research, Ops, and Evaluation dashboards with report artifacts and fallback job path. |

## Final Narrative

The project does not claim universal ranking superiority. Its defensible contribution is a reproducible automated benchmark framework and a traceable literature-discovery workflow that exposes evidence quality, incomplete coverage, and operational risk.
