# Final Presentation Outline

Updated: 2026-05-31 (codex)

Target duration: 8 minutes plus Q&A.

## Slide 1 - Title

**Paper Agent: A Traceable Multi-Agent System for Verified Scholarly Paper Discovery**

- Academic literature-review support for business-school research.
- Focus: verifiable evidence and traceable decisions.

**Speaker notes (0:00-0:25)**: Introduce Paper Agent as a research-assistance prototype. State that the goal is not autonomous scholarship or a global performance claim. The system helps researchers discover, verify, and inspect candidate papers.

## Slide 2 - Background: Why Scholarly Paper Discovery Needs Verification

- Researchers need relevant papers, correct DOI metadata, venue-policy checks, and reproducible traces.
- Search, verification, access lookup, ranking, and reporting are usually fragmented across tools.

**Speaker notes (0:25-0:55)**: Explain that literature review quality depends on more than finding plausible titles. A researcher must be able to verify metadata and understand why a paper was recommended or excluded.

## Slide 3 - Problem: Black-Box LLM Recommendation Risk

- A single LLM can produce plausible but unverifiable recommendations.
- Risks: DOI hallucination, metadata mismatch, opaque ranking, and journal-policy bypass.
- Human scholarly review remains the final authority.

**Speaker notes (0:55-1:25)**: Frame the problem as a traceability gap. Even a useful LLM answer can be difficult to audit because the retrieval source, filtering rule, and verification evidence may be unclear.

## Slide 4 - Paper Agent Overview

- A traceable multi-agent and tool-using discovery pipeline.
- Separates retrieval, filtering, metadata verification, ranking, critic review, and delivery.
- Preserves intermediate evidence and failure states.

**Speaker notes (1:25-1:55)**: Emphasize that Paper Agent treats evidence artifacts as the result, not only the final ranked list. This makes inclusion and exclusion decisions inspectable.

## Slide 5 - System Architecture: 12-Step Pipeline

Planner -> Journal Selector -> Search / Retriever -> Journal Filtering -> Verifier -> Open Access -> Storage -> Evaluation Prep -> Relevance -> Ranking -> Critic -> Report / Delivery

- Tool use: configured scholarly backend, Crossref, Unpaywall, D1, R2, and dashboard surfaces.
- Stage-level traces isolate failures.

**Speaker notes (1:55-2:35)**: Walk through the pipeline at a high level. Mention that decomposition is justified by distinct responsibilities: policy filtering, DOI verification, OA inspection, scoring, and reporting should remain separately observable.

## Slide 6 - Benchmark Design and Gold Label QA

- Paper-Agent-Bench uses business-research tasks and DOI-backed gold labels.
- Methods: Rule-Based baseline, Single LLM baseline, and Paper Agent.
- Metrics: Precision@5, NDCG@5, DOI Accuracy, Top Journal Precision, and Hallucination Rate.

**Speaker notes (2:35-3:05)**: Describe the benchmark as a domain-specific evaluation protocol. Explain that gold labels and metadata QA matter because incorrect labels can reward the wrong behavior.

## Slide 7 - Controlled Benchmark Scope: T001-T003 Only

- Verified controlled comparison scope: T001-T003.
- Comparison rows: 9.
- Quantitative comparison claims are limited to this controlled layer.

**Speaker notes (3:05-3:25)**: State the scope boundary directly. Later execution artifacts are useful engineering evidence but are not merged into the controlled comparison.

## Slide 8 - T001-T003 Three-Way Results

| Metric | Rule-Based | Single LLM | Paper Agent |
| --- | ---: | ---: | ---: |
| Precision@5 | 0.1333 | 0.6667 | 0.1333 |
| NDCG@5 | 0.3579 | 0.9949 | 0.3579 |
| DOI Accuracy | 1.0000 | 1.0000 | 1.0000 |
| Top Journal Precision | 1.0000 | 0.9333 | 1.0000 |
| Hallucination Rate | 0.0 | risk noted | 0.0 |

**Speaker notes (3:25-3:55)**: Read the result conservatively. Single LLM is higher on overlap-oriented metrics. Paper Agent preserves DOI accuracy and strict top-journal precision in this narrow controlled scope.

## Slide 9 - Single LLM Trap

- Higher Precision@5 and NDCG@5 do not expose the recommendation process.
- Single LLM output remains less constrained by explicit journal-policy and metadata-verification stages.
- This is an interpretive risk, not proof of a causal mechanism.

**Speaker notes (3:55-4:20)**: Explain why the comparison is multi-dimensional. Do not claim Paper Agent wins globally. The contribution is a more traceable decision process with explicit controls.

## Slide 10 - Paper Agent Verified Strengths

- Traceable stage outputs and stored failure evidence.
- DOI and metadata verification through Crossref.
- Internal journal allowlist enforcement.
- Separate OA status through Unpaywall.
- Report and dashboard surfaces linked to inspectable traces.

**Speaker notes (4:20-4:50)**: Summarize strengths demonstrated by implementation and controlled evidence. Clarify that DOI integrity and policy compliance do not automatically prove substantive paper quality.

## Slide 11 - Evidence Boundary: Benchmark vs Artifact Evidence

- **Controlled benchmark evidence**: audited T001-T003 quantitative comparison.
- **Artifact evidence**: isolated execution CSVs; useful for coverage and failure inspection.
- **Partial evidence**: incomplete staged attempts with preserved failures.
- Full T004-T020 validation remains incomplete.

**Speaker notes (4:50-5:20)**: Explain why polished dashboard output must not be mistaken for completed validation. The project separates controlled metrics, artifacts, and incomplete runs explicitly.

## Slide 12 - Phase 3J / Phase 3L Artifact Evidence

### Phase 3J
- T004-T006 artifact-only dry-run executed through a gated wrapper.
- 3 jobs and 50 result rows.
- This is artifact evidence, not benchmark validation.

### Phase 3L
- Partial staged expansion evidence. Only Batch 1 T007-T012 executed.
- T007 timed out after approximately 250 seconds and 21 polling attempts.
- T008-T012 produced 87 rows.
- T013-T018 not started. T019-T020 not started.
- This is not full benchmark validation.

**Speaker notes (5:20-6:00)**: Show the staged safety boundary. Explain that the process stopped later batches after the Batch 1 timeout. Preserving failure evidence is part of the system design.

## Slide 13 - Limitations and Ethics

- Full T004-T020 validation remains incomplete.
- D1 batch-aware persistence is not implemented.
- Gold-label coverage remains limited.
- The internal journal allowlist can introduce algorithmic gatekeeping.
- Automated ranking can amplify citation and journal-hierarchy bias.

**Speaker notes (6:00-6:40)**: Discuss limits directly. Human scholarly review remains necessary. Explain that journal filtering is an explicit project policy, not a universal definition of academic quality.

## Slide 14 - Final Demo / Next Steps

Demo flow:
1. Research Dashboard: submit or load a search job.
2. Ops Dashboard: inspect stage traces and tool evidence.
3. Evaluation Dashboard: show controlled T001-T003 comparison and artifact boundaries.
4. Report output: show downloadable summary artifacts.

Next steps:
- diagnose T007 timeout;
- complete separately approved staged expansion;
- implement D1 batch-aware persistence;
- expand DOI-backed gold labels.

**Speaker notes (6:40-8:00)**: Use the last section for a concise live demonstration. End by restating the claim boundary: Paper Agent is a traceable deployed prototype with controlled T001-T003 evidence and partial artifact expansion, not a completed 20-task validation.
